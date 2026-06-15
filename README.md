# Lattice Design System

A React component library extracted from a Python auto-reconnaissance backend — no existing UI, no screenshots, no design file. The data model from the source code became the design spec.

**[Figma File →](https://www.figma.com/design/MyRHMbJdlP0HuyMEvZGTAm/Lattice-Design-System)**

---

## What this is

The source is `sample-app-auto-reconnaissance`, a Python CLI that runs an Entity Auto Reconnaissance System (EARS) using the Anduril Lattice SDK. Three processes run concurrently — an arbiter, a simulated asset publisher, and a simulated track publisher. There is no frontend. Just Python, gRPC calls, and log output.

The goal was to treat the SDK data models, enum values, business logic, and logging patterns as a design spec, then build a full design system from that reading alone.

---

## The work

### 1. Domain extraction

Read every Python source file and catalogued the full data model:

- **Entity fields** — `entity_id`, `aliases.name`, `is_live`, `mil_view.disposition`, `ontology.template`, `ontology.platform_type`, `location.position`, `provenance.data_type`, `provenance.source_update_time`
- **Disposition enum** — `FRIENDLY`, `ASSUMED_FRIENDLY`, `SUSPICIOUS`, `HOSTILE`, `UNKNOWN`
- **Task status enum** — `STATUS_EXECUTING`, `STATUS_DONE_OK`, `STATUS_DONE_NOT_OK`, `STATUS_PENDING`
- **System constants** — `DISTANCE_THRESHOLD_MILES = 5`, `EXPIRY_OFFSET = 15s`, `REFRESH_INTERVAL = 5s`
- **Log output** — three loggers: `EARS` (arbiter), `SIMASSET` (asset), `SIMTRACK` (track)

### 2. Component inventory

Derived 13 components directly from the data model — nothing invented, nothing decorative:

| Component | Why it exists |
|---|---|
| `DispositionBadge` | 5 `mil_view.disposition` enum values each need visual differentiation |
| `TemplateBadge` | `ontology.template` (ASSET vs TRACK) is the primary entity classification |
| `LiveBadge` | `is_live` boolean that changes entity behavior |
| `TaskStatusBadge` | 4 `status.status` values drive task lifecycle |
| `EntityRow` | One row per entity — name, template, disposition, live badge, location grid |
| `TaskRow` | One row per task — status, type, assignee → target, description |
| `ProximityAlert` | The core system event: asset within `DISTANCE_THRESHOLD_MILES` of a non-friendly track |
| `MetricCard` | Summary counts for the metrics strip |
| `EntityPanel` | Scrollable entity list with asset/track filter |
| `TaskPanel` | Active task list with empty state |
| `SystemLogEntry` | Single log line with level, logger, timestamp, message |
| `SystemLog` | Scrollable log panel mirroring EARS/SIMASSET terminal output |
| `DashboardLayout` | Full-page layout: header + metrics row + 3-panel grid |

### 3. Design tokens

Dark-mode token set appropriate for a tactical ISR dashboard. Every disposition and status enum maps to a semantic color:

```
DISPOSITION_FRIENDLY         → #3DDC84  (green)
DISPOSITION_ASSUMED_FRIENDLY → #22C5D4  (teal)
DISPOSITION_SUSPICIOUS       → #F5A623  (amber)
DISPOSITION_HOSTILE          → #F04040  (red)
DISPOSITION_UNKNOWN          → #7B8494  (gray)
```

Tokens defined in `app/globals.css` using Tailwind v4's `@theme` block. All utilities — `bg-canvas`, `text-suspicious`, `border-accent/30` — are generated automatically.

### 4. React component library

Built with Next.js 16 + Tailwind v4 + TypeScript. Props mirror the Python field names where possible (`disposition`, `is_live`, `status`). Mock data in `lib/mock-data.ts` matches the exact scenario from the original repo's README: 2 assets, 1 track within proximity, 1 executing Investigate task, 10 system log entries.

### 5. Storybook

One story file per component covering all enum variants. Run with `npm run storybook`.

### 6. Figma plugin

`figma-plugin/code.js` programmatically builds all 13 components in Figma using the Plugin API — the only way to write into a Figma file programmatically (the REST API is read-only). The plugin creates:

- A **variable collection** with every design token
- All **13 component sets** laid out in a 4-row grid (Atoms → Molecules → Organisms → Template)
- The **DashboardLayout** at 1440×900, built from instances of the other components

Run it from Figma Desktop → Plugins → Development → Import from manifest → select `figma-plugin/manifest.json`.

### 7. Figma Code Connect

13 `.figma.tsx` files in `figma/` connect each React component to its Figma counterpart. Variant property names in Figma match `figma.enum()` keys exactly. When a designer selects a component in Dev Mode, they see the correct React snippet — e.g. selecting the `Disposition=Suspicious` variant shows `<DispositionBadge disposition="DISPOSITION_SUSPICIOUS" />`.

---

## Running locally

```bash
# Dashboard — http://localhost:3000
npm run dev

# Storybook component explorer — http://localhost:6006
npm run storybook

# TypeScript check
npx tsc --noEmit

# Re-publish Code Connect (requires token with File Read + Code Connect Write scopes)
npx figma connect publish --token <TOKEN>
```

---

## Stack

- **Next.js 16** + **TypeScript**
- **Tailwind v4** (CSS-only config, `@theme` tokens)
- **Storybook 10** with `@storybook/nextjs-vite`
- **Figma Plugin API** for programmatic component creation
- **`@figma/code-connect` v1** for Dev Mode code snippets

---

## File structure

```
├── app/
│   ├── page.tsx                  # EARS dashboard with mock data
│   └── globals.css               # Tailwind v4 @theme design tokens
├── components/lattice/           # 13 domain-driven components
├── lib/
│   ├── types.ts                  # TypeScript interfaces mirroring Python models
│   ├── tokens.ts                 # Color/label maps for disposition and status enums
│   └── mock-data.ts              # Static mock matching the sample app scenario
├── stories/                      # Storybook: one .stories.tsx per component
├── figma/                        # Code Connect: one .figma.tsx per component
├── figma-plugin/
│   ├── code.js                   # Plugin that builds all 13 components in Figma
│   └── manifest.json
└── PROCESS.md                    # Full case study: every decision, every prompt
```
