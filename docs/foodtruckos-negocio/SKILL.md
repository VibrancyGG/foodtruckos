---
name: foodtruckos-negocio
description: Modelo de negocio y disciplina de fases de FoodTruckOS — reglas de suscripción y facturación, escalera de precios por truck, archivado de dos años, y qué pertenece a Fase 1, 2 o 3. Consulta esta skill SIEMPRE que trabajes en suscripciones, cobros, precios de la plataforma, altas o bajas de trucks o negocios, el panel de administración interno, o cuando se pida una función nueva — para verificar en qué fase cae antes de construirla. Aplica también al escribir material de venta o estimar alcance.
---

# FoodTruckOS — Modelo de negocio y fases

Este producto no compite por tener más funciones: compite por ser tan simple y tan barato de operar que el dueño no tenga razones para irse ni nosotros costos ocultos para atenderlo.

Dos verdades financieras gobiernan todas las decisiones:

1. **El costo dominante no es la infraestructura, es el tiempo humano** de dar de alta y dar soporte a cada cliente. Toda decisión que reduzca ese tiempo vale más que subir el precio.
2. **Sin comisión por pedido, nunca.** Es el diferenciador central frente a las apps de delivery y no se negocia en ninguna fase.

---

## Regla 1 — La suscripción

**Mensualidad por truck activo, cobrada al negocio** (actualizado 2026-08-13):

| Trucks activos | Precio por truck | Total mensual |
|---|---|---|
| 1 | $69 | $69 |
| 2 | $59 | $118 |
| 3 o más | $49 | $147 y sube |

La escalera no tiene saltos: agregar una unidad siempre incrementa el total, y el precio unitario mejora conforme el negocio crece.

**Planes trimestral/semestral (documentado, no construido todavía):** 10% de descuento pagando 3 meses de una vez, 20% pagando 6 meses. Ej. 1 truck: $186.30 trimestral (vs $207), $331.20 semestral (vs $414). Ver conversación 2026-08-13 para la tabla completa de los tres escalones. Queda para Fase 2 o cuando haya más clientes — ver razón en "Antes de cerrar cualquier trabajo de esta área" más abajo.

- **Cobro por adelantado:** el mes que inicia se paga al inicio.
- **Todo cambio aplica al siguiente ciclo.** Truck agregado a mitad de mes se paga desde el siguiente periodo; truck dado de baja deja de pagarse el siguiente periodo. **Nunca cálculos proporcionales por días** — una sola regla para ambos casos.
- **Sin permanencia mínima.** El cliente puede irse cuando quiera. Es decisión deliberada para bajar la barrera de entrada.
- Instalación: sin cobro durante los pilotos; después, un cargo de configuración de $50–$100 (ajustable por decisión interna).
- Cobro automático vía Stripe: **Fase 2**. En Fase 1 la gestión de suscripciones es del panel admin interno.

---

## Regla 2 — Alta y baja de trucks

- El dueño **solicita** el alta desde su panel; el equipo la aprueba y configura. En Fase 1 **no es autoservicio** — cada alta amerita contacto humano para confirmar ubicación y horarios.
- Dar de baja **archiva, nunca borra**: deja de facturarse, sale del panel operativo, su QR deja de funcionar, y todos sus datos se conservan (ver skill `foodtruckos-datos`).
- **Conservación de dos años**, elegida para que las comparaciones interanuales sobrevivan a la baja. Antes de eliminar al cumplirse el plazo: avisar al cliente con opción de reactivar o descargar respaldo.
- Reactivar un truck archivado toma **minutos**, no un alta nueva.

---

## Regla 3 — El pago del pedido en Fase 1

No hay cobro en línea todavía. El comensal paga en ventanilla como siempre lo ha hecho, con **dos momentos posibles: al ordenar o al recoger**.

- La orden lleva un **estado de pago** (pendiente / pagada) que el personal marca con un toque.
- El riesgo de pedido fantasma (alguien ordena y no llega) está **aceptado como parte del modelo**. Si en la práctica duele, se mitiga con límites de órdenes abiertas por dispositivo — no se resuelve pidiéndole registro o tarjeta al comensal, nunca.
- Los cobros en línea de Fase 2 llegan **directo a la cuenta del negocio**, no a la nuestra.

---

## Regla 4 — Disciplina de fases

Cuando se pida una función, primero ubícala. Si está fuera de la fase actual, **señálalo antes de construir** — el criterio para decir "no" o "todavía no" es parte del producto.

**Fase 1 (actual):** multi-tenant desde el inicio, menú base + productos por truck, pedidos QR y captura en ventanilla, pantalla de cocina en vivo, panel del dueño con comparativas de crecimiento, actividad de venta por truck, PINs administrados por el dueño, pausa con reapertura automática, personalización de marca con vista previa en vivo, QRs descargables desde el panel.

**Fase 2 (tras validar con los primeros clientes):** **comanda impresa con app nativa Android**, cobros en línea con Stripe, promociones (descuentos, combos, 2x1, horas valle), ubicación del truck en tiempo real, pantalla pública de órdenes listas, rol Encargado (si no entró en F1), chatbot de primera línea de soporte, WhatsApp como canal de notificación.

**Fase 3 (solo si el mercado lo pide):** programa de lealtad, mensajería adicional, control de asistencia real (con las salvedades legales de la skill `foodtruckos-accesos`).

**Fase 4 (decidida, sin fecha):** otros negocios de comida — restaurantes con control por mesa, y en general cualquiera que hoy dependa de un punto de venta caro con equipo de terceros. Va en **el mismo producto**, no en una plataforma aparte: se reutiliza el menú, la marca, la cocina, los accesos, la analítica y la suscripción. Lo nuevo sería la cuenta abierta por mesa, el estado de la mesa, dividir cuenta, propina y el rol de mesero.

**El freno:** no se construye hasta tener clientes de food truck pagando de forma consistente. Es el "sí" más tentador y más caro que van a poner enfrente, y el mercado de restaurantes está lleno de competidores muy financiados, mientras que los food trucks están desatendidos — que es toda la tesis del producto. Lo único que se hace desde ahora es no cerrarle la puerta en el esquema (Regla 7 de `foodtruckos-datos`).

Si llega el momento: **se cobra por sucursal, nunca por mesa.** Por mesa castiga al restaurante grande y lo invita a registrar de menos.

**Fuera de alcance permanente:** vender, revender, inventariar o reponer hardware físico (pantallas táctiles, terminales, kioscos, impresoras). Es decisión estratégica, no limitación técnica: cada aparato que entregáramos sería capital inmovilizado antes de cobrar, más garantías, envíos y reposiciones que no tenemos cómo sostener.

**Lo que sí hacemos** — decidido en agosto 2026 al resolver la comanda impresa: publicamos una **lista corta de equipos aprobados que probamos nosotros**, y damos **soporte de instalación inicial**. El cliente compra sus aparatos. La distinción es la que cuida el margen: acompañamos la compra, no cargamos con el fierro.

Corolario para la impresora: **es opcional, nunca requisito de entrada.** El cliente elige entre dos tablets (cocina + ventanilla) o una tablet + impresora. Así el periodo de prueba sigue siendo honesto — prueban en pantalla, y agregan la impresora si les convence.

---

## Regla 5 — Cada función se mide en llamadas de soporte

Antes de dar por buena cualquier función nueva o flujo administrativo, pregunta: **¿esto genera o elimina razones para que el cliente nos llame?**

- El dueño debe poder solo: cambiar precios, marcar agotados, pausar el servicio, administrar PINs y dispositivos, descargar sus QR, solicitar altas y bajas.
- Recuperación de contraseña: automática siempre, sin intervención nuestra.
- Si un flujo requiere nuestra intervención por diseño (como el alta de trucks en F1), debe ser una decisión explícita y documentada, no un descuido.

Un producto de suscripción baja con soporte alto pierde dinero aunque venda bien.

**Regla 5.1 — Nunca repetir a mano lo que el sistema puede prellenar.** Si una configuración es la misma en el 80%+ de los casos (ej. todo platillo casi siempre necesita un grupo "¿le agregamos algo?" y uno "¿le quitamos algo?"), el sistema la crea por defecto al dar de alta el registro — el dueño solo llena el contenido, nunca repite la estructura. Antes de pedirle al dueño que haga clic en "agregar X" una vez por cada fila/platillo/truck que ya tiene, pregunta: ¿puedo crear esto automáticamente al momento del alta y dejar que lo edite o lo borre si no aplica? Aplica a cualquier pantalla nueva, no solo Menú.

---

## Antes de cerrar cualquier trabajo de esta área

1. ¿La facturación respeta "por adelantado, cambios al siguiente ciclo, sin prorrateos"?
2. ¿Algo cobra o insinúa comisión por pedido? (nunca debe)
3. ¿Estamos comprando, guardando o reponiendo algún aparato? (nunca debe — solo recomendamos y acompañamos la instalación)
3. ¿Una baja borra información en lugar de archivarla?
4. ¿La función que estoy construyendo pertenece a la fase actual? Si no, ¿lo señalé?
5. ¿Esto agrega alguna razón nueva para que un cliente nos llame?
6. ¿Se le está pidiendo algo al comensal (cuenta, tarjeta, registro) para resolver un problema del negocio? (nunca debe)
