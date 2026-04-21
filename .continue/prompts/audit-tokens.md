---
name: audit-tokens
description: Scan all components for design system violations
invokable: true
---

Scan all src/components/**/*.jsx for violations:
1. Hardcoded hex colors (#xxxxxx or rgb/rgba literals in className)
2. Tailwind slate-* / gray-* / zinc-* color classes (should use semantic tokens)
3. bg-white or bg-black (should use bg-bg-base or bg-neutral-950)
4. dark: prefix classes (should be .dark root swap instead)
5. Inline style={{ color: '...' }} with non-token values

Report as table: file | line | violation | recommended fix
