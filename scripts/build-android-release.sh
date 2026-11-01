#!/usr/bin/env bash
# scripts/build-android-release.sh —— 一键构建已签名的 release 包（阶段 F）
#
# 用法：
#   export ZX_KEYSTORE=/path/to/gongzhang.keystore
#   export ZX_KEY_ALIAS=gongzhang
#   export ZX_KEY_PASSWORD=***
#   export ZX_STORE_PASSWORD=***        # 可选，缺省同 ZX_KEY_PASSWORD
#   bash scripts/build-android-release.sh          # 产出 APK
#   bash scripts/build-android-release.sh bundle   # 产出 AAB（应用商店上架用）
#
# 签名配置由 android/app/build.gradle 直接读环境变量，本脚本只做「前置校验 + 串流程」，
# 不写 keystore.properties，不落盘任何明文口令。
#
# 安全约定（切勿破坏）：
#   1. keystore 丢了就无法给已安装用户发覆盖升级 —— 必须多处备份；
#   2. 未设置环境变量时直接失败退出，绝不悄悄产出 debug 签名的 release 包（防止误发上架）。

set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

MODE="${1:-apk}"

echo "═══ 1/4 检查签名环境 ═══"
# shellcheck source=/dev/null
source "$ROOT/scripts/env.sh"

if [ -z "$ZX_KEYSTORE" ] || [ -z "$ZX_KEY_ALIAS" ] || [ -z "$ZX_KEY_PASSWORD" ]; then
  echo "❌ 缺少签名环境变量：ZX_KEYSTORE / ZX_KEY_ALIAS / ZX_KEY_PASSWORD" >&2
  echo "   生成 keystore（只需一次，务必备份）：" >&2
  echo "     keytool -genkey -v -keystore gongzhang.keystore -alias gongzhang \\" >&2
  echo "             -keyalg RSA -keysize 2048 -validity 10000" >&2
  exit 1
fi
if [ ! -f "$ZX_KEYSTORE" ]; then
  echo "❌ keystore 文件不存在：$ZX_KEYSTORE" >&2
  exit 1
fi
echo "  keystore = $ZX_KEYSTORE"
echo "  alias    = $ZX_KEY_ALIAS"

echo "═══ 2/4 版本号自检（发版前必须递增 versionCode）═══"
VERSION_NAME=$(node -p "require('./package.json').version")
VERSION_CODE=$(grep -o 'versionCode [0-9]*' android/app/build.gradle | head -1 | awk '{print $2}')
echo "  versionName = $VERSION_NAME（package.json） / build.gradle 内 versionName 需与之一致"
echo "  versionCode = $VERSION_CODE（每次发版必须 +1，且不可回退）"

echo "═══ 3/4 构建 Web 资源并同步原生工程 ═══"
node build.js --www
npx cap sync android

echo "═══ 4/4 编译 release（$MODE）═══"
cd "$ROOT/android"
# --no-build-cache 规避 Windows 下 transforms 目录移动失败（本机实测坑，勿删）
if [ "$MODE" = "bundle" ]; then
  ./gradlew bundleRelease --no-daemon --no-build-cache
  ART=$(find app/build/outputs/bundle/release -name "*.aab" | head -1)
else
  ./gradlew assembleRelease --no-daemon --no-build-cache
  ART=$(find app/build/outputs/apk/release -name "*.apk" | head -1)
fi

if [ -z "$ART" ]; then echo "❌ 未找到产物，编译可能失败" >&2; exit 1; fi
echo ""
echo "✅ 构建成功：$ART"
ls -lh "$ART"
echo ""
echo "验证签名：jarsigner -verify -verbose -certs \"$ART\" | head -20"
