



## 1. Resumen ejecutivo

FoodTruckOS es un sistema de pedidos digitales pensado específicamente para food trucks.

El cliente escanea un código QR pegado en el truck, ve el menú con fotos en su celular, arma su pedido con las personalizaciones que quiera, y lo envía. El pedido aparece de inmediato en una pantalla en la cocina. El personal lo va marcando conforme avanza, y el cliente ve el progreso en vivo desde su teléfono, sin instalar ninguna aplicación.

El dueño, desde su propio panel, ve las ventas de todos sus trucks en un solo lugar, puede pausar el servicio cuando lo necesite, y actualizar el menú o los precios al momento.

**Lo que lo hace distinto:** no requiere comprar ningún equipo. Funciona con los celulares y tablets que el negocio ya tiene.

---

## 2. El problema que resuelve

Los food trucks hoy operan con herramientas que no fueron hechas para ellos:

- **Menús en PDF o banners impresos.** Cambiar un precio implica reimprimir. Si algo se acaba, no hay forma de avisar más que decirlo de viva voz.
- **Apps de delivery que cobran comisión** por cada pedido, y donde el negocio no es dueño de la relación con su cliente.
- **Sistemas de restaurante tradicionales** diseñados para locales fijos: caros, con equipo físico incluido, y sin resolver lo que hace único a un food truck.

**Lo específico del food truck que nadie está atendiendo:**

- **Se mueve.** Hoy está en un lugar, mañana en otro. Los clientes necesitan saber dónde está.
- **Se pausa.** Se acaba el gas, hay cambio de turno, el personal descansa. Hoy la única opción es cerrar la ventanilla y perder los pedidos de esa hora.
- **No tiene equipo administrativo.** El dueño hace todo. Cualquier sistema complicado simplemente no se usa.
- **La herramienta estara en Ingles y Español (EN/ES), entonces sera amigable para todos los usuarios que interactuen en ella indiferente del indioma que hablen y del rol que tengan

---

## 3. Cliente piloto

**Taquería Express "La Villita"** — Norman, Oklahoma.

- Negocio consolidado, con más de mil reseñas y calificación cercana a 4.7 estrellas
- Opera **tres trucks**
- Actualmente maneja su menú en PDF/banner impreso
- Ya está en plataformas de delivery, es decir, ya paga comisiones a terceros
- Hay compromiso verbal para participar como piloto

Este cliente es representativo del perfil objetivo: negocio establecido, con varias unidades, sin herramientas digitales propias.

---

## 4. Cómo funciona el sistema, por tipo de usuario

### El cliente (comensal)

- Escanea el QR del truck donde está — cada truck tiene el suyo
- Ve el menú con fotos, precios y descripciones, **con la marca y los colores del negocio**
- Personaliza: elige el tipo de carne, quita ingredientes que no quiere, agrega extras que se cobran aparte, escribe notas especiales
- Ve el total antes de confirmar
- Recibe un número de orden y sigue el avance en vivo: recibido → preparando → listo → entregado
- **No necesita registrarse ni descargar nada**

### El personal de cocina / cajero

- Entra a la aplicación con un PIN corto (ver sección 7)
- Ve las órdenes entrantes en una pantalla organizada en tres columnas: nuevas, en preparación, listas
- Avanza cada orden con un solo toque — debe ser así de simple, porque el personal está cocinando, no administrando un sistema
- Puede **capturar pedidos de clientes que llegan sin celular**, directamente en la ventanilla, y esos pedidos entran al mismo sistema
- Puede marcar productos como agotados en el momento
- Si maneja varios trucks, puede filtrar por unidad

### El dueño

- Ve las ventas de cada truck y el total del negocio
- Ve de dónde vienen las ventas: pedidos por QR vs. pedidos capturados en ventanilla
- Ve cuáles son los productos más vendidos
- **Compara su crecimiento en el tiempo**, a nivel de todo el negocio y a nivel de cada truck (sección 5)
- **Ve la ventana de actividad de venta de cada truck** — a qué hora entró la primera orden y la última (sección 8)
- **Pausa o reabre cualquier truck**, indicando hasta qué hora y por qué motivo. El cliente ve un mensaje explicando la pausa y puede pedir aviso cuando reabran
- Administra el menú: un menú base compartido por todos los trucks, más productos exclusivos de una unidad específica
- Administra horarios de operación por día
- **Personaliza la apariencia de su menú**: logo, color, foto de portada (sección 6)
- **Administra los accesos de su personal**: genera y revoca PINs (sección 7)
- **Solicita agregar o dar de baja un truck** desde su propio panel

### Administración de la plataforma (interno)

- Alta de nuevos negocios clientes
- Gestión de suscripciones, altas y bajas de trucks
- Suspensión de cuentas por falta de pago

---

## 5. Analítica y comparación de crecimiento

Este punto merece su propia sección porque es una de las razones por las que un dueño se queda pagando mes a mes. La venta diaria la puede ver en cualquier lado; **lo que nadie le da hoy es la lectura de si está creciendo o no.**

El sistema debe permitir comparar en dos niveles:

**Nivel negocio (todas las unidades juntas)**
- Este mes contra el mes anterior
- Este mes contra el mismo mes del año pasado
- Este año acumulado contra el año pasado acumulado

**Nivel truck (cada unidad por separado)**
- Las mismas comparaciones, unidad por unidad
- Comparación de trucks entre sí en el mismo periodo — cuál rinde más, cuál está cayendo

**Consecuencia de diseño que el equipo debe tener presente:** para que estas comparaciones existan, la información histórica no puede borrarse ni perderse cuando un truck deja de operar o cuando cambia el menú. El historial de ventas debe seguir siendo consultable aunque la unidad ya no esté activa y aunque el producto ya no exista en el menú actual.

Es fácil construir un sistema que muestre bien el presente y destruya el pasado sin querer. Aquí eso sería un error grave.

---

## 6. Identidad visual y personalización por cliente

### El principio: son dos marcas distintas

Esta es la decisión de diseño más importante del proyecto y debe entenderse antes de dibujar una sola pantalla.

- **Lo que ve el comensal pertenece al cliente.** Un comensal frente a un truck de La Villita debe sentir que está viendo el menú de La Villita, no el de un proveedor de software. Nuestro nombre no aparece, o aparece de forma discreta al pie.
- **Lo que ve el dueño es nuestro producto.** El panel de administración sí lleva la identidad de FoodTruckOS.

En consecuencia, el color principal, el logo y las imágenes de marca deben ser **configurables por cliente desde el inicio**. Si el sistema se construye con colores fijos, para el tercer cliente el equipo estará reescribiendo estilos a mano.

### Qué puede personalizar el dueño — y qué no

El objetivo es que sienta que compró algo hecho a su medida, **sin convertirlo en una decisión difícil**. Se le piden únicamente cuatro cosas:

1. **Su logo** — sube la imagen
2. **Un color principal** — elegido de una **paleta curada de aproximadamente diez opciones**, no de un selector libre de color
3. **Una foto de portada** para el encabezado de su menú
4. **Un estilo visual**, entre dos o tres alternativas ya diseñadas (por ejemplo: "Tradicional", "Moderno", "Vibrante")

**Vista previa en vivo, obligatoria.** Mientras el dueño elige, debe ver su menú real cambiando en pantalla. Ese es el momento en que el producto se siente personalizado; sin él, esto se convierte en un formulario más.

**Por qué paleta curada y no selector libre:** con libertad total van a aparecer combinaciones ilegibles — amarillo sobre blanco, texto claro sobre fondo claro — y el menú deja de leerse bajo el sol. Con un conjunto acotado de opciones ya probadas, cualquier elección funciona. Adicionalmente, el sistema debe **ajustar automáticamente el color del texto** para garantizar contraste suficiente sobre el color elegido.

### Alcance de la personalización

- La marca se define **a nivel del negocio**, no de cada truck. Todos los trucks heredan logo y color.
- Cada truck sí tiene **nombre y foto propios**, para que el comensal identifique en cuál está.
- Debe existir la posibilidad de **sobrescribir color y logo en un truck específico**, para el caso poco común de un negocio con unidades de marcas distintas. Es una excepción disponible, no una decisión que todos deban tomar.

### Dirección estética recomendada

La referencia no son las apps de delivery. Ese estilo neutro existe porque debe servir a miles de restaurantes distintos y por eso no tiene personalidad. Aquí sí se puede tener.

La referencia rica está en el mundo del propio cliente: la **rotulación mexicana** **Comida Callejera Estadounidense**— los letreros pintados a mano de las taquerías, con letras condensadas, sombras marcadas y colores saturados. No se trata de imitarla literalmente, sino de destilar su energía: **estructura de aplicación limpia y moderna, con la personalidad viviendo en la tipografía y el color.**

**Menú del comensal**
- Tipografía de títulos condensada y con peso, de carácter; el resto en una tipografía neutra de máxima legibilidad
- Foto grande del platillo, precio con jerarquía fuerte, un solo color de acento
- La personalización del pedido como pasos claros con botones grandes, nunca como formulario

**Panel del dueño**
- Lo opuesto: moderno, minimalista, ordenado, casi sobrio. Números grandes, sin adornos
- Debe entenderse sin capacitación. El dueño no es usuario de software
- Con graficos de barras, torta y otros que muestren con un vistazo el estado de su negocio
- Es el único lugar donde la marca FoodTruckOS aparece con fuerza

**Pantalla de cocina**
- Fondo oscuro, texto muy grande, color usado solo con función: verde = lista, ámbar = lleva tiempo, rojo = urgente
- Cero decoración. Se lee de reojo, a metro y medio de distancia, con las manos ocupadas

**Panel de administración interno**
- Minimalista y funcional. Es herramienta de trabajo interno, no producto de venta.
- Debe tener un espacio dedicado a ver los clientes activos, numero de trucks, tiempo de suscripcion a la plataforma.
- Tambien debe tener su KPIs enfocados al negocio en este caso interno mostrando el estado del mismo
- Posibilidad de conectar con Stripe para cobros agendados automaticos  



### Trabajo de diseño

**tres propuestas de una sola pantalla** — el menú del comensal — antes de diseñar cualquier otra cosa. Es la pantalla que vende el producto y la que más se verá.

Y una prueba de descarte que no se negocia: **imprimir la pantalla, salir al sol y verla en un celular de gama baja.** Si no se lee ahí, no sirve.

---

## 7. Usuarios, roles y accesos

Esta sección existe porque el sistema tiene **dos poblaciones de usuarios completamente distintas**, y tratarlas igual sería un error costoso.

### El dueño

- Cuenta propia, asociada a su correo electrónico
- **Entrada con cuenta de Google como opción principal**, más correo y contraseña como alternativa
- Recuperación de contraseña por correo, automática, **sin intervención nuestra en ningún caso**
- Es quien ve dinero, precios y facturación, por lo que su cuenta requiere el mayor nivel de protección

Se prioriza la entrada con Google por una razón operativa concreta: la mayoría de estos dueños ya usan Gmail, y así se elimina casi por completo el soporte por contraseñas olvidadas — que es exactamente el tipo de llamada recurrente que erosiona el margen.

### El personal de cocina y ventanilla

Aquí **no debe haber cuentas de correo electrónico**. El personal rota con frecuencia, comparte la misma tablet y en muchos casos no tiene correo de trabajo.

- La tablet o celular del truck se vincula una sola vez mediante un **código que genera el dueño** desde su panel, y permanece dentro
- Cada persona del personal entra con un **PIN corto de cuatro dígitos**, asignado por el dueño
- Si un empleado deja el negocio, **el dueño elimina su PIN al momento**, desde su panel, sin llamarnos
- Si se pierde o roba un dispositivo, el dueño revoca el código del dispositivo
- Debe haber la posibilidad de generar varios pines de acceso en caso que el dueño tenga dos empleados o mas, ejemplo uno en cocina y un cajero


### El comensal

Sin cuenta, sin contraseña, sin registro, nunca. Es parte central de la propuesta de valor y no debe negociarse en ninguna fase.

### Roles

| Rol | Alcance |
|---|---|
| **Dueño** | Todo: ventas, precios, menú, trucks, personalización, facturación, usuarios |
| **Encargado** | Opera un truck y ve sus ventas. No modifica precios ni accede a facturación |
| **Cocina / ventanilla** | Únicamente pantalla de órdenes y captura de pedidos en ventanilla |
| **Administración de plataforma** | Interno: alta de clientes, suscripciones, suspensiones |

El rol de **Encargado** puede posponerse a Fase 2, salvo que el cliente piloto lo requiera desde el inicio — con tres trucks es probable que sí.

### Principio rector de esta sección

**Ningún problema de acceso debería escalar a nosotros.**

- Contraseña olvidada del dueño → correo de recuperación automático
- Empleado nuevo → el dueño le crea un PIN
- Empleado que se va → el dueño lo elimina
- Dispositivo nuevo o extraviado → el dueño genera o revoca el código

Cada uno de estos casos que requiera intervención nuestra se convierte en costo recurrente que se multiplica con cada cliente nuevo.

---

## 8. Actividad de venta por turno

El uso de PIN habilita un dato que el dueño hoy no tiene de ninguna manera, y que tiene valor comercial real.

### Qué muestra el sistema

Por truck y por día:
- Hora de la **primera orden** del día
- Hora de la **última orden** del día
- Qué personal estuvo activo en ese turno

Y sobre eso, el dato realmente valioso: **la diferencia entre el horario publicado de apertura y la hora en que efectivamente entró la primera orden**, promediada en el tiempo.

Si un truck abre oficialmente a las 11:00 y lleva tres semanas registrando su primera venta a las 11:40, son cuarenta minutos de venta perdidos todos los días, en una unidad donde el dueño no está presente. Hoy no tiene forma de detectarlo. El panel debe presentarlo de forma directa, por ejemplo: *"Apertura promedio: 22 minutos tarde"*. Lo mismo aplica para cierres anticipados.

### Qué NO es, y debe quedar explícito en el producto

Esto **no es un reloj checador ni un registro de horas laboradas**, y no debe presentarse como tal en ninguna pantalla ni en ningún material de venta:

- **El PIN no marca la llegada del empleado.** El personal llega antes a encender la plancha y preparar insumos; puede pasar una hora entre que llega y entra la primera orden.
- **La última orden no marca la salida.** Después queda limpiar y guardar.
- **No debe usarse para calcular nómina.** El registro de horas trabajadas para efectos de pago está sujeto a regulación laboral en Estados Unidos, con responsabilidades legales asociadas. Ese no es un riesgo que este producto deba asumir.

La función se llama y se presenta como **actividad de venta**, no como asistencia de personal.

Si en el futuro algún cliente pide un control de asistencia real, se construye como función separada, con marcado explícito de entrada y salida y con advertencia clara de que no sustituye un sistema de nómina. Corresponde a Fase 3, y solo bajo demanda.

---

## 9. Alcance por fases

### Fase 1 — Lo que debe salir primero

Todo lo descrito en las secciones 4 a 8, con estas precisiones:

- **Varios negocios clientes en la misma plataforma, cada uno con su información completamente separada.** Requisito desde el inicio, no algo a agregar después. Hay clientes potenciales con múltiples trucks, y el modelo de negocio depende de vender a varios negocios distintos.
- Estructura de dos niveles: un **negocio** (por ejemplo "La Villita") que puede tener **uno o varios trucks**. La suscripción se cobra al negocio, calculada por número de trucks activos.
- Menú base compartido entre trucks, con posibilidad de productos exclusivos por unidad
- Personalización de marca por cliente, con vista previa en vivo
- Accesos por PIN para personal, administrados por el dueño
- Pausa temporal con reapertura automática a la hora indicada
- Captura de pedidos en ventanilla para clientes sin celular
- Panel de ventas comparativo entre trucks y en el tiempo
- Ventana de actividad de venta por truck
- Generación de códigos QR **desde el propio panel del dueño**, para descargar e imprimir sin depender de nosotros

### Fase 2 — Después de validar con los primeros clientes

- Cobros en línea (tarjeta, pagos desde el celular), con el dinero llegando directamente a la cuenta de cada negocio
- Promociones: descuentos por porcentaje, combos, 2x1, ofertas por tiempo limitado, descuentos en horas de baja venta
- Ubicación del truck en tiempo real, actualizable desde el celular del operador
- Pantalla pública de órdenes listas, tipo monitor de aeropuerto
- Rol de Encargado, si no se incluyó en Fase 1
- Tener un chatbot en la plataforma para que el cliente pueda solucionar dudas, esto como primera linea de atencion o soporte

### Fase 3 — Solo si el mercado lo pide

- Programa de lealtad y recompensas
- Canal adicional de notificaciones por mensajería
- Control de asistencia real, con las salvedades de la sección 8

**Fuera de alcance de forma explícita:** no se contempla vender ni dar soporte a equipo físico (pantallas táctiles, terminales, kioscos de autoservicio). El sistema debe funcionar en los dispositivos que el negocio ya posee. Es una decisión estratégica, no una limitación técnica.

---

## 10. Modelo de negocio y reglas de suscripción

### Precios

**Suscripción mensual calculada por truck activo**, cobrada al negocio:

| Trucks activos | Precio por truck | Total mensual |
|---|---|---|
| 1 | ~$49 | ~$59 |
| 2 | ~$39 | ~$78 |
| 3 o más | ~$29 | ~$87 y sube |

La escalera no tiene saltos: agregar una unidad siempre incrementa el total, y el precio unitario mejora conforme el negocio crece.

**Sin comisión por pedido.** Es el diferenciador más importante frente a las apps de delivery y frente a los sistemas de punto de venta existentes.

### Instalación y puesta en marcha

**Sin cobro de instalación, o con un cobro simbólico**, compensado con la mensualidad. 
Decisión tomada por dos razones: en etapa de pilotos, cualquier costo inicial es una barrera fuerte para un dueño que nunca ha pagado por software; y porque el proceso de alta se va a automatizar en gran medida (sección 11), reduciendo el costo real que ese cobro pretendía cubrir.
Ya despues de la etapa piloto se cobrara un costo por realizar el set up del producto que esta en el orden de 50 a 100 dolares y que puede ser modificado a decision interna una vez se termine el piloto.

### Reglas de facturación

- **El cobro es por adelantado.** El mes que inicia se paga al inicio.
- **Todo cambio se refleja en el siguiente ciclo.** Si el dueño agrega un truck a mitad de mes, empieza a pagarlo el siguiente periodo. Si da de baja uno, deja de pagarlo el siguiente periodo. Una sola regla para ambos casos — sin cálculos proporcionales por días.
- **Sin plazo mínimo de permanencia.** El cliente puede irse cuando quiera. Decisión deliberada: para este perfil, el compromiso largo es una barrera de entrada mayor que el precio.
- ** En segunda fase se puede revisar la posibilidad del cobro automatic a traves de Stripe, para que la herramienta funcione como tipo suscripcion

### Alta y baja de trucks

- El dueño **solicita** el alta desde su panel; el equipo la aprueba y configura. En Fase 1 no es autoservicio: el volumen es bajo y cada alta de truck es un evento de ingreso que amerita contacto humano para confirmar ubicación y horarios.
- Dar de baja un truck **no borra su información: la archiva.** Deja de facturarse, desaparece del panel operativo y su QR deja de funcionar, pero todos sus datos quedan guardados.
- **La información archivada se conserva dos años.** Este plazo existe específicamente para permitir comparaciones interanuales: un truck dado de baja este año debe seguir apareciendo en la comparación del año siguiente.
- Reactivar un truck archivado debe tomar minutos, no requerir un alta nueva.
- Al cumplirse el plazo, se avisa al cliente antes de eliminar, con opción de reactivar o descargar un respaldo.

### Referencia de mercado

El competidor más directo (una plataforma establecida con módulo específico para food trucks) cobra entre $198 y $657 mensuales, más comisión por transacción, e incluye equipo físico. Nuestra propuesta se ubica muy por debajo de ese rango y sin comisiones.

### Realidad financiera que debe influir en el producto

El costo dominante de este negocio no es la infraestructura, que se mantiene relativamente estable sin importar cuántos clientes haya. El costo dominante es el **tiempo humano de dar de alta y dar soporte a cada cliente**.

Cualquier decisión que reduzca ese tiempo tiene más impacto en la rentabilidad que subir el precio. Esto debe influir directamente en cómo se diseña el producto: menos configuración manual, más autoservicio para el dueño, menos razones para llamarnos.

---

## 11. Alta de nuevos clientes (proceso a automatizar)

Hacer el alta de un cliente de forma totalmente manual toma entre cinco y ocho horas. La meta es bajarlo a dos, y con el tiempo a menos.

**Proceso propuesto:**

1. **Un solo formulario** que se le envía al cliente por un enlace, que llena desde su celular. Pide: nombre del negocio, cuántos trucks y dónde están, horarios, logo, **foto del menú actual tal como lo tenga** (banner, PDF, foto del pizarrón), y fotos de platillos si las tiene.

2. **Lectura automática del menú.** La foto del menú se procesa con inteligencia artificial que reconoce texto e imágenes, y de ahí se extraen automáticamente los productos, categorías y precios.

3. **Revisión humana obligatoria antes de publicar.** Este paso no se puede omitir. La lectura automática se equivoca, sobre todo con fotos borrosas o precios corregidos a mano. Un precio mal cargado en un sistema en producción es un problema serio con el cliente.

4. **Carga a la plataforma** de todo lo aprobado: negocio, trucks, categorías, productos, imágenes, marca.

5. **Entrega al cliente**: enlaces de sus menús, códigos QR listos para imprimir, PINs iniciales del personal, y una sesión corta de capacitación.

**Recomendación de secuencia:** hacer los primeros dos o tres clientes de forma manual antes de automatizar. Los menús reales de food trucks llegan en condiciones impredecibles — fotos torcidas, precios tachados, mezcla de español e inglés. Automatizar antes de conocer esos casos lleva a construir el proceso equivocado.

### Política de imágenes de platillos

Las fotos deben ser **del platillo real del cliente**. Principio no negociable: el comensal no puede ver una imagen de un plato distinto al que va a recibir.

Dentro de ese principio, **sí se contempla el uso de herramientas de inteligencia artificial para mejorar la calidad de las fotos reales**: corregir iluminación, limpiar el fondo, dar un acabado profesional y consistente entre todas las imágenes del menú. La mayoría de los clientes enviarán fotos tomadas con celular en condiciones difíciles, y la diferencia visual entre una foto cruda y una foto tratada es enorme para las ventas.

La línea es clara:
- **Sí:** mejorar, iluminar, limpiar y uniformar una foto real del platillo del cliente
- **Sí:** generar gráficos, banners, portadas y material promocional
- **No:** generar de cero la imagen de un platillo que el cliente no fotografió

**Cómo se ejecuta (piloto):** igual que la lectura del menú, el tratamiento de fotos es **manual con revisión humana durante el onboarding**, no una herramienta conectada en vivo al panel del dueño. El dueño sube la foto tal cual la tenga; alguien del equipo la pasa por una herramienta de edición (ajuste de luz, limpieza de fondo) antes de publicarla. No se conecta ninguna herramienta de mejora automática de imágenes al producto todavía — se decide después de ver fotos reales de varios clientes, siguiendo la misma lógica de "primero manual, automatizar cuando se conozcan los casos" ya aplicada arriba a la lectura del menú. Motivo adicional: automatizar esto ahora sería costo de ingeniería adelantado para un volumen (3 trucks, un cliente) donde el costo de hacerlo a mano es menor.

---

## 12. Perfil de desarrollo requerido

### consideraciones a tener en cuenta

**Desarrollo web moderno**
- Aplicaciones web que funcionan igual de bien en celular que en computadora, sin necesidad de instalar nada
- Sistemas que sirven a **varios negocios clientes en la misma plataforma**, con separación garantizada de información entre ellos. Es la habilidad más importante y la más fácil de hacer mal.
- **Actualización en vivo**: que la orden aparezca en la cocina sin que nadie recargue la pantalla, y que el estado cambie solo en el celular del cliente. Es una especialidad concreta, no algo que todo desarrollador web haya hecho.
- **Personalización visual por cliente** sin duplicar código: un mismo sistema que se ve distinto para cada negocio

**Bases de datos y manejo de información**
- Diseño de la estructura de información pensando en el largo plazo: que el historial se pueda comparar años después, aunque el menú haya cambiado y aunque haya trucks dados de baja
- Reglas de seguridad a nivel de la propia base de datos, no solo en la aplicación
- Registro de cambios para poder auditar modificaciones en precios y pedidos

**Accesos y seguridad**
- Manejo de dos esquemas de acceso distintos en un mismo producto: cuentas reales para dueños y acceso por PIN vinculado a dispositivo para personal operativo
- Recuperación de contraseña completamente automática
- Revocación inmediata de accesos

**Suscripciones y cobros**
- Experiencia con productos de suscripción: cobro recurrente, cambios de plan, suspensión por falta de pago
- Más adelante (Fase 2): cobros en línea donde el dinero llega directamente a la cuenta de cada negocio cliente, no a la nuestra
- Suscripcion del cliente con cobros automaticos a traves de stripe

**Diseño de producto e interfaz**
- Perfil de diseño de producto real, no solo maquetado bonito. Debe entender que el usuario final es un cocinero con prisa y un comensal parado en la calle.
- Capacidad de crear una identidad visual propia, no de aplicar una plantilla
- Capacidad de diseñar un **sistema de marca flexible**: que se vea excelente con diez combinaciones de color distintas, no solo con la que el diseñador eligió
- Experiencia comprobable en interfaces para celular

**Automatización e inteligencia artificial aplicada**
- Automatización de procesos de negocio con herramientas visuales
- Uso de IA de visión para leer documentos e imágenes y convertirlos en información estructurada
- Tratamiento y mejora de imágenes
- posible uso de herramientas como chat GPT, N8N y recomienda otras de ser necesarias


### Actitudes que importan tanto como la técnica

- **Entender que el Dueño, cocina o comensal no es técnicos.** Cualquier función que requiera explicación larga está mal diseñada.
- **Obsesión por la simplicidad operativa.** El éxito se mide en qué tan poco tiene que pensar el personal de cocina, no en cuántas funciones tiene el sistema.
- **Criterio para decir que no.** Habrá tentación de agregar funciones. La mayoría deben esperar a ser revisadas.
- ** Un buen diseño es importante para que este sea un producto atractivo para el cliente




---

## 13. Puntos críticos de calidad

Estos son los aspectos donde el producto se gana o se pierde:

1. **Simplicidad para el personal de cocina.** El operador está cocinando con las manos ocupadas y prisa. Si avanzar una orden toma más de un toque, o si la pantalla está cargada de información, el sistema se abandona y vuelven al papel.

2. **Confiabilidad en hora pico.** Si el sistema falla un sábado a la una de la tarde, el negocio pierde ventas reales ese día. Este no es un proyecto donde una caída sea un inconveniente menor.

3. **Ninguna venta se pierde del registro.** Sin importar si el pedido llegó por QR o se capturó en la ventanilla, debe quedar en el mismo lugar. Si el dueño sospecha que sus números están incompletos, deja de confiar en el sistema entero.

4. **El historial nunca se destruye.** Menús que cambian, productos que se eliminan y trucks que se dan de baja no pueden llevarse el pasado consigo.

5. **Separación estricta entre negocios clientes.** Bajo ninguna circunstancia un negocio puede ver información de otro.

6. **La personalización nunca rompe la legibilidad.** Ninguna combinación de color que el cliente pueda elegir debe producir un menú difícil de leer.

7. **Autonomía del dueño.** Debe poder cambiar precios, marcar productos agotados, pausar el servicio, administrar los accesos de su personal y descargar sus QR sin llamarnos. Cada tarea que requiera nuestra intervención es costo recurrente que erosiona el margen.

---

## 14. Riesgos identificados que debemos tener en cuenta para superar

- **El producto todavía no reemplaza nada.** Mientras no haya cobros en línea, el cliente paga esto *además* de lo que ya paga. Eso limita cuánto se puede cobrar y qué tan fácil es cerrar la venta. Los cobros en línea son la clave para pasar de "herramienta adicional" a "sistema principal".

- **Un solo cliente piloto no valida el mercado.** Se necesitan entre tres y cinco clientes pagando de forma consistente antes de invertir en registro automático, facturación automatizada y crecimiento, por eso la herramienta debe ser lo suficientemente potente como para que enamore al cliente

- **Sin permanencia y sin cobro de instalación, el cliente que se va temprano cuesta dinero.** Riesgo aceptado a cambio de bajar la barrera de entrada, pero debe vigilarse: si varios clientes se van antes de los seis meses, hay que revisar el modelo.

- **El soporte crece con cada cliente.** Debe considerarse desde el diseño, no resolverse cuando ya duela.

- **Los clientes con varios trucks son desproporcionadamente rentables** — un solo proceso de alta, ingresos multiplicados. La estrategia comercial debería concentrarse ahí.

---

## 15. Estado actual y siguiente paso

**Ya existe:**
- Documento de especificación funcional original, más detallado en funciones.
- Modelo de negocio, estructura de precios y reglas de suscripción definidos.
- Dirección de diseño, esquema de accesos y roles definidos en este documento.

**Siguiente paso de desarrollo:** cerrar el alcance definitivo de la Fase 1 y arrancar construcción.

---

## Anexo — Dirección técnica ya explorada

Esta sección es referencia, no requisito. Se pueden proponer alternativas y se espera que lo haga si tiene mejores argumentos.

La demo y el planteamiento inicial se construyeron pensando en herramientas web modernas con base de datos en la nube y despliegue automático, priorizando costos bajos de operación en las primeras etapas. Existe experiencia previa del equipo fundador con este tipo de configuración en otros proyectos ya puestos en producción.

Lo que sí es requisito, independientemente de las herramientas elegidas:

- Actualización en vivo del estado de los pedidos, sin que el usuario tenga que recargar la pantalla
- Aislamiento garantizado de la información entre negocios clientes, aplicado a nivel de la base de datos y no solo de la aplicación
- Sistema visual con marca configurable por cliente, sin duplicación de código por cada negocio
- Dos esquemas de acceso conviviendo: cuentas con correo para dueños, PIN vinculado a dispositivo para personal operativo
- Estructura de información que preserve el histórico de ventas de forma consultable a varios años, incluyendo unidades dadas de baja y productos retirados del menú
- Funcionamiento correcto en celulares de gama baja y con conexión inestable — es el contexto real de uso
- Registro de acciones para poder auditar cambios en precios, pedidos y accesos
- Base preparada para cobros en línea en Fase 2, aunque no se implementen ahora
