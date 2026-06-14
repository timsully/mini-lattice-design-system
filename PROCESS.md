# Process: From Python Backend to Figma Design System

A portfolio case study documenting how I extracted a component-based design system from a Python backend application, rebuilt it in React + shadcn/ui, and connected the code to a Figma file using Figma Code Connect.

---

## The Source

**Repository:** `sample-app-auto-reconnaissance`  
**What it is:** A Python CLI that implements an Entity Auto Reconnaissance System (EARS) using the Anduril Lattice SDK. Three processes run concurrently: a main arbiter, a simulated asset publisher, and a simulated track publisher. There is no frontend — just Python, REST API calls, and log output.

**Why this is interesting:** The codebase has no UI at all. To build a design system, I had to read the code itself — the SDK data models, enum values, business logic, and logging patterns — to infer *what a UI would need to display*. This is the inverse of typical design system extraction, which usually starts from a running UI.

---

## Step 1: Understand the Domain

### Prompt used:
> "Explore the repository at /Users/anon2468/_repos/sample-app-auto-reconnaissance to understand: 1. What kind of application this is, 2. What UI framework/library is used, 3. How to run the dev server, 4. What components exist and where they live, 5. Overall folder/file structure."

### What I found:
- Pure Python, no frontend
- Three processes: `auto-reconnaissance/main.py`, `simulated_asset/asset.py`, `simulated_track/track.py`
- SDK imports: `anduril.Entity`, `anduril.MilView`, `anduril.Ontology`, `anduril.Provenance`, `anduril.TaskStatus`

### Decision:
Build a UI from scratch based on what the code *knows about*, not from an existing interface. The data model IS the design spec.

---

## Step 2: Extract the Data Model

I read every Python source file and catalogued every field, every enum, and every state the system tracks.

### Prompt used:
> "Read all Python source files and catalog: entity fields, disposition enum values, ontology templates, task status values, and the system's state machine (what triggers a task, what cancels it)."

### Key findings:

**Entity fields** (from `asset.py`, `track.py`):
- `entity_id`, `aliases.name`, `is_live`, `expiry_time`
- `mil_view.disposition` (5 enum values), `mil_view.environment`
- `ontology.template` (TEMPLATE_ASSET / TEMPLATE_TRACK), `ontology.platform_type`
- `location.position.{lat, lng, alt_hae_meters}`, `location.speed_mps`
- `provenance.{data_type, integration_name, source_update_time}`

**Disposition enum** (from `arbiter.py`, `entity_handler.py`):
- `DISPOSITION_FRIENDLY`
- `DISPOSITION_ASSUMED_FRIENDLY`
- `DISPOSITION_SUSPICIOUS`
- `DISPOSITION_HOSTILE`
- `DISPOSITION_UNKNOWN`

**Task status enum** (from `asset.py`):
- `STATUS_EXECUTING`
- `STATUS_DONE_OK`
- `STATUS_DONE_NOT_OK`
- `STATUS_PENDING`

**System constants** (from `arbiter.py`, `asset.py`, `track.py`):
- `DISTANCE_THRESHOLD_MILES = 5` — proximity trigger
- `EXPIRY_OFFSET = 15` — entity TTL in seconds
- `REFRESH_INTERVAL = 5` — publish cadence in seconds
- `CACHE_CAPACITY = 150` — LRU cache size

**Log output** (from logger calls across all three files):
- `EARS` logger: arbitration messages
- `SIMASSET` logger: task execution responses
- `SIMTRACK` logger: entity publishing

### Decision:
Every logger, every enum value, every constant becomes a UI element. The system has 4 distinct task states, 5 disposition states, 2 ontology types — these map directly to badge variants.

---

## Step 3: Define the Component Inventory

### Prompt used:
> "Based on the data model extracted from the Python files, define a component inventory. Each component should map directly to a data type or state in the system. Props should mirror the Python field names where possible."

### Component decisions:

| Component | Why it exists |
|-----------|--------------|
| `DispositionBadge` | 5 `mil_view.disposition` enum values each need visual differentiation |
| `TemplateBadge` | `ontology.template` (ASSET vs TRACK) is the primary entity classification |
| `LiveBadge` | `is_live` is a boolean that changes entity behavior (expiry creates UI state) |
| `TaskStatusBadge` | 4 `status.status` values drive task lifecycle — must be scannable at a glance |
| `EntityRow` | One row per entity in a list — combines all entity fields |
| `TaskRow` | One row per task — combines status, assignee, target, description |
| `ProximityAlert` | The core system event: asset within `DISTANCE_THRESHOLD_MILES` of a non-friendly track |
| `MetricCard` | Summary counts: assets tracked, tracks tracked, active tasks, threshold config |
| `EntityPanel` | Scrollable entity list with filter (asset/track) |
| `TaskPanel` | Active task list mirroring Lattice's "Active Tasks" panel |
| `SystemLogEntry` | Single log line with logger name, level, timestamp, message |
| `SystemLog` | Scrollable log output mirroring EARS/SIMASSET terminal output |
| `DashboardLayout` | Full-page layout: header + metrics row + 3-panel grid |

---

## Step 4: Define Design Tokens

### Prompt used:
> "The application is a defense/ISR system. Define a dark-mode token set appropriate for tactical dashboards: colors, typography, spacing. Map the disposition and status enum values to semantic color tokens."

### Token decisions:

**Background layers** (4 depths, dark-to-lighter):
```
--color-canvas:   #08090C  (outermost, map-like darkness)
--color-panel:    #111419  (sidebar panels)
--color-card:     #1A1D23  (content cards, entity rows)
--color-elevated: #22262E  (hover states, tooltips)
```

**Semantic color mapping:**
```
DISPOSITION_FRIENDLY        → --color-friendly:  #3DDC84  (green = safe)
DISPOSITION_ASSUMED_FRIENDLY→ --color-assumed:   #22C5D4  (teal = mostly safe)
DISPOSITION_SUSPICIOUS      → --color-suspicious: #F5A623  (amber = caution)
DISPOSITION_HOSTILE         → --color-hostile:    #F04040  (red = danger)
DISPOSITION_UNKNOWN         → --color-unknown:    #7B8494  (gray = no data)
STATUS_EXECUTING            → reuses friendly green (active = positive)
STATUS_DONE_OK              → reuses assumed teal
STATUS_DONE_NOT_OK          → reuses hostile red
STATUS_PENDING              → reuses unknown gray
```

**Typography:** Geist Sans (already in Next.js scaffold) — clean, geometric, appropriate for data density.

**Tailwind v4 approach:** All tokens defined in `@theme` block in `globals.css`. No `tailwind.config.ts` needed. Classes generated automatically: `bg-canvas`, `text-ink`, `border-border`, `bg-suspicious/10`, etc.

---

## Step 5: Scaffold the Component Library

### Prompt used:
> "Scaffold a Next.js 16 + TypeScript + Tailwind v4 project at /Users/anon2468/_repos/lattice-design-system. Install class-variance-authority, clsx, tailwind-merge for component composition. Install @figma/code-connect as a dev dependency. Initialize Storybook."

### Commands run:
```bash
npx create-next-app@latest lattice-design-system \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes

npm install class-variance-authority clsx tailwind-merge lucide-react
npm install --save-dev @figma/code-connect
npx storybook@latest init --yes
```

### Tech stack outcome:
- **Next.js 16** + **Tailwind v4** (CSS-only config)
- **Storybook 10** with `@storybook/nextjs-vite` (auto-detected framework)
- **`@figma/code-connect` v1.4.8**
- **TypeScript** throughout with strict types mirroring Python models

---

## Step 6: Build Components

### Prompt used:
> "Build all 13 components in components/lattice/. Types in lib/types.ts mirror the Python data model exactly. Token classes use Tailwind v4 theme utilities. Each component's props must match the Figma variant names we'll create so Code Connect mapping is 1:1."

### Key implementation choices:

**`cva` not used** — the components are simple enough that straightforward `cn()` + ternary logic is cleaner than defining variant schemas.

**Prop naming** — props use the same casing and naming as the Python fields where possible (`disposition`, `is_live`, `status`), except for React conventions (`isLive` instead of `is_live`).

**TypeScript `satisfies`** — used in stories and Code Connect files to ensure mock objects match the `Entity` and `Task` interfaces without losing type inference.

**`line-clamp-2`** on task descriptions — `description` field from Python can be long ("Asset X tasked to perform ISR on Track Y"), so we clip it.

---

## Step 7: Build the Dashboard Page

The `app/page.tsx` renders a static dashboard using `lib/mock-data.ts`. Mock data is constructed to represent the exact scenario documented in the original repo's README:
- 2 assets (asset-01 at 1°, 1°; asset-02 at 1.01°, 1.01°)
- 1 track (at 1.03°, 1.03° — ~2.93 miles from asset-01)
- 1 executing Investigate task (asset-01 → track)
- Proximity alert showing 2.93 mi distance
- System log with the exact `INFO:EARS:` lines from the Python logger

---

## Step 8: Programmatically Create Figma Components (Plugin)

### Why a plugin, not the REST API

The Figma REST API is read-only. It exposes file structure, node metadata, and assets, but it cannot create or modify design nodes. There is no `POST /nodes` endpoint — the REST layer is strictly a reader.

The only programmatic way to write into a Figma file is the **Figma Plugin API**, which runs a JavaScript sandbox inside the Figma desktop app. Plugins can create frames, components, variant sets, text layers, and apply styles in bulk.

### How to run the plugin

1. Open **Figma Desktop** → Plugins → Development → **Import plugin from manifest**
2. Select `figma-plugin/manifest.json` from this repo
3. Open the Lattice Design System file and navigate to the **Components** page
4. Run the plugin — it creates all 13 components in ~2 seconds and zooms to fit

### What the plugin creates

The plugin (`figma-plugin/code.js`) places all 13 components in a 4-row grid:
- **Row 1 (Atoms):** DispositionBadge, TemplateBadge, LiveBadge, TaskStatusBadge
- **Row 2 (Molecules):** EntityRow, TaskRow, ProximityAlert, MetricCard
- **Row 3 (Organisms):** EntityPanel, SystemLogEntry, SystemLog (TaskPanel at end of row 2)
- **Row 4 (Template):** DashboardLayout (full 1440×900)

Every component set uses the exact variant property names that the Code Connect files in `figma/` expect — `figma.enum("Disposition", ...)`, `figma.string("Logger")`, etc. — so no manual renaming is needed before publishing.

---

## Step 9: Build the Figma Design System Tokens

### Recommended Figma file structure:

**Page 1: Cover** (already exists)

**Page 2: Components** (created by plugin)

**Add Page: Tokens**
- Color styles for all `--color-*` variables
- Text styles for each typography use case
- Define Figma Variables for every token (not just styles)

### Critical naming rule:
Every Figma variant property name and value must **exactly match** what's in the Code Connect `figma.enum()` calls. For example:
- Figma property name: `"Disposition"` → Code Connect: `figma.enum("Disposition", ...)`
- Figma variant value: `"Suspicious"` → Code Connect maps to: `"DISPOSITION_SUSPICIOUS"`

---

## Step 10: Set Up Figma Code Connect

### After publishing the Figma file:

1. Get your Figma access token from **Account settings → Personal access tokens**
2. For each component in `figma/*.figma.tsx`:
   - Open the Figma file
   - Select the matching component in the canvas
   - Right-click → **Copy link to selection**
   - Replace `FIGMA_NODE_URL_PLACEHOLDER` with that URL
3. Run a dry-run to verify all connections:
   ```bash
   npx figma connect publish --token <YOUR_FIGMA_TOKEN> --dry-run
   ```
4. Publish:
   ```bash
   npx figma connect publish --token <YOUR_FIGMA_TOKEN>
   ```

### What Code Connect does:
When a designer selects a `DispositionBadge` in Figma and looks at the Dev panel, they see the exact React code snippet to render that component with the correct props — e.g., `<DispositionBadge disposition="DISPOSITION_SUSPICIOUS" />`. This closes the gap between design and engineering handoff.

---

## Step 11: Push to GitHub

```bash
cd /Users/anon2468/_repos/mini-lattice-design-system
gh repo create mini-lattice-design-system --public --source . --push
```

---

## Running the Project

```bash
# Dashboard (http://localhost:3000)
npm run dev

# Storybook component explorer (http://localhost:6006)
npm run storybook

# TypeScript check
npx tsc --noEmit

# Code Connect dry run (after filling in Figma node URLs)
npx figma connect publish --token <TOKEN> --dry-run
```

---

## Outcome

This project demonstrates the full loop:

1. **Read production code** → extract domain model (data types, enums, state machines, constants)
2. **Derive component inventory** from what the system knows about, not from what it renders
3. **Define design tokens** semantically (disposition → color, not just hex → class)
4. **Build a component library** that mirrors the domain model in React
5. **Document it in Figma** with matching variant names for Code Connect
6. **Close the loop** with Code Connect: every Figma component shows real, runnable code

The design system is not decorative — it IS the application domain, expressed as components.

---

## File Structure Reference

```
lattice-design-system/
├── app/
│   ├── page.tsx              # EARS dashboard with mock data
│   └── layout.tsx
├── components/lattice/       # 13 domain-driven components
│   ├── DispositionBadge.tsx
│   ├── TemplateBadge.tsx
│   ├── LiveBadge.tsx
│   ├── TaskStatusBadge.tsx
│   ├── EntityRow.tsx
│   ├── TaskRow.tsx
│   ├── ProximityAlert.tsx
│   ├── MetricCard.tsx
│   ├── EntityPanel.tsx
│   ├── TaskPanel.tsx
│   ├── SystemLogEntry.tsx
│   ├── SystemLog.tsx
│   ├── DashboardLayout.tsx
│   └── index.ts
├── lib/
│   ├── types.ts              # TypeScript interfaces mirroring Python models
│   ├── tokens.ts             # Color/label maps for disposition and status enums
│   └── mock-data.ts          # Static mock data for dashboard + stories
├── stories/                  # Storybook: one .stories.tsx per component
├── figma/                    # Code Connect: one .figma.tsx per component
│   └── *.figma.tsx           # Replace FIGMA_NODE_URL_PLACEHOLDER in each file
├── styles/globals.css        # Tailwind v4 @theme tokens
├── .storybook/
│   ├── main.ts
│   └── preview.tsx           # Imports globals.css, sets dark background defaults
└── PROCESS.md                # This file
```
