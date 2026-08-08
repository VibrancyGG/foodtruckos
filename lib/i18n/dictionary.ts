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
    notesPlaceholder: string
    photoComing: string
    buildFrom: string
    buildCta: string
  }
  tracking: {
    title: string
    yourNumber: string
    steps: { recibido: string; preparando: string; listo: string; entregado: string }
    titles: { recibido: string; preparando: string; listo: string; entregado: string }
    subs: { recibido: string; preparando: string; listo: string; entregado: string }
    wait: (mins: number) => string
    waitWithAvg: (mins: number, avg: number) => string
    notFound: string
    notFoundSub: string
    backToMenu: string
    due: string
    paid: string
    offline: string
    live: string
    whatYouOrdered: string
    total: string
    bell: string
    bellOn: string
    bellHint: string
    bellHintOff: string
    bellNote: string
    bellDenied: string
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
    ordersToday: (n: number) => string
    salesButton: string
    soundOn: string
    soundOff: string
    daySummaryTitle: string
    daySummarySubtitle: (unitName: string) => string
    deliveredOrders: string
    collectedToday: string
    avgTicket: string
    openUnpaid: string
    topSellers: string
    undeliveredNote: (n: number) => string
    backToOrders: string
    daySummaryDisclaimer: string
    soldOutTitle: string
    soldOutHintSome: (n: number) => string
    soldOutHintAll: string
    selling: string
    notOnMenu: string
    extrasTitle: string
    unpaidBadge: string
    paidBadge: string
    collectBadge: string
    ventanillaSubtitle: string
    notesLabel: string
    notesHint: string
    notesPlaceholderOrder: string
    notesPlaceholderLine: string
    takeoutChip: string
    dineinChip: string
    allTogetherChip: string
    extraCutleryChip: string
    alreadyPaid: string
    payAtPickup: string
    sendToKitchen: string
    orderSent: (folio: number, paid: boolean) => string
    emptyTicket: string
    totalWithTax: (n: number) => string
    changesLabel: string
    addNoteLabel: string
    removeLine: string
    addToLine: string
    ingredientsLabel: string
    addLabel: string
    doneLabel: string
    soldOutShort: string
    emptyNew: string
    emptyPrep: string
    emptyReady: string
    micDictate: string
    micListening: string
    micDone: string
    micDenied: string
    micNoSpeech: string
    micNetwork: string
    micGeneric: string
    micUnsupported: string
    back: string
    anyChange: string
    add: string
    counterFallbackName: string
    noCategoryLabel: string
    pairTitle: string
    pairSubtitle: string
    pairPlaceholder: string
    pairButton: string
    pairingLabel: string
    pinTitle: string
    pinSubtitle: string
    pinPlaceholder: string
    enterButton: string
    enteringLabel: string
    errOriginNotAllowed: string
    errMissingCode: string
    errInvalidCode: string
    errNotPaired: string
    errMissingPin: string
    errInvalidDevice: string
    errLocked: string
    errInvalidPin: string
    errConnection: string
  }
  panel: {
    nav: {
      resumen: string
      menu: string
      trucks: string
      marca: string
      personal: string
      qr: string
      cuenta: string
      logout: string
    }
    sinAccesoTitle: string
    sinAccesoBody: string
    common: {
      save: string
      saving: string
      saved: string
      cancel: string
      edit: string
      create: string
      add: string
      remove: string
      yesRemove: string
      noPhoto: string
      uploading: string
      chooseImage: string
      nameEsPlaceholder: string
      nameEnPlaceholder: string
    }
    menuPage: {
      title: string
      subtitle: string
      noCategory: string
      addCategory: string
      createCategory: string
      pricePlaceholder: string
      addProduct: string
      hideOptions: string
      showOptions: string
      soldOut: string
      confirmRemove: string
      removeFromMenu: string
      noOptionGroups: string
      required: string
      optionalLabel: string
      selectRange: (min: number, max: number) => string
      deleteGroup: string
      addOptionGroup: string
      addOption: string
      addWithCost: string
      removeNoCost: string
      priceDeltaPlaceholder: string
      minLabel: string
      maxLabel: string
      requiredLabel: string
      allTrucksFilter: string
      statsLine: (total: number, out: number, noPhoto: number) => string
      whoSellsIt: string
    }
    trucksPage: {
      title: string
      subtitle: string
      newTruckNote: string
      contactUs: string
      showArchived: string
      hideArchived: string
      alertLabel: string
      minSuffix: string
      publishedHours: string
      publishedHoursHint: string
      openLabel: string
      toLabel: string
      saveHours: string
      hoursSaved: string
      reopenNow: string
      pause: string
      pause1h: string
      pause3h: string
      pauseManual: string
      pausedBadge: string
      openBadge: string
      reopens: (when: string) => string
      untilManualReopen: string
      archiveTruck: string
      confirmArchiveText: string
      yesArchive: string
      archivedOn: (date: string) => string
      reactivate: string
      locationPlaceholder: string
      taxTitle: string
      taxHint: string
      taxAdd: string
      taxAddHint: string
      taxIncluded: string
      taxIncludedHint: string
      sharedSettingsTitle: string
      sharedSettingsHint: string
      pauseModalTitle: (name: string) => string
      pauseModalExplain: string
      pausePreviewLabel: string
      pausePreviewClosedToday: string
      pausePreviewReturnsAt: (when: string) => string
      pauseWhyLabel: string
      pauseReason1: string
      pauseReason2: string
      pauseReason3: string
      pauseReason4: string
      pauseUntilLabel: string
      pauseDur30: string
      pauseDur1h: string
      pauseDur2h: string
      pauseDurRestOfDay: string
      pauseConfirm: string
      pauseReasonLabel: (reason: string) => string
    }
    marcaPage: {
      title: string
      subtitle: string
      step1: string
      uploadLogoTitle: string
      uploadLogoHint: string
      step2: string
      chooseColorTitle: string
      chooseColorHint: string
      step3: string
      coverTitle: string
      coverHint: string
      step4: string
      styleTitle: string
      styleHint: string
      vibrante: string
      vibranteHint: string
      tradicional: string
      tradicionalHint: string
      unsavedLabel: string
      noChangesLabel: string
      saveChanges: string
      previewLabel: string
      liveLabel: string
      coverPlaceholder: string
      addPreviewLabel: string
      motifStep: string
      motifTitle: string
      motifHint: string
      truckOverrideSummary: string
      truckOverrideBody: string
      truckOverrideOwn: string
      truckOverrideRemove: string
      truckOverrideInherits: string
    }
    personalPage: {
      title: string
      subtitle: string
      staffTitle: string
      addPerson: string
      staffHint: string
      namePlaceholder: string
      pinPlaceholder: string
      allTrucks: string
      noStaffYet: string
      showRemoved: (n: number) => string
      hideRemoved: (n: number) => string
      confirmRemoveAccess: string
      devicesTitle: string
      devicesHint: string
      pairTablet: string
      deviceNamePlaceholder: string
      generateCode: string
      pairingCodeTitle: string
      pairingCodeHint: string
      done: string
      noDevicesYet: string
      showRevoked: (n: number) => string
      hideRevoked: (n: number) => string
      pairedBadge: string
      waitingCodeBadge: string
      confirmRevoke: string
      yesRevoke: string
      revoke: string
    }
    qrPage: {
      title: string
      subtitle: string
      noActiveTrucks: string
      download: string
      openMenu: string
      realTitle: string
      realBody: string
      howToTitle: string
      how1: string
      how2: string
      how3: string
      how4: string
      printAll: string
      posterMsg: string
      posterMsg2: string
    }
    cuentaPage: {
      title: string
      subtitle: string
      yourPlan: string
      perMonth: string
      activeTrucks: (n: number, price: number) => string
      noCommission: string
      subscriptionStatus: string
      billingNote: string
      moreTrucksTitle: string
      moreTrucksBody: string
      trucksLink: string
      cancelSent: string
      cancelExplain: string
      notePlaceholder: string
      sendRequest: string
      sendingLabel: string
      requestCancellation: string
      statusTrial: string
      statusActive: string
      statusSuspended: string
      statusCancelled: string
      ladderTitle: string
      ladderHint: string
      ladderTrucks: string
      ladderPerTruck: string
      ladderMonthly: string
      ladderFivePlus: string
      ladderYourPlan: string
      wantToTalk: string
    }
    resumenPage: {
      title: string
      subtitle: string
      salesOf: (label: string) => string
      vsLastMonth: string
      vsSameMonthLastYear: (month: string) => string
      avgPerDay: string
      yearAccrued: string
      samePeriod: (year: number) => string
      noData: string
      monthlySales: string
      vsLabel: (a: number, b: number) => string
      eachTruckIn: (month: string) => string
      whereFrom: string
      topSelling: string
      piecesThisMonth: string
      salesActivity: string
      salesActivityHint: string
      salesActivityDisclaimer: string
      lateOpenInsightTitle: (unitName: string, minutes: number) => string
      lateOpenInsightBody: (amount: string) => string
      noSalesToGraph: string
      noActiveTrucks: string
      noSalesThisMonth: string
      noOrdersThisMonth: string
      noPreviousMonth: string
      byQrLabel: string
      qrChannel: string
      ventanillaChannel: string
      daysWithSales: (n: number) => string
      opensLate: (dur: string) => string
      opensOnTime: string
      noPublishedHours: string
      firstOrder: string
      lastOrder: string
      closesEarly: (dur: string) => string
      noOrdersLast30: (name: string) => string
    }
  }
  admin: {
    headerTitle: string
    logout: string
    mrr: string
    businessesTotal: (n: number) => string
    businessesHeader: string
    colBusiness: string
    colStatus: string
    colTrucks: string
    colPlan: string
    colBilling: string
    recentActivity: string
    noActivity: string
    reactivate: string
    suspend: string
    statusTrial: string
    statusActive: string
    statusSuspended: string
    statusCancelled: string
    perMonth: string
    actionPriceChange: string
    actionCancelRequested: string
    actionUnitPaused: string
    actionUnitReopened: string
    actionUnitArchived: string
    actionUnitReactivated: string
    actionBusinessSuspended: string
    actionBusinessReactivated: string
    kpiActiveBusinesses: string
    kpiTrucksBilled: string
    kpiMonthlyRevenue: string
    kpiAvgTenure: string
    kpiAvgTenureUnit: string
    kpiPerClient: string
    platformHealthHeader: string
    monthlyRevenuePanelTitle: string
    thisMonthLabel: string
    portfolioPanelTitle: string
    portfolioTotalLabel: (n: number) => string
    openLink: string
    openDisabled: string
    payManual: string
    payStripe: string
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
      notesPlaceholder: "Ej: sin picante, para llevar",
      photoComing: "Foto en camino",
      buildFrom: "Desde",
      buildCta: "Empezar",
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
      subs: {
        recibido: "En un momento empiezan con él.",
        preparando: "Te avisamos aquí en cuanto esté.",
        listo: "Ve a la ventanilla y di tu número.",
        entregado: "Que lo disfrutes. Aquí estaremos.",
      },
      wait: (mins) => `Va ${mins} min`,
      waitWithAvg: (mins, avg) => `Va ${mins} min · normalmente tardan unos ${avg}`,
      notFound: "No encontramos ese pedido",
      notFoundSub: "El enlace puede estar viejo o el pedido ya se entregó hace rato.",
      backToMenu: "Volver al menú",
      due: "Paga en la ventanilla",
      paid: "Ya está pagado",
      offline: "Sin conexión — reintentando",
      live: "En vivo",
      whatYouOrdered: "Lo que pediste",
      total: "Total",
      bell: "Avísame cuando esté listo",
      bellOn: "Te avisamos ✓",
      bellHint: "Deja esta pantalla abierta y te avisamos con un sonido. También te llega la notificación si la aceptaste.",
      bellHintOff: "Sin internet no se actualiza solo. Vuelve a cargar cuando tengas señal.",
      bellNote: "Te avisamos con un sonido y, si aceptas, con una notificación del navegador.",
      bellDenied: "No diste permiso de notificación — igual te avisamos con este sonido si dejas la pantalla abierta.",
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
      ordersToday: (n: number) => `${n} orden${n === 1 ? "" : "es"} hoy`,
      salesButton: "Ventas de hoy",
      soundOn: "Sonido activado",
      soundOff: "Sonido apagado",
      daySummaryTitle: "Cómo va el día",
      daySummarySubtitle: (unitName: string) => `${unitName} · desde que abrió`,
      deliveredOrders: "Órdenes entregadas",
      collectedToday: "Cobrado hoy",
      avgTicket: "Ticket promedio",
      openUnpaid: "Abiertas por cobrar",
      topSellers: "Lo que más ha salido",
      undeliveredNote: (n: number) =>
        `${n} orden${n === 1 ? "" : "es"} se entregó${n === 1 ? "" : "ron"} sin cobrar. Queda registrado y el dueño lo ve en su panel.`,
      backToOrders: "Volver a las órdenes",
      daySummaryDisclaimer: "Es la venta del truck en el día, no de cada persona.",
      soldOutTitle: "¿Qué se acabó?",
      soldOutHintSome: (n: number) =>
        `${n} platillo${n === 1 ? "" : "s"} ${n === 1 ? "está" : "están"} agotado${n === 1 ? "" : "s"} · tus clientes no los ven`,
      soldOutHintAll: "Todo disponible. Apaga lo que se acabe y desaparece del menú al instante.",
      selling: "Se está vendiendo",
      notOnMenu: "No aparece en el menú",
      extrasTitle: "Extras y opciones",
      unpaidBadge: "Por cobrar",
      paidBadge: "Pagado",
      collectBadge: "Cobrar",
      ventanillaSubtitle: "Para quien llegó sin celular. Entra al mismo tablero y al mismo registro de ventas.",
      notesLabel: "Nota",
      notesHint: "toca lo común o escríbela",
      notesPlaceholderOrder: "Algo más que deba saber la cocina",
      notesPlaceholderLine: "Algo más de este platillo",
      takeoutChip: "Para llevar",
      dineinChip: "Para comer aquí",
      allTogetherChip: "Todo junto",
      extraCutleryChip: "Cubiertos extra",
      alreadyPaid: "Ya pagó",
      payAtPickup: "Paga al recoger",
      sendToKitchen: "Mandar a cocina",
      orderSent: (folio: number, paid: boolean) => `Orden #${folio} mandada a cocina${paid ? " · ya pagada" : " · cobrar al entregar"}`,
      emptyTicket: "Toca los platillos de la izquierda para armar el pedido.",
      totalWithTax: (n: number) => `Con impuesto: $${n.toFixed(2)}`,
      changesLabel: "Cambios",
      addNoteLabel: "+ Nota",
      removeLine: "Quitar",
      addToLine: "Agregar",
      ingredientsLabel: "Ingredientes",
      addLabel: "Agregar",
      doneLabel: "Listo",
      soldOutShort: "Se acabó",
      emptyNew: "Sin pedidos nuevos",
      emptyPrep: "Nada en preparación",
      emptyReady: "Nada listo por entregar",
      micDictate: "Dictar",
      micListening: "Escuchando… habla normal.",
      micDone: "Listo. Revísalo antes de mandar.",
      micDenied: "No diste permiso al micrófono.",
      micNoSpeech: "No escuché nada. Intenta otra vez o usa los botones.",
      micNetwork: "Sin internet no se puede dictar. Escribe la nota.",
      micGeneric: "No se pudo dictar aquí. Escribe la nota.",
      micUnsupported: "Este aparato no puede dictar. Usa los botones o escribe.",
      back: "Regresar",
      anyChange: "¿Algún cambio?",
      add: "Agregar",
      counterFallbackName: "Mostrador",
      noCategoryLabel: "Sin categoría",
      pairTitle: "Emparejar esta pantalla",
      pairSubtitle: "Pide el código al dueño del negocio.",
      pairPlaceholder: "Código de emparejamiento",
      pairButton: "Emparejar",
      pairingLabel: "Emparejando…",
      pinTitle: "Entrar a cocina",
      pinSubtitle: "Ingresa tu PIN.",
      pinPlaceholder: "••••",
      enterButton: "Entrar",
      enteringLabel: "Entrando…",
      errOriginNotAllowed: "Origen no permitido",
      errMissingCode: "Falta el código",
      errInvalidCode: "Código inválido o ya usado",
      errNotPaired: "Este dispositivo no está emparejado",
      errMissingPin: "Falta el PIN",
      errInvalidDevice: "Este dispositivo no está emparejado",
      errLocked: "Demasiados intentos, espera un momento",
      errInvalidPin: "PIN incorrecto",
      errConnection: "No se pudo conectar",
    },
    panel: {
      nav: {
        resumen: "Resumen",
        menu: "Menú",
        trucks: "Trucks",
        marca: "Marca",
        personal: "Personal",
        qr: "Códigos QR",
        cuenta: "Cuenta",
        logout: "Cerrar sesión",
      },
      sinAccesoTitle: "Todavía no tenemos tu cuenta vinculada",
      sinAccesoBody: "Escríbenos a soporte para que te demos acceso al panel de tu negocio.",
      common: {
        save: "Guardar",
        saving: "Guardando…",
        saved: "Guardado ✓",
        cancel: "Cancelar",
        edit: "Editar",
        create: "Crear",
        add: "Agregar",
        remove: "Quitar",
        yesRemove: "Sí, quitar",
        noPhoto: "Sin foto",
        uploading: "Subiendo…",
        chooseImage: "Elegir imagen",
        nameEsPlaceholder: "Nombre en español",
        nameEnPlaceholder: "Name in English",
      },
      menuPage: {
        title: "Menú",
        subtitle: "El interruptor de agotado es para “se me acabó hoy”. Quitar del menú es permanente.",
        noCategory: "Sin categoría",
        addCategory: "+ Agregar categoría",
        createCategory: "Crear categoría",
        pricePlaceholder: "Precio",
        addProduct: "+ Agregar platillo",
        hideOptions: "Ocultar",
        showOptions: "Personalización",
        soldOut: "Se acabó",
        confirmRemove: "¿Seguro? Si solo se acabó hoy, usa el interruptor.",
        removeFromMenu: "Quitar del menú",
        noOptionGroups: "Sin grupos de personalización todavía.",
        required: "obligatorio",
        optionalLabel: "opcional",
        selectRange: (min, max) => `elige ${min}–${max}`,
        deleteGroup: "Eliminar grupo",
        addOptionGroup: "+ Agregar grupo de opciones",
        addOption: "+ Agregar opción",
        addWithCost: "Agregar (con costo)",
        removeNoCost: "Quitar (sin costo)",
        priceDeltaPlaceholder: "+$",
        minLabel: "mínimo",
        maxLabel: "máximo",
        requiredLabel: "obligatorio",
        allTrucksFilter: "Todos los trucks",
        statsLine: (total, out, noPhoto) =>
          `${total} platillo${total === 1 ? "" : "s"}` +
          (out ? ` · ${out} agotado${out === 1 ? "" : "s"}` : "") +
          (noPhoto ? ` · ${noPhoto} sin foto` : " · todos con foto"),
        whoSellsIt: "¿Quién lo vende?",
      },
      trucksPage: {
        title: "Trucks",
        subtitle: "Pausar cierra el pedido por QR temporalmente y reabre solo. Archivar da de baja sin borrar nada.",
        newTruckNote: "Alta de un truck nuevo: en esta fase la hacemos nosotros a mano, para confirmar ubicación y horarios contigo.",
        contactUs: "Escríbenos",
        showArchived: "Ver",
        hideArchived: "Ocultar",
        alertLabel: "Avisar en cocina si no hay actividad por",
        minSuffix: "min",
        publishedHours: "Horario publicado",
        publishedHoursHint: "— de aquí sale “abrió tarde” en Resumen",
        openLabel: "abierto",
        toLabel: "a",
        saveHours: "Guardar horario",
        hoursSaved: "Guardado ✓",
        reopenNow: "Reabrir ahora",
        pause: "Pausar",
        pause1h: "1 hora",
        pause3h: "3 horas",
        pauseManual: "Hasta que reabra a mano",
        pausedBadge: "Pausado",
        openBadge: "Abierto",
        reopens: (when) => `Reabre ${when}`,
        untilManualReopen: "Hasta que reabras a mano",
        archiveTruck: "Archivar truck",
        confirmArchiveText: "Se archiva, no se borra. ¿Seguro?",
        yesArchive: "Sí, archivar",
        archivedOn: (date) => `Archivado ${date}`,
        reactivate: "Reactivar",
        locationPlaceholder: "¿Dónde se para normalmente? (opcional)",
        taxTitle: "Cómo manejas el impuesto",
        taxHint: "Afecta el menú, el ticket y tus reportes.",
        taxAdd: "Se agrega al total",
        taxAddHint: "El menú muestra el precio y al final se suma el impuesto.",
        taxIncluded: "Ya viene incluido",
        taxIncludedHint: "Lo que ve en el menú es lo que paga. Sin sorpresas al final.",
        sharedSettingsTitle: "Ajustes para todos tus trucks",
        sharedSettingsHint: "El impuesto vale para todo el negocio. Cada truck lleva su propio umbral de aviso en cocina.",
        pauseModalTitle: (name) => `Pausar ${name}`,
        pauseModalExplain: "Deja de recibir pedidos y se reabre solo. Tus clientes van a ver esto:",
        pausePreviewLabel: "Lo que ve tu cliente",
        pausePreviewClosedToday: "Hoy ya cerramos",
        pausePreviewReturnsAt: (when) => `Regresamos a las ${when}`,
        pauseWhyLabel: "¿Por qué?",
        pauseReason1: "Se acabó el gas",
        pauseReason2: "Cambio de turno",
        pauseReason3: "Se acabó la comida",
        pauseReason4: "Descanso del personal",
        pauseUntilLabel: "¿Hasta cuándo?",
        pauseDur30: "30 minutos",
        pauseDur1h: "1 hora",
        pauseDur2h: "2 horas",
        pauseDurRestOfDay: "El resto del día",
        pauseConfirm: "Pausar ahora",
        pauseReasonLabel: (reason) => `Motivo: ${reason}`,
      },
      marcaPage: {
        title: "Marca",
        subtitle: "Lo que ve tu cliente cuando escanea el código — cuatro decisiones, ninguna más.",
        step1: "1 · TU LOGO",
        uploadLogoTitle: "Sube tu logo",
        uploadLogoHint: "PNG o JPG. Se ve mejor cuadrado.",
        step2: "2 · TU COLOR",
        chooseColorTitle: "Elige tu color",
        chooseColorHint: "Diez colores probados bajo el sol. Cualquiera funciona — no hay forma de elegir mal.",
        step3: "3 · TU PORTADA",
        coverTitle: "Foto de portada",
        coverHint: "La foto de tu truck o de tu comida, arriba del menú. Es opcional.",
        step4: "4 · TU ESTILO",
        styleTitle: "Cómo se ve tu menú",
        styleHint: "Si todavía no tienes fotos de tus platillos, Tradicional se ve mejor.",
        vibrante: "Vibrante",
        vibranteHint: "Con foto de cada platillo.",
        tradicional: "Tradicional",
        tradicionalHint: "Lista con precios alineados.",
        unsavedLabel: "Sin guardar",
        noChangesLabel: "Sin cambios por guardar",
        saveChanges: "Guardar cambios",
        previewLabel: "Así lo verá tu cliente",
        liveLabel: "En vivo",
        coverPlaceholder: "Tu foto de portada aquí",
        addPreviewLabel: "Agregar",
        motifStep: "DETALLE",
        motifTitle: "El dibujo de fondo",
        motifHint: "Unas líneas discretas en el encabezado, según lo que vendes.",
        truckOverrideSummary: "¿Un truck con otra marca?",
        truckOverrideBody: "Normalmente los trucks comparten logo y color, y cada uno lleva su propio nombre y foto. Si alguno opera con otra marca, aquí puedes darle color propio — es una excepción, no algo que tengas que decidir.",
        truckOverrideOwn: "Color propio",
        truckOverrideRemove: "Quitar",
        truckOverrideInherits: "Usa el del negocio",
      },
      personalPage: {
        title: "Personal",
        subtitle: "PINs para cocina y ventanilla, y las tablets que los usan. Nada de esto pasa por correo ni contraseña — el dueño resuelve altas, bajas y dispositivos perdidos sin llamarnos.",
        staffTitle: "Personal",
        addPerson: "+ Agregar persona",
        staffHint: "Cada persona entra a cocina con su PIN de 4 dígitos. Quitarla corta su acceso al instante.",
        namePlaceholder: "Nombre",
        pinPlaceholder: "PIN de 4 dígitos",
        allTrucks: "Todos los trucks",
        noStaffYet: "Todavía no hay personal.",
        showRemoved: (n) => `Ver personal dado de baja (${n})`,
        hideRemoved: (n) => `Ocultar personal dado de baja (${n})`,
        confirmRemoveAccess: "¿Quitar acceso?",
        devicesTitle: "Dispositivos",
        devicesHint: "Cada tablet o celular de cocina se conecta una sola vez con un código. Revocarlo la desconecta al instante.",
        pairTablet: "+ Emparejar tablet",
        deviceNamePlaceholder: "Nombre del dispositivo (ej. Tablet cocina)",
        generateCode: "Generar código",
        pairingCodeTitle: "Código de emparejamiento — captúralo ahora, no se vuelve a mostrar",
        pairingCodeHint: "En la tablet, abre /cocina y escribe este código.",
        done: "Listo",
        noDevicesYet: "Todavía no hay dispositivos.",
        showRevoked: (n) => `Ver revocados (${n})`,
        hideRevoked: (n) => `Ocultar revocados (${n})`,
        pairedBadge: "Emparejado",
        waitingCodeBadge: "Esperando código",
        confirmRevoke: "¿Revocar?",
        yesRevoke: "Sí, revocar",
        revoke: "Revocar",
      },
      qrPage: {
        title: "Códigos QR",
        subtitle: "Uno por truck. Imprímelo y pégalo donde el comensal lo vea al hacer fila.",
        noActiveTrucks: "Todavía no hay ningún truck activo.",
        download: "Descargar para imprimir",
        openMenu: "Abrir el menú",
        realTitle: "Estos códigos son de verdad",
        realBody: "Escanéalos ahorita con la cámara de tu celular para comprobarlo — te van a mandar a la dirección que aparece debajo de cada uno.",
        howToTitle: "Qué hacer con ellos",
        how1: "Imprímelos en grande, mínimo del tamaño de una hoja carta. Un QR chiquito no se escanea desde la fila.",
        how2: "Pégalos donde se vean mientras esperan: la ventanilla, un costado del truck, las mesas si tienes.",
        how3: "Plastifícalos o mételos en un micaje. Van a aguantar sol, grasa y lluvia.",
        how4: "No los tapes con nada ni les pegues cosas encima. Si se raya o se despinta, imprime otro — es el mismo código.",
        printAll: "Imprimir los carteles",
        posterMsg: "Escanea y pide desde tu celular",
        posterMsg2: "Scan to order from your phone",
      },
      cuentaPage: {
        title: "Cuenta",
        subtitle: "Tu plan y tu suscripción.",
        yourPlan: "Tu plan",
        perMonth: "/ mes",
        activeTrucks: (n, price) => `${n} truck${n === 1 ? "" : "s"} activo${n === 1 ? "" : "s"} · $${price} por truck`,
        noCommission: "Sin comisión por pedido, nunca.",
        subscriptionStatus: "Estado de tu suscripción",
        billingNote: "En esta fase, cambios de plan y facturación los procesa nuestro equipo — nunca automático todavía.",
        moreTrucksTitle: "¿Necesitas más trucks o menos?",
        moreTrucksBody: "Agregar o dar de baja un truck se hace desde Trucks — tu plan se ajusta solo al siguiente ciclo, nunca a la mitad del mes.",
        trucksLink: "Trucks",
        cancelSent: "Recibimos tu solicitud. Te contactamos para confirmar la cancelación — nada se cancela todavía.",
        cancelExplain: "Cuéntanos por qué, si quieres — nos ayuda a mejorar. Esto no cancela nada por sí solo; te contactamos para confirmar.",
        notePlaceholder: "Opcional",
        sendRequest: "Enviar solicitud",
        sendingLabel: "Enviando…",
        requestCancellation: "Solicitar cancelación de mi suscripción",
        statusTrial: "Periodo de prueba",
        statusActive: "Activa",
        statusSuspended: "Suspendida",
        statusCancelled: "Cancelada",
        ladderTitle: "Cómo funciona el precio",
        ladderHint: "Entre más trucks, menos pagas por cada uno.",
        ladderTrucks: "Trucks",
        ladderPerTruck: "Por truck",
        ladderMonthly: "Al mes",
        ladderFivePlus: "5 o más",
        ladderYourPlan: "Tu plan",
        wantToTalk: "Quiero hablarlo",
      },
      resumenPage: {
        title: "Cómo va tu negocio",
        subtitle: "Todas las comparaciones son contra datos reales — si un periodo todavía no tiene ventas, lo decimos en vez de inventar un número.",
        salesOf: (label) => `Venta de ${label}`,
        vsLastMonth: "contra el mes anterior",
        vsSameMonthLastYear: (month) => `contra ${month} del año pasado`,
        avgPerDay: "promedio por día",
        yearAccrued: "Año acumulado",
        samePeriod: (year) => `Mismo periodo ${year}`,
        noData: "sin datos",
        monthlySales: "Venta mes a mes",
        vsLabel: (a, b) => `${a} contra ${b}`,
        eachTruckIn: (month) => `Cada truck en ${month}`,
        whereFrom: "De dónde llegan",
        topSelling: "Lo que más se vende",
        piecesThisMonth: "piezas este mes",
        salesActivity: "Actividad de venta",
        salesActivityHint: "Cuándo entra la primera y la última orden de cada truck",
        salesActivityDisclaimer: "Esto mide cuándo empieza y termina la venta de cada truck. No registra entradas ni salidas de personal, y no sirve para calcular pagos.",
        lateOpenInsightTitle: (unitName, minutes) => `${unitName} empieza a vender ${minutes} minutos tarde`,
        lateOpenInsightBody: (amount) => `Al ritmo de venta de esa unidad, esa franja ronda los ${amount} al mes — es una estimación a partir de su venta por hora, no un dato exacto.`,
        noSalesToGraph: "Todavía no hay ventas registradas para graficar.",
        noActiveTrucks: "Todavía no hay trucks activos.",
        noSalesThisMonth: "Todavía no hay ventas este mes.",
        noOrdersThisMonth: "Todavía no hay pedidos este mes.",
        noPreviousMonth: "sin mes anterior",
        byQrLabel: "por QR",
        qrChannel: "Código QR",
        ventanillaChannel: "Ventanilla",
        daysWithSales: (n) => `${n} día${n === 1 ? "" : "s"} con ventas, últimos 30 días`,
        opensLate: (dur) => `abre ${dur} tarde`,
        opensOnTime: "abre a tiempo",
        noPublishedHours: "sin horario publicado",
        firstOrder: "primera orden",
        lastOrder: "última",
        closesEarly: (dur) => `cierra ${dur} antes de lo publicado`,
        noOrdersLast30: (name) => `${name} — sin órdenes en los últimos 30 días.`,
      },
    },
    admin: {
      headerTitle: "FoodTruckOS · Admin interno",
      logout: "Cerrar sesión",
      mrr: "Ingreso mensual recurrente",
      businessesTotal: (n: number) => `${n} negocio${n === 1 ? "" : "s"} en total`,
      businessesHeader: "Negocios",
      colBusiness: "Negocio",
      colStatus: "Estado",
      colTrucks: "Trucks",
      colPlan: "Plan",
      colBilling: "Cobro",
      recentActivity: "Actividad reciente",
      noActivity: "Sin actividad todavía.",
      reactivate: "Reactivar",
      suspend: "Suspender",
      statusTrial: "Periodo de prueba",
      statusActive: "Activa",
      statusSuspended: "Suspendida",
      statusCancelled: "Cancelada",
      perMonth: "/mes",
      actionPriceChange: "Cambio de precio",
      actionCancelRequested: "Pidió cancelar",
      actionUnitPaused: "Pausó un truck",
      actionUnitReopened: "Reabrió un truck",
      actionUnitArchived: "Archivó un truck",
      actionUnitReactivated: "Reactivó un truck",
      actionBusinessSuspended: "Negocio suspendido",
      actionBusinessReactivated: "Negocio reactivado",
      kpiActiveBusinesses: "Negocios activos",
      kpiTrucksBilled: "Trucks facturados",
      kpiMonthlyRevenue: "Ingreso mensual",
      kpiAvgTenure: "Meses de permanencia",
      kpiAvgTenureUnit: "promedio",
      kpiPerClient: "Por cliente",
      platformHealthHeader: "Cómo va la plataforma",
      monthlyRevenuePanelTitle: "Ingreso mensual",
      thisMonthLabel: "este mes",
      portfolioPanelTitle: "Tu cartera hoy",
      portfolioTotalLabel: (n) => `${n} negocio${n === 1 ? "" : "s"} en total`,
      openLink: "Abrir",
      openDisabled: "Suspendido — reactívalo para verlo",
      payManual: "Manual",
      payStripe: "Stripe",
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
      notesPlaceholder: "e.g. no spice, to go",
      photoComing: "Photo coming",
      buildFrom: "From",
      buildCta: "Start",
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
      subs: {
        recibido: "They will start on it in a moment.",
        preparando: "We will tell you here as soon as it is done.",
        listo: "Head to the window and say your number.",
        entregado: "Enjoy it. See you next time.",
      },
      wait: (mins) => `${mins} min so far`,
      waitWithAvg: (mins, avg) => `${mins} min so far · usually about ${avg}`,
      notFound: "We could not find that order",
      notFoundSub: "The link may be old, or the order was already picked up a while ago.",
      backToMenu: "Back to the menu",
      due: "Pay at the window",
      paid: "Already paid",
      offline: "Offline — retrying",
      live: "Live",
      whatYouOrdered: "What you ordered",
      total: "Total",
      bell: "Tell me when it's ready",
      bellOn: "We'll tell you ✓",
      bellHint: "Keep this screen open and we'll play a sound. You'll also get the notification if you allowed it.",
      bellHintOff: "Without internet this won't update on its own. Reload when you have signal.",
      bellNote: "We'll tell you with a sound and, if you allow it, a browser notification.",
      bellDenied: "You didn't allow notifications — we'll still play this sound if you leave the screen open.",
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
      ordersToday: (n: number) => `${n} order${n === 1 ? "" : "s"} today`,
      salesButton: "Today's sales",
      soundOn: "Sound on",
      soundOff: "Sound off",
      daySummaryTitle: "How the day is going",
      daySummarySubtitle: (unitName: string) => `${unitName} · since it opened`,
      deliveredOrders: "Orders delivered",
      collectedToday: "Collected today",
      avgTicket: "Average ticket",
      openUnpaid: "Open, unpaid",
      topSellers: "Top sellers",
      undeliveredNote: (n: number) =>
        `${n} order${n === 1 ? "" : "s"} ${n === 1 ? "was" : "were"} delivered without charging. It's logged and the owner sees it in their panel.`,
      backToOrders: "Back to orders",
      daySummaryDisclaimer: "This is the truck's sales for the day, not any one person's.",
      soldOutTitle: "What's sold out?",
      soldOutHintSome: (n: number) => `${n} item${n === 1 ? "" : "s"} sold out · your customers don't see ${n === 1 ? "it" : "them"}`,
      soldOutHintAll: "Everything available. Turn off what runs out and it disappears from the menu instantly.",
      selling: "Selling",
      notOnMenu: "Not on the menu",
      extrasTitle: "Extras and options",
      unpaidBadge: "Unpaid",
      paidBadge: "Paid",
      collectBadge: "Collect",
      ventanillaSubtitle: "For someone who walked up without a phone. Enters the same board and the same sales record.",
      notesLabel: "Note",
      notesHint: "tap the usual ones or write it",
      notesPlaceholderOrder: "Anything else the kitchen should know",
      notesPlaceholderLine: "Anything else about this item",
      takeoutChip: "To go",
      dineinChip: "For here",
      allTogetherChip: "All together",
      extraCutleryChip: "Extra cutlery",
      alreadyPaid: "Already paid",
      payAtPickup: "Pay at pickup",
      sendToKitchen: "Send to kitchen",
      orderSent: (folio: number, paid: boolean) => `Order #${folio} sent to kitchen${paid ? " · already paid" : " · collect at delivery"}`,
      emptyTicket: "Tap items on the left to build the order.",
      totalWithTax: (n: number) => `With tax: $${n.toFixed(2)}`,
      changesLabel: "Changes",
      addNoteLabel: "+ Note",
      removeLine: "Remove",
      addToLine: "Add",
      ingredientsLabel: "Ingredients",
      addLabel: "Add",
      doneLabel: "Done",
      soldOutShort: "Sold out",
      emptyNew: "No new orders",
      emptyPrep: "Nothing cooking",
      emptyReady: "Nothing ready to deliver",
      micDictate: "Dictate",
      micListening: "Listening… speak normally.",
      micDone: "Done. Check it before sending.",
      micDenied: "You didn't allow the microphone.",
      micNoSpeech: "I didn't hear anything. Try again or use the buttons.",
      micNetwork: "Without internet dictation doesn't work. Type the note.",
      micGeneric: "Couldn't dictate here. Type the note.",
      micUnsupported: "This device can't dictate. Use the buttons or type.",
      back: "Back",
      anyChange: "Any changes?",
      add: "Add",
      counterFallbackName: "Counter",
      noCategoryLabel: "No category",
      pairTitle: "Pair this screen",
      pairSubtitle: "Ask the business owner for the code.",
      pairPlaceholder: "Pairing code",
      pairButton: "Pair",
      pairingLabel: "Pairing…",
      pinTitle: "Enter kitchen",
      pinSubtitle: "Enter your PIN.",
      pinPlaceholder: "••••",
      enterButton: "Enter",
      enteringLabel: "Entering…",
      errOriginNotAllowed: "Origin not allowed",
      errMissingCode: "Missing code",
      errInvalidCode: "Invalid or already used code",
      errNotPaired: "This device is not paired",
      errMissingPin: "Missing PIN",
      errInvalidDevice: "This device is not paired",
      errLocked: "Too many attempts, wait a moment",
      errInvalidPin: "Incorrect PIN",
      errConnection: "Could not connect",
    },
    panel: {
      nav: {
        resumen: "Summary",
        menu: "Menu",
        trucks: "Trucks",
        marca: "Brand",
        personal: "Staff",
        qr: "QR codes",
        cuenta: "Account",
        logout: "Log out",
      },
      sinAccesoTitle: "We haven't linked your account yet",
      sinAccesoBody: "Email support so we can give you access to your business panel.",
      common: {
        save: "Save",
        saving: "Saving…",
        saved: "Saved ✓",
        cancel: "Cancel",
        edit: "Edit",
        create: "Create",
        add: "Add",
        remove: "Remove",
        yesRemove: "Yes, remove",
        noPhoto: "No photo",
        uploading: "Uploading…",
        chooseImage: "Choose image",
        nameEsPlaceholder: "Nombre en español",
        nameEnPlaceholder: "Name in English",
      },
      menuPage: {
        title: "Menu",
        subtitle: "The sold-out switch is for “ran out today.” Removing from the menu is permanent.",
        noCategory: "No category",
        addCategory: "+ Add category",
        createCategory: "Create category",
        pricePlaceholder: "Price",
        addProduct: "+ Add item",
        hideOptions: "Hide",
        showOptions: "Customization",
        soldOut: "Sold out",
        confirmRemove: "Sure? If it just ran out today, use the switch instead.",
        removeFromMenu: "Remove from menu",
        noOptionGroups: "No customization groups yet.",
        required: "required",
        optionalLabel: "optional",
        selectRange: (min, max) => `choose ${min}–${max}`,
        deleteGroup: "Delete group",
        addOptionGroup: "+ Add option group",
        addOption: "+ Add option",
        addWithCost: "Add (with cost)",
        removeNoCost: "Remove (no cost)",
        priceDeltaPlaceholder: "+$",
        minLabel: "minimum",
        maxLabel: "maximum",
        requiredLabel: "required",
        allTrucksFilter: "All trucks",
        statsLine: (total, out, noPhoto) =>
          `${total} item${total === 1 ? "" : "s"}` +
          (out ? ` · ${out} sold out` : "") +
          (noPhoto ? ` · ${noPhoto} without a photo` : " · all with photos"),
        whoSellsIt: "Who sells it?",
      },
      trucksPage: {
        title: "Trucks",
        subtitle: "Pausing closes QR ordering temporarily and reopens on its own. Archiving retires it without deleting anything.",
        newTruckNote: "Adding a new truck: right now we do it by hand, to confirm location and hours with you.",
        contactUs: "Email us",
        showArchived: "Show",
        hideArchived: "Hide",
        alertLabel: "Alert the kitchen if there's no activity for",
        minSuffix: "min",
        publishedHours: "Published hours",
        publishedHoursHint: "— this is what “opened late” in Summary is based on",
        openLabel: "open",
        toLabel: "to",
        saveHours: "Save hours",
        hoursSaved: "Saved ✓",
        reopenNow: "Reopen now",
        pause: "Pause",
        pause1h: "1 hour",
        pause3h: "3 hours",
        pauseManual: "Until reopened by hand",
        pausedBadge: "Paused",
        openBadge: "Open",
        reopens: (when) => `Reopens ${when}`,
        untilManualReopen: "Until you reopen it by hand",
        archiveTruck: "Archive truck",
        confirmArchiveText: "This archives it, doesn't delete it. Sure?",
        yesArchive: "Yes, archive",
        archivedOn: (date) => `Archived ${date}`,
        reactivate: "Reactivate",
        locationPlaceholder: "Where does it usually park? (optional)",
        taxTitle: "How you handle tax",
        taxHint: "Affects the menu, the ticket, and your reports.",
        taxAdd: "Added to the total",
        taxAddHint: "The menu shows the price and tax is added at the end.",
        taxIncluded: "Already included",
        taxIncludedHint: "What they see on the menu is what they pay. No surprises at the end.",
        sharedSettingsTitle: "Settings for all your trucks",
        sharedSettingsHint: "Tax applies to the whole business. Each truck keeps its own kitchen alert threshold.",
        pauseModalTitle: (name) => `Pause ${name}`,
        pauseModalExplain: "It stops taking orders and reopens on its own. Your customers will see this:",
        pausePreviewLabel: "What your customer sees",
        pausePreviewClosedToday: "We're closed for today",
        pausePreviewReturnsAt: (when) => `Back at ${when}`,
        pauseWhyLabel: "Why?",
        pauseReason1: "Ran out of gas",
        pauseReason2: "Shift change",
        pauseReason3: "Ran out of food",
        pauseReason4: "Staff break",
        pauseUntilLabel: "Until when?",
        pauseDur30: "30 minutes",
        pauseDur1h: "1 hour",
        pauseDur2h: "2 hours",
        pauseDurRestOfDay: "The rest of the day",
        pauseConfirm: "Pause now",
        pauseReasonLabel: (reason) => `Reason: ${reason}`,
      },
      marcaPage: {
        title: "Brand",
        subtitle: "What your customer sees when they scan the code — four decisions, nothing more.",
        step1: "1 · YOUR LOGO",
        uploadLogoTitle: "Upload your logo",
        uploadLogoHint: "PNG or JPG. Looks best square.",
        step2: "2 · YOUR COLOR",
        chooseColorTitle: "Choose your color",
        chooseColorHint: "Ten colors tested in direct sunlight. Any of them works — there's no wrong choice.",
        step3: "3 · YOUR COVER PHOTO",
        coverTitle: "Cover photo",
        coverHint: "A photo of your truck or your food, above the menu. Optional.",
        step4: "4 · YOUR STYLE",
        styleTitle: "How your menu looks",
        styleHint: "If you don't have photos of your dishes yet, Traditional looks better.",
        vibrante: "Vibrant",
        vibranteHint: "With a photo of every dish.",
        tradicional: "Traditional",
        tradicionalHint: "A list with aligned prices.",
        unsavedLabel: "Unsaved",
        noChangesLabel: "No changes to save",
        saveChanges: "Save changes",
        previewLabel: "What your customer will see",
        liveLabel: "Live",
        coverPlaceholder: "Your cover photo here",
        addPreviewLabel: "Add",
        motifStep: "DETAIL",
        motifTitle: "Background artwork",
        motifHint: "A few discreet lines in the header, based on what you sell.",
        truckOverrideSummary: "A truck with a different brand?",
        truckOverrideBody: "Normally your trucks share the same logo and color, and each keeps its own name and photo. If one operates under a different brand, you can give it its own color here — it's an exception, not something you have to decide.",
        truckOverrideOwn: "Own color",
        truckOverrideRemove: "Remove",
        truckOverrideInherits: "Uses the business color",
      },
      personalPage: {
        title: "Staff",
        subtitle: "PINs for the kitchen and the counter, and the tablets that use them. None of this goes through email or a password — the owner handles additions, removals, and lost devices without calling us.",
        staffTitle: "Staff",
        addPerson: "+ Add person",
        staffHint: "Each person enters the kitchen with their 4-digit PIN. Removing them cuts their access instantly.",
        namePlaceholder: "Name",
        pinPlaceholder: "4-digit PIN",
        allTrucks: "All trucks",
        noStaffYet: "No staff yet.",
        showRemoved: (n) => `Show removed staff (${n})`,
        hideRemoved: (n) => `Hide removed staff (${n})`,
        confirmRemoveAccess: "Remove access?",
        devicesTitle: "Devices",
        devicesHint: "Each kitchen tablet or phone connects once with a code. Revoking it disconnects it instantly.",
        pairTablet: "+ Pair tablet",
        deviceNamePlaceholder: "Device name (e.g. Kitchen tablet)",
        generateCode: "Generate code",
        pairingCodeTitle: "Pairing code — capture it now, it won't show again",
        pairingCodeHint: "On the tablet, open /cocina and enter this code.",
        done: "Done",
        noDevicesYet: "No devices yet.",
        showRevoked: (n) => `Show revoked (${n})`,
        hideRevoked: (n) => `Hide revoked (${n})`,
        pairedBadge: "Paired",
        waitingCodeBadge: "Waiting for code",
        confirmRevoke: "Revoke?",
        yesRevoke: "Yes, revoke",
        revoke: "Revoke",
      },
      qrPage: {
        title: "QR codes",
        subtitle: "One per truck. Print it and post it where the customer sees it while in line.",
        noActiveTrucks: "No active trucks yet.",
        download: "Download to print",
        openMenu: "Open the menu",
        realTitle: "These codes are real",
        realBody: "Scan them right now with your phone's camera to check — they'll take you to the address shown under each one.",
        howToTitle: "What to do with them",
        how1: "Print them big, at least letter-size. A tiny QR doesn't scan from the line.",
        how2: "Post them where people see them while waiting: the window, the side of the truck, the tables if you have any.",
        how3: "Laminate them or put them in a sleeve. They'll take sun, grease, and rain.",
        how4: "Don't cover them with anything. If one gets scratched or faded, print another — it's the same code.",
        printAll: "Print the posters",
        posterMsg: "Escanea y pide desde tu celular",
        posterMsg2: "Scan to order from your phone",
      },
      cuentaPage: {
        title: "Account",
        subtitle: "Your plan and subscription.",
        yourPlan: "Your plan",
        perMonth: "/ month",
        activeTrucks: (n, price) => `${n} active truck${n === 1 ? "" : "s"} · $${price} per truck`,
        noCommission: "No commission per order, ever.",
        subscriptionStatus: "Your subscription status",
        billingNote: "At this stage, plan changes and billing are handled by our team — not automatic yet.",
        moreTrucksTitle: "Need more trucks or fewer?",
        moreTrucksBody: "Adding or removing a truck is done from Trucks — your plan adjusts on the next cycle, never mid-month.",
        trucksLink: "Trucks",
        cancelSent: "We received your request. We'll contact you to confirm the cancellation — nothing is cancelled yet.",
        cancelExplain: "Tell us why, if you'd like — it helps us improve. This doesn't cancel anything by itself; we'll contact you to confirm.",
        notePlaceholder: "Optional",
        sendRequest: "Send request",
        sendingLabel: "Sending…",
        requestCancellation: "Request to cancel my subscription",
        statusTrial: "Trial period",
        statusActive: "Active",
        statusSuspended: "Suspended",
        statusCancelled: "Cancelled",
        ladderTitle: "How pricing works",
        ladderHint: "The more trucks, the less you pay per truck.",
        ladderTrucks: "Trucks",
        ladderPerTruck: "Per truck",
        ladderMonthly: "Monthly",
        ladderFivePlus: "5 or more",
        ladderYourPlan: "Your plan",
        wantToTalk: "I want to talk about it",
      },
      resumenPage: {
        title: "How your business is doing",
        subtitle: "Every comparison is against real data — if a period doesn't have sales yet, we say so instead of making up a number.",
        salesOf: (label) => `Sales for ${label}`,
        vsLastMonth: "vs. last month",
        vsSameMonthLastYear: (month) => `vs. ${month} last year`,
        avgPerDay: "average per day",
        yearAccrued: "Year to date",
        samePeriod: (year) => `Same period ${year}`,
        noData: "no data",
        monthlySales: "Sales month by month",
        vsLabel: (a, b) => `${a} vs. ${b}`,
        eachTruckIn: (month) => `Each truck in ${month}`,
        whereFrom: "Where sales come from",
        topSelling: "Best sellers",
        piecesThisMonth: "units this month",
        salesActivity: "Sales activity",
        salesActivityHint: "When the first and last order of each truck come in",
        salesActivityDisclaimer: "This measures when each truck's selling starts and ends. It doesn't log staff clock-ins or clock-outs, and it's not used to calculate pay.",
        lateOpenInsightTitle: (unitName, minutes) => `${unitName} starts selling ${minutes} minutes late`,
        lateOpenInsightBody: (amount) => `At that unit's sales pace, that gap runs about ${amount} a month — an estimate from its hourly sales rate, not an exact figure.`,
        noSalesToGraph: "No sales recorded yet to graph.",
        noActiveTrucks: "No active trucks yet.",
        noSalesThisMonth: "No sales yet this month.",
        noOrdersThisMonth: "No orders yet this month.",
        noPreviousMonth: "no previous month",
        byQrLabel: "by QR",
        qrChannel: "QR code",
        ventanillaChannel: "Counter",
        daysWithSales: (n) => `${n} day${n === 1 ? "" : "s"} with sales, last 30 days`,
        opensLate: (dur) => `opens ${dur} late`,
        opensOnTime: "opens on time",
        noPublishedHours: "no published hours",
        firstOrder: "first order",
        lastOrder: "last",
        closesEarly: (dur) => `closes ${dur} before published`,
        noOrdersLast30: (name) => `${name} — no orders in the last 30 days.`,
      },
    },
    admin: {
      headerTitle: "FoodTruckOS · Internal admin",
      logout: "Log out",
      mrr: "Monthly recurring revenue",
      businessesTotal: (n: number) => `${n} business${n === 1 ? "" : "es"} total`,
      businessesHeader: "Businesses",
      colBusiness: "Business",
      colStatus: "Status",
      colTrucks: "Trucks",
      colPlan: "Plan",
      colBilling: "Billing",
      recentActivity: "Recent activity",
      noActivity: "No activity yet.",
      reactivate: "Reactivate",
      suspend: "Suspend",
      statusTrial: "Trial",
      statusActive: "Active",
      statusSuspended: "Suspended",
      statusCancelled: "Cancelled",
      perMonth: "/mo",
      actionPriceChange: "Price change",
      actionCancelRequested: "Requested cancellation",
      actionUnitPaused: "Paused a truck",
      actionUnitReopened: "Reopened a truck",
      actionUnitArchived: "Archived a truck",
      actionUnitReactivated: "Reactivated a truck",
      actionBusinessSuspended: "Business suspended",
      actionBusinessReactivated: "Business reactivated",
      kpiActiveBusinesses: "Active businesses",
      kpiTrucksBilled: "Trucks billed",
      kpiMonthlyRevenue: "Monthly revenue",
      kpiAvgTenure: "Months of tenure",
      kpiAvgTenureUnit: "average",
      kpiPerClient: "Per client",
      platformHealthHeader: "How the platform is doing",
      monthlyRevenuePanelTitle: "Monthly revenue",
      thisMonthLabel: "this month",
      portfolioPanelTitle: "Your portfolio today",
      portfolioTotalLabel: (n) => `${n} business${n === 1 ? "" : "es"} total`,
      openLink: "Open",
      openDisabled: "Suspended — reactivate it to view",
      payManual: "Manual",
      payStripe: "Stripe",
    },
  },
}
