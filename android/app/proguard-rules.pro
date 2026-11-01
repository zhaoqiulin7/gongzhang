# 工账 release 混淆规则（P0-3）
# 原则：只保留「会被反射 / 被 JS 桥接 / 被序列化」的入口，业务代码正常混淆。
# 新增原生插件后若出现 ClassNotFoundException，在这里补对应 -keep。

# ---------- Capacitor 核心与全部插件（反射实例化，必须保留）----------
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.PluginMethod { *; }
-keepattributes *Annotation*
-keepattributes InnerClasses
-keepattributes Signature
-keepattributes EnclosingMethod

# ---------- WebView JS 桥接入口（@JavascriptInterface）----------
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.CapacitorWebView { *; }

# ---------- 序列化 / Parcelable ----------
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ---------- AndroidX / 三方库自带规则已由 AGP 合并，这里只补兜底 ----------
-keep class androidx.core.splashscreen.** { *; }
-keep class com.google.gson.** { *; }
-dontwarn org.apache.http.**
-dontwarn android.net.http.**
