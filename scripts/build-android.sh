#!/usr/bin/env bash
# scripts/build-android.sh —— 一键构建安卓 APK（阶段 0/1 产出）
# 用法：
#   bash scripts/build-android.sh            # debug APK
#   bash scripts/build-android.sh release    # release APK（需签名环境变量）
#
# 产物：android/app/build/outputs/apk/{debug,release}/*.apk
#
# 关键点（均为本机实测踩坑所得，勿删）：
#   1. 必须 source env.sh 固定 JDK 21（系统 JDK 27 过新）
#   2. Gradle 发行包走腾讯云镜像（官方源不通）
#   3. 必须 --no-build-cache（Windows 下 transforms 目录会被锁导致移动失败）

set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

MODE="${1:-debug}"

echo "═══ 1/5 检查环境 ═══"
# shellcheck source=/dev/null
source "$ROOT/scripts/env.sh"
if [ ! -x "$JAVA_HOME/bin/java" ]; then
  echo "❌ JDK 21 未就绪，见 scripts/env.sh 的下载指引" >&2
  exit 1
fi
java -version 2>&1 | head -1
[ -d "$ANDROID_HOME" ] || { echo "❌ ANDROID_HOME 不存在：$ANDROID_HOME" >&2; exit 1; }

echo "═══ 2/5 构建 Web 资源 → www/ ═══"
node build.js

echo "═══ 3/5 同步到原生工程 ═══"
if [ ! -d "$ROOT/android" ]; then
  echo "首次构建：生成 Android 工程…"
  npx cap add android
fi
npx cap sync android

echo "═══ 4/5 配置 Gradle 镜像与 SDK 路径 ═══"
WRAPPER="$ROOT/android/gradle/wrapper/gradle-wrapper.properties"
if [ -f "$WRAPPER" ]; then
  # 官方源不通 → 改用腾讯云镜像
  if ! grep -q "mirrors.cloud.tencent.com" "$WRAPPER"; then
    sed -i "s|distributionUrl=.*|distributionUrl=https\\://mirrors.cloud.tencent.com/gradle/gradle-${GRADLE_VERSION:-8.14.3}-all.zip|" "$WRAPPER"
    echo "  → Gradle 发行源已切到腾讯云镜像"
  fi
fi
echo "sdk.dir=$ANDROID_HOME" > "$ROOT/android/local.properties"

echo "═══ 5/5 编译 APK（$MODE） ═══"
cd "$ROOT/android"
if [ "$MODE" = "release" ]; then
  ./gradlew assembleRelease --no-daemon --no-build-cache
  APK=$(find app/build/outputs/apk/release -name "*.apk" | head -1)
else
  ./gradlew assembleDebug --no-daemon --no-build-cache
  APK=$(find app/build/outputs/apk/debug -name "*.apk" | head -1)
fi

if [ -n "$APK" ]; then
  echo ""
  echo "✅ 构建成功：$APK"
  ls -lh "$APK"
  echo ""
  echo "安装到已连接设备：adb install -r \"$APK\""
else
  echo "❌ 未找到 APK，编译可能失败" >&2
  exit 1
fi
