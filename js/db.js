// 数据层：自动在 IndexedDB（手机/正常浏览器，可持久化）与
// 内存模式（受限预览环境，载入演示数据、不保存）之间降级。
// 对外暴露与旧版一致的 API，app.js 无需改动。

import { demoDataset } from './demo.js';

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
  // P1-7：写入 schema 版本，导入时用来判断「备份比当前程序新 / 旧」，避免静默丢字段
  const out = {
    app: 'decor-accounting', schema: DB_VERSION, dbVersion: DB_VERSION,
    appVersion: (typeof window !== 'undefined' && window.__GZ_VERSION) || '',
    exportedAt: new Date().toISOString(), stores: {}
  };
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
  // P1-7：版本兼容。备份比当前程序更新 → 可能含本版本读不懂的字段，明确提示而不是静默覆盖
  const bv = Number(data.schema || data.dbVersion || 1);
  if (bv > DB_VERSION) {
    throw new Error('备份来自更高版本（schema ' + bv + ' > 当前 ' + DB_VERSION + '），请先升级 App 再导入');
  }
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

export { openDB, uid, Projects, Transactions, Parties, Attachments, Reminders, Meta, Trash, Snapshots, Demo, ensureFirstRun, exportAll, importAll, dbMaintain };
