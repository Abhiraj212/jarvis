plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.abhiraj.familyguard.parent"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.abhiraj.familyguard.parent"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }
}
