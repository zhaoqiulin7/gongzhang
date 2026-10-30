// 通用工具：格式化、DOM、弹窗、提示
export const INCOME_TYPES = ['首付款', '进度款', '尾款', '增项款'];
export const EXPENSE_CATS = ['材料费', '人工费', '分包费', '管理费', '其他'];
export const PAY_METHODS = ['现金', '微信', '支付宝', '银行转账'];
export const REGIONS = ['客厅', '卧室', '厨房', '卫生间', '阳台', '全屋', '其他'];
export const TRADES = ['水电', '泥瓦', '木工', '油漆', '安装', '其他'];
export const PARTY_TYPES = [
  { v: 'client', label: '客户' },
  { v: 'supplier', label: '供应商' },
  { v: 'worker', label: '工人' },
  { v: 'other', label: '其他' }
];
export const STATUS_MAP = {
  ongoing: { label: '进行中', cls: 'ongoing' },
  finished: { label: '已完工', cls: 'finished' },
  settled: { label: '已结算', cls: 'settled' }
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
