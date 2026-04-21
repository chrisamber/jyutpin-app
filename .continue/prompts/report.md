---
name: report
description: Send phase completion report to Claude Code via Telegram
invokable: true
---

You have just completed a phase of the WaaPou design overhaul.
Use the hermes `messages_send` tool to send to target `telegram:2131066031`:

🏁 Phase [N] Complete — WaaPou Design

Status: ✅ Done / ⚠️ Partial / ❌ Blocked
Build: clean / errors (paste errors)
Files changed: [list key files]
Summary: [2-3 sentence description of what changed]
Violations found: [any design system violations, or "none"]
Blockers: [anything needing Claude Code review, or "none"]
Next: Phase [N+1] ready / needs approval

Be specific. Claude Code will review and respond with next instructions.
