# Proguard rules for Northveil Android App
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}
-keep class xyz.northveil.mobile.domain.model.** { *; }
-keep class xyz.northveil.mobile.core.network.dto.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
