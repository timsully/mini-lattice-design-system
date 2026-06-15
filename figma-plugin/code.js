// Lattice DS Builder — Figma Plugin
// All sizing derived directly from components/lattice/*.tsx source.
//
// Tailwind → px reference used throughout:
//   gap-px=1  gap-0.5=2  gap-1=4  gap-1.5=6  gap-2=8  gap-3=12  gap-4=16
//   px-1.5=6  px-3=12  px-4=16
//   py-0.5=2  py-1=4  py-2.5=10  py-3=12
//   h-12=48  w-5=20  h-1.5/w-1.5=6 (dot)
//   rounded-sm=2  rounded=4
//   text-[10px]=10  text-[11px]=11  text-sm=14  text-2xl=24  text-base=16

(async () => {

// ── Colours ───────────────────────────────────────────────────────────────────
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

// ── Fonts ─────────────────────────────────────────────────────────────────────
await figma.loadFontAsync({ family:'Inter', style:'Regular'   });
await figma.loadFontAsync({ family:'Inter', style:'Medium'    });
await figma.loadFontAsync({ family:'Inter', style:'Semi Bold' });
await figma.loadFontAsync({ family:'Inter', style:'Bold'      });
let MONO = { family:'Roboto Mono', style:'Regular' };
try {
  await figma.loadFontAsync({ family:'Roboto Mono', style:'Regular' });
  await figma.loadFontAsync({ family:'Roboto Mono', style:'Medium'  });
} catch(_) { MONO = { family:'Inter', style:'Regular' }; }

// ── Primitives ────────────────────────────────────────────────────────────────
const solid = (c, o) => [{ type:'SOLID', color:c, opacity: o !== undefined ? o : 1 }];
const border = (c, o) => [{ type:'SOLID', color:c, opacity: o !== undefined ? o : 1 }];

function al(node, o) {
  o = o || {};
  node.layoutMode             = o.dir        || 'HORIZONTAL';
  node.primaryAxisSizingMode  = o.main       || 'AUTO';
  node.counterAxisSizingMode  = o.cross      || 'AUTO';
  node.itemSpacing            = o.gap !== undefined ? o.gap : 6;
  node.paddingLeft            = o.pl  !== undefined ? o.pl  : (o.px !== undefined ? o.px : 0);
  node.paddingRight           = o.pr  !== undefined ? o.pr  : (o.px !== undefined ? o.px : 0);
  node.paddingTop             = o.pt  !== undefined ? o.pt  : (o.py !== undefined ? o.py : 0);
  node.paddingBottom          = o.pb  !== undefined ? o.pb  : (o.py !== undefined ? o.py : 0);
  node.primaryAxisAlignItems  = o.mainAlign  || 'MIN';
  node.counterAxisAlignItems  = o.crossAlign || 'CENTER';
}

function txt(chars, o) {
  o = o || {};
  const t = figma.createText();
  t.fontName   = { family: o.family || 'Inter', style: o.weight || 'Regular' };
  t.characters = String(chars);
  t.fontSize   = o.size || 12;
  t.fills      = solid(o.color || C.ink);
  if (o.name)  t.name = o.name;
  if (o.grow)  { t.layoutGrow = 1; t.textAutoResize = 'HEIGHT'; }
  if (o.w)   { t.textAutoResize = 'HEIGHT'; t.resize(o.w, t.height); }
  return t;
}

function dot(color, size) {
  size = size || 6;
  const e = figma.createEllipse();
  e.name = 'dot'; e.resize(size, size); e.fills = solid(color);
  return e;
}

// Create a COMPONENT node
function mkComp(name, o) {
  o = o || {};
  const c = figma.createComponent();
  c.name = name;
  al(c, o);
  c.cornerRadius = o.radius !== undefined ? o.radius : 4;
  c.fills = o.bg !== undefined ? (o.bg ? solid(o.bg) : []) : solid(C.card);
  if (o.stroke) { c.strokes = border(o.stroke, o.strokeOp || 1); c.strokeWeight = o.sw || 1; c.strokeAlign = o.sa || 'INSIDE'; }
  if (o.w) {
    // VERTICAL layout: primary=HEIGHT, counter=WIDTH — fix counter axis for width
    // HORIZONTAL layout: primary=WIDTH — fix primary axis
    if ((o.dir || 'HORIZONTAL') === 'VERTICAL') {
      c.counterAxisSizingMode = 'FIXED';
    } else {
      c.primaryAxisSizingMode = 'FIXED';
    }
    c.resize(o.w, 10);
  }
  return c;
}

// Create a FRAME node (for sub-frames inside components)
function mkFrame(o) {
  o = o || {};
  const f = figma.createFrame();
  if (o.name) f.name = o.name;
  al(f, o);
  f.cornerRadius = o.radius || 0;
  f.fills = o.bg ? solid(o.bg) : [];
  if (o.clip)    f.clipsContent = true;
  if (o.stretch) {
    f.layoutAlign = 'STRETCH';
    // Figma Plugin API does NOT auto-fix sizing when layoutAlign='STRETCH' is set.
    // For stretch to work, the axis being filled must be FIXED (not AUTO/hug).
    // All stretched frames in this plugin are in VERTICAL parents (filling WIDTH):
    //   HORIZONTAL child: primary=WIDTH → primaryAxisSizingMode='FIXED'
    //   VERTICAL child:   counter=WIDTH → counterAxisSizingMode='FIXED'
    if ((o.dir || 'HORIZONTAL') === 'HORIZONTAL') {
      f.primaryAxisSizingMode = 'FIXED';
    } else {
      f.counterAxisSizingMode = 'FIXED';
    }
  }
  if (o.grow)    f.layoutGrow = 1;
  if (o.stroke) { f.strokes = border(o.stroke, o.strokeOp || 1); f.strokeWeight = o.sw || 1; f.strokeAlign = o.sa || 'OUTSIDE'; }
  return f;
}

// Post-process a component set: auto-layout + padding + styling
function styleSet(set, gap) {
  gap = gap !== undefined ? gap : 12;
  set.layoutMode            = 'HORIZONTAL';
  set.layoutWrap            = 'WRAP';
  set.primaryAxisSizingMode = 'AUTO';
  set.counterAxisSizingMode = 'AUTO';
  set.itemSpacing           = gap;
  set.counterAxisSpacing    = gap;
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 20;
  set.fills        = solid(C.elevated);
  set.cornerRadius = 8;
}

// ── Page ──────────────────────────────────────────────────────────────────────
const page = figma.root.children.find(function(p){ return p.name === 'Components'; });
if (!page) { figma.closePlugin("No page named 'Components' found."); return; }
figma.currentPage = page;

// ═══════════════════════════════════════════════════════════════════════════════
// VARIABLE COLLECTION — extracted from app/globals.css @theme + lib/tokens.ts
//
// Groups:
//   Color/Background/*  → surface layers (canvas, panel, card, elevated)
//   Color/Border        → border color
//   Color/Text/*        → ink, dim, ghost
//   Color/Disposition/* → semantic disposition colors (5 values)
//   Color/Status/*      → semantic task status colors (4 values)
//   Color/Accent        → amber accent / CTA
//   Spacing/*           → Tailwind gap/padding values used in components (px)
//   Radius/*            → border-radius values (rounded-sm=2, rounded=4)
//   Config/*            → business logic constants from lib/tokens.ts
// ═══════════════════════════════════════════════════════════════════════════════
if (figma.variables) {
  var col = figma.variables.createVariableCollection('Lattice Design System');
  var modeId = col.modes[0].modeId;
  col.renameMode(modeId, 'Dark');

  function colorVar(name, value) {
    var v = figma.variables.createVariable(name, col, 'COLOR');
    v.setValueForMode(modeId, value);
    return v;
  }
  function numVar(name, value) {
    var v = figma.variables.createVariable(name, col, 'FLOAT');
    v.setValueForMode(modeId, value);
    return v;
  }

  // Background layers (--color-canvas through --color-elevated)
  colorVar('Color/Background/Canvas',   C.canvas);
  colorVar('Color/Background/Panel',    C.panel);
  colorVar('Color/Background/Card',     C.card);
  colorVar('Color/Background/Elevated', C.elevated);

  // Border
  colorVar('Color/Border', C.border);

  // Text hierarchy
  colorVar('Color/Text/Ink',   C.ink);
  colorVar('Color/Text/Dim',   C.dim);
  colorVar('Color/Text/Ghost', C.ghost);

  // Disposition semantic colors (from DISPOSITION_COLORS in lib/tokens.ts)
  colorVar('Color/Disposition/Friendly',   C.friendly);
  colorVar('Color/Disposition/Assumed',    C.assumed);
  colorVar('Color/Disposition/Suspicious', C.suspicious);
  colorVar('Color/Disposition/Hostile',    C.hostile);
  colorVar('Color/Disposition/Unknown',    C.unknown);

  // Task status semantic colors (from TASK_STATUS_COLORS in lib/tokens.ts)
  colorVar('Color/Status/Executing',   C.executing);
  colorVar('Color/Status/Done OK',     C.doneOk);
  colorVar('Color/Status/Done Not OK', C.doneNotOk);
  colorVar('Color/Status/Pending',     C.pending);

  // Accent
  colorVar('Color/Accent', C.accent);

  // Spacing — Tailwind values used in component padding/gap
  numVar('Spacing/1px',  1);   // gap-px
  numVar('Spacing/4',    4);   // gap-1, py-1
  numVar('Spacing/6',    6);   // gap-1.5, px-1.5
  numVar('Spacing/8',    8);   // gap-2, p-2
  numVar('Spacing/10',  10);   // py-2.5
  numVar('Spacing/12',  12);   // gap-3, px-3, py-3
  numVar('Spacing/16',  16);   // gap-4, px-4
  numVar('Spacing/48',  48);   // h-12 (header height)

  // Border radius
  numVar('Radius/SM',      2);  // rounded-sm
  numVar('Radius/Default', 4);  // rounded

  // Business logic constants (from lib/tokens.ts)
  numVar('Config/Distance Threshold Miles',   5);
  numVar('Config/Refresh Interval Seconds',   5);
  numVar('Config/Expiry Offset Seconds',     15);
  numVar('Config/Cache Capacity',           150);
}

let X = 100, Y = 100;
const RGAP = 80; // row gap

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 1 — Atoms
// All badges: inline-flex (hug both), rounded=4px, px-1.5=6 py-0.5=2
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. DispositionBadge ───────────────────────────────────────────────────────
// Source: inline-flex items-center gap-1.5 rounded px-1.5 py-0.5
// gap-1.5=6  px-1.5=6  py-0.5=2  rounded=4  dot=6×6  text=10px Semi Bold uppercase
{
  const DISP = [
    { v:'Friendly',         bg:C.friendly,   bgO:0.12, dot:C.friendly,   text:C.friendly   },
    { v:'Assumed Friendly', bg:C.assumed,    bgO:0.12, dot:C.assumed,    text:C.assumed    },
    { v:'Suspicious',       bg:C.suspicious, bgO:0.12, dot:C.suspicious, text:C.suspicious },
    { v:'Hostile',          bg:C.hostile,    bgO:0.12, dot:C.hostile,    text:C.hostile    },
    { v:'Unknown',          bg:C.unknown,    bgO:0.12, dot:C.unknown,    text:C.unknown    },
  ];
  const variants = DISP.map(function(d) {
    const k = mkComp('Disposition='+d.v, { px:6, py:2, gap:6, radius:4 });
    k.fills = [{ type:'SOLID', color:C.card }, { type:'SOLID', color:d.bg, opacity:d.bgO }];
    k.appendChild(dot(d.dot));
    k.appendChild(txt(d.v.toUpperCase(), { size:10, color:d.text, weight:'Semi Bold', name:'Label' }));
    page.appendChild(k); return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'DispositionBadge'; styleSet(set);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 2. TemplateBadge ──────────────────────────────────────────────────────────
// Source: inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold
// No gap, px-1.5=6  py-0.5=2  rounded=4
// Asset → bg-assumed/10 text-assumed | Track → bg-suspicious/10 text-suspicious
{
  const TMPL = [
    { v:'Asset',        bg:C.assumed,    bgO:0.10, color:C.assumed,    label:'ASSET', platform:null  },
    { v:'AssetWithUSV', bg:C.assumed,    bgO:0.10, color:C.assumed,    label:'ASSET', platform:'USV' },
    { v:'Track',        bg:C.suspicious, bgO:0.10, color:C.suspicious, label:'TRACK', platform:null  },
  ];
  const variants = TMPL.map(function(d) {
    const k = mkComp('Template='+d.v, { px:6, py:2, gap:4, radius:4 });
    k.fills = [{ type:'SOLID', color:d.bg, opacity:d.bgO }];
    k.appendChild(txt(d.label, { size:10, color:d.color, weight:'Semi Bold', name:'Label' }));
    if (d.platform) {
      k.appendChild(txt('· '+d.platform, { size:10, color:d.color, name:'PlatformType' }));
    }
    page.appendChild(k); return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'TemplateBadge'; styleSet(set);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 3. LiveBadge ─────────────────────────────────────────────────────────────
// Source: inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold
// gap-1=4  px-1.5=6  py-0.5=2  rounded=4  dot=6×6
// Live → bg-friendly/10 text-friendly | Expired → bg-ghost/10 text-ghost
{
  const LIVE = [
    { v:'True',  bg:C.friendly, bgO:0.10, dot:C.friendly, color:C.friendly, label:'LIVE'    },
    { v:'False', bg:C.ghost,    bgO:0.10, dot:C.ghost,    color:C.ghost,    label:'EXPIRED' },
  ];
  const variants = LIVE.map(function(d) {
    const k = mkComp('IsLive='+d.v, { px:6, py:2, gap:4, radius:4 });
    k.fills = [{ type:'SOLID', color:d.bg, opacity:d.bgO }];
    k.appendChild(dot(d.dot));
    k.appendChild(txt(d.label, { size:10, color:d.color, weight:'Semi Bold', name:'Label' }));
    page.appendChild(k); return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'LiveBadge'; styleSet(set);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 4. TaskStatusBadge ────────────────────────────────────────────────────────
// Source: inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold
// No gap, px-1.5=6  py-0.5=2  rounded=4
{
  const STATUS = [
    { v:'Executing', bg:C.executing,  bgO:0.15, color:C.executing  },
    { v:'Done',      bg:C.doneOk,     bgO:0.15, color:C.doneOk     },
    { v:'Failed',    bg:C.doneNotOk,  bgO:0.15, color:C.doneNotOk  },
    { v:'Pending',   bg:C.pending,    bgO:0.10, color:C.pending     },
  ];
  const variants = STATUS.map(function(d) {
    const k = mkComp('Status='+d.v, { px:6, py:2, gap:0, radius:4 });
    k.fills = [{ type:'SOLID', color:d.bg, opacity:d.bgO }];
    k.appendChild(txt(d.v.toUpperCase(), { size:10, color:d.color, weight:'Semi Bold', name:'Label' }));
    page.appendChild(k); return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'TaskStatusBadge'; styleSet(set);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 2 — Molecules
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 200;

// ── 5. EntityRow ──────────────────────────────────────────────────────────────
// 3 variants matching Storybook stories: FriendlyAsset, AssumedFriendlyAsset, SuspiciousTrack
// Content taken directly from MOCK_ENTITIES in lib/mock-data.ts
{
  var EROWS = [
    {
      v:'FriendlyAsset',
      name:'Simulated Asset asset-01', id:'asset-01',
      liveC:C.friendly,
      tmpl:'ASSET', platform:'USV', tmplC:C.assumed,
      disp:'FRIENDLY', dispC:C.friendly,
      lat:'1.0000', lng:'1.0000',
      env:'SURFACE', dataType:'Simulated Asset', updated:'11:17:00',
    },
    {
      v:'AssumedFriendlyAsset',
      name:'Simulated Asset asset-02', id:'asset-02',
      liveC:C.friendly,
      tmpl:'ASSET', platform:'USV', tmplC:C.assumed,
      disp:'ASSUMED FRIENDLY', dispC:C.assumed,
      lat:'1.0100', lng:'1.0100',
      env:'SURFACE', dataType:'Simulated Asset', updated:'11:17:00',
    },
    {
      v:'SuspiciousTrack',
      name:'Simulated Track', id:'track-f8a3b2c1',
      liveC:C.friendly,
      tmpl:'TRACK', platform:null, tmplC:C.suspicious,
      disp:'SUSPICIOUS', dispC:C.suspicious,
      lat:'1.0300', lng:'1.0300',
      env:'SURFACE', dataType:'Simulated Track', updated:'11:17:00',
    },
  ];
  var erVariants = EROWS.map(function(d) {
    var k = figma.createComponent();
    k.name = 'Entity='+d.v;
    al(k, { dir:'VERTICAL', gap:8, px:12, py:10, crossAlign:'MIN' });
    k.cornerRadius = 2; k.fills = solid(C.card);
    k.strokes = border(C.border); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';

    var nameRow = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'MIN', gap:8, stretch:true });
    var nameLeft = mkFrame({ dir:'VERTICAL', gap:4 });
    nameLeft.appendChild(txt(d.name, { size:14, weight:'Semi Bold', name:'Name' }));
    nameLeft.appendChild(txt('ID: '+d.id, { size:10, color:C.ghost, family:MONO.family, style:MONO.style, name:'EntityId' }));
    nameRow.appendChild(nameLeft);
    var liveBadge = mkFrame({ px:6, py:2, gap:4, radius:4 });
    liveBadge.fills = [{ type:'SOLID', color:d.liveC, opacity:0.10 }];
    liveBadge.appendChild(dot(d.liveC));
    liveBadge.appendChild(txt('LIVE', { size:10, color:d.liveC, weight:'Semi Bold' }));
    nameRow.appendChild(liveBadge);

    var badgeRow = mkFrame({ gap:6, crossAlign:'CENTER' });
    var tmplBadge = mkFrame({ px:6, py:2, gap:4, radius:4 });
    tmplBadge.fills = [{ type:'SOLID', color:d.tmplC, opacity:0.10 }];
    tmplBadge.appendChild(txt(d.tmpl, { size:10, color:d.tmplC, weight:'Semi Bold', name:'Template' }));
    if (d.platform) tmplBadge.appendChild(txt('· '+d.platform, { size:10, color:d.tmplC }));
    var dispBadge = mkFrame({ px:6, py:2, gap:6, radius:4 });
    dispBadge.fills = [{ type:'SOLID', color:d.dispC, opacity:0.12 }];
    dispBadge.appendChild(dot(d.dispC));
    dispBadge.appendChild(txt(d.disp, { size:10, color:d.dispC, weight:'Semi Bold', name:'Disposition' }));
    badgeRow.appendChild(tmplBadge);
    badgeRow.appendChild(dispBadge);

    var metaRow = mkFrame({ gap:16, crossAlign:'MIN', stretch:true });
    var metaLeft = mkFrame({ dir:'VERTICAL', gap:2, grow:true });
    metaLeft.appendChild(txt('LOCATION',      { size:10, color:C.ghost, weight:'Medium' }));
    metaLeft.appendChild(txt(d.lat+'°, '+d.lng+'°', { size:11, color:C.dim, family:MONO.family, style:MONO.style, name:'Location' }));
    metaLeft.appendChild(txt('DATA TYPE',     { size:10, color:C.ghost, weight:'Medium' }));
    metaLeft.appendChild(txt(d.dataType,      { size:11, color:C.dim, name:'DataType' }));
    var metaRight = mkFrame({ dir:'VERTICAL', gap:2, grow:true });
    metaRight.appendChild(txt('ENVIRONMENT',  { size:10, color:C.ghost, weight:'Medium' }));
    metaRight.appendChild(txt(d.env,          { size:11, color:C.dim, name:'Environment' }));
    metaRight.appendChild(txt('UPDATED',      { size:10, color:C.ghost, weight:'Medium' }));
    metaRight.appendChild(txt(d.updated,      { size:11, color:C.dim, name:'UpdatedAt' }));
    metaRow.appendChild(metaLeft);
    metaRow.appendChild(metaRight);

    k.appendChild(nameRow);
    k.appendChild(badgeRow);
    k.appendChild(metaRow);
    k.counterAxisSizingMode = 'FIXED';
    k.primaryAxisSizingMode = 'AUTO';
    k.resize(280, k.height > 0 ? k.height : 100);
    page.appendChild(k); return k;
  });
  var erSet = figma.combineAsVariants(erVariants, page);
  erSet.name = 'EntityRow'; styleSet(erSet, 16);
  erSet.x = X; erSet.y = Y; X += erSet.width + RGAP;
}

// ── 6. TaskRow ────────────────────────────────────────────────────────────────
// Source: flex flex-col gap-2 rounded-sm border border-border bg-card px-3 py-2.5
// Same container as EntityRow
// row1: flex items-center justify-between gap-2
//   left: flex items-center gap-2 (TaskStatusBadge + task name text-sm=14px)
//   right: text-[10px] ghost shrink-0 (truncated ID)
// row2: flex items-center gap-1.5=6 text-[11px] dim (assignee → target)
// row3: text-[11px] ghost (description, line-clamp-2)
// row4: text-[10px] ghost
{
  const TSTATUS = [
    { v:'Executing', col:C.executing,  bg:C.executing,  bgO:0.15 },
    { v:'Done',      col:C.doneOk,     bg:C.doneOk,     bgO:0.15 },
    { v:'Failed',    col:C.doneNotOk,  bg:C.doneNotOk,  bgO:0.15 },
    { v:'Pending',   col:C.pending,    bg:C.pending,     bgO:0.10 },
  ];
  const variants = TSTATUS.map(function(d) {
    const k = figma.createComponent();
    k.name = 'Status='+d.v;
    al(k, { dir:'VERTICAL', gap:8, px:12, py:10, crossAlign:'MIN' });
    k.cornerRadius = 2;
    k.fills = solid(C.card);
    k.strokes = border(C.border); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';

    // row1: justify-between, items-center
    const row1 = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', gap:8, stretch:true });
    const row1Left = mkFrame({ gap:8, crossAlign:'CENTER' });
    // status badge
    const sb = mkFrame({ px:6, py:2, gap:0, radius:4 });
    sb.fills = [{ type:'SOLID', color:d.bg, opacity:d.bgO }];
    sb.appendChild(txt(d.v.toUpperCase(), { size:10, color:d.col, weight:'Semi Bold', name:'StatusLabel' }));
    row1Left.appendChild(sb);
    row1Left.appendChild(txt('Investigate', { size:14, weight:'Semi Bold', name:'TaskName' }));
    row1.appendChild(row1Left);
    row1.appendChild(txt('c7d8e9f0…', { size:10, color:C.ghost, family:MONO.family, style:MONO.style, name:'TaskId' }));

    // row2: assignee → target  (truncated entity IDs matching truncateId() output)
    const row2 = mkFrame({ gap:6, crossAlign:'CENTER' });
    row2.appendChild(txt('asset-01',        { size:11, color:C.ghost,      name:'Assignee' }));
    row2.appendChild(txt('→',          { size:11, color:C.ghost       }));
    row2.appendChild(txt('track-f8a3b2c1…', { size:11, color:C.suspicious, name:'Target' }));

    k.appendChild(row1);
    k.appendChild(row2);
    k.appendChild(txt('Asset asset-01 tasked to perform ISR on Track track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c', { size:11, color:C.ghost, name:'Description' }));
    k.appendChild(txt('Initiated by auto-reconnaissance', { size:10, color:C.ghost, name:'Author' }));
    // Fix width after children — avoids early resize() locking primary-axis height to 10.
    // VERTICAL layout: counter=WIDTH, primary=HEIGHT. counterAxisSizingMode='FIXED'
    // pins width; primaryAxisSizingMode='AUTO' lets height hug content.
    k.counterAxisSizingMode = 'FIXED';
    k.primaryAxisSizingMode = 'AUTO';
    k.resize(280, k.height > 0 ? k.height : 80);
    page.appendChild(k); return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'TaskRow'; styleSet(set, 16);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 7. ProximityAlert ────────────────────────────────────────────────────────
var proxVariants; var slComp; // hoisted for DashboardLayout to reference as instances
// Source: flex items-start gap-3 rounded-sm border px-3 py-2.5
// HORIZONTAL  gap-3=12  rounded-sm=2  px-3=12  py-2.5=10  border:1px
// Width: fill container  Height: hug content
// left:  ⚠ icon text-base=16px shrink-0
// right: flex flex-col gap-0.5=2
//   nameRow: flex items-center gap-1.5=6 text-[11px]
//   metaRow: flex items-center gap-3=12  text-[10px]
{
  const PROX = [
    { v:'WithinRange',  alertC:C.suspicious, bgO:0.05, bdO:0.40, distC:C.suspicious, dist:'2.93' },
    { v:'OutsideRange', alertC:C.ghost,      bgO:0.00, bdO:0.30, distC:C.dim,        dist:'6.50' },
  ];
  const variants = PROX.map(function(d) {
    const k = figma.createComponent();
    k.name = d.v;
    al(k, { gap:12, px:12, py:10, crossAlign:'MIN' });
    k.cornerRadius = 2;
    k.fills  = d.bgO > 0 ? [{ type:'SOLID', color:d.alertC, opacity:d.bgO }] : solid(C.card);
    k.strokes = border(d.alertC, d.bdO); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';

    // Left: warning icon
    k.appendChild(txt('⚠', { size:16, color:d.alertC, name:'Icon' }));

    // Right: flex-col gap-0.5=2
    const right = mkFrame({ dir:'VERTICAL', gap:2, crossAlign:'MIN' });

    const nameRow = mkFrame({ gap:6, crossAlign:'CENTER' });
    nameRow.appendChild(txt('Simulated Asset asset-01', { size:11, weight:'Semi Bold', name:'AssetName'  }));
    nameRow.appendChild(txt('within range of',          { size:11, color:C.ghost }));
    nameRow.appendChild(txt('Simulated Track',          { size:11, weight:'Semi Bold', color:C.suspicious, name:'TrackName' }));

    const metaRow = mkFrame({ gap:12, crossAlign:'CENTER' });
    metaRow.appendChild(txt('Distance: ', { size:10, color:C.ghost }));
    metaRow.appendChild(txt(d.dist+' mi', { size:10, weight:'Semi Bold', color:d.distC, name:'Distance' }));
    metaRow.appendChild(txt('Threshold: ', { size:10, color:C.ghost }));
    metaRow.appendChild(txt('5 mi',        { size:10, color:C.dim, name:'Threshold' }));

    right.appendChild(nameRow);
    right.appendChild(metaRow);
    k.appendChild(right);
    page.appendChild(k); return k;
  });
  proxVariants = variants;
  const set = figma.combineAsVariants(variants, page);
  set.name = 'ProximityAlert'; styleSet(set);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 8. MetricCard ────────────────────────────────────────────────────────────
// Source: flex flex-col gap-1 rounded-sm border border-border bg-panel px-4 py-3
// gap-1=4  rounded-sm=2  px-4=16  py-3=12  border:1px  bg: panel (not card)
// Width: fill container (grid cell)  Height: hug content
// label: text-[10px] uppercase tracking-widest ghost font-medium
// value: text-2xl=24px font-bold  (highlight → text-accent)
// sublabel: text-[10px] ghost
{
  const METRIC = [
    { v:'Default',     label:'ASSETS',       value:'2', sub:'TEMPLATE_ASSET',   valC:C.ink,    stroked:false },
    { v:'Highlighted', label:'ACTIVE TASKS', value:'1', sub:'STATUS_EXECUTING', valC:C.accent, stroked:true  },
  ];
  const variants = METRIC.map(function(d) {
    const k = figma.createComponent();
    k.name = 'Highlight='+d.v;
    al(k, { dir:'VERTICAL', gap:4, px:16, py:12, crossAlign:'MIN' });
    k.cornerRadius = 2;
    k.fills = solid(C.panel);
    k.strokes = border(d.stroked ? C.accent : C.border, d.stroked ? 0.30 : 1);
    k.strokeWeight = 1; k.strokeAlign = 'INSIDE';
    k.appendChild(txt(d.label,   { size:10, color:C.ghost, weight:'Medium', name:'Label'    }));
    k.appendChild(txt(d.value,   { size:24, color:d.valC,  weight:'Bold',   name:'Value'    }));
    k.appendChild(txt(d.sub,     { size:10, color:C.ghost,                  name:'Sublabel' }));
    page.appendChild(k); return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'MetricCard'; styleSet(set);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 3 — Organisms
// All panels: flex flex-col h-full bg-panel border border-border rounded-sm
// Header:     flex items-center justify-between px-4 py-3 border-b border-border
//             → px-4=16  py-3=12  SPACE_BETWEEN  center  border-bottom 1px
// Body:       flex-1 overflow-y-auto → layoutGrow=1 + layoutAlign=STRETCH
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 300;

// ── 9. EntityPanel ───────────────────────────────────────────────────────────
// Filter variant → figma.enum("Filter", { All, Assets, Tracks })
{
  // rowIndices reference erVariants: 0=FriendlyAsset, 1=AssumedFriendlyAsset, 2=SuspiciousTrack
  // countParts: colored sub-labels matching HTML (assets=assumed, dot=ghost, tracks=suspicious)
  var FILTERS = [
    { v:'all',            countParts:[{t:'2 assets',c:C.assumed},{t:'·',c:C.ghost},{t:'1 track',c:C.suspicious}], rowIndices:[0, 1, 2] },
    { v:'TEMPLATE_ASSET', countParts:[{t:'2 assets',c:C.assumed}],                                                rowIndices:[0, 1]    },
    { v:'TEMPLATE_TRACK', countParts:[{t:'1 track', c:C.suspicious}],                                             rowIndices:[2]       },
  ];
  var epVariants = FILTERS.map(function(d) {
    var k = figma.createComponent();
    k.name = 'Filter='+d.v;
    al(k, { dir:'VERTICAL', gap:0, crossAlign:'MIN', main:'FIXED', cross:'FIXED' });
    k.cornerRadius = 2;
    k.fills = solid(C.panel);
    k.strokes = border(C.border); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';
    k.resize(300, 480); k.clipsContent = true;

    // Header: title left, colored count parts right
    var hdr = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16, py:12,
                         bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE', stretch:true });
    hdr.appendChild(txt('ENTITIES', { size:11, weight:'Semi Bold', color:C.ghost, name:'PanelTitle' }));
    var countRow = mkFrame({ gap:4, crossAlign:'CENTER' });
    countRow.fills = [];
    d.countParts.forEach(function(p) { countRow.appendChild(txt(p.t, { size:10, color:p.c })); });
    hdr.appendChild(countRow);

    // Body: instances of the matching EntityRow variants (fill width, hug height)
    var body = mkFrame({ dir:'VERTICAL', gap:1, px:8, py:8, bg:C.panel, stretch:true, grow:true });
    d.rowIndices.forEach(function(i) {
      var inst = erVariants[i].createInstance();
      inst.layoutAlign = 'STRETCH';  // fill body width
      body.appendChild(inst);
    });

    k.appendChild(hdr);
    k.appendChild(body);
    page.appendChild(k); return k;
  });
  var epSet = figma.combineAsVariants(epVariants, page);
  epSet.name = 'EntityPanel'; styleSet(epSet, 20);
  epSet.x = X; epSet.y = Y; X += epSet.width + RGAP;
}

// ── 10. TaskPanel ─────────────────────────────────────────────────────────────
// 2 variants matching Storybook stories: WithTasks, Empty
{
  var TPANELS = [
    { v:'WithTasks', countTxt:'1 active', empty:false },
    { v:'Empty',     countTxt:'0 active', empty:true  },
  ];
  var tpVariants = TPANELS.map(function(d) {
    var k = figma.createComponent();
    k.name = d.v;
    al(k, { dir:'VERTICAL', gap:0, crossAlign:'MIN', main:'FIXED', cross:'FIXED' });
    k.cornerRadius = 2;
    k.fills = solid(C.panel);
    k.strokes = border(C.border); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';
    k.resize(300, 480); k.clipsContent = true;

    var hdr = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16, py:12,
                         bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE', stretch:true });
    hdr.appendChild(txt('ACTIVE TASKS', { size:11, weight:'Semi Bold', color:C.ghost }));
    var countRow = mkFrame({ gap:4, crossAlign:'CENTER' });
    countRow.appendChild(txt(d.empty ? '0' : '1', { size:10, color:d.empty ? C.ghost : C.executing, weight:'Semi Bold' }));
    countRow.appendChild(txt('active', { size:10, color:C.ghost }));
    hdr.appendChild(countRow);

    var body = mkFrame({ dir:'VERTICAL', gap:1, px:8, py:8, bg:C.panel, stretch:true, grow:true });
    if (d.empty) {
      body.appendChild(txt('No active tasks', { size:11, color:C.ghost }));
    } else {
      var trow = mkFrame({ dir:'VERTICAL', gap:8, px:12, py:10, bg:C.card, radius:2, stretch:true });
      trow.strokes = border(C.border); trow.strokeWeight = 1; trow.strokeAlign = 'INSIDE';
      // Row 1: status badge + task type + task ID
      var tr1 = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', gap:8, stretch:true });
      var tr1l = mkFrame({ gap:8, crossAlign:'CENTER' });
      var sb = mkFrame({ px:6, py:2, radius:3 });
      sb.fills = [{ type:'SOLID', color:C.executing, opacity:0.10 }];
      sb.appendChild(txt('Executing', { size:10, color:C.executing, weight:'Semi Bold' }));
      tr1l.appendChild(sb);
      tr1l.appendChild(txt('anduril.tasks.v2. Investigate', { size:14, weight:'Semi Bold' }));
      tr1.appendChild(tr1l);
      tr1.appendChild(txt('c7d8e9f0…', { size:10, color:C.ghost, family:MONO.family, style:MONO.style }));
      // Row 2: assignee → target
      var tr2 = mkFrame({ gap:6, crossAlign:'CENTER' });
      tr2.appendChild(txt('asset-01',                                         { size:11, color:C.ghost }));
      tr2.appendChild(txt('→',                                                { size:11, color:C.ghost }));
      tr2.appendChild(txt('track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c', { size:11, color:C.suspicious }));
      // Row 3: description
      // Row 4: initiated by
      var tr4 = mkFrame({ gap:4, crossAlign:'CENTER' });
      tr4.fills = [];
      tr4.appendChild(txt('Initiated by ',        { size:10, color:C.ghost }));
      tr4.appendChild(txt('auto-reconnaissance',  { size:10, color:C.dim   }));
      trow.appendChild(tr1);
      trow.appendChild(tr2);
      trow.appendChild(txt('Asset asset-01 tasked to perform ISR on Track track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c', { size:11, color:C.ghost, w:252 }));
      trow.appendChild(tr4);
      body.appendChild(trow);
    }

    k.appendChild(hdr);
    k.appendChild(body);
    page.appendChild(k); return k;
  });
  var tpSet = figma.combineAsVariants(tpVariants, page);
  tpSet.name = 'TaskPanel'; styleSet(tpSet, 20);
  tpSet.x = X; tpSet.y = Y; X += tpSet.width + RGAP;
}

// ── 11. SystemLogEntry ────────────────────────────────────────────────────────
// Source: flex items-start gap-2 text-[11px] font-mono leading-relaxed px-3 py-0.5
// HORIZONTAL  gap-2=8  items-start  px-3=12  py-0.5=2
// Width: fill container  Height: hug content
// timestamp: text-ghost shrink-0
// level:     w-5=20px  font-semibold  shrink-0
// logger:    font-semibold  shrink-0
// message:   text-dim  layoutGrow=1 (fills remaining)
{
  // Messages taken from Storybook stories + MOCK_LOG_ENTRIES, varied by level × logger
  var SLE_VARIANTS = [
    { level:'INFO',  col:C.dim,        letter:'I', logger:'EARS',     logC:C.assumed,    msg:'ASSET WITHIN RANGE OF NON-FRIENDLY TRACK'                      },
    { level:'INFO',  col:C.dim,        letter:'I', logger:'SIMASSET', logC:C.friendly,   msg:'received execute request, sending execute confirmation'         },
    { level:'INFO',  col:C.dim,        letter:'I', logger:'SIMTRACK', logC:C.suspicious, msg:'# of tracks being tracked: 1'                                  },
    { level:'WARN',  col:C.suspicious, letter:'W', logger:'EARS',     logC:C.assumed,    msg:'Task c7d8e9f0 status unknown — retrying'                        },
    { level:'WARN',  col:C.suspicious, letter:'W', logger:'SIMASSET', logC:C.friendly,   msg:'execute request timeout — will retry in 5s'                     },
    { level:'WARN',  col:C.suspicious, letter:'W', logger:'SIMTRACK', logC:C.suspicious, msg:'track entity expiry approaching — republishing'                 },
    { level:'ERROR', col:C.hostile,    letter:'E', logger:'EARS',     logC:C.assumed,    msg:'lattice api stream entities error: connection refused'           },
    { level:'ERROR', col:C.hostile,    letter:'E', logger:'SIMASSET', logC:C.friendly,   msg:'task execution failed — status: STATUS_DONE_NOT_OK'              },
    { level:'ERROR', col:C.hostile,    letter:'E', logger:'SIMTRACK', logC:C.suspicious, msg:'entity publish failed — lattice unreachable'                    },
  ];
  const variants = SLE_VARIANTS.map(function(d) {
      const k = figma.createComponent();
      k.name = 'Level='+d.level+', Logger='+d.logger;
      al(k, { gap:8, px:12, py:2, crossAlign:'MIN', main:'FIXED', cross:'AUTO' });
      k.fills = solid(C.card);
      k.appendChild(txt('11:17:00', { size:11, color:C.ghost,
                                       family:MONO.family, style:MONO.style, name:'Timestamp' }));
      k.appendChild(txt(d.letter, { size:11, color:d.col, weight:'Medium',
                                     family:MONO.family, style:MONO.style, name:'LevelInitial', w:20 }));
      k.appendChild(txt(d.logger+':', { size:11, color:d.logC, weight:'Medium',
                                         family:MONO.family, style:MONO.style, name:'Logger' }));
      k.appendChild(txt(d.msg, { size:11, color:C.dim, family:MONO.family, style:MONO.style,
                                  name:'Message', grow:true }));
      k.primaryAxisSizingMode = 'FIXED';
      k.counterAxisSizingMode = 'AUTO';
      k.resize(560, k.height > 0 ? k.height : 18);
      page.appendChild(k);
      return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'SystemLogEntry'; styleSet(set, 4);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 12. SystemLog ─────────────────────────────────────────────────────────────
// Source: flex flex-col h-full bg-panel border border-border rounded-sm
// Header: flex items-center justify-between px-4 py-3 border-b border-border
// Body:   flex-1 overflow-y-auto → inner flex flex-col py-1 (py:4px no horiz padding)
{
  slComp = figma.createComponent();
  const k = slComp;
  k.name = 'SystemLog';
  al(k, { dir:'VERTICAL', gap:0, crossAlign:'MIN', main:'FIXED', cross:'FIXED' });
  k.cornerRadius = 2;
  k.fills = solid(C.panel);
  k.strokes = border(C.border); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';
  k.resize(620, 480); k.clipsContent = true;

  const hdr = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16, py:12,
                         bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE', stretch:true });
  hdr.appendChild(txt('SYSTEM LOG', { size:11, weight:'Semi Bold', color:C.ghost }));
  hdr.appendChild(txt('10 entries', { size:10, color:C.ghost }));

  // Body: all 10 MOCK_LOG_ENTRIES as individual rows
  const body = mkFrame({ dir:'VERTICAL', gap:0, pt:4, pb:4, bg:C.canvas, stretch:true, grow:true });
  var LOG_ENTRIES = [
    { t:'11:16:52', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'# of assets being tracked: 2, # of tracks being tracked: 1'         },
    { t:'11:16:53', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'ASSET WITHIN RANGE OF NON-FRIENDLY TRACK'                            },
    { t:'11:16:53', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'overriding disposition for track track-f8a3b2c1-4d5e-6f7a-8b9c-0d1e' },
    { t:'11:16:54', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'Asset asset-01 tasked to perform ISR on Track track-f8a3b2c1-4d5e…'  },
    { t:'11:16:54', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'Task created - view Lattice UI, task id is c7d8e9f0-1a2b-3c4d-5e6f…' },
    { t:'11:16:54', l:'I', lC:C.dim, logger:'SIMASSET', logC:C.friendly, msg:'received execute request, sending execute confirmation'               },
    { t:'11:16:56', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'Current task status for this task_id is STATUS_EXECUTING'             },
    { t:'11:16:57', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'INVESTIGATION ALREADY IN PROGRESS - SKIPPING'                        },
    { t:'11:16:58', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'# of assets being tracked: 2, # of tracks being tracked: 1'          },
    { t:'11:16:59', l:'I', lC:C.dim, logger:'EARS',     logC:C.assumed,  msg:'# of assets being tracked: 2, # of tracks being tracked: 1'          },
  ];
  LOG_ENTRIES.forEach(function(e) {
    var row = mkFrame({ gap:8, px:12, py:2, crossAlign:'MIN', stretch:true });
    row.fills = [];
    row.appendChild(txt(e.t,         { size:11, color:C.ghost, family:MONO.family, style:MONO.style }));
    row.appendChild(txt(e.l,         { size:11, color:e.lC,    family:MONO.family, style:MONO.style, weight:'Medium', w:16 }));
    row.appendChild(txt(e.logger+':', { size:11, color:e.logC,  family:MONO.family, style:MONO.style, weight:'Medium' }));
    row.appendChild(txt(e.msg,       { size:11, color:C.dim,   family:MONO.family, style:MONO.style, grow:true }));
    row.primaryAxisSizingMode = 'FIXED';
    body.appendChild(row);
  });

  k.appendChild(hdr);
  k.appendChild(body);
  page.appendChild(k);
  k.x = X; k.y = Y; X += 620 + RGAP;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROW 4 — Template
// ═══════════════════════════════════════════════════════════════════════════════
X = 100; Y += 620;

// ── 13. DashboardLayout ──────────────────────────────────────────────────────
// Source: flex flex-col h-screen bg-canvas text-ink
// Header: flex items-center justify-between px-4 h-12=48px border-b bg-panel shrink-0
// Metrics: grid grid-cols-4 gap-px=1 border-b bg-border shrink-0
// Main: grid grid-cols-[300px_1fr_300px] gap-px h-full bg-border
{
  const k = figma.createComponent();
  k.name = 'DashboardLayout';
  al(k, { dir:'VERTICAL', gap:0, crossAlign:'MIN', main:'FIXED', cross:'FIXED' });
  k.fills = solid(C.canvas);
  k.resize(1440, 900); k.clipsContent = true;

  // ── Header: h-12=48px, SPACE_BETWEEN, left group + right group
  const hdrBar = mkFrame({
    mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16,
    bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE',
    stretch:true, cross:'FIXED',
  });
  hdrBar.resize(hdrBar.width, 48);
  // Left group: EARS acronym + 1px divider + full title
  const hdrLeft = mkFrame({ gap:12, crossAlign:'CENTER' });
  hdrLeft.fills = [];
  hdrLeft.appendChild(txt('EARS', { size:11, weight:'Bold', color:C.ghost }));
  const hdrDivider = figma.createRectangle();
  hdrDivider.fills = solid(C.border);
  hdrDivider.resize(1, 16);
  hdrLeft.appendChild(hdrDivider);
  hdrLeft.appendChild(txt('Entity Auto Reconnaissance System', { size:14, weight:'Semi Bold' }));
  hdrBar.appendChild(hdrLeft);
  // Right group: animated dot + LIVE label
  const hdrRight = mkFrame({ gap:8, crossAlign:'CENTER' });
  hdrRight.fills = [];
  hdrRight.appendChild(dot(C.friendly, 6));
  hdrRight.appendChild(txt('LIVE', { size:10, color:C.friendly, weight:'Semi Bold' }));
  hdrBar.appendChild(hdrRight);

  // ── Metrics strip: 4 cards separated by 1px gap-px (bg-border shows through)
  const metricsStrip = mkFrame({
    gap:1, px:0, py:0, bg:C.border, crossAlign:'MIN',
    stretch:true, name:'metrics',
  });
  const METRICS = [
    { label:'ASSETS',             value:'2',    sub:'TEMPLATE_ASSET',   accent:false },
    { label:'TRACKS',             value:'1',    sub:'TEMPLATE_TRACK',   accent:false },
    { label:'ACTIVE TASKS',       value:'1',    sub:'STATUS_EXECUTING', accent:true  },
    { label:'DISTANCE THRESHOLD', value:'5 mi', sub:'Proximity trigger', accent:false },
  ];
  for (var mi = 0; mi < METRICS.length; mi++) {
    var md = METRICS[mi];
    const card = mkFrame({ dir:'VERTICAL', gap:4, px:16, py:12, bg:C.panel, crossAlign:'MIN' });
    card.strokes = border(md.accent ? C.accent : C.border, md.accent ? 0.30 : 1);
    card.strokeWeight = 1; card.strokeAlign = 'INSIDE';
    card.layoutGrow  = 1;
    card.layoutAlign = 'STRETCH';
    card.appendChild(txt(md.label, { size:10, color:C.ghost, weight:'Medium' }));
    card.appendChild(txt(md.value, { size:24, color:md.accent ? C.accent : C.ink, weight:'Bold' }));
    card.appendChild(txt(md.sub,   { size:10, color:C.ghost }));
    metricsStrip.appendChild(card);
  }

  // ── Main area: grid grid-cols-[300px_1fr_300px] gap-px h-full bg-border
  const mainArea = mkFrame({ gap:1, bg:C.border, stretch:true, grow:true, name:'main' });

  // Left col (300px fixed): EntityPanel "all" instance
  const leftCol = mkFrame({ dir:'VERTICAL', gap:0, bg:C.canvas, name:'left', cross:'FIXED' });
  leftCol.resize(300, 10);
  leftCol.layoutAlign = 'STRETCH';
  const epInst = epVariants[0].createInstance();
  epInst.layoutAlign = 'STRETCH';
  epInst.layoutGrow = 1;
  leftCol.appendChild(epInst);

  // Center col (flex-1): ProximityAlerts section (shrink-0) + SystemLog (flex-1)
  const centerCol = mkFrame({ dir:'VERTICAL', gap:1, bg:C.border, name:'center' });
  centerCol.layoutGrow  = 1;
  centerCol.layoutAlign = 'STRETCH';
  // ProximityAlerts section: p-3=12, gap-2=8, border-b bg-panel shrink-0
  const proxSection = mkFrame({ dir:'VERTICAL', gap:8, px:12, py:12,
                                  bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE',
                                  stretch:true, name:'ProximityAlerts' });
  proxSection.appendChild(txt('PROXIMITY ALERTS', { size:11, weight:'Semi Bold', color:C.ghost }));
  const proxInst = proxVariants[0].createInstance(); // WithinRange
  proxInst.layoutAlign = 'STRETCH';
  proxSection.appendChild(proxInst);
  centerCol.appendChild(proxSection);
  // SystemLog: flex-1, fill remaining height
  const logInst = slComp.createInstance();
  logInst.layoutAlign = 'STRETCH';
  logInst.layoutGrow = 1;
  centerCol.appendChild(logInst);

  // Right col (300px fixed): TaskPanel "WithTasks" instance
  const rightCol = mkFrame({ dir:'VERTICAL', gap:0, bg:C.canvas, name:'right', cross:'FIXED' });
  rightCol.resize(300, 10);
  rightCol.layoutAlign = 'STRETCH';
  const tpInst = tpVariants[0].createInstance(); // WithTasks
  tpInst.layoutAlign = 'STRETCH';
  tpInst.layoutGrow = 1;
  rightCol.appendChild(tpInst);

  mainArea.appendChild(leftCol);
  mainArea.appendChild(centerCol);
  mainArea.appendChild(rightCol);

  k.appendChild(hdrBar);
  k.appendChild(metricsStrip);
  k.appendChild(mainArea);
  page.appendChild(k);
  k.x = X; k.y = Y;
}

figma.viewport.scrollAndZoomIntoView(page.children);
figma.closePlugin('✓ 13 components created on the Components page.');

})();
