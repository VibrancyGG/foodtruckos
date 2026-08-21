---
name: foodtruckos-datos
description: Reglas obligatorias de datos para FoodTruckOS — aislamiento entre negocios clientes, preservación permanente del histórico de ventas, archivado de trucks dados de baja y registro de auditoría. Consulta esta skill SIEMPRE que trabajes en el esquema de base de datos, consultas, migraciones, reportes, analítica, borrado de registros, edición de menús o precios, alta o baja de trucks, o cualquier cambio que toque cómo se guarda o se consulta información en FoodTruckOS — incluso si la tarea parece pequeña o el usuario no menciona estos temas explícitamente. Aplica también al revisar código existente.
---

# FoodTruckOS — Reglas de datos

FoodTruckOS es una plataforma de pedidos que atiende a **varios negocios de food trucks distintos desde el mismo sistema**. Cada negocio puede tener uno o varios trucks.

Dos características del negocio hacen que los errores de datos aquí sean especialmente caros:

1. Un negocio que ve información de otro es una falla de confianza irreversible. No se recupera con una disculpa.
2. El dueño paga la suscripción en buena medida por poder comparar su crecimiento año contra año. Un histórico destruido no se puede reconstruir, y el daño aparece meses después de cometido el error.

Por eso estas reglas son restricciones de diseño, no preferencias.

---

## Regla 1 — Aislamiento entre negocios

Toda tabla que contenga información de un cliente debe llevar el identificador del negocio, y **el aislamiento debe estar aplicado en la base de datos misma**, no únicamente en la capa de aplicación.

Motivo: la protección solo en el código depende de que ningún desarrollador olvide un filtro, nunca, en ninguna consulta futura. Esa apuesta se pierde eventualmente. La base de datos es la única capa que no olvida.

**Al escribir cualquier consulta:**
- Verifica que el alcance por negocio esté garantizado por la política de la base de datos, no por un `WHERE` que el desarrollador recordó poner
- Desconfía de cualquier consulta que use privilegios elevados o que evite las políticas de acceso. Si es imprescindible (procesos internos de administración), déjalo comentado y explicado

**Al crear una tabla nueva**, la primera pregunta es: ¿esta información pertenece a un negocio cliente? Si la respuesta es sí y la tabla no tiene política de aislamiento, la tabla está incompleta.

---

## Regla 2 — El histórico nunca se destruye

Este es el error más fácil de cometer y el más difícil de detectar en revisión de código, porque el sistema se ve perfectamente bien el día que se comete.

**Nunca borres ni sobrescribas información que forma parte del pasado de ventas.**

Casos concretos que deben resolverse sin destruir histórico:

| Situación | Manejo incorrecto | Manejo correcto |
|---|---|---|
| El dueño sube el precio de un platillo | Actualizar el precio en el producto | El pedido histórico conserva el precio al que se vendió |
| El dueño elimina un producto del menú | Borrar el registro del producto | Marcar el producto como retirado; sigue existiendo para los pedidos pasados |
| El dueño da de baja un truck | Borrar el truck | Archivar el truck; sus ventas siguen siendo consultables |
| El dueño cambia el nombre de un platillo | Renombrar y ya | Los pedidos pasados deben seguir mostrando lo que el cliente realmente compró |

**Principio general:** un pedido es un hecho ocurrido. Debe guardar dentro de sí el nombre, el precio y las personalizaciones tal como eran en ese momento, y no depender de que el producto actual siga existiendo o siga igual.

Si un reporte de ventas del año pasado cambia porque el dueño editó su menú hoy, hay un error grave.

---

## Regla 3 — Archivado de trucks, dos años

Cuando un dueño da de baja un truck:

- El truck deja de facturarse
- Desaparece del panel operativo y su código QR deja de funcionar
- **Toda su información se conserva, no se borra**
- Sus ventas siguen apareciendo en las comparaciones históricas del negocio
- Reactivarlo debe tomar minutos y no requerir un alta nueva

El plazo de conservación es de **dos años**, elegido específicamente para que las comparaciones de un año contra otro sigan siendo posibles después de una baja.

Antes de eliminar definitivamente al cumplirse el plazo, debe notificarse al cliente con opción de reactivar o descargar respaldo.

---

## Regla 4 — Analítica en dos niveles

El sistema debe poder responder, sin cálculos improvisados ni consultas lentas:

**A nivel del negocio completo**
- Este mes contra el mes anterior
- Este mes contra el mismo mes del año anterior
- Año acumulado contra año anterior acumulado

**A nivel de cada truck por separado**
- Las mismas comparaciones, unidad por unidad
- Comparación entre trucks en el mismo periodo

Al diseñar el esquema, valida cada decisión contra estas consultas. Si una de ellas resulta imposible o requiere reconstruir información perdida, el diseño está mal y hay que corregirlo antes de avanzar.

---

## Regla 5 — Registro de auditoría

Deben quedar registrados, con quién y cuándo:

- Cambios de precio
- Cambios de estado de un pedido
- Cancelaciones o modificaciones de pedidos
- Altas, bajas y cambios de acceso de personal
- Pausas y reaperturas de truck

Motivo: cuando un dueño sospeche que sus números no cuadran — y va a pasar — la única respuesta aceptable es mostrarle exactamente qué ocurrió. Sin ese registro, la conversación termina con el cliente perdiendo confianza en el sistema completo.

---

## Regla 6 — Toda venta queda registrada igual

Un pedido puede llegar por dos canales: escaneado por el comensal desde su celular, o capturado por el personal en la ventanilla.

Ambos son la misma venta y viven en el mismo lugar, con una marca que distingue el canal.

Nunca construyas un camino separado para los pedidos de ventanilla. Si el dueño llega a sospechar que sus números están incompletos, deja de confiar en el sistema entero — y ese es el fin de la suscripción.

---

## Regla 7 — Dejar la puerta abierta a otros negocios de comida

Decisión tomada en julio de 2026: **más adelante el producto podrá servir también a restaurantes con control por mesa**, y a cualquier negocio de comida que hoy dependa de un punto de venta caro con equipo de terceros. **No se construye ahora** — es fase posterior, después de tener clientes de food truck pagando.

Lo que sí aplica desde el primer día del esquema, porque después sale caro:

**1. La unidad de operación se nombra en genérico, no "truck".**
Un truck, una sucursal, un puesto: todos son "el lugar donde se prepara y se entrega". En la base de datos es una unidad con su tipo. En la interfaz se le puede seguir llamando "Truck" al cliente que tiene trucks — eso es una etiqueta, no una decisión de esquema.

**2. No asumir un solo código QR por unidad.**
Hoy cada truck tiene el suyo. Un restaurante tendría uno por mesa, todos apuntando a la misma unidad. El punto desde el que se pide debe poder ser más de uno por unidad, aunque en Fase 1 siempre sea uno.

**3. Un pedido no es necesariamente una venta completa.**
Es la más importante y la más cara de corregir después. En un truck se pide una vez y se acaba. En un restaurante se pide por rondas y todo se acumula en una cuenta que permanece abierta hasta que piden pagar.

Consecuencia práctica: **el estado de pago y el total no deben quedar amarrados a que un pedido sea siempre una transacción cerrada**, y los reportes deben escribirse sumando, no asumiendo una fila por venta. Un identificador de cuenta opcional y vacío en el pedido cuesta casi nada hoy y evita migrar histórico después.

**4. Los roles deben poder crecer.**
Hoy son dueño, encargado y cocina/ventanilla. Después habría mesero. Que agregar un rol no obligue a tocar lógica repartida por todo el código.

**Lo que NO se hace ahora:** mesas, cuentas abiertas, división de cuenta, propinas, rol de mesero, ni ninguna opción de "tipo de negocio" en la interfaz. La puerta queda abierta en el esquema, no en el producto.

---

## Regla 8 — Las preferencias de impresión cuelgan del dispositivo

La comanda impresa (Fase 2) se resuelve con una app nativa de Android y una impresora Bluetooth conectada a **la tablet**. La impresora nunca habla con nosotros: no tiene credenciales, no se autentica, no consulta ningún endpoint.

Por eso **no existe una tabla `printers`**. Las preferencias viven en `devices`, que ya tiene `unit_id NOT NULL`:

| Columna | Para qué |
|---|---|
| `prints_tickets` | Si esa tablet manda las comandas al papel |
| `printer_label` | Nombre visible de la impresora emparejada |
| `ticket_copies` | Cuántas copias por orden |
| `printer_last_ok_at` | Última impresión exitosa, para avisar que dejó de responder sin ir al truck |

**No van en `units`** porque un truck puede tener dos tablets y solo una con impresora. **Ni en `businesses`**, porque no es una decisión del negocio entero sino de un aparato concreto — a diferencia de `tax_included` o `timezone`, que sí afectan menú, ticket y reportes por igual.

Si algún día una impresora se autenticara sola contra nosotros, ahí sí haría falta tabla propia. Ese camino ya se evaluó y se descartó.

---

## Regla 9 — Lo público se le concede a `anon` Y a `authenticated`

El comensal nunca tiene cuenta (Regla de Oro 3), pero eso **no significa que nunca tenga sesión**. Un dueño probando su propio QR, personal de un truck comprando en otro, o cualquiera que alguna vez entró al panel en ese celular llega con sesión abierta — y la base entonces lo trata como `authenticated`, no como `anon`.

Las políticas de Postgres son **por rol**. Una política `to anon` no aplica a alguien con sesión: ese cae en la política de dueño/personal, que exige pertenecer al negocio, y su pedido se rechaza **sin dejar rastro** (error 42501, ninguna fila creada).

Pasó de verdad: solo fallaba en el celular del dueño, y desde fuera parecía un problema de conexión.

**Al abrir cualquier camino público, se conceden dos políticas con la MISMA condición** — una `to anon` y otra `to authenticated`. Nunca una más laxa que la otra: si el camino público exige que el punto de pedido esté activo y corresponda al truck, las dos lo exigen.

Y al revés: lo que es de personal (capturar en ventanilla) se queda solo en su política. Tener sesión no debe convertir a un comensal en cajero.

---

## Regla 10 — Una tabla que se mira en vivo se publica Y se pone en `replica identity full`

Que una pantalla diga "En vivo" no significa que esté recibiendo nada. Hacen falta dos cosas, y las dos se olvidan por separado:

1. **La tabla tiene que estar en la publicación `supabase_realtime`.** Si no está, la suscripción se conecta, reporta `SUBSCRIBED`, y no llega un solo evento. Le pasó a `product_options`: la cocina llevaba meses suscrita a una tabla que no publicaba nada.
2. **La tabla tiene que estar en `replica identity full`.** Con la identidad por omisión, Postgres solo le manda a Realtime la llave primaria del registro viejo, y Realtime **no puede autorizar el evento contra RLS: lo descarta sin avisar**. Los INSERT sí pasan, así que la pantalla parece sana — pero ningún UPDATE llega. Le pasó a `orders` y a `unit_products`: avanzar una orden, avisar "ya estoy aquí" y agotar un platillo entraban solo por la consulta de respaldo, con hasta 10 segundos de retraso. Medido: 10 s antes, 554 ms después.

```sql
alter publication supabase_realtime add table public.mi_tabla;
alter table public.mi_tabla replica identity full;
```

**Cómo se comprueba, porque a ojo no se ve:** suscribirse con la llave anónima al mismo canal y filtro que usa la pantalla, hacer un UPDATE por fuera y cronometrar. Si en veinte segundos no llega el evento, la consulta de respaldo está tapando el hueco.

`replica identity full` hace que cada UPDATE escriba la fila entera en el WAL. En tablas angostas y de poco volumen — que son las nuestras — no se nota; en una tabla ancha y muy escrita habría que pensarlo.

Y no al revés: una tabla que nadie mira en vivo no se publica. `order_items` y `order_status_events` solo se insertan, así que se quedan como están.

---

## Regla 11 — El folio es de un truck y de una jornada, no del negocio

El número que el comensal ve en su celular, el que sale impreso en la comanda y el que grita el cajero **se reinicia cada día y es propio de cada truck**. Nació como un consecutivo eterno por negocio y eso fallaba en dos frentes: a los seis meses el cajero gritaba "orden 4821", y con varios trucks los números se intercalaban entre ellos sin ninguna explicación para quien espera.

Lo asigna `next_order_folio_for_unit(unit_id)` desde el disparador de `orders`, con el contador en `unit_folio_counters (unit_id, service_date)`. El día se calcula a **medianoche en la zona horaria del negocio**, no la del servidor ni la de la tablet — es la misma noción de "hoy" que usa el resto del producto, para que el folio y los reportes nunca discrepen.

Cada pedido guarda su `service_date`. Sin esa columna, "orden 12" deja de tener respuesta: hay una por día.

**Lo que se rompe si se olvida:**

- **Cualquier índice único sobre `(business_id, folio)`.** Existía uno, y con el reinicio habría rechazado el segundo pedido del día siguiente con clave duplicada — es decir, el truck no habría podido vender. La garantía correcta es `(unit_id, service_date, folio)`, que es lo que el número promete de verdad.
- **Cualquier búsqueda por folio con `maybeSingle()`.** En siete días hay hasta siete pedidos con el mismo número. Se pide el más reciente y se muestra la fecha cuando no es de hoy.
- **Mostrar otro consecutivo al lado.** La tarjeta de cocina tenía uno propio del truck; desde el reinicio el folio ya es ese número, y enseñar los dos daba dos cifras distintas diciendo lo mismo.

**El histórico no se renumera.** Los folios ya asignados se quedan como están (Regla 2). Al activar el reinicio se siembra el contador del día en curso con lo que cada truck ya llevaba vendido, para que el corte limpio ocurra al día siguiente y no a media jornada.

**Pendiente conocido:** un truck abierto pasada la medianoche empieza serie nueva a mitad del servicio. No afecta a los clientes de hoy (cierran antes), y se resolvería con una hora de corte por negocio en vez de la medianoche.

---

## Antes de dar por terminado cualquier trabajo de datos

Revisa contra esta lista:

1. ¿Toda tabla nueva de cliente tiene aislamiento aplicado en la base de datos?
2. ¿Algo de lo que escribí borra o sobrescribe información pasada?
3. ¿Los pedidos guardan su propia copia de nombre, precio y personalizaciones?
4. ¿Las cuatro comparaciones de la Regla 4 siguen siendo posibles?
5. ¿Las acciones sensibles quedan registradas?
6. ¿Los pedidos de ventanilla y de QR viven en el mismo lugar?
7. ¿Estoy amarrando el esquema a "truck", a un solo QR por unidad, o a que un pedido sea siempre una venta cerrada? (Regla 7)
8. ¿Estoy creando una tabla para algo que es una preferencia de un dispositivo que ya existe? (Regla 8)
9. Si abrí un camino público, ¿lo probé con sesión iniciada y sin ella? (Regla 9)
10. Si una pantalla mira esta tabla en vivo, ¿está publicada, en `replica identity full`, y lo comprobé cronometrando un UPDATE de verdad? (Regla 10)
11. Si toqué el folio, ¿revisé los índices únicos, las búsquedas por número y que no quede otro consecutivo compitiendo en pantalla? (Regla 11)

Si alguna respuesta es incómoda, plantéalo antes de avanzar en lugar de resolverlo por tu cuenta.
