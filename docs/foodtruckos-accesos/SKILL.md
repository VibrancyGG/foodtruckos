---
name: foodtruckos-accesos
description: Esquema de usuarios, roles y accesos de Pavessa — cuentas con correo para dueños, PIN vinculado a dispositivo para personal de cocina y ventanilla, y comensal sin cuenta nunca. Consulta esta skill SIEMPRE que trabajes en autenticación, inicio de sesión, permisos, roles, recuperación de contraseña, sesiones, PINs, alta o baja de empleados, o cualquier pantalla que dependa de quién es el usuario. Consúltala también antes de agregar cualquier pantalla nueva, para determinar quién debe poder verla.
---

# Pavessa — Usuarios, roles y accesos

El sistema tiene **dos poblaciones de usuarios completamente distintas**, y el error más común es tratarlas igual.

Un dueño de negocio y un cocinero de turno no se parecen en nada: uno tiene correo propio y ve dinero, el otro comparte una tablet con tres compañeros y rota cada pocos meses. Un esquema único de cuentas y contraseñas sirve mal a ambos y genera llamadas de soporte que se multiplican con cada cliente nuevo.

---

## El principio rector

**Ningún problema de acceso debería escalar al proveedor.**

| Situación | Quién la resuelve |
|---|---|
| Contraseña olvidada del dueño | Correo de recuperación automático |
| Empleado nuevo | El dueño le crea un PIN |
| Empleado que se va | El dueño lo elimina |
| Dispositivo nuevo o extraviado | El dueño genera o revoca el código |

Cada uno de estos casos que requiera intervención nuestra se convierte en costo recurrente. En un producto de suscripción baja, el soporte humano es lo que decide si el negocio es rentable.

**Al diseñar cualquier flujo de acceso, pregunta: ¿puede el dueño resolver esto solo?** Si la respuesta es no, el flujo está incompleto.

---

## El dueño

- Cuenta propia asociada a su correo electrónico
- **Entrada con cuenta de Google como opción principal**, más correo y contraseña como alternativa
- Recuperación de contraseña por correo, completamente automática
- Es quien ve dinero, precios y facturación, por lo que su cuenta requiere el mayor nivel de protección

Se prioriza Google por una razón operativa concreta: la mayoría de estos dueños ya usan Gmail, y así se elimina casi por completo el soporte por contraseñas olvidadas.

**No lo hagas exclusivo de Google.** Debe existir la alternativa de correo y contraseña para quien no quiera o no pueda usarla.

---

## El personal de cocina y ventanilla

Aquí **no debe haber cuentas de correo electrónico**. El personal rota con frecuencia, comparte la misma tablet y en muchos casos no tiene correo de trabajo. Pedirle correo a cada empleado es fricción que termina en que todos usen la misma cuenta y se pierda cualquier trazabilidad.

El esquema es de dos capas:

**1. El dispositivo se vincula una vez**
La tablet o celular del truck se conecta mediante un código que genera el dueño desde su panel. Una vez dentro, permanece vinculado — nadie tiene que iniciar sesión cada mañana.

**2. Cada persona entra con un PIN corto**
Cuatro dígitos, asignado por el dueño. Sirve para saber quién atendió cada pedido y quién abrió el turno.

**Revocación inmediata, siempre en manos del dueño:**
- Empleado que se va → el dueño elimina su PIN al momento
- Dispositivo perdido o robado → el dueño revoca el código de ese dispositivo

Un PIN eliminado deja de funcionar de inmediato, no al siguiente inicio de sesión.

---

## El comensal

**Sin cuenta, sin contraseña, sin registro. Nunca, en ninguna fase.**

Esto no es una simplificación temporal a revisar más adelante. Es parte central de la propuesta de valor: cada paso que se le pide al comensal es un cliente que se va a la fila normal.

Si una función futura parece requerir cuenta de comensal, replantea la función.

---

## Roles

| Rol | Alcance |
|---|---|
| **Dueño** | Todo: ventas, precios, menú, trucks, personalización, facturación, usuarios |
| **Encargado** | Opera un truck y ve sus ventas. No modifica precios ni accede a facturación |
| **Cocina / ventanilla** | Únicamente pantalla de órdenes y captura de pedidos en ventanilla |
| **Administración de plataforma** | Interno: alta de clientes, suscripciones, suspensiones |

El rol de **Encargado** puede posponerse a Fase 2 salvo que el cliente lo requiera desde el inicio.

**Al crear cualquier pantalla nueva, define explícitamente qué roles pueden verla antes de construirla.** El caso que más se descuida: información de dinero visible por accidente en la pantalla de cocina.

---

## Actividad de turno — qué es y qué no

El PIN habilita un dato valioso: **a qué hora entró la primera orden del día y a qué hora la última**, por truck, y qué personal estuvo activo.

De ahí sale el dato realmente útil para el dueño: la diferencia entre el horario publicado de apertura y la hora en que efectivamente empezó a vender, promediada en el tiempo.

**Pero esto no es un reloj checador y no debe presentarse como tal en ninguna pantalla ni en ningún material de venta.**

- El PIN no marca la llegada del empleado — el personal llega antes a preparar, puede pasar una hora hasta la primera orden
- La última orden no marca la salida — después queda limpiar y guardar
- No debe usarse para calcular nómina; el registro de horas para pago está sujeto a regulación laboral con responsabilidades legales asociadas

La función se llama y se presenta como **actividad de venta**, no como asistencia de personal. Cuida ese lenguaje en la interfaz.

---

## La impresora no es un usuario ni un dispositivo aparte

La impresora de comandas cuelga de la tablet por Bluetooth. **No tiene identidad en el sistema:** no se empareja con código, no tiene PIN, no abre sesión, y no es una fila en `devices`. Es un accesorio de la tablet que ya está emparejada.

Consecuencia práctica: **la app nativa de Android no agrega ninguna superficie de autenticación nueva.** El emparejamiento por código y la entrada por PIN siguen ocurriendo dentro de la misma web que la app envuelve, con las mismas cookies `httpOnly`. La app no puede inyectar la sesión desde el lado nativo, y no debe intentarlo.

Y como solo imprime la tablet emparejada de ese truck, **el aislamiento entre negocios lo da la sesión de personal que ya existe** — no hace falta comprobación nueva.

Si alguien propone un token para la impresora, o un endpoint que la impresora consulte por su cuenta, es señal de que se está volviendo al camino que ya se descartó por costo de soporte.

---

## Nadie de VibrancyGG conoce la contraseña de un dueño

El admin interno **no puede cambiar contraseñas**, y no es un hueco: es la decisión.

Quien pone la contraseña puede entrar como el dueño — cambiar precios, marcar pedidos como pagados, ver ventas — y el día que el cliente diga *"yo no cambié eso"* no habría forma de distinguir quién fue. Es un problema de confianza con el cliente, no de código.

Lo que sí existe, para el caso real de soporte ("el dueño no puede entrar y llamó"), es **Mandar enlace de contraseña** en la fila del negocio: dispara el mismo correo que el dueño se manda a sí mismo desde "olvidé mi contraseña". El admin desbloquea la situación, la contraseña la elige el dueño, y queda registrado en la bitácora (Regla 5 de datos) — que es justo lo que un cambio directo NO dejaría.

Si el dueño perdió el acceso al buzón, el paso es **cambiarle el correo de la cuenta** tras verificar quién es, y que él haga la recuperación al nuevo. Sigue sin que nadie conozca su contraseña.

`auth.users` no se expone por la API. La única puerta a esos correos es `admin_owner_email(business_id)`, y es estrecha a propósito: devuelve un solo correo, de un solo negocio, con **dos capas** — `execute` concedido solo a `authenticated`, y `is_platform_admin()` comprobado otra vez dentro de la función. Comprobado que con la llave anónima devuelve `permission denied`.

**Nunca** se agrega una función que fije la contraseña de otro usuario.

## Antes de dar por terminado cualquier trabajo de accesos

1. ¿El dueño puede resolver este caso sin llamarnos?
2. ¿La revocación surte efecto de inmediato?
3. ¿Alguna pantalla nueva muestra información de dinero a un rol que no debería verla?
4. ¿Se está pidiendo alguna cuenta o registro al comensal? (nunca debe ser así)
5. ¿El lenguaje en pantalla evita sugerir control de asistencia?
6. ¿Le estoy dando identidad propia a un accesorio que debería colgar de un dispositivo ya emparejado?
7. ¿Estoy dándole a alguien la capacidad de fijar la contraseña de otro, en vez de mandarle un enlace para que la elija él?
