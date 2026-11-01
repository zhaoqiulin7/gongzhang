#Requires -Version 5.1
<#
.SYNOPSIS
    工账 APK —— 模拟器一键运行脚本（构建 → 同步 → 编译 → 安装 → 启动 → 抓日志）

.DESCRIPTION
    全自动串起整条链路，省去手工敲 5 条命令。默认连接雷电模拟器（127.0.0.1:5555）。

.PARAMETER Port
    模拟器 adb 端口。雷电=5555（多开 5557/5559），MuMu12=16384，AVD 用 -UseAvd 自动识别。

.PARAMETER UseAvd
    连接 Android Studio 官方模拟器（emulator-xxxx），忽略 Port。

.PARAMETER SkipBuild
    跳过 Web 构建与 Gradle 编译，只做「安装 + 启动 + 日志」（改了原生配置时才需要重新编译）。

.PARAMETER NoLog
    不进入日志跟随模式（默认启动后会 tail logcat，Ctrl+C 退出）。

.PARAMETER Reinstall
    先卸载再安装，用于重现「首次运行向导」。

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/demo-emulator.ps1
    powershell -ExecutionPolicy Bypass -File scripts/demo-emulator.ps1 -Port 16384
    powershell -ExecutionPolicy Bypass -File scripts/demo-emulator.ps1 -SkipBuild
    powershell -ExecutionPolicy Bypass -File scripts/demo-emulator.ps1 -UseAvd -Reinstall
#>
[CmdletBinding()]
param(
    [string] $Port = '5555',
    [switch] $UseAvd,
    [switch] $SkipBuild,
    [switch] $NoLog,
    [switch] $Reinstall
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$PKG = 'com.gongzhang.app'
$APK = Join-Path $Root 'android/app/build/outputs/apk/debug/app-debug.apk'
$Sdk = Join-Path $env:LOCALAPPDATA 'Android/Sdk'
$Adb = Join-Path $Sdk 'platform-tools/adb.exe'

function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

# ---------- 0. 环境自检 ----------
Step '0/6 环境自检'
if (-not (Test-Path $Adb)) { throw "找不到 adb.exe：$Adb`n请先安装 Android SDK platform-tools" }
Write-Host "  adb = $Adb"

# JDK 21：系统默认的 JDK 27 会导致 Gradle 报 "Unsupported class file major version"
$env:JAVA_HOME = 'C:\jdk21\jdk-21.0.2'
if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) { throw "找不到 JDK 21：$env:JAVA_HOME" }
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:ANDROID_HOME = $Sdk
$env:ANDROID_SDK_ROOT = $Sdk
$env:GRADLE_OPTS = '-Dorg.gradle.daemon=false'
Write-Host "  JAVA_HOME = $env:JAVA_HOME"

# ---------- 1~3. 构建 ----------
if ($SkipBuild) {
    Write-Host '  (已 -SkipBuild，跳过构建)'
} else {
    Step '1/6 构建 Web 资源'
    node build.js --www; if ($LASTEXITCODE -ne 0) { throw 'build.js 失败' }

    Step '2/6 同步原生工程'
    npx cap sync android; if ($LASTEXITCODE -ne 0) { throw 'cap sync 失败' }

    Step '3/6 编译 debug APK'
    Push-Location (Join-Path $Root 'android')
    try {
        # --no-build-cache 规避 Windows 下 transforms 目录移动失败（本机实测坑）
        .\gradlew.bat assembleDebug --no-daemon --no-build-cache
        if ($LASTEXITCODE -ne 0) { throw 'Gradle 编译失败' }
    } finally { Pop-Location }
}
if (-not (Test-Path $APK)) { throw "APK 不存在：$APK" }
Write-Host "  APK = $([math]::Round((Get-Item $APK).Length / 1KB, 1)) KB"

# ---------- 4. 连接模拟器 ----------
Step '4/6 连接模拟器'
& $Adb start-server | Out-Null
if ($UseAvd) {
    $dev = & $Adb devices | Select-String '^emulator-' | ForEach-Object { ($_ -split '\s+')[0] } | Select-Object -First 1
    if (-not $dev) { throw '未发现官方模拟器，请先启动 AVD（emulator.exe -avd <名>）' }
} else {
    & $Adb connect "127.0.0.1:$Port" | Out-Null
    $dev = "127.0.0.1:$Port"
}
# 等待设备进入 device 状态（模拟器刚启动时会是 unauthorized/offline）
$ok = $false
for ($i = 0; $i -lt 30; $i++) {
    $line = & $Adb devices | Select-String ([regex]::Escape($dev))
    if ($line -and $line -match '\bdevice\b') { $ok = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $ok) { throw "设备 $dev 未就绪（offline/unauthorized）。`n$(& $Adb devices | Out-String)" }
Write-Host "  已连接：$dev"

# ---------- 5. 安装 ----------
Step '5/6 安装 APK'
if ($Reinstall) {
    & $Adb -s $dev uninstall $PKG | Out-Null
    Write-Host '  已卸载旧版本（用于重现首次运行向导）'
}
$out = & $Adb -s $dev install -r $APK 2>&1 | Out-String
Write-Host "  $($out.Trim())"
if ($out -notmatch 'Success') {
    Write-Host "`n常见原因与处理：" -ForegroundColor Yellow
    Write-Host '  · INSTALL_FAILED_UPDATE_INCOMPATIBLE → 加 -Reinstall'
    Write-Host '  · INSTALL_FAILED_OLDER_SDK          → 模拟器需 Android 7.0+（minSdk=24）'
    Write-Host '  · INSTALL_FAILED_INSUFFICIENT_STORAGE → 模拟器扩容到 4GB+'
    throw '安装失败'
}

# ---------- 6. 启动 ----------
Step '6/6 启动工账'
& $Adb -s $dev shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 | Out-Null
Write-Host "`n✅ 已启动。Chrome 打开 chrome://inspect 可远程调试 WebView。" -ForegroundColor Green

if (-not $NoLog) {
    Write-Host "`n开始跟随日志（Ctrl+C 退出）…" -ForegroundColor Cyan
    & $Adb -s $dev logcat | Select-String -Pattern 'chromium|gongzhang|Capacitor|AndroidRuntime|FATAL'
}
