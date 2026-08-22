package gg.vibrancy.foodtruckos

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.bluetooth.BluetoothManager
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast

// El caparazón. Envuelve la pantalla de cocina que ya existe y le agrega una
// sola cosa: poder hablarle a una impresora Bluetooth.
//
// Lo que NO hace, a propósito:
//   - No sabe de qué negocio es. Eso lo resuelve el emparejamiento dentro de
//     la web, con sus cookies, igual que en una tablet sin app. Por eso una
//     sola app sirve para todos los clientes.
//   - No inyecta ni toca la sesión. Las cookies son httpOnly; el nativo no
//     puede leerlas y no debe intentarlo.
//   - No interpreta el ticket. Los bytes vienen armados de la web.
class MainActivity : Activity() {

    private lateinit var web: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Refuerza el wake lock que la web ya pide: en cocina la pantalla no se
        // apaga nunca mientras la app esté al frente.
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        Ajustes.cargar(this)
        PrinterLink.iniciar(this)
        startService(Intent(this, PrinterService::class.java))

        web = WebView(this)
        configurarWeb()
        setContentView(web)

        pedirPermisos()

        if (savedInstanceState == null) web.loadUrl(COCINA)

        // Se dice la versión al arrancar. Durante estas semanas la app cambia
        // varias veces al día, y sin esto es imposible saber si la tablet
        // tiene la corrección que se acaba de publicar — ya nos costó una
        // ronda entera de diagnóstico equivocado.
        web.postDelayed({ aviso("FoodTruckOS Cocina v" + version() + " · impresora: " + PrinterLink.estado()) }, 2_500)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configurarWeb() {
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        // Sin esto el AudioContext arranca suspendido y el primer pedido del
        // día entra sin sonar — que es justo cuando nadie está mirando.
        web.settings.mediaPlaybackRequiresUserGesture = false

        // La sesión de personal vive en cookies httpOnly; si no persisten, la
        // tablet pide el PIN cada vez que se abre la app.
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false)

        // Las dos devoluciones saltan al hilo principal: el puente corre en un
        // hilo de fondo y tocar interfaz desde ahí revienta.
        val puente = PrinterBridge(
            alElegir = { runOnUiThread { elegirImpresora() } },
            avisar = { texto -> runOnUiThread { avisoLimitado(texto) } },
        )
        web.addJavascriptInterface(puente, "FoodTruckOSPrinter")

        web.webViewClient = object : WebViewClient() {
            // Una tablet de cocina no es un navegador. Lo que no sea nuestro
            // sitio se abre afuera, para que un enlace perdido no deje al
            // personal navegando dentro de la pantalla de trabajo.
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                val host = Uri.parse(url).host ?: return true
                if (DOMINIOS_PROPIOS.any { host == it || host.endsWith(".$it") }) return false
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (_: Exception) {
                }
                return true
            }
        }
    }

    private fun pedirPermisos() {
        val faltan = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!tienePermiso(Manifest.permission.BLUETOOTH_CONNECT)) {
                faltan += Manifest.permission.BLUETOOTH_CONNECT
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (!tienePermiso(Manifest.permission.POST_NOTIFICATIONS)) {
                faltan += Manifest.permission.POST_NOTIFICATIONS
            }
        }
        if (faltan.isEmpty()) prepararImpresora() else requestPermissions(faltan.toTypedArray(), PERMISOS)
    }

    override fun onRequestPermissionsResult(code: Int, permisos: Array<out String>, res: IntArray) {
        super.onRequestPermissionsResult(code, permisos, res)
        if (code != PERMISOS) return
        // Aunque digan que no: la pantalla de cocina funciona igual, solo que
        // sin papel. Nunca se deja al personal sin poder trabajar.
        if (puedeBluetooth()) prepararImpresora() else aviso(getString(R.string.bt_needed))
    }

    private fun prepararImpresora() {
        if (Ajustes.impresoraMac == null) elegirImpresora() else PrinterLink.reconectar()
    }

    private var eligiendo = false

    @SuppressLint("MissingPermission")
    private fun elegirImpresora() {
        // Sin este freno el diálogo se reabriría cada 4 s con cada reintento.
        if (eligiendo || isFinishing) return
        if (!puedeBluetooth()) {
            aviso(getString(R.string.bt_needed))
            return
        }
        val adapter = getSystemService(BluetoothManager::class.java)?.adapter
        // Solo aparatos ya emparejados: emparejar es cosa de Ajustes de
        // Android, no algo que esta app deba reinventar peor.
        val aparatos = adapter?.bondedDevices?.toList().orEmpty()
        if (aparatos.isEmpty()) {
            AlertDialog.Builder(this)
                .setMessage(R.string.no_paired)
                .setPositiveButton(R.string.settings) { _, _ ->
                    startActivity(Intent(Settings.ACTION_BLUETOOTH_SETTINGS))
                }
                .setNegativeButton(R.string.cancel, null)
                .show()
            return
        }
        val nombres = aparatos.map { "${it.name ?: "?"}\n${it.address}" }.toTypedArray()
        eligiendo = true
        AlertDialog.Builder(this)
            .setTitle(R.string.pick_printer)
            .setItems(nombres) { _, i ->
                PrinterLink.elegir(this, aparatos[i].address)
                aviso("Conectando con " + (aparatos[i].name ?: aparatos[i].address) + "…")
                // La conexión es asíncrona. Sin esta confirmación, elegir la
                // impresora se siente como que ya quedó, y no hay forma de
                // saber que falló hasta que alguien intenta imprimir.
                web.postDelayed({ aviso("Impresora: " + PrinterLink.estado()) }, 6_000)
            }
            .setNegativeButton(R.string.cancel, null)
            .setOnDismissListener { eligiendo = false }
            .show()
    }

    private fun puedeBluetooth(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
            tienePermiso(Manifest.permission.BLUETOOTH_CONNECT)

    private fun tienePermiso(p: String) =
        checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED

    private fun version(): String =
        try {
            packageManager.getPackageInfo(packageName, 0).versionName ?: "?"
        } catch (_: Exception) {
            "?"
        }

    private fun aviso(texto: String) = Toast.makeText(this, texto, Toast.LENGTH_LONG).show()

    // La web reintenta cada 4 s. Sin freno, un fallo de impresora llenaría la
    // pantalla de avisos encimados y taparía el tablero de órdenes.
    private var ultimoAviso = 0L

    private fun avisoLimitado(texto: String) {
        val ahora = System.currentTimeMillis()
        if (ahora - ultimoAviso < 15_000) return
        ultimoAviso = ahora
        aviso(texto)
    }

    override fun onResume() {
        super.onResume()
        // Volver a la app es el momento natural para recuperar la impresora si
        // se apagó mientras tanto.
        PrinterLink.reconectar()
    }

    override fun onPause() {
        super.onPause()
        // Sin este flush, un cierre brusco puede perder la sesión de personal.
        CookieManager.getInstance().flush()
    }

    @Deprecated("Se mantiene por compatibilidad con minSdk 26")
    override fun onBackPressed() {
        // Que "atrás" no cierre la pantalla de cocina a media hora pico.
        if (web.canGoBack()) web.goBack()
    }

    override fun onDestroy() {
        PrinterLink.cerrar()
        super.onDestroy()
    }

    companion object {
        // El dominio al que entra la tablet. Cambiarlo obliga a volver a
        // emparejar el aparato: la sesión de personal vive en cookies, y las
        // cookies no viajan entre dominios.
        private const val DOMINIO = "foodtruckos.vibrancygg.com"
        private const val COCINA = "https://$DOMINIO/cocina"

        // Todos los dominios que cuentan como "nuestro sitio". Está aparte del
        // de arriba a propósito: durante una mudanza los dos sirven a la vez, y
        // una tablet que siga en el viejo no debe empezar a mandar cada enlace
        // al navegador del sistema. Cuando el viejo se apague, se borra de aquí
        // y nadie tiene que reinstalar la app.
        private val DOMINIOS_PROPIOS = listOf(
            "foodtruckos.vibrancygg.com",
            "foodtruckos.vercel.app",
        )

        private const val PERMISOS = 10
    }
}
