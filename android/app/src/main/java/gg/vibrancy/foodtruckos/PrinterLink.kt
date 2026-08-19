package gg.vibrancy.foodtruckos

import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
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

    private var app: Context? = null
    private var socket: BluetoothSocket? = null
    private val io = Executors.newSingleThreadExecutor()
    private val reconector = Executors.newSingleThreadExecutor()
    @Volatile private var reconectando = false

    /** Última razón real por la que no se pudo conectar. Se muestra al usuario:
     *  "no se pudo imprimir" a secas no le sirve a nadie parado en la cocina. */
    @Volatile var ultimoError: String? = null
        private set

    fun iniciar(context: Context) {
        app = context.applicationContext
    }

    private fun adaptador() = app?.getSystemService(BluetoothManager::class.java)?.adapter

    val conectado: Boolean
        get() = socket?.isConnected == true

    fun estado(): String = when {
        conectado -> "listo"
        reconectando -> "conectando"
        ultimoError != null -> "sin conexión (${ultimoError})"
        else -> "sin conexión"
    }

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
                if (adapter == null) {
                    ultimoError = "sin Bluetooth"
                    return@execute
                }
                if (!adapter.isEnabled) {
                    ultimoError = "Bluetooth apagado"
                    return@execute
                }
                // Buscar aparatos mientras se conecta hace fallar la conexión o
                // la vuelve lentísima.
                if (adapter.isDiscovering) adapter.cancelDiscovery()

                val device = adapter.getRemoteDevice(mac)
                socket = abrir(device)
                ultimoError = null
                Log.i(TAG, "conectada a $mac")
            } catch (e: Exception) {
                ultimoError = e.message?.take(60) ?: e.javaClass.simpleName
                Log.w(TAG, "no se pudo conectar: ${e.message}")
                cerrar()
            } finally {
                reconectando = false
            }
        }
    }

    /**
     * Tres caminos, en orden de preferencia.
     *
     * El primero es el correcto y el que dice la documentación. Los otros dos
     * existen porque en buena parte de las impresoras térmicas económicas —las
     * que justamente recomendamos por precio— el camino correcto falla con
     * "read failed, socket might closed", y el único que funciona es el canal
     * fijo por reflexión. Es un truco viejo y feo, pero es lo que hace que
     * estas impresoras conecten en el mundo real.
     */
    @SuppressLint("MissingPermission")
    private fun abrir(device: BluetoothDevice): BluetoothSocket {
        val intentos = listOf<Pair<String, () -> BluetoothSocket>>(
            "seguro" to { device.createRfcommSocketToServiceRecord(SPP) },
            "inseguro" to { device.createInsecureRfcommSocketToServiceRecord(SPP) },
            "canal 1" to {
                val m = device.javaClass.getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
                m.invoke(device, 1) as BluetoothSocket
            },
        )

        var ultima: Exception? = null
        for ((nombre, crear) in intentos) {
            try {
                val s = crear()
                s.connect()
                Log.i(TAG, "conectada por camino: $nombre")
                return s
            } catch (e: Exception) {
                Log.w(TAG, "camino $nombre falló: ${e.message}")
                ultima = e
            }
        }
        throw ultima ?: IOException("no se pudo abrir el socket")
    }

    fun elegir(context: Context, mac: String) {
        Ajustes.guardarImpresora(context, mac)
        ultimoError = null
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
