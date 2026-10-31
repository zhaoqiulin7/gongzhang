/* ============================================================
   轻量 SVG 图表库（v2.4.0）
   —— 零第三方依赖，纯 SVG + 少量 HTML，适配 400px 窄屏
   —— 配色一律引用「语义层」Token（--chart-1..8 / --income / --expense / --border），
      深色主题只覆盖语义层，图表自动跟随，无需任何主题分支代码
   —— 每个图表返回 DOM 节点；点击统一走 opts.onPick(index, item, ringIndex, ring)
   规则：图表只负责「画」，不负责取数与业务口径；数值文案由调用方传入（尊重隐藏金额）
   ============================================================ */

export const CHART_N = 8;
export function chartPalette(i) { return 'var(--chart-' + ((i % CHART_N) + 1) + ')'; }

// XML 转义（用于 SVG 内文本与 title）；实体用码点拼接，避免源码里出现裸实体
const _AMP = String.fromCharCode(38);
const XESC_MAP = { '&': _AMP + 'amp;', '<': _AMP + 'lt;', '>': _AMP + 'gt;', '"': _AMP + 'quot;', "'": _AMP + '#39;' };
function xEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => XESC_MAP[c] || c);
}

// 紧凑数字：轴标签/图例用，避免长金额撑破窄屏
export function compactNum(n) {
  const v = Number(n) || 0, a = Math.abs(v);
  if (a >= 1e8) return (v / 1e8).toFixed(2).replace(/\.?0+$/, '') + '亿';
  if (a >= 1e4) return (v / 1e4).toFixed(1).replace(/\.0$/, '') + '万';
  // 万元以下保持整数原样（¥8,000 比 ¥8.0k 更符合中文记账习惯，也不占额外宽度）
  return String(Math.round(v));
}
export function pctText(v, total) {
  const t = Number(total) || 0;
  if (!t) return '0%';
  return Math.round((Number(v) || 0) / t * 100) + '%';
}
function shortLabel(s, n) {
  s = String(s == null ? '' : s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// SVG 容器：viewBox 固定、width:100%，高度按宽高比自适应（CSS 里 height:auto）
export function svgWrap(vw, vh, inner, cls) {
  const d = document.createElement('div');
  d.className = 'chart-svg' + (cls ? ' ' + cls : '');
  d.innerHTML = '<svg viewBox="0 0 ' + vw + ' ' + vh + '" width="100%" preserveAspectRatio="xMidYMid meet" role="img">'
    + inner + '</svg>';
  return d;
}
function emptyNode(text) {
  const d = document.createElement('div');
  d.className = 'chart-empty';
  d.textContent = text || '暂无数据';
  return d;
}

/* ---------- 环形图（支持单环 / 同心多环） ----------
   opts: {
     items: [{label, value, text?, color?}]        // 单环简写
     rings: [{name, thickness, items:[...]}]       // 多环（外 → 内，外侧先写）
     size, thickness, centerValue, centerKey, fmt, onPick, emptyText
   }
   注：value 必须 > 0 才会出现；text 为调用方格式化好的展示文案
--------------------------------------------------- */
export function donutChart(o) {
  o = o || {};
  const size = o.size || 168;
  const cx = size / 2, cy = size / 2;
  const fmt = o.fmt || compactNum;
  const rawRings = o.rings && o.rings.length
    ? o.rings
    : [{ items: o.items || [], thickness: o.thickness || 26 }];
  const rings = rawRings.map((rg) => {
    const items = (rg.items || [])
      .map((x, i) => ({
        label: x.label, value: Number(x.value) || 0,
        text: x.text != null ? x.text : fmt(x.value),
        color: x.color || chartPalette(i),
        idx: x.idx == null ? i : x.idx,
        onPick: x.onPick
      }))
      .filter((x) => x.value > 0);
    const total = items.reduce((s, x) => s + x.value, 0);
    return { name: rg.name || '', thickness: rg.thickness || 26, items: items, total: total };
  }).filter((r) => r.items.length && r.total > 0);

  if (!rings.length) return emptyNode(o.emptyText);

  const parts = [];
  let rr = size / 2 - 2;
  rings.forEach((ring, ri) => {
    const t = ring.thickness;
    const rad = Math.max(6, rr - t / 2);
    rr = rad - t / 2 - 3; // 环间留白
    const C = 2 * Math.PI * rad;
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + rad.toFixed(2) + '" fill="none" stroke="var(--surface-2)" stroke-width="' + t + '" opacity=".7"/>');
    let acc = 0;
    ring.items.forEach((it) => {
      const frac = it.value / ring.total;
      const len = C * frac;
      const gap = ring.items.length > 1 ? Math.min(2.5, len * 0.1) : 0;
      const dash = Math.max(0.8, len - gap);
      const off = -acc;
      acc += len;
      parts.push('<circle class="donut-seg" data-r="' + ri + '" data-i="' + it.idx + '" cx="' + cx + '" cy="' + cy
        + '" r="' + rad.toFixed(2) + '" fill="none" stroke="' + it.color + '" stroke-width="' + t
        + '" stroke-dasharray="' + dash.toFixed(2) + ' ' + (C - dash).toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2)
        + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"><title>'
        + xEsc(it.label + ' ' + it.text + ' · ' + Math.round(frac * 100) + '%') + '</title></circle>');
    });
  });

  // 中心文案：双环时中心孔很小，用 centerSmall 缩一档
  const sm = o.centerSmall ? ' sm' : '';
  if (o.centerValue != null) {
    const hasKey = !!o.centerKey;
    parts.push('<text class="donut-cv' + sm + '" x="' + cx + '" y="'
      + (hasKey ? (o.centerSmall ? cy - 2 : cy + 1) : cy + 6)
      + '" text-anchor="middle">' + xEsc(o.centerValue) + '</text>');
  }
  if (o.centerKey) {
    parts.push('<text class="donut-ck' + sm + '" x="' + cx + '" y="' + (cy + (o.centerSmall ? 13 : 17))
      + '" text-anchor="middle">' + xEsc(o.centerKey) + '</text>');
  }

  const wrap = document.createElement('div');
  wrap.className = 'chart-donut';
  const box = svgWrap(size, size, parts.join(''), 'donut-svg');
  box.style.width = size + 'px';
  wrap.appendChild(box);

  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  rings.forEach((ring, ri) => {
    if (rings.length > 1) {
      const head = document.createElement('div');
      head.className = 'lg-head';
      head.innerHTML = '<span>' + xEsc(ring.name) + '</span><span class="lg-hv">'
        + xEsc(o.ringText ? o.ringText(ring) : fmt(ring.total)) + '</span>';
      legend.appendChild(head);
    }
    ring.items.forEach((it) => {
      const row = document.createElement('div');
      row.className = 'lg-row';
      row.setAttribute('data-r', String(ri));
      row.setAttribute('data-i', String(it.idx));
      row.innerHTML = '<i class="lg-dot" style="background:' + it.color + '"></i>'
        + '<span class="lg-n">' + xEsc(it.label) + '</span>'
        + '<span class="lg-v">' + xEsc(it.text) + '</span>'
        + '<span class="lg-p">' + pctText(it.value, ring.total) + '</span>';
      legend.appendChild(row);
    });
  });
  wrap.appendChild(legend);

  if (typeof o.onPick === 'function') {
    wrap.addEventListener('click', (e) => {
      const t = e.target && e.target.closest ? e.target.closest('[data-i]') : null;
      if (!t || !wrap.contains(t)) return;
      const ri = Number(t.getAttribute('data-r') || 0);
      const ii = Number(t.getAttribute('data-i'));
      const ring = rings[ri];
      if (!ring) return;
      let it = null;
      ring.items.forEach((x) => { if (x.idx === ii) it = x; });
      if (it) o.onPick(ii, it, ri, ring);
    });
  }
  return wrap;
}

/* ---------- 分组柱状图（收入 / 支出双柱） ----------
   opts: { items:[{label, a, b, aText?, bText?}], aName, bName, aColor, bColor,
           h, labelLen, onPick, emptyText }
--------------------------------------------------- */
export function groupedBars(o) {
  o = o || {};
  const items = o.items || [];
  if (!items.length) return emptyNode(o.emptyText);
  const W = 360, H = o.h || 150;
  const padT = 14, padB = 26, padX = 10;
  const plotH = H - padT - padB, base = padT + plotH;
  const maxV = Math.max.apply(null, [1].concat(items.map((it) => Math.max(Number(it.a) || 0, Number(it.b) || 0))));
  const n = items.length, gw = (W - padX * 2) / n;
  const bw = Math.min(13, Math.max(4, gw * 0.34));
  const step = n > 7 ? Math.ceil(n / 7) : 1;
  const aC = o.aColor || 'var(--income)', bC = o.bColor || 'var(--expense)';
  const parts = [], hits = [];
  parts.push('<line x1="' + padX + '" y1="' + base + '" x2="' + (W - padX) + '" y2="' + base + '" stroke="var(--border)" stroke-width="1"/>');
  parts.push('<line x1="' + padX + '" y1="' + padT + '" x2="' + (W - padX) + '" y2="' + padT + '" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 4" opacity=".6"/>');
  items.forEach((it, i) => {
    const cx = padX + gw * (i + 0.5);
    const va = Number(it.a) || 0, vb = Number(it.b) || 0;
    const ha = va > 0 ? Math.max(2, va / maxV * plotH) : 0;
    const hb = vb > 0 ? Math.max(2, vb / maxV * plotH) : 0;
    const tip = xEsc(it.label || '') + '　' + (o.aName || '收') + ' ' + (it.aText || compactNum(va))
      + ' / ' + (o.bName || '支') + ' ' + (it.bText || compactNum(vb));
    if (ha) parts.push('<rect x="' + (cx - bw - 2).toFixed(2) + '" y="' + (base - ha).toFixed(2) + '" width="' + bw.toFixed(2)
      + '" height="' + ha.toFixed(2) + '" rx="3" fill="' + aC + '"><title>' + tip + '</title></rect>');
    if (hb) parts.push('<rect x="' + (cx + 2).toFixed(2) + '" y="' + (base - hb).toFixed(2) + '" width="' + bw.toFixed(2)
      + '" height="' + hb.toFixed(2) + '" rx="3" fill="' + bC + '" opacity=".85"><title>' + tip + '</title></rect>');
    if (i % step === 0) {
      parts.push('<text class="bar-l" x="' + cx.toFixed(2) + '" y="' + (H - 9) + '" text-anchor="middle">'
        + xEsc(shortLabel(it.label, o.labelLen || 4)) + '</text>');
    }
    hits.push('<rect class="col-hit" data-i="' + i + '" x="' + (padX + gw * i).toFixed(2) + '" y="0" width="'
      + gw.toFixed(2) + '" height="' + H + '" fill="transparent"><title>' + tip + '</title></rect>');
  });
  const wrap = svgWrap(W, H, parts.join('') + hits.join(''));
  if (typeof o.onPick === 'function') {
    wrap.addEventListener('click', (e) => {
      const t = e.target && e.target.closest ? e.target.closest('[data-i]') : null;
      if (!t || !wrap.contains(t)) return;
      const i = Number(t.getAttribute('data-i'));
      if (items[i]) o.onPick(i, items[i]);
    });
  }
  return wrap;
}

/* ---------- 折线 / 面积图（多序列） ----------
   opts: { labels:[], series:[{name, color, data:[], area?, dash?}], h, onPick, emptyText, fmt }
--------------------------------------------------- */
export function lineChart(o) {
  o = o || {};
  const labels = o.labels || [];
  const series = (o.series || []).filter((s) => s && s.data && s.data.length);
  if (!labels.length || !series.length) return emptyNode(o.emptyText);
  const W = 360, H = o.h || 140;
  const padT = 14, padB = 24, padL = 12, padR = 12;
  const plotH = H - padT - padB, base = padT + plotH;
  const n = labels.length;
  // 支持负值（如结余为负）：纵轴按 [minV, maxV] 归一，0 轴单独画
  let maxV = 0, minV = 0;
  series.forEach((s) => s.data.forEach((v) => { const x = Number(v) || 0; if (x > maxV) maxV = x; if (x < minV) minV = x; }));
  if (maxV === minV) maxV = minV + 1;
  const span = maxV - minV;
  const xAt = (i) => padL + (W - padL - padR) * (n === 1 ? 0.5 : i / (n - 1));
  const yAt = (v) => padT + plotH * (1 - ((Number(v) || 0) - minV) / span);
  const zeroY = minV < 0 ? yAt(0) : base;
  const step = n > 7 ? Math.ceil(n / 7) : 1;
  const parts = [];
  [0, 0.5, 1].forEach((f) => {
    const y = padT + plotH * (1 - f);
    parts.push('<line x1="' + padL + '" y1="' + y.toFixed(2) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(2)
      + '" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 4" opacity=".55"/>');
  });
  if (minV < 0) {
    parts.push('<line x1="' + padL + '" y1="' + zeroY.toFixed(2) + '" x2="' + (W - padR) + '" y2="' + zeroY.toFixed(2)
      + '" stroke="var(--text-dim)" stroke-width="1" opacity=".5"/>');
  }
  series.forEach((s, si) => {
    const color = s.color || chartPalette(si);
    const pts = s.data.map((v, i) => xAt(i).toFixed(2) + ',' + yAt(v).toFixed(2));
    if (s.area) {
      parts.push('<path d="M ' + xAt(0).toFixed(2) + ' ' + zeroY.toFixed(2) + ' L ' + pts.join(' L ') + ' L '
        + xAt(n - 1).toFixed(2) + ' ' + zeroY.toFixed(2) + ' Z" fill="' + color + '" opacity=".14"/>');
    }
    parts.push('<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2.4"'
      + ' stroke-linejoin="round" stroke-linecap="round"' + (s.dash ? ' stroke-dasharray="5 4"' : '') + '/>');
    s.data.forEach((v, i) => {
      parts.push('<circle cx="' + xAt(i).toFixed(2) + '" cy="' + yAt(v).toFixed(2) + '" r="2.8" fill="var(--surface)" stroke="'
        + color + '" stroke-width="2"><title>' + xEsc((labels[i] || '') + ' ' + (s.name || '') + ' '
        + (o.fmt ? o.fmt(v) : compactNum(v))) + '</title></circle>');
    });
  });
  labels.forEach((lb, i) => {
    if (i % step) return;
    parts.push('<text class="bar-l" x="' + xAt(i).toFixed(2) + '" y="' + (H - 8) + '" text-anchor="middle">'
      + xEsc(shortLabel(lb, 5)) + '</text>');
  });
  const hits = [];
  for (let i = 0; i < n; i++) {
    const half = (W - padL - padR) / (n * 2) + 1;
    hits.push('<rect class="col-hit" data-i="' + i + '" x="' + Math.max(0, xAt(i) - half).toFixed(2) + '" y="0" width="'
      + (half * 2).toFixed(2) + '" height="' + H + '" fill="transparent"/>');
  }
  const wrap = svgWrap(W, H, parts.join('') + hits.join(''));
  if (typeof o.onPick === 'function') {
    wrap.addEventListener('click', (e) => {
      const t = e.target && e.target.closest ? e.target.closest('[data-i]') : null;
      if (!t || !wrap.contains(t)) return;
      const i = Number(t.getAttribute('data-i'));
      if (i >= 0 && i < n) o.onPick(i, labels[i]);
    });
  }
  return wrap;
}

/* ---------- 迷你横条（图例式排行，替代纯 CSS .bar，带多色） ----------
   items: [{label, value, text?, color?, onPick?}]；max 自动取最大
------------------------------------------------------------------ */
export function rankBars(items, o) {
  o = o || {};
  const list = (items || []).filter((x) => (Number(x.value) || 0) > 0);
  const wrap = document.createElement('div');
  wrap.className = 'rank-bars';
  if (!list.length) { wrap.className = 'chart-empty'; wrap.textContent = o.emptyText || '暂无数据'; return wrap; }
  const maxV = Math.max.apply(null, list.map((x) => Number(x.value) || 0));
  list.forEach((it, i) => {
    const row = document.createElement('div');
    row.className = 'rank-row' + (it.onPick ? ' tap' : '');
    const v = Number(it.value) || 0;
    row.innerHTML = '<div class="rank-t"><span class="rank-n">' + xEsc(it.label) + '</span>'
      + '<span class="rank-v">' + xEsc(it.text != null ? it.text : compactNum(v)) + '</span></div>'
      + '<div class="rank-track"><i class="rank-fill" style="width:'
      + Math.max(3, v / maxV * 100).toFixed(1) + '%;background:' + (it.color || o.color || chartPalette(i)) + '"></i></div>';
    if (it.onPick) row.addEventListener('click', it.onPick);
    wrap.appendChild(row);
  });
  return wrap;
}

/* ---------- 图表图例（纯说明，配合 lineChart / groupedBars） ----------
   items: [{name, color, dash?}]
------------------------------------------------------------------ */
export function chartLegend(items) {
  const d = document.createElement('div');
  d.className = 'chart-note';
  (items || []).forEach((it) => {
    const s = document.createElement('span');
    s.className = 'note-i';
    s.innerHTML = '<i class="lg-dot" style="background:' + it.color + '"></i>' + xEsc(it.name);
    d.appendChild(s);
  });
  return d;
}
