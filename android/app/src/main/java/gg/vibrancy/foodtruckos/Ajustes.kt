package gg.vibrancy.foodtruckos

import android.content.Context

// Lo único que la app guarda por su cuenta: cuál impresora eligió este truck.
// Todo lo demás —negocio, truck, sesión, preferencias— vive en la web y en sus
// cookies, igual que en una tablet sin app.
object Ajustes {

    private const val ARCHIVO = "foodtruckos"
    private const val CLAVE_MAC = "impresora_mac"

    @Volatile
    var impresoraMac: String? = null
        private set

    fun cargar(context: Context) {
        impresoraMac = prefs(context).getString(CLAVE_MAC, null)
    }

    fun guardarImpresora(context: Context, mac: String) {
        impresoraMac = mac
        prefs(context).edit().putString(CLAVE_MAC, mac).apply()
    }

    private fun prefs(context: Context) =
        context.applicationContext.getSharedPreferences(ARCHIVO, Context.MODE_PRIVATE)
}
