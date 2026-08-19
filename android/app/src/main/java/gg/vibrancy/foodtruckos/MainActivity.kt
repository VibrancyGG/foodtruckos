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

        web.addJavascriptInterface(PrinterBridge { elegirImpresora() }, "FoodTruckOSPrinter")

        web.webViewClient = object : WebViewClient() {
            // Una tablet de cocina no es un navegador. Lo que no sea nuestro
            // sitio se abre afuera, para que un enlace perdido no deje al
            // personal navegando dentro de la pantalla de trabajo.
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                val host = Uri.parse(url).host ?: return true
                if (host.endsWith(DOMINIO)) return false
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

    @SuppressLint("MissingPermission")
    private fun elegirImpresora() {
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
        AlertDialog.Builder(this)
            .setTitle(R.string.pick_printer)
            .setItems(nombres) { _, i -> PrinterLink.elegir(this, aparatos[i].address) }
            .setNegativeButton(R.string.cancel, null)
            .show()
    }

    private fun puedeBluetooth(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
            tienePermiso(Manifest.permission.BLUETOOTH_CONNECT)

    private fun tienePermiso(p: String) =
        checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED

    private fun aviso(texto: String) = Toast.makeText(this, texto, Toast.LENGTH_LONG).show()

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
        private const val DOMINIO = "foodtruckos.vercel.app"
        private const val COCINA = "https://$DOMINIO/cocina"
        private const val PERMISOS = 10
    }
}
