# jyutpin-app Design Overhaul — Agent Delegation Guide

## Mission Overview

**Redesign the jyutpin-app (WaaPou) UI with the amber-audio aesthetic** — creating a premium, spacious, editorial experience with full dark mode support.

**Key Requirements:**
- Amber-audio aesthetic: Ultra-spacious, editorial, minimalist, content-focused
- Warm amber accent (#B8860B) replacing bright orange (#D97706)
- Enhanced 6-tone color system (more distinctive, better contrast)
- **Full dark mode on ALL components** (non-negotiable)
- Print mode remains light/B&W for PDF export
- All existing functionality preserved

**Total Scope:** ~12-16 hours of implementation + testing
**Status:** Ready for parallel agent delegation

---

## Detailed Plan Reference

**Read the full plan first:**
→ `/Users/chrisamber/.claude/plans/claude-design-tools-for-woolly-mochi.md`

This delegation guide is a **quick reference**. The full plan has:
- Complete color palette definitions (light + dark)
- Typography sizing and strategy
- Component redesign specifics
- Implementation roadmap
- File modification priority list
- Testing and verification approach

---

## Agent Delegation Strategy

### Recommended Approach: Parallel Execution

**3 concurrent agents, each handling a domain:**

1. **Agent 1: Design System & Foundations**
   - **Task:** Color tokens, typography, dark mode setup
   - **Duration:** 2-3 hours
   - **Success Criteria:** All color variables defined in `/src/index.css`, dark mode toggle working, WCAG verified

2. **Agent 2: Layout & Spacing Overhaul**
   - **Task:** Padding, margins, spacing adjustments across layout components
   - **Duration:** 3-4 hours
   - **Success Criteria:** Hero section spacious, cards have increased padding, vertical rhythm improved

3. **Agent 3: Component Styling**
   - **Task:** Buttons, badges, inputs, navigation, special components
   - **Duration:** 3-4 hours
   - **Success Criteria:** All components styled, dark mode working, tone colors distinct

**Then Sequential:**

4. **Agent 4: Dark Mode Completion**
   - **Task:** Apply dark: utilities to all components not covered by Agent 3
   - **Duration:** 2-3 hours
   - **Success Criteria:** Every color element has dark: variant, all screens tested in dark mode

5. **Agent 5: Testing & Polish**
   - **Task:** Visual regression, print testing, accessibility, responsiveness
   - **Duration:** 2-3 hours
   - **Success Criteria:** Before/after comparison, PDF export working, no regressions

---

## Phase Breakdown for Delegation

### Phase 1: Design System & Token Definition
**Assigned to:** Agent 1 (Design System)

**Files to modify:**
- `/src/index.css` — Add all new color tokens + dark mode CSS variables

**New tokens to add:**

```css
:root {
  /* Light Mode Backgrounds */
  --color-bg-primary: #FAFAF9;
  --color-bg-surface: #F5F5F3;
  --color-bg-elevated: #EFEFED;
  --color-bg-hover: #E8E8E5;

  /* Light Mode Text */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B6B67;
  --color-text-muted: #A09F9B;

  /* Accent System */
  --color-accent: #B8860B;
  --color-accent-dim: #B8860B14;
  --color-accent-hover: #A07A0A;

  /* Borders */
  --color-border: #DFDFDB;
  --color-border-accent: #B8860B26;
  --color-border-subtle: #FFFFFF08;

  /* Tone Colors (Light Mode - optimized for white bg) */
  --color-tone-1: #E63946;
  --color-tone-2: #DA5D1A;
  --color-tone-3: #B8860B;
  --color-tone-4: #2D7A4A;
  --color-tone-5: #1F5BA8;
  --color-tone-6: #8B4FA0;

  /* Dark Mode Backgrounds */
  --color-bg-primary-dark: #0F0F0E;
  --color-bg-surface-dark: #1A1A18;
  --color-bg-elevated-dark: #262624;
  --color-bg-hover-dark: #323230;

  /* Dark Mode Text */
  --color-text-primary-dark: #FAFAF8;
  --color-text-secondary-dark: #B8B8B3;
  --color-text-muted-dark: #7B7B77;

  /* Dark Mode Accents */
  --color-accent-dark: #FFD700;
  --color-accent-dim-dark: #FFD70014;
  --color-accent-hover-dark: #FFED4E;

  /* Dark Mode Borders */
  --color-border-dark: #3F3F3D;
  --color-border-accent-dark: #FFD70033;
  --color-border-subtle-dark: #FFFFFF12;

  /* Dark Mode Tone Colors (bright, distinct) */
  --color-tone-1-dark: #FF6B6B;
  --color-tone-2-dark: #FFA500;
  --color-tone-3-dark: #FFD700;
  --color-tone-4-dark: #52B788;
  --color-tone-5-dark: #4A90E2;
  --color-tone-6-dark: #D946EF;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0F0F0E;
    --color-bg-surface: #1A1A18;
    --color-bg-elevated: #262624;
    --color-bg-hover: #323230;
    --color-text-primary: #FAFAF8;
    --color-text-secondary: #B8B8B3;
    --color-text-muted: #7B7B77;
    --color-accent: #FFD700;
    --color-accent-dim: #FFD70014;
    --color-accent-hover: #FFED4E;
    --color-border: #3F3F3D;
    --color-border-accent: #FFD70033;
    --color-border-subtle: #FFFFFF12;
    --color-tone-1: #FF6B6B;
    --color-tone-2: #FFA500;
    --color-tone-3: #FFD700;
    --color-tone-4: #52B788;
    --color-tone-5: #4A90E2;
    --color-tone-6: #D946EF;
  }
}
```

**Typography updates in index.css:**
- Update H1 sizing: 3.5rem
- Update body font-size: 0.9375rem
- Update line-heights
- Update letter-spacing

**Verification:**
- Run `npm run dev`
- Check DevTools: Inspect element and verify CSS variables are applied
- Test dark mode: Add `class="dark"` to `<html>` tag manually, verify colors change
- WCAG contrast check: Use WebAIM or similar tool on all tone colors

---

### Phase 2: Layout & Spacing
**Assigned to:** Agent 2 (Layout & Spacing)

**Critical files in priority order:**

1. **`/src/components/layout/AppShell.jsx`**
   - Increase container padding: py-12, px-8
   - Verify max-w-6xl is applied

2. **`/src/components/layout/Header.jsx`**
   - Increase header padding: py-4
   - Adjust logo sizing if needed
   - Update navigation spacing

3. **`/src/components/search/SearchHero.jsx`**
   - Hero section: py-12 (↑ from py-8), px-8
   - Search input: py-4, px-6 (↑ from smaller)
   - Increase gaps between sections: gap-6 (↑ from gap-4)

4. **`/src/components/song/SongMeta.jsx`**
   - Card padding: p-6 (↑ from p-4/p-5)
   - Input fields: px-4 py-3
   - Form spacing: space-y-4

5. **`/src/components/lyrics/LyricsDisplay.jsx`**
   - Lyric line spacing: increase vertical padding
   - Container padding: px-8 py-10

**Batch updates needed:**
- Find all `p-4` and replace with `p-6`
- Find all `py-2` `py-3` and increase as appropriate
- Find all `gap-2` `gap-4` and increase to `gap-6`

**Verification:**
- Screenshot hero section (search view)
- Screenshot lyrics view
- Compare spacing before/after
- Verify no content overlaps or clipping

---

### Phase 3: Typography & Text Treatment
**Assigned to:** Agent 1 (Design System) — coordinate with Agent 2

**Updates to `/src/index.css`:**

```css
@layer base {
  h1 { 
    @apply text-[3.5rem] leading-[1.2] tracking-[-0.02em];
  }
  h2 {
    @apply text-[1.875rem] leading-[1.3];
  }
  body {
    @apply text-[0.9375rem] leading-[1.7];
  }
}
```

**Component-level updates:**
- Check SearchHero.jsx for heading sizing
- Check SongHeader.jsx for title sizing
- Verify all body text has proper line-height

**Personality touches:**
- Add underline to accent text where appropriate
- Use `text-decoration: underline 1px solid var(--color-accent-dim)`
- Apply to buttons, links, emphasized text

**Verification:**
- Visual check: Headings feel larger, body text more spacious
- Measure line-height: Should feel airy

---

### Phase 4: Component Styling
**Assigned to:** Agent 3 (Component Styling)

**High-priority components:**

1. **`/src/components/tone/ToneBadge.jsx`**
   - Update tone color usage: Use --color-tone-1 through --color-tone-6
   - Reduce opacity: 0.08 instead of 0.15
   - Add dark mode support: `dark:bg-tone-X/10 dark:text-tone-X`

2. **`/src/components/lyrics/SectionLabel.jsx`**
   - Remove background color
   - Add monospace styling: font-mono uppercase tracking-[0.15em]
   - Add underline: text-decoration underline
   - Dark mode: `dark:text-accent-dark`

3. **`/src/components/layout/TabNav.jsx`**
   - Increase padding between tabs
   - Update active state: underline instead of full background
   - Dark mode borders: `dark:border-border-dark`

4. **`/src/components/lyrics/LyricsLine.jsx`**
   - Increase vertical padding around lines
   - Tone color backgrounds: opacity 0.08 (↓ from 0.15)
   - Dark mode: use bright tone colors for text

5. **`/src/components/lyrics/JyutpingAnnotation.jsx`** (ruby text)
   - Tone backgrounds: use --color-tone-X with low opacity (0.08)
   - Dark mode: bright tone colors, increase text contrast

**All buttons across the app:**
- Primary: `px-5 py-3 rounded-lg bg-accent dark:bg-accent-dark`
- Secondary: `px-4 py-2.5 border border-border dark:border-border-dark`
- Hover states: Add subtle scale/color shift

**All input fields:**
- Padding: `px-4 py-3`
- Border: `border border-border dark:border-border-dark`
- Focus: `focus:border-accent dark:focus:border-accent-dark`

**All cards/surfaces:**
- Padding: `p-6`
- Border: `border border-border dark:border-border-dark`
- Background: `bg-bg-surface dark:bg-bg-surface-dark`

**Verification:**
- Visual check: All tone colors visible and distinct (light mode)
- Visual check: All tone colors bright and distinct (dark mode)
- Test buttons: Hover states work smoothly
- Test inputs: Focus states clear

---

### Phase 5: Dark Mode Completion
**Assigned to:** Agent 4 (Dark Mode Completion)

**Task:** Ensure every color element has a dark: variant

**Systematic approach:**

1. **Backgrounds:** Every `bg-*` class needs a `dark:bg-*-dark`
2. **Text colors:** Every `text-*` class needs a `dark:text-*-dark`
3. **Borders:** Every `border-*` class needs a `dark:border-*-dark`
4. **Special elements:** Tone badges, annotations, ruby text

**Files to audit:**

- `/src/components/search/SearchHero.jsx`
- `/src/components/search/SearchResults.jsx`
- `/src/components/song/SongMeta.jsx`
- `/src/components/song/SongBreakdown.jsx`
- `/src/components/lyrics/LyricsDisplay.jsx`
- `/src/components/lyrics/LyricsLine.jsx`
- `/src/components/lyrics/JyutpingAnnotation.jsx`
- `/src/components/tone/ToneBadge.jsx`
- `/src/components/tone/ToneVisual.jsx`
- `/src/components/study/ToneSystem.jsx`
- `/src/components/study/Drills.jsx`

**Key pattern to apply:**

```jsx
// Before
<div className="bg-bg-surface text-text-primary border border-border">
// After
<div className="bg-bg-surface dark:bg-bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark">
```

**Verification:**
- Toggle dark mode: Add/remove `class="dark"` from `<html>`
- Visual check: All text readable on dark background
- Tone colors: All 6 are distinct and bright
- Contrast check: WCAG AA (4.5:1) on all text

---

### Phase 6: Testing & Polish
**Assigned to:** Agent 5 (Testing & Polish)

**Visual Regression Testing:**

1. Screenshot current (light mode):
   - Search hero
   - Search results
   - Lyrics view
   - Study view
   - Print preview

2. Compare with redesigned (light mode):
   - All spacing should be larger
   - Colors should be warmer/softer
   - Hierarchy should be clearer

3. Dark mode visual check:
   - All 6 tone colors bright and distinct
   - No unreadable text
   - All interactive elements clear

**Accessibility Testing:**

1. Run contrast checker:
   - Light mode: All tone colors on #FAFAF9 background
   - Dark mode: All tone colors on #0F0F0E background
   - All should pass WCAG AA (4.5:1)

2. Keyboard navigation:
   - Tab through all interactive elements
   - Focus states visible in both modes
   - Escape/Enter work as expected

3. Responsive testing:
   - Mobile 375px: Spacing scales, layout responsive
   - Tablet 768px: Layout flows correctly
   - Desktop 1280px: Full-width experience works

**Print Testing:**

1. Export PDF from lyrics view
2. Check:
   - Light background (B&W for printing)
   - Proper spacing and margins
   - Ruby annotations readable
   - No page break issues

**Final Verification Checklist:**

- [ ] All color tokens defined in `/src/index.css`
- [ ] Dark mode works (toggle or prefers-color-scheme)
- [ ] All components styled with new palette
- [ ] 6-tone colors distinct in light mode
- [ ] 6-tone colors bright and distinct in dark mode
- [ ] Spacing increased 30-40% from original
- [ ] Typography hierarchy clear and readable
- [ ] Print mode outputs light/B&W correctly
- [ ] No functional regressions
- [ ] WCAG AA contrast verified
- [ ] Responsive design tested (3 breakpoints, 2 modes)
- [ ] Before/after comparison photos taken

---

## Critical Success Criteria

✅ **Design System Complete** — All tokens defined, no hardcoded colors
✅ **Amber-Audio Aesthetic** — Spacious, warm, editorial feeling
✅ **Dark Mode Works** — Every component supports dark mode, tone colors bright
✅ **Enhanced Tone Colors** — All 6 tones distinct, 4.5:1 contrast both modes
✅ **No Regressions** — All functionality preserved
✅ **Accessible** — WCAG AA compliant, keyboard navigable
✅ **Print Ready** — PDF export works, B&W output clean

---

## Key Files Summary

**Foundation (always start here):**
- `/src/index.css` — All color tokens, typography, dark mode setup

**Layout (spacing & structure):**
- `/src/components/layout/AppShell.jsx`
- `/src/components/layout/Header.jsx`
- `/src/components/search/SearchHero.jsx`

**Content Area (main styling):**
- `/src/components/lyrics/LyricsDisplay.jsx`
- `/src/components/song/SongMeta.jsx`

**Special Components (tone colors):**
- `/src/components/tone/ToneBadge.jsx`
- `/src/components/lyrics/JyutpingAnnotation.jsx`
- `/src/components/tone/ToneVisual.jsx`

**Navigation & Interactive:**
- `/src/components/layout/TabNav.jsx`
- All button components across layout/, search/, song/, study/

**Print (ensure dark mode doesn't break):**
- `/src/styles/print.css` — Verify print forces light mode

---

## Running & Verification

**To run the app during redesign:**
```bash
npm run dev
# Opens http://localhost:5173
# Click demo song to see full study UI
```

**To toggle dark mode (during development):**
```javascript
// In browser console:
document.documentElement.classList.toggle('dark');
```

**To verify build after changes:**
```bash
npm run build
# Should complete without errors
npm run preview
# Preview the production build
```

**To test print (before PDF export):**
```bash
# In browser: Cmd+P (Mac) or Ctrl+P (Windows)
# Check "Background graphics" checkbox
# Save as PDF or preview
```

---

## Delegation Checklist

**Before starting:**
- [ ] All agents have read this file AND `/Users/chrisamber/.claude/plans/claude-design-tools-for-woolly-mochi.md`
- [ ] Understood: Warm amber #B8860B replaces orange #D97706
- [ ] Understood: FULL dark mode on ALL components (non-negotiable)
- [ ] Understood: 6 tone colors enhanced for distinctness
- [ ] Understood: Print mode stays light/B&W

**Progress tracking:**
- [ ] Phase 1: Design System complete (Agent 1)
- [ ] Phase 2: Layout complete (Agent 2)
- [ ] Phase 3: Typography complete (Agent 1)
- [ ] Phase 4: Component styling complete (Agent 3)
- [ ] Phase 5: Dark mode complete on all components (Agent 4)
- [ ] Phase 6: Testing & verification complete (Agent 5)

**Hand-off criteria:**
- [ ] All phases complete and tested
- [ ] Before/after screenshots captured
- [ ] WCAG contrast verified
- [ ] Print export tested
- [ ] No regressions reported
- [ ] Ready for production deployment

---

## Notes for Agents

- **Communication:** Agents working on overlapping areas (e.g., Agent 2 layout + Agent 3 components) should coordinate
- **Testing early:** Don't wait until Phase 6 to test — test as you go
- **Dark mode first:** When styling, add dark: variants immediately (easier than retroactively adding)
- **Reference the full plan:** This delegation guide is a summary — the full plan has all details
- **Ask questions:** If anything is unclear, ask before proceeding
- **Git workflow:** Create a feature branch `design/amber-audio-overhaul`, commit frequently, test before pushing

**Contact for questions:** @user (Chris Amber)

---

**Plan created:** 2026-04-21
**Target completion:** 2026-04-22 (with parallel agents)
**Estimated solo execution:** 2-3 days
