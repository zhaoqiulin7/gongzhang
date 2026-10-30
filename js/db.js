// IndexedDB 数据层：projects / transactions / parties / attachments / reminders
const DB_NAME = 'decor-accounting';
const DB_VERSION = 1;

let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('projects')) {
        const s = db.createObjectStore('projects', { keyPath: 'id' });
        s.createIndex('byUpdated', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('transactions')) {
        const s = db.createObjectStore('transactions', { keyPath: 'id' });
        s.createIndex('byProject', 'projectId');
        s.createIndex('byDate', 'date');
      }
      if (!db.objectStoreNames.contains('parties')) {
        db.createObjectStore('parties', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('attachments')) {
        db.createObjectStore('attachments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('reminders')) {
        const s = db.createObjectStore('reminders', { keyPath: 'id' });
        s.createIndex('byProject', 'projectId');
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

function tx(store, mode) {
  return openDB().then((db) => db.transaction(store, mode).objectStore(store));
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAll(store) {
  return tx(store, 'readonly').then((s) => reqToPromise(s.getAll()));
}

function get(store, id) {
  return tx(store, 'readonly').then((s) => reqToPromise(s.get(id)));
}

function put(store, value) {
  return tx(store, 'readwrite').then((s) => reqToPromise(s.put(value))).then(() => value);
}

function del(store, id) {
  return tx(store, 'readwrite').then((s) => reqToPromise(s.delete(id)));
}

function queryByIndex(store, indexName, value) {
  return tx(store, 'readonly').then((s) => {
    const idx = s.index(indexName);
    return reqToPromise(idx.getAll(value));
  });
}

// 通用工具
function uid() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// ---- Projects ----
const Projects = {
  all: () => getAll('projects').then((list) => list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))),
  get: (id) => get('projects', id),
  save: (p) => {
    p.updatedAt = Date.now();
    return put('projects', p);
  },
  remove: (id) => {
    // 级联删除关联交易、提醒、附件（按项目）
    return Promise.all([
      queryByIndex('transactions', 'byProject', id),
      queryByIndex('reminders', 'byProject', id)
    ]).then(([txs, rems]) => {
      const tasks = [];
      txs.forEach((t) => { tasks.push(del('transactions', t.id)); if (t.attachmentId) tasks.push(del('attachments', t.attachmentId)); });
      rems.forEach((r) => tasks.push(del('reminders', r.id)));
      tasks.push(del('projects', id));
      return Promise.all(tasks);
    });
  }
};

// ---- Transactions ----
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

// ---- Parties ----
const Parties = {
  all: () => getAll('parties').then((list) => list.sort((a, b) => (a.type || '').localeCompare(b.type || ''))),
  get: (id) => get('parties', id),
  save: (p) => put('parties', p),
  remove: (id) => del('parties', id)
};

// ---- Attachments ----
const Attachments = {
  get: (id) => get('attachments', id),
  save: (blob, type) => {
    const id = uid();
    return put('attachments', { id, blob, type, createdAt: Date.now() }).then(() => id);
  },
  remove: (id) => id ? del('attachments', id) : Promise.resolve()
};

// ---- Reminders ----
const Reminders = {
  all: () => getAll('reminders').then((list) => list.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))),
  byProject: (projectId) => queryByIndex('reminders', 'byProject', projectId),
  save: (r) => put('reminders', r),
  remove: (id) => del('reminders', id)
};

// ---- Meta (settings) ----
const Meta = {
  get: (key, def) => get('meta', key).then((v) => (v ? v.value : def)),
  set: (key, value) => put('meta', { key, value })
};

export { openDB, uid, Projects, Transactions, Parties, Attachments, Reminders, Meta };
