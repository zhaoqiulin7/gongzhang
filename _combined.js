// 演示数据（v2.6.0 从 db.js 抽离）
// 首次启动播种一份演示账本（2 项目 + 5 往来 + 8 流水 + 2 提醒 + 基础配置），
// 用户可随时「还原演示」或「清空为空白账本」（设置 → 数据安全 → 演示数据）。
// 这里只定义纯数据；写入逻辑在 db.js（内存模式 memPut 直写 / 统一 put 走 ensureFirstRun）。

function demoDataset() {
  return {
    projects: [
      { id: 'p1', name: '保利香槟 3-1201 王先生', clientName: '王先生', phone: '138****0011', address: '保利香槟 3栋1201', houseType: '三室两厅', buildArea: 89, constructArea: 89, manager: '老陈', designer: '设计部·林', contractAmount: 80000, costBudget: 60000, startDate: '2026-09-01', endDate: '2026-11-30', status: 'ongoing',
        stages: [ { id: 'p1s1', name: '开工', done: true, date: '2026-09-01', planStart: '2026-09-01', planEnd: '2026-09-02' }, { id: 'p1s2', name: '水电施工', done: true, date: '2026-09-10', planStart: '2026-09-03', planEnd: '2026-09-10' }, { id: 'p1s3', name: '水电验收', done: true, date: '2026-09-18', planStart: '2026-09-11', planEnd: '2026-09-18' }, { id: 'p1s4', name: '泥工进场', done: false, date: '', planStart: '2026-09-19', planEnd: '2026-10-25' }, { id: 'p1s5', name: '木工交底', done: false, date: '', planStart: '2026-10-26', planEnd: '2026-11-15' }, { id: 'p1s6', name: '竣工', done: false, date: '', planStart: '2026-11-16', planEnd: '2026-11-30' } ], planItems: [ { id: 'p1pi1', cat: '泥瓦人工', amount: 30000 }, { id: 'p1pi2', cat: '瓷砖主材', amount: 20000 }, { id: 'p1pi3', cat: '木工人工', amount: 15000 } ] },
      { id: 'p2', name: '绿地城 5-802 李女士', clientName: '李女士', phone: '139****0022', address: '绿地城 5栋802', houseType: '四室两厅', buildArea: 120, constructArea: 120, manager: '老陈', designer: '设计部·林', contractAmount: 120000, costBudget: 95000, startDate: '2026-10-10', endDate: '2026-12-20', status: 'ongoing',
        stages: [ { id: 'p2s1', name: '开工', done: false, date: '', planStart: '2026-10-10', planEnd: '2026-10-12' }, { id: 'p2s2', name: '水电施工', done: false, date: '', planStart: '2026-10-13', planEnd: '2026-11-03' }, { id: 'p2s3', name: '水电验收', done: false, date: '', planStart: '2026-11-04', planEnd: '2026-11-10' }, { id: 'p2s4', name: '泥工进场', done: false, date: '', planStart: '2026-11-11', planEnd: '2026-12-05' }, { id: 'p2s5', name: '木工交底', done: false, date: '', planStart: '2026-12-06', planEnd: '2026-12-15' }, { id: 'p2s6', name: '竣工', done: false, date: '', planStart: '2026-12-16', planEnd: '2026-12-20' } ], planItems: [ { id: 'p2pi1', cat: '水电材料', amount: 25000 }, { id: 'p2pi2', cat: '泥瓦人工', amount: 40000 } ] }
    ],

    parties: [
      { id: 'pa1', name: '佛山瓷砖批发·陈老板', type: 'supplier', phone: '', note: '主材供应商', payStatus: 'unpaid' },
      { id: 'pa2', name: '木工·老张', type: 'worker', phone: '', note: '木工班组', payStatus: 'paid' },
      { id: 'pa3', name: '王先生', type: 'client', phone: '138****0011', note: '保利香槟业主' },
      { id: 'pa4', name: '施工经理·老陈', type: 'manager', phone: '', note: '现场施工管理', payStatus: 'unpaid' },
      { id: 'pa5', name: '设计师·林工', type: 'designer', phone: '', note: '设计部', payStatus: 'reconciled' }
    ],

    transactions: [
      { id: 't1', projectId: 'p1', type: 'income', subType: '首付款', amount: 40000, date: '2026-09-05', time: '10:20', method: '微信', account: '微信', partyId: 'pa3', partyName: '王先生', note: '开工首付', invoiceStatus: '已开', invoiceType: '普票', taxAmount: 0 },
      { id: 't2', projectId: 'p1', type: 'income', subType: '进度款', amount: 20000, date: '2026-10-08', time: '15:40', method: '银行转账', account: '银行转账', partyId: 'pa3', partyName: '王先生', note: '水电完工进度款', invoiceStatus: '未开', invoiceType: '普票', taxAmount: 0 },
      { id: 't3', projectId: 'p1', type: 'expense', category: '材料费', subCat: '主材', amount: 12000, date: '2026-09-20', time: '09:30', method: '银行转账', account: '银行转账', partyId: 'pa1', partyName: '佛山瓷砖批发·陈老板', region: '厨卫', trade: '泥瓦', material: '瓷砖', note: '卫生间+厨房瓷砖' },
      { id: 't4', projectId: 'p1', type: 'expense', category: '人工费', subCat: '木工', amount: 8000, date: '2026-10-12', time: '17:05', method: '现金', account: '现金', partyId: 'pa2', partyName: '木工·老张', region: '全屋', trade: '木工', material: '', note: '全屋吊顶木工' },
      { id: 't5', projectId: 'p2', type: 'expense', category: '材料费', subCat: '主材', amount: 20000, date: '2026-10-15', time: '11:12', method: '银行转账', account: '银行转账', partyId: 'pa1', partyName: '佛山瓷砖批发·陈老板', region: '客厅', trade: '泥瓦', material: '地砖', note: '客厅地砖' },
      { id: 't6', projectId: 'p1', type: 'expense', category: '管理费', subCat: '管理人员', amount: 3000, date: '2026-10-20', time: '09:00', method: '现金', account: '现金', partyId: 'pa4', partyName: '施工经理·老陈', region: '全屋', trade: '其他', material: '', note: '施工管理费' },
      { id: 't7', projectId: 'p1', type: 'expense', category: '管理费', subCat: '设计费', amount: 5000, date: '2026-10-22', time: '14:30', method: '银行转账', account: '银行转账', partyId: 'pa5', partyName: '设计师·林工', region: '全屋', trade: '其他', material: '', note: '设计费' },
      { id: 't8', projectId: 'p1', type: 'transfer', amount: 5000, date: '2026-10-23', time: '10:10', method: '银行转账', account: '银行转账', fromAccount: '银行转账', toAccount: '现金', note: '从银行转现金备用金' }
    ],

    reminders: [
      { id: 'r1', projectId: 'p1', kind: 'receive', title: '尾款催收', amount: 20000, dueDate: '2026-11-25', note: '竣工验收后收尾款' },
      { id: 'r2', projectId: 'p1', kind: 'pay', title: '瓷砖尾款', amount: 5000, dueDate: '2026-11-02', note: '付陈老板瓷砖尾款' }
    ],

    metaEntries: [
      { key: 'remindDays', value: 3 },
      { key: 'stageTemplate', value: [ { id: 's1', name: '开工' }, { id: 's2', name: '水电施工' }, { id: 's3', name: '水电验收' }, { id: 's4', name: '泥工进场' }, { id: 's5', name: '木工交底' }, { id: 's6', name: '竣工' } ] },
      { key: 'accounts', value: [
        { id: 'acc-1', name: '现金', opening: 0, note: '' },
        { id: 'acc-2', name: '微信', opening: 0, note: '' },
        { id: 'acc-3', name: '支付宝', opening: 0, note: '' },
        { id: 'acc-4', name: '银行转账', opening: 0, note: '公司对公账户' }
      ] },
      { key: 'catTree', value: [
        { id: 'c1', name: '材料费', subs: [ { id: 'c1-1', name: '辅材' }, { id: 'c1-2', name: '主材' }, { id: 'c1-3', name: '五金' }, { id: 'c1-4', name: '水电材料' }, { id: 'c1-5', name: '瓷砖主材' } ] },
        { id: 'c2', name: '人工费', subs: [ { id: 'c2-1', name: '水电工' }, { id: 'c2-2', name: '泥工' }, { id: 'c2-3', name: '木工' }, { id: 'c2-4', name: '油漆工' }, { id: 'c2-5', name: '安装工' }, { id: 'c2-6', name: '水电人工' }, { id: 'c2-7', name: '泥瓦人工' }, { id: 'c2-8', name: '木工人工' }, { id: 'c2-9', name: '油漆人工' } ] },
        { id: 'c3', name: '分包费', subs: [ { id: 'c3-1', name: '整包' }, { id: 'c3-2', name: '零包' } ] },
        { id: 'c4', name: '管理费', subs: [ { id: 'c4-1', name: '设计费' }, { id: 'c4-2', name: '管理人员' }, { id: 'c4-3', name: '其他' } ] },
        { id: 'c5', name: '其他', subs: [ { id: 'c5-1', name: '其他' }, { id: 'c5-2', name: '垃圾清运' } ] }
      ] },
      { key: 'txTemplates', value: [
        { id: 'tp1', name: '瓷砖主材', type: 'expense', amount: 0, category: '材料费', note: '' },
        { id: 'tp2', name: '泥工人工', type: 'expense', amount: 0, category: '人工费', note: '' },
        { id: 'tp3', name: '进度款收款', type: 'income', amount: 0, category: '', note: '' }
      ] }
    ]
  };
}

/* ===== db ===== */
// 数据层：自动在 IndexedDB（手机/正常浏览器，可持久化）与
// 内存模式（受限预览环境，载入演示数据、不保存）之间降级。
// 对外暴露与旧版一致的 API，app.js 无需改动。



const DB_NAME = 'decor-accounting';
// v2（v2.0.0）：新增 snapshots（自动/导入前快照）与 trash（回收站）两个仓库
const DB_VERSION = 2;

// 各对象仓库定义（keyPath + 索引；索引为 {name, keyPath} 映射）
const STORES = {
  projects: { keyPath: 'id', indexes: [] },
  transactions: { keyPath: 'id', indexes: [ { name: 'byProject', keyPath: 'projectId' }, { name: 'byDate', keyPath: 'date' } ] },
  parties: { keyPath: 'id', indexes: [] },
  attachments: { keyPath: 'id', indexes: [] },
  reminders: { keyPath: 'id', indexes: [ { name: 'byProject', keyPath: 'projectId' } ] },
  meta: { keyPath: 'key', indexes: [] },
  // 本地快照：{ id, kind:'auto'|'manual'|'pre-import', createdAt, bytes, data }
  snapshots: { keyPath: 'id', indexes: [ { name: 'byCreatedAt', keyPath: 'createdAt' } ] },
  // 回收站：{ id, store, rec, groupId, deletedAt, label }
  trash: { keyPath: 'id', indexes: [ { name: 'byDeletedAt', keyPath: 'deletedAt' } ] }
};

let backend = null; // 'idb' | 'mem'
let _idb = null;
let _mem = null;
let _ready = null;
let _backendSettled = false; // 后端一旦选定不再切换（模块级，供 finish/startMem 共用）

function uid() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// ---------------- 内存后端 ----------------
function makeMem() {
  const db = {};
  for (const name in STORES) {
    db[name] = { recs: new Map(), idx: {} };
    STORES[name].indexes.forEach((ix) => { db[name].idx[ix.name] = new Map(); });
  }
  return db;
}
function memPut(store, value) {
  const st = _mem[store];
  const kp = STORES[store].keyPath;
  const id = value[kp];
  STORES[store].indexes.forEach((ix) => {
    const m = st.idx[ix.name];
    m.forEach((set, key) => { if (set.has(id)) { set.delete(id); if (set.size === 0) m.delete(key); } });
  });
  st.recs.set(id, value);
  STORES[store].indexes.forEach((ix) => {
    const key = value[ix.keyPath];
    if (key !== undefined && key !== null) {
      if (!st.idx[ix.name].has(key)) st.idx[ix.name].set(key, new Set());
      st.idx[ix.name].get(key).add(id);
    }
  });
  return value;
}
function memDel(store, id) {
  const st = _mem[store];
  const rec = st.recs.get(id);
  if (!rec) return;
  STORES[store].indexes.forEach((ix) => {
    const key = rec[ix.keyPath];
    const m = st.idx[ix.name];
    if (m.has(key)) { m.get(key).delete(id); if (m.get(key).size === 0) m.delete(key); }
  });
  st.recs.delete(id);
}

// ---------------- IndexedDB 后端 ----------------
function idbTx(store, mode) { return _idb.transaction(store, mode).objectStore(store); }
function idbReq(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function idbGetAll(store) { return idbReq(idbTx(store, 'readonly').getAll()); }
function idbGet(store, id) { return idbReq(idbTx(store, 'readonly').get(id)); }
function idbPut(store, v) { return idbReq(idbTx(store, 'readwrite').put(v)).then(() => v); }
function idbDel(store, id) { return idbReq(idbTx(store, 'readwrite').delete(id)); }
function idbQuery(store, ix, value) { return idbReq(idbTx(store, 'readonly').index(ix).getAll(value)); }

// ---------------- 统一 KV 接口（等待后端就绪） ----------------
function getAll(store) {
  return _ready.then(() => backend === 'idb'
    ? idbGetAll(store)
    : Array.from(_mem[store].recs.values()));
}
function get(store, id) {
  return _ready.then(() => backend === 'idb' ? idbGet(store, id) : _mem[store].recs.get(id));
}
function put(store, v) {
  return _ready.then(() => backend === 'idb' ? idbPut(store, v) : memPut(store, v));
}
function del(store, id) {
  return _ready.then(() => backend === 'idb' ? idbDel(store, id) : memDel(store, id));
}
function queryByIndex(store, ix, value) {
  return _ready.then(() => {
    if (backend === 'idb') return idbQuery(store, ix, value);
    const m = _mem[store].idx[ix];
    if (!m || !m.has(value)) return [];
    return Array.from(m.get(value)).map((id) => _mem[store].recs.get(id)).filter(Boolean);
  });
}

// ---------------- 后端选择（带降级） ----------------
function initBackend() {
  if (_ready) return _ready;
  _ready = new Promise((resolve) => {
    const finishIdb = () => {
      if (_backendSettled) return;
      _backendSettled = true;
      backend = 'idb';
      resolve();
    };
    // 关键：内存模式一旦生效就锁定，防止迟到的 indexedDB.open 成功回调把
    // backend 从 mem 强切到 idb（会导致演示数据/已录数据"凭空消失"）
    const finishMem = () => {
      if (_backendSettled) return;
      _backendSettled = true;
      backend = 'mem';
      _mem = makeMem();
      try { seedDemoMem(); } catch (e) { /* ignore */ }
      try { showBanner(); } catch (e) { /* ignore */ }
      resolve();
    };
    if (typeof indexedDB === 'undefined') { finishMem(); return; }
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        for (const name in STORES) {
          if (!db.objectStoreNames.contains(name)) {
            const s = db.createObjectStore(name, { keyPath: STORES[name].keyPath });
            STORES[name].indexes.forEach((ix) => s.createIndex(ix.name, ix.keyPath));
          }
        }
      };
      req.onsuccess = () => { _idb = req.result; finishIdb(); };
      req.onerror = () => finishMem();
      // 极少数环境下 open 既不成功也不报错（挂起）——加超时兜底
      setTimeout(() => { if (!_backendSettled) finishMem(); }, 2000);
    } catch (e) {
      // 受限沙箱通常在这里同步抛 SecurityError
      finishMem();
    }
  });
  return _ready;
}

function showBanner() {
  const b = document.createElement('div');
  b.style.cssText = 'background:#b45309;color:#fff;font-size:12px;line-height:1.5;text-align:center;padding:7px 12px;';
  b.textContent = '⚠️ 当前为受限预览环境，已载入演示数据（不会保存）。在手机 Chrome 中打开本文件并“添加到主屏幕”即可永久保存你的账本。';
  if (document.body) document.body.insertBefore(b, document.body.firstChild);
}

// ---------------- 演示数据（v2.6.0：数据定义抽到 js/demo.js，这里只负责写入） ----------------
// 内存模式：同步直写（在 initBackend 完成前就绪，保证首屏渲染前数据已就位）
function seedDemoMem() {
  const D = demoDataset();
  const now = Date.now();
  D.projects.forEach((o) => memPut('projects', Object.assign({ createdAt: now, updatedAt: now }, o)));
  D.parties.forEach((o) => memPut('parties', Object.assign({ createdAt: now }, o)));
  D.transactions.forEach((o) => memPut('transactions', Object.assign({ createdAt: now, attachmentId: null }, o)));
  D.reminders.forEach((o) => memPut('reminders', Object.assign({ createdAt: now, done: false }, o)));
  D.metaEntries.forEach((m) => memPut('meta', Object.assign({}, m)));
  memPut('meta', { key: 'demoMode', value: true });
  memPut('meta', { key: 'initialized', value: true });
}

// 统一播种（IndexedDB 首启 / Demo.reset 用；走异步 put 接口，两种后端通用）
async function seedAll(mode) {
  const D = demoDataset();
  const now = Date.now();
  if (mode === 'demo') {
    for (const o of D.projects) await put('projects', Object.assign({ createdAt: now, updatedAt: now }, o));
    for (const o of D.parties) await put('parties', Object.assign({ createdAt: now }, o));
    for (const o of D.transactions) await put('transactions', Object.assign({ createdAt: now, attachmentId: null }, o));
    for (const o of D.reminders) await put('reminders', Object.assign({ createdAt: now, done: false }, o));
  }
  for (const m of D.metaEntries) await put('meta', Object.assign({}, m));
}

// 首次启动：播种演示账本（内存模式已在 initBackend 里同步播种并打标，这里只补 IndexedDB 分支）
async function ensureFirstRun() {
  await initBackend();
  const initialized = await Meta.get('initialized', false);
  if (initialized) return false;
  if (backend !== 'mem') {
    await seedAll('demo');
    await Meta.set('demoMode', true);
  }
  await Meta.set('initialized', true);
  return true;
}

// 演示/空白 重置（v2.6.0）：清空全部业务数据与配置后重播；调用方应先存快照
const Demo = {
  /** mode: 'demo' 还原演示账本 | 'blank' 清空为空白账本（保留基础配置） */
  async reset(mode) {
    await initBackend();
    const theme = await Meta.get('theme', 'paper');
    const hideMoney = await Meta.get('hideMoney', false);
    for (const name of ['projects', 'transactions', 'parties', 'attachments', 'reminders', 'meta']) {
      if (backend === 'idb') await idbReq(idbTx(name, 'readwrite').clear());
      else { _mem[name].recs.clear(); Object.keys(_mem[name].idx).forEach((k) => _mem[name].idx[k].clear()); }
    }
    await seedAll(mode === 'demo' ? 'demo' : 'blank');
    await Meta.set('theme', theme);
    await Meta.set('hideMoney', hideMoney);
    await Meta.set('demoMode', mode === 'demo');
    await Meta.set('initialized', true);
  }
};

// ---------------- 对外 API ----------------
// ---------------- 回收站（v2.0.0）----------------
// 删除的项目/流水/往来先进回收站，可整体还原（groupId 保证项目与其流水、节点一起还原）
const TRASH_KEEP_DAYS = 30;
const Trash = {
  all: () => getAll('trash').then((list) => list.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0))),
  byGroup: (groupId) => getAll('trash').then((list) => list.filter((x) => x.groupId === groupId)),
  /** 放入回收站；label 用于界面展示 */
  put: (storeName, rec, groupId, label) =>
    put('trash', { id: uid(), store: storeName, rec: rec, groupId: groupId || uid(), deletedAt: Date.now(), label: label || '' }),
  /** 还原一组（默认整组） */
  restore: async (groupId) => {
    const items = await Trash.byGroup(groupId);
    if (!items.length) throw new Error('回收站中没有该记录');
    // 先还原主记录（项目/往来），再还原从属记录，避免索引短暂不一致
    items.sort((a, b) => (a.store === 'projects' ? -1 : b.store === 'projects' ? 1 : 0));
    let failed = 0;
    for (const it of items) {
      try { await put(it.store, it.rec); } catch (e) { failed++; }
    }
    if (failed) throw new Error('还原时 ' + failed + ' 条记录失败');
    await Promise.all(items.map((it) => del('trash', it.id)));
    return items.length;
  },
  remove: (id) => del('trash', id),
  removeGroup: async (groupId) => {
    const items = await Trash.byGroup(groupId);
    for (const it of items) {
      if (it.store === 'transactions' && it.rec && it.rec.attachmentId) await del('attachments', it.rec.attachmentId);
    }
    await Promise.all(items.map((it) => del('trash', it.id)));
  },
  clear: async () => {
    const items = await getAll('trash');
    for (const it of items) {
      if (it.store === 'transactions' && it.rec && it.rec.attachmentId) await del('attachments', it.rec.attachmentId);
    }
    await Promise.all(items.map((it) => del('trash', it.id)));
    return items.length;
  },
  /** 清理超过保留期的记录（启动时调用） */
  prune: async (days) => {
    const keep = (days || TRASH_KEEP_DAYS) * 86400000;
    const items = await getAll('trash');
    const now = Date.now();
    let n = 0;
    for (const it of items) {
      if (now - (it.deletedAt || 0) > keep) {
        if (it.store === 'transactions' && it.rec && it.rec.attachmentId) await del('attachments', it.rec.attachmentId);
        await del('trash', it.id); n++;
      }
    }
    return n;
  }
};

// ---------------- 本地快照（v2.0.0）----------------
// 纯前端账本最大风险是浏览器清理 IndexedDB，故本地保留最近 N 份全量快照，可一键回滚
const SNAPSHOT_KEEP = 7;
const SNAPSHOT_MAX_BYTES = 12 * 1024 * 1024; // 超过则丢弃附件（凭证照片），保住账目主体
const Snapshots = {
  all: () => getAll('snapshots').then((list) => list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))),
  get: (id) => get('snapshots', id),
  /**
   * 存一份快照。kind: 'auto' | 'manual' | 'pre-import'
   * @returns {Promise<{id,bytes,attachmentsIncluded}>}
   */
  save: async (kind) => {
    const data = await exportAll();
    let bytes = 0;
    try { bytes = JSON.stringify(data).length; } catch (e) { bytes = 0; }
    let included = true;
    if (bytes > SNAPSHOT_MAX_BYTES && data.stores && data.stores.attachments) {
      data.stores.attachments = [];
      included = false;
      try { bytes = JSON.stringify(data).length; } catch (e) { bytes = 0; }
    }
    const id = uid();
    await put('snapshots', { id: id, kind: kind || 'manual', createdAt: Date.now(), bytes: bytes, attachmentsIncluded: included, data: data });
    await Snapshots.prune(SNAPSHOT_KEEP);
    return { id: id, bytes: bytes, attachmentsIncluded: included };
  },
  remove: (id) => del('snapshots', id),
  /** 只保留最近 keep 份 */
  prune: async (keep) => {
    const list = await Snapshots.all();
    const extra = list.slice(keep || SNAPSHOT_KEEP);
    await Promise.all(extra.map((s) => del('snapshots', s.id)));
    return extra.length;
  },
  /** 用快照整体覆盖当前数据（内部会再存一份 pre-import 快照以便反悔） */
  restore: async (id) => {
    const s = await get('snapshots', id);
    if (!s || !s.data) throw new Error('快照不存在');
    await Snapshots.save('pre-import'); // 回滚前再留一份，防止反悔
    const r = await importAll(s.data);
    return r;
  }
};

const Projects = {
  all: () => getAll('projects').then((list) => list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))),
  get: (id) => get('projects', id),
  save: (p) => { p.updatedAt = Date.now(); return put('projects', p); },
  // v2.0.0：软删除——项目 + 其流水 + 其节点作为一个 group 进回收站，附件保留以便还原
  remove: async (id) => {
    const [p, txs, rems] = await Promise.all([
      get('projects', id),
      queryByIndex('transactions', 'byProject', id),
      queryByIndex('reminders', 'byProject', id)
    ]);
    const groupId = uid();
    if (p) await Trash.put('projects', p, groupId, p.name || '');
    for (const t of txs) await Trash.put('transactions', t, groupId, t.note || String(t.amount || ''));
    for (const r of rems) await Trash.put('reminders', r, groupId, r.title || '');
    await Promise.all(txs.map((t) => del('transactions', t.id)));
    await Promise.all(rems.map((r) => del('reminders', r.id)));
    if (p) await del('projects', id);
  }
};
const Transactions = {
  all: () => getAll('transactions').then((list) => list.sort((a, b) => (b.date || '').localeCompare(a.date || ''))),
  byProject: (projectId) => queryByIndex('transactions', 'byProject', projectId),
  get: (id) => get('transactions', id),
  save: (t) => put('transactions', t),
  // v2.0.0：软删除（附件保留），可批量传入数组
  remove: async (t) => {
    const list = Array.isArray(t) ? t : [t];
    const groupId = uid();
    for (const one of list) {
      if (!one) continue;
      await Trash.put('transactions', one, groupId, one.note || String(one.amount || ''));
      await del('transactions', one.id);
    }
  }
};
const Parties = {
  all: () => getAll('parties').then((list) => list.sort((a, b) => (a.type || '').localeCompare(b.type || ''))),
  get: (id) => get('parties', id),
  save: (p) => put('parties', p),
  // v2.0.0：软删除
  remove: async (id) => {
    const p = await get('parties', id);
    if (p) await Trash.put('parties', p, uid(), p.name || '');
    await del('parties', id);
  }
};
const Attachments = {
  get: (id) => get('attachments', id),
  save: (blob, type) => { const id = uid(); return put('attachments', { id, blob, type, createdAt: Date.now() }).then(() => id); },
  remove: (id) => (id ? del('attachments', id) : Promise.resolve())
};
const Reminders = {
  all: () => getAll('reminders').then((list) => list.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))),
  byProject: (projectId) => queryByIndex('reminders', 'byProject', projectId),
  save: (r) => put('reminders', r),
  remove: (id) => del('reminders', id)
};
const Meta = {
  get: (key, def) => get('meta', key).then((v) => (v ? v.value : def)),
  set: (key, value) => put('meta', { key, value }),
  del: (key) => del('meta', key)
};

function openDB() { return initBackend(); }

// ---------------- 全量备份 / 恢复 ----------------
function blobToB64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
function b64ToBlob(b64, fallbackType) {
  const comma = b64.indexOf(',');
  const meta = b64.slice(0, comma);
  const mime = (meta.match(/data:([^;]+)/) || [])[1] || fallbackType || 'application/octet-stream';
  const bin = atob(b64.slice(comma + 1));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
const BACKUP_STORES = ['projects', 'transactions', 'parties', 'reminders', 'attachments', 'meta'];
async function exportAll() {
  await initBackend();
  const out = { app: 'decor-accounting', schema: 1, exportedAt: new Date().toISOString(), stores: {} };
  for (const name of BACKUP_STORES) {
    const recs = await getAll(name);
    if (name === 'attachments') {
      const list = [];
      for (const a of recs) {
        list.push({
          id: a.id, type: a.type || '', createdAt: a.createdAt || 0,
          b64: (a.blob instanceof Blob) ? await blobToB64(a.blob) : ''
        });
      }
      out.stores[name] = list;
    } else {
      out.stores[name] = recs;
    }
  }
  return out;
}
/**
 * 全量恢复。
 * v2.0.0 修正：旧实现未 await put() 且忽略单条失败 —— 大批量导入时可能
 * 在写入完成前就返回「导入成功」，且个别记录失败被静默吞掉。
 * 现改为逐仓库 await Promise.all + 统计失败条数，返回 { imported, failed }。
 * 注意：调用方应在导入前先存一份快照（Snapshots.save('pre-import')）以便反悔。
 */
async function importAll(data) {
  if (!data || !data.stores) throw new Error('备份文件格式不正确');
  await initBackend();
  for (const name of BACKUP_STORES) {
    if (backend === 'idb') await idbReq(idbTx(name, 'readwrite').clear());
    else { _mem[name].recs.clear(); Object.keys(_mem[name].idx).forEach((k) => _mem[name].idx[k].clear()); }
  }
  let imported = 0, failed = 0;
  const failures = [];
  for (const name of BACKUP_STORES) {
    const recs = data.stores[name] || [];
    const tasks = recs.map((r) => {
      const rec = (name === 'attachments')
        ? { id: r.id, type: r.type || '', createdAt: r.createdAt || 0, blob: r.b64 ? b64ToBlob(r.b64, r.type) : new Blob([], { type: 'text/plain' }) }
        : r;
      return put(name, rec).then(() => { imported++; }).catch((e) => { failed++; if (failures.length < 3) failures.push(name + ':' + (r && r.id) + ':' + (e && e.message)); });
    });
    await Promise.all(tasks);
  }
  if (failed > 0 && imported === 0) throw new Error('导入失败：' + failures.join(' | '));
  return { imported: imported, failed: failed, failures: failures };
}

// ---------------- 启动维护（v2.0.0）----------------
// ① 清理超过保留期的回收站记录；② 距上次自动快照超过 24 小时则存一份
const AUTO_SNAPSHOT_INTERVAL = 24 * 3600 * 1000;
async function dbMaintain() {
  const out = { pruned: 0, snapshot: null };
  try {
    out.pruned = await Trash.prune(TRASH_KEEP_DAYS);
  } catch (e) { /* 回收站清理失败不影响主流程 */ }
  try {
    const last = await Meta.get('lastAutoSnapshotAt', 0);
    if (!last || Date.now() - Number(last) > AUTO_SNAPSHOT_INTERVAL) {
      out.snapshot = await Snapshots.save('auto');
      await Meta.set('lastAutoSnapshotAt', Date.now());
    }
  } catch (e) { /* 快照失败不阻塞启动 */ }
  return out;
}

// 立即启动后端探测（在受限环境会同步切到内存模式并展示演示数据）
initBackend();


/* ===== util ===== */
// 通用工具：格式化、DOM、弹窗、提示
const INCOME_TYPES = ['首付款', '进度款', '尾款', '增项款'];
const EXPENSE_CATS = ['材料费', '人工费', '分包费', '管理费', '其他'];
const PAY_METHODS = ['现金', '微信', '支付宝', '银行转账'];
const REGIONS = ['客厅', '卧室', '厨房', '卫生间', '阳台', '全屋', '其他'];
const TRADES = ['水电', '泥瓦', '木工', '油漆', '安装', '其他'];
// 往来单位类型：客户属于「外部」，供应商/工人/施工经理/设计师属于「内部」
const PARTY_TYPES = [
  { v: 'client', label: '客户', scope: 'external' },
  { v: 'supplier', label: '供应商', scope: 'internal' },
  { v: 'worker', label: '工人', scope: 'internal' },
  { v: 'manager', label: '施工经理', scope: 'internal' },
  { v: 'designer', label: '设计师', scope: 'internal' },
  { v: 'other', label: '其他', scope: 'internal' }
];
function partyScopeOf(type) {
  return (PARTY_TYPES.find((x) => x.v === type) || {}).scope || 'internal';
}
function partyTypeLabel(type) {
  return (PARTY_TYPES.find((x) => x.v === type) || {}).label || '其他';
}
const STATUS_MAP = {
  ongoing: { label: '进行中', cls: 'ongoing' },
  finished: { label: '已完工', cls: 'finished' },
  settled: { label: '已结算', cls: 'settled' }
};

// 往来单位付款状态：未付 / 已付 / 已对账
const PAY_STATUS = {
  unpaid: { label: '未付', cls: 'unpaid' },
  paid: { label: '已付', cls: 'paid' },
  reconciled: { label: '已对账', cls: 'reconciled' }
};

function fmtMoney(n) {
  const num = Number(n) || 0;
  const abs = Math.abs(num).toFixed(2);
  const [int, dec] = abs.split('.');
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (num < 0 ? '-' : '') + '¥' + withSep + '.' + dec;
}

function fmtDate(iso) {
  if (!iso) return '';
  return String(iso).slice(0, 10);
}

// 2026-10-15 19:33
function fmtDateTime(iso, tm) {
  const d = fmtDate(iso);
  if (!d) return '';
  return tm ? d + ' ' + tm : d;
}

// 10月15日
function fmtMD(iso) {
  if (!iso) return '';
  const p = String(iso).slice(0, 10).split('-');
  if (p.length < 3) return String(iso);
  return Number(p[1]) + '月' + Number(p[2]) + '日';
}

const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
function weekdayCN(iso) {
  if (!iso) return '';
  const p = String(iso).slice(0, 10).split('-').map(Number);
  if (p.length < 3) return '';
  const d = new Date(p[0], p[1] - 1, p[2]);
  return '周' + WEEK_CN[d.getDay()];
}

function pad2(n) { return String(n).padStart(2, '0'); }
function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function nowHm() { const d = new Date(); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }

// 时间维度区间：今天 / 本周 / 本月 / 本季度 / 本年 / 全部
function timeRanges(ref) {
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
function rangeOf(key, ref) {
  const r = timeRanges(ref).find((x) => x.key === key) || timeRanges(ref)[2];
  return r;
}

function today() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 简单 DOM 构建
function h(tag, attrs = {}, children = []) {
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
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

// 底部弹窗
function openModal(title, bodyNode, actions) {
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

function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
}

// 确认框
function confirmDialog(text, onYes, yesLabel = '确定') {
  const body = h('div', { class: 'muted' }, text);
  const yes = h('button', { class: 'btn danger', onclick: () => { closeModal(); onYes && onYes(); } }, yesLabel);
  const no = h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消');
  openModal('请确认', body, [no, yes]);
}

function setPageTitle(t) {
  const el = document.getElementById('page-title');
  if (el) el.textContent = t;
}

/* ===== chart ===== */
/* ============================================================
   轻量 SVG 图表库（v2.4.0）
   —— 零第三方依赖，纯 SVG + 少量 HTML，适配 400px 窄屏
   —— 配色一律引用「语义层」Token（--chart-1..8 / --income / --expense / --border），
      深色主题只覆盖语义层，图表自动跟随，无需任何主题分支代码
   —— 每个图表返回 DOM 节点；点击统一走 opts.onPick(index, item, ringIndex, ring)
   规则：图表只负责「画」，不负责取数与业务口径；数值文案由调用方传入（尊重隐藏金额）
   ============================================================ */

const CHART_N = 8;
function chartPalette(i) { return 'var(--chart-' + ((i % CHART_N) + 1) + ')'; }

// XML 转义（用于 SVG 内文本与 title）；实体用码点拼接，避免源码里出现裸实体
const _AMP = String.fromCharCode(38);
const XESC_MAP = { '&': _AMP + 'amp;', '<': _AMP + 'lt;', '>': _AMP + 'gt;', '"': _AMP + 'quot;', "'": _AMP + '#39;' };
function xEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => XESC_MAP[c] || c);
}

// 紧凑数字：轴标签/图例用，避免长金额撑破窄屏
function compactNum(n) {
  const v = Number(n) || 0, a = Math.abs(v);
  if (a >= 1e8) return (v / 1e8).toFixed(2).replace(/\.?0+$/, '') + '亿';
  if (a >= 1e4) return (v / 1e4).toFixed(1).replace(/\.0$/, '') + '万';
  // 万元以下保持整数原样（¥8,000 比 ¥8.0k 更符合中文记账习惯，也不占额外宽度）
  return String(Math.round(v));
}
function pctText(v, total) {
  const t = Number(total) || 0;
  if (!t) return '0%';
  return Math.round((Number(v) || 0) / t * 100) + '%';
}
function shortLabel(s, n) {
  s = String(s == null ? '' : s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// SVG 容器：viewBox 固定、width:100%，高度按宽高比自适应（CSS 里 height:auto）
function svgWrap(vw, vh, inner, cls) {
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
function donutChart(o) {
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
function groupedBars(o) {
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
function lineChart(o) {
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
function rankBars(items, o) {
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
function chartLegend(items) {
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

/* ===== app ===== */




const state = {
  projectId: null, homeSort: 'start', homeStage: 'all', partiesSort: 'type', partyScope: 'all',
  hideMoney: false,
  ledgerRange: 'month', ledgerCat: 'all', ledgerSub: 'all', ledgerAccount: 'all',
  ledgerProject: 'all', ledgerQ: '', ledgerSort: 'date',
  ledgerBatch: false, ledgerSel: {},
  // v2.4.0 统计：basis=口径（start 项目开工年 / date 发生日期）；statsYear=开工年口径下的年份
  statsRange: 'year', statsDim: 'project', statsBasis: 'start', statsYear: '',
  statsForm: 'bar', statsTrend: 'line', statsCat: 'all',
  // 统计下钻：{label, ids[]} 锁定一组流水，交给流水页精确展示
  ledgerDrill: null,
  reconStatus: 'all', ledgerCustom: null,
  // v2.6.0：流水页展开详情的流水 id（null=全部收起）
  ledgerExpand: null,
  // v2.6.0：项目详情页展开详情的流水 id
  projExpand: null
};

// 默认施工阶段模板（新建项目自动带入，可在「设置」中增删）
const DEFAULT_STAGES = [
  { id: 's1', name: '开工' }, { id: 's2', name: '水电施工' }, { id: 's3', name: '水电验收' },
  { id: 's4', name: '泥工进场' }, { id: 's5', name: '木工交底' }, { id: 's6', name: '竣工' }
];

// 兼容 v1.0 早期以字符串数组存储的施工阶段模板（['开工',…] → [{id,name}]）：
// 老数据直接读 t.name 会得到 undefined，导致新建项目阶段名全部空白。读取时统一归一，旧格式顺手回写迁移。
async function getStageTpl() {
  const raw = await Meta.get('stageTemplate', DEFAULT_STAGES);
  const tpl = (Array.isArray(raw) ? raw : DEFAULT_STAGES)
    .map((t) => (typeof t === 'string' ? { id: uid(), name: t } : { id: (t && t.id) || uid(), name: (t && t.name) || '' }))
    .filter((t) => t.name);
  if (Array.isArray(raw) && raw.some((t) => typeof t === 'string')) {
    Meta.set('stageTemplate', tpl); // 一次性迁移为对象格式（幂等）
  }
  return tpl;
}

// 默认分类树（一级 → 二级），可在「设置」中维护
const DEFAULT_CAT_TREE = [
  { name: '材料费', subs: ['辅材', '主材', '五金', '水电材料'] },
  { name: '人工费', subs: ['水电工', '泥工', '木工', '油漆工', '安装工'] },
  { name: '分包费', subs: ['整包', '零包'] },
  { name: '管理费', subs: ['设计费', '管理人员', '其他'] },
  { name: '其他', subs: ['其他'] }
];

// ---------- 进度计划模板（内置，源自《进度计划参考.xls》，可在设置中修改） ----------
// 每项 {name:阶段名, days:工期天数}；工装类型不预设工期（按实际填写）
const PLAN_TYPES = [
  { id: 'villa', label: '别墅' }, { id: 'flat', label: '平层' },
  { id: 'duplex', label: '跃层' }, { id: 'fitup', label: '工装' }
];
const PLAN_TPL_BUILTIN = {
  villa: [
    { name: '开工仪式', days: 1 }, { name: '原装修、土建墙体拆除', days: 7 }, { name: '土建现浇结构施工', days: 30 },
    { name: '现浇结构养护期', days: 15 }, { name: '土建墙体砌筑', days: 6 }, { name: '进场拆除及砌筑墙体、墙体抹灰', days: 12 },
    { name: '水电开槽', days: 5 }, { name: '水电排管穿线', days: 10 }, { name: '配电箱+空开箱+空开安装', days: 3 },
    { name: '铝合金封窗量尺+下单', days: 2 }, { name: '全屋窗洞铝合金封窗', days: 7 }, { name: '屋面露台SBS防水卷材+非固化沥青', days: 5 },
    { name: '露台硬化(C20细石混凝土找坡)', days: 3 }, { name: '露台铺装花岗岩/室外防滑瓷砖', days: 6 }, { name: '屋面露台阳光房+雨棚', days: 10 },
    { name: '四层洗衣房雨棚', days: 3 }, { name: '负一层/负二层新风系统安装(预埋管道)', days: 5 }, { name: '瓷砖下单', days: 1 },
    { name: '木门量尺+下单', days: 2 }, { name: '全屋定制柜量尺+下单', days: 2 }, { name: '电梯量尺+选型下单', days: 2 },
    { name: '地暖铺装', days: 12 }, { name: '地面豆石回填找平', days: 5 }, { name: '卫生间防水', days: 3 },
    { name: '卫生间墙地面瓷砖铺贴', days: 15 }, { name: '卫生间铝合金推拉门、入户重型门量尺+下单', days: 2 }, { name: '卫浴下单', days: 2 },
    { name: '门槛石安装', days: 4 }, { name: '窗台石安装', days: 4 }, { name: '全屋地面瓷砖铺贴', days: 20 },
    { name: '楼梯地面石材铺贴', days: 10 }, { name: '楼梯不锈钢玻璃扶手量尺+下单', days: 2 }, { name: '轻钢龙骨石膏板造型吊顶', days: 15 },
    { name: '墙顶面石膏腻子披挂(第一遍)', days: 15 }, { name: '墙顶面石膏腻子披挂(第二遍+打磨)', days: 15 }, { name: '墙顶面乳胶漆滚涂', days: 8 },
    { name: '开荒保洁', days: 3 }, { name: '开关插座灯具（含智能化）下单', days: 1 }, { name: '窗帘下单', days: 1 },
    { name: '开关插座灯具（含智能化）安装', days: 5 }, { name: '卫生间厨房铝扣板吊顶', days: 4 }, { name: '木门、木质哑口套安装', days: 4 },
    { name: '卫生间铝合金推拉门、入户重型门安装', days: 5 }, { name: '全屋定制柜安装', days: 15 }, { name: '楼梯不锈钢玻璃扶手安装', days: 5 },
    { name: '卫生间卫浴安装', days: 3 }, { name: '车库地坪漆', days: 5 }, { name: '电梯安装', days: 7 },
    { name: '锅炉安装', days: 3 }, { name: '美缝+填缝', days: 5 }, { name: '竣工保洁', days: 3 },
    { name: '软装窗帘进场安装', days: 3 }
  ],
  flat: [
    { name: '开工仪式', days: 1 }, { name: '原装修、土建墙体拆除', days: 3 }, { name: '土建墙体砌筑', days: 6 },
    { name: '水电排管穿线', days: 12 }, { name: '铝合金封窗量尺+定方案', days: 2 }, { name: '暖气片管道铺装', days: 2 },
    { name: '卫生间沉箱防水+闭水试验', days: 5 }, { name: '卫生间沉箱回填及找平', days: 2 }, { name: '卫生间二次防水+闭水试验', days: 5 },
    { name: '厨房烟道包覆及包立管', days: 3 }, { name: '瓷砖下单', days: 1 }, { name: '木门、铝合金门量尺+下单', days: 2 },
    { name: '全屋窗户量尺+下单', days: 1 }, { name: '楼梯踏步欧松板基层及扶手砌筑', days: 3 }, { name: '全屋地面瓷砖铺贴', days: 15 },
    { name: '卫生间墙地面瓷砖铺贴', days: 12 }, { name: '窗台石安装', days: 1 }, { name: '楼梯地面瓷砖铺贴', days: 5 },
    { name: '美缝+填缝', days: 3 }, { name: '轻钢龙骨石膏板造型吊顶', days: 8 }, { name: '墙面隔音及欧松板基层', days: 8 },
    { name: '全屋定制柜量尺+下单', days: 2 }, { name: '墙固（界面剂）', days: 1 }, { name: '墙顶面石膏腻子披挂(第一遍)', days: 3 },
    { name: '墙顶面石膏腻子披挂(第二遍+打磨)', days: 5 }, { name: '墙顶面乳胶漆滚涂', days: 2 }, { name: '窗帘下单', days: 1 },
    { name: '开关插座灯具（含智能化）安装', days: 5 }, { name: '卫生间厨房铝扣板吊顶', days: 1 }, { name: '木门、木质哑口套、铝合金门安装', days: 3 },
    { name: '全屋定制柜安装', days: 12 }, { name: '卫生间卫浴安装', days: 3 }, { name: '锅炉+暖气片安装（可入住前再安装）', days: 2 },
    { name: '竣工保洁', days: 1 }, { name: '软装窗帘进场安装', days: 3 }
  ],
  duplex: [
    { name: '开工仪式', days: 1 }, { name: '原装修、土建墙体拆除', days: 3 }, { name: '土建现浇结构施工', days: 15 },
    { name: '现浇结构养护期', days: 15 }, { name: '土建墙体砌筑', days: 6 }, { name: '水电排管穿线', days: 12 },
    { name: '铝合金封窗量尺+定方案', days: 2 }, { name: '暖气片管道铺装', days: 2 }, { name: '卫生间沉箱防水+闭水试验', days: 5 },
    { name: '卫生间沉箱回填及找平', days: 2 }, { name: '卫生间二次防水+闭水试验', days: 5 }, { name: '厨房烟道包覆及包立管', days: 3 },
    { name: '瓷砖下单', days: 1 }, { name: '木门、铝合金门量尺+下单', days: 2 }, { name: '全屋窗户量尺+下单', days: 1 },
    { name: '楼梯踏步欧松板基层及扶手砌筑', days: 3 }, { name: '全屋地面瓷砖铺贴', days: 15 }, { name: '卫生间墙地面瓷砖铺贴', days: 12 },
    { name: '窗台石安装', days: 1 }, { name: '楼梯地面瓷砖铺贴', days: 5 }, { name: '美缝+填缝', days: 3 },
    { name: '轻钢龙骨石膏板造型吊顶', days: 8 }, { name: '墙面隔音及欧松板基层', days: 8 }, { name: '全屋定制柜量尺+下单', days: 2 },
    { name: '墙固（界面剂）', days: 1 }, { name: '墙顶面石膏腻子披挂(第一遍)', days: 3 }, { name: '墙顶面石膏腻子披挂(第二遍+打磨)', days: 5 },
    { name: '墙顶面乳胶漆滚涂', days: 2 }, { name: '窗帘下单', days: 1 }, { name: '开关插座灯具（含智能化）安装', days: 5 },
    { name: '卫生间厨房铝扣板吊顶', days: 1 }, { name: '木门、木质哑口套、铝合金门安装', days: 3 }, { name: '全屋定制柜安装', days: 12 },
    { name: '卫生间卫浴安装', days: 3 }, { name: '锅炉+暖气片安装（可入住前再安装）', days: 2 }, { name: '竣工保洁', days: 1 },
    { name: '软装窗帘进场安装', days: 3 }
  ]
};
// 读取进度模板（首次使用时把内置模板写入 meta；工装=默认施工阶段模板，工期留空）
async function getPlanTemplates() {
  let t = await Meta.get('planTemplates', null);
  if (!t || !t.villa) {
    t = JSON.parse(JSON.stringify(PLAN_TPL_BUILTIN));
    await Meta.set('planTemplates', t);
  }
  return t;
}

// ---------- 账户 / 分类树 / 模板（存 meta，兼容旧数据） ----------
async function getAccounts() {
  let list = await Meta.get('accounts', null);
  if (!list || !list.length) {
    list = PAY_METHODS.map((n, i) => ({ id: 'acc-' + (i + 1), name: n, opening: 0, note: '' }));
    await Meta.set('accounts', list);
  }
  return list;
}
async function getCatTree() {
  let tree = await Meta.get('catTree', null);
  if (!tree || !tree.length) {
    tree = DEFAULT_CAT_TREE.map((c, i) => ({
      id: 'c' + (i + 1), name: c.name,
      subs: c.subs.map((s, j) => ({ id: 'c' + (i + 1) + '-' + (j + 1), name: s }))
    }));
    await Meta.set('catTree', tree);
  }
  return tree;
}

// 分类统一：旧「预算计划类别库」(meta.planCategories, 字符串数组) 并入统一分类树 meta.catTree。
// 匹配规则：名称已存在（一级名或二级名）→ 原地保留；否则追加为「其他」下的二级分类。
// 迁移完成后删除 planCategories key（数据已全部并入树，不丢失）；幂等，key 不存在时跳过。
async function migrateCats() {
  let lib = null;
  try { lib = await Meta.get('planCategories', null); } catch (e) { /* ignore */ }
  if (!lib) return;
  if (!Array.isArray(lib) || !lib.length) { await Meta.del('planCategories'); return; }
  const tree = await getCatTree();
  const have = new Set();
  tree.forEach((c) => { have.add(c.name); (c.subs || []).forEach((s) => have.add(s.name)); });
  let other = tree.find((c) => c.name === '其他');
  if (!other) { other = { id: uid(), name: '其他', subs: [] }; tree.push(other); }
  let added = 0;
  lib.map((x) => (x || '').trim()).filter(Boolean).forEach((name) => {
    if (have.has(name)) return;
    (other.subs = other.subs || []).push({ id: uid(), name });
    have.add(name); added++;
  });
  await Meta.set('catTree', tree);
  await Meta.del('planCategories');
  if (added) toast('已把原「预算计划类别库」的 ' + added + ' 个类别并入统一分类（「其他」下）');
}

// 统一分类树扁平化（预算计划类别下拉数据源）：
// value = 节点名（与 planItems.cat 的名称语义兼容，旧数据无缝）；label 显示「一级＞二级」路径便于区分重名
async function getPlanCatOptions() {
  const tree = await getCatTree();
  const seen = new Set(); const out = [];
  tree.forEach((c) => {
    if (c.name && !seen.has(c.name)) { seen.add(c.name); out.push({ value: c.name, label: c.name }); }
    (c.subs || []).forEach((s) => {
      if (s.name && !seen.has(s.name)) { seen.add(s.name); out.push({ value: s.name, label: c.name + '＞' + s.name }); }
    });
  });
  return out;
}
async function getTemplates() {
  return (await Meta.get('txTemplates', [])) || [];
}


// ---------- 计算 ----------
function isIncome(t) { return t.type === 'income' || t.kind === 'income'; }
function isExpense(t) { return t.type === 'expense' || t.kind === 'expense'; }
function isTransfer(t) { return t.type === 'transfer'; }

// 金额显示（支持隐藏金额开关）
function M(n) { return state.hideMoney ? '¥****' : fmtMoney(n); }

/* ============================================================
   v2.5.0：流水改单的统一校验与合并内核
   对账单详情、记账表单两条改单路径共用，保证「校验规则一致、
   不丢字段、不用陈旧对象覆盖新数据」。
   ============================================================ */

// 某类型专属字段。改单时其它类型的专属字段必须清掉，
// 否则会出现「收入 · 材料费」「支出 · 发票类型」这类串味数据。
const TX_TYPE_FIELDS = {
  expense: ['category', 'subCat', 'region', 'trade', 'material', 'planCat', 'memberId', 'memberName', 'merchantId', 'merchantName'],
  income: ['subType', 'invoiceStatus', 'invoiceType', 'taxAmount'],
  transfer: ['fromAccount', 'toAccount']
};

function txForeignFields(type) {
  const out = [];
  Object.keys(TX_TYPE_FIELDS).forEach((k) => {
    if (k !== type) out.push.apply(out, TX_TYPE_FIELDS[k]);
  });
  return out;
}

// 日期真实性校验：格式 YYYY-MM-DD 且是真实存在的日期（拒绝 2026-02-31）
function isRealDate(d) {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const p = d.split('-').map(Number);
  const dt = new Date(p[0], p[1] - 1, p[2]);
  return dt.getFullYear() === p[0] && dt.getMonth() === p[1] - 1 && dt.getDate() === p[2];
}

// 字段级校验：返回空串表示通过，否则返回可直接提示用户的中文原因
function validateTxPatch(patch) {
  if (patch.amount !== undefined) {
    const n = Number(patch.amount);
    if (patch.amount === '' || patch.amount == null || !isFinite(n)) return '金额必须是数字';
    if (n <= 0) return '金额必须大于 0';
    if (n > 1e11) return '金额超出可记录范围（≤ 1000 亿）';
  }
  if (patch.date !== undefined && !isRealDate(patch.date)) return '日期无效，应为 YYYY-MM-DD 且真实存在';
  if (patch.time !== undefined && patch.time !== '' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(patch.time))) return '时间无效，应为 HH:MM';
  if (patch.note !== undefined && String(patch.note).length > 200) return '备注最多 200 字';
  if (patch.type !== undefined && !TX_TYPE_FIELDS[patch.type]) return '流水类型无效';
  return '';
}

// 把「表单/详情面板构造出的新对象」安全落到「库里最新记录」上：
// ① 清掉其它类型的专属字段；② 保留表单不管理的字段（如 attachmentId、planCat）
function mergeTxKeepUnknown(fresh, next) {
  const type = next.type || (fresh && fresh.type) || 'expense';
  const out = {};
  if (fresh) {
    Object.keys(fresh).forEach((k) => { out[k] = fresh[k]; });
  }
  txForeignFields(type).forEach((k) => { delete out[k]; });
  Object.keys(next).forEach((k) => {
    if (next[k] === undefined) return;
    out[k] = next[k];
  });
  out.type = type;
  out.id = (fresh && fresh.id) || next.id;
  out.createdAt = (fresh && fresh.createdAt) || next.createdAt || Date.now();
  out.updatedAt = Date.now();
  return out;
}

// 唯一改单出口：先读最新记录（防止用详情页里的陈旧快照覆盖已变更数据），
// 再校验、再合并，最后落库。返回 { ok, tx, before } 或 { ok:false, msg }
async function applyTxPatch(txId, patch) {
  const fresh = await Transactions.get(txId);
  if (!fresh) return { ok: false, msg: '该流水已被删除，请刷新后重试' };
  const err = validateTxPatch(patch);
  if (err) return { ok: false, msg: err };
  const merged = mergeTxKeepUnknown(fresh, patch);
  await Transactions.save(merged);
  return { ok: true, tx: merged, before: fresh };
}

// 弹窗滚动位置保持：展开/收起/改单后重建对账单，不让用户丢失阅读位置
function modalScrollTop() {
  const m = document.querySelector('#modal-root .modal');
  return m ? m.scrollTop : 0;
}
function restoreModalScrollTop(v) {
  const m = document.querySelector('#modal-root .modal');
  if (m && v) m.scrollTop = v;
}

async function projStats(pid) {
  const txs = await Transactions.byProject(pid);
  let income = 0, expense = 0;
  txs.forEach((t) => {
    if (isIncome(t)) income += Number(t.amount) || 0;
    else if (isExpense(t)) expense += Number(t.amount) || 0;
  });
  return { income, expense, profit: income - expense, count: txs.length };
}

// 同步统计某项目收支（用已加载的 txs，避免逐个异步）
function quickStats(txs, pid) {
  let income = 0, expense = 0, count = 0;
  txs.filter((t) => t.projectId === pid).forEach((t) => {
    count++;
    if (isIncome(t)) income += Number(t.amount) || 0;
    else if (isExpense(t)) expense += Number(t.amount) || 0;
  });
  return { income, expense, profit: income - expense, count };
}

// 时间维度汇总（今天/本周/本月/本季/本年/全部）
function timeRangeSummary(txs) {
  return timeRanges().map((r) => {
    let income = 0, expense = 0;
    txs.forEach((t) => {
      const d = fmtDate(t.date);
      if (d < r.from || d > r.to) return;
      if (isIncome(t)) income += Number(t.amount) || 0;
      else if (isExpense(t)) expense += Number(t.amount) || 0;
    });
    return { r: r, income: income, expense: expense };
  });
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
// 并发渲染保护：每次 render 递增代序号，慢的旧渲染在落盘前发现已被替代则丢弃，
// 避免连续保存/快速切换时新旧渲染交错导致视图内容混搭。
let _renderSeq = 0;
async function render() {
  const seq = ++_renderSeq;
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');
  const route = parts[0] || 'home';

  let node;
  if (route === 'projects') node = await projectsView();
  else if (route === 'recon') node = await reconView();
  else if (route === 'parties') node = await partiesView();
  else if (route === 'mine') node = await mineView();
  else if (route === 'settings') node = await settingsView();
  else if (route === 'stats') node = await statsView();
  else if (route === 'forecast') node = await forecastView();
  else if (route === 'ledger') {
    if (parts[1] && rangeOf(parts[1]).key === parts[1]) state.ledgerRange = parts[1];
    node = await ledgerView();
  }
  else if (route === 'project' && parts[1]) node = await projectDetailView(parts[1]);
  else node = await homeView();

  if (seq !== _renderSeq) return; // 已有更新的渲染，丢弃本次结果
  const view = document.getElementById('view');
  view.innerHTML = '';
  view.appendChild(node);
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.route === route));
  setupFab(route, parts[1]);
}

function setupFab(route, pid) {
  const old = document.getElementById('fab');
  if (old) old.remove();
  let fab = null;
  if (route === 'home' || route === 'projects') {
    fab = h('button', { class: 'fab', title: '新建项目', onclick: () => projectForm() }, '+');
  } else if (route === 'recon') {
    fab = h('button', { class: 'fab', title: '新建往来单位', onclick: () => partyForm() }, '+');
  } else if (route === 'parties') {
    fab = h('button', { class: 'fab', title: '新建往来单位', onclick: () => partyForm() }, '+');
  } else if (route === 'ledger') {
    fab = h('button', { class: 'fab', title: '记一笔', onclick: () => txForm('expense', '') }, '+');
  } else if (route === 'project' && pid) {
    fab = h('button', { class: 'fab', title: '记一笔', onclick: () => txForm(null, pid) }, '+');
    // 已结算归档的项目：隐藏记一笔入口（内容锁定）
    Projects.get(pid).then((p) => {
      if (p && p.status === 'settled') { const f = document.getElementById('fab'); if (f) f.remove(); }
    });
  }
  if (fab) fab.id = 'fab', document.getElementById('app').appendChild(fab);
}

// ---------- 首页 ----------
async function homeView() {
  setPageTitle('装修记账');
  const [projects, txs, rems, isDemo] = await Promise.all([
    Projects.all(), Transactions.all(), Reminders.all(), Meta.get('demoMode', false)
  ]);
  let income = 0, expense = 0;
  txs.forEach((t) => {
    if (isIncome(t)) income += Number(t.amount) || 0;
    else if (isExpense(t)) expense += Number(t.amount) || 0;
  });
  let recvDue = 0, payDue = 0;
  rems.filter((r) => !r.done).forEach((r) => {
    if (r.kind === 'receive') recvDue += Number(r.amount) || 0; else payDue += Number(r.amount) || 0;
  });

  const wrap = h('div');

  // v2.6.0：演示模式提示卡
  if (isDemo) {
    wrap.appendChild(h('div', { class: 'card', style: 'padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-style:dashed' }, [
      h('div', { style: 'min-width:0' }, [
        h('div', { style: 'font-weight:700;font-size:var(--g-fs-md)' }, '🎬 演示数据体验中'),
        h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '记账/项目都是示例，可一键换成空白账本')
      ]),
      h('button', { class: 'btn sm primary', style: 'flex:0 0 auto', onclick: () => { location.hash = '#/settings'; } }, '开始记账')
    ]));
  }

  wrap.appendChild(h('div', { class: 'row-between', style: 'margin-bottom:10px' }, [
    h('h2', { class: 'section', style: 'margin:0' }, '总览（累计）'),
    h('button', { class: 'eye-btn', title: '隐藏/显示金额', onclick: () => { state.hideMoney = !state.hideMoney; Meta.set('hideMoney', state.hideMoney).then(render); } }, state.hideMoney ? '🙈' : '👁')
  ]));
  wrap.appendChild(h('div', { class: 'stat-grid' }, [
    stat('总收入', M(income), 'income'),
    stat('总支出', M(expense), 'expense'),
    stat('总利润', M(income - expense), 'profit'),
    stat('项目数', String(projects.length), '', () => { location.hash = '#/projects'; }),
    stat('待收', M(recvDue), 'income', () => drillDue('receive')),
    stat('待付', M(payDue), 'expense', () => drillDue('pay'))
  ]));

  // v2.6.0：周期记账待确认（到期未处理的固定收支）
  try {
    const cyPend = await cyclePending();
    if (cyPend.length) {
      wrap.appendChild(h('div', { class: 'card', style: 'padding:10px 14px' }, [
        h('div', { class: 'row-between' }, [
          h('div', { style: 'font-weight:700;font-size:var(--g-fs-md)' }, '🔁 周期记账 · ' + cyPend.length + ' 期待确认'),
          h('button', { class: 'btn sm ghost', onclick: () => cyclePendingModal() }, '去处理')
        ]),
        h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:2px' },
          cyPend.slice(0, 3).map((pd) => fmtMD(pd.date) + ' ' + (pd.item.name || '') + ' ' + (pd.item.type === 'income' ? '+' : '-') + M(pd.item.amount)).join(' · ')
          + (cyPend.length > 3 ? ' 等' : '') + '，点确认才入账')
      ]));
    }
  } catch (e) { /* 周期记账失败不影响首页 */ }

  // 按时间维度汇总（点击下钻到流水页）
  wrap.appendChild(h('div', { class: 'row-between', style: 'margin:4px 0 12px' }, [
    h('h2', { class: 'section', style: 'margin:0' }, '按时间维度'),
    h('div', { style: 'display:flex;gap:8px;flex:0 0 auto' }, [
      h('button', { class: 'btn sm ghost', onclick: () => { location.hash = '#/forecast'; } }, '📈 资金预测'),
      h('button', { class: 'btn sm ghost', onclick: () => { location.hash = '#/stats'; } }, '统计报表 ›')
    ])
  ]));
  const timeCard = h('div', { class: 'card' });
  timeRangeSummary(txs).forEach((it) => {
    timeCard.appendChild(h('div', { class: 'tr-row', onclick: () => { location.hash = '#/ledger/' + it.r.key; } }, [
      h('div', { style: 'flex:1;min-width:0' }, [
        h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl)' }, it.r.label),
        h('div', { class: 'meta' }, it.r.sub)
      ]),
      h('div', { class: 'tr-r' }, [
        h('div', { class: 'amt expense' }, '-' + M(it.expense)),
        h('div', { class: 'amt income', style: 'font-size:var(--g-fs-md)' }, '+' + M(it.income))
      ]),
      h('span', { class: 'chev' }, '›')
    ]));
  });
  wrap.appendChild(timeCard);

  // 7 天内到期节点（含逾期），点击进入对应项目
  const lim = new Date();
  lim.setDate(lim.getDate() + 7);
  const limStr = lim.getFullYear() + '-' + pad2(lim.getMonth() + 1) + '-' + pad2(lim.getDate());
  const td = today();
  const dueSoon = rems.filter((r) => !r.done && r.dueDate && r.dueDate <= limStr)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  if (dueSoon.length) {
    wrap.appendChild(h('h2', { class: 'section' }, '7 天内到期（' + dueSoon.length + '）'));
    const dueCard = h('div', { class: 'card' });
    dueSoon.forEach((r) => {
      const overdue = r.dueDate < td;
      const pd = projects.find((x) => x.id === r.projectId);
      dueCard.appendChild(h('div', { class: 'tr-row', onclick: () => { if (pd) location.hash = '#/project/' + pd.id; else toast('该节点所属项目已删除'); } }, [
        h('div', { style: 'flex:1;min-width:0' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl)' }, [
            h('span', { class: 'tag ' + (r.kind === 'receive' ? 'paid' : 'unpaid'), style: 'margin-right:6px' }, r.kind === 'receive' ? '收' : '付'),
            document.createTextNode(r.title || '未命名节点')
          ]),
          h('div', { class: 'meta' }, (pd ? pd.name : '未关联项目') + ' · 约定 ' + fmtDate(r.dueDate) + (overdue ? ' · 已逾期' + Math.round((new Date(td) - new Date(r.dueDate)) / 864e5) + '天' : ''))
        ]),
        h('div', { class: 'tr-r' }, [
          h('div', { class: 'amt ' + (r.kind === 'receive' ? 'income' : 'expense'), style: r.amount ? '' : 'font-size:var(--g-fs-md);color:var(--muted)' }, r.amount ? M(r.amount) : (overdue ? '⚠️ 逾期' : '待办'))
        ]),
        h('span', { class: 'chev' }, '›')
      ]));
    });
    wrap.appendChild(dueCard);
  }

  // P2.5：工期预警（未完成阶段预计结束时间 逾期/临近）
  try {
    const sw2 = await stageWarnings();
    if (sw2.length) {
      sw2.sort((a, b) => (b.level === 'over' ? 1 : 0) - (a.level === 'over' ? 1 : 0) || (a.s.planEnd || '').localeCompare(b.s.planEnd || ''));
      wrap.appendChild(h('h2', { class: 'section' }, '⏰ 工期预警（' + sw2.length + '）'));
      const sCard = h('div', { class: 'card' });
      sw2.slice(0, 10).forEach((w) => {
        sCard.appendChild(h('div', { class: 'tr-row', onclick: () => { location.hash = '#/project/' + w.p.id; } }, [
          h('div', { style: 'flex:1;min-width:0' }, [
            h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl)' }, [
              h('span', { class: 'tag ' + (w.level === 'over' ? 'unpaid' : 'finished'), style: 'margin-right:6px' }, w.level === 'over' ? '逾期' : '临近'),
              document.createTextNode(w.p.name)
            ]),
            h('div', { class: 'meta' }, w.msg)
          ]),
          h('span', { class: 'chev' }, '›')
        ]));
      });
      if (sw2.length > 10) sCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);padding:8px 0 2px' }, '还有 ' + (sw2.length - 10) + ' 条，进项目详情查看'));
      wrap.appendChild(sCard);
    }
  } catch (e) { /* 工期预警失败不影响首页 */ }

  // P2：预算预警（总成本预算 + 各计划类别，超支红/接近黄）
  try {
    const warns = await budgetWarnings();
    if (warns.length) {
      warns.sort((a, b) => (b.level === 'over' ? 1 : 0) - (a.level === 'over' ? 1 : 0) || b.ratio - a.ratio);
      wrap.appendChild(h('h2', { class: 'section' }, '⚠️ 预算预警（' + warns.length + '）'));
      const wCard = h('div', { class: 'card' });
      warns.slice(0, 10).forEach((w) => {
        const pct = Math.min(100, Math.round(w.ratio * 100));
        const row = h('div', { class: 'tr-row', onclick: () => { location.hash = '#/project/' + w.p.id; } }, [
          h('div', { style: 'flex:1;min-width:0' }, [
            h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl)' }, [
              h('span', { class: 'tag ' + (w.level === 'over' ? 'unpaid' : 'finished'), style: 'margin-right:6px' }, w.level === 'over' ? '超支' : '接近'),
              document.createTextNode(w.p.name)
            ]),
            h('div', { class: 'meta' }, w.msg),
            h('div', { class: 'bar', style: 'margin-top:5px' }, [h('div', { class: 'bar-fill' + (w.level === 'over' ? ' over' : ''), style: 'width:' + pct + '%' })])
          ]),
          h('div', { style: 'font-weight:700;font-size:var(--g-fs-md);color:' + (w.level === 'over' ? 'var(--danger)' : 'var(--accent)') }, pct + '%'),
          h('span', { class: 'chev' }, '›')
        ]);
        wCard.appendChild(row);
      });
      if (warns.length > 10) wCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);padding:8px 0 2px' }, '还有 ' + (warns.length - 10) + ' 条预警，进项目详情查看'));
      wrap.appendChild(wCard);
    }
  } catch (e) { /* 预警计算失败不影响首页 */ }

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
    wrap.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin:-2px 0 10px' },
      '当前筛选合计：收 ' + M(sum.i) + ' · 支 ' + M(sum.e) + ' · 利润 ' + M(sum.i - sum.e)));
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
      h('div', { style: 'font-weight:700', class: kind === 'receive' ? 'amt income' : 'amt expense' }, r.amount ? M(r.amount) : '')
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
    h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:6px' }, sub)
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
    h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, p.clientName || '')
  ]));

  const stageName = currentStageName(p);
  card.appendChild(h('div', { style: 'margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center' }, [
    h('span', { class: 'tag stage' }, stageName || '未排期'),
    h('span', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '开工 ' + (p.startDate ? fmtDate(p.startDate) : '—'))
  ]));

  const body = h('div', { style: 'margin-top:8px;display:flex;gap:14px;flex-wrap:wrap' });
  body.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, p.contractAmount ? '合同 ' + M(p.contractAmount) : '合同 —'));
  if (st.count != null) body.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, st.count + ' 笔'));
  card.appendChild(body);

  card.appendChild(h('div', { class: 'row-between', style: 'margin-top:10px' }, [
    h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '收 ' + M(st.income) + ' · 支 ' + M(st.expense)),
    h('div', { style: 'font-weight:700;color:var(--accent)' }, '结余 ' + M(st.profit))
  ]));

  const settled = p.status === 'settled';
  card.appendChild(h('div', { style: 'display:flex;gap:8px;margin-top:12px' }, settled ? [
    h('button', { class: 'btn sm ghost', onclick: (e) => { e.stopPropagation(); location.hash = '#/project/' + p.id; } }, '🔒 已结算归档·查看详情')
  ] : [
    h('button', { class: 'btn sm primary', onclick: (e) => { e.stopPropagation(); txForm('income', p.id); } }, '记收款'),
    h('button', { class: 'btn sm', style: 'background:var(--expense);color:#fff', onclick: (e) => { e.stopPropagation(); txForm('expense', p.id); } }, '记支出'),
    h('button', { class: 'btn sm ghost', onclick: (e) => { e.stopPropagation(); location.hash = '#/project/' + p.id; } }, '详情')
  ]));
  return card;
}

// ---------- 全局流水（对齐参考：汇总卡 + 时间粒度 + 维度筛选 + 搜索 + 年月分组） ----------
async function ledgerView() {
  setPageTitle('流水');
  const [txs, projects, parties, accounts, catTree] = await Promise.all([
    Transactions.all(), Projects.all(), Parties.all(), getAccounts(), getCatTree()
  ]);
  const pname = (id) => { const p = projects.find((x) => x.id === id); return p ? p.name : '未关联项目'; };

  // ---- 筛选 ----
  const ranges = timeRanges();
  let rg = ranges.find((r) => r.key === state.ledgerRange) || ranges[2];
  // v1.9.0：自定义区间（统计页月度走势钻取进入）
  if (state.ledgerRange === 'custom' && state.ledgerCustom) {
    rg = { key: 'custom', label: state.ledgerCustom.label, sub: '', from: state.ledgerCustom.from, to: state.ledgerCustom.to };
  }
  // v2.4.0：统计下钻——直接锁定一组流水 id（比按日期区间回查精确，跨年项目不会串年份）
  const drill = state.ledgerDrill;
  let drillMap = null;
  if (drill && drill.ids && drill.ids.length) {
    drillMap = {};
    drill.ids.forEach((id) => { drillMap[id] = 1; });
    rg = { key: 'drill', label: drill.label, sub: drill.ids.length + ' 笔', from: '0000-01-01', to: '9999-12-31' };
  }
  let list = drillMap
    ? txs.filter((t) => drillMap[t.id])
    : txs.filter((t) => {
      const d = fmtDate(t.date);
      return d >= rg.from && d <= rg.to;
    });
  if (state.ledgerCat !== 'all') list = list.filter((t) => (t.category || '') === state.ledgerCat);
  if (state.ledgerSub !== 'all') list = list.filter((t) => (t.subCat || '') === state.ledgerSub);
  if (state.ledgerAccount !== 'all') list = list.filter((t) => (t.account || t.method || '') === state.ledgerAccount);
  if (state.ledgerProject !== 'all') list = list.filter((t) => t.projectId === state.ledgerProject);
  const q = state.ledgerQ.trim().toLowerCase();
  if (q) {
    list = list.filter((t) => {
      const hay = [t.category, t.subCat, t.subType, t.partyName, t.memberName, t.merchantName, t.note, t.material, t.fromAccount, t.toAccount, pname(t.projectId)]
        .filter(Boolean).join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }
  if (state.ledgerSort === 'amount') list = list.slice().sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
  else if (state.ledgerSort === 'amountAsc') list = list.slice().sort((a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0));
  else list = list.slice().sort((a, b) => (fmtDate(b.date) + (b.time || '')).localeCompare(fmtDate(a.date) + (a.time || '')));

  // ---- 汇总（转账不计入收入/支出） ----
  let income = 0, expense = 0, transfer = 0;
  list.forEach((t) => {
    if (isIncome(t)) income += Number(t.amount) || 0;
    else if (isExpense(t)) expense += Number(t.amount) || 0;
    else transfer += Number(t.amount) || 0;
  });

  const wrap = h('div');

  // v2.4.0：统计下钻提示条（口径锁定期间，日期区间与维度筛选在其之上继续生效）
  if (drillMap) {
    wrap.appendChild(h('div', { class: 'card', style: 'padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px' }, [
      h('div', { style: 'min-width:0;flex:1' }, [
        h('div', { style: 'font-weight:700;font-size:var(--g-fs-md)' }, '📊 统计下钻'),
        h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, drill.label)
      ]),
      h('button', { class: 'btn sm ghost', onclick: () => { state.ledgerDrill = null; state.ledgerRange = 'month'; render(); } }, '退出')
    ]));
  }

  // 常用模板（一键套用）
  const tpls = await getTemplates();
  if (tpls.length) {
    wrap.appendChild(h('h2', { class: 'section', style: 'margin-top:0' }, '常用模板'));
    const tplRow = h('div', { class: 'chips', style: 'margin-bottom:14px' });
    tpls.forEach((tp) => {
      tplRow.appendChild(h('button', { class: 'chip', title: '套用模板记账', onclick: () => {
        txForm(tp.type || 'expense', '', null, {
          type: tp.type || 'expense', amount: tp.amount, category: tp.category,
          account: tp.account || '', memberId: tp.memberId || '', merchantId: tp.merchantId || '',
          subType: (tp.type === 'income' ? (tp.category || '') : ''), note: tp.note || ''
        });
      } }, tp.name + (tp.amount ? ' · ' + M(tp.amount) : '')));
    });
    wrap.appendChild(tplRow);
  }

  // 汇总卡
  const sumCard = h('div', { class: 'card sum-card' });
  sumCard.appendChild(h('div', { class: 'row-between' }, [
    h('div', { class: 'sum-label' }, rg.label + ' · ' + rg.sub),
    h('button', { class: 'eye-btn', title: '隐藏/显示金额', onclick: () => { state.hideMoney = !state.hideMoney; Meta.set('hideMoney', state.hideMoney).then(render); } }, state.hideMoney ? '🙈' : '👁')
  ]));
  sumCard.appendChild(h('div', { class: 'sum-main' }, [
    h('span', { class: 'sum-k' }, '结余 '),
    h('span', { class: 'sum-v' }, M(income - expense))
  ]));
  sumCard.appendChild(h('div', { class: 'sum-sub' }, [
    h('span', {}, '收入 ' + M(income)),
    h('span', { style: 'margin:0 8px' }, '|'),
    h('span', {}, '支出 ' + M(expense)),
    transfer ? h('span', { style: 'margin-left:8px' }, '转账 ' + M(transfer)) : null
  ]));
  wrap.appendChild(sumCard);

  // 近 6 个月收支趋势
  wrap.appendChild(trendCard(txs));

  // 时间粒度
  const pills = h('div', { class: 'pill-tabs' });
  ranges.forEach((r) => {
    pills.appendChild(h('button', { class: 'pill' + (state.ledgerRange === r.key ? ' on' : ''), onclick: () => { state.ledgerRange = r.key; state.ledgerCustom = null; render(); } }, r.label));
  });
  wrap.appendChild(pills);

  // 维度筛选：分类（两级）/ 账户 / 项目
  const dimCard = h('div', { class: 'card' });
  const dimDefaults = () => state.ledgerCat === 'all' && state.ledgerSub === 'all' && state.ledgerAccount === 'all' && state.ledgerProject === 'all' && !state.ledgerQ.trim();
  const headRow = h('div', { class: 'dim-row' }, [
    h('span', { class: 'dim-k' }, '分类'),
    h('select', { class: 'ctl', style: 'flex:1;min-width:0', onchange: (e) => { state.ledgerCat = e.target.value; state.ledgerSub = 'all'; render(); } },
      [h('option', { value: 'all' }, '全部分类')].concat(catTree.map((c) => h('option', { value: c.name }, c.name))))
  ]);
  headRow.children[1].value = state.ledgerCat; // 回填当前筛选值，避免重渲染后显示重置
  dimCard.appendChild(headRow);
  if (state.ledgerCat !== 'all') {
    const c = catTree.find((x) => x.name === state.ledgerCat);
    const subs = (c && c.subs) || [];
    if (subs.length) {
      const subRow = h('div', { class: 'dim-row' }, [
        h('span', { class: 'dim-k' }, '二级'),
        h('select', { class: 'ctl', style: 'flex:1;min-width:0', onchange: (e) => { state.ledgerSub = e.target.value; render(); } },
          [h('option', { value: 'all' }, '全部二级')].concat(subs.map((s) => h('option', { value: s.name }, s.name))))
      ]);
      subRow.children[1].value = state.ledgerSub;
      dimCard.appendChild(subRow);
    }
  }
  const accRow = h('div', { class: 'dim-row' }, [
    h('span', { class: 'dim-k' }, '账户'),
    h('select', { class: 'ctl', style: 'flex:1;min-width:0', onchange: (e) => { state.ledgerAccount = e.target.value; render(); } },
      [h('option', { value: 'all' }, '全部账户')].concat(accounts.map((a) => h('option', { value: a.name }, a.name))))
  ]);
  accRow.children[1].value = state.ledgerAccount;
  dimCard.appendChild(accRow);
  const projRow = h('div', { class: 'dim-row' }, [
    h('span', { class: 'dim-k' }, '项目'),
    h('select', { class: 'ctl', style: 'flex:1;min-width:0', onchange: (e) => { state.ledgerProject = e.target.value; render(); } },
      [h('option', { value: 'all' }, '全部项目')].concat(projects.map((p) => h('option', { value: p.id }, p.name))))
  ]);
  projRow.children[1].value = state.ledgerProject;
  dimCard.appendChild(projRow);
  // 一键重置筛选
  if (!dimDefaults()) {
    dimCard.appendChild(h('div', { class: 'dim-row' }, [
      h('span', { class: 'dim-k' }, ''),
      h('button', { class: 'btn sm ghost', style: 'flex:1', onclick: () => {
        state.ledgerCat = 'all'; state.ledgerSub = 'all'; state.ledgerAccount = 'all';
        state.ledgerProject = 'all'; state.ledgerQ = ''; render();
      } }, '重置筛选（当前已隐藏部分流水）')
    ]));
  }
  // 搜索
  const qInp = h('input', { class: 'ctl', style: 'flex:1;min-width:0', placeholder: '搜索备注/单位/项目/分类', value: state.ledgerQ });
  qInp.addEventListener('input', (e) => {
    state.ledgerQ = e.target.value;
    clearTimeout(qInp._t);
    qInp._t = setTimeout(render, 350);
  });
  dimCard.appendChild(h('div', { class: 'dim-row' }, [h('span', { class: 'dim-k' }, '搜索'), qInp]));
  // 排序
  const sortSeg = h('div', { class: 'seg', style: 'flex:1' });
  [['date', '按日期'], ['amount', '金额↓'], ['amountAsc', '金额↑']].forEach(([v, label]) => {
    sortSeg.appendChild(h('button', { class: state.ledgerSort === v ? 'on' : '', onclick: () => { state.ledgerSort = v; render(); } }, label));
  });
  dimCard.appendChild(h('div', { class: 'dim-row' }, [h('span', { class: 'dim-k' }, '排序'), sortSeg]));
  // 批量管理开关
  dimCard.appendChild(h('div', { class: 'dim-row' }, [
    h('span', { class: 'dim-k' }, '批量'),
    h('button', { class: 'btn sm ' + (state.ledgerBatch ? 'primary' : 'ghost'), style: 'flex:1', onclick: () => {
      state.ledgerBatch = !state.ledgerBatch; state.ledgerSel = {}; render();
    } }, state.ledgerBatch ? '✓ 批量管理中（点此退出）' : '进入批量管理（多选删除/改项目）')
  ]));
  wrap.appendChild(dimCard);

  // ---- 年 → 月 分组列表 ----
  if (!list.length) {
    const es = emptyState('该条件下没有流水', '当前筛选/时间范围内没有匹配的记录');
    es.appendChild(h('button', { class: 'btn ghost', style: 'margin-top:12px', onclick: () => {
      state.ledgerRange = 'all'; state.ledgerCat = 'all'; state.ledgerSub = 'all';
      state.ledgerAccount = 'all'; state.ledgerProject = 'all'; state.ledgerQ = ''; render();
    } }, '清除全部筛选并显示所有时间'));
    wrap.appendChild(es);
  } else {
    // v2.6.0：流水行点击展开详情面板（复用对账单详情 + 改单内核）
    const ledgerCtx = {
      projects: projects, pname: pname, partyId: null, savedMsg: '已更新',
      reopen: (id, msg) => {
        const y = window.scrollY;
        state.ledgerExpand = id || null;
        render().then(() => { window.scrollTo(0, y); if (msg) toast(msg); });
      }
    };
    wrap.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin:-4px 2px 8px' }, '点击任意流水可展开详情，直接改金额 / 日期 / 备注'));
    const byYear = {};
    list.forEach((t) => {
      const d = fmtDate(t.date);
      const y = d.slice(0, 4) || '未知';
      const mo = d.slice(5, 7) || '00';
      byYear[y] = byYear[y] || {};
      byYear[y][mo] = byYear[y][mo] || [];
      byYear[y][mo].push(t);
    });
    Object.keys(byYear).sort().reverse().forEach((y) => {
      const months = byYear[y];
      let yIn = 0, yOut = 0;
      Object.keys(months).forEach((mo) => months[mo].forEach((t) => {
        if (isIncome(t)) yIn += Number(t.amount) || 0;
        else if (isExpense(t)) yOut += Number(t.amount) || 0;
      }));
      const yearCard = h('div', { class: 'card' });
      yearCard.appendChild(h('div', { class: 'row-between' }, [
        h('div', { style: 'font-weight:700' }, y + ' 年'),
        h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '结余 ' + M(yIn - yOut) + ' · 收 ' + M(yIn) + ' · 支 ' + M(yOut))
      ]));
      wrap.appendChild(yearCard);

      Object.keys(months).sort().reverse().forEach((mo) => {
        const mCard = h('div', { class: 'card' });
        mCard.appendChild(h('div', { class: 'month-head' }, Number(mo) + ' 月'));
        months[mo].forEach((t) => mCard.appendChild(ledgerRow(t, pname, ledgerCtx)));
        wrap.appendChild(mCard);
      });
    });
  }
  if (state.ledgerBatch) wrap.appendChild(batchBar(projects));
  return wrap;
}

function ledgerRow(t, pname, ctx) {
  const isIn = isIncome(t), isOut = isExpense(t);
  const batch = state.ledgerBatch;
  const isSel = !!state.ledgerSel[t.id];
  const title = isTransfer(t)
    ? '转账 ' + (t.fromAccount || '?') + ' → ' + (t.toAccount || '?')
    : (isIn ? (t.subType || '收入') : ((t.category || '支出') + (t.subCat ? ' · ' + t.subCat : '')));
  const sub = [
    pname(t.projectId),
    isTransfer(t) ? '' : (t.partyName || ''),
    (t.account || t.method || ''),
    t.note || ''
  ].filter(Boolean).join(' · ');
  const sign = isIn ? '+' : (isOut ? '-' : '↔');
  const cls = isIn ? 'income' : (isOut ? 'expense' : 'transfer');
  const dateCol = h('div', { class: 'tx-date' }, [
    h('div', { class: 'tx-d' }, String(fmtDate(t.date)).slice(8, 10) + '日'),
    h('div', { class: 'tx-w' }, weekdayCN(t.date))
  ]);
  const textCol = h('div', { style: 'min-width:0;flex:1' }, [
    h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, title),
    h('div', { class: 'meta', style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, sub + (t.time ? ' ' + t.time : ''))
  ]);
  const left = h('div', { style: 'display:flex;gap:10px;align-items:center;min-width:0;flex:1' }, batch
    ? (() => {
        const cb = h('input', { type: 'checkbox', style: 'width:18px;height:18px;flex:0 0 auto' });
        cb.checked = isSel;
        cb.addEventListener('click', (e) => e.stopPropagation());
        cb.addEventListener('change', () => { state.ledgerSel[t.id] = cb.checked; render(); });
        return [cb, dateCol, textCol];
      })()
    : [dateCol, textCol]);
  const right = h('div', { style: 'display:flex;align-items:center;gap:6px;flex:0 0 auto' }, [
    h('div', { class: 'amt ' + cls }, sign + M(t.amount).replace('¥', '¥')),
    batch ? null : h('button', { class: 'edit-x', title: '复制此笔为新记录', onclick: (e) => { e.stopPropagation(); txForm(null, t.projectId, Object.assign({}, t, { __copy: true, date: today(), time: nowHm() })); } }, '⧉'),
    batch ? null : h('button', { class: 'edit-x', title: '编辑', onclick: (e) => { e.stopPropagation(); txForm(null, t.projectId, t); } }, '✎')
  ].filter(Boolean));
  const rowNode = h('div', { class: 'tx' + (isSel ? ' sel' : '') + (batch ? ' batch' : '') }, [left, right]);
  if (batch) {
    rowNode.addEventListener('click', () => { state.ledgerSel[t.id] = !state.ledgerSel[t.id]; render(); });
    return rowNode;
  }
  // v2.6.0：非批量模式下点击行展开/收起详情面板（复用对账单详情 + 统一改单内核）
  const open = state.ledgerExpand === t.id;
  rowNode.classList.add('tx-click');
  if (open) rowNode.classList.add('open');
  rowNode.title = '点击展开/收起流水详情';
  rowNode.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('.edit-x')) return; // 复制/直接编辑按钮不触发展开
    expandLedgerRow(open ? null : t.id);
  });
  const item = h('div', { class: 'tx-item' });
  item.appendChild(rowNode);
  if (open && ctx) item.appendChild(txDetailPanel(t, ctx));
  return item;
}

// v2.6.0：展开/收起流水详情后重渲染并保持滚动位置
function expandLedgerRow(id) {
  const y = window.scrollY;
  state.ledgerExpand = id;
  render().then(() => { window.scrollTo(0, y); });
}

// 近 6 个月收支趋势（纯 CSS 柱状，点击下方说明无操作）
function trendCard(txs) {
  const nowD = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(nowD.getFullYear(), nowD.getMonth() - i, 1);
    months.push({ y: d.getFullYear(), m: d.getMonth() + 1 });
  }
  const data = months.map(({ y, m }) => {
    let inc = 0, exp = 0;
    const pre = y + '-' + pad2(m);
    txs.forEach((t) => {
      const d = fmtDate(t.date);
      if (d.indexOf(pre) === 0) {
        if (isIncome(t)) inc += Number(t.amount) || 0;
        else if (isExpense(t)) exp += Number(t.amount) || 0;
      }
    });
    return { label: m + '月', inc, exp };
  });
  const max = Math.max(1, ...data.map((d) => Math.max(d.inc, d.exp)));
  const card = h('div', { class: 'card' });
  card.appendChild(h('div', { style: 'font-weight:700;margin-bottom:10px' }, '近 6 个月收支趋势'));
  const row = h('div', { class: 'trend-row' });
  data.forEach((d) => {
    row.appendChild(h('div', { class: 'trend-col' }, [
      h('div', { class: 'trend-bars' }, [
        h('div', { class: 'trend-bar in', style: 'height:' + Math.max(2, Math.round((d.inc / max) * 84)) + 'px', title: '收入 ' + fmtMoney(d.inc) }),
        h('div', { class: 'trend-bar out', style: 'height:' + Math.max(2, Math.round((d.exp / max) * 84)) + 'px', title: '支出 ' + fmtMoney(d.exp) })
      ]),
      h('div', { class: 'trend-l' }, d.label),
      h('div', { class: 'trend-v' + (d.inc - d.exp < 0 ? ' neg' : '') }, M(d.inc - d.exp))
    ]));
  });
  card.appendChild(row);
  card.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-xs);margin-top:8px;text-align:center' }, '每列：左柱=收入 · 右柱=支出 · 底部数字为当月结余'));
  return card;
}

// 批量操作浮动条（流水页）
function batchBar(projects) {
  const ids = Object.keys(state.ledgerSel).filter((k) => state.ledgerSel[k]);
  const bar = h('div', { class: 'batch-bar' }, [
    h('span', { style: 'flex:1;font-size:var(--g-fs-md);font-weight:600' }, '已选 ' + ids.length + ' 笔'),
    h('button', { class: 'btn sm ghost', disabled: ids.length ? undefined : 'true', style: ids.length ? '' : 'opacity:.5', onclick: () => { if (!ids.length) { toast('请先勾选流水'); return; } batchMove(ids, projects); } }, '改项目'),
    h('button', { class: 'btn sm danger', style: ids.length ? '' : 'opacity:.5', onclick: () => {
      if (!ids.length) { toast('请先勾选流水'); return; }
      confirmDialog('删除选中的 ' + ids.length + ' 笔流水？凭证照片会保留，可在「设置 → 数据安全 → 回收站」30 天内整体还原。', () => {
        // v2.0.0：整批作为一个 group 入回收站，可一次性还原
        Promise.all(ids.map((id) => Transactions.get(id)))
          .then((list) => Transactions.remove(list.filter(Boolean)))
          .then(() => { state.ledgerSel = {}; toast('已删除 ' + ids.length + ' 笔，可在回收站还原'); render(); });
      }, '批量删除');
    } }, '删除'),
    h('button', { class: 'btn sm ghost', onclick: () => { state.ledgerBatch = false; state.ledgerSel = {}; render(); } }, '退出')
  ]);
  return bar;
}
function batchMove(ids, projects) {
  const f = h('div');
  const s = h('select', {}, [h('option', { value: '' }, '请选择目标项目')].concat(projects.map((p) => h('option', { value: p.id }, p.name))));
  field(f, '把选中的 ' + ids.length + ' 笔流水改到哪个项目？', s);
  openModal('批量改所属项目', f, [
    h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消'),
    h('button', { class: 'btn primary', onclick: () => {
      if (!s.value) { toast('请选择项目'); return; }
      Promise.all(ids.map((id) => Transactions.get(id).then((t) => { if (t) { t.projectId = s.value; return Transactions.save(t); } return null; })))
        .then(() => { state.ledgerSel = {}; closeModal(); toast('已改到目标项目'); render(); });
    } }, '确认修改')
  ]);
}

// ---------- 项目列表 ----------
async function projectsView() {
  setPageTitle('项目管理');
  const [projects, txs] = await Promise.all([Projects.all(), Transactions.all()]);
  const wrap = h('div');
  let income = 0, expense = 0;
  txs.forEach((t) => {
    if (isIncome(t)) income += Number(t.amount) || 0;
    else if (isExpense(t)) expense += Number(t.amount) || 0;
  });
  wrap.appendChild(h('div', { class: 'stat-grid' }, [
    stat('结余', M(income - expense), 'profit'),
    stat('总收入', M(income), 'income'),
    stat('总支出', M(expense), 'expense'),
    stat('项目数', String(projects.length), '')
  ]));
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
  const locked = p.status === 'settled';
  const lockHint = () => toast('项目已结算归档锁定，请先在「编辑」中把状态改回再修改');
  const wrap = h('div');

  // 信息卡
  const info = h('div', { class: 'card' });
  if (locked) info.appendChild(h('div', { style: 'background:rgba(47,129,247,.12);color:var(--accent);font-size:var(--g-fs-sm);padding:7px 10px;border-radius:8px;margin-bottom:10px' },
    '🔒 本项目已结算归档，内容为只读。如需修改，请点「编辑」把状态改回「进行中」。'));
  info.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'font-weight:700;font-size:var(--g-fs-lg)' }, p.name || '未命名'),
    h('span', { class: 'tag ' + (STATUS_MAP[p.status] || {}).cls }, (STATUS_MAP[p.status] || {}).label || '进行中')
  ]));
  const fields = [
    ['客户', p.clientName], ['电话', p.phone], ['地址', p.address],
    ['户型', p.houseType], ['建筑面积', p.buildArea ? p.buildArea + ' ㎡' : '—'], ['施工面积', p.constructArea ? p.constructArea + ' ㎡' : '—'],
    ['施工经理', p.manager], ['设计师', p.designer],
    ['合同金额', p.contractAmount ? M(p.contractAmount) : '—'],
    ['成本预算', p.costBudget ? M(p.costBudget) : '（未设，默认=合同额）'],
    ['开工', fmtDate(p.startDate)], ['竣工', fmtDate(p.endDate)], ['备注', p.note]
  ];
  fields.forEach(([k, v]) => {
    if (v) info.appendChild(h('div', { class: 'row-between', style: 'margin-top:8px' }, [
      h('span', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, k),
      h('span', { style: 'font-size:var(--g-fs-md);max-width:60%;text-align:right' }, String(v))
    ]));
  });
  const editBtns = h('div', { class: 'btn-row' }, [
    h('button', { class: 'btn ghost', onclick: () => projectForm(p) }, '编辑'),
    h('button', { class: 'btn ghost', title: '复制基本信息/阶段/预算计划为新项目', onclick: () => {
      confirmDialog('以「' + (p.name || '该项目') + '」为模板新建项目？（复制基本信息、阶段与预算计划，阶段完成状态清空）', () => {
        const np = Object.assign({}, p, {
          id: uid(), name: (p.name || '未命名') + '（副本）', status: 'ongoing',
          createdAt: Date.now(), updatedAt: Date.now(),
          stages: (p.stages || []).map((s) => ({ id: uid(), name: s.name || '', done: false, date: '', planStart: s.planStart || '', planEnd: s.planEnd || '' })),
          planItems: (p.planItems || []).map((it) => ({ id: uid(), cat: it.cat || '', amount: Number(it.amount) || 0 }))
        });
        Projects.save(np).then(() => { toast('已创建副本，请修改项目名称'); location.hash = '#/project/' + np.id; projectForm(np); });
      }, '复制项目');
    } }, '⧉ 复制'),
    h('button', { class: 'btn danger', onclick: () => confirmDialog('删除该项目会一并删除其下所有记账与提醒，可在「设置 → 数据安全 → 回收站」30 天内整体还原。确定？', () => {
      Projects.remove(p.id).then(() => { toast('已删除，可在回收站还原'); location.hash = '#/projects'; });
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
    stageCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:8px' }, '未设置阶段，点「添加/改名」或项目「编辑」添加'));
  } else {
    const stageAlertDays = Number(await Meta.get('stageAlertDays', 3)) || 3;
    const td = today();
    stages.forEach((s) => {
      // 工期状态：未完成且有预计结束时间 → 逾期红 / 临近黄
      let warn = null;
      if (!s.done && s.planEnd) {
        const dd = daysDiff(s.planEnd, td);
        if (dd < 0) warn = { cls: 'unpaid', text: '⚠️ 逾期 ' + (-dd) + ' 天' };
        else if (dd <= stageAlertDays) warn = { cls: 'finished', text: '⏰ ' + (dd === 0 ? '今天到期' : '还剩 ' + dd + ' 天') };
      }
      const box = h('div', { style: 'border:1px solid var(--border);border-radius:10px;padding:8px;margin-top:8px' });
      const row = h('div', { style: 'display:flex;gap:8px;align-items:center' });
      const cb = h('input', { type: 'checkbox', style: 'width:18px;height:18px;flex:0 0 auto' });
      cb.checked = !!s.done;
      cb.disabled = locked;
      cb.addEventListener('change', () => { s.done = cb.checked; if (s.done && !s.date) s.date = today(); Projects.save(p).then(render); });
      // 工期 + 实际完成复核（实际完成日 vs 预计结束日）
      let reviewTxt = '';
      if (!s.done && s.planStart && s.planEnd && daysDiff(s.planEnd, s.planStart) >= 0) {
        reviewTxt = ' · 工期 ' + (daysDiff(s.planEnd, s.planStart) + 1) + ' 天';
      } else if (s.done && s.date && s.planEnd) {
        const dv = daysDiff(s.date, s.planEnd);
        reviewTxt = dv === 0 ? ' · 按期完成' : (dv > 0 ? ' · 比计划晚 ' + dv + ' 天' : ' · 比计划早 ' + (-dv) + ' 天');
      }
      const nameWrap = h('div', { style: 'flex:1;min-width:0' }, [
        h('div', { style: 'font-weight:600;font-size:var(--g-fs-md)' }, [
          document.createTextNode(s.name || '未命名阶段'),
          warn ? h('span', { class: 'tag ' + warn.cls, style: 'margin-left:6px' }, warn.text) : null
        ]),
        h('div', { class: 'meta', style: s.done ? 'color:var(--income)' : '' }, (s.done ? '已完成' : '未完成') + reviewTxt)
      ]);
      const del = locked ? null : h('button', { class: 'delete-x', onclick: () => { p.stages = stages.filter((x) => x.id !== s.id); Projects.save(p).then(render); } }, '×');
      row.appendChild(cb); row.appendChild(nameWrap);
      if (del) row.appendChild(del);
      box.appendChild(row);
      // 第二行：预计开始 / 预计结束 / 实际完成（均可改，即改即存）
      const row2 = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap' });
      const mk = (label, key, width) => {
        const wrap = h('div', { style: 'display:flex;gap:3px;align-items:center;flex:1;min-width:0' });
        wrap.appendChild(h('span', { class: 'muted', style: 'font-size:var(--g-fs-xs);flex:0 0 auto' }, label));
        const inp = h('input', { type: 'date', value: s[key] || '', title: label, style: 'width:' + width + ';min-width:0;flex:1' });
        if (locked) inp.disabled = true;
        inp.addEventListener('change', () => { s[key] = inp.value; Projects.save(p); });
        wrap.appendChild(inp);
        return wrap;
      };
      row2.appendChild(mk('预计起', 'planStart', '96px'));
      row2.appendChild(mk('预计止', 'planEnd', '96px'));
      row2.appendChild(mk('实际完', 'date', '96px'));
      box.appendChild(row2);
      stageCard.appendChild(box);
    });
  }
  wrap.appendChild(stageCard);

  // 利润与回款看板（v2.1.0：新增毛利率、回款率）
  const st = await projStats(id);
  const contract = Number(p.contractAmount) || 0;
  const margin = st.income > 0 ? (st.profit / st.income * 100) : 0;
  const recvRate = contract > 0 ? Math.min(100, Math.round(st.income / contract * 100)) : 0;
  const due = contract - st.income; // 应收余额（合同额未收部分）
  const profitCard = h('div', { class: 'stat-grid' }, [
    stat('收入', M(st.income), 'income'),
    stat('支出', M(st.expense), 'expense'),
    stat('利润', M(st.profit), 'profit'),
    stat('毛利率', st.income > 0 ? margin.toFixed(1) + '%' : '—', margin < 0 ? 'expense' : ''),
    stat('回款率', contract > 0 ? recvRate + '%' : '—', contract > 0 && recvRate < 100 ? 'expense' : ''),
    stat('笔数', String(st.count), '')
  ]);
  wrap.appendChild(profitCard);

  // v2.4.0：支出构成环形图（按一级分类），点扇区/图例进流水看本项目的该类支出
  const pTxList = await Transactions.byProject(id);
  const cmap = {};
  pTxList.forEach((t) => {
    if (!isExpense(t)) return;
    const c = t.category || '未分类';
    cmap[c] = (cmap[c] || 0) + (Number(t.amount) || 0);
  });
  const catRows = Object.keys(cmap).map((k) => ({ label: k, value: cmap[k] })).sort((a, b) => b.value - a.value);
  if (catRows.length) {
    let ctotal = 0; catRows.forEach((x) => { ctotal += x.value; });
    const catCard = h('div', { class: 'card' });
    catCard.appendChild(h('div', { class: 'row-between', style: 'margin-bottom:8px' }, [
      h('span', { style: 'font-weight:700' }, '支出构成'),
      h('span', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '合计 ' + M(st.expense))
    ]));
    catCard.appendChild(donutChart({
      items: topNItems(catRows.map((x, i) => ({ label: x.label, value: x.value, text: M(x.value), idx: i })), 6, M),
      size: 148, thickness: 26,
      centerValue: MK(ctotal), centerKey: '支出合计',
      onPick: (idx, it) => {
        state.ledgerDrill = null;
        state.ledgerProject = id; state.ledgerCat = it.label; state.ledgerSub = 'all';
        state.ledgerAccount = 'all'; state.ledgerQ = ''; state.ledgerRange = 'all';
        location.hash = '#/ledger/all';
      }
    }));
    catCard.appendChild(h('div', { class: 'chart-caption' }, '点击品类可看本项目的该类支出流水'));
    wrap.appendChild(catCard);
  }

  // P2：成本预算使用进度（超支红/接近黄）
  const budget = Number(p.costBudget) || 0;
  if (budget > 0) {
    const ratio = st.expense / budget;
    const pct = Math.min(100, Math.round(ratio * 100));
    const level = ratio >= 1 ? 'over' : (ratio >= (Number(await Meta.get('budgetAlertPct', 80)) || 80) / 100 ? 'near' : '');
    wrap.appendChild(h('div', { class: 'card', style: 'padding:10px 14px' }, [
      h('div', { class: 'row-between' }, [
        h('span', { class: 'muted', style: 'font-size:var(--g-fs-sm)' },
          '成本预算 ' + M(budget) + ' · 已用 ' + M(st.expense) + (ratio >= 1 ? ' · 超支 ' + M(st.expense - budget) : '')),
        h('span', { style: 'font-size:var(--g-fs-sm);font-weight:700;color:' + (level === 'over' ? 'var(--danger)' : level === 'near' ? 'var(--accent)' : 'var(--muted)') },
          pct + '%' + (level === 'over' ? ' ⚠️' : ''))
      ]),
      h('div', { class: 'bar', style: 'margin-top:6px' }, [h('div', { class: 'bar-fill' + (level === 'over' ? ' over' : ''), style: 'width:' + pct + '%' })])
    ]));
  }

  // v2.1.0：回款与应收账龄（以竣工日作为应收基准日）
  if (contract > 0) {
    const endD = fmtDate(p.endDate);
    const todayStr = fmtDate(new Date().toISOString());
    const arCard = h('div', { class: 'card' });
    arCard.appendChild(h('div', { class: 'row-between' }, [
      h('span', { style: 'font-weight:700' }, '回款与应收'),
      h('span', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '合同额 ' + M(contract))
    ]));
    arCard.appendChild(h('div', { class: 'row-between', style: 'margin-top:8px' }, [
      h('span', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '已收 ' + M(st.income) + ' · 回款率 ' + recvRate + '%'),
      h('span', { style: 'font-size:var(--g-fs-md);font-weight:700;color:' + (due > 0 ? 'var(--expense)' : 'var(--income)') },
        due > 0 ? '应收 ' + M(due) : '已收齐 ✓')
    ]));
    arCard.appendChild(h('div', { class: 'bar', style: 'margin-top:6px' },
      h('div', { class: 'bar-fill', style: 'width:' + recvRate + '%' })));

    if (due > 0) {
      let ageTxt, ageTagCls = 'reconciled';
      if (!endD) {
        ageTxt = '未设竣工日，暂不计龄';
      } else if (todayStr <= endD) {
        const left = Math.round((new Date(endD) - new Date(todayStr)) / 86400000);
        ageTxt = '未到期 · 应收日 ' + endD + (left > 0 ? '（还有 ' + left + ' 天）' : '（今日到期）');
        ageTagCls = 'paid';
      } else {
        const days = Math.round((new Date(todayStr) - new Date(endD)) / 86400000);
        const bucket = days <= 30 ? '逾期 1-30 天' : days <= 60 ? '逾期 31-60 天' : days <= 90 ? '逾期 61-90 天' : '逾期 90 天以上';
        ageTxt = bucket + ' · 应收日 ' + endD + '（已过 ' + days + ' 天）';
        ageTagCls = days > 90 ? 'unpaid' : 'ongoing';
      }
      arCard.appendChild(h('div', { class: 'row-between', style: 'margin-top:10px' }, [
        h('span', { class: 'tag ' + ageTagCls }, ageTxt.split(' · ')[0]),
        h('span', { class: 'muted', style: 'font-size:var(--g-fs-sm);text-align:right' }, ageTxt.split(' · ').slice(1).join(' · ') || '')
      ]));
      if (!locked) {
        arCard.appendChild(h('button', {
          class: 'btn sm ghost', style: 'margin-top:10px;width:100%',
          onclick: () => reminderForm(id, null, { title: '催收 ' + (p.name || '项目') + ' 应收款 ' + M(due), amount: due, kind: 'receive', dueDate: endD || today() })
        }, '⏰ 加一条催收提醒（' + M(due) + '）'));
      }
    }
    wrap.appendChild(arCard);
  }

  // 预算内计划付款（控支预警，详情页可内联编辑金额）
  const planCard = h('div', { class: 'card' });
  let planItems = (p.planItems && p.planItems.length) ? p.planItems.map((x) => ({ id: x.id || uid(), cat: x.cat || '', amount: Number(x.amount) || 0 })) : [];
  const planLib = await getPlanCatOptions();
  const allTx = await Transactions.byProject(id);
  const spentOf = (itId) => allTx.filter((t) => t.type === 'expense' && t.planCat === itId).reduce((s, t) => s + (Number(t.amount) || 0), 0);
  let planEditMode = false;
  function renderPlanCard() {
    planCard.innerHTML = '';
    planCard.appendChild(h('div', { class: 'row-between' }, [
      h('div', { style: 'font-weight:700' }, '预算内计划付款（控支预警）'),
      locked ? null : h('button', { class: 'btn sm ghost', onclick: () => { planEditMode = !planEditMode; renderPlanCard(); } }, planEditMode ? '完成' : '编辑')
    ]));
    if (!planItems.length) {
      planCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:8px' }, '未设置计划类别。请到「项目编辑」中从统一分类下拉选择添加'));
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
          if (it.cat && !opts.some((o) => o.value === it.cat)) opts.push({ value: it.cat, label: it.cat });
          opts.forEach((o) => sel.appendChild(h('option', { value: o.value }, o.label)));
          sel.value = it.cat || '';
          sel.addEventListener('change', () => { it.cat = sel.value; });
          const inp = h('input', { type: 'number', inputmode: 'decimal', value: it.amount || '', placeholder: '计划金额', style: 'width:96px' });
          inp.addEventListener('input', () => { it.amount = Number(inp.value) || 0; });
          const del = h('button', { class: 'delete-x', onclick: () => { planItems = planItems.filter((x) => x.id !== it.id); renderPlanCard(); } }, '×');
          top.appendChild(h('div', { style: 'display:flex;gap:6px;align-items:center' }, [sel, inp, del]));
        } else {
          top.appendChild(h('div', { style: 'font-size:var(--g-fs-md);font-weight:600' }, it.cat || '未命名'));
          top.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '计划 ' + M(plan) + ' · 已用 ' + M(spent) + (over ? ' · 超支 ' + M(spent - plan) : (left >= 0 ? ' · 余 ' + M(left) : ''))));
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

  // 收付款节点（到期自动弹系统通知，设置页可开启/关闭）
  const rems = await Reminders.byProject(id);
  const remCard = h('div', { class: 'card' });
  remCard.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'font-weight:700' }, '收付款节点'),
    locked ? null : h('button', { class: 'btn sm primary', onclick: () => reminderForm(id) }, '+ 节点')
  ]));
  if (!rems.length) remCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:8px' }, '暂无节点。添加后会在约定日前自动提醒（可在「设置」开启系统通知）'));
  else rems.forEach((r) => {
    remCard.appendChild(h('div', { class: 'tx' }, [
      h('div', {}, [
        h('div', {}, (r.kind === 'receive' ? '收款·' : '付款·') + (r.title || '')),
        h('div', { class: 'meta' }, fmtDate(r.dueDate) + (r.amount ? ' · ' + M(r.amount) : '') + (r.done ? ' · 已完成' : ''))
      ]),
      locked ? h('span') : h('div', { style: 'display:flex;gap:6px' }, [
        h('button', { class: 'btn sm ghost', onclick: () => { r.done = !r.done; Reminders.save(r).then(render); } }, r.done ? '↺' : '✓'),
        h('button', { class: 'edit-x', title: '编辑', onclick: (e) => { e.stopPropagation(); reminderForm(id, r); } }, '✎'),
        h('button', { class: 'delete-x', onclick: () => { Reminders.remove(r.id).then(render); } }, '×')
      ])
    ]));
  });
  wrap.appendChild(remCard);

  // 交易流水（v2.6.0：点击行展开详情面板，内联快改/完整编辑/删除；锁定项目仍只读）
  wrap.appendChild(h('h2', { class: 'section' }, '记账流水'));
  const txs = await Transactions.byProject(id);
  if (!txs.length) wrap.appendChild(emptyState('还没有记账', '点右下角 + 记一笔'));
  else {
    if (!locked) wrap.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin:-4px 2px 8px' }, '点击任意流水可展开详情，直接改金额 / 日期 / 备注'));
    const pdCtx = {
      projects: [p], pname: (pid) => (pid === id ? p.name : '未关联项目'),
      partyId: null, savedMsg: '已更新',
      reopen: (txId, msg) => {
        const y = window.scrollY;
        state.projExpand = txId || null;
        render().then(() => { window.scrollTo(0, y); if (msg) toast(msg); });
      }
    };
    const list = h('div', { class: 'card' });
    for (const t of txs) {
      const isTr = isTransfer(t);
      const title = isTr
        ? '转账 ' + (t.fromAccount || '?') + ' → ' + (t.toAccount || '?')
        : (isIncome(t) ? '收 ' + (t.subType || '收入') : '支 ' + ((t.category || '支出') + (t.subCat ? '·' + t.subCat : '')))
          + (t.partyName ? '·' + t.partyName : '');
      const left = h('div', {}, [
        h('div', {}, title),
        h('div', { class: 'meta' }, fmtDateTime(t.date, t.time) + (t.invoiceStatus ? ' · 票:' + t.invoiceStatus : '') + (t.material ? ' · ' + t.material : '') + (t.account ? ' · ' + t.account : ''))
      ]);
      const right = h('div', { style: 'display:flex;align-items:center;gap:8px' }, [
        h('div', { class: 'amt ' + (isIncome(t) ? 'income' : (isTr ? 'transfer' : 'expense')) }, (isIncome(t) ? '+' : (isTr ? '↔' : '-')) + M(t.amount)),
        locked ? null : h('button', { class: 'edit-x', title: '复制此笔为新记录', onclick: (e) => { e.stopPropagation(); txForm(null, t.projectId, Object.assign({}, t, { __copy: true, date: today(), time: nowHm() })); } }, '⧉'),
        locked ? null : h('button', { class: 'edit-x', title: '编辑', onclick: (e) => { e.stopPropagation(); txForm(null, t.projectId, t); } }, '✎'),
        locked ? null : h('button', { class: 'delete-x', title: '删除', onclick: (e) => { e.stopPropagation(); confirmDialog('删除这笔记账？可在「设置 → 数据安全 → 回收站」30 天内还原。', () => { Transactions.get(t.id).then((full) => Transactions.remove(full || t)).then(render); }); } }, '×')
      ].filter(Boolean));
      const row = h('div', { class: 'tx' }, [left, right]);
      if (t.attachmentId) {
        const url = await attURL(t.attachmentId);
        if (url) row.insertBefore(h('img', { class: 'thumb', src: url }), right);
      }
      const item = h('div', { class: 'tx-item' });
      item.appendChild(row);
      if (!locked) {
        const open = state.projExpand === t.id;
        row.classList.add('tx-click');
        if (open) row.classList.add('open');
        row.title = '点击展开/收起流水详情';
        row.addEventListener('click', (e) => {
          if (e.target.closest && e.target.closest('.edit-x')) return;
          const y = window.scrollY;
          state.projExpand = open ? null : t.id;
          render().then(() => { window.scrollTo(0, y); });
        });
        if (open) item.appendChild(txDetailPanel(t, pdCtx));
      }
      list.appendChild(item);
    }
    wrap.appendChild(list);
  }
  return wrap;
}

// ---------- 往来单位 ----------
// ---------- 对账页（v1.8.0）----------
// 底部 tab「对账」：以对账为主体的往来视图（付款状态筛选 + 点击直接开对账单）；
// 往来单位的增删改管理移至「往来单位管理」二级页 #/parties，从本页右上入口进入。
async function reconView() {
  setPageTitle('对账');
  const [parties, txs, projects] = await Promise.all([Parties.all(), Transactions.all(), Projects.all()]);
  const wrap = h('div');
  wrap.appendChild(h('div', { class: 'row-between', style: 'margin-bottom:10px' }, [
    h('h2', { class: 'section', style: 'margin:0' }, '往来对账'),
    h('button', { class: 'btn sm ghost', onclick: () => { location.hash = '#/parties'; } }, '⚙ 往来单位管理')
  ]));
  wrap.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin:-2px 0 10px' }, '点击往来单位打开对账单：核对收付款明细、上传账单凭证、一键标记对账状态'));

  // 付款状态筛选
  const chips = h('div', { class: 'chips', style: 'margin-bottom:10px' });
  [['all', '全部'], ['unpaid', '未付'], ['paid', '已付'], ['reconciled', '已对账']].forEach(([v, label]) => {
    chips.appendChild(h('button', { class: 'chip' + ((state.reconStatus || 'all') === v ? ' on' : ''), onclick: () => { state.reconStatus = v; render(); } }, label));
  });
  wrap.appendChild(chips);

  // v2.2.0：账龄分析——未结清往来（payStatus=未付）按「最近一次往来到今天」的挂账时长分档
  if (state.reconStatus === 'all' || state.reconStatus === 'unpaid') {
    const todayS = fmtDate(new Date().toISOString());
    const daysSince = (d) => {
      d = fmtDate(d); if (!d) return 0;
      const n = Math.round((new Date(todayS) - new Date(d)) / 86400000);
      return n > 0 ? n : 0;
    };
    const BUCKETS = [
      { label: '30 天内', cls: 'paid', test: (d) => d <= 30 },
      { label: '31-60 天', cls: 'ongoing', test: (d) => d > 30 && d <= 60 },
      { label: '61-90 天', cls: 'finished', test: (d) => d > 60 && d <= 90 },
      { label: '90 天以上', cls: 'unpaid', test: (d) => d > 90 }
    ];
    const openRows = parties.map((p) => {
      const st = partyStatsSync(txs, p.id);
      const rel = txs.filter((t) => t.partyId === p.id);
      let last = '';
      rel.forEach((t) => { const d = fmtDate(t.date); if (d && d > last) last = d; });
      const net = st.incomeTotal - st.expenseTotal; // >0 对方应付我；<0 我应付对方
      return { p, st, net, last, days: daysSince(last), count: rel.length };
    }).filter((x) => (x.p.payStatus || 'unpaid') === 'unpaid' && x.count > 0)
      .sort((a, b) => b.days - a.days);

    wrap.appendChild(h('h2', { class: 'section' }, '账龄分析'));
    const ageCard = h('div', { class: 'card' });
    if (!openRows.length) {
      ageCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '当前没有未结清的往来，账目干净 👍'));
    } else {
      const sums = BUCKETS.map((b) => ({
        b, n: 0, amt: 0,
        fill: openRows.filter((x) => b.test(x.days))
      }));
      sums.forEach((s) => s.fill.forEach((x) => { s.n++; s.amt += Math.abs(x.net); }));
      let payTotal = 0, recvTotal = 0;
      openRows.forEach((x) => { if (x.net < 0) payTotal += -x.net; else recvTotal += x.net; });
      ageCard.appendChild(h('div', { class: 'row-between' }, [
        h('span', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '未结清 ' + openRows.length + ' 家'),
        h('span', { style: 'font-size:var(--g-fs-md)' }, [
          h('span', { style: 'color:var(--expense);font-weight:700' }, '我应付 ' + M(payTotal)),
          h('span', { class: 'muted' }, ' ｜ '),
          h('span', { style: 'color:var(--income);font-weight:700' }, '我应收 ' + M(recvTotal))
        ])
      ]));
      const grid = h('div', { class: 'stat-grid', style: 'margin-top:10px;margin-bottom:0' });
      sums.forEach((s) => grid.appendChild(stat(s.b.label, M(s.amt), s.n ? (s.b.cls === 'unpaid' ? 'expense' : '') : '')));
      ageCard.appendChild(grid);
      ageCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '挂账时长按该单位最近一次往来日期起算；已标记「已付/已对账」的单位不计入。'));
      openRows.slice(0, 10).forEach((x) => {
        const bk = BUCKETS.find((b) => b.test(x.days)) || BUCKETS[0];
        ageCard.appendChild(h('div', { class: 'tr-row', style: 'border-top:1px solid var(--border)', onclick: () => partyStatement(x.p, txs, projects) }, [
          h('div', { style: 'flex:1;min-width:0' }, [
            h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, x.p.name),
            h('div', { class: 'meta' }, partyTypeLabel(x.p.type) + ' · ' + x.count + ' 笔 · 最近往来 ' + (x.last || '—') + ' · 挂账 ' + x.days + ' 天')
          ]),
          h('div', { class: 'tr-r' }, [
            h('div', { class: 'amt ' + (x.net < 0 ? 'expense' : 'income') }, (x.net < 0 ? '应付 ' : '应收 ') + M(Math.abs(x.net))),
            h('span', { class: 'tag ' + bk.cls, style: 'margin-top:4px' }, bk.label)
          ]),
          h('span', { class: 'chev' }, '›')
        ]));
      });
      if (openRows.length > 10) ageCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:6px' }, '仅显示挂账最久的 10 家'));
    }
    wrap.appendChild(ageCard);
  }

  let rows = parties.map((p) => ({ p, st: partyStatsSync(txs, p.id) }));
  if (state.reconStatus && state.reconStatus !== 'all') rows = rows.filter(({ p }) => (p.payStatus || 'unpaid') === state.reconStatus);
  rows.sort((a, b) => b.st.total - a.st.total);

  if (!rows.length) wrap.appendChild(emptyState('没有符合条件的往来单位', '切换筛选，或在「往来单位管理」中添加'));
  else rows.forEach(({ p, st }) => wrap.appendChild(reconCard(p, st, txs, projects)));
  return wrap;
}

function reconCard(p, st, allTxs, allProjects) {
  const status = PAY_STATUS[p.payStatus] || PAY_STATUS.unpaid;
  const card = h('div', { class: 'card party-clickable', onclick: () => partyStatement(p, allTxs, allProjects) });
  card.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'min-width:0' }, [
      h('div', { style: 'font-weight:700;font-size:var(--g-fs-base);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, p.name),
      h('div', { class: 'sub', style: 'margin-top:2px' }, partyTypeLabel(p.type) + (p.phone ? ' · ' + p.phone : ''))
    ]),
    h('span', { class: 'tag ' + (status.cls || 'unpaid') }, status.label || '未付')
  ]));
  card.appendChild(h('div', { class: 'row-between', style: 'margin-top:8px' }, [
    h('div', { class: 'sub' }, '往来 ' + st.count + ' 笔 · 应付 ' + M(st.expenseTotal) + ' · 应收 ' + M(st.incomeTotal)),
    h('span', { class: 'muted', style: 'font-size:var(--g-fs-md);flex:0 0 auto' }, '对账单 ›')
  ]));
  return card;
}

async function partiesView() {
  setPageTitle('往来单位管理');
  const [parties, txs, projects] = await Promise.all([Parties.all(), Transactions.all(), Projects.all()]);
  const wrap = h('div');
  wrap.appendChild(h('div', { class: 'row-between', style: 'margin-bottom:10px' }, [
    h('button', { class: 'btn sm ghost', onclick: () => { location.hash = '#/recon'; } }, '‹ 返回对账'),
    h('button', { class: 'btn sm ghost', onclick: () => partyForm() }, '＋ 新建单位')
  ]));
  wrap.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin:-4px 0 8px' }, '往来单位的编辑与删除在此维护；日常对账请到「对账」tab'));

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
    else if (isIncome(t)) incomeTotal += amt;
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
    else if (isExpense(t)) { byProj[pid].expense += amt; const c = t.category || '其他'; byProj[pid].cats[c] = (byProj[pid].cats[c] || 0) + amt; }
  });
  const projIds = Object.keys(byProj);

  const card = h('div', { class: 'card party-clickable', onclick: () => partyForm(p) });
  card.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'font-weight:700;font-size:var(--g-fs-base)' }, p.name),
    h('span', { class: 'tag ' + (status.cls || 'unpaid') }, status.label || '未付')
  ]));
  card.appendChild(h('div', { class: 'sub', style: 'margin-top:4px' }, typeLabel + '（' + scopeLabel + '）' + (p.phone ? ' · ' + p.phone : '')));
  card.appendChild(h('div', { class: 'sub', style: 'margin-top:4px' }, '往来笔数：' + st.count + ' 笔 · 合计 ' + M(st.total)));

  // 按项目对应的收/付款明细
  if (projIds.length) {
    card.appendChild(h('div', { class: 'sub', style: 'margin-top:8px;font-weight:600' }, '对应项目收付款明细'));
    projIds.forEach((pid) => {
      const d = byProj[pid];
      const catParts = Object.keys(d.cats).map((c) => c + ' ' + M(d.cats[c])).join(' · ');
      const line = (d.income > 0 ? '收 ' + M(d.income) : '') + (d.income > 0 && d.expense > 0 ? ' / ' : '') + (d.expense > 0 ? '付 ' + M(d.expense) : '');
      card.appendChild(h('div', { class: 'sub', style: 'margin-top:5px;padding-left:8px;border-left:2px solid var(--line)' }, [
        h('div', { style: 'font-weight:600' }, d.name),
        h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, line + (catParts ? '（' + catParts + '）' : ''))
      ]));
    });
  } else if (st.incomeTotal > 0) {
    card.appendChild(h('div', { class: 'sub', style: 'margin-top:6px' }, '已收合计：' + M(st.incomeTotal)));
  }

  card.appendChild(h('div', { style: 'display:flex;justify-content:flex-end;gap:10px;margin-top:10px' }, [
    h('button', { class: 'btn sm ghost', onclick: (e) => { e.stopPropagation(); partyStatement(p, allTxs, allProjects); } }, '📋 对账单'),
    h('button', { class: 'delete-x', onclick: (e) => { e.stopPropagation(); confirmDialog('删除该往来单位？可在「设置 → 数据安全 → 回收站」30 天内还原。', () => { Parties.remove(p.id).then(render); }); } }, '删除')
  ]));
  return card;
}

// 往来对账单：某单位全部流水 + 分类小计 + 一键标记付款状态
// v2.5.0：opts.expandId 指定展开哪条流水详情；opts.scrollTop 用于重建后恢复阅读位置
function partyStatement(p, allTxs, allProjects, optsIn) {
  const opts = optsIn || {};
  const rel = allTxs.filter((t) => t.partyId === p.id)
    .slice().sort((a, b) => (fmtDate(b.date) + (b.time || '')).localeCompare(fmtDate(a.date) + (a.time || '')));
  const pname = (id) => { const x = allProjects.find((p2) => p2.id === id); return x ? x.name : '未关联项目'; };
  let pay = 0, rec = 0;
  const byCat = {}, byProj = {};
  rel.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (isExpense(t)) {
      pay += amt;
      const c = (t.category || '其他') + (t.subCat ? '·' + t.subCat : '');
      byCat[c] = (byCat[c] || 0) + amt;
      byProj[t.projectId] = (byProj[t.projectId] || 0) + amt;
    } else if (isIncome(t)) {
      rec += amt;
      byProj[t.projectId] = (byProj[t.projectId] || 0) - amt;
    }
  });
  const body = h('div');
  body.appendChild(h('div', { class: 'row-between', style: 'font-weight:700' }, [
    h('span', {}, p.name + '（' + partyTypeLabel(p.type) + '）'),
    h('span', { class: 'tag ' + ((PAY_STATUS[p.payStatus] || {}).cls || 'unpaid') }, (PAY_STATUS[p.payStatus] || {}).label || '未付')
  ]));
  body.appendChild(h('div', { style: 'display:flex;gap:10px;margin-top:10px' }, [
    h('div', { style: 'flex:1;background:rgba(224,101,79,.10);border-radius:10px;padding:8px;text-align:center' }, [
      h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '应付/已付合计'),
      h('div', { class: 'amt expense', style: 'font-size:16px' }, M(pay))
    ]),
    h('div', { style: 'flex:1;background:rgba(76,175,120,.10);border-radius:10px;padding:8px;text-align:center' }, [
      h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '应收/已收合计'),
      h('div', { class: 'amt income', style: 'font-size:16px' }, M(rec))
    ])
  ]));
  if (Object.keys(byCat).length) {
    body.appendChild(h('div', { class: 'sub', style: 'margin-top:12px;font-weight:600' }, '按分类小计'));
    Object.keys(byCat).forEach((c) => {
      body.appendChild(h('div', { class: 'row-between', style: 'margin-top:4px;font-size:var(--g-fs-md)' }, [
        h('span', { class: 'muted' }, c), h('span', {}, M(byCat[c]))
      ]));
    });
  }
  if (Object.keys(byProj).length) {
    body.appendChild(h('div', { class: 'sub', style: 'margin-top:12px;font-weight:600' }, '按项目小计（收为负/付为正）'));
    Object.keys(byProj).forEach((pid) => {
      const v = byProj[pid];
      body.appendChild(h('div', { class: 'row-between', style: 'margin-top:4px;font-size:var(--g-fs-md)' }, [
        h('span', { class: 'muted', style: 'max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, pname(pid)),
        h('span', {}, (v >= 0 ? '付 ' : '收 ') + M(Math.abs(v)))
      ]));
    });
  }
  // 账单凭证：上传送货单/收据/对账单（图片或 PDF），便于日后核对付款金额
  const bills = p.bills || [];
  body.appendChild(h('div', { class: 'sub', style: 'margin-top:12px;font-weight:600' }, '账单凭证（' + bills.length + '）'));
  if (!bills.length) body.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:6px' }, '暂无账单。可拍照或上传送货单、收据、对账单（图片/PDF），与流水核对付款金额'));
  bills.forEach((b) => {
    body.appendChild(h('div', { class: 'tx' }, [
      h('div', {}, [
        h('div', { style: 'font-size:var(--g-fs-md);max-width:52vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, b.name || '未命名账单'),
        h('div', { class: 'meta' }, fmtDate(new Date(b.at || Date.now()).toISOString().slice(0, 10)) + ' · ' + Math.max(1, Math.round((Number(b.size) || 0) / 1024)) + 'KB' + (String(b.type || b.name || '').indexOf('pdf') >= 0 ? ' · PDF' : ''))
      ]),
      h('div', { style: 'display:flex;gap:6px;align-items:center' }, [
        h('button', { class: 'btn sm ghost', onclick: () => viewBill(b, () => partyStatement(p, allTxs, allProjects)) }, '查看'),
        h('button', { class: 'delete-x', title: '删除', onclick: () => confirmDialog('删除该账单凭证？（不影响流水记录）', () => {
          Attachments.remove(b.attId);
          p.bills = (p.bills || []).filter((x) => x.id !== b.id);
          Parties.save(p).then(() => { toast('已删除账单'); partyStatement(p, allTxs, allProjects); });
        }, '删除') }, '×')
      ])
    ]));
  });
  if (bills.length < 9) {
    const mkInput = (accept, capture) => {
      const inp = h('input', { type: 'file', accept, style: 'display:none' });
      if (capture) inp.setAttribute('capture', 'environment');
      inp.addEventListener('change', () => {
        const file = inp.files && inp.files[0];
        inp.value = '';
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast('文件过大（限 10MB）'); return; }
        toast('正在保存账单…');
        Attachments.save(file, file.type).then((attId) => {
          p.bills = p.bills || [];
          p.bills.push({ id: uid(), attId, name: file.name || '账单照片', size: file.size, type: file.type || '', at: Date.now() });
          return Parties.save(p);
        }).then(() => { toast('账单已保存'); partyStatement(p, allTxs, allProjects); });
      });
      return inp;
    };
    const camInp = mkInput('image/*', true);
    const fileInp = mkInput('image/*,application/pdf,.pdf', false);
    body.appendChild(h('div', { style: 'display:flex;gap:8px;margin-top:8px' }, [
      camInp, fileInp,
      h('button', { class: 'btn sm primary', onclick: () => camInp.click() }, '📷 拍照上传'),
      h('button', { class: 'btn sm ghost', onclick: () => fileInp.click() }, '📎 选择文件')
    ]));
  } else {
    body.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:6px' }, '账单已达 9 张上限，请先删除部分再上传'));
  }

  // v2.5.0：明细行可点击展开详情并直接改单；改单后一律走 reopenStatement 从库里重建
  const ctx = {
    p: p, partyId: p.id, projects: allProjects, pname: pname,
    reopen: (expandId, msg) => reopenStatement(p.id, expandId, msg)
  };
  body.appendChild(h('div', { class: 'sub', style: 'margin-top:12px;font-weight:600' }, '流水明细（' + rel.length + ' 笔）'));
  if (!rel.length) {
    body.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:6px' }, '该单位暂无流水'));
  } else {
    body.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:-2px' }, '点击任意一条可展开详情，直接改金额 / 日期 / 备注'));
    rel.forEach((t) => {
      const isIn = isIncome(t), isTr = isTransfer(t);
      const open = opts.expandId === t.id;
      const title = isTr ? '转账' : (isIn ? (t.subType || '收入') : ((t.category || '') + (t.subCat ? '·' + t.subCat : '')));
      const item = h('div', { class: 'tx-item' });
      const row = h('div', { class: 'tx tx-click' + (open ? ' open' : ''), title: '点击展开/收起流水详情' }, [
        h('div', { style: 'min-width:0;flex:1' }, [
          h('div', { style: 'font-weight:600' }, title),
          h('div', { class: 'meta' }, fmtDate(t.date) + ' · ' + pname(t.projectId) + (t.note ? ' · ' + t.note : ''))
        ]),
        h('div', { style: 'display:flex;align-items:center;gap:6px;flex:0 0 auto' }, [
          h('div', { class: 'amt ' + (isIn ? 'income' : (isTr ? 'transfer' : 'expense')) }, (isIn ? '+' : (isTr ? '↔' : '-')) + M(t.amount)),
          h('span', { class: 'tx-chev' + (open ? ' on' : '') }, '›')
        ])
      ]);
      row.addEventListener('click', () => reopenStatement(p.id, open ? null : t.id));
      item.appendChild(row);
      if (open) item.appendChild(txDetailPanel(t, ctx));
      body.appendChild(item);
    });
  }
  // v2.2.0：生成对账单纯文本（可直接发微信催款/核对）；金额沿用 M() 以尊重「隐藏金额」设置
  const buildStatementText = () => {
    const L = [];
    L.push('【往来对账单】' + (p.name || ''));
    L.push('单位类型：' + partyTypeLabel(p.type) + (p.phone ? ' · ' + p.phone : ''));
    L.push('对账状态：' + ((PAY_STATUS[p.payStatus] || PAY_STATUS.unpaid).label || '未付'));
    L.push('生成时间：' + fmtDateTime(today(), nowHm()));
    L.push('———————————');
    let inc = 0, exp = 0;
    rel.forEach((t) => { const a = Number(t.amount) || 0; if (isIncome(t)) inc += a; else if (isExpense(t)) exp += a; });
    L.push('我方已收：' + M(inc));
    L.push('我方已付：' + M(exp));
    const net = inc - exp;
    L.push('净往来：' + (net >= 0 ? '对方应付我 ' + M(net) : '我应付对方 ' + M(-net)));
    L.push('———————————');
    L.push('流水明细（' + rel.length + ' 笔）：');
    rel.slice().sort((a, b) => fmtDate(a.date).localeCompare(fmtDate(b.date))).forEach((t, i) => {
      const isIn = isIncome(t), isTr = isTransfer(t);
      const title = isTr ? '转账' : (isIn ? (t.subType || '收入') : ((t.category || '') + (t.subCat ? '·' + t.subCat : '')));
      L.push((i + 1) + '. ' + fmtDate(t.date) + ' ' + (isIn ? '收' : isTr ? '转' : '付') + ' ' + title
        + ' ' + (isIn ? '+' : isTr ? '↔' : '-') + M(Number(t.amount) || 0)
        + (t.note ? '（' + t.note + '）' : ''));
    });
    L.push('———————————');
    L.push('如核对无误请回复确认，谢谢！');
    return L.join('\n');
  };
  const copyStatement = async () => {
    const txt = buildStatementText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(txt);
        toast('对账单已复制，可直接粘贴到微信');
        return;
      }
    } catch (e) { /* 降级到 execCommand */ }
    const ta = document.createElement('textarea');
    ta.value = txt; ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('对账单已复制'); }
    catch (e2) { toast('复制失败，请长按选择文本'); }
    ta.remove();
  };
  const shareStatement = async () => {
    const txt = buildStatementText();
    if (navigator.share) {
      try { await navigator.share({ title: '往来对账单 · ' + (p.name || ''), text: txt }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; } // 用户取消分享
    }
    await copyStatement();
  };

  const acts = [
    h('button', { class: 'btn ghost', onclick: () => shareStatement() }, '📤 分享'),
    h('button', { class: 'btn ghost', onclick: () => copyStatement() }, '📋 复制对账单'),
    h('button', { class: 'btn ghost', onclick: () => closeModal() }, '关闭')
  ];
  if (p.payStatus !== 'reconciled') {
    acts.unshift(h('button', { class: 'btn primary', onclick: () => {
      confirmDialog('确认与「' + p.name + '」的账目已核对无误？确认后付款状态将标记为「已对账」。', () => {
        p.payStatus = 'reconciled';
        Parties.save(p).then(() => { closeModal(); toast('已标记为已对账'); render(); });
      }, '确认对账');
    } }, '✅ 对账完成，标记已对账'));
  }
  openModal('往来对账单', body, acts);
  if (opts.scrollTop) restoreModalScrollTop(opts.scrollTop);
}

// v2.5.0：改单/展开后重建对账单——一律从库里重读，保证合计、分类小计、项目小计、
// 复制文本与底层对账列表全部同步；同时保留展开项与滚动位置。
async function reopenStatement(partyId, expandId, msg) {
  const st = modalScrollTop();
  const [np, txs, projects] = await Promise.all([Parties.get(partyId), Transactions.all(), Projects.all()]);
  if (!np) { toast('往来单位已被删除'); render(); return; }
  let ex = expandId || null;
  let note = msg || '';
  if (ex) {
    const still = txs.find((x) => x.id === ex && x.partyId === partyId);
    if (!still) { ex = null; note = note || '该流水已改挂到其他往来单位，已从本对账单移出'; }
  }
  render(); // 同步刷新底层对账列表（合计、账龄、付款状态随改单更新）
  partyStatement(np, txs, projects, { expandId: ex, scrollTop: st });
  if (note) toast(note);
}

// 时间戳 → 可读文本（创建/最近修改）
function stampText(ms) {
  if (!ms) return '';
  const d = new Date(Number(ms));
  if (isNaN(d.getTime())) return '';
  const p = (x) => String(x).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

// v2.5.0：对账单内的流水详情面板（点击明细行展开）
// 只读字段全量展示 + 金额/日期/时间/备注内联快改 + 完整编辑/删除入口
function txDetailPanel(t, ctx) {
  const isIn = isIncome(t), isTr = isTransfer(t);
  const box = h('div', { class: 'tdp' });

  box.appendChild(h('div', { class: 'tdp-head' }, [
    h('div', { class: 'tdp-amt ' + (isIn ? 'income' : isTr ? 'transfer' : 'expense') },
      (isIn ? '+' : isTr ? '↔' : '-') + M(t.amount)),
    h('span', { class: 'tdp-type' }, isTr ? '转账' : isIn ? '收入' : '支出')
  ]));

  const grid = h('div', { class: 'tdp-grid' });
  const kv = (k, v, full) => {
    if (v == null || v === '' || v === '—') return;
    grid.appendChild(h('div', { class: 'tdp-kv' + (full ? ' full' : '') }, [
      h('div', { class: 'tdp-k' }, k),
      h('div', { class: 'tdp-v' }, String(v))
    ]));
  };
  const proj = (ctx.projects || []).find((x) => x.id === t.projectId);
  let planName = '';
  if (t.planCat && proj) {
    const pi = (proj.planItems || []).find((x) => x.id === t.planCat);
    planName = pi ? pi.cat : '';
  }
  kv('日期', (fmtDate(t.date) || '') + (t.date ? ' ' + weekdayCN(t.date) : ''));
  kv('时间', t.time || '');
  kv('项目', ctx.pname(t.projectId));
  if (isTr) {
    kv('转出账户', t.fromAccount);
    kv('转入账户', t.toAccount);
  } else if (isIn) {
    kv('款项类型', t.subType);
    kv('开票状态', t.invoiceStatus);
    kv('发票类型', t.invoiceType);
    kv('税额', t.taxAmount ? M(t.taxAmount) : '');
  } else {
    kv('分类', [t.category, t.subCat].filter(Boolean).join('·'));
  }
  kv('账户', t.account || t.method);
  kv('往来单位', t.partyName);
  kv('成员', t.memberName);
  kv('商家', t.merchantName);
  kv('施工区域', t.region);
  kv('工种', t.trade);
  kv('材料', t.material);
  kv('预算计划', planName);
  kv('备注', t.note, true);
  kv('创建', stampText(t.createdAt));
  kv('最近修改', stampText(t.updatedAt));
  box.appendChild(grid);

  if (t.attachmentId) {
    const attBox = h('div', { class: 'tdp-sec' });
    attBox.appendChild(h('div', { class: 'tdp-k' }, '凭证'));
    const img = h('img', { class: 'tdp-att', alt: '记账凭证' });
    attBox.appendChild(img);
    attURL(t.attachmentId).then((u) => { if (u) img.src = u; else img.remove(); });
    attBox.appendChild(h('button', {
      class: 'btn sm ghost', style: 'margin-top:6px',
      onclick: () => viewBill({ attId: t.attachmentId, name: '记账凭证', type: 'image' }, () => ctx.reopen(t.id))
    }, '🔍 查看大图'));
    box.appendChild(attBox);
  }

  // 内联快改：只提交变化的字段，走 applyTxPatch（读最新记录 + 统一校验）
  const ed = h('div', { class: 'tdp-edit' });
  ed.appendChild(h('div', { class: 'tdp-k' }, '快速调整'));
  const amtIn = h('input', { class: 'ctl', type: 'number', inputmode: 'decimal', step: '0.01' });
  amtIn.value = t.amount != null ? t.amount : '';
  const dateIn = h('input', { class: 'ctl', type: 'date' });
  dateIn.value = fmtDate(t.date) || today();
  const timeIn = h('input', { class: 'ctl', type: 'time' });
  timeIn.value = t.time || '';
  const noteIn = h('textarea', { class: 'ctl', rows: 2 }, t.note || '');
  const fld = (label, ctrl) => h('div', { class: 'tdp-f' }, [h('label', {}, label), ctrl]);
  ed.appendChild(fld('金额', amtIn));
  ed.appendChild(fld('日期', dateIn));
  ed.appendChild(fld('时间', timeIn));
  ed.appendChild(fld('备注', noteIn));
  box.appendChild(ed);

  const acts = h('div', { class: 'tdp-acts' });
  const saveBtn = h('button', { class: 'btn sm primary', onclick: async () => {
    const rawAmt = String(amtIn.value).trim();
    if (rawAmt === '') { toast('金额不能为空'); return; }
    const patch = {};
    const na = Number(rawAmt);
    if (na !== Number(t.amount)) patch.amount = na;
    if (dateIn.value && dateIn.value !== fmtDate(t.date)) patch.date = dateIn.value;
    const nt = timeIn.value || '';
    if (nt !== (t.time || '')) patch.time = nt;
    const nn = String(noteIn.value || '').trim();
    if (nn !== (t.note || '')) patch.note = nn;
    if (!Object.keys(patch).length) { toast('没有改动'); return; }
    const err = validateTxPatch(patch);
    if (err) { toast(err); return; }
    saveBtn.disabled = true; saveBtn.textContent = '保存中…';
    const r = await applyTxPatch(t.id, patch);
    if (!r.ok) { saveBtn.disabled = false; saveBtn.textContent = '💾 保存修改'; toast(r.msg); return; }
    ctx.reopen(t.id, ctx.savedMsg || '已更新，对账单已同步');
  } }, '💾 保存修改');
  acts.appendChild(saveBtn);
  acts.appendChild(h('button', { class: 'btn sm ghost', onclick: () => {
    txForm(null, t.projectId, t, null, {
      onSaved: (saved) => {
        // 对账单场景（ctx.partyId 有值）：改挂到其他单位时提示并移出；列表场景：普通刷新
        if (ctx.partyId != null) {
          const moved = saved && saved.partyId !== ctx.partyId;
          ctx.reopen(moved ? null : (saved && saved.id), moved ? '该流水已改挂到其他往来单位，已从本对账单移出' : '已保存，对账单已同步');
        } else {
          ctx.reopen(saved && saved.id, '已保存');
        }
      }
    });
  } }, '✎ 完整编辑'));
  acts.appendChild(h('button', { class: 'btn sm danger', onclick: () => {
    confirmDialog('删除这笔记账？可在「设置 → 数据安全 → 回收站」30 天内还原。', () => {
      Transactions.get(t.id)
        .then((full) => Transactions.remove(full || t))
        .then(() => ctx.reopen(null, '已删除，可在回收站还原'));
    }, '删除');
  } }, '🗑 删除'));
  acts.appendChild(h('button', { class: 'btn sm ghost', onclick: () => ctx.reopen(null) }, '收起'));
  box.appendChild(acts);
  return box;
}

// 查看账单凭证：图片弹窗预览，PDF 内嵌预览；关闭后重开对账单（reopen）
async function viewBill(b, reopen) {
  const a = await Attachments.get(b.attId);
  if (!a) { toast('账单文件已丢失（可能被清理）'); if (reopen) reopen(); return; }
  const url = URL.createObjectURL(a.blob);
  const close = () => { closeModal(); if (reopen) reopen(); };
  const isPdf = String(a.type || b.type || '').indexOf('pdf') >= 0 || /\.pdf$/i.test(b.name || '');
  if (isPdf) {
    const openLink = h('a', { href: url, target: '_blank', rel: 'noopener', style: 'display:block;margin-top:8px;text-align:center;font-size:var(--g-fs-md);color:var(--accent)' }, '在新窗口打开 PDF ▸');
    openModal('账单预览', h('div', {}, [
      h('iframe', { src: url, style: 'width:100%;height:58vh;border:none;border-radius:8px;background:#fff' }),
      openLink
    ]), [h('button', { class: 'btn ghost', onclick: close }, '↩ 返回对账单')]);
  } else {
    openModal('账单预览', h('div', { style: 'text-align:center' }, [
      h('img', { src: url, style: 'max-width:100%;max-height:60vh;border-radius:8px' })
    ]), [h('button', { class: 'btn ghost', onclick: close }, '↩ 返回对账单')]);
  }
}

// ---------- 设置 ----------
// ---------- 统计报表（v2.4.0）：统计口径 + 多形态图表 + 品类分析 ----------
// 统计口径（state.statsBasis）：
//   date  —— 按流水发生日期筛选
//   start —— 按项目开工年份归档（默认）：某年开工的项目，其全部流水都计入该年统计。
//            装修项目普遍跨年收付款，用开工年归档才能反映「这一年接的活」的真实经营结果；
//            未关联项目的流水按发生日期年份归属，保证总数不漏。
async function statsView() {
  setPageTitle('统计报表');
  const [projects, txs] = await Promise.all([Projects.all(), Transactions.all()]);
  const wrap = h('div');
  const pmap = {}; projects.forEach((p) => { pmap[p.id] = p; });
  const pname = (id) => { const p = pmap[id]; return p ? p.name : '未关联项目'; };
  const txYear = (t) => (fmtDate(t.date) || '').slice(0, 4);
  const startYearOf = (t) => {
    const p = pmap[t.projectId];
    return (p ? (fmtDate(p.startDate) || '').slice(0, 4) : '') || txYear(t);
  };
  const basis = state.statsBasis || 'start';

  // ① 统计口径
  wrap.appendChild(h('div', { class: 'seg', style: 'margin-bottom:var(--g-sp-3)' }, [
    h('button', { class: basis === 'date' ? 'on' : '', onclick: () => { state.statsBasis = 'date'; render(); } }, '按发生日期'),
    h('button', { class: basis === 'start' ? 'on' : '', onclick: () => { state.statsBasis = 'start'; render(); } }, '按项目开工年')
  ]));

  let inRange = [], rangeLabel = '', rangeSub = '', prevList = [], prevLabel = '';
  if (basis === 'start') {
    const years = projects.map((p) => (fmtDate(p.startDate) || '').slice(0, 4)).filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i).sort().reverse();
    const cy = String(new Date().getFullYear());
    const opts = [{ key: 'all', label: '全部年份' }].concat(years.map((y) => ({ key: y, label: y + '年' })));
    if (!opts.some((o) => o.key === state.statsYear)) {
      state.statsYear = years.indexOf(cy) >= 0 ? cy : (years[0] || 'all');
    }
    const yk = state.statsYear || 'all';
    const pills = h('div', { class: 'pill-tabs' });
    opts.forEach((o) => pills.appendChild(h('button', {
      class: 'pill' + (o.key === yk ? ' on' : ''),
      onclick: () => { state.statsYear = o.key; state.statsCat = 'all'; render(); }
    }, o.label)));
    wrap.appendChild(pills);
    inRange = yk === 'all' ? txs.slice() : txs.filter((t) => startYearOf(t) === yk);
    rangeLabel = yk === 'all' ? '全部年份' : yk + ' 年开工';
    let np = 0; const seen = {};
    inRange.forEach((t) => { if (t.projectId && !seen[t.projectId]) { seen[t.projectId] = 1; np++; } });
    rangeSub = np + ' 个项目 · ' + inRange.length + ' 笔';
    if (yk !== 'all') {
      const py = String(Number(yk) - 1);
      prevList = txs.filter((t) => startYearOf(t) === py);
      prevLabel = py + ' 年开工项目';
    }
    wrap.appendChild(h('div', { class: 'basis-note' },
      '年份以项目开工日确定：' + (yk === 'all' ? '全部项目' : yk + ' 年开工的项目')
      + '的全部流水（含跨年收付款）都计入该年；未关联项目的流水按发生日期年份归属。'));
  } else {
    const ranges = timeRanges();
    const rg = ranges.find((r) => r.key === state.statsRange) || ranges[4];
    const pills = h('div', { class: 'pill-tabs' });
    ranges.forEach((r) => pills.appendChild(h('button', {
      class: 'pill' + (r.key === rg.key ? ' on' : ''),
      onclick: () => { state.statsRange = r.key; state.statsCat = 'all'; render(); }
    }, r.label)));
    wrap.appendChild(pills);
    inRange = txs.filter((t) => { const d = fmtDate(t.date); return d && d >= rg.from && d <= rg.to; });
    rangeLabel = rg.label; rangeSub = rg.sub;
    if (rg.key !== 'all') {
      const len = daysDiff(rg.to, rg.from) + 1;
      const pTo = isoAddDays(rg.from, -1), pFrom = isoAddDays(pTo, -(len - 1));
      prevList = txs.filter((t) => { const d = fmtDate(t.date); return d && d >= pFrom && d <= pTo; });
      const PREV_NAME = { day: '昨天', week: '上周', month: '上月', quarter: '上季度', year: '去年' };
      prevLabel = PREV_NAME[rg.key] || ('上一个' + String(rg.label).replace(/^本/, ''));
    }
    wrap.appendChild(h('div', { class: 'basis-note' }, '按流水发生日期统计：只统计日期落在所选区间内的流水（跨年项目会被拆到不同年份）。'));
  }

  let inc = 0, exp = 0;
  inRange.forEach((t) => { const a = Number(t.amount) || 0; if (isIncome(t)) inc += a; else if (isExpense(t)) exp += a; });

  const sumCard = h('div', { class: 'card sum-card' });
  sumCard.appendChild(h('div', { class: 'sum-label' }, rangeLabel + ' · ' + rangeSub));
  sumCard.appendChild(h('div', { class: 'sum-main' }, [h('span', { class: 'sum-k' }, '结余 '), h('span', { class: 'sum-v' }, M(inc - exp))]));
  sumCard.appendChild(h('div', { class: 'sum-sub' }, '收入 ' + M(inc) + ' ｜ 支出 ' + M(exp)));
  wrap.appendChild(sumCard);

  // ② 月度走势（折线 / 柱状两种形态，点任一点下钻到该月流水）
  const trendForm = state.statsTrend || 'line';
  wrap.appendChild(h('h2', { class: 'section' }, '月度走势'));
  wrap.appendChild(h('div', { class: 'pill-tabs', style: 'margin-bottom:var(--g-sp-2)' }, [
    h('button', { class: 'pill' + (trendForm === 'line' ? ' on' : ''), onclick: () => { state.statsTrend = 'line'; render(); } }, '折线'),
    h('button', { class: 'pill' + (trendForm === 'bar' ? ' on' : ''), onclick: () => { state.statsTrend = 'bar'; render(); } }, '柱状')
  ]));
  wrap.appendChild(monthTrendCard(inRange, trendForm, rangeLabel));

  // ③ 维度拆解：按项目 / 支出分类 / 收入类型 / 按往来 / 按账户（占比条 / 环形图 / 柱状图）
  wrap.appendChild(h('h2', { class: 'section' }, '维度拆解'));
  const DIMS = [
    { key: 'project', label: '按项目' }, { key: 'cat', label: '支出分类' },
    { key: 'subType', label: '收入类型' }, { key: 'party', label: '按往来' },
    { key: 'account', label: '按账户' }
  ];
  const dimPills = h('div', { class: 'pill-tabs' });
  DIMS.forEach((d) => dimPills.appendChild(h('button', { class: 'pill' + (d.key === (state.statsDim || 'project') ? ' on' : ''), onclick: () => { state.statsDim = d.key; render(); } }, d.label)));
  wrap.appendChild(dimPills);

  const FORMS = [{ key: 'bar', label: '占比条' }, { key: 'donut', label: '环形图' }, { key: 'column', label: '柱状图' }];
  const form = state.statsForm || 'bar';
  const formPills = h('div', { class: 'pill-tabs' });
  FORMS.forEach((f) => formPills.appendChild(h('button', { class: 'pill' + (f.key === form ? ' on' : ''), onclick: () => { state.statsForm = f.key; render(); } }, f.label)));
  wrap.appendChild(formPills);

  const dim = state.statsDim || 'project';
  const dimLabel = (DIMS.find((d) => d.key === dim) || {}).label || '';
  const keyOf = (t) => {
    if (isTransfer(t)) return '';
    if (dim === 'project') return t.projectId || 'none';
    if (dim === 'cat') return isExpense(t) ? (t.category || '未分类') : '';
    if (dim === 'subType') return isIncome(t) ? (t.subType || '其他') : '';
    if (dim === 'party') return t.partyName ? (t.partyId || t.partyName) : '';
    if (dim === 'account') return t.account || '';
    return '';
  };
  const labelOf = (t) => {
    if (dim === 'project') return pname(t.projectId);
    if (dim === 'cat') return t.category || '未分类';
    if (dim === 'subType') return t.subType || '其他';
    if (dim === 'party') return t.partyName || '';
    if (dim === 'account') return t.account || '';
    return '';
  };
  const map = {};
  inRange.forEach((t) => {
    const key = keyOf(t); if (!key) return;
    const amt = Number(t.amount) || 0;
    if (!map[key]) map[key] = { key: key, label: labelOf(t), income: 0, expense: 0, count: 0 };
    const b = map[key];
    b.count++;
    if (isIncome(t)) b.income += amt; else if (isExpense(t)) b.expense += amt;
  });
  const rows = Object.keys(map).map((k) => map[k])
    .sort((a, b) => (b.income - b.expense) - (a.income - a.expense) || (b.income + b.expense) - (a.income + a.expense));
  const maxSum = Math.max.apply(null, [1].concat(rows.map((r) => r.income + r.expense)));

  // 下钻：直接锁定「当前口径内」的这组流水 id —— 比按日期区间回查更精确，跨年项目也不会串
  const drillRow = (b) => {
    if (dim === 'project' && b.key !== 'none') { location.hash = '#/project/' + b.key; return; }
    const ids = [];
    inRange.forEach((t) => { if (keyOf(t) === b.key) ids.push(t.id); });
    statsDrill(rangeLabel + ' · ' + dimLabel + '：' + b.label, ids);
  };

  if (!rows.length) {
    wrap.appendChild(h('div', { class: 'card', style: 'text-align:center;color:var(--text-dim);padding:18px' }, '该口径下没有可拆解的记录'));
  } else if (form === 'donut') {
    const ringExp = [], ringInc = [];
    rows.forEach((b, i) => {
      if (b.expense > 0) ringExp.push({ label: b.label, value: b.expense, text: M(b.expense), idx: i });
      if (b.income > 0) ringInc.push({ label: b.label, value: b.income, text: M(b.income), idx: i });
    });
    const rings = [];
    if (ringExp.length) rings.push({ name: '支出', thickness: 22, items: topNItems(ringExp, 6, M) });
    if (ringInc.length) rings.push({ name: '收入', thickness: 16, items: topNItems(ringInc, 6, M) });
    const card = h('div', { class: 'card' });
    card.appendChild(donutChart({
      rings: rings, size: 148, centerSmall: rings.length > 1,
      centerValue: MK(inc - exp), centerKey: '结余',
      onPick: (idx, it) => { const b = rows[it.idx]; if (b) drillRow(b); }
    }));
    card.appendChild(h('div', { class: 'chart-caption' },
      '点击扇区或图例可下钻明细；' + (rows.length > 6 ? '环形图只画前 6 项，切「占比条」看全部 ' + rows.length + ' 项' : '共 ' + rows.length + ' 项')));
    wrap.appendChild(card);
  } else if (form === 'column') {
    const top = rows.slice(0, 8);
    wrap.appendChild(h('div', { class: 'card' }, [
      groupedBars({
        items: top.map((b) => ({ label: b.label, a: b.income, b: b.expense, aText: M(b.income), bText: M(b.expense) })),
        aName: '收', bName: '支', h: 150, labelLen: 4,
        onPick: (i) => drillRow(top[i])
      }),
      chartLegend([{ name: '收入', color: 'var(--income)' }, { name: '支出', color: 'var(--expense)' }]),
      h('div', { class: 'chart-caption' }, rows.length > 8 ? '仅显示前 8 项，切「占比条」看全部 ' + rows.length + ' 项' : '点击柱体可下钻明细')
    ]));
  } else {
    const card = h('div', { class: 'card' });
    rows.forEach((b) => {
      const pct = Math.max(4, Math.round((b.income + b.expense) / maxSum * 100));
      card.appendChild(h('div', { class: 'tr-row', onclick: () => drillRow(b) }, [
        h('div', { style: 'flex:1;min-width:0' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, b.label),
          h('div', { class: 'meta' }, b.count + ' 笔 · 占比 ' + Math.round((b.income + b.expense) / maxSum * 100) + '%'),
          h('div', { class: 'bar' }, h('div', { class: 'bar-fill' + (b.income - b.expense < 0 ? ' over' : ''), style: 'width:' + pct + '%' }))
        ]),
        h('div', { class: 'tr-r' }, [
          b.income ? h('div', { class: 'amt income' }, '+' + M(b.income)) : null,
          b.expense ? h('div', { class: 'amt expense' }, '-' + M(b.expense)) : null,
          (b.income && b.expense) ? h('div', { class: 'meta' }, '净 ' + M(b.income - b.expense)) : null
        ]),
        h('span', { class: 'chev' }, '›')
      ]));
    });
    wrap.appendChild(card);
  }

  // ④ 支出品类分析（v2.4.0）：环形图 + 二级分类下钻 + 与上期对比
  wrap.appendChild(h('h2', { class: 'section' }, '支出品类分析'));
  wrap.appendChild(expCatCard(inRange, prevList, prevLabel, rangeLabel));

  // v2.1.0：项目经营汇总（期间收/支/毛利 + 毛利率 + 累计回款率）
  wrap.appendChild(h('h2', { class: 'section' }, '项目经营汇总'));
  const perf = projects.map((pj) => {
    const its = inRange.filter((t) => t.projectId === pj.id);
    let inc = 0, exp = 0;
    its.forEach((t) => { const a = Number(t.amount) || 0; if (isIncome(t)) inc += a; else if (isExpense(t)) exp += a; });
    // 回款率用「累计收款 / 合同额」——合同额不属于时间范围，用全量口径才准确
    let totalInc = 0;
    txs.forEach((t) => { if (t.projectId === pj.id && isIncome(t)) totalInc += Number(t.amount) || 0; });
    const c = Number(pj.contractAmount) || 0;
    // 笔数剔除转账：转账不产生经营收支，与毛利率口径保持一致
    return { p: pj, inc, exp, profit: inc - exp, count: its.filter((t) => !isTransfer(t)).length, rate: c > 0 ? Math.min(100, Math.round(totalInc / c * 100)) : 0, contract: c };
  }).filter((x) => x.count > 0).sort((a, b) => b.inc - a.inc);
  if (!perf.length) {
    wrap.appendChild(h('div', { class: 'card', style: 'text-align:center;color:var(--text-dim);padding:18px' }, '该口径下没有项目收支'));
  } else {
    // v2.4.0：项目收支对比柱状图（前 8 个），点柱体直接进项目详情
    const topP = perf.slice(0, 8);
    wrap.appendChild(h('div', { class: 'card' }, [
      groupedBars({
        items: topP.map((x) => ({ label: x.p.name || '未命名', a: x.inc, b: x.exp, aText: M(x.inc), bText: M(x.exp) })),
        aName: '收', bName: '支', h: 150, labelLen: 4,
        onPick: (i) => { location.hash = '#/project/' + topP[i].p.id; }
      }),
      chartLegend([{ name: '收入', color: 'var(--income)' }, { name: '支出', color: 'var(--expense)' }])
    ]));
    const pcard = h('div', { class: 'card' });
    perf.slice(0, 20).forEach((x) => {
      const mg = x.inc > 0 ? (x.profit / x.inc * 100) : 0;
      pcard.appendChild(h('div', { class: 'tr-row', onclick: () => { location.hash = '#/project/' + x.p.id; } }, [
        h('div', { style: 'flex:1;min-width:0' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, x.p.name || '未命名'),
          h('div', { class: 'meta' }, x.count + ' 笔 · 毛利率 ' + (x.inc > 0 ? mg.toFixed(1) + '%' : '—') + (x.contract > 0 ? ' · 累计回款率 ' + x.rate + '%' : ''))
        ]),
        h('div', { class: 'tr-r' }, [
          h('div', { class: 'amt income' }, '+' + M(x.inc)),
          h('div', { class: 'amt expense' }, '-' + M(x.exp)),
          h('div', { class: 'meta' }, '毛利 ' + M(x.profit))
        ]),
        h('span', { class: 'chev' }, '›')
      ]));
    });
    if (perf.length > 20) pcard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:6px' }, '仅显示前 20 个项目'));
    wrap.appendChild(pcard);
  }

  // ⑤ 未开票收款清单：当前口径内 invoiceStatus ≠ 已开 的收入
  const uninv = inRange.filter((t) => isIncome(t) && t.invoiceStatus !== '已开');
  wrap.appendChild(h('h2', { class: 'section' }, '未开票收款（' + uninv.length + '）'));
  if (!uninv.length) {
    wrap.appendChild(h('div', { class: 'card', style: 'text-align:center;color:var(--text-dim);padding:18px' }, '该口径下收到的款项均已开票 🎉'));
  } else {
    let uninvSum = 0;
    uninv.forEach((t) => { uninvSum += Number(t.amount) || 0; });
    const ucard = h('div', { class: 'card' });
    ucard.appendChild(h('div', { class: 'row-between', style: 'margin-bottom:4px' }, [
      h('span', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '合计 ' + uninv.length + ' 笔'),
      h('span', { class: 'amt expense' }, M(uninvSum))
    ]));
    uninv.slice().sort((a, b) => fmtDate(b.date).localeCompare(fmtDate(a.date))).forEach((t) => {
      ucard.appendChild(h('div', { class: 'tr-row', onclick: () => txForm(null, t.projectId || '', t) }, [
        h('div', { style: 'flex:1;min-width:0' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl)' }, (t.subType || '收款') + ' · ' + pname(t.projectId)),
          h('div', { class: 'meta' }, fmtDate(t.date) + (t.partyName ? ' · ' + t.partyName : '') + ' · 票:' + (t.invoiceStatus || '未开') + (t.invoiceType ? '/' + t.invoiceType : ''))
        ]),
        h('div', { class: 'tr-r' }, h('div', { class: 'amt income' }, '+' + M(t.amount))),
        h('span', { class: 'chev' }, '✎')
      ]));
    });
    ucard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:6px' }, '点击一笔可进入编辑，把开票状态改为「已开」'));
    wrap.appendChild(ucard);
  }

  // ⑥ 导出：CSV 明细 / 长图分享（口径与年份写进文件名与图头，避免导出后被误读）
  const catAgg = expCatAgg(inRange);
  const expRow = h('div', { style: 'display:flex;gap:8px;margin:2px 0 8px' }, [
    h('button', {
      class: 'btn sm ghost', style: 'flex:1',
      onclick: () => exportStatsCsv(inRange, { label: rangeLabel, sub: rangeSub, basisLabel: (basis === 'start' ? '开工年口径' : '发生日期口径') }, pname)
    }, '⬇ 导出CSV'),
    h('button', {
      class: 'btn sm ghost', style: 'flex:1',
      onclick: () => shareStatsImage({
        rg: { label: rangeLabel, sub: rangeSub }, basisLabel: (basis === 'start' ? '统计口径：项目开工年' : '统计口径：发生日期'),
        inc: inc, exp: exp, dimLabel: dimLabel, rows: rows, uninv: uninv, cats: catAgg.rows, catTotal: catAgg.total
      })
    }, '🖼 长图分享')
  ]);
  wrap.appendChild(expRow);

  return wrap;
}

// v2.4.0：按一级分类聚合支出（品类分析卡与长图分享共用）
function expCatAgg(list) {
  const cmap = {};
  list.forEach((t) => {
    if (!isExpense(t)) return;
    const c = t.category || '未分类';
    cmap[c] = (cmap[c] || 0) + (Number(t.amount) || 0);
  });
  const rows = Object.keys(cmap).map((k) => ({ label: k, value: cmap[k] })).sort((a, b) => b.value - a.value);
  let total = 0; rows.forEach((x) => { total += x.value; });
  return { rows: rows, total: total };
}

// 金额紧凑显示（图表中心/轴标签用，尊重「隐藏金额」开关）
function MK(n) { return state.hideMoney ? '¥****' : '¥' + compactNum(n); }
// 日期加减天数（返回 YYYY-MM-DD）
function isoAddDays(iso, n) {
  const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
  if (isNaN(d.getTime())) return String(iso).slice(0, 10);
  d.setDate(d.getDate() + Number(n || 0));
  return ymd(d);
}
// 取前 n 项，其余并成「其他 x 项」，避免环形图碎片化
function topNItems(list, n, fmt) {
  if (list.length <= n) return list;
  const head = list.slice(0, n);
  let rest = 0;
  list.slice(n).forEach((x) => { rest += Number(x.value) || 0; });
  return head.concat([{
    label: '其他 ' + (list.length - n) + ' 项', value: rest,
    text: fmt ? fmt(rest) : ('¥' + compactNum(rest)), idx: -1
  }]);
}
// 统计下钻：把「当前口径锁定的一组流水 id」交给流水页，比按区间回查精确
function statsDrill(label, ids) {
  state.ledgerDrill = { label: label, ids: ids || [] };
  state.ledgerCat = 'all'; state.ledgerSub = 'all'; state.ledgerAccount = 'all';
  state.ledgerProject = 'all'; state.ledgerQ = ''; state.ledgerRange = 'all';
  location.hash = '#/ledger/all';
}

// 支出品类分析卡（v2.4.0）：环形图 + 一级/二级下钻 + 与上期对比
function expCatCard(inRange, prevList, prevLabel, rangeLabel) {
  const agg = expCatAgg(inRange);
  const card = h('div', { class: 'card' });
  if (!agg.rows.length) {
    card.className = 'card';
    card.appendChild(h('div', { style: 'text-align:center;color:var(--text-dim);padding:18px' }, '该口径下没有支出记录'));
    return card;
  }
  const selCat = state.statsCat || 'all';
  // 环形图：支出品类占比（点品类 → 下钻子类）
  card.appendChild(donutChart({
    items: topNItems(agg.rows.map((x, i) => ({ label: x.label, value: x.value, text: M(x.value), idx: i })), 7, M),
    size: 148, thickness: 26,
    centerValue: MK(agg.total), centerKey: '支出合计',
    onPick: (idx, it) => { state.statsCat = (state.statsCat === it.label) ? 'all' : it.label; render(); }
  }));

  // 与上期对比（支出涨红跌绿）
  if (prevList && prevList.length) {
    const pAgg = expCatAgg(prevList);
    const d = pAgg.total > 0 ? Math.round((agg.total - pAgg.total) / pAgg.total * 100) : (agg.total > 0 ? 100 : 0);
    const chips = h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:10px;border-top:1px solid var(--border);padding-top:8px' });
    chips.appendChild(h('span', { class: 'delta-chip' }, [
      '对比' + prevLabel + ' 总支出 ',
      h('span', { class: 'd ' + (d > 0 ? 'delta-up' : d < 0 ? 'delta-down' : '') }, (d > 0 ? '↑' : d < 0 ? '↓' : '→') + (d === 0 ? '持平' : Math.abs(d) + '%'))
    ]));
    const pmap = {}; pAgg.rows.forEach((x) => { pmap[x.label] = x.value; });
    agg.rows.slice(0, 4).forEach((x) => {
      const pv = pmap[x.label];
      if (!pv) return;
      const dd = Math.round((x.value - pv) / pv * 100);
      if (!dd) return;
      chips.appendChild(h('span', { class: 'delta-chip' }, [
        x.label + ' ',
        h('span', { class: 'd ' + (dd > 0 ? 'delta-up' : 'delta-down') }, (dd > 0 ? '↑' : '↓') + Math.abs(dd) + '%')
      ]));
    });
    card.appendChild(chips);
  }

  // 一级 / 二级分类排行（可点）
  const subWrap = h('div', { style: 'margin-top:12px;border-top:1px solid var(--border);padding-top:10px' });
  if (selCat !== 'all') {
    const smap = {};
    inRange.forEach((t) => {
      if (!isExpense(t)) return;
      if ((t.category || '未分类') !== selCat) return;
      const s = t.subCat || '未分子类';
      smap[s] = (smap[s] || 0) + (Number(t.amount) || 0);
    });
    const subRows = Object.keys(smap).map((k) => ({ label: k, value: smap[k] })).sort((a, b) => b.value - a.value);
    subWrap.appendChild(h('div', { class: 'row-between', style: 'margin-bottom:8px' }, [
      h('span', { style: 'font-weight:700;font-size:var(--g-fs-ctl)' }, selCat + ' · 子类构成'),
      h('button', { class: 'btn sm ghost', onclick: (e) => { e.stopPropagation(); state.statsCat = 'all'; render(); } }, '← 全部品类')
    ]));
    subWrap.appendChild(rankBars(subRows.map((x) => ({
      label: x.label, value: x.value, text: M(x.value),
      onPick: () => {
        const ids = [];
        inRange.forEach((t) => { if (isExpense(t) && (t.category || '未分类') === selCat && (t.subCat || '未分子类') === x.label) ids.push(t.id); });
        statsDrill(rangeLabel + ' · 支出 ' + selCat + '＞' + x.label, ids);
      }
    })), { color: 'var(--expense)' }));
    subWrap.appendChild(h('div', { class: 'chart-caption' }, '点子类可看该子类全部流水'));
  } else {
    subWrap.appendChild(h('div', { class: 'row-between', style: 'margin-bottom:8px' }, [
      h('span', { style: 'font-weight:700;font-size:var(--g-fs-ctl)' }, '品类排行'),
      h('span', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '点品类看子类构成')
    ]));
    subWrap.appendChild(rankBars(agg.rows.map((x) => ({
      label: x.label, value: x.value, text: M(x.value) + ' · ' + pctText(x.value, agg.total),
      onPick: () => { state.statsCat = x.label; render(); }
    })), { color: 'var(--expense)' }));
  }
  card.appendChild(subWrap);
  return card;
}

// 月度走势（v2.4.0）：折线 / 柱状两种形态 + 环比（红涨绿跌）
// 月份取自「当前口径内流水实际发生的月份」（最多 12 个），不再固定为近 6 个自然月，
// 这样在「项目开工年」口径下跨年项目的流水也能完整呈现。
function monthTrendCard(list, form, rangeLabel) {
  const map = {};
  (list || []).forEach((t) => {
    if (isTransfer(t)) return;
    const d = fmtDate(t.date); if (!d) return;
    const k = d.slice(0, 7);
    if (!map[k]) map[k] = { key: k, income: 0, expense: 0 };
    const amt = Number(t.amount) || 0;
    if (isIncome(t)) map[k].income += amt; else if (isExpense(t)) map[k].expense += amt;
  });
  let keys = Object.keys(map).sort();
  const card = h('div', { class: 'card' });
  if (!keys.length) {
    card.appendChild(h('div', { class: 'chart-empty' }, '该口径下没有收支记录'));
    return card;
  }
  if (keys.length > 12) keys = keys.slice(keys.length - 12);
  const months = keys.map((k) => map[k]);
  const labels = months.map((m, i) => {
    const mo = String(Number(m.key.slice(5, 7)));
    if (i === 0 || m.key.slice(0, 4) !== months[i - 1].key.slice(0, 4)) return m.key.slice(2, 4) + '/' + mo;
    return mo;
  });
  // 下钻：锁定该月在当前口径内的那组流水 id
  const drillMonth = (i) => {
    const m = months[i];
    const ids = [];
    (list || []).forEach((t) => { if ((fmtDate(t.date) || '').slice(0, 7) === m.key) ids.push(t.id); });
    statsDrill((rangeLabel || '') + ' · ' + m.key.slice(0, 4) + '年' + Number(m.key.slice(5, 7)) + '月', ids);
  };

  if (form === 'bar') {
    card.appendChild(groupedBars({
      items: months.map((m) => ({
        label: Number(m.key.slice(5, 7)) + '月', a: m.income, b: m.expense,
        aText: M(m.income), bText: M(m.expense)
      })),
      aName: '收', bName: '支', h: 150, labelLen: 4, onPick: (i) => drillMonth(i)
    }));
  } else {
    card.appendChild(lineChart({
      labels: labels, h: 140,
      series: [
        { name: '收入', color: 'var(--income)', area: true, data: months.map((m) => m.income) },
        { name: '支出', color: 'var(--expense)', data: months.map((m) => m.expense) },
        { name: '结余', color: 'var(--accent)', dash: true, data: months.map((m) => m.income - m.expense) }
      ],
      onPick: (i) => drillMonth(i)
    }));
  }
  card.appendChild(chartLegend([
    { name: '收入', color: 'var(--income)' },
    { name: '支出', color: 'var(--expense)' },
    { name: '结余', color: 'var(--accent)' }
  ]));

  // 环比：最近一个有数据的月 vs 前一月
  if (months.length >= 2) {
    const cur = months[months.length - 1], prev = months[months.length - 2];
    const delta = (a, b) => (b > 0 ? Math.round((a - b) / b * 100) : (a > 0 ? 100 : 0));
    const dInc = delta(cur.income, prev.income), dExp = delta(cur.expense, prev.expense);
    const dNet = delta(cur.income - cur.expense, prev.income - prev.expense);
    const fmtD = (v) => (v > 0 ? '↑' : v < 0 ? '↓' : '→') + (v === 0 ? '持平' : Math.abs(v) + '%');
    const clsOf = (v) => v > 0 ? 'delta-up' : v < 0 ? 'delta-down' : '';
    const chipLine = (label, v) => h('span', { class: 'delta-chip' }, [
      label + ' ',
      h('span', { class: 'd ' + clsOf(v) }, fmtD(v))
    ]);
    card.appendChild(h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;border-top:1px solid var(--border);padding-top:8px' }, [
      chipLine('收入环比', dInc), chipLine('支出环比', dExp), chipLine('结余环比', dNet)
    ]));
  }
  card.appendChild(h('div', { class: 'chart-caption' }, '共 ' + months.length + ' 个月，点击图上任一点可看该月流水'));
  return card;
}

// 统计明细导出 CSV（带 BOM，Excel 打开中文不乱码）
// v2.4.0：rg = {label, sub, basisLabel}，口径写进文件名，避免导出后混淆年份归属
function exportStatsCsv(rows, rg, pname) {
  if (!rows.length) { toast('该口径下没有可导出的记录'); return; }
  const esc = (v) => { v = v == null ? '' : String(v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const typeOf = (t) => isTransfer(t) ? '转账' : (isIncome(t) ? '收入' : '支出');
  const lines = [['日期', '类型', '项目', '分类/收入类型', '子类', '往来单位', '账户', '金额', '开票状态', '备注'].join(',')];
  rows.forEach((t) => {
    lines.push([
      fmtDate(t.date), typeOf(t), pname(t.projectId),
      isIncome(t) ? (t.subType || '') : (t.category || ''),
      isIncome(t) ? '' : (t.subCat || ''),
      t.partyName || '', t.account || '',
      Number(t.amount) || 0,
      isIncome(t) ? (t.invoiceStatus || '未开') : '',
      t.note || ''
    ].map(esc).join(','));
  });
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '统计_' + (rg.basisLabel || '统计') + '_' + rg.label + '_' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('已导出 ' + rows.length + ' 笔 CSV');
}

// 统计长图：canvas 绘制 汇总 + 品类环形图 + 维度拆解 + 未开票合计；支持系统分享则分享，否则下载 PNG
function shareStatsImage(d) {
  try {
    const W = 750, PAD = 44, rowH = 96;
    const rows = d.rows.slice(0, 8);
    const catsAll = (d.cats || []).filter((c) => (Number(c.value) || 0) > 0);
    const cats = catsAll.slice(0, 7);
    let restV = 0;
    catsAll.slice(7).forEach((c) => { restV += Number(c.value) || 0; });
    if (restV > 0) cats.push({ label: '其他 ' + (catsAll.length - 7) + ' 项', value: restV });
    const catBlock = cats.length ? (24 + 40 + Math.max(192, 30 + cats.length * 40) + 20) : 0;
    const headH = 66 + 40 + (d.basisLabel ? 46 : 16);
    let H = PAD + headH + 186 + 34 + rows.length * rowH + catBlock + 110 + (d.uninv.length ? 100 : 0);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const dark = document.documentElement.dataset.theme !== 'light';
    // v2.4.0：环形图配色直接读语义层 Token，保证长图与页面图表同色
    const csRoot = getComputedStyle(document.documentElement);
    const PAL = [];
    for (let i = 1; i <= 8; i++) PAL.push((csRoot.getPropertyValue('--chart-' + i) || '').trim() || '#8a8a8a');
    const C = dark
      ? { bg: '#0f1411', card: '#18211c', text: '#e8efe9', dim: '#9bb0a4', inc: '#4caf78', exp: '#e0835a', accent: '#ffce54', border: '#2a372f', danger: '#e0654f' }
      : { bg: '#f3f6f3', card: '#ffffff', text: '#1d2420', dim: '#66756b', inc: '#1a8f4e', exp: '#b85c2e', accent: '#a9700e', border: '#d9e0da', danger: '#cc4b37' };
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    let y = PAD;
    ctx.fillStyle = C.text; ctx.font = '700 40px sans-serif';
    ctx.fillText('装修记账 · 统计报表', PAD, y + 40); y += 66;
    ctx.fillStyle = C.dim; ctx.font = '26px sans-serif';
    ctx.fillText((d.rg.label || '') + ' · ' + (d.rg.sub || ''), PAD, y); y += 40;
    if (d.basisLabel) {
      ctx.fillStyle = C.accent; ctx.font = '600 24px sans-serif';
      ctx.fillText(d.basisLabel, PAD, y); y += 46;
    } else { y += 16; }
    // 汇总卡
    ctx.fillStyle = C.card;
    roundRect(ctx, PAD, y, W - PAD * 2, 150, 20); ctx.fill();
    ctx.fillStyle = C.dim; ctx.font = '26px sans-serif';
    ctx.fillText('结余', PAD + 28, y + 44);
    ctx.fillStyle = C.accent; ctx.font = '800 54px sans-serif';
    ctx.fillText(fmtMoney(d.inc - d.exp), PAD + 120, y + 50);
    ctx.fillStyle = C.inc; ctx.font = '600 28px sans-serif';
    ctx.fillText('收 ' + fmtMoney(d.inc), PAD + 28, y + 106);
    ctx.fillStyle = C.exp;
    ctx.fillText('支 ' + fmtMoney(d.exp), PAD + 300, y + 106);
    y += 186;
    // 维度拆解
    ctx.fillStyle = C.text; ctx.font = '700 30px sans-serif';
    ctx.fillText('维度拆解 · ' + (d.dimLabel || ''), PAD, y); y += 34;
    const maxSum = Math.max.apply(null, [1].concat(d.rows.map((r) => r.income + r.expense)));
    if (!rows.length) { ctx.fillStyle = C.dim; ctx.font = '26px sans-serif'; ctx.fillText('暂无数据', PAD, y + 30); y += 60; }
    rows.forEach((r) => {
      const bw = W - PAD * 2, pct = Math.max(0.04, (r.income + r.expense) / maxSum);
      ctx.fillStyle = C.text; ctx.font = '600 28px sans-serif';
      ctx.fillText(truncStr(r.label, 16), PAD, y + 30);
      ctx.fillStyle = C.dim; ctx.font = '24px sans-serif';
      const info = r.count + '笔 · ' + Math.round(pct * 100) + '%';
      ctx.fillText(info, W - PAD - ctx.measureText(info).width, y + 30);
      ctx.fillStyle = C.border; roundRect(ctx, PAD, y + 44, bw, 16, 8); ctx.fill();
      ctx.fillStyle = (r.income - r.expense < 0) ? C.exp : C.inc;
      roundRect(ctx, PAD, y + 44, Math.max(20, bw * pct), 16, 8); ctx.fill();
      ctx.font = '600 26px sans-serif';
      let x = W - PAD;
      if (r.expense) { const s = '-' + fmtMoney(r.expense); ctx.fillStyle = C.exp; x -= ctx.measureText(s).width; ctx.fillText(s, x, y + 88); x -= 24; }
      if (r.income) { const s = '+' + fmtMoney(r.income); ctx.fillStyle = C.inc; x -= ctx.measureText(s).width; ctx.fillText(s, x, y + 88); }
      y += rowH;
    });
    // v2.4.0：支出品类构成（canvas 环形图 + 图例）
    if (cats.length) {
      let ct2 = Number(d.catTotal) || 0;
      if (!ct2) cats.forEach((c) => { ct2 += Number(c.value) || 0; });
      y += 24;
      ctx.fillStyle = C.text; ctx.font = '700 30px sans-serif';
      ctx.fillText('支出品类构成', PAD, y); y += 40;
      const dcx = PAD + 104, dcy = y + 96, dr = 84, dth = 30;
      let a0 = -Math.PI / 2;
      cats.forEach((c, i) => {
        const frac = ct2 > 0 ? (Number(c.value) || 0) / ct2 : 0;
        if (frac <= 0) return;
        const a1 = a0 + frac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(dcx, dcy, dr, Math.min(a0, a1), Math.max(a0, a1));
        ctx.lineWidth = dth; ctx.strokeStyle = PAL[i % PAL.length]; ctx.stroke();
        a0 = a1;
      });
      ctx.lineWidth = 1;
      ctx.textAlign = 'center';
      ctx.fillStyle = C.dim; ctx.font = '600 24px sans-serif';
      ctx.fillText('支出合计', dcx, dcy - 8);
      ctx.fillStyle = C.text; ctx.font = '800 28px sans-serif';
      ctx.fillText(fmtMoney(ct2), dcx, dcy + 26);
      ctx.textAlign = 'left';
      cats.forEach((c, i) => {
        const ly = y + 16 + i * 40;
        ctx.fillStyle = PAL[i % PAL.length];
        roundRect(ctx, PAD + 226, ly, 20, 20, 5); ctx.fill();
        ctx.fillStyle = C.text; ctx.font = '26px sans-serif';
        ctx.fillText(truncStr(c.label, 7), PAD + 258, ly + 18);
        ctx.fillStyle = C.dim; ctx.font = '24px sans-serif';
        ctx.fillText((ct2 > 0 ? Math.round((Number(c.value) || 0) / ct2 * 100) : 0) + '%', PAD + 470, ly + 18);
        const sv = fmtMoney(c.value);
        ctx.fillStyle = C.text; ctx.font = '600 24px sans-serif';
        ctx.fillText(sv, W - PAD - ctx.measureText(sv).width, ly + 18);
      });
      y += Math.max(192, 30 + cats.length * 40) + 20;
    }
    if (d.uninv.length) {
      let us = 0; d.uninv.forEach((t) => { us += Number(t.amount) || 0; });
      y += 20;
      ctx.fillStyle = C.danger; ctx.font = '600 28px sans-serif';
      ctx.fillText('未开票收款 ' + d.uninv.length + ' 笔 · 合计 ' + fmtMoney(us), PAD, y + 30);
    }
    ctx.fillStyle = C.dim; ctx.font = '24px sans-serif';
    ctx.fillText('生成于 ' + new Date().toLocaleString('zh-CN', { hour12: false }), PAD, H - 30);
    cv.toBlob((b) => {
      if (!b) { toast('长图生成失败'); return; }
      const file = new File([b], '统计报表.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        navigator.share({ files: [file], title: '统计报表' }).catch(() => {});
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = '统计报表_' + new Date().toISOString().slice(0, 10) + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast('已生成统计长图');
      }
    }, 'image/png');
  } catch (e) { toast('长图生成失败：' + e.message); }
}

function roundRect(ctx, x, y, w, hh, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + hh, r);
  ctx.arcTo(x + w, y + hh, x, y + hh, r);
  ctx.arcTo(x, y + hh, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function truncStr(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

// ---------- 我的（v1.9.0）：核心资产数字 + 资产看板 + 统计概览 + 设置入口聚合 ----------
// 底部 tab「我的」；「设置」降为二级页（#/settings 全部功能保留），从本页入口进入。
// ---------- 资金缺口预测（v2.6.0 B1）----------
// 口径：当前账户余额（期初+收−支+转账互抵，同「我的」页）为基数；
// 未来 8 周的确定性应收/应付 = 未完成的收付款提醒（逾期未办的并入本周）。
// 每周滚动结算：周末余额 = 上周末余额 + 本周收 − 本周付；转负即缺口预警。
async function forecastView() {
  setPageTitle('资金预测');
  const [txs, accounts, rems] = await Promise.all([Transactions.all(), getAccounts(), Reminders.all()]);
  const wrap = h('div');

  // 当前余额（与「我的」页同口径）
  const bal = {};
  accounts.forEach((a) => { bal[a.name] = Number(a.opening) || 0; });
  txs.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (isTransfer(t)) {
      if (bal[t.fromAccount] != null) bal[t.fromAccount] -= amt;
      if (bal[t.toAccount] != null) bal[t.toAccount] += amt;
    } else if (isIncome(t)) { if (bal[t.account] != null) bal[t.account] += amt; }
    else if (isExpense(t)) { if (bal[t.account] != null) bal[t.account] -= amt; }
  });
  let total = 0;
  accounts.forEach((a) => { total += bal[a.name] || 0; });

  // 8 周桶（w0 = 今天起到第 7 天）
  const td = today();
  const weeks = [];
  {
    const base = new Date(td + 'T00:00:00');
    for (let i = 0; i < 8; i++) {
      const f = new Date(base); f.setDate(f.getDate() + i * 7);
      const to = new Date(f); to.setDate(to.getDate() + 6);
      weeks.push({
        from: f.getFullYear() + '-' + pad2(f.getMonth() + 1) + '-' + pad2(f.getDate()),
        to: to.getFullYear() + '-' + pad2(to.getMonth() + 1) + '-' + pad2(to.getDate()),
        in: 0, out: 0, items: []
      });
    }
  }
  const weekOf = (d) => {
    if (d < weeks[0].from) return 0; // 逾期并入本周
    for (let i = 0; i < 8; i++) { if (d >= weeks[i].from && d <= weeks[i].to) return i; }
    return -1; // 8 周外
  };
  let laterN = 0, laterIn = 0, laterOut = 0;
  const pend = rems.filter((r) => !r.done);
  pend.forEach((r) => {
    if (!r.dueDate) return;
    const amt = Number(r.amount) || 0;
    const w = weekOf(fmtDate(r.dueDate));
    if (w < 0) { laterN++; if (r.kind === 'receive') laterIn += amt; else laterOut += amt; return; }
    if (r.kind === 'receive') weeks[w].in += amt; else weeks[w].out += amt;
    weeks[w].items.push({ r: r, amt: amt, overdue: fmtDate(r.dueDate) < td });
  });

  // 滚动余额
  let running = total;
  weeks.forEach((w) => { running += w.in - w.out; w.end = running; });
  const gapWeek = weeks.findIndex((w) => w.end < 0);
  const maxEnd = Math.max(0, weeks[7].end);

  // 汇总卡
  const sumCard = h('div', { class: 'card sum-card' });
  sumCard.appendChild(h('div', { class: 'sum-label' }, '当前总余额 · 未来 8 周预测'));
  sumCard.appendChild(h('div', { class: 'sum-main' }, [h('span', { class: 'sum-k' }, ''), h('span', { class: 'sum-v', style: weeks[7].end < 0 ? 'color:var(--expense)' : '' }, M(weeks[7].end))]));
  sumCard.appendChild(h('div', { class: 'sum-sub' }, '预计收 +' + M(weeks.reduce((s, w) => s + w.in, 0)) + ' ｜ 预计付 -' + M(weeks.reduce((s, w) => s + w.out, 0))));
  wrap.appendChild(sumCard);

  // 缺口预警条
  if (gapWeek >= 0) {
    const g = weeks[gapWeek];
    const short = -g.end;
    wrap.appendChild(h('div', { class: 'card', style: 'border:1px solid var(--expense);background:var(--surface)' }, [
      h('div', { style: 'font-weight:700;color:var(--expense)' }, '⚠️ 缺口预警：第 ' + (gapWeek + 1) + ' 周余额预计转负'),
      h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:4px' },
        fmtMD(g.from) + '～' + fmtMD(g.to) + ' 结束时余额约 ' + M(g.end) + '，资金缺口 ' + M(short) + '。可提前催收「收」节点、或把非紧急支出错开到回款后。')
    ]));
  } else {
    wrap.appendChild(h('div', { class: 'card', style: 'padding:10px 14px;display:flex;align-items:center;gap:8px' }, [
      h('span', { style: 'font-weight:700;color:var(--income)' }, '✅ 未来 8 周无缺口'),
      h('span', { class: 'muted', style: 'font-size:var(--g-fs-sm);flex:1;min-width:0' }, '按当前余额与已录入收付款节点滚动测算')
    ]));
  }

  // 余额走势（9 个点：当前 + 8 个周末）
  wrap.appendChild(h('h2', { class: 'section' }, '余额走势（周）'));
  const lineCard = h('div', { class: 'card' });
  lineCard.appendChild(lineChart({
    labels: ['现在'].concat(weeks.map((w, i) => 'W' + (i + 1))),
    h: 150,
    series: [
      { name: '周末余额', color: 'var(--accent)', area: true, data: [total].concat(weeks.map((w) => w.end)) }
    ]
  }));
  lineCard.appendChild(h('div', { class: 'chart-caption' }, '跌到 0 轴以下 = 该周出现资金缺口'));
  wrap.appendChild(lineCard);

  // 每周明细
  wrap.appendChild(h('h2', { class: 'section' }, '每周现金流'));
  const wCard = h('div', { class: 'card', style: 'padding:4px 14px' });
  weeks.forEach((w, i) => {
    const gap = w.end < 0;
    wCard.appendChild(h('div', { style: 'padding:10px 0' + (i < 7 ? ';border-bottom:1px solid var(--border)' : '') }, [
      h('div', { class: 'row-between' }, [
        h('div', { style: 'min-width:0' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl)' }, [
            h('span', { class: 'tag ' + (gap ? 'unpaid' : 'paid'), style: 'margin-right:6px' }, gap ? '缺口' : 'W' + (i + 1)),
            document.createTextNode(fmtMD(w.from) + '～' + fmtMD(w.to))
          ]),
          h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' },
            '收 +' + M(w.in) + ' · 付 -' + M(w.out) + ' · 净 ' + M(w.in - w.out) + (w.items.length ? ' · ' + w.items.length + ' 个节点' : ''))
        ]),
        h('div', { class: 'amt ' + (w.end < 0 ? 'expense' : '') }, M(w.end))
      ]),
      w.items.length ? h('div', { style: 'margin-top:6px;display:flex;flex-direction:column;gap:3px' },
        w.items.map((it) => h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);display:flex;gap:6px;align-items:baseline' }, [
          h('span', { class: 'tag ' + (it.r.kind === 'receive' ? 'paid' : 'unpaid'), style: 'font-size:var(--g-fs-xs)' }, it.r.kind === 'receive' ? '收' : '付'),
          h('span', { style: 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' },
            fmtMD(fmtDate(it.r.dueDate)) + ' ' + (it.r.title || '未命名') + (it.overdue ? '（已逾期，按本周测算）' : '')),
          h('span', { class: 'amt ' + (it.r.kind === 'receive' ? 'income' : 'expense'), style: 'font-size:var(--g-fs-sm)' },
            (it.r.kind === 'receive' ? '+' : '-') + M(it.amt))
        ]))) : null
    ]));
  });
  wrap.appendChild(wCard);

  if (laterN) {
    wrap.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin:8px 2px 0' },
      '另有 ' + laterN + ' 个节点在 8 周外（收 ' + M(laterIn) + ' / 付 ' + M(laterOut) + '），未计入上图。'));
  }
  wrap.appendChild(h('div', { class: 'card muted', style: 'font-size:var(--g-fs-sm);line-height:1.7;margin-top:10px' },
    '💰 预测只统计「已录入的收付款节点」（项目详情 → 收付款节点）。把确定的收款/付款都录成节点，预测才准；逾期未办的节点按本周测算。'));
  return wrap;
}

// ---------- 周期记账（v2.6.0 B2）----------
// 固定周期收支（房租/工资/月供等）：到期生成「待确认」条目，用户点确认才真正入账。
// meta.cycleItems: [{id,name,type:'expense'|'income',amount,account,category,partyName,day(1-28),note,startDate,active}]
// meta.cycleDone:  { [itemId]: { [ym]: { status:'ok'|'skip', txId } } }（已入账/已跳过的月份）

async function getCycleItems() { return Meta.get('cycleItems', []); }

// 计算当前所有待确认条目：从开始月份到本月，每月一期（day 大于当月天数时取月末），
// 已确认/已跳过的月份不再生成；occurrence 日期晚于今天的也不算到期。
async function cyclePending() {
  const items = (await getCycleItems()).filter((x) => x.active !== false);
  const done = await Meta.get('cycleDone', {});
  const td = today();
  const out = [];
  items.forEach((it) => {
    const startM = (fmtDate(it.startDate) || td).slice(0, 7) || td.slice(0, 7);
    let y = Number(startM.slice(0, 4)), m = Number(startM.slice(5, 7));
    const cy = Number(td.slice(0, 4)), cm = Number(td.slice(5, 7));
    let guard = 0;
    while ((y < cy || (y === cy && m <= cm)) && guard++ < 240) {
      const ym = y + '-' + pad2(m);
      const lastDay = new Date(y, m, 0).getDate();
      const day = Math.min(Math.max(1, Number(it.day) || 1), lastDay);
      const occ = y + '-' + pad2(m) + '-' + pad2(day);
      if (occ <= td && !(done[it.id] && done[it.id][ym])) out.push({ item: it, ym: ym, date: occ });
      m++; if (m > 12) { m = 1; y++; }
    }
  });
  out.sort((a, b) => a.date.localeCompare(b.date) || (a.item.name || '').localeCompare(b.item.name || ''));
  return out;
}

async function markCycleDone(itemId, ym, status, txId) {
  const done = await Meta.get('cycleDone', {});
  done[itemId] = done[itemId] || {};
  done[itemId][ym] = { status: status || 'ok', txId: txId || '' };
  await Meta.set('cycleDone', done);
}

// 确认入账：按周期项生成一笔正式流水（收入记 subType，支出记 category）
async function confirmCycleTx(pd, amountOverride) {
  const it = pd.item;
  const amt = Number(amountOverride != null ? amountOverride : it.amount) || 0;
  if (!(amt > 0)) { toast('金额必须大于 0'); return null; }
  const t = {
    id: uid(), type: it.type, amount: amt, date: pd.date, time: nowHm(),
    account: it.account || '', method: it.account || '',
    category: it.type === 'expense' ? (it.category || '') : '',
    subType: it.type === 'income' ? (it.category || '') : '',
    partyName: it.partyName || '',
    note: ((it.note ? it.note + ' · ' : '') + it.name + '（周期 ' + pd.ym + '）').trim(),
    createdAt: Date.now()
  };
  await Transactions.save(t);
  await markCycleDone(it.id, pd.ym, 'ok', t.id);
  return t;
}

// 单条待确认的行内操作：确认入账 / 改后入账 / 本期跳过
async function cycleAct(pd, action, onDone) {
  if (action === 'ok') {
    const t = await confirmCycleTx(pd);
    if (t) { toast('已入账 ' + M(t.amount) + '（' + pd.date + '）'); if (onDone) onDone(); }
  } else if (action === 'skip') {
    await markCycleDone(pd.item.id, pd.ym, 'skip');
    toast('本期已跳过，下期到期待确认');
    if (onDone) onDone();
  } else if (action === 'edit') {
    const it = pd.item;
    txForm(it.type, '', null, {
      type: it.type, amount: it.amount, category: it.category || '',
      subType: it.type === 'income' ? (it.category || '') : '',
      account: it.account || '', note: (it.name + '（周期 ' + pd.ym + '）'),
      date: pd.date
    }, {
      onSaved: async (saved) => {
        await markCycleDone(it.id, pd.ym, 'ok', saved && saved.id);
        toast('已按修改入账并登记本期');
        if (onDone) onDone();
      }
    });
  }
}

// 待确认处理弹窗（设置页 / 首页共用）
async function cyclePendingModal() {
  let list = await cyclePending();
  const body = h('div');
  const renderList = () => {
    body.innerHTML = '';
    if (!list.length) {
      body.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);text-align:center;padding:14px 0' }, '没有待确认的周期收支 🎉'));
      return;
    }
    body.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm)' }, '每一期都要你点「入账」才会成为正式流水；金额每次都可以改。'));
    list.forEach((pd) => {
      const it = pd.item;
      body.appendChild(h('div', { class: 'tx' }, [
        h('div', { style: 'min-width:0;flex:1' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-ctl);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' },
            (it.type === 'income' ? '收·' : '支·') + (it.name || '未命名')),
          h('div', { class: 'meta' }, fmtDate(pd.date) + (weekdayCN(pd.date) ? ' ' + weekdayCN(pd.date) : '') + (it.account ? ' · ' + it.account : ''))
        ]),
        h('div', { style: 'display:flex;align-items:center;gap:6px;flex:0 0 auto;flex-wrap:wrap;justify-content:flex-end' }, [
          h('div', { class: 'amt ' + (it.type === 'income' ? 'income' : 'expense') }, (it.type === 'income' ? '+' : '-') + M(it.amount)),
          h('button', { class: 'btn sm primary', onclick: async () => { await cycleAct(pd, 'ok'); list = await cyclePending(); renderList(); } }, '✓ 入账'),
          h('button', { class: 'btn sm ghost', onclick: () => { cycleAct(pd, 'edit', async () => { closeModal(); list = await cyclePending(); renderList(); }); } }, '改后入账'),
          h('button', { class: 'btn sm ghost', onclick: async () => { await cycleAct(pd, 'skip'); list = await cyclePending(); renderList(); } }, '跳过')
        ])
      ]));
    });
  };
  renderList();
  openModal('周期记账 · 待确认（' + list.length + '）', body, [
    h('button', { class: 'btn primary', onclick: () => { closeModal(); render(); } }, '完成')
  ]);
}

// 周期项新增/编辑表单
async function cycleForm(it, onSaved) {
  const accounts = await getAccounts();
  const f = h('div');
  const name = field(f, '名称', h('input', { value: it.name || '', placeholder: '如：办公室房租' }));
  const typeWrap = h('div', { class: 'field' }, [h('label', {}, '类型')]);
  const seg = h('div', { class: 'seg' });
  const bEx = h('button', { class: it.type !== 'income' ? 'on' : '', onclick: () => { it.type = 'expense'; bEx.classList.add('on'); bIn.classList.remove('on'); } }, '支出');
  const bIn = h('button', { class: it.type === 'income' ? 'on' : '', onclick: () => { it.type = 'income'; bIn.classList.add('on'); bEx.classList.remove('on'); } }, '收入');
  seg.appendChild(bEx); seg.appendChild(bIn);
  typeWrap.appendChild(seg); f.appendChild(typeWrap);
  const amount = field(f, '每期金额（元）', h('input', { type: 'number', inputmode: 'decimal', value: it.amount || '' }));
  const day = field(f, '每月几号（1-28，月末自动取最后一日）', h('input', { type: 'number', min: '1', max: '28', value: it.day || 1 }));
  const start = field(f, '开始月份（从该月起每月生成待确认）', h('input', { type: 'month', value: (fmtDate(it.startDate) || today()).slice(0, 7) }));
  const acct = field(f, '账户', (() => {
    const s = h('select', {}, [h('option', { value: '' }, '不指定')].concat(accounts.map((a) => h('option', { value: a.name }, a.name))));
    if (it.account) s.value = it.account;
    return s;
  })());
  const cat = field(f, '分类（支出）/ 款项类型（收入）', h('input', { value: it.category || '', placeholder: '如：管理费 / 进度款' }));
  const party = field(f, '往来单位（选填）', h('input', { value: it.partyName || '', placeholder: '如：物业公司' }));
  const note = field(f, '备注（选填）', h('input', { value: it.note || '' }));
  const save = h('button', { class: 'btn primary', style: 'margin-top:10px', onclick: () => {
    it.name = name.value.trim(); if (!it.name) { toast('请填名称'); return; }
    it.amount = Number(amount.value) || 0; if (!(it.amount > 0)) { toast('金额必须大于 0'); return; }
    it.day = Math.min(28, Math.max(1, Number(day.value) || 1));
    it.startDate = (start.value || today().slice(0, 7)) + '-01';
    it.account = acct.value; it.category = cat.value.trim(); it.partyName = party.value.trim(); it.note = note.value.trim();
    Meta.get('cycleItems', []).then((list) => {
      const idx = list.findIndex((x) => x.id === it.id);
      if (idx >= 0) list[idx] = it; else list.push(it);
      Meta.set('cycleItems', list).then(() => { closeModal(); toast('已保存周期项'); if (onSaved) onSaved(); });
    });
  } }, '保存周期项');
  f.appendChild(save);
  openModal(it.id ? '编辑周期项' : '添加周期项', f, [h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消')]);
}

async function mineView() {
  setPageTitle('我的');
  const [txs, accounts, projects] = await Promise.all([Transactions.all(), getAccounts(), Projects.all()]);
  const wrap = h('div');

  // 账户余额 = 期初 + 收 - 支（转账互抵不改总资产）；t.account 存账户名
  const bal = {};
  accounts.forEach((a) => { bal[a.name] = Number(a.opening) || 0; });
  txs.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (isTransfer(t)) {
      if (bal[t.fromAccount] != null) bal[t.fromAccount] -= amt;
      if (bal[t.toAccount] != null) bal[t.toAccount] += amt;
    } else if (isIncome(t)) { if (bal[t.account] != null) bal[t.account] += amt; }
    else if (isExpense(t)) { if (bal[t.account] != null) bal[t.account] -= amt; }
  });
  let total = 0;
  accounts.forEach((a) => { total += bal[a.name] || 0; });

  // 本月收支
  const now = new Date();
  const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  let mIn = 0, mOut = 0;
  txs.forEach((t) => {
    if ((fmtDate(t.date) || '').slice(0, 7) !== ym) return;
    const amt = Number(t.amount) || 0;
    if (isIncome(t)) mIn += amt; else if (isExpense(t)) mOut += amt;
  });

  // 统计概览数据
  const ongoing = projects.filter((p) => p.status === 'ongoing').length;
  const year = String(now.getFullYear());
  let uninvN = 0, uninvSum = 0;
  txs.forEach((t) => {
    if ((fmtDate(t.date) || '').slice(0, 4) !== year) return;
    if (isIncome(t) && t.invoiceStatus !== '已开') { uninvN++; uninvSum += Number(t.amount) || 0; }
  });

  // 核心资产数字
  const asset = h('div', { class: 'card sum-card' });
  asset.appendChild(h('div', { class: 'sum-label' }, '总资产 · ' + accounts.length + ' 个账户'));
  asset.appendChild(h('div', { class: 'sum-main' }, [h('span', { class: 'sum-k' }, ''), h('span', { class: 'sum-v' }, M(total))]));
  asset.appendChild(h('div', { class: 'sum-sub' }, '本月收 ' + M(mIn) + ' ｜ 支 ' + M(mOut)));
  wrap.appendChild(asset);

  // 资产看板：账户余额
  wrap.appendChild(h('h2', { class: 'section' }, '账户余额'));
  if (!accounts.length) {
    wrap.appendChild(emptyState('还没有账户', '到「系统设置 → 账户管理」添加'));
  } else {
    const acard = h('div', { class: 'card', style: 'padding:4px 14px' });
    accounts.forEach((a, i) => {
      acard.appendChild(h('div', { class: 'row-between', style: 'padding:10px 0' + (i < accounts.length - 1 ? ';border-bottom:1px solid var(--border)' : '') }, [
        h('span', { style: 'font-weight:600' }, a.name || '未命名账户'),
        h('span', { class: 'amt', style: 'font-size:16px' }, M(bal[a.name] || 0))
      ]));
    });
    wrap.appendChild(acard);
  }

  // 统计概览
  wrap.appendChild(h('h2', { class: 'section' }, '统计概览'));
  const ocard = h('div', { class: 'stat-grid' });
  ocard.appendChild(h('div', { class: 'stat tappable', onclick: () => { location.hash = '#/projects'; } }, [
    h('div', { class: 'k' }, '进行中项目'),
    h('div', { class: 'v' }, ongoing + ' 个')
  ]));
  ocard.appendChild(h('div', { class: 'stat tappable', onclick: () => { location.hash = '#/stats'; } }, [
    h('div', { class: 'k' }, '本年未开票收款'),
    h('div', { class: 'v expense' }, M(uninvSum)),
    h('div', { class: 'k' }, uninvN + ' 笔 · 点击查看')
  ]));
  wrap.appendChild(ocard);

  // 入口（设置降为二级菜单）
  wrap.appendChild(h('h2', { class: 'section' }, '更多'));
  [['⚙️ 系统设置', '#/settings', '提醒预警 · 外观主题 · 账户 · 分类 · 模板 · 备份'],
   ['🤝 往来单位管理', '#/parties', '往来单位增删改维护'],
   ['📊 统计报表', '#/stats', '多维拆解 · 月度走势 · 导出'],
   ['📈 资金缺口预测', '#/forecast', '未来 8 周现金流 · 缺口预警']
  ].forEach(([t, hsh, sub]) => {
    wrap.appendChild(h('div', { class: 'list-item party-clickable', onclick: () => { location.hash = hsh; } }, [
      h('div', { style: 'min-width:0' }, [
        h('div', { style: 'font-weight:600' }, t),
        h('div', { class: 'sub' }, sub)
      ]),
      h('span', { class: 'chev' }, '›')
    ]));
  });
  return wrap;
}

async function settingsView() {
  setPageTitle('设置');
  const remindDays = await Meta.get('remindDays', 3);
  let notifyOn = await Meta.get('notifyEnabled', true);
  const alertPct = await Meta.get('budgetAlertPct', 80);
  const stageAlertDays = await Meta.get('stageAlertDays', 3);
  const wrap = h('div');
  wrap.appendChild(h('h2', { class: 'section' }, '提醒与预警'));
  const rCard = h('div', { class: 'card' });

  // 系统通知权限
  const permRow = h('div', { style: 'display:flex;gap:8px;align-items:center;flex-wrap:wrap' });
  const permInfo = h('span', { class: 'muted', style: 'font-size:var(--g-fs-md);flex:1;min-width:0' }, '');
  function renderPerm() {
    if (typeof Notification === 'undefined') { permInfo.textContent = '此环境不支持系统通知（节点提醒仍会在首页列出）'; return; }
    if (Notification.permission === 'granted') permInfo.textContent = '✅ 系统通知已开启';
    else if (Notification.permission === 'denied') permInfo.textContent = '🚫 通知已被拒绝，请在浏览器/系统设置中允许本 App 通知';
    else permInfo.textContent = '系统通知未开启（开启后收付款到期、超支会弹通知）';
  }
  renderPerm();
  permRow.appendChild(permInfo);
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    permRow.appendChild(h('button', { class: 'btn primary', onclick: () => {
      Notification.requestPermission().then(() => { renderPerm(); if (Notification.permission === 'granted') toast('通知已开启，到期将自动提醒'); });
    } }, '开启通知'));
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    permRow.appendChild(h('button', { class: 'btn ghost', onclick: () => {
      showNotif('🔔 测试通知', '通知通道正常，收付款到期与超支预警会在这里提醒', 'test', '').then((ok) => { toast(ok ? '已发送测试通知' : '发送失败'); });
    } }, '发送测试通知'));
  }
  rCard.appendChild(permRow);

  // 通知开关
  const swWrap = h('div', { class: 'field', style: 'margin-top:12px' }, [h('label', {}, '节点到期通知')]);
  const swSeg = h('div', { class: 'seg' });
  const bOn = h('button', { class: notifyOn ? 'on' : '', onclick: () => { notifyOn = true; bOn.classList.add('on'); bOff.classList.remove('on'); } }, '开启');
  const bOff = h('button', { class: !notifyOn ? 'on' : '', onclick: () => { notifyOn = false; bOff.classList.add('on'); bOn.classList.remove('on'); } }, '关闭');
  swSeg.appendChild(bOn); swSeg.appendChild(bOff);
  swWrap.appendChild(swSeg);
  rCard.appendChild(swWrap);

  // 提前提醒天数
  rCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:12px' }, '收付款节点提前提醒天数（到期前 N 天内每次打开 App 都会提醒，每天每节点一次）'));
  const input = h('input', { type: 'number', min: '0', max: '30', value: String(remindDays) });
  rCard.appendChild(h('div', { class: 'field', style: 'margin:10px 0 0' }, [input]));

  // 预算预警阈值
  rCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:12px' }, '预算预警阈值：支出达到成本预算的百分之多少时预警（超支 100% 必然预警）'));
  const pctInp = h('input', { type: 'number', min: '1', max: '100', value: String(alertPct) });
  rCard.appendChild(h('div', { class: 'field', style: 'margin:10px 0 0' }, [pctInp]));

  // 阶段工期预警提前天数
  rCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:12px' }, '阶段工期预警提前天数：未完成阶段距预计结束不足 N 天时提醒（逾期必提醒）'));
  const stageInp = h('input', { type: 'number', min: '0', max: '30', value: String(stageAlertDays) });
  rCard.appendChild(h('div', { class: 'field', style: 'margin:10px 0 0' }, [stageInp]));

  rCard.appendChild(h('button', { class: 'btn primary', style: 'margin-top:12px', onclick: () => {
    Promise.all([
      Meta.set('remindDays', Number(input.value) || 0),
      Meta.set('notifyEnabled', !!notifyOn),
      Meta.set('budgetAlertPct', Math.min(100, Math.max(1, Number(pctInp.value) || 80))),
      Meta.set('stageAlertDays', Math.max(0, Number(stageInp.value) || 0))
    ]).then(() => toast('已保存提醒与预警设置'));
  } }, '保存'));
  wrap.appendChild(rCard);

  // 外观（v1.9.0）：暖纸账本 / 墨绿夜读，即点即生效并持久化到 meta.theme（旧 light 值自动归入暖纸）
  wrap.appendChild(h('h2', { class: 'section' }, '外观'));
  const themeSaved = await Meta.get('theme', 'paper');
  const themeCard = h('div', { class: 'card' });
  const themeSeg = h('div', { class: 'seg' });
  const tPaper = h('button', { class: themeSaved !== 'dark' ? 'on' : '' }, '📒 暖纸账本');
  const tDark = h('button', { class: themeSaved === 'dark' ? 'on' : '' }, '🌙 墨绿夜读');
  tPaper.addEventListener('click', () => {
    document.documentElement.dataset.theme = 'paper'; Meta.set('theme', 'paper');
    tPaper.classList.add('on'); tDark.classList.remove('on');
  });
  tDark.addEventListener('click', () => {
    document.documentElement.dataset.theme = 'dark'; Meta.set('theme', 'dark');
    tDark.classList.add('on'); tPaper.classList.remove('on');
  });
  themeSeg.appendChild(tPaper); themeSeg.appendChild(tDark);
  themeCard.appendChild(themeSeg);
  themeCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:8px' }, '暖纸账本：米色纸面质感，支出以朱砂红标注；墨绿夜读适合夜间弱光。设置立即生效并自动记忆'));
  wrap.appendChild(themeCard);

  // 施工阶段模板：独立编辑卡已停用（与「进度计划模板→工装」是同一份数据 meta.stageTemplate，统一在工装 tab 维护，避免双入口 confusion）
  wrap.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin:2px 2px 0' },
    'ℹ️ 默认施工阶段（新建项目自动带入、工装模板的阶段名）请到下方「进度计划模板」选「工装进度模板」维护。'));

  // 进度计划模板（按装修类型：别墅/平层/跃层/工装，源自内置参考表，可改）
  const planTplCard = h('div', { class: 'card' });
  planTplCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '进度计划模板（按装修类型维护；项目里按开工日期自动排期）'));
  const ptTypeSel = h('select', {}, PLAN_TYPES.map((t) => h('option', { value: t.id }, t.label + '进度模板')));
  planTplCard.appendChild(h('div', { class: 'field', style: 'margin-top:8px' }, [ptTypeSel]));
  const ptHint = h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:6px' }, '');
  planTplCard.appendChild(ptHint);
  const ptList = h('div', { style: 'margin-top:8px' });
  planTplCard.appendChild(ptList);
  const tpls = await getPlanTemplates();
  let ptType = 'villa';
  let ptCur = tpls.villa.slice();
  function renderPt() {
    ptList.innerHTML = '';
    ptHint.textContent = ptType === 'fitup'
      ? '工装按实际填写：工期默认留空、不强制预设。此处即「默认施工阶段」：新建项目自动带入这里的阶段名，可自行编辑。'
      : '每阶段工期（天）为默认固定进度，载入项目时按开工日期自动推算各阶段起止时间。';
    ptCur.forEach((it, i) => {
      const row = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' });
      const up = h('button', { class: 'btn sm ghost', title: '上移', onclick: () => { if (i > 0) { const t = ptCur[i]; ptCur[i] = ptCur[i - 1]; ptCur[i - 1] = t; renderPt(); } } }, '↑');
      const down = h('button', { class: 'btn sm ghost', title: '下移', onclick: () => { if (i < ptCur.length - 1) { const t = ptCur[i]; ptCur[i] = ptCur[i + 1]; ptCur[i + 1] = t; renderPt(); } } }, '↓');
      const nm = h('input', { value: it.name || '', placeholder: '阶段名称', style: 'flex:1;min-width:0' });
      nm.addEventListener('input', () => { it.name = nm.value; });
      const dy = h('input', { type: 'number', min: '0', value: (it.days == null ? '' : it.days), placeholder: '工期(天)', style: 'width:76px;flex:0 0 auto' });
      dy.addEventListener('input', () => { it.days = dy.value === '' ? null : (Number(dy.value) || 0); });
      const del = h('button', { class: 'delete-x', title: '删除', onclick: () => { ptCur.splice(i, 1); renderPt(); } }, '×');
      row.appendChild(up); row.appendChild(down); row.appendChild(nm); row.appendChild(dy); row.appendChild(del);
      ptList.appendChild(row);
    });
  }
  function loadPtType(id) {
    ptType = id;
    if (id === 'fitup') {
      getStageTpl().then((tpl) => {
        ptCur = tpl.map((t) => ({ name: t.name || '', days: null }));
        renderPt();
      });
    } else {
      ptCur = (tpls[id] || []).map((x) => ({ name: x.name, days: x.days }));
      renderPt();
    }
  }
  ptTypeSel.addEventListener('change', () => loadPtType(ptTypeSel.value));
  loadPtType('villa');
  planTplCard.appendChild(h('button', { class: 'btn sm ghost', style: 'margin-top:6px', onclick: () => { ptCur.push({ name: '', days: ptType === 'fitup' ? null : 1 }); renderPt(); } }, '+ 添加阶段'));
  planTplCard.appendChild(h('button', { class: 'btn primary', style: 'margin-top:10px', onclick: () => {
    const cleaned = ptCur.map((x) => ({ name: (x.name || '').trim(), days: x.days == null ? null : (Number(x.days) || 0) })).filter((x) => x.name);
    if (ptType === 'fitup') {
      Meta.set('stageTemplate', cleaned.map((x) => ({ id: uid(), name: x.name }))).then(() => toast('已保存工装模板（阶段名=默认施工阶段）'));
    } else {
      tpls[ptType] = cleaned;
      Meta.set('planTemplates', tpls).then(() => toast('已保存' + ((PLAN_TYPES.find((t) => t.id === ptType) || {}).label) + '进度模板'));
    }
  } }, '保存模板'));
  wrap.appendChild(planTplCard);

  // 账户管理
  const accCard = h('div', { class: 'card' });
  accCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '账户（记账时选择；转账可在两账户间划转）'));
  const accList = h('div', { style: 'margin-top:8px' });
  accCard.appendChild(accList);
  getAccounts().then((accs) => {
    function renderAccs() {
      accList.innerHTML = '';
      if (!accs.length) accList.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '还没有账户，点下方「+ 添加账户」'));
      accs.forEach((a, i) => {
        const row = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' });
        const nm = h('input', { value: a.name || '', placeholder: '账户名称', style: 'flex:1;min-width:0' });
        nm.addEventListener('input', () => { accs[i].name = nm.value; });
        const op = h('input', { type: 'number', inputmode: 'decimal', value: a.opening || '', placeholder: '期初余额', style: 'width:96px;flex:0 0 auto' });
        op.addEventListener('input', () => { accs[i].opening = Number(op.value) || 0; });
        const del = h('button', { class: 'delete-x', title: '删除', onclick: () => { accs.splice(i, 1); renderAccs(); } }, '×');
        row.appendChild(nm); row.appendChild(op); row.appendChild(del);
        accList.appendChild(row);
      });
    }
    renderAccs();
    accCard.appendChild(h('button', { class: 'btn sm ghost', style: 'margin-top:6px', onclick: () => { accs.push({ id: uid(), name: '', opening: 0 }); renderAccs(); } }, '+ 添加账户'));
    accCard.appendChild(h('button', { class: 'btn primary', style: 'margin-top:10px', onclick: () => {
      const cleaned = accs.filter((x) => (x.name || '').trim()).map((x) => ({ id: x.id || uid(), name: x.name.trim(), opening: Number(x.opening) || 0 }));
      Meta.set('accounts', cleaned).then(() => toast('已保存账户'));
    } }, '保存账户'));
  });
  wrap.appendChild(accCard);

  // 分类层级（一级 ＞ 二级）——统一分类：记账分类与预算计划类别共用同一棵树
  const treeCard = h('div', { class: 'card' });
  treeCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '分类层级（统一分类：记账选「一级 ＞ 二级」，项目预算计划类别也从这里选）'));
  const treeList = h('div', { style: 'margin-top:8px' });
  treeCard.appendChild(treeList);
  getCatTree().then((tree) => {
    function renderTree() {
      treeList.innerHTML = '';
      if (!tree.length) treeList.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '还没有分类，点下方「+ 添加分类」'));
      tree.forEach((c, i) => {
        const box = h('div', { style: 'margin-top:8px;padding:9px;border:1px solid var(--border);border-radius:10px' });
        const r1 = h('div', { style: 'display:flex;gap:6px;align-items:center' });
        const up = h('button', { class: 'btn sm ghost', title: '上移', onclick: () => { if (i > 0) { const tmp = tree[i]; tree[i] = tree[i - 1]; tree[i - 1] = tmp; renderTree(); } } }, '↑');
        const down = h('button', { class: 'btn sm ghost', title: '下移', onclick: () => { if (i < tree.length - 1) { const tmp = tree[i]; tree[i] = tree[i + 1]; tree[i + 1] = tmp; renderTree(); } } }, '↓');
        const nm = h('input', { value: c.name || '', placeholder: '一级分类', style: 'flex:1;min-width:0' });
        nm.addEventListener('input', () => { c.name = nm.value; });
        const del = h('button', { class: 'delete-x', title: '删除', onclick: () => { tree.splice(i, 1); renderTree(); } }, '×');
        r1.appendChild(up); r1.appendChild(down); r1.appendChild(nm); r1.appendChild(del);
        box.appendChild(r1);
        const subsInp = h('input', { value: (c.subs || []).map((s) => s.name).join('，'), placeholder: '二级类别，逗号分隔：辅材，主材，五金', style: 'width:100%;margin-top:6px;background:var(--surface-2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:9px 11px;font-size:var(--g-fs-md);font-family:inherit' });
        subsInp.addEventListener('input', () => {
          c.subs = subsInp.value.split(/[，,]/).map((s) => s.trim()).filter(Boolean).map((s, j) => ({ id: (c.id || 'c') + '-' + j, name: s }));
        });
        box.appendChild(subsInp);
        treeList.appendChild(box);
      });
    }
    renderTree();
    treeCard.appendChild(h('button', { class: 'btn sm ghost', style: 'margin-top:6px', onclick: () => { tree.push({ id: uid(), name: '', subs: [] }); renderTree(); } }, '+ 添加分类'));
    treeCard.appendChild(h('button', { class: 'btn primary', style: 'margin-top:10px', onclick: () => {
      const cleaned = tree.filter((x) => (x.name || '').trim()).map((x) => ({
        id: x.id || uid(), name: x.name.trim(),
        subs: (x.subs || []).filter((s) => (s.name || '').trim()).map((s) => ({ id: s.id || uid(), name: s.name.trim() }))
      }));
      Meta.set('catTree', cleaned).then(() => toast('已保存分类层级'));
    } }, '保存分类层级'));
  });
  wrap.appendChild(treeCard);

  // 记账模板（完整维度：类型/金额/分类/账户/成员/商家/备注）
  const tplCard2 = h('div', { class: 'card' });
  tplCard2.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '记账模板（流水页一键套用；可预存类型/金额/分类/账户/成员/商家/备注）'));
  const tplList2 = h('div', { style: 'margin-top:8px' });
  tplCard2.appendChild(tplList2);
  getTemplates().then((tpls) => {
    function renderTpls() {
      tplList2.innerHTML = '';
      if (!tpls.length) tplList2.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '还没有模板，点下方「+ 添加模板」'));
      tpls.forEach((tp, i) => {
        const row = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' });
        const label = (tp.type === 'income' ? '收·' : '支·') + (tp.name || '未命名') + (tp.amount ? ' · ' + fmtMoney(tp.amount) : '');
        row.appendChild(h('button', { class: 'chip', style: 'flex:1;min-width:0;justify-content:flex-start', onclick: () => templateForm(tp, renderTpls) }, label));
        row.appendChild(h('button', { class: 'delete-x', title: '删除', onclick: () => { tpls.splice(i, 1); saveTpls(); renderTpls(); } }, '×'));
        tplList2.appendChild(row);
      });
    }
    function saveTpls() {
      Meta.set('txTemplates', tpls).then(() => toast('已保存模板'));
    }
    renderTpls();
    tplCard2.appendChild(h('button', { class: 'btn sm ghost', style: 'margin-top:6px', onclick: () => {
      const tp = { id: uid(), name: '', type: 'expense', amount: 0, category: '', account: '', memberId: '', merchantId: '', note: '' };
      tpls.push(tp);
      templateForm(tp, renderTpls);
    } }, '+ 添加模板'));
  });
  wrap.appendChild(tplCard2);

  // ---------- 周期记账（v2.6.0）：固定收支到期生成待确认，点确认才入账 ----------
  wrap.appendChild(h('h2', { class: 'section' }, '周期记账'));
  const cyCard = h('div', { class: 'card' });
  const cyItems = await getCycleItems();
  const cyPending = await cyclePending();
  cyCard.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'min-width:0' }, [
      h('div', { style: 'font-weight:600' }, '固定周期收支（房租/工资/月供等）'),
      h('div', { class: 'muted' }, '到期生成「待确认」，你点确认才入账 · 当前待确认 ' + cyPending.length + ' 期')
    ]),
    cyPending.length ? h('button', { class: 'btn sm primary', style: 'flex:0 0 auto', onclick: () => cyclePendingModal() }, '去处理') : null
  ]));
  const cyList = h('div', { style: 'margin-top:8px' });
  if (!cyItems.length) {
    cyList.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '还没有周期项。点下方「+ 添加周期项」，比如每月 5 号房租 8000。'));
  } else {
    cyItems.forEach((it) => {
      cyList.appendChild(h('div', { class: 'row-between', style: 'padding:8px 0;border-top:1px solid var(--border)' }, [
        h('div', { style: 'min-width:0' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-md)' }, [
            h('span', { class: 'tag ' + (it.type === 'income' ? 'paid' : 'unpaid'), style: 'margin-right:6px' }, it.type === 'income' ? '收' : '支'),
            document.createTextNode((it.name || '未命名') + (it.active === false ? '（已停用）' : ''))
          ]),
          h('div', { class: 'muted', style: 'font-size:var(--g-fs-xs)' },
            '每月 ' + (it.day || 1) + ' 日 · ' + M(it.amount) + (it.account ? ' · ' + it.account : '') + (it.category ? ' · ' + it.category : ''))
        ]),
        h('div', { style: 'display:flex;gap:6px;flex:0 0 auto' }, [
          h('button', { class: 'btn sm ghost', onclick: () => cycleForm(it, render) }, '编辑'),
          h('button', { class: 'btn sm ghost', onclick: async () => { it.active = it.active === false; await Meta.set('cycleItems', cyItems); render(); } }, it.active === false ? '启用' : '停用'),
          h('button', { class: 'btn sm ghost', onclick: () => {
            confirmDialog('删除周期项「' + (it.name || '') + '」？已入账的流水不受影响，仅不再生成新的待确认。', async () => {
              const rest = cyItems.filter((x) => x.id !== it.id);
              await Meta.set('cycleItems', rest); render();
            }, '删除');
          } }, '删除')
        ])
      ]));
    });
  }
  cyCard.appendChild(cyList);
  cyCard.appendChild(h('button', { class: 'btn sm ghost', style: 'margin-top:8px', onclick: () => cycleForm({ id: uid(), type: 'expense', day: 1, active: true }, render) }, '+ 添加周期项'));
  wrap.appendChild(cyCard);

  // ---------- 数据安全（v2.0.0）：本地快照 + 回收站 ----------
  const fmtBytes = (n) => {
    n = Number(n) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  };
  const relTime = (ts) => {
    ts = Number(ts) || 0; if (!ts) return '从未';
    const d = Math.max(0, Date.now() - ts);
    if (d < 60000) return '刚刚';
    if (d < 3600000) return Math.floor(d / 60000) + ' 分钟前';
    if (d < 86400000) return Math.floor(d / 3600000) + ' 小时前';
    return Math.floor(d / 86400000) + ' 天前';
  };
  const SNAP_KIND = { auto: { t: '自动', c: 'paid' }, manual: { t: '手动', c: 'ongoing' }, 'pre-import': { t: '导入前', c: 'unpaid' } };

  wrap.appendChild(h('h2', { class: 'section' }, '数据安全'));
  const dsCard = h('div', { class: 'card' });
  const lastAuto = await Meta.get('lastAutoSnapshotAt', 0);
  const snaps = await Snapshots.all();
  const trashItems = await Trash.all();
  const dsMsg = h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:6px;color:var(--income)' });

  dsCard.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'min-width:0' }, [
      h('div', { style: 'font-weight:600' }, '本地快照'),
      h('div', { class: 'muted' }, '最近自动备份 ' + relTime(lastAuto) + ' · 共 ' + snaps.length + ' 份（最多保留 7 份）')
    ]),
    h('button', { class: 'btn sm primary', style: 'flex:0 0 auto', onclick: async () => {
      dsMsg.textContent = '正在生成快照…';
      try {
        const r = await Snapshots.save('manual');
        dsMsg.textContent = '✅ 已存快照（' + fmtBytes(r.bytes) + (r.attachmentsIncluded ? '' : '，因体积过大未含凭证照片') + '）';
        render();
      } catch (e) { dsMsg.textContent = '❌ 快照失败：' + (e && e.message || e); }
    } }, '立即备份')
  ]));
  dsCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:6px' },
    '数据存在手机浏览器里，清缓存/换手机会丢失。除导出文件外，App 每 24 小时自动留一份本地快照，导入备份前也会自动留一份，出问题可一键回滚。'));

  if (snaps.length) {
    const sl = h('div', { style: 'margin-top:10px' });
    snaps.slice(0, 7).forEach((s) => {
      const k = SNAP_KIND[s.kind] || { t: s.kind, c: 'stage' };
      sl.appendChild(h('div', { class: 'row-between', style: 'padding:8px 0;border-top:1px solid var(--border)' }, [
        h('div', { style: 'min-width:0' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-md)' }, [
            h('span', { class: 'tag ' + k.c, style: 'margin-right:6px' }, k.t),
            relTime(s.createdAt)
          ]),
          h('div', { class: 'muted', style: 'font-size:var(--g-fs-xs)' },
            fmtDateTime(new Date(s.createdAt).toISOString(), new Date(s.createdAt).toTimeString().slice(0, 5)) + ' · ' + fmtBytes(s.bytes) + (s.attachmentsIncluded ? '' : ' · 无凭证'))
        ]),
        h('div', { style: 'display:flex;gap:6px;flex:0 0 auto' }, [
          h('button', { class: 'btn sm ghost', onclick: () => {
            confirmDialog('将用 ' + relTime(s.createdAt) + '（' + k.t + '）的快照【覆盖当前全部数据】。当前数据会先存一份「导入前」快照，可再次回滚。确定？', async () => {
              try { await Snapshots.restore(s.id); toast('已回滚，即将刷新'); setTimeout(() => location.reload(), 900); }
              catch (e) { toast('回滚失败：' + (e && e.message || e)); }
            }, '回滚到此快照');
          } }, '回滚'),
          h('button', { class: 'btn sm ghost', onclick: async () => { await Snapshots.remove(s.id); render(); } }, '删除')
        ])
      ]));
    });
    dsCard.appendChild(sl);
  }
  dsCard.appendChild(dsMsg);
  wrap.appendChild(dsCard);

  // 回收站
  const groups = {};
  trashItems.forEach((it) => { (groups[it.groupId] = groups[it.groupId] || []).push(it); });
  const gKeys = Object.keys(groups).sort((a, b) => (groups[b][0].deletedAt || 0) - (groups[a][0].deletedAt || 0));
  const trCard = h('div', { class: 'card' });
  trCard.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'min-width:0' }, [
      h('div', { style: 'font-weight:600' }, '回收站'),
      h('div', { class: 'muted' }, trashItems.length + ' 条（保留 30 天，可整体还原）')
    ]),
    trashItems.length ? h('button', { class: 'btn sm ghost', style: 'flex:0 0 auto', onclick: () => {
      confirmDialog('彻底删除回收站全部 ' + trashItems.length + ' 条记录？此操作不可恢复。', async () => {
        await Trash.clear(); toast('回收站已清空'); render();
      }, '彻底清空');
    } }, '清空') : null
  ]));
  if (!gKeys.length) {
    trCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:8px' }, '暂无被删除的记录。删除的项目/流水/往来会先进这里，30 天内可还原。'));
  } else {
    const tl = h('div', { style: 'margin-top:8px' });
    gKeys.slice(0, 20).forEach((gk) => {
      const items = groups[gk];
      const main = items.find((x) => x.store === 'projects') || items.find((x) => x.store === 'parties') || items[0];
      const txs = items.filter((x) => x.store === 'transactions').length;
      const name = main.store === 'projects' ? (main.rec.name || '项目')
        : main.store === 'parties' ? (main.rec.name || '往来单位')
        : (main.label || '记账 ' + txs + ' 笔');
      const typeTxt = main.store === 'projects' ? '项目' : main.store === 'parties' ? '往来' : '流水';
      tl.appendChild(h('div', { class: 'row-between', style: 'padding:8px 0;border-top:1px solid var(--border)' }, [
        h('div', { style: 'min-width:0' }, [
          h('div', { style: 'font-weight:600;font-size:var(--g-fs-md);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, name),
          h('div', { class: 'muted', style: 'font-size:var(--g-fs-xs)' }, typeTxt + (txs && main.store === 'projects' ? ' + ' + txs + ' 笔流水' : (main.store === 'transactions' ? ' ' + items.length + ' 笔' : '')) + ' · 删除于 ' + relTime(main.deletedAt))
        ]),
        h('div', { style: 'display:flex;gap:6px;flex:0 0 auto' }, [
          h('button', { class: 'btn sm primary', onclick: async () => {
            try { const n = await Trash.restore(gk); toast('已还原 ' + n + ' 条记录'); render(); }
            catch (e) { toast('还原失败：' + (e && e.message || e)); }
          } }, '还原'),
          h('button', { class: 'btn sm ghost', onclick: async () => { await Trash.removeGroup(gk); render(); } }, '彻底删除')
        ])
      ]));
    });
    trCard.appendChild(tl);
  }
  wrap.appendChild(trCard);

  // 演示数据（v2.6.0）：还原演示 / 清空为空白账本，两种操作前都自动存快照
  const isDemo = await Meta.get('demoMode', false);
  const demoCard = h('div', { class: 'card' });
  demoCard.appendChild(h('div', { class: 'row-between' }, [
    h('div', { style: 'min-width:0' }, [
      h('div', { style: 'font-weight:600' }, '演示数据'),
      h('div', { class: 'muted' }, isDemo
        ? '当前是演示账本（内置 2 个项目、8 笔流水），点击下方按钮换成自己的空白账本'
        : '正式账本。可以把数据重置为内置演示账本（给客户演示 / 体验功能）')
    ]),
    h('span', { class: 'tag ' + (isDemo ? 'finished' : 'paid'), style: 'flex:0 0 auto' }, isDemo ? '演示中' : '正式')
  ]));
  demoCard.appendChild(h('div', { style: 'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap' }, [
    h('button', { class: 'btn ghost', onclick: () => {
      confirmDialog('将【清空当前全部数据】并重置为内置演示账本（' + (isDemo ? '重新播种' : '当前为正式账本，重置前会自动存一份快照') + '）。确定？', async () => {
        try { await Snapshots.save('pre-import'); } catch (se) { /* 快照失败不阻断 */ }
        try { await Demo.reset('demo'); toast('已还原演示数据，即将刷新'); setTimeout(() => location.reload(), 900); }
        catch (e) { toast('重置失败：' + (e && e.message || e)); }
      }, '还原演示');
    } }, '🎬 还原演示数据'),
    h('button', { class: 'btn ' + (isDemo ? 'primary' : 'ghost'), onclick: () => {
      confirmDialog('将【清空当前全部数据】换成空白账本（保留账户/分类等基础配置；' + (isDemo ? '演示数据不会进回收站' : '重置前会自动存一份快照') + '）。确定？', async () => {
        try { await Snapshots.save('pre-import'); } catch (se) { /* 快照失败不阻断 */ }
        try { await Demo.reset('blank'); toast('已清空为空白账本，即将刷新'); setTimeout(() => location.reload(), 900); }
        catch (e) { toast('清空失败：' + (e && e.message || e)); }
      }, isDemo ? '开始记账' : '清空数据');
    } }, isDemo ? '🧹 清空演示，开始记账' : '🧹 清空为空白账本')
  ]));
  wrap.appendChild(demoCard);

  // 备份与恢复（全量 JSON，含照片凭证）
  const bkCard = h('div', { class: 'card' });
  bkCard.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md)' }, '备份与恢复（强烈建议定期备份：数据存在手机浏览器里，清缓存/换手机前务必导出）'));
  const bkMsg = h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:6px;color:var(--income)' });
  bkCard.appendChild(h('div', { style: 'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap' }, [
    h('button', { class: 'btn primary', onclick: async () => {
      bkMsg.textContent = '正在打包数据…';
      try {
        const data = await exportAll();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '装修记账备份_' + today() + '.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        bkMsg.textContent = '✅ 备份文件已生成，请通过浏览器下载/分享保存（可发微信文件传输助手留存）';
      } catch (e) { bkMsg.textContent = '❌ 备份失败：' + (e && e.message || e); }
    } }, '⬇️ 导出备份'),
    h('button', { class: 'btn ghost', onclick: () => bkFile.click() }, '⬆️ 导入恢复')
  ]));
  const bkFile = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
  bkFile.addEventListener('change', (e) => {
    const fl = e.target.files[0];
    if (!fl) return;
    const reader = new FileReader();
    reader.onload = () => {
      let data = null;
      try { data = JSON.parse(String(reader.result)); } catch (err) { toast('文件不是有效的备份'); return; }
      if (!data || !data.stores) { toast('文件不是本应用的备份'); return; }
      const n = (data.stores.transactions || []).length;
      confirmDialog('导入将【清空并覆盖】当前所有数据，用备份里的 ' + n + ' 笔记账替换。导入前会自动存一份当前数据快照，可在「数据安全」里一键回滚。确定继续？', async () => {
        try {
          // v2.0.0：导入前强制留快照，防止坏备份导致数据无法挽回
          try { await Snapshots.save('pre-import'); } catch (se) { /* 快照失败不阻断导入 */ }
          const r = await importAll(data);
          if (r && r.failed > 0) {
            toast('已恢复 ' + r.imported + ' 条，其中 ' + r.failed + ' 条失败（可在「数据安全」里回滚到导入前快照）');
          } else {
            toast('恢复成功，共 ' + (r ? r.imported : n) + ' 条，即将刷新');
          }
          setTimeout(() => location.reload(), 900);
        } catch (err) { toast('恢复失败：' + (err && err.message || err)); }
      }, '覆盖导入');
    };
    reader.readAsText(fl, 'utf-8');
    e.target.value = '';
  });
  bkCard.appendChild(bkFile);
  bkCard.appendChild(bkMsg);
  wrap.appendChild(bkCard);

  wrap.appendChild(h('h2', { class: 'section', style: 'margin-top:18px' }, '关于'));
  wrap.appendChild(h('div', { class: 'card muted', style: 'font-size:var(--g-fs-md);line-height:1.7' },
    '装修记账 · 本地版（PWA）。所有数据仅保存在本机浏览器，不上传任何服务器。可在安卓 Chrome 中“添加到主屏幕”当作 App 使用。当前为 P1：项目管理、记账（含照片/开票/更细维度）、往来单位、首页看板。'));

  return wrap;
}

// ---------- 表单：项目 ----------
function projectForm(existing) {
  const p = existing || { id: uid(), status: 'ongoing' };
  const isEdit = !!existing;
  const f = h('div');
  const stages = (p.stages && p.stages.length)
    ? p.stages.map((s) => ({ id: s.id || uid(), name: s.name || '', done: !!s.done, date: s.date || '', planStart: s.planStart || '', planEnd: s.planEnd || '' }))
    : [];
  if (!isEdit) {
      getStageTpl().then((tpl) => {
      tpl.forEach((t) => stages.push({ id: uid(), name: t.name || '', done: false, date: '', planStart: '', planEnd: '' }));
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
  // 施工经理/设计师：与「往来单位」联动，下拉选择对应类型人员；编辑时旧值不在列表中则保留为额外选项，避免丢数据
  function personField(labelText, types, current) {
    const sel = h('select');
    sel.appendChild(h('option', { value: '' }, '不指定'));
    Parties.all().then((list) => {
      list.filter((pt) => types.indexOf(pt.type) >= 0 && (pt.name || '').trim())
        .forEach((pt) => sel.appendChild(h('option', { value: pt.name }, pt.name)));
      if (current && !Array.from(sel.options).some((o) => o.value === current)) {
        sel.appendChild(h('option', { value: current }, current + '（不在往来单位）'));
      }
      sel.value = current || '';
    });
    return field(f, labelText, sel);
  }
  const manager = personField('施工经理（从往来单位选择）', ['manager'], p.manager || '');
  const designer = personField('设计师（从往来单位选择）', ['designer'], p.designer || '');
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
      const box = h('div', { style: 'border:1px solid var(--border);border-radius:10px;padding:8px;margin-top:6px' });
      const row = h('div', { style: 'display:flex;gap:6px;align-items:center;flex-wrap:wrap' });
      // ⚠️ checkbox 必须显式定宽：否则命中全局 .field input{width:100%}，在 flex 行内霸占约 200px，
      //    把阶段名输入框挤到 26px 导致文字不可见（详情页的同款勾选框有内联宽度所以一直正常）
      const cb = h('input', { type: 'checkbox', title: '已完成', style: 'width:18px;height:18px;flex:0 0 auto' }); cb.checked = !!s.done;
      cb.addEventListener('change', () => { s.done = cb.checked; });
      const nm = h('input', { value: s.name || '', placeholder: '阶段名称', style: 'flex:1;min-width:0' });
      nm.addEventListener('input', () => { s.name = nm.value; });
      const dt = h('input', { type: 'date', value: s.date || '', title: '实际完成时间', style: 'width:128px;flex:0 0 auto' });
      dt.addEventListener('input', () => { s.date = dt.value; });
      const del = h('button', { class: 'delete-x', onclick: () => { stages.splice(i, 1); renderStages(); } }, '×');
      row.appendChild(cb); row.appendChild(nm); row.appendChild(dt); row.appendChild(del);
      box.appendChild(row);
      const row2 = h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap' });
      row2.appendChild(h('span', { class: 'muted', style: 'font-size:var(--g-fs-sm);flex:0 0 auto' }, '预计'));
      const ps = h('input', { type: 'date', value: s.planStart || '', title: '预计开始时间', style: 'flex:1;min-width:0' });
      const pe = h('input', { type: 'date', value: s.planEnd || '', title: '预计结束时间', style: 'flex:1;min-width:0' });
      const dur = h('input', { type: 'number', min: '0', value: (s.planStart && s.planEnd) ? Math.max(1, daysDiff(s.planEnd, s.planStart) + 1) : '', placeholder: '工期(天)', title: '工期天数：填开始时间+工期，自动推算结束时间', style: 'width:64px;flex:0 0 auto' });
      const syncDur = () => {
        dur.value = (s.planStart && s.planEnd && daysDiff(s.planEnd, s.planStart) >= 0)
          ? (daysDiff(s.planEnd, s.planStart) + 1) : '';
      };
      ps.addEventListener('input', () => { s.planStart = ps.value; syncDur(); });
      pe.addEventListener('input', () => { s.planEnd = pe.value; syncDur(); });
      dur.addEventListener('input', () => {
        const n = Number(dur.value) || 0;
        if (s.planStart && n > 0) {
          const end = new Date(s.planStart + 'T00:00:00'); end.setDate(end.getDate() + n - 1);
          s.planEnd = ymd(end); pe.value = s.planEnd;
        }
      });
      syncDur();
      row2.appendChild(ps); row2.appendChild(pe); row2.appendChild(dur);
      box.appendChild(row2);
      stageList.appendChild(box);
    });
  }
  renderStages();
  const stageBtns = h('div', { style: 'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center' });
  stageBtns.appendChild(h('button', { class: 'btn sm ghost', onclick: () => { stages.push({ id: uid(), name: '', done: false, date: '', planStart: '', planEnd: '' }); renderStages(); } }, '+ 添加阶段'));
  // 旧「从模板载入」按钮已移除：统一走下方「载入进度模板…」下拉（带自动排期，避免双入口混淆）
  // 按装修类型载入进度模板：别墅/平层/跃层 按工期自动排期；工装只载入阶段名（时间留空手动填）
  // 注意：用内嵌确认条而非 confirmDialog——后者会整体替换弹窗，导致已填的表单内容全部丢失
  const tplSel = h('select', { title: '载入对应装修类型的进度计划模板', style: 'flex:1;min-width:0;width:auto' },
    [h('option', { value: '' }, '载入进度模板…')].concat(PLAN_TYPES.map((t) => h('option', { value: t.id }, t.label))));
  const tplConfirm = h('div', { style: 'display:none;gap:6px;align-items:center;margin-top:8px;background:rgba(255,206,84,.12);border-radius:10px;padding:8px;flex-wrap:wrap' });
  const tplMsg = h('span', { style: 'flex:1;min-width:0;font-size:var(--g-fs-sm)' }, '');
  const tplYes = h('button', { class: 'btn sm primary' }, '确认替换');
  const tplNo = h('button', { class: 'btn sm ghost' }, '取消');
  tplConfirm.appendChild(tplMsg); tplConfirm.appendChild(tplYes); tplConfirm.appendChild(tplNo);
  let pendingApply = null;
  tplSel.addEventListener('change', () => {
    const id = tplSel.value;
    tplSel.value = '';
    if (!id) return;
    const label = (PLAN_TYPES.find((t) => t.id === id) || {}).label;
    pendingApply = () => {
      const build = (list) => {
        const base = startD.value;
        let cursor = base ? new Date(base + 'T00:00:00') : null;
        stages.length = 0;
        list.forEach((it) => {
          const s = { id: uid(), name: it.name || '', done: false, date: '', planStart: '', planEnd: '' };
          const days = Number(it.days) || 0;
          if (cursor && days > 0) {
            s.planStart = ymd(cursor);
            const end = new Date(cursor); end.setDate(end.getDate() + days - 1);
            s.planEnd = ymd(end);
            cursor = new Date(end); cursor.setDate(cursor.getDate() + 1);
          }
          stages.push(s);
        });
        renderStages();
        if (!base) toast('未填开工日期，已只载入阶段名；填好开工日期后重新载入即可自动排期');
      };
      if (id === 'fitup') {
        getStageTpl().then((tpl) => build(tpl.map((t) => ({ name: t.name || '', days: 0 }))));
      } else {
        getPlanTemplates().then((t) => build(t[id] || []));
      }
    };
    tplMsg.textContent = '载入「' + label + '」进度模板将替换当前全部施工阶段';
    tplConfirm.style.display = 'flex';
  });
  tplYes.addEventListener('click', () => { tplConfirm.style.display = 'none'; if (pendingApply) { const f = pendingApply; pendingApply = null; f(); } });
  tplNo.addEventListener('click', () => { tplConfirm.style.display = 'none'; pendingApply = null; });
  stageBtns.appendChild(tplSel);
  stageBox.appendChild(tplConfirm);
  stageBox.appendChild(stageBtns);
  f.appendChild(stageBox);

  // 预算内计划付款类别（统一分类树：类别与「设置-分类层级」同一数据，下拉按「一级＞二级」展示）
  const planItems = (p.planItems && p.planItems.length)
    ? p.planItems.map((x) => ({ id: x.id || uid(), cat: x.cat || '', amount: Number(x.amount) || 0 }))
    : [];
  let planLib = [];
  const planBox = h('div', { class: 'field' }, [h('label', {}, '预算内计划付款类别（统一分类，设置-分类层级中维护）')]);
  const planList = h('div', { style: 'margin-top:6px' });
  planBox.appendChild(planList);
  const fileInp = h('input', { type: 'file', accept: '.csv,text/csv', style: 'display:none' });
  fileInp.addEventListener('change', (e) => {
    const fl = e.target.files[0];
    if (!fl) return;
    importPlanCsv(fl, planItems).then((n) => { toast('已导入 ' + n + ' 条计划'); renderPlan(); }).catch(() => toast('导入失败，请检查表格格式'));
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
    const avail = (planLib || []).filter((o) => !used.includes(o.value));
    if (avail.length) {
      const sel = h('select', { style: 'flex:1;min-width:0' });
      avail.forEach((o) => sel.appendChild(h('option', { value: o.value }, o.label)));
      const addBtn = h('button', { class: 'btn sm primary', onclick: () => { if (sel.value) { planItems.push({ id: uid(), cat: sel.value, amount: 0 }); renderPlan(); } } }, '添加');
      planList.appendChild(h('div', { style: 'display:flex;gap:6px;align-items:center;margin-top:6px' }, [sel, addBtn]));
    } else if (!planItems.length) {
      planList.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-top:6px' }, '还没有可用分类，请先到「设置 → 分类层级」添加'));
    }
  }
  renderPlan();
  getPlanCatOptions().then((opts) => { planLib = opts; renderPlan(); });
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

// ---------- 表单：记账（对齐参考：大金额+拍照、字段行式、二级分类、账户、成员/商家、时间到分、转账） ----------
async function txForm(presetType, presetProject, existingTx, preset, opts) {
  // existingTx.__copy=true 表示「复制上笔」：预填全部字段但保存为新记录
  // v2.5.0：opts.onSaved(tx) —— 保存后由调用方决定刷新方式（对账单用它们自己的重建流程）
  const srcTx = existingTx || null;
  const isEdit = !!srcTx && !srcTx.__copy;
  let type = presetType || (srcTx && srcTx.type) || (preset && preset.type) || 'expense';
  const [projects, parties, accounts, catTree] = await Promise.all([
    Projects.all(), Parties.all(), getAccounts(), getCatTree()
  ]);

  const f = h('div');
  const seg = h('div', { class: 'seg', style: 'margin-bottom:14px' });
  const bEx = h('button', { class: type === 'expense' ? 'on' : '', onclick: () => setType('expense') }, '支出');
  const bIn = h('button', { class: type === 'income' ? 'on' : '', onclick: () => setType('income') }, '收入');
  const bTr = h('button', { class: type === 'transfer' ? 'on' : '', onclick: () => setType('transfer') }, '转账');
  seg.appendChild(bEx); seg.appendChild(bIn); seg.appendChild(bTr);
  f.appendChild(seg);

  // v2.3.0：记账弹窗内嵌「常用模板」快捷入口（此前模板只在首页有，记一笔时要先退回首页）
  const tpls = await getTemplates();
  if (tpls.length && !isEdit) {
    const tplBox = h('div', { style: 'margin-bottom:12px' });
    tplBox.appendChild(h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-bottom:6px' }, '常用模板（点击套用）'));
    const tplChips = h('div', { class: 'chips' });
    tpls.forEach((tp) => {
      tplChips.appendChild(h('button', { class: 'chip', title: '套用模板', onclick: () => {
        if (tp.type && tp.type !== type) setType(tp.type);
        if (tp.amount) amount.value = String(tp.amount);
        if (tp.category) {
          if ((tp.type || type) === 'income') { if (subTypeSel) subTypeSel.value = tp.category; }
          else if (catSel) catSel.value = tp.category;
        }
        if (tp.account && acctSel) acctSel.value = tp.account;
        if (tp.note && noteSel) noteSel.value = tp.note;
        toast('已套用模板「' + (tp.name || '') + '」');
      } }, tp.name + (tp.amount ? ' · ' + M(tp.amount) : '')));
    });
    tplBox.appendChild(tplChips);
    f.appendChild(tplBox);
  }

  // ---- 金额大字 + 拍照 ----
  const amount = h('input', { class: 'amt-input', type: 'number', inputmode: 'decimal', placeholder: '0.00' });
  const fileInp = h('input', { type: 'file', accept: 'image/*', capture: 'environment', style: 'display:none' });
  const thumb = h('img', { class: 'thumb', style: 'display:none;margin-top:6px' });
  let photoFile = null;
  let keepAttachId = isEdit ? (srcTx.attachmentId || null) : null;
  fileInp.addEventListener('change', (e) => {
    const fl = e.target.files[0];
    if (fl) { photoFile = fl; thumb.src = URL.createObjectURL(fl); thumb.style.display = 'block'; keepAttachId = null; }
  });
  const camBtn = h('button', { class: 'cam-btn', onclick: () => fileInp.click() }, '📷 拍照');
  f.appendChild(h('div', { class: 'amount-box' }, [
    h('div', { class: 'amount-wrap' }, [h('span', { class: 'amt-cur' }, '¥'), amount]),
    h('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:6px' }, [camBtn, fileInp, thumb])
  ]));

  // ---- 字段行区 ----
  const rows = h('div', { class: 'rows' });
  f.appendChild(rows);

  let projSel, catSel, subSel, acctSel, memberSel, merchSel, dtSel, noteSel;
  let subTypeSel, invSel, invTypeSel, taxSel, fromSel, toSel, planSel, regionSel, tradeSel, matSel, newPartySel;
  let actBox = null;

  function sel(options, value) {
    const s = h('select', { class: 'ctl' }, options);
    if (value != null) s.value = value;
    return s;
  }
  function row(icon, label, ctrl, onClear, extra) {
    const right = h('div', { class: 'frow-r' }, [ctrl]);
    if (extra) right.appendChild(extra);
    if (onClear) right.appendChild(h('button', { class: 'frow-x', title: '清除', onclick: onClear }, '×'));
    return h('div', { class: 'frow' }, [
      h('div', { class: 'frow-l' }, [h('span', { class: 'frow-ic' }, icon), h('span', { class: 'frow-k' }, label)]),
      right
    ]);
  }
  function accOptions() {
    return [h('option', { value: '' }, '未选账户')].concat(accounts.map((a) => h('option', { value: a.name }, a.name)));
  }
  function partyOptions(list, emptyLabel) {
    return [h('option', { value: '' }, emptyLabel)].concat(list.map((p) => h('option', { value: p.id }, p.name)));
  }
  function dtValue(t) {
    // v2.6.0：preset.date/preset.time 支持（周期记账「改后入账」预填到期日）
    const d = fmtDate(t && t.date) || (preset && preset.date) || today();
    const tm = (t && t.time) || (preset && preset.time) || nowHm();
    return d + 'T' + tm;
  }
  function micBtn(target) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return h('button', { class: 'mic-btn', title: '语音输入', onclick: () => toast('当前浏览器不支持语音输入') }, '🎤');
    const b = h('button', { class: 'mic-btn', title: '语音输入', onclick: () => {
      try {
        const rec = new SR();
        rec.lang = 'zh-CN'; rec.interimResults = false; rec.maxAlternatives = 1;
        b.textContent = '●'; b.classList.add('on');
        rec.onresult = (ev) => {
          const txt = ev.results[0][0].transcript;
          target.value = (target.value ? target.value + ' ' : '') + txt;
        };
        rec.onerror = () => toast('语音识别失败');
        rec.onend = () => { b.textContent = '🎤'; b.classList.remove('on'); };
        rec.start();
      } catch (e) { toast('语音识别启动失败'); }
    } }, '🎤');
    return b;
  }
  function setType(t) {
    type = t;
    bEx.classList.toggle('on', t === 'expense');
    bIn.classList.toggle('on', t === 'income');
    bTr.classList.toggle('on', t === 'transfer');
    buildRows();
    if (actBox) buildActs();
  }

  function buildRows() {
    rows.innerHTML = '';
    // 旧数据兼容：老支出记录的往来单位没有区分成员/商家，编辑时按类型回填
    const oldParty = srcTx ? parties.find((x) => x.id === srcTx.partyId) : null;
    const oldIsMember = !!oldParty && ['worker', 'manager', 'designer'].indexOf(oldParty.type) >= 0;
    const oldIsMerch = !!oldParty && (oldParty.type === 'supplier' || oldParty.type === 'other');

    projSel = sel([h('option', { value: '' }, '请选择项目')].concat(projects.map((p) => h('option', { value: p.id }, p.name))),
      srcTx ? (srcTx.projectId || '') : (presetProject || ''));
    rows.appendChild(row('📁', '项目', projSel, () => { projSel.value = ''; }));

    if (type === 'transfer') {
      fromSel = sel(accOptions(), srcTx ? (srcTx.fromAccount || '') : ((preset && preset.fromAccount) || ''));
      toSel = sel(accOptions(), srcTx ? (srcTx.toAccount || '') : ((preset && preset.toAccount) || ''));
      rows.appendChild(row('💳', '转出账户', fromSel, () => { fromSel.value = ''; }));
      rows.appendChild(row('💰', '转入账户', toSel, () => { toSel.value = ''; }));
      dtSel = h('input', { class: 'ctl', type: 'datetime-local', value: dtValue(existingTx) });
      rows.appendChild(row('🕐', '时间', dtSel));
      noteSel = h('textarea', { class: 'ctl', rows: 2 }, srcTx ? (srcTx.note || '') : ((preset && preset.note) || ''));
      rows.appendChild(row('📝', '备注', noteSel, null, micBtn(noteSel)));
      return;
    }

    if (type === 'income') {
      subTypeSel = sel(INCOME_TYPES.map((x) => h('option', {}, x)), srcTx ? (srcTx.subType || INCOME_TYPES[0]) : ((preset && preset.subType) || INCOME_TYPES[0]));
      rows.appendChild(row('📌', '款项类型', subTypeSel));
      const clients = parties.filter((p) => p.type === 'client');
      memberSel = sel(partyOptions(clients, '选择客户'), srcTx ? (srcTx.partyId || '') : ((preset && preset.memberId) || ''));
      rows.appendChild(row('👤', '客户', memberSel, () => { memberSel.value = ''; }));
      acctSel = sel(accOptions(), srcTx ? (srcTx.account || srcTx.method || '') : ((preset && preset.account) || ''));
      rows.appendChild(row('💳', '账户', acctSel, () => { acctSel.value = ''; }));
      invSel = sel([h('option', {}, '未开'), h('option', {}, '已开')], srcTx ? (srcTx.invoiceStatus || '未开') : '未开');
      rows.appendChild(row('🧾', '开票状态', invSel));
      invTypeSel = sel([h('option', {}, '普票'), h('option', {}, '专票'), h('option', {}, '—')], srcTx ? (srcTx.invoiceType || '普票') : '普票');
      rows.appendChild(row('📄', '发票类型', invTypeSel));
      taxSel = h('input', { class: 'ctl', type: 'number', inputmode: 'decimal', placeholder: '选填' });
      taxSel.value = srcTx && srcTx.taxAmount ? srcTx.taxAmount : '';
      rows.appendChild(row('💴', '税额（元）', taxSel, () => { taxSel.value = ''; }));
      dtSel = h('input', { class: 'ctl', type: 'datetime-local', value: dtValue(existingTx) });
      rows.appendChild(row('🕐', '时间', dtSel));
      noteSel = h('textarea', { class: 'ctl', rows: 2 }, srcTx ? (srcTx.note || '') : ((preset && preset.note) || ''));
      rows.appendChild(row('📝', '备注', noteSel, null, micBtn(noteSel)));
      return;
    }

    // 支出
    const firstCat = catTree.length ? catTree[0].name : '材料费';
    catSel = sel(catTree.map((c) => h('option', { value: c.name }, c.name)), srcTx ? (srcTx.category || firstCat) : ((preset && preset.category) || firstCat));
    subSel = sel([]);
    function fillSubs() {
      const c = catTree.find((x) => x.name === catSel.value);
      const subs = (c && c.subs) || [];
      subSel.innerHTML = '';
      subSel.appendChild(h('option', { value: '' }, '（不选）'));
      subs.forEach((s) => subSel.appendChild(h('option', { value: s.name }, s.name)));
      if (srcTx && srcTx.subCat) subSel.value = srcTx.subCat;
    }
    fillSubs();
    catSel.addEventListener('change', fillSubs);
    const catWrap = h('div', { class: 'ctl-row' }, [catSel, h('span', { class: 'ctl-sep' }, '＞'), subSel]);
    rows.appendChild(row('🗂', '分类', catWrap, () => { catSel.value = ''; subSel.value = ''; }));

    acctSel = sel(accOptions(), srcTx ? (srcTx.account || srcTx.method || '') : ((preset && preset.account) || ''));
    rows.appendChild(row('💳', '账户', acctSel, () => { acctSel.value = ''; }));

    const members = parties.filter((p) => ['worker', 'manager', 'designer'].indexOf(p.type) >= 0);
    memberSel = sel(partyOptions(members, '选择成员'), srcTx ? (srcTx.memberId || (oldIsMember ? oldParty.id : '')) : ((preset && preset.memberId) || ''));
    rows.appendChild(row('👷', '成员', memberSel, () => { memberSel.value = ''; }));

    const merchs = parties.filter((p) => p.type === 'supplier' || p.type === 'other');
    merchSel = sel(partyOptions(merchs, '选择商家'), srcTx ? (srcTx.merchantId || (oldIsMerch ? oldParty.id : '')) : ((preset && preset.merchantId) || ''));
    rows.appendChild(row('🏪', '商家', merchSel, () => { merchSel.value = ''; }));

    newPartySel = h('input', { class: 'ctl', placeholder: '或新建往来单位名称' });
    rows.appendChild(row('➕', '新建单位', newPartySel));

    regionSel = sel([h('option', {}, '—')].concat(REGIONS.map((x) => h('option', {}, x))), srcTx ? (srcTx.region || '—') : ((preset && preset.region) || '—'));
    rows.appendChild(row('📍', '施工区域', regionSel));
    tradeSel = sel([h('option', {}, '—')].concat(TRADES.map((x) => h('option', {}, x))), srcTx ? (srcTx.trade || '—') : ((preset && preset.trade) || '—'));
    rows.appendChild(row('🛠', '工种', tradeSel));
    matSel = h('input', { class: 'ctl', placeholder: '如：瓷砖/电线/腻子' });
    matSel.value = srcTx ? (srcTx.material || '') : ((preset && preset.material) || '');
    rows.appendChild(row('📦', '材料大类', matSel));

    planSel = sel([h('option', { value: '' }, '不计入计划/未选')]);
    async function fillPlan() {
      planSel.innerHTML = '';
      planSel.appendChild(h('option', { value: '' }, '不计入计划/未选'));
      const pid = projSel.value;
      if (pid) {
        const pp = await Projects.get(pid);
        ((pp && pp.planItems) || []).forEach((it) => {
          planSel.appendChild(h('option', { value: it.id }, it.cat + (it.amount ? '（计划' + it.amount + '）' : '')));
        });
      }
      if (srcTx && srcTx.planCat) planSel.value = srcTx.planCat;
    }
    fillPlan();
    projSel.addEventListener('change', fillPlan);
    rows.appendChild(row('🧮', '预算计划', planSel, () => { planSel.value = ''; }));

    dtSel = h('input', { class: 'ctl', type: 'datetime-local', value: dtValue(existingTx) });
    rows.appendChild(row('🕐', '时间', dtSel));
    noteSel = h('textarea', { class: 'ctl', rows: 2 }, srcTx ? (srcTx.note || '') : ((preset && preset.note) || ''));
    rows.appendChild(row('📝', '备注', noteSel, null, micBtn(noteSel)));
  }

  buildRows();
  amount.value = srcTx ? (srcTx.amount || '') : ((preset && preset.amount) || '');

  // 连续记账：保存成功后弹窗不关、清空可继续记，顶部显示本次累计
  let savedCount = 0, savedSum = 0;
  const savedBadge = h('div', { style: 'display:none;font-size:var(--g-fs-md);text-align:center;margin-top:12px;padding:8px 10px;border-radius:10px;background:rgba(76,175,120,.12);color:var(--income)' });
  f.appendChild(savedBadge);
  function updateSaved() {
    if (!savedCount) { savedBadge.style.display = 'none'; return; }
    savedBadge.style.display = 'block';
    savedBadge.textContent = '✅ 本次已连续记录 ' + savedCount + ' 笔 · 合计 ' + fmtMoney(savedSum) + '。可继续填写下一笔，或点下方「完成」关闭';
  }

  if (keepAttachId) {
    const url = await attURL(keepAttachId);
    if (url) { thumb.src = url; thumb.style.display = 'block'; }
  }

  const doSave = async () => {
    const pid = projSel.value;
    if (!pid) { toast('请先选择项目'); return; }
    const amt = Number(amount.value);
    if (!amt || amt <= 0) { toast('请输入正确金额'); return; }
    const t = {
      id: isEdit ? srcTx.id : uid(),
      projectId: pid, type,
      amount: amt,
      date: dtSel.value ? dtSel.value.slice(0, 10) : today(),
      time: dtSel.value ? dtSel.value.slice(11, 16) : '',
      note: noteSel ? noteSel.value.trim() : '',
      createdAt: isEdit ? (srcTx.createdAt || Date.now()) : Date.now()
    };
    if (type === 'transfer') {
      if (!fromSel.value || !toSel.value) { toast('请选择转出与转入账户'); return; }
      if (fromSel.value === toSel.value) { toast('转出与转入账户不能相同'); return; }
      t.fromAccount = fromSel.value; t.toAccount = toSel.value;
      t.account = fromSel.value; t.method = fromSel.value;
    } else if (type === 'income') {
      t.subType = subTypeSel.value;
      t.invoiceStatus = invSel.value; t.invoiceType = invTypeSel.value;
      t.taxAmount = Number(taxSel.value) || 0;
      t.account = acctSel.value; t.method = acctSel.value;
      let cid = memberSel.value;
      if (!cid && srcTx && srcTx.partyId) cid = srcTx.partyId;
      const cp = parties.find((x) => x.id === cid);
      t.partyId = cid || '';
      t.partyName = cp ? cp.name : (srcTx ? (srcTx.partyName || '') : '');
    } else {
      t.category = catSel.value; t.subCat = subSel.value;
      t.account = acctSel.value; t.method = acctSel.value;
      t.region = regionSel.value; t.trade = tradeSel.value; t.material = matSel.value.trim();
      t.planCat = planSel ? planSel.value : '';
      const mid = memberSel.value, sid = merchSel.value;
      const mp = parties.find((x) => x.id === mid);
      const sp = parties.find((x) => x.id === sid);
      t.memberId = mid || ''; t.memberName = mp ? mp.name : '';
      t.merchantId = sid || ''; t.merchantName = sp ? sp.name : '';
      let partyId = sid || mid || '';
      let partyName = sp ? sp.name : (mp ? mp.name : '');
      const newName = newPartySel.value.trim();
      if (newName) {
        const np = { id: uid(), name: newName, type: 'supplier', createdAt: Date.now() };
        await Parties.save(np); partyId = np.id; partyName = newName;
      } else if (!partyId && srcTx && srcTx.partyId) {
        partyId = srcTx.partyId; partyName = srcTx.partyName || '';
      }
      t.partyId = partyId; t.partyName = partyName;
    }
    // v2.5.0：编辑前重读库里最新记录。用打开表单时的陈旧快照直接写回，
    // 会把期间（另一台设备 / 详情面板快改 / 批量操作）产生过的改动覆盖掉。
    let freshSrc = null;
    if (isEdit) {
      freshSrc = await Transactions.get(srcTx.id);
      if (!freshSrc) { toast('该流水已被删除，无法修改'); closeModal(); render(); return; }
    }
    const pf = photoFile;
    if (pf) {
      const oldAtt = (freshSrc || existingTx || {}).attachmentId;
      if (isEdit && oldAtt) Attachments.remove(oldAtt);
      t.attachmentId = await Attachments.save(pf, pf.type);
    } else {
      // 未换图：以库里最新记录为准兜住附件，避免把别人新传的凭证抹掉
      const keep = (freshSrc && freshSrc.attachmentId) || keepAttachId || (existingTx && existingTx.attachmentId);
      if (keep) t.attachmentId = keep;
    }
    // 清掉其它类型的专属字段 + 保留表单未管理的字段，统一由内核合并
    const finalTx = mergeTxKeepUnknown(freshSrc, t);
    Transactions.save(finalTx).then(async () => {
      await budgetAlertAfterSave(finalTx); // P2：支出即时预算预警（超支/接近阈值）
      if (isEdit || srcTx) {
        closeModal(); toast(isEdit ? '已更新' : '已记录');
        if (opts && opts.onSaved) opts.onSaved(finalTx); else render();
        return;
      }
      // 新建：连续记账模式——弹窗不关，清空金额/备注/照片继续记
      savedCount++; savedSum += amt;
      amount.value = ''; if (noteSel) noteSel.value = '';
      photoFile = null; thumb.style.display = 'none'; keepAttachId = null; fileInp.value = '';
      if (newPartySel) newPartySel.value = '';
      updateSaved();
      buildActs();
      toast('已记录（第 ' + savedCount + ' 笔）');
      render();
    });
  };

  const save = h('button', { class: 'btn primary', onclick: doSave }, isEdit ? '保存修改' : '保存');
  actBox = h('div', { style: 'display:flex;flex-direction:column;gap:10px;width:100%' });
  function buildActs() {
    actBox.innerHTML = '';
    actBox.appendChild(save);
    const subBtns = [];
    if (savedCount > 0) {
      subBtns.push(h('button', { class: 'btn ghost', onclick: () => closeModal() }, '完成（已记 ' + savedCount + ' 笔）'));
    }
    if (type !== 'transfer') {
      subBtns.push(h('button', { class: 'btn ghost', onclick: () => { setType('transfer'); toast('已切换为转账，请选择转出/转入账户'); } }, '改为转账'));
    }
    if (isEdit) {
      subBtns.push(h('button', { class: 'btn danger', onclick: () => {
        confirmDialog('删除这笔记账？可在「设置 → 数据安全 → 回收站」30 天内还原。', () => {
          // v2.0.0：必须取完整记录再入回收站，否则还原的是残缺数据
          Transactions.get(existingTx.id)
            .then((full) => Transactions.remove(full || existingTx))
            .then(() => { toast('已删除，可在回收站还原'); render(); });
        }, '删除');
      } }, '删除'));
    }
    if (subBtns.length) actBox.appendChild(h('div', { style: 'display:flex;gap:10px' }, subBtns));
  }
  buildActs();
  openModal(isEdit ? '编辑记账' : '记一笔', f, [actBox]);
}

// ---------- 表单：记账模板（完整维度） ----------
async function templateForm(tp, onSaved) {
  const [accounts, catTree, parties] = await Promise.all([getAccounts(), getCatTree(), Parties.all()]);
  const f = h('div');
  const name = field(f, '模板名称', h('input', { value: tp.name || '', placeholder: '如：老张木工日结' }));
  const typeWrap = h('div', { class: 'field' }, [h('label', {}, '类型')]);
  const seg = h('div', { class: 'seg' });
  const bEx = h('button', { class: tp.type !== 'income' ? 'on' : '', onclick: () => { tp.type = 'expense'; bEx.classList.add('on'); bIn.classList.remove('on'); } }, '支出');
  const bIn = h('button', { class: tp.type === 'income' ? 'on' : '', onclick: () => { tp.type = 'income'; bIn.classList.add('on'); bEx.classList.remove('on'); } }, '收入');
  seg.appendChild(bEx); seg.appendChild(bIn);
  typeWrap.appendChild(seg); f.appendChild(typeWrap);
  const amount = field(f, '金额（0=每次手动填）', h('input', { type: 'number', inputmode: 'decimal', value: tp.amount || '' }));
  const cat = field(f, '分类（支出）/ 款项类型（收入）', h('input', { value: tp.category || '', placeholder: '如：材料费 / 进度款' }));
  const acct = field(f, '账户', (() => {
    const s = h('select', {}, [h('option', { value: '' }, '不预设')].concat(accounts.map((a) => h('option', { value: a.name }, a.name))));
    if (tp.account) s.value = tp.account;
    return s;
  })());
  const members = parties.filter((p) => ['worker', 'manager', 'designer'].indexOf(p.type) >= 0);
  const member = field(f, '成员（工人/经理/设计师）', (() => {
    const s = h('select', {}, [h('option', { value: '' }, '不预设')].concat(members.map((p) => h('option', { value: p.id }, p.name))));
    if (tp.memberId) s.value = tp.memberId;
    return s;
  })());
  const merchs = parties.filter((p) => p.type === 'supplier' || p.type === 'other');
  const merchant = field(f, '商家（供应商）', (() => {
    const s = h('select', {}, [h('option', { value: '' }, '不预设')].concat(merchs.map((p) => h('option', { value: p.id }, p.name))));
    if (tp.merchantId) s.value = tp.merchantId;
    return s;
  })());
  const note = field(f, '备注', h('textarea', { rows: 2 }, tp.note || ''));
  const save = h('button', { class: 'btn primary', onclick: () => {
    tp.name = name.value.trim(); if (!tp.name) { toast('请填模板名称'); return; }
    tp.amount = Number(amount.value) || 0;
    tp.category = cat.value.trim();
    tp.account = acct.value; tp.memberId = member.value; tp.merchantId = merchant.value;
    tp.note = note.value.trim();
    Meta.get('txTemplates', []).then((list) => {
      const idx = list.findIndex((x) => x.id === tp.id);
      if (idx >= 0) list[idx] = tp; else list.push(tp);
      Meta.set('txTemplates', list).then(() => { closeModal(); toast('已保存模板'); if (onSaved) onSaved(); });
    });
  } }, '保存模板');
  const cancel = h('button', { class: 'btn ghost', onclick: () => { if (onSaved) onSaved(); closeModal(); } }, '取消');
  openModal('编辑记账模板', f, [cancel, save]);
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
// v2.1.0：preset 可预填 { title, kind, amount, dueDate }（回款看板「加催收提醒」用）
function reminderForm(projectId, existing, preset) {
  const isEdit = !!existing;
  const r = existing ? Object.assign({}, existing) : Object.assign({ id: uid(), projectId, kind: 'receive', done: false }, preset || {});
  const f = h('div');
  const seg = h('div', { class: 'seg' });
  const bR = h('button', { class: r.kind === 'receive' ? 'on' : '', onclick: () => { r.kind = 'receive'; bR.classList.add('on'); bP.classList.remove('on'); } }, '收款');
  const bP = h('button', { class: r.kind === 'pay' ? 'on' : '', onclick: () => { r.kind = 'pay'; bP.classList.add('on'); bR.classList.remove('on'); } }, '付款');
  seg.appendChild(bR); seg.appendChild(bP);
  f.appendChild(h('div', { class: 'field' }, [h('label', {}, '节点类型'), seg]));
  const title = field(f, '名称（如：二期进度款）', h('input', { value: r.title || '', placeholder: '选填' }));
  const due = field(f, '约定日期', h('input', { type: 'date', value: fmtDate(r.dueDate) || today() }));
  const amount = field(f, '金额（元，选填）', h('input', { type: 'number', inputmode: 'decimal', value: r.amount || '' }));
  const save = h('button', { class: 'btn primary', onclick: () => {
    r.title = title.value.trim(); r.dueDate = due.value; r.amount = Number(amount.value) || 0;
    Reminders.save(r).then(() => { closeModal(); toast(isEdit ? '已更新节点' : '已添加节点'); render(); });
  } }, isEdit ? '保存修改' : '保存');
  const cancel = h('button', { class: 'btn ghost', onclick: () => closeModal() }, '取消');
  openModal(isEdit ? '编辑收付款节点' : '添加收付款节点', f, [cancel, save]);
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

// ---------- P2：本地通知 + 超支预警引擎 ----------
let _swReg = null; // undefined=未探测, false=不可用, Promise=注册中
function ensureSW() {
  if (_swReg !== null) return Promise.resolve(_swReg === false ? null : _swReg);
  if (typeof navigator === 'undefined' || !navigator.serviceWorker || !/^https?:/.test(location.protocol)) {
    _swReg = false;
    return Promise.resolve(null);
  }
  _swReg = navigator.serviceWorker.register('./sw.js').then((reg) => reg).catch(() => false);
  return _swReg.then((reg) => (reg === false ? null : reg));
}

// 通知去重日志（每设备/每节点/每天最多提醒一次）
function notifLog() {
  try { return JSON.parse(localStorage.getItem('notifyLog') || '{}') || {}; } catch (e) { return {}; }
}
function notifMark(key) {
  try {
    const m = notifLog(); m[key] = today();
    // 只保留 60 天，防止无限膨胀
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
    Object.keys(m).forEach((k) => { if (m[k] < cutoff.toISOString().slice(0, 10)) delete m[k]; });
    localStorage.setItem('notifyLog', JSON.stringify(m));
  } catch (e) { /* 隐私模式等场景忽略 */ }
}

// 弹系统通知：优先走 Service Worker（App 在后台也能弹），无 SW 时退回页面内 Notification
async function showNotif(title, body, tag, pid) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;
  const reg = await ensureSW();
  try {
    if (reg) {
      await reg.showNotification(title, {
        body: body, tag: tag || 'decor', icon: './icon.svg', badge: './icon.svg',
        data: { pid: pid || '' }
      });
    } else {
      const n = new Notification(title, { body: body, tag: tag || 'decor', icon: './icon.svg' });
      n.onclick = () => { try { window.focus(); } catch (e) {} if (pid) location.hash = '#/project/' + pid; };
    }
    return true;
  } catch (e) { return false; }
}

function addDaysStr(d, n) {
  const x = new Date(d + 'T00:00:00');
  x.setDate(x.getDate() + n);
  return x.getFullYear() + '-' + pad2(x.getMonth() + 1) + '-' + pad2(x.getDate());
}
function daysDiff(a, b) { return Math.round((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 864e5); }

// 收付款节点提醒：检查 未完成 && 约定日 <= 今天+提前天数，逐条弹通知（每天每节点一次）
async function notifyDueReminders() {
  try {
    const enabled = await Meta.get('notifyEnabled', true);
    if (!enabled) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const [rems, projects] = await Promise.all([Reminders.all(), Projects.all()]);
    const remindDays = Number(await Meta.get('remindDays', 3)) || 0;
    const td = today();
    const limit = addDaysStr(td, remindDays);
    const due = rems
      .filter((r) => !r.done && r.dueDate && r.dueDate <= limit)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    let shown = 0;
    for (const r of due) {
      const key = r.id + '|' + r.dueDate;
      if (notifLog()[key] === td) continue;
      if (shown >= 5) break; // 一次最多弹 5 条，防止轰炸
      const p = projects.find((x) => x.id === r.projectId);
      const d = daysDiff(r.dueDate, td);
      const when = d < 0 ? '已逾期 ' + (-d) + ' 天' : (d === 0 ? '今天到期' : d + ' 天后到期');
      const head = d < 0 ? '⏰ 逾期' + (r.kind === 'receive' ? '收款' : '付款') : (r.kind === 'receive' ? '💰 收款提醒' : '💸 付款提醒');
      const body = (p ? p.name : '未关联项目') + ' · ' + (r.title || '收付款节点') + ' · ' + when + (r.amount ? ' · ' + fmtMoney(r.amount) : '');
      const ok = await showNotif(head, body, 'rem-' + r.id, r.projectId);
      if (ok) { notifMark(key); shown++; }
    }
  } catch (e) { /* 后台检查失败不打扰用户 */ }
}

// 预算预警计算：总成本预算 + 各计划类别，返回 [{p, level, kind, cat, msg, ratio}]
async function budgetWarnings() {
  const [projects, txs] = await Promise.all([Projects.all(), Transactions.all()]);
  const pct = (Number(await Meta.get('budgetAlertPct', 80)) || 80) / 100;
  const out = [];
  projects.filter((p) => p.status !== 'settled').forEach((p) => {
    const pt = txs.filter((t) => t.projectId === p.id);
    let spent = 0;
    pt.forEach((t) => { if (isExpense(t)) spent += Number(t.amount) || 0; });
    const budget = Number(p.costBudget) || 0;
    if (budget > 0) {
      const ratio = spent / budget;
      if (ratio >= 1) out.push({ p, level: 'over', kind: 'total', cat: '', msg: '总支出 ' + M(spent) + ' 已超成本预算 ' + M(budget), ratio });
      else if (ratio >= pct) out.push({ p, level: 'near', kind: 'total', cat: '', msg: '总支出已达成本预算 ' + Math.round(ratio * 100) + '%（' + M(spent) + '/' + M(budget) + '）', ratio });
    }
    (p.planItems || []).forEach((it) => {
      const plan = Number(it.amount) || 0;
      if (plan <= 0) return;
      const s = pt.filter((t) => t.type === 'expense' && t.planCat === it.id).reduce((a, t) => a + (Number(t.amount) || 0), 0);
      const ratio = s / plan;
      if (ratio >= 1) out.push({ p, level: 'over', kind: 'plan', cat: it.cat || '未命名', msg: '计划类别「' + (it.cat || '未命名') + '」已超支 ' + M(s - plan), ratio });
      else if (ratio >= pct) out.push({ p, level: 'near', kind: 'plan', cat: it.cat || '未命名', msg: '计划类别「' + (it.cat || '未命名') + '」已用 ' + Math.round(ratio * 100) + '%', ratio });
    });
  });
  return out;
}

// 通知超支预警（每天每项目每级别最多一次）
async function notifyBudgetWarnings() {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const warns = await budgetWarnings();
    const overs = warns.filter((w) => w.level === 'over');
    if (!overs.length) return;
    const td = today();
    let shown = 0;
    for (const w of overs) {
      const key = 'budget|' + w.p.id + '|' + w.kind + '|' + (w.cat || '') + '|' + td;
      if (notifLog()[key] === td) continue;
      const ok = await showNotif('⚠️ 预算超支预警', w.p.name + ' · ' + w.msg, 'budget-' + w.p.id + '-' + w.kind + '-' + (w.cat || ''), w.p.id);
      if (ok) { notifMark(key); shown++; }
      if (shown >= 3) break;
    }
  } catch (e) { /* ignore */ }
}

// 工期预警：未完成阶段的预计结束时间 已逾期/临近（提前天数 meta.stageAlertDays 默认 3）
async function stageWarnings() {
  const projects = await Projects.all();
  const alertDays = Number(await Meta.get('stageAlertDays', 3)) || 0;
  const td = today();
  const out = [];
  projects.filter((p) => p.status !== 'settled').forEach((p) => {
    (p.stages || []).forEach((s) => {
      if (s.done || !s.planEnd) return;
      const d = daysDiff(s.planEnd, td); // 负数 = 已逾期
      if (d < 0) out.push({ p, s, level: 'over', msg: '「' + (s.name || '未命名阶段') + '」已逾期 ' + (-d) + ' 天（原计划 ' + fmtDate(s.planEnd) + ' 完成）' });
      else if (d <= alertDays) out.push({ p, s, level: 'near', msg: '「' + (s.name || '未命名阶段') + '」' + (d === 0 ? '今天' : '还有 ' + d + ' 天') + '到预计完成日（' + fmtDate(s.planEnd) + '）' });
    });
  });
  return out;
}

// 通知工期预警（每天每阶段最多一次）
async function notifyStageWarnings() {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const warns = await stageWarnings();
    if (!warns.length) return;
    const td = today();
    let shown = 0;
    for (const w of warns) {
      const key = 'stage|' + w.p.id + '|' + w.s.id + '|' + td;
      if (notifLog()[key] === td) continue;
      const head = w.level === 'over' ? '⏰ 工期逾期预警' : '⏰ 工期临近提醒';
      const ok = await showNotif(head, w.p.name + ' · ' + w.msg, 'stage-' + w.s.id, w.p.id);
      if (ok) { notifMark(key); shown++; }
      if (shown >= 3) break;
    }
  } catch (e) { /* ignore */ }
}

// 记支出后即时预警（toast 必弹 + 系统通知每日一次）
async function budgetAlertAfterSave(t) {
  try {
    if (!t || t.type !== 'expense') return;
    const p = await Projects.get(t.projectId);
    if (!p) return;
    const txs = await Transactions.byProject(t.projectId);
    const spent = txs.filter((x) => isExpense(x)).reduce((a, x) => a + (Number(x.amount) || 0), 0);
    const budget = Number(p.costBudget) || 0;
    const msgs = [];
    if (budget > 0) {
      if (spent > budget) msgs.push('总支出 ' + M(spent) + ' 已超成本预算 ' + M(budget) + '（超 ' + M(spent - budget) + '）');
      else if (spent >= budget * 0.8) msgs.push('总支出已达成本预算 ' + Math.round((spent / budget) * 100) + '%');
    }
    if (t.planCat) {
      const it = (p.planItems || []).find((x) => x.id === t.planCat);
      if (it) {
        const plan = Number(it.amount) || 0;
        const s = txs.filter((x) => x.type === 'expense' && x.planCat === t.planCat).reduce((a, x) => a + (Number(x.amount) || 0), 0);
        if (plan > 0 && s > plan) msgs.push('计划类别「' + (it.cat || '未命名') + '」已超支 ' + M(s - plan));
      }
    }
    msgs.forEach((m) => toast('⚠️ ' + m));
    if (msgs.length) {
      const td = today();
      for (const m of msgs) {
        const lv = m.indexOf('已超') >= 0 ? 'over' : 'near';
        const key = 'save|' + p.id + '|' + lv + '|' + td;
        if (notifLog()[key] === td) continue;
        const ok = await showNotif('⚠️ 预算预警', p.name + ' · ' + m, 'save-' + p.id + '-' + lv, p.id);
        if (ok) notifMark(key);
      }
    }
  } catch (e) { /* ignore */ }
}

// SW 通知点击 → 聚焦 App 并跳到对应项目
function listenNotifyNav() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
  try {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'notify-nav' && e.data.pid) location.hash = '#/project/' + e.data.pid;
    });
  } catch (e) { /* ignore */ }
}

// ---------- 初始化 ----------
function init() {
  // 主题：启动最先应用（渲染前），避免闪色。v1.9.0 定调暖纸账本为默认；旧值 light 自动归入暖纸
  Meta.get('theme', 'paper').then((t) => { document.documentElement.dataset.theme = (t === 'dark') ? 'dark' : 'paper'; }).catch(() => {});
  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => { location.hash = '#/' + t.dataset.route; });
  });
  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '#/home';
  Meta.get('hideMoney', false).then((v) => { state.hideMoney = !!v; render(); }, () => render());
  // 分类统一：启动时把旧「预算计划类别库」并入统一分类树（幂等；恢复旧备份刷新后同样生效）
  migrateCats().then(() => render()).catch(() => {});
  // P2：启动即注册 SW；首次检查 + 每分钟/回到前台时检查到期节点与超支
  ensureSW();
  listenNotifyNav();
  setTimeout(() => { notifyDueReminders(); notifyBudgetWarnings(); notifyStageWarnings(); }, 3000);
  setInterval(() => { if (document.visibilityState === 'visible') { notifyDueReminders(); notifyBudgetWarnings(); notifyStageWarnings(); } }, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { notifyDueReminders(); notifyBudgetWarnings(); notifyStageWarnings(); }
  });
  // v2.0.0：启动维护——清理过期回收站记录 + 距上次快照超 24h 自动存一份（失败不阻塞启动）
  dbMaintain().catch(() => {});
  // v2.6.0：首次启动播种演示账本（IndexedDB 分支；内存模式已在 db.js 同步播种）。
  // 播种是异步的，完成后必须补一次渲染，否则首屏会停留在「空账本」直到用户手动切页。
  ensureFirstRun().then((first) => {
    if (first) { toast('已载入演示数据，可在「我的 → 设置 → 数据安全」清空开始记账'); render(); }
  }).catch(() => {});
}

init();
