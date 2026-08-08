export type Lang = "es" | "en"

export type Dictionary = {
  menu: {
    addToCart: string
    cart: string
    cartEmpty: string
    checkout: string
    subtotal: string
    tax: string
    total: string
    soldOut: string
    sending: string
    sendError: string
    retry: string
    cancel: string
    customerNameLabel: string
    quantity: string
    notes: string
  }
  tracking: {
    title: string
    yourNumber: string
    steps: { recibido: string; preparando: string; listo: string; entregado: string }
    titles: { recibido: string; preparando: string; listo: string; entregado: string }
    notFound: string
    notFoundSub: string
    backToMenu: string
    due: string
    paid: string
    offline: string
    live: string
  }
  kitchen: {
    newColumn: string
    prepColumn: string
    readyColumn: string
    start: string
    ready: string
    deliver: string
    askPaid: string
    yesCharged: string
    deliverUnpaid: string
    ventanilla: string
    newVentanillaOrder: string
    soldOutToggle: string
    connLive: string
    connOff: string
    queuedActions: (n: number) => string
    sessionExpired: string
    reenter: string
  }
}

// Solo texto de interfaz (botones, estados, mensajes). Los nombres y
// descripciones de platillos vienen de la base de datos (name_es/name_en),
// nunca de aquí.
export const dictionary: Record<Lang, Dictionary> = {
  es: {
    menu: {
      addToCart: "Agregar",
      cart: "Tu pedido",
      cartEmpty: "Tu carrito está vacío",
      checkout: "Ordenar",
      subtotal: "Subtotal",
      tax: "Impuesto",
      total: "Total",
      soldOut: "Se acabó",
      sending: "Enviando tu pedido…",
      sendError: "No pudimos enviar tu pedido. Revisa tu conexión e intenta otra vez",
      retry: "Reintentar",
      cancel: "Cancelar",
      customerNameLabel: "Tu nombre (opcional)",
      quantity: "Cantidad",
      notes: "Notas para la cocina",
    },
    tracking: {
      title: "Tu pedido",
      yourNumber: "Tu número",
      steps: {
        recibido: "Recibido",
        preparando: "Preparando",
        listo: "Listo",
        entregado: "Entregado",
      },
      titles: {
        recibido: "Ya llegó a la cocina",
        preparando: "Lo están preparando",
        listo: "¡Listo! Pasa por él",
        entregado: "¡Gracias!",
      },
      notFound: "No encontramos ese pedido",
      notFoundSub: "El enlace puede estar viejo o el pedido ya se entregó hace rato.",
      backToMenu: "Volver al menú",
      due: "Paga en la ventanilla",
      paid: "Ya está pagado",
      offline: "Sin conexión — reintentando",
      live: "En vivo",
    },
    kitchen: {
      newColumn: "Nuevas",
      prepColumn: "Preparando",
      readyColumn: "Listas",
      start: "Empezar",
      ready: "Lista",
      deliver: "Entregada",
      askPaid: "¿Ya cobraste esta orden?",
      yesCharged: "Sí, cobré",
      deliverUnpaid: "Entregar sin cobrar",
      ventanilla: "Ventanilla",
      newVentanillaOrder: "Nuevo pedido en ventanilla",
      soldOutToggle: "Se acabó",
      connLive: "En vivo",
      connOff: "Sin conexión",
      queuedActions: (n: number) => `${n} acción${n === 1 ? "" : "es"} pendiente${n === 1 ? "" : "s"} de enviar`,
      sessionExpired: "Tu sesión de personal ya no es válida. Vuelve a entrar con tu PIN.",
      reenter: "Volver a entrar",
    },
  },
  en: {
    menu: {
      addToCart: "Add",
      cart: "Your order",
      cartEmpty: "Your cart is empty",
      checkout: "Order",
      subtotal: "Subtotal",
      tax: "Tax",
      total: "Total",
      soldOut: "Sold out",
      sending: "Sending your order…",
      sendError: "We couldn't send your order. Check your connection and try again",
      retry: "Retry",
      cancel: "Cancel",
      customerNameLabel: "Your name (optional)",
      quantity: "Quantity",
      notes: "Notes for the kitchen",
    },
    tracking: {
      title: "Your order",
      yourNumber: "Your number",
      steps: {
        recibido: "Received",
        preparando: "Cooking",
        listo: "Ready",
        entregado: "Picked up",
      },
      titles: {
        recibido: "It reached the kitchen",
        preparando: "They are cooking it",
        listo: "Ready! Come get it",
        entregado: "Thank you!",
      },
      notFound: "We could not find that order",
      notFoundSub: "The link may be old, or the order was already picked up a while ago.",
      backToMenu: "Back to the menu",
      due: "Pay at the window",
      paid: "Already paid",
      offline: "Offline — retrying",
      live: "Live",
    },
    kitchen: {
      newColumn: "New",
      prepColumn: "Cooking",
      readyColumn: "Ready",
      start: "Start",
      ready: "Ready",
      deliver: "Delivered",
      askPaid: "Did you already charge this order?",
      yesCharged: "Yes, charged",
      deliverUnpaid: "Deliver without charging",
      ventanilla: "Counter",
      newVentanillaOrder: "New counter order",
      soldOutToggle: "Sold out",
      connLive: "Live",
      connOff: "Offline",
      queuedActions: (n: number) => `${n} action${n === 1 ? "" : "s"} pending`,
      sessionExpired: "Your staff session is no longer valid. Enter your PIN again.",
      reenter: "Enter again",
    },
  },
}
