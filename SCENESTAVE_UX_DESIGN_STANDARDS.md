# SceneStave — UX & Design Standards
> This document is the standing design authority for all SceneStave development.  
> Every component, screen, and interaction built by this agent must comply with the rules below.  
> When in doubt: simpler, cleaner, more theatre-appropriate.

---

## 1. Laws of UX — Always Active

These laws govern every UI decision. Before shipping any component, verify it passes all applicable checks.

---

### 1.1 Fitts's Law — Target Size & Proximity
> *The time to reach a target increases as distance grows and target size shrinks.*

- All clickable elements must be **at minimum 40×40px**. Prefer 44×44px for anything used frequently.
- Primary action buttons (Save, Add, Import, Check In) must be the **largest interactive element in their zone**.
- Place related actions **near the data they act on** — not in a remote toolbar.
- Destructive actions (Delete, Remove, Reset) must be **visually separated** from primary actions — never adjacent.
- Row-level actions in tables must be reachable without precise targeting; use icon buttons with generous padding (`p-2` minimum).

**Verification:** Could a Stage Manager hit every button on this screen quickly, under pressure, in low light?

---

### 1.2 Hick's Law — Reduce Choice at Decision Points
> *Decision time grows logarithmically with the number of choices.*

- No navigation group should exceed **7 items**. If it does, group or collapse.
- Forms must not present more than **5–7 visible fields** before a section break or progressive disclosure.
- Dropdowns with more than 7 options must include a **search/filter input**.
- Toolbars and action bars must not exceed **5 primary actions**. Move secondary actions into a `...` overflow menu.
- CSV import field mapping must use **smart defaults and auto-detection** — never require manual mapping of every field.

**Verification:** Count every choice visible at once. If it exceeds 7, break it up.

---

### 1.3 Miller's Law — Chunk Information
> *Working memory holds approximately 7 (±2) items at a time.*

- Tables with more than 8 columns must use **column visibility toggles** or progressive disclosure.
- Scene Builder fields must be grouped into logical sections (Identity, Action, Atmosphere, Technical) — never a single flat list.
- Long lists (props, donors, volunteers) must be **paginated or virtually scrolled** — never render more than 50 rows at once.
- Financial dashboards must organize metrics into **named card groups** — never a wall of numbers.
- Forms with more than 6 fields must use **labeled fieldsets or step groups**.

**Verification:** Can a user scan this screen and immediately understand what they're looking at?

---

### 1.4 Jakob's Law — Match Familiar Patterns
> *Users spend most of their time on other apps and expect yours to work the same way.*

- Save/Cancel button order: **Save is always primary (left or dominant), Cancel is always secondary (right or subdued)**.
- Table rows: clicking a row **opens detail or edit** — consistent with Airtable and Google Sheets conventions.
- Sidebar navigation: **active item is visually highlighted** with filled background or left-border accent.
- Modals: `Escape` key closes. Clicking the backdrop closes. **Close button (×) is always top-right.**
- Delete always triggers a **confirmation dialog** — never an immediate destructive action.
- Empty states always include **a call-to-action** — not just "No items found."

**Verification:** Would someone coming from Google Sheets, Airtable, or Notion be surprised by any interaction on this screen?

---

### 1.5 Aesthetic-Usability Effect — Professional Appearance
> *Users perceive attractive interfaces as more usable and more trustworthy.*

- SceneStave's design register is **professional theatre, not generic SaaS**. Every screen must look like it belongs in a Broadway production office.
- Avoid:
  - Generic purple gradient on white (the default "AI-built SaaS" look)
  - Default shadcn/ui components without customization
  - Excessive rounded corners and heavy card shadows on dense data views
  - Inconsistent font weights across similar UI elements
- Prefer:
  - Deep indigo/violet as the primary brand color, used with restraint as accent
  - Crisp typography with deliberate weight contrast (bold labels, regular values)
  - Subtle depth through background tints and 1px borders — not heavy box shadows
  - Theatre-vocabulary language: "Scene", "Act", "Cue", "Run Sheet" — never generic SaaS terms

**Verification:** Would a Board Member presenting this at a donor meeting feel proud of how it looks?

---

### 1.6 Von Restorff Effect — Differentiate What Matters
> *Items that stand out from their peers are more memorable and more actionable.*

- **Status indicators must use color meaningfully:**
  - Green → complete, confirmed, on-budget
  - Amber/yellow → pending, warning, needs attention
  - Red → overdue, error, over-budget, destructive
  - Blue → informational, in-progress
  - Gray → inactive, archived, not-set
- **Only one element per view should use the primary brand color at full saturation.** Everything else uses tints or neutrals.
- Budget variance warnings must use **amber border + icon** — never just a subtle color change in a table cell.
- Pending items (volunteer applications, unacknowledged donations) must surface as **badged counts**, not buried in tables.

**Verification:** If you squint at this screen, which element draws the eye first? Is that the right one?

---

### 1.7 Serial Position Effect — Order by Importance
> *Users best remember the first and last items in a sequence.*

- Navigation items: **most-used sections first**, utility/settings last.
- Production cards: **most recently active production first** (descending by `updatedAt`).
- Scene Builder fields: **Prop Name / Character / Scene Number first** — operational identity before metadata.
- Table columns: **Name/Title always column 1**, status always near-first, administrative metadata (dates, IDs) last or hidden.
- In multi-step forms or modals: **primary required fields first**, optional/advanced fields last or collapsed.

**Verification:** Does the order of items on this screen reflect the order a theatre professional would actually think about them?

---

### 1.8 Tesler's Law — System Absorbs Complexity
> *Every system has inherent complexity. It cannot be eliminated — only shifted to the user or to the system. Shift it to the system.*

- CSV imports must **auto-detect column matches** where field names are similar.
- Budget variance must be **calculated automatically** — never require the user to compute it.
- Scene Builder data must **propagate to all department tools automatically** — no re-entry.
- Error messages must tell the user **exactly what to fix** — never just "An error occurred."
- Default values must be pre-populated wherever a sensible default exists (e.g., Status = "Needed", Quantity = 1).
- localStorage operations must have **try/catch with silent fallback** — never crash the UI on a read error.

**Verification:** Is the user doing any work the system could be doing for them?

---

### 1.9 Doherty Threshold — Feedback Within 400ms
> *Productivity soars when a system responds quickly enough that users don't have to wait consciously.*

- **Every user action must produce visible feedback within 400ms:**
  - Button clicks → loading spinner or disabled state
  - Form saves → toast notification ("Saved ✓")
  - CSV imports → progress indicator with row count
  - Delete confirmations → immediate visual removal with undo option
- localStorage writes are synchronous — no loading state needed, but a **"Saved" toast is still required** to confirm success.
- If any operation takes more than 400ms (large data renders, CSV parsing), show a **skeleton loader or progress bar** — never a blank screen.
- React Error Boundaries must wrap every major section. Errors must render a **recovery UI** — never a blank white screen.

**Verification:** After every interaction, is there immediate, unambiguous confirmation that something happened?

---

### 1.10 Peak-End Rule — Design the High-Stakes Moments
> *Experiences are judged by their most intense moment and their ending — not the average.*

**Peak moments to design with care:**
- Completing a CSV import → show a success summary: "47 props imported across 3 scenes."
- Logging a donation → confirm with donor name and amount, offer next action ("Log another" / "View donor").
- Publishing scenes to departments → show which departments received the update.
- Checking in a volunteer → immediate visual confirmation, feel satisfying.
- Approving a casting decision → clear confirmation with character + actor name.

**Ending moments to design with care:**
- After Save → show what was saved, where it lives, what's next.
- After Delete → confirm what was removed, never leave ambiguity.
- After Import → show summary, offer to review imported items.
- After completing a production run → offer archiving + summary export.

**Verification:** What is the most emotionally significant moment in this workflow? Does the UI match that significance?

---

### 1.11 Progressive Disclosure — Reveal on Demand
> *Show only what's needed now. Reveal complexity when the user is ready for it.*

- Scene Builder: core fields visible by default; technical/cue fields collapsed under **"Technical Details ▾"**.
- Set piece rows: design fields visible; construction/build fields under **"Build Details ▾"**.
- Props rows: name/status/character visible; dimensions/vendor/notes under **"More ▾"** or in an expand panel.
- Donor cards: name/total/segment visible; full donation history behind **"View History"**.
- Budget panels: total and variance visible; line-item breakdown behind **expand toggle**.
- Advanced settings: basic preferences visible; power-user options under **"Advanced ▾"**.

**Never show:**
- More than 8 fields in a flat form without a section break or collapse
- All table columns by default if there are more than 8

**Verification:** Is everything on this screen necessary right now, or is some of it context that only matters sometimes?

---

### 1.12 Zeigarnik Effect — Surface Incompleteness
> *People remember and feel pulled toward unfinished tasks.*

- Dashboard stat cards must display **actionable pending counts**: "3 pending volunteer applications", "2 unacknowledged donations."
- Scene Builder scenes with missing fields must show a **subtle completion indicator** — not a harsh error, just a nudge.
- Productions with uncast roles must surface a **"X roles uncast"** badge on the production card.
- Props with missing cost data must surface a **"X props missing cost"** banner in the budget panel.
- Volunteer applications in "pending" state must be **visually distinct** from processed ones — never the same gray.
- Incomplete imports (partial field mapping) must be **blocked from completion** with a clear indicator of what's missing.

**Verification:** Are there incomplete items on this screen that the user might not notice? Surface them.

---

## 2. SceneStave Design System

### 2.1 Color Palette

| Role | Tailwind Class | Hex | Usage |
|------|---------------|-----|-------|
| Primary Brand | `violet-600` / `indigo-600` | `#7c3aed` / `#4f46e5` | Primary buttons, active nav, key accents |
| Primary Hover | `violet-700` / `indigo-700` | `#6d28d9` / `#4338ca` | Hover states on primary elements |
| Primary Tint | `violet-50` / `indigo-50` | `#f5f3ff` / `#eef2ff` | Active row backgrounds, selected states |
| Success | `green-500` | `#22c55e` | Cast badges, positive variance, confirmations |
| Warning | `amber-500` | `#f59e0b` | Budget warnings, pending states |
| Danger | `red-500` | `#ef4444` | Destructive actions, over-budget, errors |
| Info | `blue-500` | `#3b82f6` | In-progress, informational badges |
| Neutral Text | `gray-900` / `gray-700` | `#111827` / `#374151` | Body text, labels |
| Subdued Text | `gray-500` | `#6b7280` | Help text, metadata, placeholders |
| Border | `gray-200` | `#e5e7eb` | Card borders, dividers, table lines |
| Background Base | `white` / `gray-50` | `#ffffff` / `#f9fafb` | Page background, card backgrounds |
| Sidebar | `gray-900` | `#111827` | Always dark — both light and dark mode |

**Color Rules:**
- Green is reserved for **success and completion only**. Never use it for generic secondary actions.
- Red is reserved for **destructive actions and errors only**. Never use it for informational content.
- Amber is reserved for **warnings and pending states only**.
- The primary brand color (violet/indigo) should appear on **one dominant element per view**.

---

### 2.2 Typography

| Element | Tailwind Classes | Notes |
|---------|-----------------|-------|
| Page Title | `text-2xl font-bold text-gray-900` | One per screen |
| Section Header | `text-lg font-semibold text-gray-800` | Panel/card headers |
| Label | `text-sm font-medium text-gray-700` | Form labels, column headers |
| Body / Value | `text-sm text-gray-900` | Data values, descriptions |
| Help / Meta | `text-xs text-gray-500` | Hints, timestamps, secondary info |
| Badge Text | `text-xs font-semibold` | Status badges, tags |

**Typography Rules:**
- Never use more than **3 font sizes on a single screen**.
- Never render data values at `text-xs` — minimum `text-sm` for any user-readable data.
- Column headers in tables must be `font-medium` or `font-semibold` — never `font-normal`.
- Every page must have **one and only one** `text-2xl` or larger heading.

---

### 2.3 Spacing & Layout

- Base unit: **4px** (Tailwind's `1` unit = 4px).
- Card internal padding: `p-4` (16px) minimum, `p-6` (24px) preferred for primary content cards.
- Table cell padding: `py-3 px-4` minimum for comfortable scanning.
- Section gaps: `gap-4` between cards at the same level, `gap-6` between sections.
- Form field gaps: `gap-4` between fields, `gap-6` between field groups.
- Button padding: `px-4 py-2` minimum for standard buttons, `px-3 py-1.5` for small/inline buttons.
- Never use `p-1` or `p-2` as the sole padding on a user-facing interactive element.

---

### 2.4 Interactive Elements

**Primary Button:**
```
bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg 
transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
```

**Secondary Button:**
```
bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg border 
border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300
```

**Danger Button:**
```
bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg 
transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
```

**Ghost / Icon Button:**
```
p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors
```

**Rules:**
- Every button must have a `hover:` state and a `focus:ring` state — no exceptions.
- Disabled buttons must use `opacity-50 cursor-not-allowed` — never just a color change.
- Loading states must use `disabled` attribute + spinner icon — never just text change.
- Icon-only buttons must have an `aria-label` and a tooltip.

---

### 2.5 Cards & Panels

**Standard Card:**
```
bg-white border border-gray-200 rounded-xl p-6 shadow-sm
```

**Stat / KPI Card:**
```
bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md 
transition-shadow cursor-pointer
```

**Warning Panel:**
```
bg-amber-50 border border-amber-200 rounded-lg p-4
```

**Error Panel:**
```
bg-red-50 border border-red-200 rounded-lg p-4
```

**Rules:**
- Cards must use `rounded-xl` (12px). Inline elements use `rounded-lg` (8px). Badges use `rounded-full` or `rounded`.
- Do not stack shadows — a card inside a card should have `shadow-none` on the inner card.
- Department color-coding: Lighting = `yellow`, Sound = `blue`, Wardrobe = `pink`, Props = `orange`, Set = `green`, Stage Manager = `violet`.

---

### 2.6 Tables

- Table headers: `bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide`
- Table rows: `hover:bg-gray-50 transition-colors` on `<tr>`
- Zebra striping: use hover states instead — **never alternate row colors** (they conflict with status colors).
- Sticky headers on tables with more than 10 rows: `sticky top-0 z-10`
- Row actions: visible on hover via `opacity-0 group-hover:opacity-100` — not always-visible to reduce clutter.
- Empty table state: full-width cell with centered illustration, message, and CTA button.

---

### 2.7 Status Badges

```jsx
// Complete / Success
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Complete</span>

// Pending / Warning  
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>

// Error / Overdue
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Overdue</span>

// In Progress
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">In Progress</span>

// Inactive / Archived
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Archived</span>
```

**Rules:**
- Badge color must always match the semantic color system in Section 2.1 — never use arbitrary colors.
- Text in badges must be `font-semibold` — never `font-normal`.
- Never use filled (solid) color badges for anything other than critical status — the `bg-{color}-100 text-{color}-800` tint pattern is default.

---

### 2.8 Forms & Inputs

**Standard Input:**
```
w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 
placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 
focus:border-transparent transition-colors
```

**Error State Input:**
```
border-red-300 focus:ring-red-500
```

**Rules:**
- Every input must have a visible `<label>` — never rely on `placeholder` as the only label.
- Required fields must be marked with `*` in the label and an `aria-required="true"` attribute.
- Inline validation errors must appear **below the field** in `text-xs text-red-600` — never as a page-level alert only.
- Textarea elements must have a minimum `rows={3}` — never a single-line textarea.
- Select dropdowns must include a disabled placeholder option: `<option value="" disabled>Select...</option>`.

---

### 2.9 Modals & Dialogs

- Max width: `max-w-2xl` for standard forms, `max-w-lg` for confirmations, `max-w-4xl` for data-heavy modals.
- Always include: header with title + close button (×), scrollable body, sticky footer with actions.
- Footer button order: **destructive action (if any) left-aligned**, **Cancel right**, **Primary action far-right**.
- Confirmation dialogs for destructive actions must state **exactly what will be deleted** in the message body.
- Modals must trap focus and close on `Escape` keypress.
- Backdrop: `bg-black/50` — not `bg-gray-900/75` (too dark) or `bg-black/20` (too light).

---

### 2.10 Empty States

Every list, table, and dashboard section must have a designed empty state. Never render a blank space.

**Standard structure:**
1. Icon (relevant to the section — not a generic ✕)
2. Headline: "No [items] yet" — specific, not "Nothing here"
3. Subtext: one sentence explaining what this section is for
4. CTA button: primary action to add the first item

**Examples:**
- Props Manager (empty): 🎭 "No props added yet" / "Add your first prop or import from CSV" / [+ Add Prop] [Import CSV]
- Donors (empty): 💝 "No donors recorded" / "Start building your donor database by adding your first supporter" / [+ Add Donor]
- Volunteers (empty): 🤝 "No volunteers yet" / "Create your first opportunity to start accepting applications" / [+ Create Opportunity]

---

## 3. SceneStave Design Principles

These five principles are derived from the UX audit and govern architectural design decisions.

### Principle 1: Department Data Lives in One Place, Surfaces Everywhere
The Scene Builder is the **single source of truth**. Every department workspace reads from and writes to scene-level data — never parallel data structures. A change in Scene Builder must cascade to Lighting, Sound, Wardrobe, Props, Set, and Stage Manager automatically. Never store the same data in two places.

### Principle 2: Design for the Worst Moment, Not the Best
Stage Managers are backstage in the dark during a show run. Props Masters are checking items as actors sprint onstage. Board Members are presenting live to donors. Design for these high-pressure, high-stakes moments — not for the calm desktop review session. If it doesn't work under pressure, it doesn't work.

### Principle 3: Complexity Belongs to the System, Not the User
Every feature that requires users to manage inherent complexity — CSV field mapping, act-scene hierarchies, budget variance, donor segmentation — must be absorbed by the system through smart defaults, auto-detection, and automation. When a user opens a form and sees 14 unlabeled fields, the system has failed.

### Principle 4: Every Rendered String Must Have a Fallback
"Scene undefined" and "Active Productions: 0" both stem from the same failure: rendering data properties directly without null guards. Enforce everywhere:
```js
value?.title ?? value?.name ?? `Item ${index + 1}`
```
Every count must be calculated live from data — never cached in a separate field that can fall out of sync.

### Principle 5: Errors Must Be Visible, Recoverable, and Never Silent
A blank white screen is the most trust-destroying failure mode in a production-facing app. React Error Boundaries must wrap every major section. Every boundary renders a friendly recovery surface:
- What went wrong (in plain language)
- A "Try Again" button
- A "Go to Dashboard" escape hatch

Never let an unhandled exception produce a blank screen.

---

## 4. Pre-Ship Checklist

Before marking any component or screen complete, verify all of the following:

### UX Laws
- [ ] All interactive targets are ≥ 40×40px (Fitts's Law)
- [ ] No decision point has more than 7 choices visible at once (Hick's Law)
- [ ] Information is chunked into groups — no flat list of more than 7 items (Miller's Law)
- [ ] Interactions match SaaS and theatre-tool conventions (Jakob's Law)
- [ ] Visual design is polished and theatre-appropriate — not generic SaaS (Aesthetic-Usability Effect)
- [ ] Important status indicators are visually differentiated with semantic color (Von Restorff Effect)
- [ ] Most important items appear first in lists and navigation (Serial Position Effect)
- [ ] System absorbs complexity — user is not doing work the system could do (Tesler's Law)
- [ ] Every action produces visible feedback within 400ms (Doherty Threshold)
- [ ] High-stakes moments (imports, saves, completions) have satisfying confirmation flows (Peak-End Rule)
- [ ] Detail is revealed progressively — not all fields visible at once (Progressive Disclosure)
- [ ] Incomplete or pending items are surfaced, not buried (Zeigarnik Effect)

### Design System
- [ ] Colors match the semantic palette — green = success, amber = warning, red = danger only
- [ ] Typography follows the size/weight hierarchy — no more than 3 sizes per screen
- [ ] Buttons have `hover:`, `focus:ring`, `disabled:` states
- [ ] Every input has a visible label — not just a placeholder
- [ ] Every empty state has an icon, headline, subtext, and CTA
- [ ] Status badges use the tint pattern (`bg-{color}-100 text-{color}-800`)
- [ ] Tables have sticky headers if more than 10 rows
- [ ] Modals close on Escape and have a visible × button

### Data Safety
- [ ] All localStorage reads are wrapped in `try/catch`
- [ ] All rendered strings have null fallbacks (`value ?? 'Untitled'`)
- [ ] Destructive actions require a confirmation dialog stating exactly what will be removed
- [ ] React Error Boundary wraps the component if it reads from localStorage or complex state

---

*Last updated: March 2026 — SceneStave Phase 1 (Desktop-first MVP)*
