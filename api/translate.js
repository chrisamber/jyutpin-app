import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

const MODEL = "claude-haiku-4-5-20251001";
const CACHE_VERSION = "v1";
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

const DIALECT_NAMES = {
  yue: "Cantonese",
  cmn: "Mandarin",
  nan: "Hokkien / Taiwanese",
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

function sha1(input) {
  return crypto.createHash("sha1").update(input).digest("hex");
}

function cacheKey(line, dialectCode) {
  return `translate:${sha1(line)}:${dialectCode}:${CACHE_VERSION}`;
}

function systemPrompt(dialectCode) {
  const lang = DIALECT_NAMES[dialectCode] ?? "Chinese";
  return `You translate ${lang} song lyrics into concise, natural English.
Rules:
- One sentence per input line. Preserve meaning, tone, and register.
- Output only English translations — no romanisation, no annotation, no commentary.
- Keep it singable: short, emotionally faithful, no over-explanation.
- Input is a JSON array of strings. Output MUST be a JSON array of the same length and order.
- Return only the JSON array. No prose, no code fences.`;
}

async function translateBatch(lines, dialectCode) {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: systemPrompt(dialectCode),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: JSON.stringify(lines) },
    ],
  });

  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Model returned non-JSON output");
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed) || parsed.length !== lines.length) {
    throw new Error(
      `Model returned ${Array.isArray(parsed) ? parsed.length : "non-array"}, expected ${lines.length}`
    );
  }
  return parsed.map((s) => (typeof s === "string" ? s : String(s ?? "")));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
    return;
  }

  const { lines, dialectCode } = req.body ?? {};
  if (!Array.isArray(lines) || lines.length === 0) {
    res.status(400).json({ error: "lines must be a non-empty array" });
    return;
  }
  if (lines.length > 200) {
    res.status(400).json({ error: "lines must be <= 200 per request" });
    return;
  }
  const dialect = typeof dialectCode === "string" ? dialectCode : "yue";

  const translations = new Array(lines.length).fill(null);
  const cached = new Array(lines.length).fill(false);
  const missIndices = [];
  const missLines = [];

  if (redis) {
    const keys = lines.map((l) => cacheKey(l, dialect));
    try {
      const hits = await redis.mget(...keys);
      hits.forEach((hit, i) => {
        if (typeof hit === "string" && hit.length > 0) {
          translations[i] = hit;
          cached[i] = true;
        } else {
          missIndices.push(i);
          missLines.push(lines[i]);
        }
      });
    } catch (err) {
      console.error("KV read failed:", err.message);
      for (let i = 0; i < lines.length; i++) {
        missIndices.push(i);
        missLines.push(lines[i]);
      }
    }
  } else {
    for (let i = 0; i < lines.length; i++) {
      missIndices.push(i);
      missLines.push(lines[i]);
    }
  }

  if (missLines.length > 0) {
    try {
      const fresh = await translateBatch(missLines, dialect);
      for (let j = 0; j < missIndices.length; j++) {
        translations[missIndices[j]] = fresh[j];
      }
      if (redis) {
        const pipeline = redis.pipeline();
        for (let j = 0; j < missIndices.length; j++) {
          const key = cacheKey(missLines[j], dialect);
          pipeline.set(key, fresh[j], { ex: CACHE_TTL_SECONDS });
        }
        pipeline.exec().catch((err) => console.error("KV write failed:", err.message));
      }
    } catch (err) {
      console.error("Anthropic call failed:", err.message);
      res.status(502).json({ error: "Translation failed", detail: err.message });
      return;
    }
  }

  res.status(200).json({ translations, cached });
}
