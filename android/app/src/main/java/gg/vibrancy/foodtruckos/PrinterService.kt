package gg.vibrancy.foodtruckos

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder

// No hace trabajo: existe para que Android no mate el proceso.
//
// Una tablet de cocina pasa horas en la misma pantalla, y sin un servicio en
// primer plano el sistema es libre de reciclar la app en cualquier momento —
// justo a la hora pico, que es cuando menos se puede perder una comanda.
class PrinterService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(ID_NOTIF, notificacion())
        // Si el sistema llegara a matarlo de todos modos, que vuelva solo.
        return START_STICKY
    }

    private fun notificacion(): Notification {
        val nm = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Silencioso: el aviso de orden nueva lo da la pantalla de cocina.
            // Esta notificación solo existe porque Android la exige.
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

        return Notification.Builder(this, CANAL)
            .setContentTitle(getString(R.string.notif_title))
            .setContentText(getString(R.string.notif_body))
            .setSmallIcon(android.R.drawable.ic_menu_edit)
            .setContentIntent(abrir)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val CANAL = "cocina"
        private const val ID_NOTIF = 1
    }
}
