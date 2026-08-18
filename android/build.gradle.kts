// Desde AGP 9.0 el soporte de Kotlin viene integrado: agregar el plugin
// org.jetbrains.kotlin.android hace fallar el build.
plugins {
    id("com.android.application") version "9.3.1" apply false
}
