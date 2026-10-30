const CACHE = 'decor-accounting-v18';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/styles.css',
  './js/db.js',
  './js/util.js',
  './js/app.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// 网络优先：始终拉取最新代码，避免真机上缓存旧版导致“修好的又变回旧 bug”；
// 仅在离线且缓存存在时回退到缓存，保证可离线打开。
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      const copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});

// P2：点击通知 → 聚焦已打开的 App 并跳到对应项目；没有打开的窗口则新开一个
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  const pid = (e.notification.data && e.notification.data.pid) || '';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (c.url.indexOf('index.html') >= 0 || c.url === new URL('./', self.location).href) {
          c.focus();
          if (pid && c.postMessage) c.postMessage({ type: 'notify-nav', pid: pid });
          return;
        }
      }
      return self.clients.openWindow('./index.html' + (pid ? '#/project/' + pid : ''));
    })
  );
});
