# Análisis del prototipo anterior (tablas `ft_*` en el proyecto `jetgo-os`)

Revisado el 2026-07-29, antes de pausar el proyecto `jetgo-os` (Supabase, ref `aswazaiabbjeaoxkmoxw`). El prototipo convive ahí con las tablas del ERP de Jetgo. **Pausar el proyecto no borra nada**: si se necesita volver a consultarlo, se restaura.

El prototipo está considerablemente más avanzado de lo que sugería el brief. Vale la pena leer esto antes de diseñar el esquema nuevo.

---

## Lo que hay que conservar

Estas decisiones ya están tomadas y son correctas. Repetirlas, no reinventarlas.

**1. Bilingüismo en la propia base de datos.** Todas las tablas de contenido llevan columnas paralelas `name_es`/`name_en`, `description_es`/`description_en`. No hay tabla de traducciones ni claves de i18n para el contenido del cliente — el dueño escribe los dos idiomas y ya. Coincide con la skill `foodtruckos-contenido`.

**2. El pedido guarda su propia copia (Regla 2 de `foodtruckos-datos`, ya resuelta).** `ft_orders.items` es un `jsonb` con la fotografía completa de lo comprado:

```json
{
  "product_id": "...", "name_es": "Taco al pastor", "name_en": "Al pastor taco",
  "quantity": 1, "unit_base_price": 3.5, "unit_total_price": 4.5, "line_total": 4.5,
  "extras": [{ "id": "...", "name_es": "Queso extra", "name_en": "Extra cheese", "price": 1 }],
  "removed_ingredients": [], "note": "por favor mas frijoles que arroz"
}
```

Guarda nombres en ambos idiomas, precio base y precio final por unidad, extras con su precio, ingredientes quitados y la nota. Un cambio de menú posterior no altera este registro. **Es exactamente el patrón correcto.**

**3. `idempotency_key` en `ft_orders`.** Ya está previsto que un reintento no duplique la orden — la Regla 1 de `foodtruckos-tiemporeal`.

**4. Impuestos parametrizables, ya implementados.** `ft_tenants.tax_mode` (`added` / presumiblemente `included`) más `tax_rate` por negocio. La decisión #4 del CLAUDE.md ya existe en el esquema. El dato real usado es `0.08625` para zona `America/Chicago`.

**5. Pausa con reapertura automática.** `ft_tenants.paused_until` — un solo campo, la reapertura ocurre sola al pasar la hora. Simple y correcto.

**6. Numeración de orden por negocio.** `ft_tenant_counters.last_order_number` evita que el comensal vea un número global de la plataforma. Detalle pequeño que refuerza la regla de las dos marcas.

**7. Aislamiento por funciones auxiliares.** Las políticas RLS no repiten lógica: usan `ft_admin_tenant_ids()`, `ft_user_tenant_ids()` y `ft_is_super_admin()`. Patrón limpio y mantenible; conservarlo.

**8. Las órdenes no se insertan desde el navegador.** `ft_orders` tiene políticas de lectura y actualización para miembros, pero **ninguna de inserción**: el pedido del comensal entra por Edge Function con privilegios de servicio. Es la decisión correcta — el comensal no tiene cuenta y no debe poder escribir directo en la tabla.

**9. Web push ya funciona.** `ft_push_subscriptions` guarda endpoint, `failed_attempts`, `last_success_at` y `user_agent`, con una Edge Function `cleanup-push-tokens` que limpia los muertos. Hay cuatro funciones desplegadas: `notify-new-order`, `notify-status-change`, `send-email`, `cleanup-push-tokens`.

**10. `customer_locale` en la orden** — para notificar al comensal en el idioma en que ordenó. Detalle fácil de olvidar.

**11. Un sitio web público por cliente, que el brief no contempla.** `ft_site_content` (titulares, historia, dirección, redes, SEO, imagen Open Graph), `ft_site_theme` (preset, pares tipográficos, escala de radios, densidad, tratamiento del hero, íconos PWA), `ft_testimonials` y `ft_gallery_images`. El preset elegido en ambos negocios se llama **`rotulacion`**, alineado con la dirección estética del brief.

Esto es más que un menú: es un pequeño constructor de sitios. **Recomiendo tratarlo como argumento de venta de Fase 1 o 2** — un food truck que además obtiene su página web propia, con su dominio, es mucho más difícil de abandonar que uno que solo tiene un menú con QR. Encaja directo con el objetivo de "herramienta de la que el cliente no quiera salir".

**12. Vistas de analítica ya planteadas:** `ft_pilot_orders_daily` (órdenes, canceladas e ingresos por día) y `ft_pilot_notifications_delivery` (entregas por canal).

**13. El menú de "Taquería El Farol"** — 20 productos, 5 categorías, extras e ingredientes quitables, con descripciones bilingües escritas en la voz correcta ("Bien dorada. Si la pide blanda, avísele a Beto", "De caña. No es lo mismo y usted lo sabe"). Exportado completo a [foodtruckos-menu-semilla.json](foodtruckos-menu-semilla.json) y listo para sembrar en desarrollo y en las tres propuestas de diseño del menú.

---

## Lo que hay que rehacer

**1. No existe el concepto de truck. Es el cambio estructural grande.** El prototipo es de un solo nivel: un negocio (`ft_tenants`) con una sola ubicación (`ft_locations`, una fila con latitud y longitud). El brief exige dos niveles — un negocio con uno o varios trucks — y de ahí dependen el menú base con productos exclusivos por unidad, la comparación entre trucks, la actividad de venta por unidad, el QR por truck, el archivado por truck y el cálculo de la suscripción. **Prácticamente toda tabla `ft_*` necesita `truck_id` además de `tenant_id`.**

**2. `customer_phone` es obligatorio.** Contradice de frente el principio de cero fricción para el comensal. Debe ser opcional; sirve para notificar por WhatsApp en Fase 2, no para poder ordenar.

**3. No hay PINs ni vinculación de dispositivo.** Solo existe `ft_user_tenants` con roles atados a cuentas de correo. Falta toda la sección 7 del brief: código de vinculación del dispositivo, PIN de cuatro dígitos por empleado, revocación inmediata. Es trabajo nuevo completo.

**4. No hay canal de venta en la orden.** No se distingue el pedido escaneado por QR del capturado en ventanilla (Regla 6 de `foodtruckos-datos`), y no existe la captura en ventanilla como tal.

**5. No hay estado de pago.** Nada registra si el pedido se pagó al ordenar o al recoger — la decisión #2 del CLAUDE.md.

**6. No hay auditoría de las tablas `ft_*`.** El `audit_log` que existe pertenece al ERP de Jetgo. Falta el registro de cambios de precio, cambios de estado, cancelaciones, altas y bajas de personal, y pausas (Regla 5 de `foodtruckos-datos`).

**7. No hay archivado.** Ni de trucks (no existen) ni de productos: borrar un producto lo borra. El snapshot en `ft_orders.items` protege el histórico de ventas, pero no permite reconstruir el menú de un periodo pasado.

**8. `ft_tenants` es legible por cualquiera (`USING true`),** incluyendo `tax_rate` y `notification_config` de todos los negocios. Para datos de menú la lectura pública es correcta, pero conviene exponer una vista acotada con solo los campos que el comensal necesita, en lugar de la tabla completa. Lo mismo aplica a `ft_locations`, hoy con lectura pública total.

**9. `status` de la orden es texto libre** (se observó `completed`). Falta el flujo de tres columnas de la pantalla de cocina con estados acotados y validados.

**10. No existe nada de suscripción ni facturación:** ni trucks activos, ni plan, ni ciclo de cobro, ni Stripe, ni el panel de administración interno.

---

## Conclusión práctica

El prototipo resuelve bien la mitad del comensal — menú bilingüe, personalización del pedido, snapshot del pedido, notificaciones push, tema visual configurable, sitio público. Lo que falta es casi toda la mitad operativa y de negocio: trucks, personal con PIN, cocina, ventanilla, analítica comparativa, auditoría y suscripción.

**Recomendación:** esquema nuevo, escrito desde el brief, tomando de aquí los patrones probados de los puntos 1 a 10 y el contenido del punto 13. Migrar el esquema tal cual sería más caro que rehacerlo, porque agregar el nivel de truck toca cada tabla y cada política.
