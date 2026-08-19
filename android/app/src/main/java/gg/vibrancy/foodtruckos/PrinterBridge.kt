package gg.vibrancy.foodtruckos

import android.util.Base64
import android.webkit.JavascriptInterface

// El puente que la web ve como `window.FoodTruckOSPrinter`.
//
// La forma la manda lib/kitchen/printBridge.ts: print(base64, copias) y
// status(). Aquí no se decide NADA sobre el ticket — los bytes ya vienen
// armados por lib/kitchen/escpos.ts. Este archivo es un tubo.
//
// Que sea un tubo es lo que permite cambiar el formato de la comanda
// publicando la web, sin volver a subir la app a ninguna tienda.
class PrinterBridge(private val alElegir: () -> Unit) {

    /** Lanza si no se pudo imprimir, y ESO ES A PROPÓSITO: printBridge.ts lo
     *  atrapa y conserva el ticket en su cola para reintentarlo. Si aquí se
     *  devolviera "ok" a la brava, la web daría el ticket por impreso y la
     *  comanda se perdería en silencio. */
    @JavascriptInterface
    fun print(base64: String, copies: Int) {
        val bytes = Base64.decode(base64, Base64.DEFAULT)
        val veces = copies.coerceIn(1, 3)
        repeat(veces) {
            PrinterLink.escribir(bytes)
        }
    }

    @JavascriptInterface
    fun status(): String = PrinterLink.estado()

    /** Para que la web pueda ofrecer "cambiar impresora" sin que haya que
     *  publicar la app otra vez. Todavía no la llama nadie. */
    @JavascriptInterface
    fun pickPrinter() {
        alElegir()
    }
}
