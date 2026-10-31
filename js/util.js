// 通用工具：格式化、DOM、弹窗、提示
export const INCOME_TYPES = ['首付款', '进度款', '尾款', '增项款'];
export const EXPENSE_CATS = ['材料费', '人工费', '分包费', '管理费', '其他'];
export const PAY_METHODS = ['现金', '微信', '支付宝', '银行转账'];
export const REGIONS = ['客厅', '卧室', '厨房', '卫生间', '阳台', '全屋', '其他'];
export const TRADES = ['水电', '泥瓦', '木工', '油漆', '安装', '其他'];
// 往来单位类型：客户属于「外部」，供应商/工人/施工经理/设计师属于「内部」
export const PARTY_TYPES = [
  { v: 'client', label: '客户', scope: 'external' },
  { v: 'supplier', label: '供应商', scope: 'internal' },
  { v: 'worker', label: '工人', scope: 'internal' },
  { v: 'manager', label: '施工经理', scope: 'internal' },
  { v: 'designer', label: '设计师', scope: 'internal' },
  { v: 'other', label: '其他', scope: 'internal' }
];
export function partyScopeOf(type) {
  return (PARTY_TYPES.find((x) => x.v === type) || {}).scope || 'internal';
}
export function partyTypeLabel(type) {
  return (PARTY_TYPES.find((x) => x.v === type) || {}).label || '其他';
}
export const STATUS_MAP = {
  ongoing: { label: '进行中', cls: 'ongoing' },
  finished: { label: '已完工', cls: 'finished' },
  settled: { label: '已结算', cls: 'settled' }
};

// 往来单位付款状态：未付 / 已付 / 已对账
export const PAY_STATUS = {
  unpaid: { label: '未付', cls: 'unpaid' },
  paid: { label: '已付', cls: 'paid' },
  reconciled: { label: '已对账', cls: 'reconciled' }
};

export function fmtMoney(n) {
  const num = Number(n) || 0;
  const abs = Math.abs(num).toFixed(2);
  const [int, dec] = abs.split('.');
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (num < 0 ? '-' : '') + '¥' + withSep + '.' + dec;
}

export function fmtDate(iso) {
  if (!iso) return '';
  return String(iso).slice(0, 10);
}

// 2026-10-15 19:33
export function fmtDateTime(iso, tm) {
  const d = fmtDate(iso);
  if (!d) return '';
  return tm ? d + ' ' + tm : d;
}

// 10月15日
export function fmtMD(iso) {
  if (!iso) return '';
  const p = String(iso).slice(0, 10).split('-');
  if (p.length < 3) return String(iso);
  return Number(p[1]) + '月' + Number(p[2]) + '日';
}

const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
export function weekdayCN(iso) {
  if (!iso) return '';
  const p = String(iso).slice(0, 10).split('-').map(Number);
  if (p.length < 3) return '';
  const d = new Date(p[0], p[1] - 1, p[2]);
  return '周' + WEEK_CN[d.getDay()];
}

export function pad2(n) { return String(n).padStart(2, '0'); }
export function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
export function nowHm() { const d = new Date(); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }

// 时间维度区间：今天 / 本周 / 本月 / 本季度 / 本年 / 全部
export function timeRanges(ref) {
  const now = ref ? new Date(ref) : new Date();
  const y = now.getFullYear(), m = now.getMonth(), q = Math.floor(m / 3);
  const dow = (now.getDay() + 6) % 7; // 周一为一周起点
  const sWeek = new Date(y, m, now.getDate() - dow);
  const eWeek = new Date(y, m, now.getDate() - dow + 6);
  const sMonth = new Date(y, m, 1);
  const eMonth = new Date(y, m + 1, 0);
  const sQ = new Date(y, q * 3, 1);
  const eQ = new Date(y, q * 3 + 3, 0);
  return [
    { key: 'day', label: '今天', sub: ymd(now), from: ymd(now), to: ymd(now) },
    { key: 'week', label: '本周', sub: ymd(sWeek) + ' - ' + ymd(eWeek), from: ymd(sWeek), to: ymd(eWeek) },
    { key: 'month', label: '本月', sub: (m + 1) + '月1日 - ' + (m + 1) + '月' + eMonth.getDate() + '日', from: ymd(sMonth), to: ymd(eMonth) },
    { key: 'quarter', label: '本季度', sub: y + '年' + (q * 3 + 1) + '月 - ' + (q * 3 + 3) + '月', from: ymd(sQ), to: ymd(eQ) },
    { key: 'year', label: '本年', sub: y + '年1月1日 - 12月31日', from: y + '-01-01', to: y + '-12-31' },
    { key: 'all', label: '全部时间', sub: '全部记录', from: '0000-01-01', to: '9999-12-31' }
  ];
}
export function rangeOf(key, ref) {
  const r = timeRanges(ref).find((x) => x.key === key) || timeRanges(ref)[2];
  return r;
}

export function today() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 简单 DOM 构建
export function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') node.className = attrs[k];
    else if (k === 'html') node.innerHTML = attrs[k];
    else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
    else if (k === 'value') node.value = attrs[k];
    else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

let _toastTimer = null;
export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

// 底部弹窗
export function openModal(title, bodyNode, actions) {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
  const mask = h('div', { class: 'modal-mask' });
  const modal = h('div', { class: 'modal' }, [
    h('h3', {}, title),
    bodyNode,
    actions ? h('div', { class: 'modal-actions' }, actions) : null
  ]);
  mask.appendChild(modal);
  mask.addEventListener('click', (e) => { if (e.target === mask) closeModal(); });
  root.appendChild(mask);
  return () => closeModal();
}

export function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
}

// 确认框
export function confirmDialog(text, onYes, yesLabel = '确定') {
  const body = h('div', { class: 'muted' }, text);
  const yes = h('button', { class: 'btn danger', onclick: () => { closeModal(); onYes && onYes(); } }, yesLabel);
  const no = h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消');
  openModal('请确认', body, [no, yes]);
}

export function setPageTitle(t) {
  const el = document.getElementById('page-title');
  if (el) el.textContent = t;
}
