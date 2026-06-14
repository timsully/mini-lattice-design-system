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
try { await figma.loadFontAsync(MONO); } catch(_) { MONO = { family:'Inter', style:'Regular' }; }

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
  if (o.grow)  t.layoutGrow = 1;
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
  if (o.w)      { c.primaryAxisSizingMode = 'FIXED'; c.resize(o.w, 10); }
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
  if (o.stretch) f.layoutAlign = 'STRETCH';
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
    { v:'Asset', bg:C.assumed,    bgO:0.10, color:C.assumed,    label:'ASSET', platform:'USV' },
    { v:'Track', bg:C.suspicious, bgO:0.10, color:C.suspicious, label:'TRACK', platform:null  },
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
// Source: flex flex-col gap-2 rounded-sm border border-border bg-card px-3 py-2.5
// gap-2=8  rounded-sm=2  px-3=12  py-2.5=10  border:1px
// Width: fill container (no fixed w)  Height: hug content
//
// nameRow: flex items-start justify-between gap-2
//   left:  flex flex-col gap-1 (gap:4)  → name text-sm=14px + id text-[10px]
//   right: LiveBadge shrink-0
// badgeRow: flex flex-wrap gap-1.5 (gap:6)
// metaRow: grid grid-cols-2 gap-x-4 gap-y-0.5 → two vertical columns
{
  const k = mkComp('EntityRow', { dir:'VERTICAL', gap:8, px:12, py:10, radius:2,
                                   bg:C.card, stroke:C.border, sw:1, sa:'INSIDE' });

  // nameRow — fills width, items-start justify-between
  const nameRow = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'MIN', gap:8, stretch:true });
  const nameLeft = mkFrame({ dir:'VERTICAL', gap:4 });
  nameLeft.appendChild(txt('Simulated Asset', { size:14, weight:'Semi Bold', name:'Name' }));
  nameLeft.appendChild(txt('ID: asset-01', { size:10, color:C.ghost, family:MONO.family, style:MONO.style, name:'EntityId' }));
  nameRow.appendChild(nameLeft);
  // Right badge slot placeholder
  const livePlaceholder = mkFrame({ px:6, py:2, gap:4, radius:4, bg:C.friendly, name:'LiveBadge' });
  livePlaceholder.fills = [{ type:'SOLID', color:C.friendly, opacity:0.10 }];
  livePlaceholder.appendChild(dot(C.friendly));
  livePlaceholder.appendChild(txt('LIVE', { size:10, color:C.friendly, weight:'Semi Bold' }));
  nameRow.appendChild(livePlaceholder);

  // badgeRow — flex-wrap gap-1.5=6
  const badgeRow = mkFrame({ gap:6, crossAlign:'CENTER' });
  const tmplBadge = mkFrame({ px:6, py:2, gap:4, radius:4 });
  tmplBadge.fills = [{ type:'SOLID', color:C.assumed, opacity:0.10 }];
  tmplBadge.appendChild(txt('ASSET', { size:10, color:C.assumed, weight:'Semi Bold', name:'Template' }));
  const dispBadge = mkFrame({ px:6, py:2, gap:6, radius:4 });
  dispBadge.fills = [{ type:'SOLID', color:C.friendly, opacity:0.12 }];
  dispBadge.appendChild(dot(C.friendly));
  dispBadge.appendChild(txt('FRIENDLY', { size:10, color:C.friendly, weight:'Semi Bold', name:'Disposition' }));
  badgeRow.appendChild(tmplBadge);
  badgeRow.appendChild(dispBadge);

  // metaRow — grid-cols-2 gap-x-4 gap-y-0.5 → two side-by-side vertical columns
  const metaRow = mkFrame({ gap:16, crossAlign:'MIN', stretch:true });
  const metaLeft = mkFrame({ dir:'VERTICAL', gap:2, grow:true });
  metaLeft.appendChild(txt('LOCATION', { size:10, color:C.ghost, weight:'Medium', name:'LatLabel' }));
  metaLeft.appendChild(txt('1.0000°, 1.0000°', { size:11, color:C.dim, family:MONO.family, style:MONO.style, name:'Latitude' }));
  metaLeft.appendChild(txt('DATA TYPE', { size:10, color:C.ghost, weight:'Medium', name:'DataTypeLabel' }));
  metaLeft.appendChild(txt('Simulated Asset', { size:11, color:C.dim, name:'DataType' }));
  const metaRight = mkFrame({ dir:'VERTICAL', gap:2, grow:true });
  metaRight.appendChild(txt('ENVIRONMENT', { size:10, color:C.ghost, weight:'Medium', name:'EnvLabel' }));
  metaRight.appendChild(txt('SURFACE', { size:11, color:C.dim, name:'Environment' }));
  metaRight.appendChild(txt('UPDATED', { size:10, color:C.ghost, weight:'Medium', name:'UpdatedLabel' }));
  metaRight.appendChild(txt('12:34:56', { size:11, color:C.dim, name:'UpdatedAt' }));
  metaRow.appendChild(metaLeft);
  metaRow.appendChild(metaRight);

  k.appendChild(nameRow);
  k.appendChild(badgeRow);
  k.appendChild(metaRow);
  page.appendChild(k);
  k.x = X; k.y = Y; X += k.width + RGAP;
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
    row1.appendChild(txt('c7d8e9f0', { size:10, color:C.ghost, family:MONO.family, style:MONO.style, name:'TaskId' }));

    // row2: gap-1.5=6 items-center
    const row2 = mkFrame({ gap:6, crossAlign:'CENTER' });
    row2.appendChild(txt('asset-01',  { size:11, color:C.ghost,    name:'Assignee' }));
    row2.appendChild(txt('→',         { size:11, color:C.ghost     }));
    row2.appendChild(txt('track-abc', { size:11, color:C.suspicious, name:'Target' }));

    k.appendChild(row1);
    k.appendChild(row2);
    k.appendChild(txt('Asset tasked to perform ISR on Track', { size:11, color:C.ghost, name:'Description' }));
    k.appendChild(txt('Initiated by auto-reconnaissance',      { size:10, color:C.ghost, name:'Author'      }));
    page.appendChild(k); return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'TaskRow'; styleSet(set, 16);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 7. ProximityAlert ────────────────────────────────────────────────────────
// Source: flex items-start gap-3 rounded-sm border px-3 py-2.5
// HORIZONTAL  gap-3=12  rounded-sm=2  px-3=12  py-2.5=10  border:1px
// Width: fill container  Height: hug content
// left:  ⚠ icon text-base=16px shrink-0
// right: flex flex-col gap-0.5=2
//   nameRow: flex items-center gap-1.5=6 text-[11px]
//   metaRow: flex items-center gap-3=12  text-[10px]
{
  const PROX = [
    { v:'True',  alertC:C.suspicious, bgO:0.05, bdO:0.40, distC:C.suspicious, dist:'2.93' },
    { v:'False', alertC:C.ghost,      bgO:0.00, bdO:0.30, distC:C.dim,        dist:'7.50' },
  ];
  const variants = PROX.map(function(d) {
    const k = figma.createComponent();
    k.name = 'WithinRange='+d.v;
    al(k, { gap:12, px:12, py:10, crossAlign:'MIN' });
    k.cornerRadius = 2;
    k.fills  = d.bgO > 0 ? [{ type:'SOLID', color:d.alertC, opacity:d.bgO }] : solid(C.card);
    k.strokes = border(d.alertC, d.bdO); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';

    // Left: warning icon
    k.appendChild(txt('⚠', { size:16, color:d.alertC, name:'Icon' }));

    // Right: flex-col gap-0.5=2
    const right = mkFrame({ dir:'VERTICAL', gap:2, crossAlign:'MIN' });

    const nameRow = mkFrame({ gap:6, crossAlign:'CENTER' });
    nameRow.appendChild(txt('asset-01',        { size:11, weight:'Semi Bold', name:'AssetName'  }));
    nameRow.appendChild(txt('within range of', { size:11, color:C.ghost }));
    nameRow.appendChild(txt('track-abc',       { size:11, weight:'Semi Bold', color:C.suspicious, name:'TrackName' }));

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
    { v:'False', valC:C.ink,   stroked:false },
    { v:'True',  valC:C.accent, stroked:true  },
  ];
  const variants = METRIC.map(function(d) {
    const k = figma.createComponent();
    k.name = 'Highlight='+d.v;
    al(k, { dir:'VERTICAL', gap:4, px:16, py:12, crossAlign:'MIN' });
    k.cornerRadius = 2;
    k.fills = solid(C.panel);
    k.strokes = border(d.stroked ? C.accent : C.border, d.stroked ? 0.30 : 1);
    k.strokeWeight = 1; k.strokeAlign = 'INSIDE';
    k.appendChild(txt('LABEL', { size:10, color:C.ghost, weight:'Medium', name:'Label' }));
    k.appendChild(txt('42',    { size:24, color:d.valC,  weight:'Bold',   name:'Value' }));
    k.appendChild(txt('sublabel', { size:10, color:C.ghost, name:'Sublabel' }));
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
  const FILTERS = [
    { v:'All',    label:'Entities',        sub:'2 assets · 1 track' },
    { v:'Assets', label:'Entities',        sub:'2 assets'           },
    { v:'Tracks', label:'Entities',        sub:'1 track'            },
  ];
  const variants = FILTERS.map(function(d) {
    const k = figma.createComponent();
    k.name = 'Filter='+d.v;
    al(k, { dir:'VERTICAL', gap:0, crossAlign:'MIN', main:'FIXED', cross:'FIXED' });
    k.cornerRadius = 2;
    k.fills = solid(C.panel);
    k.strokes = border(C.border); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';
    k.resize(300, 480); k.clipsContent = true;

    // Header: px-4=16 py-3=12 border-bottom
    const hdr = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16, py:12,
                           bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE', stretch:true });
    hdr.appendChild(txt(d.label.toUpperCase(), { size:11, weight:'Semi Bold', color:C.ghost, name:'PanelTitle' }));
    hdr.appendChild(txt(d.sub, { size:10, color:C.ghost, name:'PanelCount' }));

    // Body: flex-1 (grow + stretch), inner gap-px=1 p-2=8
    const body = mkFrame({ dir:'VERTICAL', gap:1, px:8, py:8, bg:C.panel, stretch:true, grow:true });
    body.appendChild(txt('Entity rows render here', { size:11, color:C.ghost }));

    k.appendChild(hdr);
    k.appendChild(body);
    page.appendChild(k); return k;
  });
  const set = figma.combineAsVariants(variants, page);
  set.name = 'EntityPanel'; styleSet(set, 20);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 10. TaskPanel ─────────────────────────────────────────────────────────────
{
  const k = figma.createComponent();
  k.name = 'TaskPanel';
  al(k, { dir:'VERTICAL', gap:0, crossAlign:'MIN', main:'FIXED', cross:'FIXED' });
  k.cornerRadius = 2;
  k.fills = solid(C.panel);
  k.strokes = border(C.border); k.strokeWeight = 1; k.strokeAlign = 'INSIDE';
  k.resize(300, 480); k.clipsContent = true;

  const hdr = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16, py:12,
                         bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE', stretch:true });
  hdr.appendChild(txt('ACTIVE TASKS', { size:11, weight:'Semi Bold', color:C.ghost }));
  const countRow = mkFrame({ gap:4, crossAlign:'CENTER' });
  countRow.appendChild(txt('1', { size:10, color:C.executing, weight:'Semi Bold' }));
  countRow.appendChild(txt('active', { size:10, color:C.ghost }));
  hdr.appendChild(countRow);

  const body = mkFrame({ dir:'VERTICAL', gap:1, px:8, py:8, bg:C.panel, stretch:true, grow:true });
  body.appendChild(txt('Task rows render here', { size:11, color:C.ghost }));

  k.appendChild(hdr);
  k.appendChild(body);
  page.appendChild(k);
  k.x = X; k.y = Y; X += 300 + RGAP;
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
  const LEVELS = [
    { level:'INFO',  col:C.dim,        letter:'I' },
    { level:'WARN',  col:C.suspicious, letter:'W' },
    { level:'ERROR', col:C.hostile,    letter:'E' },
  ];
  const LOGGERS = [
    { logger:'EARS',     col:C.assumed   },
    { logger:'SIMASSET', col:C.friendly  },
    { logger:'SIMTRACK', col:C.suspicious },
  ];
  const variants = [];
  for (var li = 0; li < LEVELS.length; li++) {
    var ld = LEVELS[li];
    for (var gi = 0; gi < LOGGERS.length; gi++) {
      var lg = LOGGERS[gi];
      const k = figma.createComponent();
      k.name = 'Level='+ld.level+', Logger='+lg.logger;
      // HORIZONTAL, items-start (crossAlign MIN), px-3=12 py-0.5=2, gap-2=8
      // Width FIXED at 560; height hugs (AUTO)
      al(k, { gap:8, px:12, py:2, crossAlign:'MIN', main:'FIXED', cross:'AUTO' });
      k.fills = solid(C.card);
      k.resize(560, 10);
      // timestamp — shrink-0 (hug)
      k.appendChild(txt('12:34:56', { size:11, color:C.ghost,
                                       family:MONO.family, style:MONO.style, name:'Timestamp' }));
      // level initial — w-5=20px fixed width
      k.appendChild(txt(ld.letter, { size:11, color:ld.col, weight:'Semi Bold',
                                      family:MONO.family, style:MONO.style,
                                      name:'LevelInitial', w:20 }));
      // logger — shrink-0
      k.appendChild(txt(lg.logger+':', { size:11, color:lg.col, weight:'Semi Bold',
                                          family:MONO.family, style:MONO.style, name:'Logger' }));
      // message — fills remaining width
      k.appendChild(txt('Entity published successfully to lattice',
                         { size:11, color:C.dim, family:MONO.family, style:MONO.style,
                           name:'Message', grow:true }));
      page.appendChild(k);
      variants.push(k);
    }
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = 'SystemLogEntry'; styleSet(set, 4);
  set.x = X; set.y = Y; X += set.width + RGAP;
}

// ── 12. SystemLog ─────────────────────────────────────────────────────────────
// Source: flex flex-col h-full bg-panel border border-border rounded-sm
// Header: flex items-center justify-between px-4 py-3 border-b border-border
// Body:   flex-1 overflow-y-auto → inner flex flex-col py-1 (py:4px no horiz padding)
{
  const k = figma.createComponent();
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

  // Body inner: flex flex-col py-1=4px, no horizontal padding
  const body = mkFrame({ dir:'VERTICAL', gap:0, pt:4, pb:4, bg:C.canvas, stretch:true, grow:true });
  body.appendChild(txt('Log entries render here', { size:11, color:C.ghost, family:MONO.family, style:MONO.style }));

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
//          (bg-border between cards creates the 1px gap illusion)
// Main: flex-1 overflow-hidden → layoutGrow=1
{
  const k = figma.createComponent();
  k.name = 'DashboardLayout';
  al(k, { dir:'VERTICAL', gap:0, crossAlign:'MIN', main:'FIXED', cross:'FIXED' });
  k.fills = solid(C.canvas);
  k.resize(1440, 900); k.clipsContent = true;

  // ── Header bar: h-12=48px, px-4=16px, SPACE_BETWEEN, shrink-0
  const hdrBar = mkFrame({
    mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16,
    bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE',
    stretch:true, cross:'FIXED',
  });
  hdrBar.resize(hdrBar.width, 48);
  hdrBar.appendChild(txt('EARS — Entity Auto Reconnaissance System', { size:13, weight:'Semi Bold' }));
  const livePill = mkFrame({ gap:4, px:6, py:2, bg:C.card, radius:4 });
  livePill.appendChild(dot(C.friendly, 6));
  livePill.appendChild(txt('LIVE', { size:10, color:C.friendly, weight:'Semi Bold' }));
  hdrBar.appendChild(livePill);

  // ── Metrics strip: grid-cols-4 gap-px=1 bg-border (gap shows as border lines)
  //    shrink-0 → counterAxisSizingMode FIXED, height hugs card content
  const metricsStrip = mkFrame({
    gap:1, px:0, py:0, bg:C.border, crossAlign:'STRETCH',
    stretch:true, name:'metrics',
  });
  const METRICS = [
    { label:'ASSETS',             value:'2',    sub:'TEMPLATE_ASSET'    },
    { label:'TRACKS',             value:'1',    sub:'TEMPLATE_TRACK'    },
    { label:'ACTIVE TASKS',       value:'1',    sub:'STATUS_EXECUTING'  },
    { label:'DISTANCE THRESHOLD', value:'5 mi', sub:'Proximity trigger' },
  ];
  for (var mi = 0; mi < METRICS.length; mi++) {
    var md = METRICS[mi];
    const card = mkFrame({ dir:'VERTICAL', gap:4, px:16, py:12, bg:C.panel, crossAlign:'MIN' });
    card.layoutGrow  = 1;         // equal width fill (replaces grid-cols-4)
    card.layoutAlign = 'STRETCH'; // fills strip height
    card.appendChild(txt(md.label,  { size:10, color:C.ghost,  weight:'Medium' }));
    card.appendChild(txt(md.value,  { size:24, color:mi===2?C.accent:C.ink, weight:'Bold' }));
    card.appendChild(txt(md.sub,    { size:10, color:C.ghost   }));
    metricsStrip.appendChild(card);
  }

  // ── Main area: flex-1 overflow-hidden → layoutGrow=1
  const mainArea = mkFrame({ gap:0, bg:C.canvas, stretch:true, grow:true, name:'main' });

  // Left col: EntityPanel, 300px fixed width, fill height
  const leftCol = mkFrame({ dir:'VERTICAL', gap:0, bg:C.panel, name:'EntityPanel', cross:'FIXED' });
  leftCol.resize(300, 10);
  leftCol.layoutAlign = 'STRETCH';
  const leftHdr = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16, py:12,
                              bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE', stretch:true });
  leftHdr.appendChild(txt('ENTITIES', { size:11, weight:'Semi Bold', color:C.ghost }));
  leftHdr.appendChild(txt('2 assets · 1 track', { size:10, color:C.ghost }));
  leftCol.appendChild(leftHdr);

  // Center col: SystemLog + ProximityAlert, fills remaining width
  const centerCol = mkFrame({ dir:'VERTICAL', gap:12, px:12, py:12, bg:C.canvas, name:'center' });
  centerCol.layoutGrow  = 1;
  centerCol.layoutAlign = 'STRETCH';
  centerCol.appendChild(txt('ProximityAlert + SystemLog', { size:11, color:C.ghost }));

  // Right col: TaskPanel, 300px fixed width, fill height
  const rightCol = mkFrame({ dir:'VERTICAL', gap:0, bg:C.panel, name:'TaskPanel', cross:'FIXED' });
  rightCol.resize(300, 10);
  rightCol.layoutAlign = 'STRETCH';
  const rightHdr = mkFrame({ mainAlign:'SPACE_BETWEEN', crossAlign:'CENTER', px:16, py:12,
                               bg:C.panel, stroke:C.border, sw:1, sa:'OUTSIDE', stretch:true });
  rightHdr.appendChild(txt('ACTIVE TASKS', { size:11, weight:'Semi Bold', color:C.ghost }));
  rightHdr.appendChild(txt('1 active', { size:10, color:C.ghost }));
  rightCol.appendChild(rightHdr);

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
