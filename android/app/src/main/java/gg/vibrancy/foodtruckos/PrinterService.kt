package gg.vibrancy.foodtruckos

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper

// Mantiene vivo el proceso y, de paso, la conexión con la impresora.
//
// Una tablet de cocina pasa horas en la misma pantalla, y sin un servicio en
// primer plano el sistema es libre de reciclar la app en cualquier momento —
// justo a la hora pico, que es cuando menos se puede perder una comanda.
//
// La notificación no es un trámite: es DONDE VIVE EL ESTADO de la impresora.
// Antes ese estado se gritaba con avisos emergentes cada pocos segundos, que
// tapaban el tablero de órdenes y parecían una falla de la app. Un estado que
// dura pertenece a un lugar que dura.
class PrinterService : Service() {

    private val mano = Handler(Looper.getMainLooper())

    // La impresora se apaga, se duerme o se sale de alcance sola. Reintentar
    // solo cuando hay algo que imprimir llega tarde; así se recupera antes de
    // que entre la siguiente orden.
    private val latido = object : Runnable {
        override fun run() {
            PrinterLink.reconectar()
            actualizar()
            mano.postDelayed(this, 10_000)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(ID_NOTIF, construir())
        mano.removeCallbacks(latido)
        mano.post(latido)
        return START_STICKY
    }

    override fun onDestroy() {
        mano.removeCallbacks(latido)
        super.onDestroy()
    }

    private fun actualizar() {
        getSystemService(NotificationManager::class.java).notify(ID_NOTIF, construir())
    }

    private fun construir(): Notification {
        val nm = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Silenciosa: el aviso de orden nueva lo da la pantalla de cocina.
            val canal = NotificationChannel(
                CANAL,
                getString(R.string.notif_channel),
                NotificationManager.IMPORTANCE_LOW,
            )
            canal.setShowBadge(false)
            nm.createNotificationChannel(canal)
        }

        val abrir = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE,
        )

        val estado = if (Ajustes.impresoraMac == null) {
            getString(R.string.sin_impresora)
        } else {
            getString(R.string.impresora_estado, PrinterLink.estado())
        }

        return Notification.Builder(this, CANAL)
            .setContentTitle(getString(R.string.notif_title))
            .setContentText(estado)
            .setStyle(Notification.BigTextStyle().bigText(estado))
            .setSmallIcon(android.R.drawable.ic_menu_edit)
            .setContentIntent(abrir)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }

    companion object {
        private const val CANAL = "cocina"
        private const val ID_NOTIF = 1
    }
}
