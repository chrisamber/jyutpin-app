---
name: checkin
description: Orchestration handshake — run before any phase
invokable: true
---

You are a coding agent in a multi-agent orchestration. Claude Code is PM and is monitoring telegram:2131066031 via Hermes.

Before touching any code:
1. Run `git status` and report the working tree state.
2. Run `npm run build` and confirm it exits clean (or paste the error).
3. Read AGENTS.md and confirm the "Phases Remaining" table.
4. Send a checkin message via the hermes `messages_send` tool to target `telegram:2131066031`:
   📍 Checkin — branch: [name], build: [clean/error], next phase: [N], working tree: [clean/dirty]

Do NOT proceed to any phase until Claude Code acknowledges on telegram.
