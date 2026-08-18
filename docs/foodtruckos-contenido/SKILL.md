---
name: foodtruckos-contenido
description: "Voz, textos de interfaz y política de imágenes de FoodTruckOS — español e inglés sin sonar a traducción, cero jerga técnica en pantalla, lenguaje que evita implicaciones legales, y la regla de que las fotos de platillos siempre son reales. Consulta esta skill SIEMPRE que escribas o revises cualquier texto que vea un usuario: botones, mensajes de error, estados vacíos, notificaciones, correos, nombres de funciones, textos de ayuda, material de venta, o cuando trabajes con imágenes de platillos."
---

# FoodTruckOS — Voz, textos e imágenes

Los usuarios de este producto son un dueño de food truck que nunca ha pagado por software, un cocinero con prisa, y un comensal parado en la calle. Ninguno va a leer un manual ni tolerar lenguaje de sistema.

El texto en pantalla es parte del producto, no un acabado posterior.

---

## Principios de voz

**Cero jerga técnica visible.** Nunca aparecen en pantalla: "tenant", "instancia", "sincronizar", "token", "endpoint", "caché", "renderizar", "backend". Tampoco versiones suavizadas que siguen siendo jerga.

**Habla del negocio, no del sistema.** Di "tu truck está en pausa", no "el estado de la entidad es inactivo".

**Corto gana.** El botón dice "Pedir", no "Confirmar y enviar pedido a cocina".

**Nada de disculpas corporativas.** Si algo falla, di qué pasó y qué hacer, sin "lamentamos las molestias ocasionadas".

**Si un texto necesita explicar cómo funciona una función, la función está mal diseñada.** Plantea el rediseño en lugar de escribir un texto de ayuda más largo.

---

## Bilingüe de verdad

Todo existe en español e inglés, y **ninguno de los dos puede sentirse como traducción del otro**.

- Escribe cada idioma pensando en cómo lo diría alguien de ese idioma, no traduciendo palabra por palabra
- El español debe sonar natural para el mercado mexicano-estadounidense, no a español neutro de manual
- Respeta cómo la gente realmente nombra la comida: si el cliente le dice "quesabirria", el menú dice "quesabirria"
- Al diseñar, considera que el mismo texto cambia de longitud entre idiomas y no puede romper el layout

**Ejemplos:**

| Contexto | Mal | Bien (ES) | Bien (EN) |
|---|---|---|---|
| Producto agotado | "Ítem no disponible temporalmente" | "Se nos acabó" | "Sold out" |
| Truck en pausa | "Servicio suspendido" | "Regresamos a las 3:00" | "Back at 3:00" |
| Orden lista | "Su pedido ha sido completado" | "¡Listo! Pasa por él" | "Ready! Come pick it up" |
| Error de conexión | "Error de red 503" | "No pudimos enviar tu pedido. Intenta otra vez" | "We couldn't send your order. Try again" |

---

## Lenguaje que evita problemas

Hay un caso donde las palabras tienen consecuencias legales reales.

El sistema registra a qué hora entró la primera y la última orden de cada truck. Ese dato **no es un control de asistencia** y no debe presentarse como tal.

- **Usa:** "actividad de venta", "primera orden del día", "apertura efectiva"
- **Nunca uses:** "entrada", "salida", "horas trabajadas", "checar", "asistencia", "turno registrado"

Motivo: el registro de horas para efectos de nómina está sujeto a regulación laboral en Estados Unidos. Si un cliente usa la función para calcular pagos y surge un conflicto, el lenguaje de la interfaz importa. Esto aplica igual en pantallas, correos y material de venta.

---

## Política de imágenes de platillos

**Las fotos deben ser del platillo real del cliente.** Principio no negociable: el comensal no puede ver una imagen de un plato distinto al que va a recibir.

Dentro de ese principio, **sí se usa inteligencia artificial para mejorar las fotos reales**: corregir iluminación, limpiar el fondo, dar acabado profesional y consistente entre todas las imágenes del menú. La mayoría de los clientes envían fotos tomadas con celular en malas condiciones, y la diferencia visual entre una foto cruda y una tratada es enorme para las ventas.

La línea es clara:

- **Sí** — mejorar, iluminar, limpiar y uniformar una foto real del platillo del cliente
- **Sí** — generar gráficos, banners, portadas y material promocional
- **No** — generar de cero la imagen de un platillo que el cliente no fotografió

Si falta la foto de un producto, **usa un marcador de posición honesto** y pide la foto real. Nunca rellenes con una imagen genérica de banco ni generada, aunque se vea bien.

**Cómo se ejecuta hoy: manual. Cómo se va a ejecutar: con una API conectada, antes de salir a la venta.** Por ahora el dueño sube la foto tal cual la tenga y alguien del equipo la trata durante el onboarding. Que todavía no esté conectada **no es una duda de producto** — es solo por no gastar en llamadas de API mientras se prueba. Al escribir textos, no prometas ni niegues automatización: **habla de lo que el comensal recibe**, que es la foto del platillo real de ese negocio, se vea bien.

---

## Al escribir textos de sistema

**Mensajes de error:** di qué pasó, en términos del usuario, y qué puede hacer. Nunca códigos ni nombres internos.

**Estados vacíos:** son oportunidad, no hueco. "Todavía no tienes productos en este menú. Agrega el primero" funciona mejor que "Sin resultados".

**Confirmaciones destructivas:** di exactamente qué va a pasar. "Este truck dejará de recibir pedidos y su código QR dejará de funcionar. Sus ventas anteriores se conservan."

**Correos al cliente:** breves, en el idioma que el dueño eligió, firmados por el negocio cuando van dirigidos al comensal y por FoodTruckOS cuando son administrativos.

---

## Antes de dar por terminado cualquier texto

1. ¿Aparece alguna palabra que un dueño de food truck no usaría?
2. ¿Suena natural en ambos idiomas, o uno es traducción del otro?
3. ¿Algún texto sugiere control de asistencia o registro de horas?
4. ¿Alguna imagen de platillo no es del cliente?
5. ¿Este texto existe para compensar una función mal diseñada?
