---
name: foodtruckos-tiemporeal
description: Confiabilidad y tiempo real de Pavessa — órdenes que nunca se pierden, actualización en vivo sin recargar, reconexión con re-sincronización, y comportamiento correcto con conexión inestable en hora pico. Consulta esta skill SIEMPRE que trabajes en el flujo de órdenes, la pantalla de cocina, el seguimiento del pedido del comensal, suscripciones de tiempo real, manejo de conexión, sincronización de estado, o cualquier pantalla que deba actualizarse sola — incluso si la tarea parece un ajuste menor. Aplica también al revisar código existente de estas áreas.
---

# Pavessa — Tiempo real y confiabilidad

El contexto real de este producto es un truck en hora pico: la cocina con las manos ocupadas, el internet saliendo de un hotspot de celular, y un sábado a la una de la tarde donde cada falla es una venta perdida de verdad.

Dos de los puntos críticos del proyecto viven aquí: **confiabilidad en hora pico** y **ninguna venta se pierde del registro**. Un sistema de pedidos que pierde una orden una sola vez pierde la confianza del dueño para siempre.

---

## Regla 1 — Una orden capturada nunca se pierde

Desde el momento en que alguien toca "Pedir" — comensal o personal de ventanilla — esa orden es sagrada.

- **Persistir localmente antes de enviar.** La orden se guarda en el dispositivo primero, y de ahí se envía. Si la red falla a mitad del envío, la orden sigue existiendo y se reintenta.
- **Reintentos automáticos con cola.** Las órdenes pendientes de envío se reintentan solas, en orden, sin que el usuario haga nada. Nunca un mensaje de "error, vuelve a capturar tu pedido".
- **Idempotencia:** cada orden lleva un identificador generado en el dispositivo, para que un reintento no cree la orden duplicada. Una orden duplicada en cocina es casi tan grave como una perdida.
- Lo mismo aplica a los **cambios de estado** que marca la cocina: si el toque de "lista" no llegó al servidor, se reintenta solo; el operador no tiene que volver a tocar.

---

## Regla 2 — El estado de la conexión siempre es visible

En cocina y ventanilla debe verse de un vistazo si el sistema está en línea, sin estorbar.

- Conectado: discreto, casi invisible.
- Desconectado: inconfundible, con cuántas órdenes están en cola esperando enviarse.
- **Nunca fingir que todo está bien sin conexión.** El personal debe saber que está trabajando en modo local y que las órdenes nuevas del QR no están llegando.

Motivo: la falla silenciosa es la peor — la cocina cree que no hay pedidos mientras los comensales ven su orden "enviada". Eso termina en clientes esperando comida que nadie está preparando.

---

## Regla 3 — Reconectar es re-sincronizar

Los eventos en vivo que ocurrieron durante una desconexión **no se recuperan solos**. Confiar únicamente en el canal de eventos es el error clásico de esta especialidad.

- Al reconectar, siempre se pide el **estado completo actual** (las órdenes abiertas y sus estados) y se reconcilia con lo local.
- La misma re-sincronización ocurre cuando la pantalla vuelve de estar en segundo plano o la tablet despierta.
- El canal en vivo es una optimización sobre la sincronización, no un reemplazo. Si el canal falla, debe existir **respaldo por consulta periódica** (polling) para que el sistema siga funcionando, más lento pero completo.

---

## Regla 4 — Actualización optimista, con verdad del servidor

El toque en cocina debe responder **al instante**: la orden cambia de columna de inmediato, y el envío al servidor ocurre por detrás.

- Si el servidor confirma: nada que hacer.
- Si el servidor rechaza o no responde: la interfaz lo muestra y reintenta; nunca se revierte en silencio.
- La fuente de verdad final es siempre el servidor. Ante conflicto (dos dispositivos moviendo la misma orden), gana el estado del servidor y la pantalla se corrige sola.

---

## Regla 5 — La pantalla de cocina no se duerme

- **Wake lock activo** mientras la pantalla de órdenes está abierta: la tablet de cocina no puede apagarse sola a mitad del turno.
- Cocina y panel del dueño se instalan como **PWA**: pantalla completa, ícono propio, arranque directo.
- Una orden nueva se anuncia con **sonido**, no solo visualmente — la cocina no está mirando la pantalla.

---

## Regla 5.1 — La impresión cuelga del mismo punto que el sonido

La comanda impresa **no tiene su propio camino de detección**. Cuando entra una orden nueva, el tablero ya lo sabe en un solo lugar — el mismo punto donde suena el aviso — y ahí converge todo: el canal en vivo, la consulta periódica de respaldo y la re-sincronización al reconectar.

Dos consecuencias al tocar esa parte:

- **Las órdenes nuevas se manejan como lista, nunca como booleano.** Si entran dos en el mismo ciclo, son dos comandas y dos avisos — no uno.
- **La cola de impresión sigue la Regla 1:** el ticket se guarda antes de mandarlo y se reintenta solo. Si la impresora está apagada, sin papel o fuera de alcance, la comanda sale cuando vuelva.

Y como el ticket se arma en el cliente, **imprimir no depende de que la red responda**: los bytes nunca salen a internet.

**Lo que esto NO significa, y se afirmó mal durante un tiempo:** que el truck pueda operar sin internet. Capturar en ventanilla exige conexión, porque el folio lo asigna el servidor y es el número que el comensal escucha. Probado en modo avión el 19/08/2026: la orden no se crea. Lo capturado **sí se conserva** en pantalla —el carrito no se limpia al fallar— y basta volver a enviar cuando regresa la señal, así que no hay pérdida de trabajo.

Eso **viola la Regla de Oro 8** (*persistir localmente antes de enviar, reintentar siempre*), que hoy solo cumplen las acciones sobre órdenes existentes — avanzar, regresar, entregar, cancelar—, no la creación de una orden de ventanilla.

Resolverlo de verdad pide **reservar bloques de folios por tablet** mientras hay conexión, y reconciliar al volver. Está pospuesto a propósito hasta ver con el piloto qué tan seguido se cae el hotspot: cuando no hay internet tampoco entran pedidos por QR, así que el truck ya está parado por otro lado.

---

### Límite conocido: con la pantalla apagada, la comanda tarda minutos

Probado el 19/08/2026 en la tablet real: con la pantalla apagada diez minutos, la orden **sí llegó y sí se imprimió**, pero tardó varios minutos en vez de salir al instante. Android estrangula temporizadores y conexiones en cuanto la pantalla se apaga.

**Se deja así a propósito.** La pantalla de cocina no debe apagarse nunca —hay wake lock desde la web y el caparazón lo refuerza con `FLAG_KEEP_SCREEN_ON`—, así que esto solo ocurre si alguien presiona el botón físico. El servicio en primer plano cumple lo suyo: el proceso sobrevive y la comanda acaba saliendo.

La única mejora real sería pedir exención de optimización de batería, y eso obliga al cliente a aceptar un diálogo de Android que asusta y que no siempre se concede. No compensa para un caso que no debería ocurrir.

---

## Regla 6 — Diseñado para el peor dispositivo, no el mejor

- El comensal usa un celular de gama baja con señal irregular: del escaneo del QR al menú visible deben pasar segundos, con imágenes optimizadas y sin bibliotecas pesadas.
- El seguimiento del pedido del comensal usa el mismo principio de re-sincronización: si cerró y volvió a abrir la página, ve el estado actual correcto.
- Notificación de "orden lista" en Fase 1: web push **más** la página abierta con sonido/vibración como respaldo — web push no es confiable en iPhone y no puede ser el único canal.

---

## Pruebas antes de dar por terminado cualquier trabajo de esta área

**La prueba del modo avión:** en mitad de un flujo — orden a medio enviar, cocina con órdenes abiertas — activa modo avión, sigue usando la aplicación, y reconecta después de un par de minutos. Ninguna orden perdida, ninguna duplicada, estados correctos en todas las pantallas.

**La prueba del sábado:** simula varias órdenes entrando en ráfaga mientras la cocina avanza otras. Nada se traba, nada se pierde, el orden de llegada se respeta.

**La prueba de la tablet dormida:** deja la pantalla de cocina inactiva, despiértala, y verifica que muestre el estado real actual sin tocar nada.

**La prueba de las dos órdenes juntas (si hay impresión):** haz que entren dos pedidos en el mismo ciclo de refresco. Deben salir **dos** comandas, no una.

---

## Antes de cerrar cualquier trabajo de tiempo real

1. ¿Una orden capturada sobrevive a una caída de red en cualquier punto del flujo?
2. ¿Un reintento puede crear duplicados? (no debe)
3. ¿La desconexión es visible e inconfundible en cocina y ventanilla?
4. ¿Al reconectar se re-sincroniza el estado completo, o se confía solo en eventos?
5. ¿Existe respaldo por consulta periódica si el canal en vivo falla?
6. ¿El wake lock está activo en la pantalla de cocina?
7. Si hay impresión: ¿dos órdenes en el mismo ciclo producen dos comandas, y un ticket sobrevive a la impresora apagada?
7. ¿Se probó con modo avión a mitad del flujo?

Si alguna respuesta es incómoda, plantéalo antes de avanzar en lugar de resolverlo por tu cuenta.
