# Design System & Figma MCP Integration Rules

## Design System

**Tokens** — defined in `src/index.css` via Tailwind v4 `@theme`. Never hardcode hex values.

| Token | Value | Usage |
|---|---|---|
| `bg-primary` | `#FFFFFF` | Page background |
| `bg-surface` | `#F8FAFC` | Cards, panels |
| `bg-elevated` | `#F1F5F9` | Hover states |
| `text-primary` | `#0F172A` | Main text |
| `text-secondary` | `#64748B` | Subdued labels |
| `text-muted` | `#94A3B8` | Placeholders, section labels |
| `accent` | `#D97706` | CTA, highlights |
| `accent-dim` | `#F59E0B1F` | Accent backgrounds |
| `bg-hover` | `#E2E8F0` | Hover background |
| `accent-hover` | `#B45309` | Accent hover |
| `border` | `#E2E8F0` | Default border |
| `border-accent` | `#F59E0B33` | Accent border |
| Tone 1–6 | red/orange/amber/green/blue/purple | Per-tone colour |

**Tone colours** are for Jyutping tone numbers (1–6). Always use `--color-tone-{n}` tokens, never hardcode.

**Typography:**
- UI text: `Inter` (weights 300/400/500/600)
- Romanization / mono / chords: `JetBrains Mono` via `font-mono` class
- CJK characters: `Noto Serif SC` via `cjk` class or `font-family: 'Noto Serif SC'`

**Component locations:**
- Layout: `src/components/layout/`
- Search: `src/components/search/`
- Artist: `src/components/artist/`
- Lyrics: `src/components/lyrics/`
- Song: `src/components/song/`
- Study: `src/components/study/`
- Print: `src/components/print/`

**Styling approach:** Tailwind CSS v4 utility classes. No CSS Modules, no styled-components.

## Figma Implementation Flow

1. Run `get_design_context` for the target node
2. Run `get_screenshot` for visual reference
3. Translate output to Tailwind v4 utility classes
4. Map all colours to `--color-*` tokens from `src/index.css`
5. Use `font-mono` for romanization text, `cjk` for Chinese characters
6. Place new components in the matching domain folder under `src/components/`
7. Validate against screenshot before marking complete

## Key Patterns

```jsx
// Surface card
<div className="bg-bg-surface border border-border rounded-xl p-4">

// Accent button
<button className="bg-accent hover:bg-accent-hover text-text-primary font-medium text-xs px-4 py-1.5 rounded-lg">

// Section label (monospace uppercase)
<div className="text-[10px] font-mono text-text-muted tracking-[0.2em] uppercase mb-3">

// CJK title
<h1 className="text-2xl font-light tracking-widest text-text-primary cjk">

// Subtle hover row
<button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-elevated transition-colors group">
```

## Asset Rules

- IMPORTANT: If Figma MCP returns a localhost image/SVG source, use it directly
- IMPORTANT: Do NOT add new icon packages — use inline SVG or text symbols
- Store downloaded assets in `public/`
- Album art and artist images are fetched at runtime from iTunes/Wikipedia and cached in localStorage
