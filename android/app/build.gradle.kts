plugins {
    id("com.android.application")
}

android {
    namespace = "gg.vibrancy.foodtruckos"
    compileSdk = 36

    defaultConfig {
        applicationId = "gg.vibrancy.foodtruckos"
        // Android 8: cualquier tablet que un cliente compre hoy lo supera de
        // sobra, y nos ahorra las ramas de compatibilidad antiguas.
        minSdk = 26
        targetSdk = 36
        versionCode = 7
        versionName = "0.7"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
