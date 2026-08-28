# Pavessa

Sistema de pedidos digitales para food trucks: el comensal escanea un QR, ordena desde su celular con la marca del negocio, y la orden aparece en vivo en la pantalla de cocina. Multi-tenant desde el día uno (varios negocios clientes en la misma plataforma, cada uno con uno o varios trucks). Producto de **VibrancyGG**, separado de los proyectos Jetgo.

- **Cliente piloto:** Antojitos Estela's — El Reno, Oklahoma. Food truck (número de unidades por confirmar con el dueño). *(Reemplazó a Taquería Express "La Villita", que era el cliente piloto original citado en el brief.)*
- **Documento maestro:** [foodtruckos-brief-proyecto.md](foodtruckos-brief-proyecto.md) — ante cualquier duda de alcance o producto, ahí está la respuesta.

## Idiomas de trabajo

- Conversación, documentación y skills: **español**.
- Código, identificadores, tablas, commits: **inglés**.
- Toda interfaz del producto: **bilingüe ES/EN desde el inicio**. Nunca hardcodear textos visibles en componentes; todo texto de usuario pasa por el sistema de traducciones (ver skill `foodtruckos-contenido`).

## Stack y cuentas

- **Frontend:** Next.js (React). Una sola aplicación con las 4 superficies: menú del comensal, panel del dueño, pantalla de cocina y admin interno. Cocina y panel del dueño instalables como PWA; wake lock en la pantalla de cocina.
- **Backend:** Supabase — Postgres con **RLS** (el aislamiento multi-tenant vive en la base de datos), Realtime, Auth (Google + correo/contraseña), Storage para fotos.
  - Proyecto: `foodtruckos`, ref `zdjwkyvewcxssuqecjan`, región East US (Ohio), org VibrancyGG.
  - Creado con **"expose new tables" desactivado** y **RLS automática activada**: toda tabla nueva nace con RLS puesta y necesita un permiso explícito en su migración para ser accesible por la API. Es deliberado — obliga a decidir conscientemente quién lee cada tabla.
- **App nativa (Fase 2):** caparazón Android que envuelve la pantalla de cocina para poder imprimir comandas en una impresora Bluetooth. **Solo la pantalla de cocina** — panel del dueño, landing, registro y menú del comensal siguen siendo web y no cambian. Vive en `C:\dev\foodtruckos\android\`.
- **Despliegue:** Vercel.
- **Cuentas:** organización **VibrancyGG** en GitHub, Supabase y Vercel (el Team de Vercel se crea al lanzar el piloto). Nada de Pavessa vive en las organizaciones o proyectos de Jetgo.
- **Código:** vive en `C:\dev\foodtruckos` (fuera de OneDrive).
- **Estos documentos:** viven en `docs/` dentro del mismo repo, para que tengan historial igual que el código. **Esta copia es la que manda.** Hay otra en la carpeta de OneDrive que es solo una instantánea: si las dos difieren, gana la del repo. Al cambiar cualquier documento, cámbialo aquí.

## Skills obligatorias

Consúltalas **antes** de trabajar en su área, aunque la tarea parezca pequeña:

| Skill | Consúltala siempre que trabajes en... |
|---|---|
| [foodtruckos-datos](foodtruckos-datos/SKILL.md) | Esquema, consultas, migraciones, reportes, precios, altas/bajas, cualquier borrado |
| [foodtruckos-diseno](foodtruckos-diseno/SKILL.md) | Pantallas, componentes, colores, tipografía, layouts |
| [foodtruckos-accesos](foodtruckos-accesos/SKILL.md) | Autenticación, roles, PINs, sesiones, y toda pantalla nueva (definir quién la ve) |
| [foodtruckos-contenido](foodtruckos-contenido/SKILL.md) | Cualquier texto visible, correos, imágenes de platillos |
| [foodtruckos-tiemporeal](foodtruckos-tiemporeal/SKILL.md) | Órdenes en vivo, conexión, sincronización, pantalla de cocina, hora pico |
| [foodtruckos-negocio](foodtruckos-negocio/SKILL.md) | Suscripción, facturación, alcance de fases, features nuevos |

Además, la skill global **`frontend-design`** es obligatoria al construir o retocar cualquier interfaz, en conjunto con `foodtruckos-diseno`.

## Reglas de oro

El detalle y el porqué viven en las skills; esto es el resumen que nunca se rompe:

1. **Aislamiento entre negocios con RLS en la base de datos**, nunca solo en la aplicación.
2. **El histórico jamás se destruye.** Un pedido guarda su propia copia de nombre, precio y personalizaciones.
3. **El comensal nunca tiene cuenta.** En ninguna fase.
4. **Dos marcas:** lo que ve el comensal es del cliente (todo por variables, nada fijo en código); el panel del dueño es Pavessa.
5. **Avanzar una orden en cocina toma un solo toque.**
6. **Toda venta — QR o ventanilla — vive en el mismo registro.**
7. **La actividad de venta nunca se llama ni se presenta como asistencia o checador.**
8. **Ninguna orden se pierde por mala conexión:** persistir localmente antes de enviar, reintentar siempre.

## Disciplina de fases

- **Fase 1 (actual):** multi-tenant, menú base + productos por truck, pedidos por QR y captura en ventanilla, pantalla de cocina en vivo, panel del dueño con comparativas de crecimiento, actividad de venta por truck, PINs administrados por el dueño, pausa con reapertura automática, personalización de marca con vista previa en vivo, QRs descargables desde el panel.
- **Fase 2:** **comanda impresa con app nativa Android** (ver decisión 8), cobros en línea (Stripe, dinero directo al negocio), promociones, ubicación del truck en tiempo real, pantalla pública de órdenes listas, rol Encargado (si no entró en F1), chatbot de soporte, WhatsApp como canal de notificación.
- **Fase 3 (solo bajo demanda):** lealtad y recompensas, mensajería adicional, control de asistencia real.
- **Fase 4 (decidida, sin fecha):** otros negocios de comida — restaurantes con control por mesa. Mismo producto, no una plataforma aparte. **No se construye hasta tener clientes de food truck pagando**, pero el esquema se escribe desde el día uno sin cerrarle la puerta (ver Regla 7 de `foodtruckos-datos`).
- **Fuera de alcance permanente:** vender, revender, inventariar o reponer hardware físico. **Sí publicamos una lista corta de equipos aprobados que probamos nosotros, y damos soporte de instalación inicial** — el cliente compra sus aparatos. La diferencia importa: acompañamos la compra, no cargamos con garantías, envíos ni inventario.

Si una tarea pide algo fuera de la fase actual, **señálalo antes de construir** (ver `foodtruckos-negocio`).

## Decisiones de producto tomadas (julio 2026)

1. **Precio:** $69/truck con 1 truck, $59 con 2, $49 con 3 o más. Sin comisión por pedido, nunca.
2. **Pago en Fase 1:** en ventanilla (el negocio cobra como siempre), con **dos momentos posibles: al ordenar o al recoger**. La orden lleva estado de pago (pendiente/pagada) que el personal marca. El riesgo de pedido fantasma está aceptado; si duele, se mitiga después con límites por dispositivo.
3. **Notificaciones al comensal:** Fase 1 = web push, con la página abierta + sonido/vibración como respaldo (web push es poco confiable en iPhone). Fase 2 agrega WhatsApp.
4. **Impuestos:** parametrizable por negocio — el dueño elige con una casilla si sus precios ya incluyen el tax o si se agrega al total. Afecta menú, ticket y reportes.
5. **PWA + wake lock** para cocina y panel del dueño.
6. **Las 3 propuestas del menú del comensal** se construyen como prototipos HTML reales con la paleta parametrizada (para poder aplicar la prueba del sol y la prueba de la paleta de verdad), no como mockups estáticos.
7. **Mejora de fotos de platillos:** **se va a conectar una API de mejora automática antes de salir a la venta — está decidido, no a evaluación.** Hoy sigue siendo manual (el dueño sube la foto tal cual y el equipo la trata: luz, fondo, acabado) por una sola razón: no gastar en llamadas de API durante las pruebas. No es duda sobre el enfoque ni espera de volumen. La línea que nunca se cruza es la de `foodtruckos-contenido`: se mejora la foto real del platillo del cliente, jamás se genera de cero un platillo que no fotografió.
8. **Comanda impresa (agosto 2026):** es costumbre del gremio, no un extra — el riel de tickets *es* la cola de trabajo de la cocina, y dos cocineros pueden tomar tickets distintos y avanzar en paralelo. Se resuelve con **app nativa de Android** que envuelve la pantalla de cocina y manda el ticket a una **impresora Bluetooth ESC/POS de 80 mm**. Así la impresora no necesita internet **propio ni configuración de red** — nada de IP fija, router ni DHCP, que es donde se atoran las de nube. (Ojo: eso **no** significa operar sin internet. Capturar en ventanilla exige conexión porque el folio lo asigna el servidor; comprobado en modo avión el 19/08/2026.) **La impresora es opcional:** el cliente elige entre dos tablets (cocina + ventanilla, como hoy) o una tablet + impresora. Se descartaron las impresoras de nube (Star CloudPRNT y Epson Server Direct Print: $257–410 y exigen que la impresora tenga internet propio), ezeep (su Print API solo acepta documentos, no hay passthrough ESC/POS, y cobra por usuario con cuota de 50 páginas/mes en el plan gratis) y un Print Bridge de escritorio (costo de soporte insostenible: Windows, antivirus, DHCP que reasigna la IP).
