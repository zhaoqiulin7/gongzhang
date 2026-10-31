#!/usr/bin/env bash
# scripts/env.sh —— 安卓构建环境固化（阶段 0 产出）
# 用法：source scripts/env.sh
#
# 本项目实测踩过的三个坑，都在这里固化：
#   1. 系统自带 JDK 27 过新（Gradle 报 Unsupported class file major version 71）→ 必须用 JDK 21
#   2. services.gradle.org 不通 → Gradle 发行包走腾讯云镜像
#   3. api.adoptium.net 不通 → JDK 下载走华为云镜像
#
# 校验过的版本（2026-10-31）：
#   Node 22.22.2 / JDK 21.0.2 / Gradle 8.14.3 / AGP 8.13.0 / Android SDK platform-37.0

# ---------- JDK 21 ----------
# 注意：Git Bash 下 JAVA_HOME 必须是 Windows 风格路径（C:\...），
# 否则 gradlew（Windows 批处理）找不到 java；PATH 里则用 POSIX 风格路径。
ZX_JDK_HOME_POSIX="${ZX_JDK_HOME_POSIX:-/c/jdk21/jdk-21.0.2}"
ZX_JDK_HOME_WIN="${ZX_JDK_HOME_WIN:-C:/jdk21/jdk-21.0.2}"
if [ -x "$ZX_JDK_HOME_POSIX/bin/java" ]; then
  export JAVA_HOME="$ZX_JDK_HOME_WIN"
  export PATH="$ZX_JDK_HOME_POSIX/bin:$PATH"
else
  echo "[env] ⚠️  未找到 JDK 21：$ZX_JDK_HOME_WIN" >&2
  echo "[env]    下载：https://mirrors.huaweicloud.com/openjdk/21.0.2/openjdk-21.0.2_windows-x64_bin.zip" >&2
  echo "[env]    解压到 C:\\jdk21 后重新 source 本脚本" >&2
fi

# ---------- Android SDK ----------
export ANDROID_HOME="${ANDROID_HOME:-$HOME/AppData/Local/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

# ---------- Gradle 镜像（官方源在本机不通） ----------
export GRADLE_MIRROR="${GRADLE_MIRROR:-https://mirrors.cloud.tencent.com/gradle}"
export GRADLE_VERSION="${GRADLE_VERSION:-8.14.3}"

# ---------- 代理/镜像开关（gradle 走国内镜像） ----------
export GRADLE_OPTS="${GRADLE_OPTS:-Dorg.gradle.daemon=false}"

if [ "$1" = "--check" ]; then
  echo "JAVA_HOME  = $JAVA_HOME"
  echo "java ver   = $(java -version 2>&1 | head -1)"
  echo "ANDROID_HOME = $ANDROID_HOME"
  echo "node ver   = $(node -v 2>/dev/null)"
  echo "npm ver    = $(npm -v 2>/dev/null)"
  echo "gradle镜像 = $GRADLE_MIRROR ($GRADLE_VERSION)"
  if [ -x "$ANDROID_HOME/platform-tools/adb.exe" ]; then
    echo "adb        = $(adb version 2>/dev/null | head -1)"
  fi
fi
