/**
 * gantt.js —— 施工阶段甘特图 / 进度计划横道图（v2.9.0 新增）
 *
 * 职责（与 app.js 解耦，纯函数 + DOM 生成，不碰 IndexedDB）：
 *   1. ganttModel(stages)   —— 把项目阶段整理成统一的行模型（排序 / 工期 / 完成状态）
 *   2. ganttSVG(model, opt) —— 生成 SVG 图（两种形态共用，保证「项目内嵌」与「横道图导出」一致）
 *        - compact 模式：项目详情页内嵌，窄宽度、横向滚动
 *        - full    模式：横道图导出页，带左侧信息表（序号/名称/开始/结束/工期）
 *   3. 导出：SVG 源文件 / PNG（svg→canvas→blob）/ Excel（.xlsx，零依赖手写 zip）
 *
 * 约定：
 *   - 日期一律 'YYYY-MM-DD' 字符串；天数含首尾（工期 = end-start+1）
 *   - 颜色只引用 Token（var(--chart-n) / --border / --text ...），与全站图表同色（verify 门禁）
 *   - 不引入任何第三方库；xlsx 为 STORE（不压缩）zip，手写 CRC32
 */

/* ---------------- 模型 ---------------- */

/** 解析 'YYYY-MM-DD' → 自 1970 起的天数（本地时区，避免 UTC 偏移导致差一天） */
function gDay(iso) {
  if (!iso) return NaN;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  if (!m) return NaN;
  return Math.round(new Date(+m[1], +m[2] - 1, +m[3]).getTime() / 864e5);
}
/** 天数 → 'YYYY-MM-DD' */
function gIso(n) {
  const d = new Date(n * 864e5);
  const p = (x) => String(x).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/**
 * 阶段数据 → 甘特行模型
 * 行规则：有 planStart/planEnd 用预计；缺起止时用实际完成日或项目工期兜底，
 *        保证「只填了名字」的阶段也能出现在图上（排在末尾）。
 * @param {Array} stages 项目阶段原数组
 * @param {Object} proj  项目对象（startDate/endDate 作兜底）
 */
function ganttModel(stages, proj) {
  const list = (stages || []).map((s, i) => {
    let start = gDay(s.planStart);
    let end = gDay(s.planEnd);
    const act = gDay(s.date); // 实际完成日
    if (isNaN(start) && !isNaN(act)) start = act;
    if (isNaN(end) && !isNaN(act)) end = act;
    if (isNaN(start) && !isNaN(end)) start = end;
    if (!isNaN(start) && isNaN(end)) end = start;
    return {
      i, id: s.id, name: s.name || ('阶段' + (i + 1)),
      start, end, act, done: !!s.done,
      milestone: !!s.milestone,     // 里程碑：只画◆，不占工期
      pred: s.pred || '',           // 前置阶段 id（可选；不填则不参与依赖图与关键路径）
      raw: s
    };
  });
  // 无任何日期的行排在最后，其余按开始日升序（同日按原顺序）
  const hasDate = (r) => !isNaN(r.start);
  list.sort((a, b) => {
    if (hasDate(a) !== hasDate(b)) return hasDate(a) ? -1 : 1;
    if (!hasDate(a)) return a.i - b.i;
    return (a.start - b.start) || (a.i - b.i);
  });
  const dated = list.filter(hasDate);
  const lo = dated.length ? Math.min.apply(null, dated.map((r) => r.start)) : (gDay(proj && proj.startDate) || gDay(today()));
  const hi = dated.length ? Math.max.apply(null, dated.map((r) => r.end)) : lo;
  const byId = {};
  list.forEach((r) => { byId[r.id] = r; });
  // 关键路径：依赖图上「累计工期最长」的那条链路（无显式前置时为空集）
  const crit = ganttCriticalPath(list, byId);
  return {
    rows: list,
    day0: lo,                       // 时间轴起点（天）
    dayN: Math.max(hi, lo),         // 时间轴终点
    totalDays: Math.max(hi, lo) - lo + 1,
    doneN: list.filter((r) => r.done).length,
    critical: crit.ids,             // Set<id> 关键路径上的阶段
    criticalDays: crit.days,        // 关键链路累计天数
    byId: byId
  };
}

/**
 * 关键路径（CPM 简化版）：在「前置 → 后继」有向图上找累计工期最长的链路。
 * 只在用户显式设置了前置阶段时才有意义；没设时返回空集，由 UI 提示先设置前置。
 */
function ganttCriticalPath(rows, byId) {
  const ids = new Set(), memo = {};
  let bestLen = 0, bestTail = null;
  const lenOf = (r, seen) => {
    if (memo[r.id] != null) return memo[r.id];
    if (seen[r.id]) return { d: 0, tail: null };      // 环保护
    seen[r.id] = 1;
    const p = r.pred && byId[r.pred];
    const up = p ? lenOf(p, seen) : { d: 0, tail: null };
    const own = (isNaN(r.start) || isNaN(r.end)) ? 0 : (r.end - r.start + 1);
    const res = { d: up.d + own, tail: up.tail ? up.tail : (p ? p.id : null) };
    memo[r.id] = res;
    return res;
  };
  rows.forEach((r) => {
    const L = lenOf(r, {});
    if (L.d > bestLen) { bestLen = L.d; bestTail = r.id; }
  });
  if (!bestTail) return { ids: ids, days: 0 };
  // 回溯最长链路上的全部节点
  let cur = bestTail, guard = 0;
  while (cur && guard++ < 500) {
    ids.add(cur);
    cur = byId[cur] ? byId[cur].pred : null;
    if (!byId[cur]) break;
  }
  return { ids: ids, days: bestLen };
}

/** 行在图上的展示日期（无日期行显示 '—'） */
function gRowDates(r) {
  return {
    s: isNaN(r.start) ? '' : gIso(r.start),
    e: isNaN(r.end) ? '' : gIso(r.end),
    days: (isNaN(r.start) || isNaN(r.end)) ? 0 : (r.end - r.start + 1)
  };
}

/* ---------------- SVG 生成 ---------------- */

/** 刻度稀疏化：按时间轴宽度决定每几天一个刻度（甘特图/横道图共用，页面信息与图内保持一致） */
function ganttTickStep(model, timelineWidth) {
  const dayW = timelineWidth / Math.max(1, model.dayN - model.day0 + 1);
  return dayW < 3 ? 14 : dayW < 6 ? 7 : dayW < 14 ? 2 : 1;
}

/**
 * 生成甘特/横道图 SVG 节点
 * @param {Object} model ganttModel 结果
 * @param {Object} opt   {title, withTable, width, rowH, projectLabel}
 */
function ganttSVG(model, opt) {
  opt = opt || {};
  const withTable = !!opt.withTable;
  const rowH = opt.rowH || (withTable ? 34 : 28);
  const headH = 46;                       // 月份带 + 刻度带
  const rows = model.rows;
  const n = rows.length;
  const bodyH = Math.max(1, n) * rowH + 8;
  const footH = 30;

  // —— 左表宽度（full 模式）——
  const COLS = withTable
    ? [{ w: 34, k: 'idx' }, { w: 150, k: 'name' }, { w: 84, k: 'start' }, { w: 84, k: 'end' }, { w: 52, k: 'days' }]
    : [{ w: 104, k: 'name' }];
  const leftW = COLS.reduce((a, c) => a + c.w, 0);

  // —— 时间轴刻度：dayWidth 由总天数决定，太密就按周/双周取刻度 ——
  const span = Math.max(1, model.dayN - model.day0 + 1);
  const targetTL = opt.timelineWidth || (withTable ? 720 : 520);
  const dayW = targetTL / span;
  const step = ganttTickStep(model, targetTL);          // 每 step 天一个刻度（稀疏化，与外部展示共用）
  const tlW = Math.round(span * dayW);
  const W = leftW + tlW + 16;
  const H = headH + bodyH + footH + (opt.title ? 34 : 6);

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('xmlns', NS);
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('font-family', 'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif');

  const el = (tag, attrs, text) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    svg.appendChild(e);
    return e;
  };

  // —— 配色：全部读 Token，深浅主题自动适配 ——
  const cs = getComputedStyle(document.documentElement);
  const V = (k, d) => (cs.getPropertyValue(k) || '').trim() || d;
  const C = {
    bg: V('--surface', '#fff'), grid: V('--border', '#e3e7e3'), gridSoft: V('--border', '#e3e7e3'),
    text: V('--text', '#1d2420'), dim: V('--text-dim', '#66756b'),
    head: V('--surface-2', '#f2f4f2'), today: V('--danger', '#cc4b37'),
    pal: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => V('--chart-' + i, '#8a8a8a'))
  };
  const left = withTable ? 0 : 0;
  const TLX = leftW, TLY = opt.title ? 34 : 6;

  // 背景
  el('rect', { x: 0, y: 0, width: W, height: H, fill: C.bg });
  if (opt.title) {
    el('text', { x: 8, y: 22, 'font-size': 15, 'font-weight': 700, fill: C.text }, opt.title);
  }

  // —— 月份带 ——
  const months = [];
  let cur = null;
  for (let d = model.day0; d <= model.dayN; d++) {
    const dt = new Date(d * 864e5);
    const key = dt.getFullYear() + '-' + (dt.getMonth() + 1);
    if (!cur || cur.key !== key) { cur = { key, y: dt.getFullYear(), m: dt.getMonth() + 1, from: d }; months.push(cur); }
    cur.to = d;
  }
  months.forEach((mo) => {
    const x = TLX + (mo.from - model.day0) * dayW;
    const w = (mo.to - mo.from + 1) * dayW;
    el('rect', { x, y: TLY, width: w, height: 24, fill: C.head, stroke: C.grid, 'stroke-width': .5 });
    if (w > 34) el('text', { x: x + w / 2, y: TLY + 16, 'font-size': 11, 'text-anchor': 'middle', fill: C.text }, mo.y + '年' + mo.m + '月');
  });

  // —— 刻度带（按 step 天）——
  el('rect', { x: TLX, y: TLY + 24, width: tlW, height: 22, fill: C.bg, stroke: C.grid, 'stroke-width': .5 });
  for (let d = model.day0; d <= model.dayN; d += step) {
    const x = TLX + (d - model.day0) * dayW;
    el('line', { x1: x, y1: TLY, x2: x, y2: TLY + headH - 1, stroke: C.grid, 'stroke-width': .5 });
    const dt = new Date(d * 864e5);
    const lbl = (dt.getMonth() + 1) + '/' + dt.getDate();
    el('text', { x: x + 2, y: TLY + 38, 'font-size': 9, fill: C.dim }, lbl);
  }

  // —— 左表表头 ——
  if (withTable) {
    const hs = ['序号', '工作名称', '开始', '结束', '工期(天)'];
    let hx = 0;
    COLS.forEach((c, ci) => {
      el('rect', { x: hx, y: TLY, width: c.w, height: headH - 1, fill: C.head, stroke: C.grid, 'stroke-width': .5 });
      el('text', { x: hx + c.w / 2, y: TLY + 28, 'font-size': 11, 'font-weight': 600, 'text-anchor': 'middle', fill: C.text }, hs[ci]);
      hx += c.w;
    });
  } else {
    el('rect', { x: 0, y: TLY, width: leftW, height: headH - 1, fill: C.head, stroke: C.grid, 'stroke-width': .5 });
    el('text', { x: 8, y: TLY + 28, 'font-size': 11, 'font-weight': 600, fill: C.text }, '阶段');
  }

  // —— 行 + 横道 ——
  const bodyY = TLY + headH;
  const bars = [];                 // 拖拽改期用：{rect, row, idx}
  const geom = {};                 // id → {x, x2, yc} 依赖连线用
  const critIds = model.critical || new Set();
  rows.forEach((r, idx) => {
    const y = bodyY + idx * rowH;
    // 斑马纹
    if (idx % 2 === 1) el('rect', { x: 0, y, width: W, height: rowH, fill: C.gridSoft, opacity: .18 });
    el('line', { x1: 0, y1: y + rowH, x2: W, y2: y + rowH, stroke: C.grid, 'stroke-width': .5 });

    // 左表内容
    const dts = gRowDates(r);
    if (withTable) {
      let hx = 0;
      const cells = [
        { t: String(idx + 1), a: 'middle' },
        { t: (r.done ? '✓ ' : '') + r.name, a: 'start' },
        { t: dts.s || '—', a: 'middle' },
        { t: dts.e || '—', a: 'middle' },
        { t: dts.days ? String(dts.days) : '—', a: 'middle' }
      ];
      COLS.forEach((c, ci) => {
        const cx = c.a === 'middle' ? hx + c.w / 2 : hx + 6;
        el('text', {
          x: cx, y: y + rowH / 2 + 4, 'font-size': 11,
          'text-anchor': c.a || 'start', fill: ci === 1 ? C.text : C.dim,
          'font-weight': ci === 1 ? 600 : 400
        }, cells[ci].t);
        hx += c.w;
      });
      el('line', { x1: 0, y1: y, x2: leftW, y2: y, stroke: C.grid, 'stroke-width': .5 });
    } else {
      el('text', { x: 8, y: y + rowH / 2 + 4, 'font-size': 11, 'font-weight': 600, fill: C.text },
        truncStr((r.done ? '✓ ' : '') + r.name, 7));
    }

    // 网格（右时间区）
    for (let d = model.day0; d <= model.dayN; d += step) {
      const x = TLX + (d - model.day0) * dayW;
      el('line', { x1: x, y1: bodyY, x2: x, y2: bodyY + bodyH, stroke: C.gridSoft, 'stroke-width': .4 });
    }

    // 横道 / 里程碑
    if (!isNaN(r.start)) {
      const bx = TLX + (r.start - model.day0) * dayW;
      const bw = Math.max(3, (r.end - r.start + 1) * dayW - 2);
      const by = y + (rowH - 14) / 2;
      const yc = y + rowH / 2;
      const color = C.pal[idx % C.pal.length];
      const isCrit = critIds.has(r.id);
      const critAttr = isCrit ? { stroke: C.today, 'stroke-width': 1.6 } : {};
      geom[r.id] = { x: bx, x2: bx + bw, yc: yc };

      if (r.milestone) {
        // 里程碑：◆ 标记，不占工期（只记一个点）
        const s2 = Math.min(11, Math.max(8, rowH / 3));
        const pts = [bx + ',' + (yc - s2), (bx + s2) + ',' + yc, bx + ',' + (yc + s2), (bx - s2) + ',' + yc].join(' ');
        el('polygon', Object.assign({ points: pts, fill: isCrit ? C.today : color }, critAttr));
        if (rowH >= 26) el('text', { x: bx + s2 + 5, y: yc + 4, 'font-size': 9, fill: C.dim }, '★');
      } else {
        const rect = el('rect', Object.assign({
          x: bx, y: by, width: bw, height: 14, rx: 4, fill: color, opacity: r.done ? .45 : .92
        }, critAttr));
        // 实际完成：深色覆盖到实际完成日
        if (!isNaN(r.act) && r.act >= r.start) {
          const aw = Math.min(bw, (r.act - r.start + 1) * dayW - 2);
          el('rect', { x: bx, y: by, width: Math.max(3, aw), height: 14, rx: 4, fill: color });
        }
        if (bw > 30) {
          el('text', { x: bx + bw / 2, y: by + 11, 'font-size': 9, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 700 }, dts.days + '天');
        }
        if (opt.drag) { rect.style.touchAction = 'none'; rect.style.cursor = 'ew-resize'; }
        bars.push({ rect: rect, row: r, idx: idx });
      }
    }
  });

  // —— 依赖连线（前置 → 后继）——
  if (opt.deps) {
    rows.forEach((r) => {
      const p = r.pred && model.byId && model.byId[r.pred];
      if (!p || !geom[p.id] || !geom[r.id]) return;
      const a = geom[p.id], b = geom[r.id];
      const x1 = a.x2, y1 = a.yc, x2 = b.x, y2 = b.yc;
      const mx = Math.max(x1 + 6, x2 - 8);
      const isCrit = critIds.has(r.id) && critIds.has(p.id);
      const st = isCrit ? C.today : C.dim;
      el('path', { d: 'M' + x1 + ' ' + y1 + ' H' + mx + ' V' + y2 + ' H' + x2, fill: 'none', stroke: st, 'stroke-width': 1 });
      el('polygon', { points: (x2 - 5) + ',' + (y2 - 3.5) + ' ' + x2 + ',' + y2 + ' ' + (x2 - 5) + ',' + (y2 + 3.5), fill: st });
    });
  }

  // —— 拖拽改期（P2-11）：需显式开启，避免与横向滚动手势冲突 ——
  if (opt.drag && typeof opt.onChange === 'function') {
    ganttAttachDrag(svg, { bars: bars, dayW: dayW, day0: model.day0, tlx: TLX, onChange: opt.onChange });
  }

  // —— 今日虚线 ——
  const td = gDay(today());
  if (!isNaN(td) && td >= model.day0 && td <= model.dayN) {
    const x = TLX + (td - model.day0) * dayW;
    el('line', { x1: x, y1: TLY, x2: x, y2: bodyY + bodyH, stroke: C.today, 'stroke-width': 1, 'stroke-dasharray': '4 3' });
  }

  // —— 外框 + 脚注 ——
  el('rect', { x: .5, y: TLY + .5, width: W - 1, height: headH + bodyH - 1, fill: 'none', stroke: C.grid, 'stroke-width': 1 });
  el('text', { x: 8, y: H - 10, 'font-size': 10, fill: C.dim },
    '总工期 ' + model.totalDays + ' 日历天（' + gIso(model.day0) + ' 至 ' + gIso(model.dayN) + '）　'
    + '完成 ' + model.doneN + '/' + n + '　虚线: 今日 ' + today());

  return svg;
}

/** 甘特 SVG → 独立 SVG 字符串（导出 .svg 用） */
function ganttSVGText(svg) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg);
}

/** SVG → PNG Blob（2x 高清）。@returns {Promise<Blob>} */
function ganttSVGPng(svg, scale) {
  scale = scale || 2;
  return new Promise((resolve, reject) => {
    const txt = ganttSVGText(svg);
    const url = URL.createObjectURL(new Blob([txt], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = Math.round(svg.clientWidth * scale) || svg.width.baseVal.value * scale;
        cv.height = Math.round(svg.clientHeight * scale) || svg.height.baseVal.value * scale;
        const ctx = cv.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        cv.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob 失败')), 'image/png');
      } catch (e) { URL.revokeObjectURL(url); reject(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG 解码失败')); };
    img.src = url;
  });
}

/* ---------------- 交互：拖拽改期（P2-11） ---------------- */

/**
 * 给横道挂上拖拽改期。需由页面显式开启（opt.drag），否则会与横向滚动手势冲突。
 * 规则：拖中段 = 整体平移；拖左右端 8px 内 = 只改开始 / 只改结束；最少 1 天。
 * @param {Object} o {bars, dayW, day0, onChange(idx, newStartDay, newEndDay)}
 */
function ganttAttachDrag(svg, o) {
  let act = null;
  const ptX = (e) => {
    const r = svg.getBoundingClientRect();
    const sx = svg.width.baseVal.value / (r.width || svg.width.baseVal.value);
    return (e.clientX - r.left) * sx;
  };
  const onDown = (e) => {
    const t = e.target;
    const hit = o.bars.filter((b) => b.rect === t)[0];
    if (!hit) return;
    const x = ptX(e);
    const bx = +hit.rect.getAttribute('x'), bw = +hit.rect.getAttribute('width');
    const mode = (x - bx < 8) ? 'start' : ((bx + bw - x) < 8 ? 'end' : 'move');
    act = { hit: hit, mode: mode, x0: x, s0: hit.row.start, e0: hit.row.end };
    t.setAttribute('opacity', '1');
    e.preventDefault();
  };
  const onMove = (e) => {
    if (!act) return;
    const dd = Math.round((ptX(e) - act.x0) / o.dayW);
    let ns = act.s0, ne = act.e0;
    if (act.mode === 'move') { ns = act.s0 + dd; ne = act.e0 + dd; }
    else if (act.mode === 'start') { ns = Math.min(act.s0 + dd, act.e0); ne = act.e0; }
    else { ns = act.s0; ne = Math.max(act.e0 + dd, act.s0); }
    const x = o.tlx + (ns - o.day0) * o.dayW;
    const w = (ne - ns + 1) * o.dayW - 2;
    act.hit.rect.setAttribute('x', x);
    act.hit.rect.setAttribute('width', Math.max(3, w));
    act.cur = { s: ns, e: ne };
    e.preventDefault();
  };
  const onUp = () => {
    if (!act) return;
    const a = act; act = null;
    if (a.cur && (a.cur.s !== a.s0 || a.cur.e !== a.e0)) o.onChange(a.hit.idx, a.cur.s, a.cur.e);
  };
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);
  svg.addEventListener('pointerleave', onUp);
}

/* ---------------- 导出：PDF（PNG→JPEG→PDF，P2-12 兜底） ---------------- */

/**
 * 极简 PDF：把一张 JPEG 铺满一页（页面尺寸随图）。
 * 用途：部分国产 ROM 的 WebView 不响应 window.print()，用它兜底产出真正的 .pdf。
 * @param {Uint8Array} jpeg JPEG 原始字节
 * @param {number} w 像素宽 @param {number} h 像素高
 */
function buildPdfFromJpeg(jpeg, w, h) {
  const K = 0.75;                               // 96dpi px → pt
  const PW = Math.round(w * K), PH = Math.round(h * K);
  const enc = (s) => { const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 0xFF; return a; };
  const objs = [];
  const add = (body) => { objs.push(body); return objs.length; };   // 1-based

  const nImg = add('');                          // 先占位，后面按顺序填充
  const nCont = add('');
  const nPage = add('');
  const nPages = add('');
  const nCat = add('');

  const content = 'q ' + PW + ' 0 0 ' + PH + ' 0 0 cm /Im0 Do Q';
  objs[nCont - 1] = '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream';
  objs[nImg - 1] = '<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h
    + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n';
  objs[nPage - 1] = '<< /Type /Page /Parent ' + nPages + ' 0 R /MediaBox [0 0 ' + PW + ' ' + PH + ']'
    + ' /Resources << /XObject << /Im0 ' + nImg + ' 0 R >> >> /Contents ' + nCont + ' 0 R >>';
  objs[nPages - 1] = '<< /Type /Pages /Kids [' + nPage + ' 0 R] /Count 1 >>';
  objs[nCat - 1] = '<< /Type /Catalog /Pages ' + nPages + ' 0 R >>';

  const chunks = [], offsets = [];
  let pos = 0;
  const push = (u) => { chunks.push(u); pos += u.length; };
  push(enc('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
  for (let i = 0; i < objs.length; i++) {
    offsets.push(pos);
    push(enc((i + 1) + ' 0 obj\n' + objs[i] + '\nendobj\n'));
    if (i === nImg - 1) { push(jpeg); push(enc('\nendstream')); }
  }
  const xrefPos = pos;
  let xref = 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
  offsets.forEach((o) => { xref += String(o).padStart(10, '0') + ' 00000 n \n'; });
  push(enc(xref + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root ' + nCat + ' 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF\n'));
  return new Blob(chunks, { type: 'application/pdf' });
}

/** 甘特图 → PDF Blob（内部先转 JPEG 再包进 PDF） */
async function ganttPdf(svg, scale) {
  const png = await ganttSVGPng(svg, scale || 2);
  const bmp = await createImageBitmap(png);
  const cv = document.createElement('canvas');
  cv.width = bmp.width; cv.height = bmp.height;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(bmp, 0, 0);
  const dataUrl = cv.toDataURL('image/jpeg', 0.92);
  const bin = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (bmp.close) bmp.close();
  return buildPdfFromJpeg(bytes, cv.width, cv.height);
}

/* ---------------- 导出：xlsx（零依赖） ---------------- */

/** CRC32（xlsx zip 需要） */
const _CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function _crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = _CRC_T[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/** 手写 STORE zip：entries = [{name, data(Uint8Array)}] → Blob */
function _zipStore(entries) {
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;
  const dosTime = 0, dosDate = ((new Date().getFullYear() - 1980) << 9) | (1 << 5) | 1;
  entries.forEach((e) => {
    const nameB = enc.encode(e.name);
    const crc = _crc32(e.data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true);
    lh.setUint16(6, 0x0800, true);            // UTF-8 文件名
    lh.setUint16(8, 0, true);                 // STORE 不压缩
    lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, e.data.length, true); lh.setUint32(22, e.data.length, true);
    lh.setUint16(26, nameB.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), nameB, e.data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, e.data.length, true); ch.setUint32(24, e.data.length, true);
    ch.setUint16(28, nameB.length, true);
    ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), nameB);
    offset += 30 + nameB.length + e.data.length;
  });
  let cdSize = 0;
  central.forEach((u) => { cdSize += u.length; });
  const eo = new DataView(new ArrayBuffer(22));
  eo.setUint32(0, 0x06054b50, true);
  eo.setUint16(8, entries.length, true); eo.setUint16(10, entries.length, true);
  eo.setUint32(12, cdSize, true); eo.setUint32(16, offset, true);
  return new Blob([].concat.apply([], parts.concat(central, [new Uint8Array(eo.buffer)])), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

const _xesc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

/**
 * 生成 .xlsx（单表，首行大标题 + 表头 + 数据列）
 * @param {Object} o {sheet, title, head:[...], rows:[[...]], widths:[...]}
 * @returns {Blob}
 */
function buildXlsx(o) {
  const xw = (v) => {
    if (v == null || v === '') return '<c/>';
    if (typeof v === 'number' && isFinite(v)) return '<c><v>' + v + '</v></c>';
    return '<c t="inlineStr"><is><t xml:space="preserve">' + _xesc(v) + '</t></is></c>';
  };
  const colRef = (i) => { let s = '', n = i + 1; while (n > 0) { s = String.fromCharCode(65 + (n - 1) % 26) + s; n = Math.floor((n - 1) / 26); } return s; };
  const rowXml = (cells) => '<row>' + cells.map(xw).join('') + '</row>';

  // 首行大标题：整表合并居中（mergeCell），避免列错位
  const lastCol = colRef(o.head.length - 1);
  const rowsXml = [];
  rowsXml.push('<row ht="26">' + o.title.map((t) =>
    '<c s="2" t="inlineStr"><is><t xml:space="preserve">' + _xesc(t) + '</t></is></c>').join('') + '</row>');
  rowsXml.push('<row/>');
  rowsXml.push('<row>' + o.head.map((t) => '<c s="1" t="inlineStr"><is><t>' + _xesc(t) + '</t></is></c>').join('') + '</row>');
  o.rows.forEach((r) => rowsXml.push(rowXml(r)));
  const colsXml = (o.widths || []).map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('');

  const sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + '<dimension ref="A1"/>'
    + '<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
    + '<sheetFormatPr defaultRowHeight="18"/>'
    + '<cols>' + colsXml + '</cols>'
    + '<sheetData>' + rowsXml.join('') + '</sheetData>'
    + '<mergeCells count="1"><mergeCell ref="A1:' + lastCol + '1"/></mergeCells></worksheet>';

  const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + '<fonts count="4"><font><sz val="11"/><name val="Calibri"/></font>'
    + '<font><b/><sz val="11"/><name val="Calibri"/></font>'
    + '<font><b/><sz val="15"/><name val="Calibri"/></font>'
    + '<font><sz val="11"/><name val="Calibri"/></font></fonts>'
    + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
    + '<fill><patternFill patternType="solid"><fgColor rgb="FFD9E2DC"/><bgColor indexed="64"/></patternFill></fill></fills>'
    + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
    + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + '<cellXfs count="3">'
    + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
    + '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'
    + '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
    + '</cellXfs></styleSheet>';

  const enc = new TextEncoder();
  const files = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      + '<Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
      + '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
      + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
      + '<sheets><sheet name="' + _xesc(o.sheet || 'Sheet1') + '" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
      + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml': styles,
    'xl/worksheets/sheet1.xml': sheet
  };
  return _zipStore(Object.keys(files).map((k) => ({ name: k, data: enc.encode(files[k]) })));
}

/** 统一的「保存或分享文件」出口：原生走分享面板，Web 走下载 */
async function ganttSaveBlob(blob, name, title) {
  const ok = await Bridge.share.file({ blob: blob, file: new File([blob], name, { type: blob.type }), name: name, title: title || name });
  if (ok) { toast('已生成 ' + name); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('已下载 ' + name);
}
