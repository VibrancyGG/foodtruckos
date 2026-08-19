package gg.vibrancy.foodtruckos

import android.util.Base64
import android.webkit.JavascriptInterface
import java.io.IOException

// El puente que la web ve como `window.FoodTruckOSPrinter`.
//
// La forma la manda lib/kitchen/printBridge.ts: print(base64, copias) y
// status(). Aquí no se decide NADA sobre el ticket — los bytes ya vienen
// armados por lib/kitchen/escpos.ts. Este archivo es un tubo.
//
// Que sea un tubo es lo que permite cambiar el formato de la comanda
// publicando la web, sin volver a subir la app a ninguna tienda.
class PrinterBridge(
    private val alElegir: () -> Unit,
    private val avisar: (String) -> Unit,
) {

    /** Lanza si no se pudo imprimir, y ESO ES A PROPÓSITO: printBridge.ts lo
     *  atrapa y conserva el ticket en su cola para reintentarlo. Si aquí se
     *  devolviera "ok" a la brava, la web daría el ticket por impreso y la
     *  comanda se perdería en silencio.
     *
     *  Pero fallar callado tampoco sirve: en la primera prueba real el botón
     *  de imprimir "no hacía nada" y no había forma de saber si faltaba
     *  elegir impresora o si no conectaba. Ahora cada fallo se dice en
     *  pantalla. */
    @JavascriptInterface
    fun print(base64: String, copies: Int) {
        if (Ajustes.impresoraMac == null) {
            // Nadie eligió impresora todavía. En vez de no hacer nada, se
            // ofrece elegirla justo cuando hace falta.
            avisar("Falta elegir la impresora")
            alElegir()
            throw IOException("sin impresora elegida")
        }

        val bytes = Base64.decode(base64, Base64.DEFAULT)
        val veces = copies.coerceIn(1, 3)
        try {
            repeat(veces) { PrinterLink.escribir(bytes) }
        } catch (e: Exception) {
            avisar("No se pudo imprimir: ${PrinterLink.estado()}. Se reintenta solo.")
            throw e
        }
    }

    @JavascriptInterface
    fun status(): String =
        if (Ajustes.impresoraMac == null) "sin-impresora" else PrinterLink.estado()

    /** Para que la web pueda ofrecer "cambiar impresora" sin que haya que
     *  publicar la app otra vez. */
    @JavascriptInterface
    fun pickPrinter() {
        alElegir()
    }
}
