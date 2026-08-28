---
name: foodtruckos-diseno
description: Sistema de diseño de Pavessa — la regla de las dos marcas, personalización por cliente, y los tres contextos visuales muy distintos (menú del comensal, panel del dueño, pantalla de cocina). Consulta esta skill SIEMPRE que diseñes, construyas o modifiques cualquier pantalla, componente, color, tipografía o layout de Pavessa, incluso para cambios pequeños, y también cuando alguien pida "hacerlo más bonito", agregar una vista nueva o revisar una interfaz existente.
---

# Pavessa — Sistema de diseño

Este producto no compite solo por funcionalidad. Compite por convencer a un dueño de food truck, en una demostración de diez minutos, de cambiar cómo trabaja. La calidad visual es argumento de venta, no acabado.

Pero "bonito" significa cosas opuestas en las tres pantallas del sistema. Esa es la idea central de esta skill.

---

## La regla de las dos marcas

Es la decisión de diseño más importante y la que más fácilmente se rompe.

**Lo que ve el comensal pertenece al cliente.** Alguien parado frente a un truck de "La Villita" debe sentir que está viendo el menú de La Villita — su logo, sus colores, sus fotos. Pavessa no aparece, o aparece de forma discreta al pie.

**Lo que ve el dueño es nuestro producto.** El panel administrativo sí lleva la identidad de Pavessa.

**Consecuencia práctica:** en la interfaz del comensal, ningún color, logo o tipografía de acento puede estar fijo en el código. Todo lo que sea marca se resuelve por variables que cambian según el cliente. Si escribes un color de marca directamente en un componente del comensal, estás creando trabajo manual para cada cliente futuro.

---

## Personalización: cuatro decisiones, ninguna más

El dueño debe sentir que compró algo hecho a su medida, sin que elegir se vuelva difícil. Se le pide únicamente:

1. Su logo
2. Un color principal, **de una paleta curada de unas diez opciones** — nunca un selector libre de color
3. Una foto de portada para su menú
4. Un estilo visual, entre dos o tres alternativas ya diseñadas

**La vista previa en vivo no es opcional.** Mientras elige, debe ver su menú real cambiando en pantalla. Ese es el momento exacto en que el producto se siente personalizado; sin eso, es un formulario más.

**Por qué paleta curada:** con libertad total aparecen combinaciones ilegibles y el menú deja de leerse bajo el sol. Con opciones acotadas y probadas, cualquier elección funciona.

**Contraste automático:** el color del texto debe calcularse a partir del color elegido, para garantizar legibilidad siempre. Ninguna elección posible del cliente puede producir un menú difícil de leer.

**Alcance:** la marca se define a nivel del negocio; todos los trucks heredan logo y color. Cada truck tiene nombre y foto propios. Debe existir la posibilidad de sobrescribir color y logo en un truck específico, pero como excepción disponible, no como decisión que todos deban tomar.

**Al construir cualquier componente de marca, pruébalo mentalmente contra las diez opciones de la paleta, no solo contra la que se ve bien en tu pantalla.**

---

## Dirección estética

La referencia **no** son las apps de delivery. Ese estilo neutro existe porque debe servir a miles de restaurantes distintos, y por eso no tiene personalidad. Aquí sí se puede tener.

La referencia rica está en el mundo del propio cliente: la **rotulación mexicana** — los letreros pintados a mano de las taquerías, con letras condensadas, sombras marcadas y colores saturados.

No se imita literalmente. Se destila: **estructura de aplicación limpia y moderna, con la personalidad viviendo en la tipografía y el color.**

---

## Los tres contextos

### Menú del comensal

Contexto real: una persona parada en la calle, con sol directo sobre la pantalla, con hambre y con prisa, en un celular que probablemente no es nuevo.

- Tipografía de títulos condensada y con carácter; el resto en una tipografía neutra de máxima legibilidad
- Foto grande del platillo, precio con jerarquía fuerte, un solo color de acento
- La personalización del pedido como pasos claros con botones grandes, **nunca como formulario**
- Cero fricción: sin registro, sin descarga, sin cuenta. Cada paso que se le pide es un cliente que se va a la fila normal
- Velocidad percibida: del escaneo al menú deben pasar segundos, no una pantalla de carga

### Panel del dueño

Lo opuesto: moderno, minimalista, ordenado, casi sobrio.

- Números grandes, mucho espacio en blanco, sin adornos
- Debe entenderse sin capacitación. El dueño no es usuario de software y no va a leer un manual
- Si una función requiere explicación larga, está mal diseñada — replantéala antes de documentarla
- Es el único lugar donde la marca Pavessa aparece con fuerza

### Pantalla de cocina

Contexto real: se lee de reojo, a metro y medio de distancia, con las manos ocupadas y grasosas, en plena hora pico.

- Fondo oscuro, texto muy grande
- Color usado **solo con función**: verde = lista, ámbar = lleva tiempo, rojo = urgente. Nada decorativo
- Avanzar una orden: **un solo toque**. Si toma dos, el sistema se abandona y vuelven al papel
- Botones grandes, tolerantes al dedo impreciso
- El éxito se mide en qué tan poco tiene que pensar el operador, no en cuántas funciones tiene la pantalla

### Panel de administración interno

Minimalista y funcional. Herramienta de trabajo interno, no producto de venta. No debe consumir tiempo de diseño.

---

## Bilingüe de verdad

Todo debe funcionar en español e inglés sin que ninguno se sienta traducción de segunda. Al diseñar, considera que el mismo texto cambia de longitud entre idiomas y no puede romper el layout.

---

## Pruebas antes de dar algo por terminado

**La prueba del sol:** imprime o abre la pantalla en un celular de gama baja, sal a la luz directa y míralo. Si no se lee ahí, no sirve, por bien que se vea en el monitor.

**La prueba de la paleta:** cámbiale el color de marca tres veces con opciones distintas de la paleta. Si alguna se ve mal o pierde contraste, el componente está mal construido.

**La prueba del metro y medio:** párate lejos de la pantalla de cocina. Si tienes que acercarte para saber qué orden sigue, el tamaño es insuficiente.

**La prueba de la explicación:** si necesitas explicarle al dueño cómo usar algo de su panel, rediseña en lugar de documentar.

---

## Al proponer diseño nuevo

Cuando se trate de una pantalla importante — sobre todo el menú del comensal — presenta **varias propuestas distintas antes de refinar una**. Es la pantalla que vende el producto y la que más se verá; vale la pena explorar antes de comprometerse.

Evita defaults genéricos: sombras suaves de plantilla, azul corporativo, tipografías de sistema sin intención. Si el resultado podría ser la interfaz de cualquier otro producto, todavía no está terminado.
