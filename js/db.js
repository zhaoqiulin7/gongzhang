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
      try { seedDemo(); } catch (e) { /* ignore */ }
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

// ---------------- 演示数据（仅内存模式） ----------------
function seedDemo() {
  const now = Date.now();
  const P = (o) => memPut('projects', Object.assign({ createdAt: now, updatedAt: now }, o));
  const T = (o) => memPut('transactions', Object.assign({ createdAt: now, attachmentId: null }, o));
  const PA = (o) => memPut('parties', Object.assign({ createdAt: now }, o));
  const R = (o) => memPut('reminders', Object.assign({ createdAt: now, done: false }, o));

  P({ id: 'p1', name: '保利香槟 3-1201 王先生', clientName: '王先生', phone: '138****0011', address: '保利香槟 3栋1201', houseType: '三室两厅', buildArea: 89, constructArea: 89, manager: '老陈', designer: '设计部·林', contractAmount: 80000, costBudget: 60000, startDate: '2026-09-01', endDate: '2026-11-30', status: 'ongoing',
    stages: [ { id: 'p1s1', name: '开工', done: true, date: '2026-09-01', planStart: '2026-09-01', planEnd: '2026-09-02' }, { id: 'p1s2', name: '水电施工', done: true, date: '2026-09-10', planStart: '2026-09-03', planEnd: '2026-09-10' }, { id: 'p1s3', name: '水电验收', done: true, date: '2026-09-18', planStart: '2026-09-11', planEnd: '2026-09-18' }, { id: 'p1s4', name: '泥工进场', done: false, date: '', planStart: '2026-09-19', planEnd: '2026-10-25' }, { id: 'p1s5', name: '木工交底', done: false, date: '', planStart: '2026-10-26', planEnd: '2026-11-15' }, { id: 'p1s6', name: '竣工', done: false, date: '', planStart: '2026-11-16', planEnd: '2026-11-30' } ], planItems: [ { id: 'p1pi1', cat: '泥瓦人工', amount: 30000 }, { id: 'p1pi2', cat: '瓷砖主材', amount: 20000 }, { id: 'p1pi3', cat: '木工人工', amount: 15000 } ] });
  P({ id: 'p2', name: '绿地城 5-802 李女士', clientName: '李女士', phone: '139****0022', address: '绿地城 5栋802', houseType: '四室两厅', buildArea: 120, constructArea: 120, manager: '老陈', designer: '设计部·林', contractAmount: 120000, costBudget: 95000, startDate: '2026-10-10', endDate: '2026-12-20', status: 'ongoing',
    stages: [ { id: 'p2s1', name: '开工', done: false, date: '', planStart: '2026-10-10', planEnd: '2026-10-12' }, { id: 'p2s2', name: '水电施工', done: false, date: '', planStart: '2026-10-13', planEnd: '2026-11-03' }, { id: 'p2s3', name: '水电验收', done: false, date: '', planStart: '2026-11-04', planEnd: '2026-11-10' }, { id: 'p2s4', name: '泥工进场', done: false, date: '', planStart: '2026-11-11', planEnd: '2026-12-05' }, { id: 'p2s5', name: '木工交底', done: false, date: '', planStart: '2026-12-06', planEnd: '2026-12-15' }, { id: 'p2s6', name: '竣工', done: false, date: '', planStart: '2026-12-16', planEnd: '2026-12-20' } ], planItems: [ { id: 'p2pi1', cat: '水电材料', amount: 25000 }, { id: 'p2pi2', cat: '泥瓦人工', amount: 40000 } ] });

  PA({ id: 'pa1', name: '佛山瓷砖批发·陈老板', type: 'supplier', phone: '', note: '主材供应商', payStatus: 'unpaid' });
  PA({ id: 'pa2', name: '木工·老张', type: 'worker', phone: '', note: '木工班组', payStatus: 'paid' });
  PA({ id: 'pa3', name: '王先生', type: 'client', phone: '138****0011', note: '保利香槟业主' });
  PA({ id: 'pa4', name: '施工经理·老陈', type: 'manager', phone: '', note: '现场施工管理', payStatus: 'unpaid' });
  PA({ id: 'pa5', name: '设计师·林工', type: 'designer', phone: '', note: '设计部', payStatus: 'reconciled' });

  T({ id: 't1', projectId: 'p1', type: 'income', subType: '首付款', amount: 40000, date: '2026-09-05', time: '10:20', method: '微信', account: '微信', partyId: 'pa3', partyName: '王先生', note: '开工首付', invoiceStatus: '已开', invoiceType: '普票', taxAmount: 0 });
  T({ id: 't2', projectId: 'p1', type: 'income', subType: '进度款', amount: 20000, date: '2026-10-08', time: '15:40', method: '银行转账', account: '银行转账', partyId: 'pa3', partyName: '王先生', note: '水电完工进度款', invoiceStatus: '未开', invoiceType: '普票', taxAmount: 0 });
  T({ id: 't3', projectId: 'p1', type: 'expense', category: '材料费', subCat: '主材', amount: 12000, date: '2026-09-20', time: '09:30', method: '银行转账', account: '银行转账', partyId: 'pa1', partyName: '佛山瓷砖批发·陈老板', region: '厨卫', trade: '泥瓦', material: '瓷砖', note: '卫生间+厨房瓷砖' });
  T({ id: 't4', projectId: 'p1', type: 'expense', category: '人工费', subCat: '木工', amount: 8000, date: '2026-10-12', time: '17:05', method: '现金', account: '现金', partyId: 'pa2', partyName: '木工·老张', region: '全屋', trade: '木工', material: '', note: '全屋吊顶木工' });
  T({ id: 't5', projectId: 'p2', type: 'expense', category: '材料费', subCat: '主材', amount: 20000, date: '2026-10-15', time: '11:12', method: '银行转账', account: '银行转账', partyId: 'pa1', partyName: '佛山瓷砖批发·陈老板', region: '客厅', trade: '泥瓦', material: '地砖', note: '客厅地砖' });
  T({ id: 't6', projectId: 'p1', type: 'expense', category: '管理费', subCat: '管理人员', amount: 3000, date: '2026-10-20', time: '09:00', method: '现金', account: '现金', partyId: 'pa4', partyName: '施工经理·老陈', region: '全屋', trade: '其他', material: '', note: '施工管理费' });
  T({ id: 't7', projectId: 'p1', type: 'expense', category: '管理费', subCat: '设计费', amount: 5000, date: '2026-10-22', time: '14:30', method: '银行转账', account: '银行转账', partyId: 'pa5', partyName: '设计师·林工', region: '全屋', trade: '其他', material: '', note: '设计费' });
  T({ id: 't8', projectId: 'p1', type: 'transfer', amount: 5000, date: '2026-10-23', time: '10:10', method: '银行转账', account: '银行转账', fromAccount: '银行转账', toAccount: '现金', note: '从银行转现金备用金' });

  R({ id: 'r1', projectId: 'p1', kind: 'receive', title: '尾款催收', amount: 20000, dueDate: '2026-11-25', note: '竣工验收后收尾款' });
  R({ id: 'r2', projectId: 'p1', kind: 'pay', title: '瓷砖尾款', amount: 5000, dueDate: '2026-11-02', note: '付陈老板瓷砖尾款' });

  memPut('meta', { key: 'remindDays', value: 3 });
  memPut('meta', { key: 'stageTemplate', value: [ { id: 's1', name: '开工' }, { id: 's2', name: '水电施工' }, { id: 's3', name: '水电验收' }, { id: 's4', name: '泥工进场' }, { id: 's5', name: '木工交底' }, { id: 's6', name: '竣工' } ] });
  memPut('meta', { key: 'accounts', value: [
    { id: 'acc-1', name: '现金', opening: 0, note: '' },
    { id: 'acc-2', name: '微信', opening: 0, note: '' },
    { id: 'acc-3', name: '支付宝', opening: 0, note: '' },
    { id: 'acc-4', name: '银行转账', opening: 0, note: '公司对公账户' }
  ] });
  memPut('meta', { key: 'catTree', value: [
    { id: 'c1', name: '材料费', subs: [ { id: 'c1-1', name: '辅材' }, { id: 'c1-2', name: '主材' }, { id: 'c1-3', name: '五金' }, { id: 'c1-4', name: '水电材料' }, { id: 'c1-5', name: '瓷砖主材' } ] },
    { id: 'c2', name: '人工费', subs: [ { id: 'c2-1', name: '水电工' }, { id: 'c2-2', name: '泥工' }, { id: 'c2-3', name: '木工' }, { id: 'c2-4', name: '油漆工' }, { id: 'c2-5', name: '安装工' }, { id: 'c2-6', name: '水电人工' }, { id: 'c2-7', name: '泥瓦人工' }, { id: 'c2-8', name: '木工人工' }, { id: 'c2-9', name: '油漆人工' } ] },
    { id: 'c3', name: '分包费', subs: [ { id: 'c3-1', name: '整包' }, { id: 'c3-2', name: '零包' } ] },
    { id: 'c4', name: '管理费', subs: [ { id: 'c4-1', name: '设计费' }, { id: 'c4-2', name: '管理人员' }, { id: 'c4-3', name: '其他' } ] },
    { id: 'c5', name: '其他', subs: [ { id: 'c5-1', name: '其他' }, { id: 'c5-2', name: '垃圾清运' } ] }
  ] });
  memPut('meta', { key: 'txTemplates', value: [
    { id: 'tp1', name: '瓷砖主材', type: 'expense', amount: 0, category: '材料费', note: '' },
    { id: 'tp2', name: '泥工人工', type: 'expense', amount: 0, category: '人工费', note: '' },
    { id: 'tp3', name: '进度款收款', type: 'income', amount: 0, category: '', note: '' }
  ] });
}

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

export { openDB, uid, Projects, Transactions, Parties, Attachments, Reminders, Meta, Trash, Snapshots, exportAll, importAll, dbMaintain };
