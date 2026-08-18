package gg.vibrancy.foodtruckos

import android.app.Activity
import android.os.Bundle
import android.webkit.WebView

// Esqueleto mínimo, solo para comprobar que la cadena de compilación produce un
// APK instalable. El caparazón de verdad — sesión que sobrevive, servicio en
// primer plano, puente Bluetooth — se construye cuando la impresora pase las
// pruebas del Bloque A.
class MainActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        // Sin esto el AudioContext del aviso sonoro arranca suspendido y el
        // primer pedido no suena. Se deja puesto desde ahora para no olvidarlo.
        web.settings.mediaPlaybackRequiresUserGesture = false

        setContentView(web)
        web.loadData(
            "<h1 style=\"font-family:sans-serif\">FoodTruckOS</h1>" +
                "<p style=\"font-family:sans-serif\">Entorno de compilación verificado.</p>",
            "text/html",
            "utf-8",
        )
    }
}
