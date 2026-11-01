#!/usr/bin/env node
/**
 * scripts/gen-stress-data.js —— 压力测试备份数据生成器（阶段 D1）
 *
 *   用法：node scripts/gen-stress-data.js [流水笔数] [凭证张数] [输出文件路径]
 *   示例：node scripts/gen-stress-data.js 5000 200 out/压测备份.json
 *
 * 生成符合 exportAll() 结构的备份文件（schema 1），直接拿去 App 里「导入恢复」即可压测：
 *   { app:'decor-accounting', schema:1, exportedAt, stores:{projects,transactions,parties,reminders,attachments,meta} }
 *
 * 设计要点：
 *   - 数值口径自洽：账户余额 = 期初 + 收 - 支 + 转账互抵，便于导入后与「我的」页对账；
 *   - 附件用 1×1 的 PNG base64（压测只关注数量与体积，不关注图像内容）；
 *   - id 一律带前缀，避免与演示数据（p1/t1/pa1…）撞名。
 */

const fs = require('fs');
const path = require('path');

const TX_COUNT = Number(process.argv[2] || 5000);
const ATT_COUNT = Number(process.argv[3] || 200);
const OUT = process.argv[4] || path.join(__dirname, '..', 'out', 'stress-backup.json');

// 1×1 透明 PNG（压测占位用，够小也够真）
const PNG_1PX_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
// 约 20KB 的假图片体，用来逼近真实凭证体积（20KB × 200 张 ≈ 4MB）
const BIG_BLOB_B64 = Buffer.alloc(20 * 1024, 0x41).toString('base64');

const PROJECT_COUNT = 30;
const PARTY_COUNT = 60;

const CATS = [['材料费', '主材'], ['材料费', '辅材'], ['人工费', '木工'], ['人工费', '泥工'],
  ['分包费', '整包'], ['管理费', '设计费'], ['其他', '垃圾清运']];
const SUBTYPES = ['首付款', '进度款', '尾款', '增项款'];
const METHODS = ['现金', '微信', '支付宝', '银行转账'];
const REGIONS = ['客厅', '卧室', '厨房', '卫生间', '阳台', '全屋', '其他'];
const TRADES = ['水电', '泥瓦', '木工', '油漆', '安装', '其他'];

/** 可复现的伪随机（固定种子，保证两次生成的数据一致，便于对比压测结果） */
let _seed = 20261031;
function rnd() {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
}
const pick = (arr) => arr[Math.floor(rnd() * arr.length) % arr.length];
const pad = (n) => String(n).padStart(2, '0');

const now = Date.now();

// ---------- 项目 ----------
const projects = [];
for (let i = 1; i <= PROJECT_COUNT; i++) {
  const startY = 2024 + (i % 3);
  projects.push({
    id: 'sp' + i,
    name: '压测项目 ' + i + ' 号',
    clientName: '客户' + i,
    phone: '138****' + pad(i),
    address: '测试花园 ' + i + ' 栋',
    houseType: '三室两厅',
    buildArea: 80 + (i % 60),
    constructArea: 80 + (i % 60),
    manager: '经理' + (i % 5),
    designer: '设计' + (i % 4),
    contractAmount: 80000 + i * 1000,
    costBudget: 60000 + i * 800,
    startDate: startY + '-' + pad(1 + (i % 12)) + '-01',
    endDate: (startY + 1) + '-' + pad(1 + (i % 12)) + '-28',
    status: 'ongoing',
    stages: [
      { id: 'sp' + i + 's1', name: '开工', done: true, date: startY + '-01-05', planStart: startY + '-01-01', planEnd: startY + '-01-10' },
      { id: 'sp' + i + 's2', name: '水电施工', done: false, date: '', planStart: startY + '-02-01', planEnd: startY + '-03-01' }
    ],
    planItems: [{ id: 'sp' + i + 'pi1', cat: '泥瓦人工', amount: 30000 }],
    createdAt: now, updatedAt: now
  });
}

// ---------- 往来单位 ----------
const TYPES = ['client', 'supplier', 'worker', 'manager', 'designer', 'other'];
const parties = [];
for (let i = 1; i <= PARTY_COUNT; i++) {
  parties.push({
    id: 'spa' + i, name: '压测单位 ' + i, type: TYPES[i % TYPES.length],
    phone: '', note: '压测', payStatus: ['unpaid', 'paid', 'reconciled'][i % 3],
    createdAt: now
  });
}

// ---------- 收付款节点（用于验证预排程通知的批量性能）----------
const reminders = [];
for (let i = 1; i <= 200; i++) {
  const d = new Date(now + i * 86400000);
  reminders.push({
    id: 'sr' + i, projectId: 'sp' + (1 + (i % PROJECT_COUNT)),
    kind: i % 2 ? 'receive' : 'pay',
    title: '压测节点 ' + i, amount: 1000 + i * 10,
    dueDate: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
    note: '', done: false, createdAt: now
  });
}

// ---------- 附件 ----------
const attachments = [];
for (let i = 1; i <= ATT_COUNT; i++) {
  attachments.push({
    id: 'satt' + i,
    type: 'image/png',
    createdAt: now,
    b64: 'data:image/png;base64,' + (i % 10 === 0 ? BIG_BLOB_B64 : PNG_1PX_B64)
  });
}

// ---------- 流水 ----------
// 收入 : 支出 : 转账 ≈ 2 : 7 : 1，贴近真实装修账本的分布
const transactions = [];
let attachCursor = 0;
for (let i = 1; i <= TX_COUNT; i++) {
  const r = i % 10;
  const type = r < 2 ? 'income' : (r === 9 ? 'transfer' : 'expense');
  const day = 1 + (i % 28);
  const month = 1 + (i % 12);
  const year = 2024 + (i % 3);
  const date = year + '-' + pad(month) + '-' + pad(day);
  const pid = 'sp' + (1 + (i % PROJECT_COUNT));
  const party = parties[i % PARTY_COUNT];

  const base = {
    id: 'st' + i, projectId: pid, amount: Math.round((100 + rnd() * 20000) * 100) / 100,
    date: date, time: pad(8 + (i % 10)) + ':' + pad(i % 60),
    note: '压测流水 ' + i, createdAt: now, attachmentId: null
  };

  if (type === 'income') {
    transactions.push(Object.assign(base, {
      type: 'income', subType: pick(SUBTYPES), method: pick(METHODS), account: pick(METHODS),
      partyId: party.id, partyName: party.name,
      invoiceStatus: i % 3 ? '未开' : '已开', invoiceType: '普票', taxAmount: 0
    }));
  } else if (type === 'transfer') {
    const from = pick(METHODS), to = pick(METHODS);
    transactions.push(Object.assign(base, {
      type: 'transfer', method: from, account: from, fromAccount: from, toAccount: to === from ? '现金' : to
    }));
  } else {
    const cat = pick(CATS);
    // 每 5 笔支出挂一张凭证，直到附件用尽
    let attId = null;
    if (i % 5 === 0 && attachCursor < attachments.length) attId = attachments[attachCursor++].id;
    transactions.push(Object.assign(base, {
      type: 'expense', category: cat[0], subCat: cat[1], method: pick(METHODS), account: pick(METHODS),
      partyId: party.id, partyName: party.name,
      region: pick(REGIONS), trade: pick(TRADES), material: '', attachmentId: attId
    }));
  }
}

// ---------- meta ----------
const meta = [
  { key: 'theme', value: 'paper' },
  { key: 'hideMoney', value: false },
  { key: 'initialized', value: true },
  { key: 'demoMode', value: false },
  { key: 'notifyEnabled', value: true },
  { key: 'remindDays', value: 3 },
  { key: 'stageAlertDays', value: 3 },
  { key: 'budgetAlertPct', value: 80 },
  {
    key: 'accounts', value: [
      { id: 'sacc-1', name: '现金', opening: 0, note: '' },
      { id: 'sacc-2', name: '微信', opening: 0, note: '' },
      { id: 'sacc-3', name: '支付宝', opening: 0, note: '' },
      // 期初给足，保证压测账本的总余额为正（贴近真实账本，也让资金预测页不会满屏缺口预警）
      { id: 'sacc-4', name: '银行转账', opening: 40000000, note: '压测期初' }
    ]
  },
  {
    key: 'catTree', value: [
      { id: 'sc1', name: '材料费', subs: [{ id: 'sc1-1', name: '主材' }, { id: 'sc1-2', name: '辅材' }] },
      { id: 'sc2', name: '人工费', subs: [{ id: 'sc2-1', name: '木工' }, { id: 'sc2-2', name: '泥工' }] },
      { id: 'sc3', name: '分包费', subs: [{ id: 'sc3-1', name: '整包' }] },
      { id: 'sc4', name: '管理费', subs: [{ id: 'sc4-1', name: '设计费' }] },
      { id: 'sc5', name: '其他', subs: [{ id: 'sc5-1', name: '垃圾清运' }] }
    ]
  },
  { key: 'stageTemplate', value: [{ id: 'ss1', name: '开工' }, { id: 'ss2', name: '水电施工' }] },
  { key: 'txTemplates', value: [] },
  { key: 'cycleItems', value: [] },
  { key: 'cycleDone', value: {} }
];

const data = {
  app: 'decor-accounting',
  schema: 1,
  exportedAt: new Date().toISOString(),
  stores: {
    projects: projects, transactions: transactions, parties: parties,
    reminders: reminders, attachments: attachments, meta: meta
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(data));

// ---------- 自洽性报告（便于压测时与 App 里的数字对账）----------
let income = 0, expense = 0;
transactions.forEach((t) => {
  const a = Number(t.amount) || 0;
  if (t.type === 'income') income += a;
  else if (t.type === 'expense') expense += a;
});
const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log('已生成：' + OUT);
console.log('  项目 ' + projects.length + ' / 往来 ' + parties.length +
  ' / 流水 ' + transactions.length + ' / 节点 ' + reminders.length +
  ' / 附件 ' + attachments.length + '（其中 ' + attachCursor + ' 张已挂到流水）');
console.log('  收入合计 ' + income.toFixed(2) + ' / 支出合计 ' + expense.toFixed(2));
console.log('  预期总余额（期初 40000000 + 收 - 支，转账互抵）= ' + (40000000 + income - expense).toFixed(2));
console.log('  文件体积 ' + kb + ' KB');
