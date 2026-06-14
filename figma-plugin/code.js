// Lattice DS Builder — Figma Plugin
// Creates all 13 components on the "Components" page with exact property
// names matching the Code Connect files in figma/*.figma.tsx
//
// How to run:
//   Figma Desktop → Plugins → Development → Import plugin from manifest
//   Select this folder's manifest.json, then run the plugin.

(async () => {

// ── Colours (mirror app/globals.css @theme tokens) ───────────────────────────
const hex = h => ({
  r: parseInt(h.slice(1,3),16)/255,
  g: parseInt(h.slice(3,5),16)/255,
  b: parseInt(h.slice(5,7),16)/255,
});
const C = {
  canvas:     hex('#08090C'),
  panel:      hex('#111419'),
  card:       hex('#1A1D23'),
  elevated:   hex('#22262E'),
  border:     hex('#2A2E38'),
  ink:        hex('#E8EAF0'),
  dim:        hex('#7B8494'),
  ghost:      hex('#4D5568'),
  friendly:   hex('#3DDC84'),
  assumed:    hex('#22C5D4'),
  suspicious: hex('#F5A623'),
  hostile:    hex('#F04040'),
  unknown:    hex('#7B8494'),
  accent:     hex('#F5A623'),
  executing:  hex('#3DDC84'),
  doneOk:     hex('#22C5D4'),
  doneNotOk:  hex('#F04040'),
  pending:    hex('#7B8494'),
};

// ── Font loading ──────────────────────────────────────────────────────────────
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

// Try monospace; fall back to Inter if unavailable in this Figma environment
let MONO = { family: 'Roboto Mono', style: 'Regular' };
try { await figma.loadFontAsync(MONO); } catch (_) { MONO = { family: 'Inter', style: 'Regular' }; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const solid  = (c, o=1) => [{ type:'SOLID', color:c, opacity:o }];
const stroke = (c, o=1) => [{ type:'SOLID', color:c, opacity:o }];

function al(node, {
  dir='HORIZONTAL', gap=6,
  pl=8, pr=8, pt=5, pb=5,
  mainAlign='MIN', crossAlign='CENTER',
  mainSizing='AUTO', crossSizing='AUTO',
} = {}) {
  node.layoutMode = dir;
  node.primaryAxisSizingMode  = mainSizing;
  node.counterAxisSizingMode  = crossSizing;
  node.itemSpacing  = gap;
  node.paddingLeft  = pl;  node.paddingRight  = pr;
  node.paddingTop   = pt;  node.paddingBottom = pb;
  node.primaryAxisAlignItems = mainAlign;
  node.counterAxisAlignItems = crossAlign;
}

function txt(chars, {
  family=  'Inter', style='Regular',
  size=12, color=C.ink, name, grow=false,
} = {}) {
  const t = figma.createText();
  t.fontName   = { family, style };
  t.characters = String(chars);
  t.fontSize   = size;
  t.fills      = solid(color);
  if (name) t.name = name;
  if (grow) t.layoutGrow = 1;
  return t;
}

function dot(color, size=6) {
  const e = figma.createEllipse();
  e.name = 'dot';
  e.resize(size, size);
  e.fills = solid(color);
  return e;
}

// Component with auto-layout
function comp(name, opts={}) {
  const c = figma.createComponent();
  c.name = name;
  al(c, opts);
  c.cornerRadius = opts.radius ?? 4;
  c.fills = opts.bg !== undefined ? (opts.bg ? solid(opts.bg) : []) : solid(C.card);
  return c;
}

// Frame with auto-layout (for sub-rows inside components)
function frame(opts={}) {
  const f = figma.createFrame();
  if (opts.name) f.name = opts.name;
  al(f, opts);
  f.cornerRadius = opts.radius ?? 0;
  f.fills = opts.bg ? solid(opts.bg) : [];
  if (opts.clip) f.clipsContent = true;
  return f;
}

// Finalise a component set after combineAsVariants
function styleSet(set, spacing=12) {
  set.fills = solid(C.elevated);
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 20;
  set.itemSpacing = spacing;
}

// ── Page ──────────────────────────────────────────────────────────────────────
const page = figma.root.children.find(p => p.name === 'Components');
if (!page) { figma.closePlugin("Error: no page named 'Components' found."); return; }
figma.currentPage = page;

let X = 100, Y = 100;
const GAP_X = 48, GAP_ROW = 80;

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 1 — Atoms (badges)
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. DispositionBadge ───────────────────────────────────────────────────────
// Code Connect: figma.enum("Disposition", { Friendly, "Assumed Friendly", Suspicious, Hostile, Unknown })
{
  const defs = [
    { v:'Friendly',         c:C.friendly   },
    { v:'Assumed Friendly', c:C.assumed    },
    { v:'Suspicious',       c:C.suspicious },
    { v:'Hostile',          c:C.hostile    },
    { v:'Unknown',          c:C.unknown    },
  ];
  const variants = defs.map(({v, c:col}) => {
    const k = comp(`Disposition=${v}`, { pl:10, pr:10, pt:5, pb:5, gap:6 });
    k.fills = [{ type:'SOLID', color:C.card }, { type:'SOLID', color:col, opacity:0.12 }];
    k.appendChild(dot(col));
    k.appendChild(txt(v, { size:12, name:'Label' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'DispositionBadge';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 2. TemplateBadge ──────────────────────────────────────────────────────────
// Code Connect: figma.enum("Template", { Asset, Track }) + figma.string("PlatformType")
{
  const defs = [
    { v:'Asset', col:C.assumed, label:'ASSET', platform:'USV' },
    { v:'Track', col:C.accent,  label:'TRACK', platform:null  },
  ];
  const variants = defs.map(({v, col, label, platform}) => {
    const k = comp(`Template=${v}`, { pl:8, pr:8, pt:4, pb:4, gap:6, bg:null });
    k.fills = [];
    k.strokes = stroke(col, 0.6);
    k.strokeWeight = 1;
    k.strokeAlign = 'INSIDE';
    k.appendChild(txt(label, { size:10, color:col, style:'Semi Bold', name:'Label' }));
    if (platform) k.appendChild(txt(platform, { size:10, color:C.dim, name:'PlatformType' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'TemplateBadge';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 3. LiveBadge ─────────────────────────────────────────────────────────────
// Code Connect: figma.boolean("IsLive") → variant "IsLive=True|False"
{
  const defs = [
    { v:'True',  col:C.friendly, label:'Live',    tc:C.ink },
    { v:'False', col:C.dim,      label:'Expired', tc:C.dim },
  ];
  const variants = defs.map(({v, col, label, tc}) => {
    const k = comp(`IsLive=${v}`, { pl:8, pr:8, pt:4, pb:4, gap:5 });
    k.appendChild(dot(col, 5));
    k.appendChild(txt(label, { size:11, color:tc, name:'Label' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'LiveBadge';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 4. TaskStatusBadge ────────────────────────────────────────────────────────
// Code Connect: figma.enum("Status", { Executing, Done, Failed, Pending })
{
  const defs = [
    { v:'Executing', col:C.executing  },
    { v:'Done',      col:C.doneOk    },
    { v:'Failed',    col:C.doneNotOk },
    { v:'Pending',   col:C.pending   },
  ];
  const variants = defs.map(({v, col}) => {
    const k = comp(`Status=${v}`, { pl:10, pr:10, pt:4, pb:4, gap:6 });
    k.fills = [{ type:'SOLID', color:C.card }, { type:'SOLID', color:col, opacity:0.15 }];
    k.appendChild(dot(col, 5));
    k.appendChild(txt(v, { size:11, name:'Label' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'TaskStatusBadge';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 2 — Molecules
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 200;

// ── 5. EntityRow ──────────────────────────────────────────────────────────────
// Code Connect: figma.string("Name") + nested badge instances
// Text layers: Name, EntityId, Template, Live, Disposition, Latitude, Longitude, DataType, UpdatedAt
{
  const k = figma.createComponent();
  k.name = 'EntityRow';
  al(k, { dir:'VERTICAL', gap:8, pl:12, pr:12, pt:12, pb:12, crossAlign:'MIN', mainSizing:'FIXED', crossSizing:'FIXED' });
  k.cornerRadius = 6;
  k.fills = solid(C.card);
  k.resize(280, 104);

  const nameRow = frame({ mainAlign:'SPACE_BETWEEN' });
  nameRow.layoutAlign = 'STRETCH';
  nameRow.appendChild(txt('Simulated Asset', { size:13, style:'Semi Bold', name:'Name' }));
  nameRow.appendChild(txt('asset-01', { size:11, color:C.dim, name:'EntityId' }));

  const badgeRow = frame({ gap:6 });
  badgeRow.appendChild(txt('ASSET',    { size:10, color:C.assumed,  name:'Template'    }));
  badgeRow.appendChild(txt('Live',     { size:10, color:C.friendly, name:'Live'        }));
  badgeRow.appendChild(txt('Friendly', { size:10, color:C.friendly, name:'Disposition' }));

  const metaRow = frame({ gap:12 });
  metaRow.appendChild(txt('1.0000°N',        { size:11, color:C.dim,   name:'Latitude'  }));
  metaRow.appendChild(txt('1.0000°E',        { size:11, color:C.dim,   name:'Longitude' }));
  metaRow.appendChild(txt('Simulated Asset', { size:11, color:C.dim,   name:'DataType'  }));
  metaRow.appendChild(txt('Just now',        { size:11, color:C.ghost, name:'UpdatedAt' }));

  k.appendChild(nameRow);
  k.appendChild(badgeRow);
  k.appendChild(metaRow);
  page.appendChild(k);
  k.x = X; k.y = Y; X += 280 + GAP_X;
}

// ── 6. TaskRow ────────────────────────────────────────────────────────────────
// Code Connect: figma.enum("Status", { Executing, Done, Failed, Pending })
// Text layers: StatusLabel, TaskName, TaskId, Assignee, Target, Description, Author
{
  const defs = [
    { v:'Executing', col:C.executing  },
    { v:'Done',      col:C.doneOk    },
    { v:'Failed',    col:C.doneNotOk },
    { v:'Pending',   col:C.pending   },
  ];
  const variants = defs.map(({v, col}) => {
    const k = figma.createComponent();
    k.name = `Status=${v}`;
    al(k, { dir:'VERTICAL', gap:5, pl:12, pr:12, pt:12, pb:12, crossAlign:'MIN', mainSizing:'FIXED', crossSizing:'FIXED' });
    k.cornerRadius = 6;
    k.fills = solid(C.card);
    k.resize(280, 96);

    const row1 = frame({ gap:8 });
    row1.appendChild(txt(v, { size:10, color:col, name:'StatusLabel' }));
    row1.appendChild(txt('Investigate', { size:12, style:'Semi Bold', name:'TaskName' }));
    row1.appendChild(txt('c7d8e9f0', { size:10, color:C.ghost, name:'TaskId' }));

    const row2 = frame({ gap:6 });
    row2.appendChild(txt('asset-01',  { size:11, color:C.dim,   name:'Assignee' }));
    row2.appendChild(txt('→',         { size:11, color:C.ghost  }));
    row2.appendChild(txt('track-abc', { size:11, color:C.dim,   name:'Target'   }));

    k.appendChild(row1);
    k.appendChild(row2);
    k.appendChild(txt('Asset tasked to perform ISR on Track', { size:11, color:C.dim,   name:'Description' }));
    k.appendChild(txt('auto-reconnaissance',                   { size:10, color:C.ghost, name:'Author'      }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'TaskRow';
  styleSet(set, 16);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 7. ProximityAlert ────────────────────────────────────────────────────────
// Code Connect: figma.boolean("WithinRange") → variant "WithinRange=True|False"
// Text layers: AlertLabel, AssetName, TrackName, Distance, Threshold
{
  const defs = [
    { v:'True',  alertCol:C.suspicious, dist:'2.93 mi', bgO:0.10 },
    { v:'False', alertCol:C.dim,        dist:'7.50 mi', bgO:0.05 },
  ];
  const variants = defs.map(({v, alertCol, dist, bgO}) => {
    const k = figma.createComponent();
    k.name = `WithinRange=${v}`;
    al(k, { dir:'VERTICAL', gap:4, pl:12, pr:12, pt:10, pb:10, crossAlign:'MIN', mainSizing:'FIXED', crossSizing:'FIXED' });
    k.cornerRadius = 6;
    k.fills  = [{ type:'SOLID', color:alertCol, opacity:bgO }];
    k.strokes = stroke(alertCol, 0.35);
    k.strokeWeight = 1;
    k.strokeAlign = 'INSIDE';
    k.resize(280, 88);

    k.appendChild(txt(v==='True' ? '⚠ PROXIMITY ALERT' : 'No Alert', { size:10, style:'Semi Bold', color:alertCol, name:'AlertLabel' }));

    const nameRow = frame({ gap:4 });
    nameRow.appendChild(txt('asset-01',  { size:12, name:'AssetName' }));
    nameRow.appendChild(txt('→',         { size:12, color:C.dim }));
    nameRow.appendChild(txt('track-abc', { size:12, name:'TrackName' }));
    k.appendChild(nameRow);

    k.appendChild(txt(dist,           { size:18, style:'Semi Bold', color:alertCol, name:'Distance'  }));
    k.appendChild(txt('Threshold: 5 mi', { size:10, color:C.dim,   name:'Threshold' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'ProximityAlert';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 8. MetricCard ────────────────────────────────────────────────────────────
// Code Connect: figma.boolean("Highlight") → variant "Highlight=True|False"
// Text layers: Label, Value, Sublabel
{
  const defs = [
    { v:'False', valCol:C.ink,   stroked:false },
    { v:'True',  valCol:C.accent, stroked:true  },
  ];
  const variants = defs.map(({v, valCol, stroked}) => {
    const k = figma.createComponent();
    k.name = `Highlight=${v}`;
    al(k, { dir:'VERTICAL', gap:2, pl:16, pr:16, pt:14, pb:14, crossAlign:'MIN', mainSizing:'FIXED', crossSizing:'FIXED' });
    k.cornerRadius = 6;
    k.fills = solid(C.card);
    k.resize(160, 84);
    if (stroked) { k.strokes = stroke(C.accent, 0.3); k.strokeWeight = 1; k.strokeAlign = 'INSIDE'; }
    k.appendChild(txt('Label',    { size:11, color:C.dim,   name:'Label'   }));
    k.appendChild(txt('42',       { size:24, style:'Semi Bold', color:valCol, name:'Value'  }));
    k.appendChild(txt('Sublabel', { size:10, color:C.ghost, name:'Sublabel' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'MetricCard';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 3 — Organisms
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 300;

// ── 9. EntityPanel ───────────────────────────────────────────────────────────
// Code Connect: figma.enum("Filter", { All, Assets, Tracks })
{
  const defs = [
    { v:'All',    label:'ENTITIES' },
    { v:'Assets', label:'ENTITIES — Assets' },
    { v:'Tracks', label:'ENTITIES — Tracks' },
  ];
  const variants = defs.map(({v, label}) => {
    const k = figma.createComponent();
    k.name = `Filter=${v}`;
    al(k, { dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, crossAlign:'MIN', mainSizing:'FIXED', crossSizing:'FIXED' });
    k.fills = solid(C.panel);
    k.resize(300, 480);
    k.clipsContent = true;

    const hdr = frame({ gap:8, pl:12, pr:12, pt:10, pb:10, bg:C.panel });
    hdr.resize(300, 40);
    hdr.primaryAxisSizingMode = 'FIXED';
    hdr.counterAxisSizingMode = 'FIXED';
    hdr.strokes = stroke(C.border);
    hdr.strokeAlign = 'OUTSIDE';
    hdr.strokeWeight = 1;
    hdr.appendChild(txt(label, { size:10, style:'Semi Bold', color:C.dim }));

    const body = frame({ dir:'VERTICAL', gap:4, pl:8, pr:8, pt:8, pb:8, bg:C.panel });
    body.resize(300, 440);
    body.primaryAxisSizingMode = 'FIXED';
    body.counterAxisSizingMode = 'FIXED';
    body.appendChild(txt('Entity rows render here', { size:11, color:C.ghost }));

    k.appendChild(hdr);
    k.appendChild(body);
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'EntityPanel';
  styleSet(set, 20);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 10. TaskPanel ─────────────────────────────────────────────────────────────
// Code Connect: no props (static list)
{
  const k = figma.createComponent();
  k.name = 'TaskPanel';
  al(k, { dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, crossAlign:'MIN', mainSizing:'FIXED', crossSizing:'FIXED' });
  k.fills = solid(C.panel);
  k.resize(300, 480);
  k.clipsContent = true;

  const hdr = frame({ gap:8, pl:12, pr:12, pt:10, pb:10, bg:C.panel });
  hdr.resize(300, 40);
  hdr.primaryAxisSizingMode = 'FIXED';
  hdr.counterAxisSizingMode = 'FIXED';
  hdr.strokes = stroke(C.border); hdr.strokeAlign = 'OUTSIDE'; hdr.strokeWeight = 1;
  hdr.appendChild(txt('ACTIVE TASKS', { size:10, style:'Semi Bold', color:C.dim }));

  const body = frame({ dir:'VERTICAL', gap:4, pl:8, pr:8, pt:8, pb:8, bg:C.panel });
  body.resize(300, 440);
  body.primaryAxisSizingMode = 'FIXED';
  body.counterAxisSizingMode = 'FIXED';
  body.appendChild(txt('Task rows render here', { size:11, color:C.ghost }));

  k.appendChild(hdr);
  k.appendChild(body);
  page.appendChild(k);
  k.x = X; k.y = Y; X += 300 + GAP_X;
}

// ── 11. SystemLogEntry ────────────────────────────────────────────────────────
// Code Connect: figma.enum("Level", { INFO, WARN, ERROR }) + figma.string("Logger")
// Text layers: Timestamp, LevelInitial, Logger, Message
{
  const levelDefs = [
    { level:'INFO',  col:C.ink,        letter:'I' },
    { level:'WARN',  col:C.suspicious, letter:'W' },
    { level:'ERROR', col:C.hostile,    letter:'E' },
  ];
  const loggerDefs = [
    { logger:'EARS',     col:C.assumed  },
    { logger:'SIMASSET', col:C.friendly },
    { logger:'SIMTRACK', col:C.accent   },
  ];
  const variants = [];
  for (const {level, col:lc, letter} of levelDefs) {
    for (const {logger, col:logCol} of loggerDefs) {
      const k = figma.createComponent();
      k.name = `Level=${level}, Logger=${logger}`;
      al(k, { gap:10, pl:12, pr:12, pt:6, pb:6, mainSizing:'FIXED', crossSizing:'AUTO' });
      k.fills = solid(C.card);
      k.resize(560, 28);
      k.appendChild(txt('12:34:56.789', { size:11, color:C.ghost, name:'Timestamp',    family:MONO.family, style:MONO.style }));
      k.appendChild(txt(letter,         { size:11, color:lc,      name:'LevelInitial', family:MONO.family, style:MONO.style }));
      k.appendChild(txt(logger,         { size:11, color:logCol,  name:'Logger',       family:MONO.family, style:MONO.style }));
      k.appendChild(txt('Entity published successfully', { size:11, color:C.ink, name:'Message', family:MONO.family, style:MONO.style, grow:true }));
      page.appendChild(k);
      variants.push(k);
    }
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = 'SystemLogEntry';
  styleSet(set, 4);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 12. SystemLog ─────────────────────────────────────────────────────────────
// Code Connect: no props (static list)
{
  const k = figma.createComponent();
  k.name = 'SystemLog';
  al(k, { dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, crossAlign:'MIN', mainSizing:'FIXED', crossSizing:'FIXED' });
  k.fills = solid(C.panel);
  k.resize(620, 480);
  k.clipsContent = true;

  const hdr = frame({ gap:8, pl:12, pr:12, pt:10, pb:10, bg:C.panel });
  hdr.resize(620, 40);
  hdr.primaryAxisSizingMode = 'FIXED';
  hdr.counterAxisSizingMode = 'FIXED';
  hdr.strokes = stroke(C.border); hdr.strokeAlign = 'OUTSIDE'; hdr.strokeWeight = 1;
  hdr.appendChild(txt('SYSTEM LOG', { size:10, style:'Semi Bold', color:C.dim }));

  const body = frame({ dir:'VERTICAL', gap:0, pl:0, pr:0, pt:4, pb:4, bg:C.canvas });
  body.resize(620, 440);
  body.primaryAxisSizingMode = 'FIXED';
  body.counterAxisSizingMode = 'FIXED';
  body.appendChild(txt('Log entries render here', { size:11, color:C.ghost, family:MONO.family, style:MONO.style }));

  k.appendChild(hdr);
  k.appendChild(body);
  page.appendChild(k);
  k.x = X; k.y = Y; X += 620 + GAP_X;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 4 — Template
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 620;

// ── 13. DashboardLayout ──────────────────────────────────────────────────────
// Code Connect: no props (full-page template)
{
  const k = figma.createComponent();
  k.name = 'DashboardLayout';
  al(k, { dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, crossAlign:'MIN', mainSizing:'FIXED', crossSizing:'FIXED' });
  k.fills = solid(C.canvas);
  k.resize(1440, 900);
  k.clipsContent = true;

  // Header bar (48px)
  const hdrBar = frame({ gap:12, pl:16, pr:16, pt:0, pb:0, bg:C.panel, mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER' });
  hdrBar.resize(1440, 48);
  hdrBar.primaryAxisSizingMode = 'FIXED';
  hdrBar.counterAxisSizingMode = 'FIXED';
  hdrBar.strokes = stroke(C.border); hdrBar.strokeAlign = 'OUTSIDE'; hdrBar.strokeWeight = 1;
  hdrBar.appendChild(txt('EARS — Entity Auto Reconnaissance System', { size:13, style:'Semi Bold' }));

  const livePill = frame({ gap:5, pl:8, pr:8, pt:4, pb:4, bg:C.card, radius:4 });
  livePill.appendChild(dot(C.friendly, 5));
  livePill.appendChild(txt('Live', { size:11, color:C.friendly }));
  hdrBar.appendChild(livePill);

  // Metrics strip (80px)
  const metrics = frame({ gap:12, pl:16, pr:16, pt:12, pb:12, bg:C.panel, crossAlign:'CENTER', name:'metrics' });
  metrics.resize(1440, 80);
  metrics.primaryAxisSizingMode = 'FIXED';
  metrics.counterAxisSizingMode = 'FIXED';
  const metDefs = [
    { label:'Assets',             value:'2',    sub:'TEMPLATE_ASSET'   },
    { label:'Tracks',             value:'1',    sub:'TEMPLATE_TRACK'   },
    { label:'Active Tasks',       value:'1',    sub:'STATUS_EXECUTING' },
    { label:'Distance Threshold', value:'5 mi', sub:'Proximity trigger' },
  ];
  for (const {label, value, sub} of metDefs) {
    const card = frame({ dir:'VERTICAL', gap:2, pl:16, pr:16, pt:10, pb:10, bg:C.card, radius:6, crossAlign:'MIN' });
    card.resize(336, 56);
    card.primaryAxisSizingMode = 'FIXED';
    card.counterAxisSizingMode = 'FIXED';
    card.appendChild(txt(label, { size:10, color:C.dim   }));
    card.appendChild(txt(value, { size:20, style:'Semi Bold' }));
    card.appendChild(txt(sub,   { size:9,  color:C.ghost }));
    metrics.appendChild(card);
  }

  // 3-column main area (772px)
  const mainArea = frame({ bg:C.canvas, name:'main' });
  mainArea.resize(1440, 772);
  mainArea.primaryAxisSizingMode = 'FIXED';
  mainArea.counterAxisSizingMode = 'FIXED';

  const leftCol = frame({ dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, bg:C.panel, name:'EntityPanel' });
  leftCol.resize(300, 772);
  leftCol.primaryAxisSizingMode = 'FIXED';
  leftCol.counterAxisSizingMode = 'FIXED';
  leftCol.appendChild(txt('EntityPanel', { size:11, color:C.dim }));

  const centerCol = frame({ dir:'VERTICAL', gap:12, pl:12, pr:12, pt:12, pb:12, bg:C.canvas, name:'center' });
  centerCol.resize(840, 772);
  centerCol.primaryAxisSizingMode = 'FIXED';
  centerCol.counterAxisSizingMode = 'FIXED';
  centerCol.appendChild(txt('ProximityAlert + SystemLog', { size:11, color:C.dim }));

  const rightCol = frame({ dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, bg:C.panel, name:'TaskPanel' });
  rightCol.resize(300, 772);
  rightCol.primaryAxisSizingMode = 'FIXED';
  rightCol.counterAxisSizingMode = 'FIXED';
  rightCol.appendChild(txt('TaskPanel', { size:11, color:C.dim }));

  mainArea.appendChild(leftCol);
  mainArea.appendChild(centerCol);
  mainArea.appendChild(rightCol);

  k.appendChild(hdrBar);
  k.appendChild(metrics);
  k.appendChild(mainArea);
  page.appendChild(k);
  k.x = X; k.y = Y;
}

// ── Zoom to fit ───────────────────────────────────────────────────────────────
figma.viewport.scrollAndZoomIntoView(page.children);
figma.closePlugin('✓ 13 components created on the Components page.');

})();
