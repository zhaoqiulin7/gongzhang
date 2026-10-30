// 数据层：自动在 IndexedDB（手机/正常浏览器，可持久化）与
// 内存模式（受限预览环境，载入演示数据、不保存）之间降级。
// 对外暴露与旧版一致的 API，app.js 无需改动。

const DB_NAME = 'decor-accounting';
const DB_VERSION = 1;

// 各对象仓库定义（keyPath + 索引）
const STORES = {
  projects: { keyPath: 'id', indexes: [] },
  transactions: { keyPath: 'id', indexes: ['byProject', 'byDate'] },
  parties: { keyPath: 'id', indexes: [] },
  attachments: { keyPath: 'id', indexes: [] },
  reminders: { keyPath: 'id', indexes: ['byProject'] },
  meta: { keyPath: 'key', indexes: [] }
};

let backend = null; // 'idb' | 'mem'
let _idb = null;
let _mem = null;
let _ready = null;

function uid() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// ---------------- 内存后端 ----------------
function makeMem() {
  const db = {};
  for (const name in STORES) {
    db[name] = { recs: new Map(), idx: {} };
    STORES[name].indexes.forEach((ix) => { db[name].idx[ix] = new Map(); });
  }
  return db;
}
function memPut(store, value) {
  const st = _mem[store];
  const kp = STORES[store].keyPath;
  const id = value[kp];
  STORES[store].indexes.forEach((ix) => {
    const m = st.idx[ix];
    m.forEach((set, key) => { if (set.has(id)) { set.delete(id); if (set.size === 0) m.delete(key); } });
  });
  st.recs.set(id, value);
  STORES[store].indexes.forEach((ix) => {
    const key = value[ix];
    if (key !== undefined && key !== null) {
      if (!st.idx[ix].has(key)) st.idx[ix].set(key, new Set());
      st.idx[ix].get(key).add(id);
    }
  });
  return value;
}
function memDel(store, id) {
  const st = _mem[store];
  const rec = st.recs.get(id);
  if (!rec) return;
  STORES[store].indexes.forEach((ix) => {
    const key = rec[ix];
    const m = st.idx[ix];
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
    if (typeof indexedDB === 'undefined') { startMem(resolve); return; }
    let settled = false;
    const finish = (mode) => { if (!settled) { settled = true; backend = mode; resolve(); } };
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        for (const name in STORES) {
          if (!db.objectStoreNames.contains(name)) {
            const s = db.createObjectStore(name, { keyPath: STORES[name].keyPath });
            STORES[name].indexes.forEach((ix) => s.createIndex(ix, ix));
          }
        }
      };
      req.onsuccess = () => { _idb = req.result; finish('idb'); };
      req.onerror = () => { startMem(resolve); };
      // 极少数环境下 open 既不成功也不报错（挂起）——加超时兜底
      setTimeout(() => { if (!settled) startMem(resolve); }, 2000);
    } catch (e) {
      // 受限沙箱通常在这里同步抛 SecurityError
      startMem(resolve);
    }
  });
  return _ready;
}
function startMem(resolve) {
  if (backend) { resolve(); return; }
  backend = 'mem';
  _mem = makeMem();
  try { seedDemo(); } catch (e) { /* ignore */ }
  try { showBanner(); } catch (e) { /* ignore */ }
  resolve();
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

  P({ id: 'p1', name: '保利香槟 3-1201 王先生', customer: '王先生', phone: '138****0011', address: '保利香槟 3栋1201', contract: 80000, budget: 60000, startDate: '2026-09-01', endDate: '2026-11-30', status: 'ongoing' });
  P({ id: 'p2', name: '绿地城 5-802 李女士', customer: '李女士', phone: '139****0022', address: '绿地城 5栋802', contract: 120000, budget: 95000, startDate: '2026-10-10', endDate: '2026-12-20', status: 'ongoing' });

  PA({ id: 'pa1', name: '佛山瓷砖批发·陈老板', type: 'supplier', phone: '', note: '主材供应商' });
  PA({ id: 'pa2', name: '木工·老张', type: 'worker', phone: '', note: '木工班组' });
  PA({ id: 'pa3', name: '王先生', type: 'client', phone: '138****0011', note: '保利香槟业主' });

  T({ id: 't1', projectId: 'p1', kind: 'income', txType: '首付', amount: 40000, date: '2026-09-05', method: 'wechat', partyId: 'pa3', partyName: '王先生', note: '开工首付', invoiceState: 'opened', invoiceType: 'common', tax: 0 });
  T({ id: 't2', projectId: 'p1', kind: 'income', txType: '进度款', amount: 20000, date: '2026-10-08', method: 'transfer', partyId: 'pa3', partyName: '王先生', note: '水电完工进度款', invoiceState: 'unopened', invoiceType: '', tax: 0 });
  T({ id: 't3', projectId: 'p1', kind: 'expense', category: '材料费', amount: 12000, date: '2026-09-20', method: 'transfer', partyId: 'pa1', partyName: '佛山瓷砖批发·陈老板', area: '厨卫', trade: '泥瓦', material: '瓷砖', note: '卫生间+厨房瓷砖' });
  T({ id: 't4', projectId: 'p1', kind: 'expense', category: '人工费', amount: 8000, date: '2026-10-12', method: 'cash', partyId: 'pa2', partyName: '木工·老张', area: '全屋', trade: '木工', material: '', note: '全屋吊顶木工' });
  T({ id: 't5', projectId: 'p2', kind: 'expense', category: '材料费', amount: 20000, date: '2026-10-15', method: 'transfer', partyId: 'pa1', partyName: '佛山瓷砖批发·陈老板', area: '客厅', trade: '泥瓦', material: '地砖', note: '客厅地砖' });

  R({ id: 'r1', projectId: 'p1', kind: 'receive', title: '尾款催收', amount: 20000, dueDate: '2026-11-25', note: '竣工验收后收尾款' });
  R({ id: 'r2', projectId: 'p1', kind: 'pay', title: '瓷砖尾款', amount: 5000, dueDate: '2026-11-02', note: '付陈老板瓷砖尾款' });

  memPut('meta', { key: 'remindDays', value: 3 });
}

// ---------------- 对外 API ----------------
const Projects = {
  all: () => getAll('projects').then((list) => list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))),
  get: (id) => get('projects', id),
  save: (p) => { p.updatedAt = Date.now(); return put('projects', p); },
  remove: (id) => Promise.all([queryByIndex('transactions', 'byProject', id), queryByIndex('reminders', 'byProject', id)])
    .then(([txs, rems]) => {
      const tasks = [];
      txs.forEach((t) => { tasks.push(del('transactions', t.id)); if (t.attachmentId) tasks.push(del('attachments', t.attachmentId)); });
      rems.forEach((r) => tasks.push(del('reminders', r.id)));
      tasks.push(del('projects', id));
      return Promise.all(tasks);
    })
};
const Transactions = {
  all: () => getAll('transactions').then((list) => list.sort((a, b) => (b.date || '').localeCompare(a.date || ''))),
  byProject: (projectId) => queryByIndex('transactions', 'byProject', projectId),
  get: (id) => get('transactions', id),
  save: (t) => put('transactions', t),
  remove: (t) => {
    const tasks = [del('transactions', t.id)];
    if (t.attachmentId) tasks.push(del('attachments', t.attachmentId));
    return Promise.all(tasks);
  }
};
const Parties = {
  all: () => getAll('parties').then((list) => list.sort((a, b) => (a.type || '').localeCompare(b.type || ''))),
  get: (id) => get('parties', id),
  save: (p) => put('parties', p),
  remove: (id) => del('parties', id)
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
  set: (key, value) => put('meta', { key, value })
};

function openDB() { return initBackend(); }

// 立即启动后端探测（在受限环境会同步切到内存模式并展示演示数据）
initBackend();

export { openDB, uid, Projects, Transactions, Parties, Attachments, Reminders, Meta };
