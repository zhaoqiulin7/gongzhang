/* =============================================================================
 * js/bridge.js —— 能力抽象层（安卓化阶段 B）
 *
 * 目的：把「浏览器 API」与「原生插件」收敛到一个出口，业务层（app.js）只认 Bridge.*，
 *       不再直接碰 Notification / navigator.share / input[type=file] / navigator.clipboard。
 *
 * 两条实现分支：
 *   Native 分支 —— Capacitor 插件（工账 APK 内生效）
 *   Web    分支 —— 浏览器 API（PWA / 预览环境生效，行为与改造前完全一致）
 *
 * 为什么要自己 registerPlugin 而不是 import 插件的 npm 包？
 *   本项目 www/ 是「多个普通 <script> 顺序加载」的形态（见 build.js 的 ORDER 约定），
 *   没有打包器，无法解析 import '@capacitor/local-notifications' 这类裸模块名。
 *   Capacitor 的桥协议本质只是 {pluginId, methodName, options} 的字符串派发，
 *   因此用全局 Capacitor.registerPlugin(插件名) 自注册即可，插件的原生实现由
 *   package.json 依赖 + cap sync 打进 APK，JS 侧只是个代理。
 *
 * 加载位置：util.js 之后、app.js 之前（bridge 用到 toast/openModal，app 用到 Bridge）。
 * ============================================================================= */

/* ---------------- 1. 环境探测与插件获取 ---------------- */

/** Capacitor 全局对象（由原生运行时注入 WebView；纯浏览器下为 undefined） */
function capGlobal() {
  return (typeof window !== 'undefined' && window.Capacitor) ? window.Capacitor : null;
}

/** 是否运行在原生壳（APK）内 */
function isNative() {
  const c = capGlobal();
  return !!(c && typeof c.isNativePlatform === 'function' && c.isNativePlatform());
}

/** 当前平台标识：'android' | 'ios' | 'web' */
function platformOf() {
  const c = capGlobal();
  if (c && typeof c.getPlatform === 'function') return c.getPlatform();
  return 'web';
}

const _pluginCache = {};

/**
 * 惰性注册并返回插件代理；不可用时返回 null。
 * 只在 isNative() 为真时调用其方法——Web 下插件代理会抛 "not implemented"。
 */
function plugin(name) {
  const c = capGlobal();
  if (!c || typeof c.registerPlugin !== 'function') return null;
  if (!(name in _pluginCache)) {
    try {
      _pluginCache[name] = c.registerPlugin(name) || null;
    } catch (e) {
      _pluginCache[name] = null;
    }
  }
  return _pluginCache[name];
}

/** 只在原生环境返回插件；Web 下一律 null，交给 Web 分支 */
function nativePlugin(name) {
  return isNative() ? plugin(name) : null;
}

/**
 * Android 的本地通知 id 必须是正整数（32 位）。
 * 用 FNV-1a 把字符串 tag 稳定映射成数字，保证「同一 tag 复用同一条通知」（可覆盖、可取消）。
 */
/** Android 通知渠道 id（全局唯一，改了会新建渠道，慎改） */
const NOTIFY_CHANNEL = 'gongzhang-remind';

function tagToId(tag) {
  let h = 0x811c9dc5;
  const s = String(tag || 'gongzhang');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  const id = h % 2147483647;
  return id === 0 ? 1 : id;
}

/* ---------------- 2. 通用文件选择（Web 分支，WebView 内同样有效） ---------------- */

/**
 * 弹出系统文件选择器并读取；用户取消时 resolve(null)。
 * WebView 内 <input type=file> 会唤起 Android 系统文件选择器，因此导入功能无需原生插件。
 */
function pickFileWeb(accept, capture) {
  return new Promise((resolve) => {
    try {
      const inp = document.createElement('input');
      inp.type = 'file';
      if (accept) inp.accept = accept;
      if (capture) inp.setAttribute('capture', 'environment');
      inp.style.display = 'none';
      let settled = false;
      const done = (f) => { if (!settled) { settled = true; resolve(f || null); } };
      inp.addEventListener('change', () => { done(inp.files && inp.files[0]); });
      // WebView 里 visibilitychange 不可靠，用超时兜底（用户取消时不会触发 change）
      document.body.appendChild(inp);
      inp.click();
      setTimeout(() => { if (inp.parentNode) inp.parentNode.removeChild(inp); done(null); }, 120000);
    } catch (e) { resolve(null); }
  });
}

/** Blob/File → base64（原生写文件、分享文件时需要） */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    try {
      const r = new FileReader();
      r.onload = () => {
        const s = String(r.result || '');
        const i = s.indexOf(',');
        resolve(i >= 0 ? s.slice(i + 1) : s);
      };
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    } catch (e) { reject(e); }
  });
}

/* ---------------- 3. Bridge 主体 ---------------- */

const Bridge = {
  isNative: isNative,
  platform: platformOf,
  tagToId: tagToId,

  /* ---------------- 3.1 系统通知 ---------------- */
  notify: {
    /** 'granted' | 'denied' | 'default' | 'unsupported' */
    async permission() {
      const p = nativePlugin('LocalNotifications');
      if (p && p.checkPermissions) {
        try {
          const r = await p.checkPermissions();
          return r.display || 'default';
        } catch (e) { return 'unsupported'; }
      }
      if (typeof Notification === 'undefined') return 'unsupported';
      return Notification.permission;
    },

    /** 申请权限，返回最新权限状态 */
    async request() {
      const p = nativePlugin('LocalNotifications');
      if (p && p.requestPermissions) {
        try {
          const r = await p.requestPermissions();
          return r.display || 'denied';
        } catch (e) { return 'denied'; }
      }
      if (typeof Notification === 'undefined' || !Notification.requestPermission) return 'unsupported';
      try { return await Notification.requestPermission(); } catch (e) { return 'denied'; }
    },

    /**
     * Android 8+ 通知渠道（P1-6）：不建渠道时，部分国产 ROM 会静默丢弃通知，
     * 用户也无从单独开关「提醒」这一类。首次排程前调一次即可，重复创建是幂等的。
     */
    async ensureChannel() {
      const p = nativePlugin('LocalNotifications');
      if (!p || !p.createChannel) return false;
      try {
        await p.createChannel({
          id: NOTIFY_CHANNEL, name: '到期提醒',
          description: '收付款节点与施工阶段到期提醒',
          importance: 4,          // IMPORTANCE_HIGH：会响铃 + 弹出
          visibility: 1,          // 锁屏可见（不暴露金额正文由 body 决定）
          sound: 'default', vibration: true, lights: true
        });
        return true;
      } catch (e) { return false; }
    },

    /** 立即弹一条通知。o = {title, body, tag, pid} */
    async show(o) {
      const p = nativePlugin('LocalNotifications');
      if (p && p.schedule) {
        try {
          await Bridge.notify.ensureChannel();
          const at = new Date(Date.now() + 1500); // 1.5s 后触发，给 UI 让出线程
          await p.schedule({
            notifications: [{
              title: o.title, body: o.body || '', id: tagToId(o.tag), channelId: NOTIFY_CHANNEL,
              extra: { pid: o.pid || '' }, schedule: { at: at }
            }]
          });
          return true;
        } catch (e) { return false; }
      }
      return Bridge.notify._web(o);
    },

    /** 排程一批通知。list = [{tag, title, body, at(Date), pid}] */
    async schedule(list) {
      const p = nativePlugin('LocalNotifications');
      if (!p || !p.schedule) return 0;
      if (!list.length) return 0;
      try {
        await Bridge.notify.ensureChannel();
        await p.schedule({
          notifications: list.map((n) => ({
            title: n.title, body: n.body || '', id: tagToId(n.tag), channelId: NOTIFY_CHANNEL,
            extra: { pid: n.pid || '' }, schedule: { at: n.at }
          }))
        });
        return list.length;
      } catch (e) { return 0; }
    },

    /** 取消一批通知（传数字 id 数组） */
    async cancel(ids) {
      const p = nativePlugin('LocalNotifications');
      if (!p || !p.cancel || !ids || !ids.length) return 0;
      try {
        await p.cancel({ notifications: ids.map((i) => ({ id: i })) });
        return ids.length;
      } catch (e) { return 0; }
    },

    /**
     * 【核心改造】收付款节点通知改「预排程」：节点一改动就把未来的通知排好，
     * App 没打开也会到点弹。Web 分支无此能力（保持原轮询逻辑），返回 -1 表示不支持。
     *
     * @param {Array} reminders 全部收付款节点
     * @param {Array} projects 项目列表（用于拼通知正文）
     * @param {number} remindDays 提前提醒天数
     * @returns {number} 排程条数；-1 = 非原生环境
     */
    async syncReminders(reminders, projects, remindDays) {
      if (!isNative()) return -1;
      const p = nativePlugin('LocalNotifications');
      if (!p || !p.schedule) return -1;

      const list = [];
      const ids = [];
      (reminders || []).forEach((r) => {
        if (r.done || !r.dueDate) return;
        const pj = (projects || []).filter((x) => x.id === r.projectId)[0];
        const pname = pj ? pj.name : '未关联项目';
        const kind = r.kind === 'receive' ? '收款' : '付款';
        const amt = r.amount ? ' · ' + fmtMoney(Number(r.amount) || 0) : '';
        // ① 到期当天 09:00
        const dueTag = 'rem-' + r.id;
        const dueAt = new Date(r.dueDate + 'T09:00:00');
        if (dueAt.getTime() > Date.now()) {
          list.push({
            tag: dueTag, at: dueAt, pid: r.projectId,
            title: (r.kind === 'receive' ? '💰 收款到期' : '💸 付款到期'),
            body: pname + ' · ' + (r.title || kind) + amt
          });
          ids.push(tagToId(dueTag));
        }
        // ② 提前 N 天 09:00（remindDays>0 时才排）
        const lead = Number(remindDays) || 0;
        if (lead > 0) {
          const leadDate = new Date(r.dueDate + 'T09:00:00');
          leadDate.setDate(leadDate.getDate() - lead);
          if (leadDate.getTime() > Date.now()) {
            const leadTag = 'remlead-' + r.id;
            list.push({
              tag: leadTag, at: leadDate, pid: r.projectId,
              title: (r.kind === 'receive' ? '🔔 收款提醒' : '🔔 付款提醒'),
              body: pname + ' · ' + (r.title || kind) + ' · ' + lead + ' 天后到期' + amt
            });
            ids.push(tagToId(leadTag));
          }
        }
      });

      // 取消「上次排过、这次不该再排」的（节点被删/已完成/日期改了）
      await Bridge.notify._cancelStale(ids);
      if (!list.length) return 0;
      return await Bridge.notify.schedule(list);
    },

    /** 取消上一轮排程里已经失效的 id；并把本轮 id 记下来供下次比对 */
    async _cancelStale(currentIds) {
      let prev = [];
      try { prev = JSON.parse(localStorage.getItem('gzNotifyIds') || '[]') || []; } catch (e) { prev = []; }
      const stale = prev.filter((i) => currentIds.indexOf(i) < 0);
      if (stale.length) await Bridge.notify.cancel(stale);
      try { localStorage.setItem('gzNotifyIds', JSON.stringify(currentIds)); } catch (e) { /* 忽略 */ }
      return stale.length;
    },

    /**
     * 注册「点击通知」回调：fn(pid) —— 原生走 localNotificationActionPerformed，
     * Web 由 app.js 的 listenNotifyNav() 通过 SW message 处理（两条路径二选一）。
     */
    async onClick(fn) {
      const p = nativePlugin('LocalNotifications');
      if (p && p.addListener) {
        try {
          await p.addListener('localNotificationActionPerformed', (ev) => {
            const extra = ev && ev.notification && ev.notification.extra;
            if (extra && extra.pid) fn(extra.pid);
          });
          return true;
        } catch (e) { return false; }
      }
      return false;
    },

    /** 通知被永久拒绝时的引导（原生无法直接打开系统设置页，给可操作指引） */
    guidance() {
      const brand = (typeof window !== 'undefined') ? '工账' : '本 App';
      const pf = platformOf();
      const rom = (typeof navigator !== 'undefined' ? String(navigator.userAgent || '') : '');
      let tip = '请在系统设置 → 应用 → ' + brand + ' → 通知 中开启允许通知';
      if (pf === 'android') {
        if (/Xiaomi|Redmi|MIUI/i.test(rom)) tip = '小米/红米：设置 → 应用设置 → 应用管理 → ' + brand + ' → 通知管理（开启）；再到「省电策略」改为「无限制」，否则后台收不到';
        else if (/HUAWEI|Harmony|Honor/i.test(rom)) tip = '华为/荣耀：设置 → 应用 → 应用管理 → ' + brand + ' → 通知管理（开启）；再到「电池 → 启动管理」关闭自动管理并允许后台活动';
        else if (/OPPO|realme/i.test(rom)) tip = 'OPPO/realme：设置 → 应用管理 → ' + brand + ' → 通知管理（开启）；再到「电池 → 应用耗电管理」允许后台运行';
        else if (/vivo/i.test(rom)) tip = 'vivo：设置 → 应用与权限 → 应用管理 → ' + brand + ' → 通知（开启）；再到「电池 → 后台高耗电」允许';
        else if (/samsung/i.test(rom)) tip = '三星：设置 → 应用程序 → ' + brand + ' → 通知（开启）；再到「电池 → 背景使用限制」移出受限应用';
      }
      return tip;
    },

    /** Web 分支：沿用原有「SW 优先 + 页面内 Notification 兜底」的逻辑 */
    _swReg: null,
    async _ensureSW() {
      if (Bridge.notify._swReg !== null) return Bridge.notify._swReg;
      if (typeof navigator === 'undefined' || !navigator.serviceWorker || !/^https?:/.test(location.protocol)) {
        Bridge.notify._swReg = false;
        return false;
      }
      Bridge.notify._swReg = navigator.serviceWorker.register('./sw.js').then((reg) => reg).catch(() => false);
      return Bridge.notify._swReg;
    },
    async _web(o) {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;
      try {
        const reg = await Bridge.notify._ensureSW();
        if (reg && reg.showNotification) {
          await reg.showNotification(o.title, {
            body: o.body || '', tag: o.tag || 'gongzhang',
            icon: './icon.svg', badge: './icon.svg', data: { pid: o.pid || '' }
          });
        } else {
          const n = new Notification(o.title, { body: o.body || '', tag: o.tag || 'gongzhang', icon: './icon.svg' });
          n.onclick = () => { try { window.focus(); } catch (e) {} if (o.pid) location.hash = '#/project/' + o.pid; };
        }
        return true;
      } catch (e) { return false; }
    }
  },

  /* ---------------- 3.2 相机 / 相册 / 文件选择 ---------------- */
  camera: {
    /**
     * 取一张图片。
     * @param {string} source 'camera'（拍照）| 'photos'（相册）
     * @returns {Promise<{blob:Blob,type:string,name:string}|null>} 用户取消返回 null
     */
    async image(source) {
      const p = nativePlugin('Camera');
      if (p && p.getPhoto) {
        try {
          const photo = await p.getPhoto({
            // 原生枚举是「大写字符串」：CameraSource{CAMERA,PHOTOS,PROMPT}、CameraResultType{uri,base64,dataUrl}
            // 这里直接写字面量，避免为了拿枚举而引入打包器。
            source: source === 'camera' ? 'CAMERA' : 'PHOTOS',
            resultType: 'uri',
            quality: 80,
            allowEditing: false,
            saveToGallery: false,
            correctOrientation: true
          });
          // Uri 模式下 path 是平台完整文件 URL（file:///…），webPath 是 capacitor://…；两者都可被 convertFileSrc 处理
          const rawUri = photo.path || photo.webPath;
          if (!rawUri) return null;
          // capacitor:// / file:// → WebView 可 fetch 的 https://localhost/_capacitor_file_/...
          const c = capGlobal();
          const url = (c && c.convertFileSrc) ? c.convertFileSrc(rawUri) : rawUri;
          const res = await fetch(url);
          const blob = await res.blob();
          const name = 'photo_' + Date.now() + '.jpg';
          return { blob: blob, type: blob.type || 'image/jpeg', name: name };
        } catch (e) {
          // 用户主动取消（插件会 reject 含 cancel 的信息）→ 静默返回 null，不打扰
          if (e && e.message && /cancel/i.test(e.message)) return null;
          // 其它失败（设备无摄像头 / 权限未授予 / 存储不可用）→ 带回原因，
          // 否则上层只能静默无反应，用户会以为按钮坏了（模拟器上尤其常见）。
          return { error: String((e && e.message) || '相机不可用') };
        }
      }
      // Web 分支：沿用 <input type=file capture> 的既有体验
      const f = await pickFileWeb('image/*', source === 'camera');
      if (!f) return null;
      return { blob: f, type: f.type || 'image/jpeg', name: f.name || ('photo_' + Date.now() + '.jpg') };
    }
  },

  files: {
    /** 通用文件选择（图片 + PDF 等）；走系统文件选择器 */
    async pick(accept) {
      const f = await pickFileWeb(accept || 'image/*,application/pdf,.pdf', false);
      return f;
    },

    /**
     * 导出备份：原生写入应用文档目录后用系统分享面板发出去
     * （Android 11+ 分区存储下，直接写公共 Downloads 不可靠；交给用户选择保存位置最稳）。
     * @returns {Promise<boolean>} 是否成功发出
     */
    async saveAndShare(name, text) {
      const fs = nativePlugin('Filesystem');
      const sh = nativePlugin('Share');
      if (fs && sh) {
        try {
          await fs.writeFile({
            path: '工账备份/' + name,
            data: text,
            directory: 'DOCUMENTS',
            encoding: 'utf8',
            recursive: true
          });
          const uri = await fs.getUri({ path: '工账备份/' + name, directory: 'DOCUMENTS' });
          await sh.share({ title: name, files: [uri.uri], dialogTitle: '保存或发送备份' });
          return true;
        } catch (e) {
          // 文件分享失败 → 退化为分享文本（备份很大时可能被截断，故仅作兜底）
          try {
            await sh.share({ title: name, text: text, dialogTitle: '发送备份' });
            return true;
          } catch (e2) { return false; }
        }
      }
      // Web 分支：保持原有的 a[download] 行为
      try {
        const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        return true;
      } catch (e) { return false; }
    }
  },

  /* ---------------- 3.3 系统分享 ---------------- */
  share: {
    /** 分享文本；返回是否真的走了分享（false 表示应退化为复制） */
    async text(o) {
      const p = nativePlugin('Share');
      if (p && p.share) {
        try {
          await p.share({ title: o.title || '', text: o.text || '', dialogTitle: o.title || '分享' });
          return true;
        } catch (e) {
          if (e && e.message && /cancel/i.test(e.message)) return true; // 用户主动取消，别再退化成复制
          return false;
        }
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        try { await navigator.share({ title: o.title || '', text: o.text || '' }); return true; }
        catch (e) { if (e && e.name === 'AbortError') return true; return false; }
      }
      return false;
    },

    /**
     * 分享文件（统计长图）。原生：Blob → base64 → 写入缓存目录 → 取得 uri → 分享。
     * @returns {Promise<boolean>} false 表示调用方应回退到「下载到本地」
     */
    async file(o) {
      const p = nativePlugin('Share');
      const fs = nativePlugin('Filesystem');
      if (p && fs && o.blob) {
        try {
          const b64 = await blobToBase64(o.blob);
          const path = 'share/' + (o.name || 'file');
          await fs.writeFile({ path: path, data: b64, directory: 'CACHE', recursive: true });
          const uri = await fs.getUri({ path: path, directory: 'CACHE' });
          await p.share({ title: o.title || '', text: o.text || '', files: [uri.uri], dialogTitle: o.title || '分享' });
          return true;
        } catch (e) {
          if (e && e.message && /cancel/i.test(e.message)) return true;
          return false;
        }
      }
      // Web 分支：navigator.share(files) → 否则交给调用方下载
      if (typeof navigator !== 'undefined' && navigator.canShare && o.file && navigator.canShare({ files: [o.file] }) && navigator.share) {
        try { await navigator.share({ files: [o.file], title: o.title || '' }); return true; }
        catch (e) { if (e && e.name === 'AbortError') return true; return false; }
      }
      return false;
    }
  },

  /* ---------------- 3.4 剪贴板 ---------------- */
  clipboard: {
    async write(text) {
      const p = nativePlugin('Clipboard');
      if (p && p.write) {
        try { await p.write({ string: text }); return true; } catch (e) { return false; }
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (e) { /* 降级到 execCommand */ }
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        ta.remove();
        return true;
      } catch (e2) { return false; }
    }
  },

  /* ---------------- 3.5 物理返回键（Android 专属） ---------------- */
  back: {
    /**
     * 安装返回键监听。handler 由业务层提供，返回 true 表示已消费该次返回。
     * 只在原生环境生效，Web 下静默跳过。
     */
    async install(handler) {
      const p = nativePlugin('App');
      if (!p || !p.addListener) return false;
      try {
        const h = await p.addListener('backButton', () => {
          Promise.resolve(handler()).catch(() => {});
        });
        Bridge.back._handle = h;
        return true;
      } catch (e) { return false; }
    },
    _handle: null,
    /** 退出 App（原生）；Web 下无操作 */
    async exitApp() {
      const p = nativePlugin('App');
      if (p && p.exitApp) { try { await p.exitApp(); } catch (e) { /* 忽略 */ } }
    }
  },

  /* ---------------- 3.6 状态栏（跟随应用内主题） ---------------- */
  statusBar: {
    /**
     * @param {string} theme 'paper'（暖纸账本，浅底深字）| 'dark'（墨绿夜读，深底浅字）
     */
    async apply(theme) {
      const p = nativePlugin('StatusBar');
      if (!p) return false;
      const dark = theme === 'dark';
      try {
        if (p.setOverlaysWebView) await p.setOverlaysWebView({ overlay: false });
        if (p.setBackgroundColor) await p.setBackgroundColor({ color: dark ? '#15352a' : '#f6f1e6' });
        if (p.setStyle) await p.setStyle({ style: dark ? 'LIGHT' : 'DARK' }); // LIGHT=浅色图标 / DARK=深色图标
        return true;
      } catch (e) { return false; }
    }
  },

  /* ---------------- 3.7 应用生命周期（可选，供后续扩展） ---------------- */
  lifecycle: {
    async onResume(fn) {
      const p = nativePlugin('App');
      if (!p || !p.addListener) return false;
      try { await p.addListener('appStateChange', (s) => { if (s && s.isActive) fn(); }); return true; }
      catch (e) { return false; }
    }
  },

  /* ---------------- 3.8 屏幕方向（施工进度页自动横屏，P1） ---------------- */
  screen: {
    /**
     * 锁定方向。@param {'landscape'|'portrait'} dir
     * @returns {Promise<boolean>} 是否真的锁上（Web 非全屏一般锁不了，属正常）
     */
    async lock(dir) {
      const p = nativePlugin('ScreenOrientation');
      if (p && p.lock) {
        try { await p.lock({ orientation: dir }); return true; }
        catch (e) { return false; }
      }
      try {
        if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock(dir === 'landscape' ? 'landscape' : 'portrait');
          return true;
        }
      } catch (e) { /* 非全屏 Web 不允许锁方向，静默降级 */ }
      return false;
    },

    /** 解除锁定，恢复「跟随系统传感器」 */
    async unlock() {
      const p = nativePlugin('ScreenOrientation');
      if (p && p.unlock) { try { await p.unlock(); return true; } catch (e) { return false; } }
      try { if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) await screen.orientation.unlock(); }
      catch (e) { /* ignore */ }
      return false;
    },

    /** 当前方向：'landscape' | 'portrait' */
    async orientation() {
      const p = nativePlugin('ScreenOrientation');
      if (p && p.getCurrentOrientation) {
        try {
          const r = await p.getCurrentOrientation();
          return /landscape/i.test((r && r.type) || '') ? 'landscape' : 'portrait';
        } catch (e) { return 'portrait'; }
      }
      return (typeof window !== 'undefined' && window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait';
    }
  },

  /* ---------------- 3.9 语音输入（P3，当前仅 Web 分支可用） ---------------- */
  speech: {
    supported() {
      return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
    }
  }
};

/* ---------------- 4. 首次运行向导（阶段 C5，仅原生环境展示） ---------------- */
/**
 * 空账本时给用户三条明确出路，避免打开就是一片空白不知从何下手。
 * @param {object} hooks {onDemo, onImport, onBlank}
 */
function firstRunWizard(hooks) {
  const item = (icon, title, desc, fn) =>
    h('button', {
      class: 'btn ghost', style: 'display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px',
      onclick: () => { closeModal(); fn(); }
    }, [
      h('div', { style: 'font-size:var(--g-fs-base);font-weight:600' }, icon + ' ' + title),
      h('div', { class: 'muted', style: 'font-size:var(--g-fs-sm);margin-top:3px' }, desc)
    ]);

  openModal('欢迎使用工账', h('div', {}, [
    h('div', { class: 'muted', style: 'font-size:var(--g-fs-md);margin-bottom:12px' },
      '选择一种方式开始。数据只保存在本机，随时可以在「我的 → 数据安全」里备份或恢复。'),
    item('🎬', '先看看演示账本', '载入 2 个示例项目，随便点、随便改，熟悉后再清空', () => hooks.onDemo && hooks.onDemo()),
    item('📥', '从备份恢复', '如果你在网页版导出过 JSON 备份，选这个直接导入', () => hooks.onImport && hooks.onImport()),
    item('🧹', '空白开始记账', '不载入任何示例数据，直接建立自己的第一个项目', () => hooks.onBlank && hooks.onBlank())
  ]), []);
}
