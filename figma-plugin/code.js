// Lattice DS Builder — Figma Plugin
// Creates all 13 components on the "Components" page with exact property
// names matching the Code Connect files in figma/*.figma.tsx
//
// How to run:
//   Figma Desktop → Plugins → Development → Import plugin from manifest
//   Select this folder's manifest.json, then run the plugin.
//
// Sizing conventions used throughout:
//   Atoms    — HORIZONTAL, hug both axes (AUTO/AUTO)
//   Molecules — VERTICAL, hug height (AUTO), fixed width (FIXED)
//   Organisms — VERTICAL, fixed height + fixed width; children use layoutAlign
//               STRETCH + layoutGrow=1 so Figma reports fill/stretch correctly
//   Template  — same as organisms at 1440×900

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

let MONO = { family: 'Roboto Mono', style: 'Regular' };
try { await figma.loadFontAsync(MONO); } catch (_) { MONO = { family: 'Inter', style: 'Regular' }; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const solid  = (c, o) => [{ type:'SOLID', color:c, opacity: o !== undefined ? o : 1 }];
const strk   = (c, o) => [{ type:'SOLID', color:c, opacity: o !== undefined ? o : 1 }];

// Apply auto-layout properties to any node
function al(node, {
  dir        = 'HORIZONTAL',
  gap        = 6,
  pl = 8, pr = 8, pt = 5, pb = 5,
  mainAlign  = 'MIN',
  crossAlign = 'CENTER',
  mainSizing = 'AUTO',  // 'AUTO' = hug content, 'FIXED' = fixed size
  crossSizing= 'AUTO',
} = {}) {
  node.layoutMode              = dir;
  node.primaryAxisSizingMode   = mainSizing;
  node.counterAxisSizingMode   = crossSizing;
  node.itemSpacing             = gap;
  node.paddingLeft  = pl;  node.paddingRight  = pr;
  node.paddingTop   = pt;  node.paddingBottom = pb;
  node.primaryAxisAlignItems   = mainAlign;
  node.counterAxisAlignItems   = crossAlign;
}

// Text node helper
function txt(chars, {
  family = 'Inter', style = 'Regular',
  size   = 12,      color = C.ink,
  name, grow = false,
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

function dot(color, size) {
  size = size !== undefined ? size : 6;
  const e = figma.createEllipse();
  e.name = 'dot';
  e.resize(size, size);
  e.fills = solid(color);
  return e;
}

// Component node with auto-layout — atoms default to hug/hug
function comp(name, opts) {
  opts = opts || {};
  const c = figma.createComponent();
  c.name = name;
  al(c, opts);
  c.cornerRadius = opts.radius !== undefined ? opts.radius : 4;
  c.fills = opts.bg !== undefined ? (opts.bg ? solid(opts.bg) : []) : solid(C.card);
  return c;
}

// Frame node with auto-layout
function frame(opts) {
  opts = opts || {};
  const f = figma.createFrame();
  if (opts.name) f.name = opts.name;
  al(f, opts);
  f.cornerRadius = opts.radius !== undefined ? opts.radius : 0;
  f.fills = opts.bg ? solid(opts.bg) : [];
  if (opts.clip) f.clipsContent = true;
  return f;
}

// ── Helper: make a sub-row that fills its parent's cross-axis width
// Used for rows inside vertical components so Figma reports "Fill container"
function stretchRow(opts) {
  opts = opts || {};
  const f = frame(opts);
  f.layoutAlign = 'STRETCH'; // fills parent width (counter axis for VERTICAL parent)
  return f;
}

// ── Helper: make a body frame that fills width AND remaining height
function stretchGrowBody(opts) {
  opts = opts || {};
  const f = frame(opts);
  f.layoutAlign = 'STRETCH'; // fill width
  f.layoutGrow  = 1;         // fill remaining height
  return f;
}

// Finalise a component set — auto layout + padding so variants are spaced
function styleSet(set, spacing) {
  spacing = spacing !== undefined ? spacing : 12;
  set.layoutMode             = 'HORIZONTAL';
  set.layoutWrap             = 'WRAP';
  set.primaryAxisSizingMode  = 'AUTO';
  set.counterAxisSizingMode  = 'AUTO';
  set.itemSpacing            = spacing;
  set.counterAxisSpacing     = spacing;
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 20;
  set.fills        = solid(C.elevated);
  set.cornerRadius = 8;
}

// ── Page ──────────────────────────────────────────────────────────────────────
const page = figma.root.children.find(function(p) { return p.name === 'Components'; });
if (!page) { figma.closePlugin("Error: no page named 'Components' found."); return; }
figma.currentPage = page;

let X = 100, Y = 100;
const GAP_X = 48;

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 1 — Atoms (badges): HORIZONTAL, hug both axes
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. DispositionBadge ───────────────────────────────────────────────────────
{
  const defs = [
    { v:'Friendly',         c:C.friendly   },
    { v:'Assumed Friendly', c:C.assumed    },
    { v:'Suspicious',       c:C.suspicious },
    { v:'Hostile',          c:C.hostile    },
    { v:'Unknown',          c:C.unknown    },
  ];
  const variants = defs.map(function(d) {
    var v = d.v, col = d.c;
    const k = comp('Disposition=' + v, { pl:10, pr:10, pt:5, pb:5, gap:6 });
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
{
  const defs = [
    { v:'Asset', col:C.assumed, label:'ASSET', platform:'USV' },
    { v:'Track', col:C.accent,  label:'TRACK', platform:null  },
  ];
  const variants = defs.map(function(d) {
    var v = d.v, col = d.col, label = d.label, platform = d.platform;
    const k = comp('Template=' + v, { pl:8, pr:8, pt:4, pb:4, gap:6, bg:null });
    k.fills = [];
    k.strokes = strk(col, 0.6);
    k.strokeWeight = 1;
    k.strokeAlign  = 'INSIDE';
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
{
  const defs = [
    { v:'True',  col:C.friendly, label:'Live',    tc:C.ink },
    { v:'False', col:C.dim,      label:'Expired', tc:C.dim },
  ];
  const variants = defs.map(function(d) {
    const k = comp('IsLive=' + d.v, { pl:8, pr:8, pt:4, pb:4, gap:5 });
    k.appendChild(dot(d.col, 5));
    k.appendChild(txt(d.label, { size:11, color:d.tc, name:'Label' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'LiveBadge';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 4. TaskStatusBadge ────────────────────────────────────────────────────────
{
  const defs = [
    { v:'Executing', col:C.executing  },
    { v:'Done',      col:C.doneOk    },
    { v:'Failed',    col:C.doneNotOk },
    { v:'Pending',   col:C.pending   },
  ];
  const variants = defs.map(function(d) {
    const k = comp('Status=' + d.v, { pl:10, pr:10, pt:4, pb:4, gap:6 });
    k.fills = [{ type:'SOLID', color:C.card }, { type:'SOLID', color:d.col, opacity:0.15 }];
    k.appendChild(dot(d.col, 5));
    k.appendChild(txt(d.v, { size:11, name:'Label' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'TaskStatusBadge';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 2 — Molecules: VERTICAL, hug height (AUTO), fixed width (FIXED)
//          Sub-rows use layoutAlign=STRETCH so width fills and Figma reports
//          "Fill container" in dev inspect rather than a hard-coded value.
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 200;

// ── 5. EntityRow ──────────────────────────────────────────────────────────────
{
  const k = figma.createComponent();
  k.name = 'EntityRow';
  // VERTICAL: primary=height (AUTO/hug), counter=width (FIXED at 280)
  al(k, { dir:'VERTICAL', gap:8, pl:12, pr:12, pt:12, pb:12, crossAlign:'MIN',
          mainSizing:'AUTO', crossSizing:'FIXED' });
  k.cornerRadius = 6;
  k.fills = solid(C.card);
  k.resize(280, 10); // width locked; height hugs children

  // Name + ID row — stretches to fill component width
  const nameRow = stretchRow({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', gap:8 });
  nameRow.appendChild(txt('Simulated Asset', { size:13, style:'Semi Bold', name:'Name' }));
  nameRow.appendChild(txt('asset-01', { size:11, color:C.dim, name:'EntityId' }));

  // Badge row — hugs its content
  const badgeRow = frame({ gap:6 });
  badgeRow.appendChild(txt('ASSET',    { size:10, color:C.assumed,  name:'Template'    }));
  badgeRow.appendChild(txt('Live',     { size:10, color:C.friendly, name:'Live'        }));
  badgeRow.appendChild(txt('Friendly', { size:10, color:C.friendly, name:'Disposition' }));

  // Meta row — hugs its content
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
{
  const defs = [
    { v:'Executing', col:C.executing  },
    { v:'Done',      col:C.doneOk    },
    { v:'Failed',    col:C.doneNotOk },
    { v:'Pending',   col:C.pending   },
  ];
  const variants = defs.map(function(d) {
    var v = d.v, col = d.col;
    const k = figma.createComponent();
    k.name = 'Status=' + v;
    al(k, { dir:'VERTICAL', gap:5, pl:12, pr:12, pt:12, pb:12, crossAlign:'MIN',
            mainSizing:'AUTO', crossSizing:'FIXED' });
    k.cornerRadius = 6;
    k.fills = solid(C.card);
    k.resize(280, 10); // width locked; height hugs children

    // Status + name row — stretches to fill width
    const row1 = stretchRow({ gap:8, crossAlign:'CENTER' });
    row1.appendChild(txt(v,             { size:10, color:col,     name:'StatusLabel' }));
    row1.appendChild(txt('Investigate', { size:12, style:'Semi Bold', name:'TaskName' }));
    row1.appendChild(txt('c7d8e9f0',    { size:10, color:C.ghost, name:'TaskId'      }));

    // Assignee → target row — hugs content
    const row2 = frame({ gap:6, crossAlign:'CENTER' });
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
{
  const defs = [
    { v:'True',  alertCol:C.suspicious, dist:'2.93 mi', bgO:0.10 },
    { v:'False', alertCol:C.dim,        dist:'7.50 mi', bgO:0.05 },
  ];
  const variants = defs.map(function(d) {
    var v = d.v, alertCol = d.alertCol, dist = d.dist, bgO = d.bgO;
    const k = figma.createComponent();
    k.name = 'WithinRange=' + v;
    al(k, { dir:'VERTICAL', gap:4, pl:12, pr:12, pt:10, pb:10, crossAlign:'MIN',
            mainSizing:'AUTO', crossSizing:'FIXED' });
    k.cornerRadius = 6;
    k.fills  = [{ type:'SOLID', color:alertCol, opacity:bgO }];
    k.strokes = strk(alertCol, 0.35);
    k.strokeWeight = 1;
    k.strokeAlign  = 'INSIDE';
    k.resize(280, 10); // width locked; height hugs

    k.appendChild(txt(v === 'True' ? '⚠ PROXIMITY ALERT' : 'No Alert',
                       { size:10, style:'Semi Bold', color:alertCol, name:'AlertLabel' }));

    const nameRow = frame({ gap:4, crossAlign:'CENTER' });
    nameRow.appendChild(txt('asset-01',  { size:12, name:'AssetName' }));
    nameRow.appendChild(txt('→',         { size:12, color:C.dim }));
    nameRow.appendChild(txt('track-abc', { size:12, name:'TrackName' }));
    k.appendChild(nameRow);

    k.appendChild(txt(dist,              { size:18, style:'Semi Bold', color:alertCol, name:'Distance'  }));
    k.appendChild(txt('Threshold: 5 mi', { size:10, color:C.dim,                       name:'Threshold' }));
    page.appendChild(k);
    return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'ProximityAlert';
  styleSet(set);
  set.x = X; set.y = Y; X += set.width + GAP_X;
}

// ── 8. MetricCard ────────────────────────────────────────────────────────────
{
  const defs = [
    { v:'False', valCol:C.ink,    stroked:false },
    { v:'True',  valCol:C.accent, stroked:true  },
  ];
  const variants = defs.map(function(d) {
    var v = d.v, valCol = d.valCol, stroked = d.stroked;
    const k = figma.createComponent();
    k.name = 'Highlight=' + v;
    al(k, { dir:'VERTICAL', gap:2, pl:16, pr:16, pt:14, pb:14, crossAlign:'MIN',
            mainSizing:'AUTO', crossSizing:'FIXED' });
    k.cornerRadius = 6;
    k.fills = solid(C.card);
    k.resize(160, 10); // width locked; height hugs
    if (stroked) { k.strokes = strk(C.accent, 0.3); k.strokeWeight = 1; k.strokeAlign = 'INSIDE'; }
    k.appendChild(txt('Label',    { size:11, color:C.dim,   name:'Label'   }));
    k.appendChild(txt('42',       { size:24, style:'Semi Bold', color:valCol, name:'Value'   }));
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
// ROW 3 — Organisms: VERTICAL, fixed height + fixed width
//          Header: layoutAlign=STRETCH (fill width) + hug height
//          Body:   layoutAlign=STRETCH + layoutGrow=1 (fill remaining height)
//          This makes Figma correctly report "Fill container" in dev inspect.
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 300;

// ── 9. EntityPanel ───────────────────────────────────────────────────────────
{
  const defs = [
    { v:'All',    label:'ENTITIES' },
    { v:'Assets', label:'ENTITIES — Assets' },
    { v:'Tracks', label:'ENTITIES — Tracks' },
  ];
  const variants = defs.map(function(d) {
    var v = d.v, label = d.label;
    const k = figma.createComponent();
    k.name = 'Filter=' + v;
    al(k, { dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, crossAlign:'MIN',
            mainSizing:'FIXED', crossSizing:'FIXED' });
    k.fills = solid(C.panel);
    k.resize(300, 480);
    k.clipsContent = true;

    // Header: stretch fills width, hug height
    const hdr = stretchRow({ gap:8, pl:12, pr:12, pt:10, pb:10, bg:C.panel, crossAlign:'CENTER' });
    hdr.strokes = strk(C.border); hdr.strokeAlign = 'OUTSIDE'; hdr.strokeWeight = 1;
    hdr.appendChild(txt(label, { size:10, style:'Semi Bold', color:C.dim }));

    // Body: stretch fills width, grow fills remaining height
    const body = stretchGrowBody({ dir:'VERTICAL', gap:4, pl:8, pr:8, pt:8, pb:8, bg:C.panel });
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
{
  const k = figma.createComponent();
  k.name = 'TaskPanel';
  al(k, { dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, crossAlign:'MIN',
          mainSizing:'FIXED', crossSizing:'FIXED' });
  k.fills = solid(C.panel);
  k.resize(300, 480);
  k.clipsContent = true;

  const hdr = stretchRow({ gap:8, pl:12, pr:12, pt:10, pb:10, bg:C.panel, crossAlign:'CENTER' });
  hdr.strokes = strk(C.border); hdr.strokeAlign = 'OUTSIDE'; hdr.strokeWeight = 1;
  hdr.appendChild(txt('ACTIVE TASKS', { size:10, style:'Semi Bold', color:C.dim }));

  const body = stretchGrowBody({ dir:'VERTICAL', gap:4, pl:8, pr:8, pt:8, pb:8, bg:C.panel });
  body.appendChild(txt('Task rows render here', { size:11, color:C.ghost }));

  k.appendChild(hdr);
  k.appendChild(body);
  page.appendChild(k);
  k.x = X; k.y = Y; X += 300 + GAP_X;
}

// ── 11. SystemLogEntry ────────────────────────────────────────────────────────
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
  for (var li = 0; li < levelDefs.length; li++) {
    var ld = levelDefs[li];
    for (var lgi = 0; lgi < loggerDefs.length; lgi++) {
      var lgd = loggerDefs[lgi];
      const k = figma.createComponent();
      k.name = 'Level=' + ld.level + ', Logger=' + lgd.logger;
      // HORIZONTAL: primary=width (FIXED at 560), counter=height (AUTO/hug)
      al(k, { gap:10, pl:12, pr:12, pt:6, pb:6,
              mainSizing:'FIXED', crossSizing:'AUTO', crossAlign:'CENTER' });
      k.fills = solid(C.card);
      k.resize(560, 10); // width fixed; height hugs text
      k.appendChild(txt('12:34:56.789', { size:11, color:C.ghost,  name:'Timestamp',    family:MONO.family, style:MONO.style }));
      k.appendChild(txt(ld.letter,      { size:11, color:ld.col,   name:'LevelInitial', family:MONO.family, style:MONO.style }));
      k.appendChild(txt(lgd.logger,     { size:11, color:lgd.col,  name:'Logger',       family:MONO.family, style:MONO.style }));
      // Message fills remaining width using layoutGrow
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
{
  const k = figma.createComponent();
  k.name = 'SystemLog';
  al(k, { dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, crossAlign:'MIN',
          mainSizing:'FIXED', crossSizing:'FIXED' });
  k.fills = solid(C.panel);
  k.resize(620, 480);
  k.clipsContent = true;

  const hdr = stretchRow({ gap:8, pl:12, pr:12, pt:10, pb:10, bg:C.panel, crossAlign:'CENTER' });
  hdr.strokes = strk(C.border); hdr.strokeAlign = 'OUTSIDE'; hdr.strokeWeight = 1;
  hdr.appendChild(txt('SYSTEM LOG', { size:10, style:'Semi Bold', color:C.dim }));

  const body = stretchGrowBody({ dir:'VERTICAL', gap:0, pl:0, pr:0, pt:4, pb:4, bg:C.canvas });
  body.appendChild(txt('Log entries render here', { size:11, color:C.ghost, family:MONO.family, style:MONO.style }));

  k.appendChild(hdr);
  k.appendChild(body);
  page.appendChild(k);
  k.x = X; k.y = Y; X += 620 + GAP_X;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 4 — Template: 1440×900, all sub-frames use STRETCH + layoutGrow
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 620;

// ── 13. DashboardLayout ──────────────────────────────────────────────────────
{
  const k = figma.createComponent();
  k.name = 'DashboardLayout';
  al(k, { dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, crossAlign:'MIN',
          mainSizing:'FIXED', crossSizing:'FIXED' });
  k.fills = solid(C.canvas);
  k.resize(1440, 900);
  k.clipsContent = true;

  // Header bar — stretch fills width, fixed 48px height
  const hdrBar = stretchRow({
    gap:12, pl:16, pr:16, pt:0, pb:0,
    bg:C.panel, mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER',
    crossSizing:'FIXED',
  });
  hdrBar.resize(hdrBar.width, 48);
  hdrBar.strokes = strk(C.border); hdrBar.strokeAlign = 'OUTSIDE'; hdrBar.strokeWeight = 1;
  hdrBar.appendChild(txt('EARS — Entity Auto Reconnaissance System', { size:13, style:'Semi Bold' }));
  const livePill = frame({ gap:5, pl:8, pr:8, pt:4, pb:4, bg:C.card, radius:4 });
  livePill.appendChild(dot(C.friendly, 5));
  livePill.appendChild(txt('Live', { size:11, color:C.friendly }));
  hdrBar.appendChild(livePill);

  // Metrics strip — stretch fills width, fixed 80px height
  const metricsStrip = stretchRow({
    gap:12, pl:16, pr:16, pt:12, pb:12,
    bg:C.panel, crossAlign:'CENTER', crossSizing:'FIXED', name:'metrics',
  });
  metricsStrip.resize(metricsStrip.width, 80);
  const metDefs = [
    { label:'Assets',             value:'2',    sub:'TEMPLATE_ASSET'   },
    { label:'Tracks',             value:'1',    sub:'TEMPLATE_TRACK'   },
    { label:'Active Tasks',       value:'1',    sub:'STATUS_EXECUTING' },
    { label:'Distance Threshold', value:'5 mi', sub:'Proximity trigger' },
  ];
  for (var mi = 0; mi < metDefs.length; mi++) {
    var md = metDefs[mi];
    // Each card: layoutGrow=1 fills equal width; layoutAlign=STRETCH fills height
    const card = frame({ dir:'VERTICAL', gap:2, pl:16, pr:16, pt:10, pb:10, bg:C.card, radius:6, crossAlign:'MIN' });
    card.layoutGrow  = 1;         // equal width fill
    card.layoutAlign = 'STRETCH'; // fill strip height
    card.appendChild(txt(md.label, { size:10, color:C.dim   }));
    card.appendChild(txt(md.value, { size:20, style:'Semi Bold' }));
    card.appendChild(txt(md.sub,   { size:9,  color:C.ghost }));
    metricsStrip.appendChild(card);
  }

  // Main 3-column area — stretch fills width, grow fills remaining height
  const mainArea = stretchGrowBody({ bg:C.canvas, name:'main' });

  // Left col: fixed 300px width, stretch fills height
  const leftCol = frame({ dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, bg:C.panel,
                           crossSizing:'FIXED', name:'EntityPanel' });
  leftCol.resize(300, 10);
  leftCol.layoutAlign = 'STRETCH';
  leftCol.appendChild(txt('EntityPanel', { size:11, color:C.dim }));

  // Center col: fill remaining width (layoutGrow=1), stretch fills height
  const centerCol = frame({ dir:'VERTICAL', gap:12, pl:12, pr:12, pt:12, pb:12,
                              bg:C.canvas, name:'center' });
  centerCol.layoutGrow  = 1;
  centerCol.layoutAlign = 'STRETCH';
  centerCol.appendChild(txt('ProximityAlert + SystemLog', { size:11, color:C.dim }));

  // Right col: fixed 300px width, stretch fills height
  const rightCol = frame({ dir:'VERTICAL', gap:0, pl:0, pr:0, pt:0, pb:0, bg:C.panel,
                             crossSizing:'FIXED', name:'TaskPanel' });
  rightCol.resize(300, 10);
  rightCol.layoutAlign = 'STRETCH';
  rightCol.appendChild(txt('TaskPanel', { size:11, color:C.dim }));

  mainArea.appendChild(leftCol);
  mainArea.appendChild(centerCol);
  mainArea.appendChild(rightCol);

  k.appendChild(hdrBar);
  k.appendChild(metricsStrip);
  k.appendChild(mainArea);
  page.appendChild(k);
  k.x = X; k.y = Y;
}

// ── Zoom to fit ───────────────────────────────────────────────────────────────
figma.viewport.scrollAndZoomIntoView(page.children);
figma.closePlugin('✓ 13 components created on the Components page.');

})();
