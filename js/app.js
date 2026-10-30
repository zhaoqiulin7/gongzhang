import { Projects, Transactions, Parties, Attachments, Reminders, Meta, uid } from './db.js';
import {
  INCOME_TYPES, EXPENSE_CATS, PAY_METHODS, REGIONS, TRADES, PARTY_TYPES, STATUS_MAP,
  fmtMoney, fmtDate, today, escapeHtml, h, toast, openModal, closeModal, confirmDialog, setPageTitle,
  partyScopeOf, partyTypeLabel
} from './util.js';

const state = { projectId: null, homeSort: 'start', homeStage: 'all', partiesSort: 'type', partyScope: 'all' };

// 默认施工阶段模板（新建项目自动带入，可在「设置」中增删）
const DEFAULT_STAGES = [
  { id: 's1', name: '开工' }, { id: 's2', name: '水电施工' }, { id: 's3', name: '水电验收' },
  { id: 's4', name: '泥工进场' }, { id: 's5', name: '木工交底' }, { id: 's6', name: '竣工' }
];

// ---------- 计算 ----------
function isIncome(t) { return t.type === 'income' || t.kind === 'income'; }
function isExpense(t) { return t.type === 'expense' || t.kind === 'expense'; }

async function projStats(pid) {
  const txs = await Transactions.byProject(pid);
  let income = 0, expense = 0;
  txs.forEach((t) => { if (isIncome(t)) income += Number(t.amount) || 0; else expense += Number(t.amount) || 0; });
  return { income, expense, profit: income - expense, count: txs.length };
}

// 同步统计某项目收支（用已加载的 txs，避免逐个异步）
function quickStats(txs, pid) {
  let income = 0, expense = 0;
  txs.filter((t) => t.projectId === pid).forEach((t) => {
    if (isIncome(t)) income += Number(t.amount) || 0; else expense += Number(t.amount) || 0;
  });
  return { income, expense, profit: income - expense };
}

// 当前所处施工阶段（用于看板分组）
function currentStageName(p) {
  const stages = p.stages || [];
  if (!stages.length) return '';
  const doneIdx = [];
  stages.forEach((s, i) => { if (s.done) doneIdx.push(i); });
  if (doneIdx.length === 0) return stages[0].name;
  const last = Math.max.apply(null, doneIdx);
  if (last >= stages.length - 1) return stages[last].name + '（已完成）';
  return stages[last + 1].name;
}

// 收集所有项目出现过的阶段名（去重，保持出现顺序）
function collectStageNames(projects) {
  const seen = {}, out = [];
  projects.forEach((p) => (p.stages || []).forEach((s) => {
    if (!seen[s.name]) { seen[s.name] = 1; out.push(s.name); }
  }));
  return out;
}

async function attURL(id) {
  if (!id) return null;
  const a = await Attachments.get(id);
  return a ? URL.createObjectURL(a.blob) : null;
}

// ---------- 渲染骨架 ----------
async function render() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');
  const route = parts[0] || 'home';
  const view = document.getElementById('view');
  view.innerHTML = '';
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.route === route));

  let node;
  if (route === 'projects') node = await projectsView();
  else if (route === 'parties') node = await partiesView();
  else if (route === 'settings') node = await settingsView();
  else if (route === 'project' && parts[1]) node = await projectDetailView(parts[1]);
  else node = await homeView();

  view.appendChild(node);
  setupFab(route, parts[1]);
}

function setupFab(route, pid) {
  const old = document.getElementById('fab');
  if (old) old.remove();
  let fab = null;
  if (route === 'home' || route === 'projects') {
    fab = h('button', { class: 'fab', title: '新建项目', onclick: () => projectForm() }, '+');
  } else if (route === 'parties') {
    fab = h('button', { class: 'fab', title: '新建往来单位', onclick: () => partyForm() }, '+');
  } else if (route === 'project' && pid) {
    fab = h('button', { class: 'fab', title: '记一笔', onclick: () => txForm(null, pid) }, '+');
  }
  if (fab) fab.id = 'fab', document.getElementById('app').appendChild(fab);
}

// ---------- 首页 ----------
async function homeView() {
  setPageTitle('装修记账');
  const [projects, txs, rems] = await Promise.all([Projects.all(), Transactions.all(), Reminders.all()]);
  let income = 0, expense = 0;
  txs.forEach((t) => { if (isIncome(t)) income += Number(t.amount) || 0; else expense += Number(t.amount) || 0; });
  let recvDue = 0, payDue = 0;
  rems.filter((r) => !r.done).forEach((r) => {
    if (r.kind === 'receive') recvDue += Number(r.amount) || 0; else payDue += Number(r.amount) || 0;
  });

  const wrap = h('div');
  wrap.appendChild(h('h2', { class: 'section' }, '总览（累计）'));
  wrap.appendChild(h('div', { class: 'stat-grid' }, [
    stat('总收入', fmtMoney(income), 'income'),
    stat('总支出', fmtMoney(expense), 'expense'),
    stat('总利润', fmtMoney(income - expense), 'profit'),
    stat('项目数', String(projects.length), '', () => { location.hash = '#/projects'; }),
    stat('待收', fmtMoney(recvDue), 'income', () => drillDue('receive')),
    stat('待付', fmtMoney(payDue), 'expense', () => drillDue('pay'))
  ]));

  // 项目进度看板：排序 + 按施工阶段筛选
  wrap.appendChild(h('h2', { class: 'section' }, '项目进度看板'));

  const sortOpts = [['start', '开工时间'], ['end', '竣工时间'], ['contract', '合同额'], ['profit', '利润']];
  const sortSeg = h('div', { class: 'seg', style: 'margin-bottom:10px' });
  sortOpts.forEach(([v, label]) => {
    sortSeg.appendChild(h('button', { class: state.homeSort === v ? 'on' : '', onclick: () => { state.homeSort = v; render(); } }, label));
  });

  const stageNames = collectStageNames(projects);
  const chips = h('div', { class: 'chips', style: 'margin-bottom:12px' });
  const mkChip = (val, label, extra) => h('button', { class: 'chip' + (state.homeStage === val ? ' on' : ''), onclick: () => { state.homeStage = val; render(); } }, label + (extra ? '（' + extra + '）' : ''));
  chips.appendChild(mkChip('all', '全部', projects.length));
  stageNames.forEach((name) => {
    const cnt = projects.filter((p) => currentStageName(p) === name).length;
    if (cnt > 0) chips.appendChild(mkChip(name, name, cnt));
  });
  const noStage = projects.filter((p) => !(p.stages || []).length).length;
  if (noStage > 0) chips.appendChild(mkChip('none', '未排期', noStage));
  wrap.appendChild(sortSeg);
  wrap.appendChild(chips);

  // 过滤 + 排序
  let list = projects.slice();
  if (state.homeStage === 'none') list = list.filter((p) => !(p.stages || []).length);
  else if (state.homeStage !== 'all') list = list.filter((p) => currentStageName(p) === state.homeStage);

  const withStats = list.map((p) => ({ p, s: quickStats(txs, p.id) }));
  const keyFn = {
    start: (o) => o.p.startDate || '9999',
    end: (o) => o.p.endDate || '9999',
    contract: (o) => -(Number(o.p.contractAmount) || 0),
    profit: (o) => -o.s.profit
  }[state.homeSort];
  withStats.sort((a, b) => {
    const ka = keyFn(a), kb = keyFn(b);
    return typeof ka === 'string' ? ka.localeCompare(kb) : ka - kb;
  });

  if (!withStats.length) {
    wrap.appendChild(emptyState('没有符合条件的项目', '调整筛选或点右下角 + 新建'));
  } else {
    const sum = withStats.reduce((acc, o) => { acc.i += o.s.income; acc.e += o.s.expense; return acc; }, { i: 0, e: 0 });
    wrap.appendChild(h('div', { class: 'muted', style: 'font-size:12px;margin:-2px 0 10px' },
      '当前筛选合计：收 ' + fmtMoney(sum.i) + ' · 支 ' + fmtMoney(sum.e) + ' · 利润 ' + fmtMoney(sum.i - sum.e)));
    withStats.forEach(({ p, s }) => wrap.appendChild(projectCard(p, s)));
  }
  return wrap;
}

// 总览下钻：点击「待收 / 待付」查看对应收付款节点明细
async function drillDue(kind) {
  const [rems, projects] = await Promise.all([Reminders.all(), Projects.all()]);
  const list = rems.filter((r) => !r.done && r.kind === kind);
  const pname = (id) => { const p = projects.find((x) => x.id === id); return p ? p.name : '未关联项目'; };
  const body = h('div');
  if (!list.length) body.appendChild(emptyState('暂无未完成的' + (kind === 'receive' ? '收款' : '付款') + '节点', '可在项目详情里添加收付款节点'));
  else list.forEach((r) => {
    body.appendChild(h('div', { class: 'tx' }, [
      h('div', {}, [
        h('div', {}, (kind === 'receive' ? '收款·' : '付款·') + (r.title || '未命名节点')),
        h('div', { class: 'meta' }, pname(r.projectId) + (r.dueDate ? ' · 约定 ' + fmtDate(r.dueDate) : '') + (r.done ? ' · 已完成' : ''))
      ]),
      h('div', { style: 'font-weight:700', class: kind === 'receive' ? 'amt income' : 'amt expense' }, r.amount ? fmtMoney(r.amount) : '')
    ]));
  });
  openModal(kind === 'receive' ? '待收明细（点击看板「待收」进入）' : '待付明细（点击看板「待付」进入）', body, [h('button', { class: 'btn ghost', onclick: () => closeModal() }, '关闭')]);
}

function stat(k, v, cls, onclick) {
  return h('div', { class: 'stat' + (onclick ? ' tappable' : ''), ...(onclick ? { onclick } : {}) }, [
    h('div', { class: 'k' }, k),
    h('div', { class: 'v ' + cls }, v)
  ]);
}

function emptyState(title, sub) {
  return h('div', { class: 'empty' }, [
    h('div', { class: 'big' }, '📭'),
    h('div', {}, title),
    h('div', { class: 'muted', style: 'font-size:13px;margin-top:6px' }, sub)
  ]);
}

function projectCard(p, stats) {
  const st = stats || { income: 0, expense: 0, profit: 0 };
  const card = h('div', { class: 'card tap', onclick: () => { location.hash = '#/project/' + p.id; } });
  card.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'font-weight:700;font-size:16px' }, [
      document.createTextNode(p.name || '未命名项目'),
      h('span', { class: 'tag ' + (STATUS_MAP[p.status] || {}).cls }, (STATUS_MAP[p.status] || {}).label || '进行中')
    ]),
    h('div', { class: 'muted', style: 'font-size:12px' }, p.clientName || '')
  ]));

  const stageName = currentStageName(p);
  card.appendChild(h('div', { style: 'margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center' }, [
    h('span', { class: 'tag stage' }, stageName || '未排期'),
    h('span', { class: 'muted', style: 'font-size:12px' }, '开工 ' + (p.startDate ? fmtDate(p.startDate) : '—'))
  ]));

  const body = h('div', { style: 'margin-top:8px;display:flex;gap:14px;flex-wrap:wrap' });
  body.appendChild(h('div', { class: 'muted', style: 'font-size:12px' }, p.contractAmount ? '合同 ' + fmtMoney(p.contractAmount) : '合同 —'));
  card.appendChild(body);

  card.appendChild(h('div', { class: 'row-between', style: 'margin-top:10px' }, [
    h('div', { class: 'muted', style: 'font-size:12px' }, '收 ' + fmtMoney(st.income) + ' · 支 ' + fmtMoney(st.expense)),
    h('div', { style: 'font-weight:700;color:var(--accent)' }, '利润 ' + fmtMoney(st.profit))
  ]));

  card.appendChild(h('div', { style: 'display:flex;gap:8px;margin-top:12px' }, [
    h('button', { class: 'btn sm primary', onclick: (e) => { e.stopPropagation(); txForm('income', p.id); } }, '记收款'),
    h('button', { class: 'btn sm', style: 'background:var(--expense);color:#fff', onclick: (e) => { e.stopPropagation(); txForm('expense', p.id); } }, '记支出'),
    h('button', { class: 'btn sm ghost', onclick: (e) => { e.stopPropagation(); location.hash = '#/project/' + p.id; } }, '详情')
  ]));
  return card;
}

// ---------- 项目列表 ----------
async function projectsView() {
  setPageTitle('项目管理');
  const [projects, txs] = await Promise.all([Projects.all(), Transactions.all()]);
  const wrap = h('div');
  wrap.appendChild(h('h2', { class: 'section' }, '全部项目（' + projects.length + '）'));
  if (!projects.length) wrap.appendChild(emptyState('还没有项目', '点右下角 + 新建'));
  else projects.forEach((p) => wrap.appendChild(projectCard(p, quickStats(txs, p.id))));
  return wrap;
}

// ---------- 项目详情 ----------
async function projectDetailView(id) {
  const p = await Projects.get(id);
  if (!p) { location.hash = '#/projects'; return h('div'); }
  setPageTitle(p.name || '项目');
  const wrap = h('div');

  // 信息卡
  const info = h('div', { class: 'card' });
  info.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'font-weight:700;font-size:17px' }, p.name || '未命名'),
    h('span', { class: 'tag ' + (STATUS_MAP[p.status] || {}).cls }, (STATUS_MAP[p.status] || {}).label || '进行中')
  ]));
  const fields = [
    ['客户', p.clientName], ['电话', p.phone], ['地址', p.address],
    ['户型', p.houseType], ['建筑面积', p.buildArea ? p.buildArea + ' ㎡' : '—'], ['施工面积', p.constructArea ? p.constructArea + ' ㎡' : '—'],
    ['施工经理', p.manager], ['设计师', p.designer],
    ['合同金额', p.contractAmount ? fmtMoney(p.contractAmount) : '—'],
    ['成本预算', p.costBudget ? fmtMoney(p.costBudget) : '（未设，默认=合同额）'],
    ['开工', fmtDate(p.startDate)], ['竣工', fmtDate(p.endDate)], ['备注', p.note]
  ];
  fields.forEach(([k, v]) => {
    if (v) info.appendChild(h('div', { class: 'row-between', style: 'margin-top:8px' }, [
      h('span', { class: 'muted', style: 'font-size:13px' }, k),
      h('span', { style: 'font-size:13px;max-width:60%;text-align:right' }, String(v))
    ]));
  });
  const editBtns = h('div', { class: 'btn-row' }, [
    h('button', { class: 'btn ghost', onclick: () => projectForm(p) }, '编辑'),
    h('button', { class: 'btn danger', onclick: () => confirmDialog('删除该项目会一并删除其下所有记账与提醒，确定？', () => {
      Projects.remove(p.id).then(() => { toast('已删除'); location.hash = '#/projects'; });
    }, '删除') }, '删除')
  ]);
  info.appendChild(editBtns);
  wrap.appendChild(info);

  // 施工阶段进度（可勾选完成 + 自主修改各阶段完成时间）
  const stageCard = h('div', { class: 'card' });
  const stages = p.stages || [];
  const doneN = stages.filter((s) => s.done).length;
  stageCard.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'font-weight:700' }, '施工阶段（' + doneN + '/' + stages.length + '）'),
    h('button', { class: 'btn sm ghost', onclick: () => projectForm(p) }, '添加/改名')
  ]));
  if (!stages.length) {
    stageCard.appendChild(h('div', { class: 'muted', style: 'font-size:13px;margin-top:8px' }, '未设置阶段，点「添加/改名」或项目「编辑」添加'));
  } else {
    stages.forEach((s) => {
      const row = h('div', { style: 'display:flex;gap:8px;align-items:center;margin-top:8px' });
      const cb = h('input', { type: 'checkbox', style: 'width:18px;height:18px;flex:0 0 auto' });
      cb.checked = !!s.done;
      cb.addEventListener('change', () => { s.done = cb.checked; if (s.done && !s.date) s.date = today(); Projects.save(p).then(render); });
      const nameWrap = h('div', { style: 'flex:1;min-width:0' }, [
        h('div', { style: 'font-weight:600;font-size:13px' }, s.name || '未命名阶段'),
        h('div', { class: 'meta', style: s.done ? 'color:var(--income)' : '' }, s.done ? '已完成' : '未完成')
      ]);
      const dt = h('input', { type: 'date', value: s.date || '', style: 'width:130px;flex:0 0 auto' });
      dt.addEventListener('change', () => { s.date = dt.value; Projects.save(p).then(() => toast('已记录完成时间')); });
      const del = h('button', { class: 'delete-x', onclick: () => { p.stages = stages.filter((x) => x.id !== s.id); Projects.save(p).then(render); } }, '×');
      row.appendChild(cb); row.appendChild(nameWrap); row.appendChild(dt); row.appendChild(del);
      stageCard.appendChild(row);
    });
  }
  wrap.appendChild(stageCard);

  // 利润卡
  const st = await projStats(id);
  const profitCard = h('div', { class: 'stat-grid' }, [
    stat('收入', fmtMoney(st.income), 'income'),
    stat('支出', fmtMoney(st.expense), 'expense'),
    stat('利润', fmtMoney(st.profit), 'profit'),
    stat('笔数', String(st.count), '')
  ]);
  wrap.appendChild(profitCard);

  // 预算内计划付款（控支预警，详情页可内联编辑金额）
  const planCard = h('div', { class: 'card' });
  let planItems = (p.planItems && p.planItems.length) ? p.planItems.map((x) => ({ id: x.id || uid(), cat: x.cat || '', amount: Number(x.amount) || 0 })) : [];
  const planLib = await Meta.get('planCategories', []);
  const allTx = await Transactions.byProject(id);
  const spentOf = (itId) => allTx.filter((t) => t.type === 'expense' && t.planCat === itId).reduce((s, t) => s + (Number(t.amount) || 0), 0);
  let planEditMode = false;
  function renderPlanCard() {
    planCard.innerHTML = '';
    planCard.appendChild(h('div', { class: 'row-between' }, [
      h('div', { style: 'font-weight:700' }, '预算内计划付款（控支预警）'),
      h('button', { class: 'btn sm ghost', onclick: () => { planEditMode = !planEditMode; renderPlanCard(); } }, planEditMode ? '完成' : '编辑')
    ]));
    if (!planItems.length) {
      planCard.appendChild(h('div', { class: 'muted', style: 'font-size:13px;margin-top:8px' }, '未设置计划类别。请到「项目编辑」中从设置类别库下拉选择添加'));
    } else {
      planItems.forEach((it) => {
        const spent = spentOf(it.id);
        const plan = Number(it.amount) || 0;
        const left = plan - spent;
        const pct = plan > 0 ? Math.min(100, Math.round((spent / plan) * 100)) : 0;
        const over = spent > plan;
        const row = h('div', { style: 'margin-top:10px' });
        const top = h('div', { class: 'row-between' });
        if (planEditMode) {
          const sel = h('select', { style: 'flex:1;min-width:0' });
          const opts = planLib.slice();
          if (it.cat && !opts.includes(it.cat)) opts.push(it.cat);
          opts.forEach((c) => sel.appendChild(h('option', { value: c }, c)));
          sel.value = it.cat || '';
          sel.addEventListener('change', () => { it.cat = sel.value; });
          const inp = h('input', { type: 'number', inputmode: 'decimal', value: it.amount || '', placeholder: '计划金额', style: 'width:96px' });
          inp.addEventListener('input', () => { it.amount = Number(inp.value) || 0; });
          const del = h('button', { class: 'delete-x', onclick: () => { planItems = planItems.filter((x) => x.id !== it.id); renderPlanCard(); } }, '×');
          top.appendChild(h('div', { style: 'display:flex;gap:6px;align-items:center' }, [sel, inp, del]));
        } else {
          top.appendChild(h('div', { style: 'font-size:13px;font-weight:600' }, it.cat || '未命名'));
          top.appendChild(h('div', { class: 'muted', style: 'font-size:12px' }, '计划 ' + fmtMoney(plan) + ' · 已用 ' + fmtMoney(spent) + (over ? ' · 超支 ' + fmtMoney(spent - plan) : (left >= 0 ? ' · 余 ' + fmtMoney(left) : ''))));
        }
        row.appendChild(top);
        if (!planEditMode) row.appendChild(h('div', { class: 'bar', style: 'margin-top:5px' }, [ h('div', { class: 'bar-fill' + (over ? ' over' : ''), style: 'width:' + pct + '%' }) ]));
        planCard.appendChild(row);
      });
      if (planEditMode) {
        planCard.appendChild(h('div', { style: 'display:flex;gap:8px;margin-top:8px;flex-wrap:wrap' }, [
          h('button', { class: 'btn primary', onclick: () => { p.planItems = planItems; Projects.save(p).then(() => { toast('已保存计划'); planEditMode = false; renderPlanCard(); }); } }, '保存计划')
        ]));
      }
    }
  }
  renderPlanCard();
  wrap.appendChild(planCard);

  // 收付款节点（提醒数据，P2 才弹通知）
  const rems = await Reminders.byProject(id);
  const remCard = h('div', { class: 'card' });
  remCard.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'font-weight:700' }, '收付款节点'),
    h('button', { class: 'btn sm primary', onclick: () => reminderForm(id) }, '+ 节点')
  ]));
  if (!rems.length) remCard.appendChild(h('div', { class: 'muted', style: 'font-size:13px;margin-top:8px' }, '暂无节点（提醒通知将在 P2 上线）'));
  else rems.forEach((r) => {
    remCard.appendChild(h('div', { class: 'tx' }, [
      h('div', {}, [
        h('div', {}, (r.kind === 'receive' ? '收款·' : '付款·') + (r.title || '')),
        h('div', { class: 'meta' }, fmtDate(r.dueDate) + (r.amount ? ' · ' + fmtMoney(r.amount) : '') + (r.done ? ' · 已完成' : ''))
      ]),
      h('div', { style: 'display:flex;gap:6px' }, [
        h('button', { class: 'btn sm ghost', onclick: () => { r.done = !r.done; Reminders.save(r).then(render); } }, r.done ? '↺' : '✓'),
        h('button', { class: 'delete-x', onclick: () => { Reminders.remove(r.id).then(render); } }, '×')
      ])
    ]));
  });
  wrap.appendChild(remCard);

  // 交易流水
  wrap.appendChild(h('h2', { class: 'section' }, '记账流水'));
  const txs = await Transactions.byProject(id);
  if (!txs.length) wrap.appendChild(emptyState('还没有记账', '点右下角 + 记一笔'));
  else {
    const list = h('div', { class: 'card' });
    for (const t of txs) {
      const left = h('div', {}, [
        h('div', {}, (t.type === 'income' ? '收 ' : '支 ') + (t.type === 'income' ? t.subType : t.category) + (t.partyName ? '·' + t.partyName : '')),
        h('div', { class: 'meta' }, fmtDate(t.date) + (t.invoiceStatus ? ' · 票:' + t.invoiceStatus : '') + (t.material ? ' · ' + t.material : ''))
      ]);
      const right = h('div', { style: 'display:flex;align-items:center;gap:8px' }, [
        h('div', { class: 'amt ' + (t.type === 'income' ? 'income' : 'expense') }, (t.type === 'income' ? '+' : '-') + fmtMoney(t.amount)),
        h('button', { class: 'edit-x', title: '编辑', onclick: (e) => { e.stopPropagation(); txForm(null, t.projectId, t); } }, '✎'),
        h('button', { class: 'delete-x', onclick: (e) => { e.stopPropagation(); confirmDialog('删除这笔记账？', () => { Transactions.remove(t).then(render); }); } }, '×')
      ]);
      const row = h('div', { class: 'tx' }, [left, right]);
      if (t.attachmentId) {
        const url = await attURL(t.attachmentId);
        if (url) row.insertBefore(h('img', { class: 'thumb', src: url }), right);
      }
      list.appendChild(row);
    }
    wrap.appendChild(list);
  }
  return wrap;
}

// ---------- 往来单位 ----------
async function partiesView() {
  setPageTitle('往来单位');
  const [parties, txs, projects] = await Promise.all([Parties.all(), Transactions.all(), Projects.all()]);
  const wrap = h('div');
  wrap.appendChild(h('h2', { class: 'section' }, '客户（外部）/ 供应商·工人·施工经理·设计师（内部）'));
  wrap.appendChild(h('div', { class: 'muted', style: 'font-size:12px;margin:-4px 0 8px' }, '点击任一往来单位可直接编辑；下方按对应项目列出收/付款明细'));

  // 内/外部筛选
  const scopeChips = h('div', { class: 'chips', style: 'margin-bottom:10px' });
  [['all', '全部'], ['external', '外部·客户'], ['internal', '内部']].forEach(([v, label]) => {
    scopeChips.appendChild(h('button', { class: 'chip' + (state.partyScope === v ? ' on' : ''), onclick: () => { state.partyScope = v; render(); } }, label));
  });
  wrap.appendChild(scopeChips);

  const sortSeg = h('div', { class: 'seg', style: 'margin-bottom:12px' });
  [['type', '类型'], ['amount', '按金额'], ['freq', '按常用']].forEach(([v, label]) => {
    sortSeg.appendChild(h('button', { class: state.partiesSort === v ? 'on' : '', onclick: () => { state.partiesSort = v; render(); } }, label));
  });
  wrap.appendChild(sortSeg);

  let enriched = parties.map((p) => ({ p, st: partyStatsSync(txs, p.id) }));
  if (state.partyScope !== 'all') enriched = enriched.filter(({ p }) => partyScopeOf(p.type) === state.partyScope);
  if (state.partiesSort === 'amount') enriched.sort((a, b) => b.st.total - a.st.total);
  else if (state.partiesSort === 'freq') enriched.sort((a, b) => b.st.count - a.st.count);

  if (!enriched.length) wrap.appendChild(emptyState('没有符合条件的往来单位', '记账时可快速选用'));
  else enriched.forEach(({ p, st }) => wrap.appendChild(partyCard(p, st, txs, projects)));
  return wrap;
}

function partyStatsSync(txs, pid) {
  const rel = txs.filter((t) => t.partyId === pid);
  const byCat = {};
  let expenseTotal = 0, incomeTotal = 0;
  rel.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (isExpense(t)) { const c = t.category || '其他'; byCat[c] = (byCat[c] || 0) + amt; expenseTotal += amt; }
    else incomeTotal += amt;
  });
  return { count: rel.length, byCat, expenseTotal, incomeTotal, total: expenseTotal + incomeTotal };
}

function partyCard(p, st, allTxs, allProjects) {
  const typeLabel = partyTypeLabel(p.type);
  const scope = partyScopeOf(p.type);
  const scopeLabel = scope === 'external' ? '外部' : '内部';
  const status = (PAY_STATUS[p.payStatus] || PAY_STATUS.unpaid);
  const pname = (id) => { const x = allProjects.find((p2) => p2.id === id); return x ? x.name : '未关联项目'; };
  // 按项目归并该往来单位的收/付款，确保与各个项目对应
  const byProj = {};
  allTxs.filter((t) => t.partyId === p.id).forEach((t) => {
    const pid = t.projectId;
    if (!byProj[pid]) byProj[pid] = { name: pname(pid), income: 0, expense: 0, cats: {} };
    const amt = Number(t.amount) || 0;
    if (isIncome(t)) byProj[pid].income += amt;
    else { byProj[pid].expense += amt; const c = t.category || '其他'; byProj[pid].cats[c] = (byProj[pid].cats[c] || 0) + amt; }
  });
  const projIds = Object.keys(byProj);

  const card = h('div', { class: 'card party-clickable', onclick: () => partyForm(p) });
  card.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'font-weight:700;font-size:15px' }, p.name),
    h('span', { class: 'tag ' + (status.cls || 'unpaid') }, status.label || '未付')
  ]));
  card.appendChild(h('div', { class: 'sub', style: 'margin-top:4px' }, typeLabel + '（' + scopeLabel + '）' + (p.phone ? ' · ' + p.phone : '')));
  card.appendChild(h('div', { class: 'sub', style: 'margin-top:4px' }, '往来笔数：' + st.count + ' 笔 · 合计 ' + fmtMoney(st.total)));

  // 按项目对应的收/付款明细
  if (projIds.length) {
    card.appendChild(h('div', { class: 'sub', style: 'margin-top:8px;font-weight:600' }, '对应项目收付款明细'));
    projIds.forEach((pid) => {
      const d = byProj[pid];
      const catParts = Object.keys(d.cats).map((c) => c + ' ' + fmtMoney(d.cats[c])).join(' · ');
      const line = (d.income > 0 ? '收 ' + fmtMoney(d.income) : '') + (d.income > 0 && d.expense > 0 ? ' / ' : '') + (d.expense > 0 ? '付 ' + fmtMoney(d.expense) : '');
      card.appendChild(h('div', { class: 'sub', style: 'margin-top:5px;padding-left:8px;border-left:2px solid var(--line)' }, [
        h('div', { style: 'font-weight:600' }, d.name),
        h('div', { class: 'muted', style: 'font-size:12px' }, line + (catParts ? '（' + catParts + '）' : ''))
      ]));
    });
  } else if (st.incomeTotal > 0) {
    card.appendChild(h('div', { class: 'sub', style: 'margin-top:6px' }, '已收合计：' + fmtMoney(st.incomeTotal)));
  }

  card.appendChild(h('div', { style: 'display:flex;justify-content:flex-end;margin-top:10px' }, [
    h('button', { class: 'delete-x', onclick: (e) => { e.stopPropagation(); confirmDialog('删除该往来单位？', () => { Parties.remove(p.id).then(render); }); } }, '删除')
  ]));
  return card;
}

// ---------- 设置 ----------
async function settingsView() {
  setPageTitle('设置');
  const remindDays = await Meta.get('remindDays', 3);
  const wrap = h('div');
  wrap.appendChild(h('h2', { class: 'section' }, '提醒设置'));
  const rCard = h('div', { class: 'card' });
  rCard.appendChild(h('div', { class: 'muted', style: 'font-size:13px' }, '收付款节点提前提醒天数（通知功能 P2 上线）'));
  const input = h('input', { type: 'number', min: '0', max: '30', value: String(remindDays) });
  rCard.appendChild(h('div', { class: 'field', style: 'margin:10px 0 0' }, [input]));
  rCard.appendChild(h('button', { class: 'btn primary', style: 'margin-top:12px', onclick: () => {
    Meta.set('remindDays', Number(input.value) || 0).then(() => toast('已保存'));
  } }, '保存'));
  wrap.appendChild(rCard);

  // 施工阶段模板
  const stageTplCard = h('div', { class: 'card' });
  stageTplCard.appendChild(h('div', { class: 'muted', style: 'font-size:13px' }, '默认施工阶段（新建项目自动带入，可自主增删）'));
  const tplList = h('div', { style: 'margin-top:8px' });
  stageTplCard.appendChild(tplList);
  Meta.get('stageTemplate', DEFAULT_STAGES).then((tpl) => {
    function renderTpl() {
      tplList.innerHTML = '';
      tpl.forEach((t, i) => {
        const row = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' });
        const nm = h('input', { value: t.name || '', style: 'flex:1;min-width:0' });
        nm.addEventListener('input', () => { tpl[i].name = nm.value; });
        const up = h('button', { class: 'btn sm ghost', title: '上移', onclick: () => { if (i > 0) { const tmp = tpl[i]; tpl[i] = tpl[i - 1]; tpl[i - 1] = tmp; renderTpl(); } } }, '↑');
        const down = h('button', { class: 'btn sm ghost', title: '下移', onclick: () => { if (i < tpl.length - 1) { const tmp = tpl[i]; tpl[i] = tpl[i + 1]; tpl[i + 1] = tmp; renderTpl(); } } }, '↓');
        const del = h('button', { class: 'delete-x', title: '删除', onclick: () => { tpl.splice(i, 1); renderTpl(); } }, '×');
        row.appendChild(up); row.appendChild(down); row.appendChild(nm); row.appendChild(del);
        tplList.appendChild(row);
      });
    }
    renderTpl();
    stageTplCard.appendChild(h('button', { class: 'btn sm ghost', style: 'margin-top:6px', onclick: () => { tpl.push({ id: uid(), name: '' }); renderTpl(); } }, '+ 添加阶段'));
    stageTplCard.appendChild(h('button', { class: 'btn primary', style: 'margin-top:10px', onclick: () => {
      const cleaned = tpl.map((t) => ({ id: t.id || uid(), name: (t.name || '').trim() })).filter((t) => t.name);
      Meta.set('stageTemplate', cleaned).then(() => toast('已保存模板'));
    } }, '保存模板'));
  });
  wrap.appendChild(stageTplCard);

  // 预算计划类别库（全局，各项目编辑中下拉选择）
  const catLibCard = h('div', { class: 'card' });
  catLibCard.appendChild(h('div', { class: 'muted', style: 'font-size:13px' }, '预算计划类别库（在此统一维护，各项目编辑时下拉选择）'));
  const catList = h('div', { style: 'margin-top:8px' });
  catLibCard.appendChild(catList);
  Meta.get('planCategories', []).then((lib) => {
    function renderLib() {
      catList.innerHTML = '';
      if (!lib.length) catList.appendChild(h('div', { class: 'muted', style: 'font-size:13px' }, '还没有类别，点下方「+ 添加类别」'));
      lib.forEach((c, i) => {
        const row = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' });
        const up = h('button', { class: 'btn sm ghost', title: '上移', onclick: () => { if (i > 0) { const tmp = lib[i]; lib[i] = lib[i - 1]; lib[i - 1] = tmp; renderLib(); } } }, '↑');
        const down = h('button', { class: 'btn sm ghost', title: '下移', onclick: () => { if (i < lib.length - 1) { const tmp = lib[i]; lib[i] = lib[i + 1]; lib[i + 1] = tmp; renderLib(); } } }, '↓');
        const nm = h('input', { value: c, style: 'flex:1;min-width:0' });
        nm.addEventListener('input', () => { lib[i] = nm.value; });
        const del = h('button', { class: 'delete-x', title: '删除', onclick: () => { lib.splice(i, 1); renderLib(); } }, '×');
        row.appendChild(up); row.appendChild(down); row.appendChild(nm); row.appendChild(del);
        catList.appendChild(row);
      });
    }
    renderLib();
    catLibCard.appendChild(h('button', { class: 'btn sm ghost', style: 'margin-top:6px', onclick: () => { lib.push(''); renderLib(); } }, '+ 添加类别'));
    catLibCard.appendChild(h('button', { class: 'btn primary', style: 'margin-top:10px', onclick: () => {
      const cleaned = lib.map((x) => (x || '').trim()).filter((x) => x);
      Meta.set('planCategories', cleaned).then(() => toast('已保存类别库'));
    } }, '保存类别库'));
  });
  wrap.appendChild(catLibCard);

  wrap.appendChild(h('h2', { class: 'section', style: 'margin-top:18px' }, '关于'));
  wrap.appendChild(h('div', { class: 'card muted', style: 'font-size:13px;line-height:1.7' },
    '装修记账 · 本地版（PWA）。所有数据仅保存在本机浏览器，不上传任何服务器。可在安卓 Chrome 中“添加到主屏幕”当作 App 使用。当前为 P1：项目管理、记账（含照片/开票/更细维度）、往来单位、首页看板。'));

  return wrap;
}

// ---------- 表单：项目 ----------
function projectForm(existing) {
  const p = existing || { id: uid(), status: 'ongoing' };
  const isEdit = !!existing;
  const f = h('div');
  const stages = (p.stages && p.stages.length)
    ? p.stages.map((s) => ({ id: s.id || uid(), name: s.name || '', done: !!s.done, date: s.date || '' }))
    : [];
  if (!isEdit) {
    Meta.get('stageTemplate', DEFAULT_STAGES).then((tpl) => {
      tpl.forEach((t) => stages.push({ id: uid(), name: t.name || '', done: false, date: '' }));
      renderStages();
    });
  }
  const name = field(f, '项目名称', h('input', { value: p.name || '', placeholder: '如：张三家客厅翻新' }));
  const clientName = field(f, '客户姓名', h('input', { value: p.clientName || '' }));
  const phone = field(f, '电话', h('input', { value: p.phone || '', type: 'tel' }));
  const address = field(f, '房屋地址', h('input', { value: p.address || '' }));
  const houseType = field(f, '户型', h('input', { value: p.houseType || '', placeholder: '如：三室两厅' }));
  const buildArea = field(f, '建筑面积（㎡）', h('input', { value: p.buildArea || '', type: 'number', inputmode: 'decimal' }));
  const constructArea = field(f, '施工面积（㎡）', h('input', { value: p.constructArea || '', type: 'number', inputmode: 'decimal' }));
  const manager = field(f, '施工经理', h('input', { value: p.manager || '' }));
  const designer = field(f, '设计师', h('input', { value: p.designer || '' }));
  const contract = field(f, '合同金额（元）', h('input', { value: p.contractAmount || '', type: 'number', inputmode: 'decimal' }));
  const budget = field(f, '成本预算（元，留空=按合同额）', h('input', { value: p.costBudget || '', type: 'number', inputmode: 'decimal' }));
  const startD = field(f, '开工日期', h('input', { value: fmtDate(p.startDate) || today(), type: 'date' }));
  const endD = field(f, '预计竣工', h('input', { value: fmtDate(p.endDate) || '', type: 'date' }));

  const statusWrap = h('div', { class: 'field' }, [h('label', {}, '状态')]);
  const seg = h('div', { class: 'seg' });
  ['ongoing', 'finished', 'settled'].forEach((s) => {
    const b = h('button', { class: p.status === s ? 'on' : '', onclick: () => { p.status = s; seg.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); } }, (STATUS_MAP[s] || {}).label || s);
    seg.appendChild(b);
  });
  statusWrap.appendChild(seg);
  f.appendChild(statusWrap);
  field(f, '备注', h('textarea', {}, p.note || ''));

  // 施工阶段（可自主添加；新项目自动带入模板）
  const stageBox = h('div', { class: 'field' }, [h('label', {}, '施工阶段（可自主添加）')]);
  const stageList = h('div', { style: 'margin-top:6px' });
  stageBox.appendChild(stageList);
  function renderStages() {
    stageList.innerHTML = '';
    stages.forEach((s, i) => {
      const row = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' });
      const cb = h('input', { type: 'checkbox' }); cb.checked = !!s.done;
      cb.addEventListener('change', () => { s.done = cb.checked; });
      const nm = h('input', { value: s.name || '', placeholder: '阶段名称', style: 'flex:1;min-width:0' });
      nm.addEventListener('input', () => { s.name = nm.value; });
      const dt = h('input', { type: 'date', value: s.date || '', style: 'width:132px' });
      dt.addEventListener('input', () => { s.date = dt.value; });
      const del = h('button', { class: 'delete-x', onclick: () => { stages.splice(i, 1); renderStages(); } }, '×');
      row.appendChild(cb); row.appendChild(nm); row.appendChild(dt); row.appendChild(del);
      stageList.appendChild(row);
    });
  }
  renderStages();
  const stageBtns = h('div', { style: 'display:flex;gap:6px;margin-top:8px' });
  stageBtns.appendChild(h('button', { class: 'btn sm ghost', onclick: () => { stages.push({ id: uid(), name: '', done: false, date: '' }); renderStages(); } }, '+ 添加阶段'));
  stageBtns.appendChild(h('button', { class: 'btn sm ghost', onclick: () => {
    Meta.get('stageTemplate', DEFAULT_STAGES).then((tpl) => {
      tpl.forEach((t) => { if (!stages.find((s) => (s.name || '') === t.name)) stages.push({ id: uid(), name: t.name, done: false, date: '' }); });
      renderStages();
    });
  } }, '从模板载入'));
  stageBox.appendChild(stageBtns);
  f.appendChild(stageBox);

  // 预算内计划付款类别（类别来自「设置-预算计划类别库」，本项目下拉选择并填金额）
  const planItems = (p.planItems && p.planItems.length)
    ? p.planItems.map((x) => ({ id: x.id || uid(), cat: x.cat || '', amount: Number(x.amount) || 0 }))
    : [];
  let planLib = [];
  const planBox = h('div', { class: 'field' }, [h('label', {}, '预算内计划付款类别（类别从设置中维护）')]);
  const planList = h('div', { style: 'margin-top:6px' });
  planBox.appendChild(planList);
  const fileInp = h('input', { type: 'file', accept: '.csv,text/csv', style: 'display:none' });
  fileInp.addEventListener('change', (e) => {
    const fl = e.target.files[0];
    if (!fl) return;
    importPlanCsv(fl, planItems).then((n) => {
      Meta.get('planCategories', []).then((lib) => {
        const set = new Set(lib);
        planItems.forEach((it) => { if (it.cat) set.add(it.cat); });
        Meta.set('planCategories', Array.from(set)).then(() => { planLib = Array.from(set); toast('已导入 ' + n + ' 条计划'); renderPlan(); });
      });
    }).catch(() => toast('导入失败，请检查表格格式'));
  });
  f.appendChild(fileInp);
  const planTools = h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px' }, [
    h('button', { class: 'btn sm ghost', onclick: () => downloadPlanTemplate() }, '下载导入模板'),
    h('button', { class: 'btn sm ghost', onclick: () => fileInp.click() }, '从表格导入')
  ]);
  planBox.appendChild(planTools);
  function renderPlan() {
    planList.innerHTML = '';
    planItems.forEach((x, i) => {
      const row = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' });
      const nm = h('span', { style: 'flex:1;min-width:0;font-weight:600' }, x.cat || '未命名');
      const amt = h('input', { type: 'number', inputmode: 'decimal', value: x.amount || '', placeholder: '计划金额', style: 'width:120px' });
      amt.addEventListener('input', () => { x.amount = Number(amt.value) || 0; });
      const del = h('button', { class: 'delete-x', onclick: () => { planItems.splice(i, 1); renderPlan(); } }, '×');
      row.appendChild(nm); row.appendChild(amt); row.appendChild(del);
      planList.appendChild(row);
    });
    const used = planItems.map((x) => x.cat);
    const avail = (planLib || []).filter((c) => !used.includes(c));
    if (avail.length) {
      const sel = h('select', { style: 'flex:1;min-width:0' });
      avail.forEach((c) => sel.appendChild(h('option', { value: c }, c)));
      const addBtn = h('button', { class: 'btn sm primary', onclick: () => { if (sel.value) { planItems.push({ id: uid(), cat: sel.value, amount: 0 }); renderPlan(); } } }, '添加');
      planList.appendChild(h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' }, [sel, addBtn]));
    } else if (!planItems.length) {
      planList.appendChild(h('div', { class: 'muted', style: 'font-size:13px;margin-top:6px' }, '设置中还没有计划类别，请先到「设置 → 预算计划类别库」添加'));
    }
  }
  renderPlan();
  Meta.get('planCategories', []).then((lib) => { planLib = lib; renderPlan(); });
  f.appendChild(planBox);

  const save = h('button', { class: 'btn primary', onclick: () => {
    p.name = name.value.trim();
    p.clientName = clientName.value.trim();
    p.phone = phone.value.trim();
    p.address = address.value.trim();
    p.houseType = houseType.value.trim();
    p.buildArea = Number(buildArea.value) || 0;
    p.constructArea = Number(constructArea.value) || 0;
    p.manager = manager.value.trim();
    p.designer = designer.value.trim();
    p.contractAmount = Number(contract.value) || 0;
    p.costBudget = contract.value !== '' && budget.value !== '' ? Number(budget.value) || 0 : (budget.value !== '' ? Number(budget.value) || 0 : 0);
    p.startDate = startD.value;
    p.endDate = endD.value;
    p.note = f.querySelector('textarea').value.trim();
    p.stages = stages;
    p.planItems = planItems;
    Projects.save(p).then(() => { closeModal(); toast(isEdit ? '已更新' : '已新建'); render(); });
  } }, isEdit ? '保存修改' : '创建项目');
  const cancel = h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消');
  openModal(isEdit ? '编辑项目' : '新建项目', f, [cancel, save]);
}

// ---------- 表单：记账 ----------
async function txForm(presetType, presetProject, existingTx) {
  const isEdit = !!existingTx;
  let type = presetType || (existingTx && existingTx.type) || 'income';
  const projects = await Projects.all();
  const parties = await Parties.all();

  const f = h('div');
  const seg = h('div', { class: 'seg' });
  const bIn = h('button', { class: type === 'income' ? 'on' : '', onclick: () => { type = 'income'; bIn.classList.add('on'); bEx.classList.remove('on'); toggleType(); } }, '收款');
  const bEx = h('button', { class: type === 'expense' ? 'on' : '', onclick: () => { type = 'expense'; bEx.classList.add('on'); bIn.classList.remove('on'); toggleType(); } }, '支出');
  seg.appendChild(bIn); seg.appendChild(bEx);
  f.appendChild(h('div', { class: 'field' }, [h('label', {}, '类型'), seg]));

  const projSel = h('select', {}, [h('option', { value: '' }, '请选择项目')].concat(projects.map((p) => h('option', { value: p.id }, p.name))));
  if (presetProject) projSel.value = presetProject;
  field(f, '所属项目', projSel);

  // 动态区
  const dyn = h('div');
  f.appendChild(dyn);

  let planSel = null;
  async function refillPlan(forceValue) {
    if (!planSel) return;
    planSel.innerHTML = '';
    planSel.appendChild(h('option', { value: '' }, '不计入计划/未选'));
    const pid = projSel.value;
    if (pid) {
      const pp = await Projects.get(pid);
      ((pp && pp.planItems) || []).forEach((it) => {
        planSel.appendChild(h('option', { value: it.id }, it.cat + (it.amount ? '（计划' + it.amount + '）' : '')));
      });
    }
    if (forceValue) planSel.value = forceValue;
  }

  function toggleType() {
    dyn.innerHTML = '';
    if (type === 'income') {
      planSel = null;
      const sub = h('select', {}, INCOME_TYPES.map((x) => h('option', {}, x)));
      field(dyn, '款项类型', sub); dyn._sub = sub;
      const inv = h('select', {}, [h('option', {}, '未开'), h('option', {}, '已开')]);
      field(dyn, '开票状态', inv); dyn._inv = inv;
      const invType = h('select', {}, [h('option', {}, '普票'), h('option', {}, '专票'), h('option', {}, '—')]);
      field(dyn, '发票类型', invType); dyn._invType = invType;
      const tax = h('input', { type: 'number', inputmode: 'decimal', placeholder: '选填' });
      field(dyn, '税额（元）', tax); dyn._tax = tax;
    } else {
      const cat = h('select', {}, EXPENSE_CATS.map((x) => h('option', {}, x)));
      field(dyn, '支出类别', cat); dyn._cat = cat;
      const partySel = h('select', {}, [h('option', { value: '' }, '选择往来单位')].concat(parties.map((p) => h('option', { value: p.id }, p.name))));
      field(dyn, '往来单位', partySel); dyn._partySel = partySel;
      const partyNew = h('input', { placeholder: '或手动填写新单位名称' });
      field(dyn, '（或）新建往来单位', partyNew); dyn._partyNew = partyNew;
      const region = h('select', {}, [h('option', {}, '—')].concat(REGIONS.map((x) => h('option', {}, x))));
      field(dyn, '施工区域', region); dyn._region = region;
      const trade = h('select', {}, [h('option', {}, '—')].concat(TRADES.map((x) => h('option', {}, x))));
      field(dyn, '工种', trade); dyn._trade = trade;
      const material = h('input', { placeholder: '如：瓷砖/电线/腻子' });
      field(dyn, '材料大类', material); dyn._material = material;
      planSel = h('select', {}, [h('option', { value: '' }, '不计入计划/未选')]);
      field(dyn, '预算内计划类别', planSel); dyn._planSel = planSel;
      if (!isEdit) refillPlan();
      projSel.addEventListener('change', () => refillPlan());
    }
    // 金额、日期、方式、备注、照片（共用）
    const amount = h('input', { type: 'number', inputmode: 'decimal', placeholder: '0.00' });
    field(dyn, '金额（元）', amount); dyn._amount = amount;
    const date = h('input', { type: 'date', value: today() });
    field(dyn, '日期', date); dyn._date = date;
    const method = h('select', {}, PAY_METHODS.map((x) => h('option', {}, x)));
    field(dyn, '收付方式', method); dyn._method = method;
    const note = h('textarea', {}, '');
    field(dyn, '备注', note); dyn._note = note;
    // 照片
    const fileInput = h('input', { type: 'file', accept: 'image/*', capture: 'environment' });
    const thumb = h('img', { class: 'thumb', style: 'display:none;margin-top:8px' });
    let photoFile = null;
    fileInput.addEventListener('change', (e) => {
      const fl = e.target.files[0];
      if (fl) { photoFile = fl; thumb.src = URL.createObjectURL(fl); thumb.style.display = 'block'; keepAttachId = null; }
    });
    field(dyn, '凭证照片', h('div', {}, [fileInput, thumb])); dyn._photoFile = () => photoFile;
  }

  let keepAttachId = isEdit ? (existingTx.attachmentId || null) : null;
  toggleType();

  // 预填（编辑模式）
  if (isEdit) {
    projSel.value = existingTx.projectId || '';
    // type 已在初始化时为 existingTx.type，字段已按此构建
    if (type === 'income') {
      dyn._sub.value = existingTx.subType || INCOME_TYPES[0];
      dyn._inv.value = existingTx.invoiceStatus || '未开';
      dyn._invType.value = existingTx.invoiceType || '普票';
      dyn._tax.value = existingTx.taxAmount || '';
    } else {
      dyn._cat.value = existingTx.category || EXPENSE_CATS[0];
      dyn._partySel.value = existingTx.partyId || '';
      dyn._region.value = existingTx.region || '—';
      dyn._trade.value = existingTx.trade || '—';
      dyn._material.value = existingTx.material || '';
      await refillPlan(existingTx.planCat || '');
    }
    dyn._amount.value = existingTx.amount || '';
    dyn._date.value = fmtDate(existingTx.date) || today();
    dyn._method.value = existingTx.method || PAY_METHODS[0];
    dyn._note.value = existingTx.note || '';
    if (keepAttachId) {
      const url = await attURL(keepAttachId);
      if (url) {
        const thumb = dyn.querySelector('img.thumb');
        if (thumb) { thumb.src = url; thumb.style.display = 'block'; }
      }
    }
  }

  const save = h('button', { class: 'btn primary', onclick: async () => {
    const pid = projSel.value;
    if (!pid) { toast('请先选择项目'); return; }
    const amount = Number(dyn._amount.value);
    if (!amount || amount <= 0) { toast('请输入正确金额'); return; }
    const t = {
      id: isEdit ? existingTx.id : uid(),
      projectId: pid, type,
      amount, date: dyn._date.value || today(),
      method: dyn._method.value, note: dyn._note.value.trim(),
      createdAt: isEdit ? (existingTx.createdAt || Date.now()) : Date.now()
    };
    if (type === 'income') {
      t.subType = dyn._sub.value; t.invoiceStatus = dyn._inv.value; t.invoiceType = dyn._invType.value; t.taxAmount = Number(dyn._tax.value) || 0;
    } else {
      t.category = dyn._cat.value;
      let partyName = '', partyId = dyn._partySel.value;
      const newName = dyn._partyNew.value.trim();
      if (newName) {
        const np = { id: uid(), name: newName, type: 'supplier', createdAt: Date.now() };
        await Parties.save(np); partyId = np.id; partyName = newName;
      } else if (partyId) {
        const pp = parties.find((x) => x.id === partyId); partyName = pp ? pp.name : '';
      }
      t.partyId = partyId; t.partyName = partyName;
      t.region = dyn._region.value; t.trade = dyn._trade.value; t.material = dyn._material.value.trim();
      t.planCat = dyn._planSel ? dyn._planSel.value : '';
    }
    const pf = dyn._photoFile();
    if (pf) {
      if (isEdit && existingTx.attachmentId) Attachments.remove(existingTx.attachmentId);
      t.attachmentId = await Attachments.save(pf, pf.type);
    } else if (keepAttachId) {
      t.attachmentId = keepAttachId;
    }
    Transactions.save(t).then(() => { closeModal(); toast(isEdit ? '已更新' : '已记录'); render(); });
  } }, isEdit ? '保存修改' : '保存');
  const cancel = h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消');
  openModal(isEdit ? '编辑记账' : '记一笔', f, [cancel, save]);
}

// ---------- 表单：往来单位 ----------
function partyForm(existing) {
  const p = existing || { id: uid(), type: 'supplier' };
  const isEdit = !!existing;
  const f = h('div');
  const name = field(f, '名称', h('input', { value: p.name || '', placeholder: '如：老王木工 / 某某建材' }));
  const phone = field(f, '电话', h('input', { value: p.phone || '', type: 'tel' }));
  const typeWrap = h('div', { class: 'field' }, [h('label', {}, '类型')]);
  const seg = h('div', { class: 'seg' });
  PARTY_TYPES.forEach((t) => {
    const b = h('button', { class: p.type === t.v ? 'on' : '', onclick: () => { p.type = t.v; seg.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); } }, t.label);
    seg.appendChild(b);
  });
  typeWrap.appendChild(seg); f.appendChild(typeWrap);

  // 付款状态（针对供应商/工人：未付/已付/已对账）
  const payWrap = h('div', { class: 'field' }, [h('label', {}, '付款状态')]);
  const paySeg = h('div', { class: 'seg' });
  ['unpaid', 'paid', 'reconciled'].forEach((s) => {
    const b = h('button', { class: p.payStatus === s ? 'on' : '', onclick: () => { p.payStatus = s; paySeg.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); } }, (PAY_STATUS[s] || {}).label || s);
    paySeg.appendChild(b);
  });
  payWrap.appendChild(paySeg); f.appendChild(payWrap);

  field(f, '备注', h('textarea', {}, p.note || ''));
  const save = h('button', { class: 'btn primary', onclick: () => {
    p.name = name.value.trim(); if (!p.name) { toast('请填名称'); return; }
    p.phone = phone.value.trim();
    p.note = f.querySelector('textarea').value.trim();
    p.payStatus = p.payStatus || 'unpaid';
    Parties.save(p).then(() => { closeModal(); toast(isEdit ? '已更新' : '已新建'); render(); });
  } }, isEdit ? '保存' : '新建');
  const cancel = h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消');
  openModal(isEdit ? '编辑往来单位' : '新建往来单位', f, [cancel, save]);
}

// ---------- 表单：收付款节点 ----------
function reminderForm(projectId) {
  const r = { id: uid(), projectId, kind: 'receive', done: false };
  const f = h('div');
  const seg = h('div', { class: 'seg' });
  const bR = h('button', { class: 'on', onclick: () => { r.kind = 'receive'; bR.classList.add('on'); bP.classList.remove('on'); } }, '收款');
  const bP = h('button', { onclick: () => { r.kind = 'pay'; bP.classList.add('on'); bR.classList.remove('on'); } }, '付款');
  seg.appendChild(bR); seg.appendChild(bP);
  f.appendChild(h('div', { class: 'field' }, [h('label', {}, '节点类型'), seg]));
  const title = field(f, '名称（如：二期进度款）', h('input', { placeholder: '选填' }));
  const due = field(f, '约定日期', h('input', { type: 'date', value: today() }));
  const amount = field(f, '金额（元，选填）', h('input', { type: 'number', inputmode: 'decimal' }));
  const save = h('button', { class: 'btn primary', onclick: () => {
    r.title = title.value.trim(); r.dueDate = due.value; r.amount = Number(amount.value) || 0;
    Reminders.save(r).then(() => { closeModal(); toast('已添加节点'); render(); });
  } }, '保存');
  const cancel = h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消');
  openModal('添加收付款节点', f, [cancel, save]);
}

// 小工具
function field(parent, labelText, inputNode) {
  const wrap = h('div', { class: 'field' }, [h('label', {}, labelText), inputNode]);
  parent.appendChild(wrap);
  return inputNode;
}

// CSV 导入/导出（预算计划模板）
function downloadPlanTemplate() {
  const csv = '﻿计划类别,计划金额\n泥瓦人工,0\n瓷砖主材,0\n木工人工,0\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '预算计划导入模板.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('已下载模板，按列填好后可“从表格导入”');
}
function parseCsv(text) {
  const rows = []; let row = [], field = '', inq = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inq) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inq = false; }
      else field += c;
    } else if (c === '"') inq = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((x) => x !== '')) rows.push(row); }
  if (rows.length && /计划类别|类别|cat/i.test(rows[0][0] || '')) rows.shift();
  return rows;
}
function importPlanCsv(file, target) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result));
        let n = 0;
        rows.forEach((r) => {
          const cat = (r[0] || '').trim();
          const amt = Number((r[1] || '').replace(/[^0-9.]/g, '')) || 0;
          if (cat) { target.push({ id: uid(), cat, amount: amt }); n++; }
        });
        resolve(n);
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'utf-8');
  });
}

// ---------- 初始化 ----------
function init() {
  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => { location.hash = '#/' + t.dataset.route; });
  });
  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '#/home';
  render();
}

init();
