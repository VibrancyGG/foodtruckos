package gg.vibrancy.foodtruckos

import android.annotation.SuppressLint
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.util.Log
import java.io.IOException
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

// El enlace con la impresora. Vive fuera de la Activity a propósito: la
// conexión Bluetooth debe sobrevivir a que la pantalla gire o se apague.
//
// REGLA DE ORO DE ESTE ARCHIVO: aquí NO hay cola. Si no se puede imprimir,
// se lanza excepción y la web conserva el ticket en su propia cola de
// localStorage (lib/kitchen/printBridge.ts), que sobrevive incluso a que
// alguien mate la app. Duplicar la cola aquí sería tener dos verdades.
object PrinterLink {

    // Puerto serie estándar. Es el mismo en toda impresora ESC/POS Bluetooth.
    private val SPP: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    // Escribir en un socket que ya se cayó puede quedarse colgado. La llamada
    // viene de JavaScript y lo bloquea mientras tanto, así que se corta rápido:
    // una impresora sana responde en milisegundos.
    private const val ESCRITURA_MS = 1_500L

    private const val TAG = "PrinterLink"

    // El contexto de aplicación se guarda al arrancar: hace falta para pedirle
    // el adaptador al sistema, que es como se hace desde Android 12.
    private var app: Context? = null

    fun iniciar(context: Context) {
        app = context.applicationContext
    }

    private fun adaptador() =
        app?.getSystemService(BluetoothManager::class.java)?.adapter

    private var socket: BluetoothSocket? = null
    private val io = Executors.newSingleThreadExecutor()
    private val reconector = Executors.newSingleThreadExecutor()
    @Volatile private var reconectando = false

    val conectado: Boolean
        get() = socket?.isConnected == true

    fun estado(): String = when {
        conectado -> "listo"
        reconectando -> "conectando"
        else -> "sin-conexion"
    }

    /** Escribe los bytes tal cual. Lanza si no se pudo — el llamador NO debe
     *  tragarse el error: es lo que le dice a la web que conserve el ticket. */
    @Throws(IOException::class)
    fun escribir(bytes: ByteArray) {
        val s = socket
        if (s == null || !s.isConnected) {
            // No se bloquea esperando: se dispara la reconexión y se avisa que
            // ahora no se pudo. La web reintenta en 4 s, y la P047 tarda de 3 a
            // 5 s en volver, así que el siguiente intento suele acertar.
            reconectar()
            throw IOException("impresora no conectada")
        }
        val tarea = io.submit { s.outputStream.write(bytes); s.outputStream.flush() }
        try {
            tarea.get(ESCRITURA_MS, TimeUnit.MILLISECONDS)
        } catch (e: Exception) {
            tarea.cancel(true)
            cerrar()
            reconectar()
            throw IOException("no se pudo escribir a la impresora", e)
        }
    }

    /** Conecta si hace falta. Es seguro llamarla de más: si ya hay conexión o
     *  ya se está reconectando, no hace nada. */
    @SuppressLint("MissingPermission")
    fun reconectar() {
        if (conectado || reconectando) return
        val mac = Ajustes.impresoraMac ?: return
        reconectando = true
        reconector.execute {
            try {
                cerrar()
                val adapter = adaptador()
                if (adapter == null || !adapter.isEnabled) return@execute
                val device = adapter.getRemoteDevice(mac)
                // Cancelar el descubrimiento antes de conectar: si sigue
                // buscando, la conexión falla o tarda muchísimo.
                if (adapter.isDiscovering) adapter.cancelDiscovery()
                val nuevo = device.createRfcommSocketToServiceRecord(SPP)
                nuevo.connect()
                socket = nuevo
                Log.i(TAG, "conectada a $mac")
            } catch (e: Exception) {
                Log.w(TAG, "no se pudo conectar: ${e.message}")
                cerrar()
            } finally {
                reconectando = false
            }
        }
    }

    @SuppressLint("MissingPermission")
    fun elegir(context: Context, mac: String) {
        Ajustes.guardarImpresora(context, mac)
        cerrar()
        reconectar()
    }

    fun cerrar() {
        try {
            socket?.close()
        } catch (_: Exception) {
        }
        socket = null
    }
}
