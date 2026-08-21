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
    orderError: {
      emptyCart: string
      verifyFailed: string
      unavailable: string
      paused: string
      closed: string
      sendFailed: string
      badCart: string
    }
    updatedReloading: string
    retry: string
    emptyCart: string
    cancel: string
    customerNameLabel: string
    quantity: string
    notes: string
    notesPlaceholder: string
    photoComing: string
    buildFrom: string
    buildCta: string
    closedTitle: string
    closedBody: (unitName: string) => string
    reopensAt: (time: string) => string
    tryLaterHint: string
    notAvailableTitle: string
    notAvailableBody: string
    openNowLabel: string
    closedNowLabel: string
    todayHoursLabel: (day: string, range: string) => string
  }
  tracking: {
    title: string
    yourNumber: string
    steps: { recibido: string; preparando: string; listo: string; entregado: string }
    titles: { recibido: string; preparando: string; listo: string; entregado: string; cancelado: string }
    subs: { recibido: string; preparando: string; listo: string; entregado: string; cancelado: string }
    etaWindow: (desde: string, hasta: string) => string
    etaLate: string
    readyAgo: (mins: number) => string
    readyNow: string
    notFound: string
    notFoundSub: string
    backToMenu: string
    due: string
    payDueTitle: string
    payDueBody: string
    payDueBodyReady: string
    imHere: string
    imHereDone: string
    imHereHint: string
    paid: string
    offline: string
    connecting: string
    live: string
    doneClose: string
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
    paymentMethodCash: string
    paymentMethodCard: string
    paymentMethodPrompt: string
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
    collectNow: string
    arrivedBadge: string
    cancelOrder: string
    confirmCancelOrder: string
    keepOrder: string
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
    reprintButton: string
    printerMissingApp: string
    ticket: {
      order: string
      note: string
      toCollect: string
      paid: string
      reprint: string
    }
    noCategoryLabel: string
    lookupButton: string
    lookupTitle: string
    lookupSubtitle: string
    lookupFromDay: (fecha: string) => string
    lookupPlaceholder: string
    lookupSearch: string
    lookupSearching: string
    lookupNotFound: string
    lookupStatusRecibido: string
    lookupStatusPreparando: string
    lookupStatusListo: string
    lookupStatusEntregado: string
    lookupStatusCancelado: string
    lookupPaidWith: (method: string) => string
    lookupUnpaid: string
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
    backToTrucks: string
    trucksOverviewTitle: string
    trucksOverviewSubtitle: string
    trucksOverviewSalesToday: string
    truckNewLabel: string
    truckPrepLabel: string
    truckReadyLabel: string
    truckOldestLabel: string
    truckUnpaidLabel: string
    truckUnpaidNone: string
    truckSalesTodayLabel: string
    truckPausedPill: string
    truckOpenPill: string
    truckClosedPill: string
    truckOpensAtPill: (time: string) => string
    viewTruckBoard: string
    attentionNeededTitle: string
    attentionNeededEmpty: string
    trucksOverviewDisclaimer: string
    logout: string
    confirmLogout: string
    staffOnline: string
    staffOffline: string
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
      impersonatingBanner: (businessName: string) => string
      exitImpersonation: string
    }
    onboarding: {
      next: string
      back: string
      skip: string
      finish: string
      stepOf: (current: number, total: number) => string
      restartButton: string
      welcomeTitle: string
      welcomeBody: string
      resumenTitle: string
      resumenBody: string
      menuTitle: string
      menuBody: string
      menuCategoryTitle: string
      menuCategoryBody: string
      menuProductTitle: string
      menuProductBody: string
      trucksTitle: string
      trucksBody: string
      trucksCreateTitle: string
      trucksCreateBody: string
      marcaTitle: string
      marcaBody: string
      personalTitle: string
      personalBody: string
      personalDeviceTitle: string
      personalDeviceBody: string
      qrTitle: string
      qrBody: string
      cuentaTitle: string
      cuentaBody: string
      doneTitle: string
      doneBody: string
    }
    truckApprovalBanner: {
      title: string
      body: (unitName: string) => string
      cta: string
      dismiss: string
    }
    signupRequestPage: {
      accountConfirmedBadge: string
      oneStepLeft: string
      title: string
      intro: string
      businessNameLabel: string
      cityLabel: string
      phoneLabel: string
      noteLabel: string
      notePlaceholder: string
      submit: string
      sending: string
      sent: string
      pendingTitle: string
      pendingBody: (businessName: string, city: string) => string
      pendingSince: (date: string) => string
      pendingNoActionNeeded: string
    }
    suspendedTitle: string
    suspendedBody: string
    trialBanner: (daysLeft: number) => string
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
      copyFromSpanish: string
      suggestTranslation: string
      translating: string
      staleReloadToast: string
    }
    menuPage: {
      title: string
      subtitle: string
      noCategory: string
      addCategory: string
      createCategory: string
      editCategory: string
      deleteCategory: string
      confirmRemoveCategory: string
      noProductsInCategory: string
      pricePlaceholder: string
      addProduct: string
      hideOptions: string
      showOptions: string
      soldOut: string
      confirmRemove: string
      removeFromMenu: string
      noOptionGroups: string
      personalizationHint: string
      nameAndDescriptionTitle: string
      required: string
      optionalLabel: string
      selectRange: (min: number, max: number) => string
      deleteGroup: string
      addOptionGroup: string
      addOption: string
      addWithCost: string
      addNoCost: string
      groupKindQuestion: string
      groupKindAdd: string
      groupKindAddHint: string
      groupKindRemove: string
      groupKindRemoveHint: string
      priceDeltaPlaceholder: string
      priceDeltaHint: string
      minLabel: string
      maxLabel: string
      requiredLabel: string
      optionNameMissingError: string
      editOption: string
      allTrucksFilter: string
      statsLine: (total: number, out: number, noPhoto: number, scopeName: string | null) => string
    categorySummaryLine: (count: number, noun: string, out: number, noPhoto: number) => string
    collapseCategory: string
    expandCategory: string
      whoSellsIt: string
      noPhotoShort: string
      formError: string
      categoryFormError: string
      productFormError: string
      categoryRequiredError: string
      editModalHint: string
      addModalHint: string
      photoLabel: string
      photoHint: string
      descriptionEsPlaceholder: string
      descriptionEnPlaceholder: string
      whichCategoryLabel: string
      exclusivityAll: string
      exclusivityAllHint: string
      exclusivityOnly: (truckName: string) => string
      exclusivityOnlyHint: string
      noPhotoYetHint: string
      addProductSubmit: string
      addCategoryHint: string
      noTrucksExclusiveYet: string
    }
    trucksPage: {
      title: string
      subtitle: string
      newTruckNote: string
      contactUs: string
      showArchived: string
      hideArchived: string
      minSuffix: string
      reopenNow: string
      pause: string
      pausedBadge: string
      openBadge: string
      closedByHoursBadge: string
      opensAtBadge: (time: string) => string
      reopens: (when: string) => string
      untilManualReopen: string
      archiveTruck: string
      archivedOn: (date: string) => string
      reactivate: string
      locationPlaceholder: string
      taxTitle: string
      taxHint: string
      taxAdd: string
      taxAddHint: string
      taxIncluded: string
      taxIncludedHint: string
      sharedSettingsTitle: (n: number) => string
      sharedSettingsHint: string
      alertThresholdsLabel: string
      amberLabel: string
      redLabel: string
      alertTipWithData: (avg: number, amber: number, red: number) => string
      alertTipNoData: (amber: number, red: number) => string
      horarioLabel: string
      kitchenAlertsLabel: string
      ownAlertsTag: string
      businessAlertsTag: string
      closedAllWeek: string
      editNamePhoto: string
      changeHours: string
      setOwnAlerts: string
      removeOwnAlerts: string
      viewQr: string
      editTruckHint: string
      photoLabelTruck: string
      choosePhoto: string
      changePhoto: string
      removePhoto: string
      photoHintTruck: string
      nameQuestion: string
      locationQuestion: string
      nameRequired: string
      hoursModalTitle: (name: string) => string
      hoursModalHint: string
      applyToAllDays: string
      applyToAllNeedsOne: string
      wouldBeLabel: string
      saveSchedule: string
      invalidHoursRange: string
      closedDay: string
      ownAlertsModalTitle: (name: string) => string
      ownAlertsModalHint: (amber: number, red: number) => string
      onlyForLabel: (name: string) => string
      saveOwnAlerts: string
      archiveModalTitle: (name: string) => string
      archiveModalBody: string
      archiveModalBilling: string
      confirmArchiveText: string
      yesArchive: string
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
      requestTruckButton: string
      requestPending: (date: string) => string
      requestTruckTitle: string
      requestTruckBody: string
      requestTruckPriceLabel: string
      requestTruckPricePreview: (trucks: number, price: number) => string
      requestTruckTotalPreview: (total: number) => string
      requestTruckBillingNote: string
      requestTruckNoteLabel: string
      requestTruckNotePlaceholder: string
      requestTruckCancel: string
      requestTruckSubmit: string
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
      contrastConfirm: (colorName: string, ratio: string) => string
      step3: string
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
      addPreviewLabel: string
      previewNoProducts: string
      motifStep: string
      motifTitle: string
      motifHint: string
      headerStyleStep: string
      headerStyleTitle: string
      headerStyleHint: string
      headerStyleColor: string
      headerStyleColorHint: string
      headerStyleBlack: string
      headerStyleBlackHint: string
      truckOverrideSummary: string
      truckOverrideBody: string
      truckOverrideOwn: string
      truckOverrideRemove: string
      truckOverrideInherits: string
    }
    personalPage: {
      title: string
      subtitle: string
      selfServiceTitle: string
      selfServiceBody: string
      staffTitle: string
      addPerson: string
      staffHint: string
      whoLabel: string
      namePlaceholder: string
      nameMissingError: string
      deviceNameMissingError: string
      addStaffHint: string
      whatWillDoLabel: string
      roleCocina: string
      roleCocinaHint: string
      roleCajero: string
      roleCajeroHint: string
      roleEncargado: string
      roleEncargadoHint: string
      whichTruckLabel: string
      allTrucks: string
      encargadoAllTrucksHint: string
      deviceUnitHint: string
      truckArchivedSuffix: string
      createPin: string
      pinRevealTitle: string
      pinRevealHint: (name: string) => string
      pinRevealLabel: (name: string, truck: string) => string
      understood: string
      noStaffYet: string
      showRemoved: (n: number) => string
      hideRemoved: (n: number) => string
      confirmRemoveAccess: string
      resetPin: string
      resettingPin: string
      confirmResetPin: string
      yesReset: string
      pinResetTitle: string
      pinResetHint: (name: string) => string
      pinMaskedLabel: string
      usedToday: string
      usedYesterday: string
      usedDaysAgo: (n: number) => string
      neverUsedPin: string
      stillHereBadge: string
      devicesTitle: string
      devicesHint: string
      pairTablet: string
      deviceNamePlaceholder: string
      whichTruckDeviceLabel: string
      generateCode: string
      connectDeviceTitle: string
      connectDeviceHint: string
      pairingCodeLabel: string
      codeExpiresIn: (mmss: string) => string
      codeExpired: string
      close: string
      connectedSince: (date: string) => string
      lastSeenToday: string
      lastSeenYesterday: string
      lastSeenDaysAgo: (n: number) => string
      neverConnected: string
      printingOn: string
      printingOff: string
      printerUnnamed: string
      printerNeverPrinted: string
      printerLastOk: (fecha: string) => string
      ticketCopies: (n: number) => string
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
      viewKitchenTitle: string
      viewKitchenBody: string
      viewKitchenCta: string
      howToTitle: string
      how1: string
      how2: string
      how3: string
      how4: string
      printAll: string
      posterMsg: string
      posterMsg2: string
      posterStepsTitle: string
      posterStep1: string
      posterStep2: string
      posterStep3: string
      posterStep4: string
      posterPayNote: string
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
      howYouPayTitle: string
      howYouPayHint: string
      howYouPayManual: string
      howYouPayStripe: string
      yourDataTitle: string
      yourDataHint: string
      businessLabel: string
      emailLabel: string
      signInLabel: string
      signInGoogle: string
      signInPassword: string
      leaveTitle: string
      cancelConsequencesTitle: string
      cancelConsequencesIntro: string
      cancelConsequence1: (n: number) => string
      cancelConsequence2: string
      cancelConsequence3: string
      cancelConsequence4: string
      cancelKeepGoing: string
      cancelContinue: string
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
      yearDelta: string
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
      ledgerTitle: string
      ledgerSubtitle: string
      ledgerFilterTruck: string
      ledgerFilterAllTrucks: string
      ledgerFilterFrom: string
      ledgerFilterTo: string
      ledgerFilterPaymentMethod: string
      ledgerFilterAllMethods: string
      ledgerFilterPaymentStatus: string
      ledgerFilterAllStatuses: string
      ledgerFilterChannel: string
      ledgerFilterAllChannels: string
      ledgerSearchPlaceholder: string
      ledgerExport: string
      ledgerEmpty: string
      ledgerColFolio: string
      ledgerColDate: string
      ledgerColTruck: string
      ledgerColChannel: string
      ledgerColStatus: string
      ledgerColPayment: string
      ledgerColTotal: string
      ledgerShowingCount: (n: number) => string
      ledgerStatusPaid: string
      ledgerStatusUnpaid: string
      ledgerChannelQr: string
      ledgerChannelVentanilla: string
      lateOpenInsightTitle: (unitName: string, minutes: number) => string
      lateOpenInsightBody: (amount: string) => string
      highlightsTitle: string
      highlightsHint: string
      noHighlightsYet: string
      peakHourHighlight: (range: string, count: number) => string
      bestDayHighlight: (dayName: string, amount: string) => string
      avgPrepHighlight: (minutes: number) => string
      topProductHighlight: (name: string, qty: number) => string
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
      pendingCollectionTitle: string
      pendingInProgressLabel: string
      pendingInProgressHint: string
      pendingDeliveredLabel: string
      pendingDeliveredHint: string
      noShowLabel: string
      noShowHint: string
      noneLabel: string
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
    reactivateAsk: string
    reactivateAsTrial: string
    reactivateAsPaid: string
    cancel: string
    suspend: string
    recoveryButton: string
    recoveryHint: string
    recoveryConfirm: string
    recoverySend: string
    recoverySent: (email: string) => string
    statusTrial: string
    statusActive: string
    statusSuspended: string
    statusCancelled: string
    trialNoLimit: string
    trialSave: string
    trialSetDays: (n: number) => string
    trialExpired: string
    trialDaysLeft: (n: number) => string
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
    pendingRequestsHeader: string
    noPendingRequests: string
    requestApprove: string
    requestReject: string
    requestedOn: (date: string) => string
    currentTrucksLabel: (n: number) => string
    actionTruckRequestApproved: string
    actionTruckRequestRejected: string
    actionAdminViewedBusiness: string
    actionArchiveWarningSent: string
    archivedExpiryHeader: string
    archivedExpiryHint: string
    archivedOn: (date: string) => string
    retentionOverdue: string
    retentionMonthsLeft: (n: number) => string
    archiveContactedBadge: string
    archiveMarkContacted: string
    businessSignupsHeader: string
    noBusinessSignups: string
    businessSignupApprove: string
    businessSignupApproving: string
    businessSignupConfirm: string
    firstUnitNameLabel: string
    firstUnitLocationLabel: string
    actionBusinessSignupApproved: string
    actionBusinessSignupRejected: string
    actionProductRetired: string
    actionProductCreated: string
    actionStaffCreated: string
    actionStaffPinReset: string
    actionStaffRemoved: string
    actionDeviceCreated: string
    actionDeviceRevoked: string
    billingNoteTitle: string
    billingNoteBody: string
    billingRuleTitle: string
    billingRuleBody: string
  }
  auth: {
    signatureEyebrow: string
    signatureHeadline: string
    signatureBody: string
    ticketNew: string
    ticketPrep: string
    ticketReady: string
    loginTitle: string
    loginSubtitle: string
    googleButton: string
    dividerLabel: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    orGoogleLabel: string
    signInButton: string
    signingIn: string
    invalidCredentials: string
    tryMagicLinkHint: string
    magicLinkButton: string
    sendingMagicLink: string
    magicLinkSentTitle: string
    magicLinkSentBody: (email: string) => string
    magicLinkError: string
    forgotPassword: string
    recoverTitle: string
    recoverSubtitle: string
    recoverEmail: string
    recoverSend: string
    recoverSending: string
    recoverSentTitle: string
    recoverSentBody: (email: string) => string
    recoverSentNote: string
    recoverTooSoon: (segundos: number) => string
    recoverFailed: string
    recoverResend: string
    recoverResendIn: (segundos: number) => string
    recoverBackToLogin: string
    linkFailed: string
    newPasswordTitle: string
    newPasswordSubtitle: string
    newPasswordField: string
    newPasswordSave: string
    newPasswordSaving: string
    newPasswordDone: string
    newPasswordFailed: string
    newPasswordNoSession: string
    noAccountYet: string
    registerLink: string
    registerTitle: string
    registerSubtitle: string
    freeTrialNote: string
    businessNameLabel: string
    businessNamePlaceholder: string
    cityLabel: string
    cityPlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    registerEmailHint: string
    requestButton: string
    sendingRequest: string
    requestError: string
    requestSentTitle: string
    requestSentBody: (email: string) => string
    alreadyHaveAccount: string
    backToLogin: string
  }
  landing: {
    navProduct: string
    navBenefits: string
    navPricing: string
    navLogin: string
    ctaTrial: string
    heroEyebrow: string
    heroTitleLine1: string
    heroTitleAccent: string
    heroSub: string
    heroCtaPrimary: string
    heroCtaSecondary: string
    heroMeta: string
    showcaseEyebrow: string
    showcaseTitle: string
    showcaseSub: string
    boardTitle: string
    boardLive: string
    order1Name: string
    order1Items: string
    order1Badge: string
    order2Name: string
    order2Items: string
    order2Badge: string
    order3Name: string
    order3Items: string
    order3Badge: string
    stat1Label: string
    stat2Label: string
    stat3Label: string
    showcaseHint: string
    navEnter: string
    printEyebrow: string
    printTitle: string
    printSub: string
    printWhy1Title: string
    printWhy1Body: string
    printWhy2Title: string
    printWhy2Body: string
    printWhy3Title: string
    printWhy3Body: string
    printPickTitle: string
    printOptionATitle: string
    printOptionABody: string
    printOptionBTitle: string
    printOptionBBody: string
    printHardwareNote: string
    ticketTruck: string
    ticketOrder: string
    ticketItem1: string
    ticketItem1Remove: string
    ticketItem1Add: string
    ticketItem2: string
    ticketItem2Note: string
    ticketCustomer: string
    ticketCollect: string
    ticketCaption: string
    benefitsEyebrow: string
    benefitsTitle: string
    benefitsSub: string
    benefit1Title: string
    benefit1Body: string
    benefit2Title: string
    benefit2Body: string
    benefit3Title: string
    benefit3Body: string
    benefit4Title: string
    benefit4Body: string
    benefit5Title: string
    benefit5Body: string
    benefit6Title: string
    benefit6Body: string
    benefit7Title: string
    benefit7Body: string
    benefit8Title: string
    benefit8Body: string
    pricingEyebrow: string
    pricingTitle: string
    pricingSub: string
    price1Tag: string
    price2Tag: string
    price3Tag: string
    priceNote: string
    pricePer: string
    ctaTitle: string
    ctaSub: string
    footerCredit: string
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
      orderError: {
        emptyCart: "Tu carrito está vacío",
        verifyFailed: "No pudimos verificar el estado del truck. Intenta de nuevo.",
        unavailable: "Este truck no está disponible en este momento",
        paused: "Este truck está en pausa ahora mismo",
        closed: "Este truck está cerrado ahora mismo — vuelve dentro de su horario",
        sendFailed: "No pudimos enviar tu pedido. Revisa tu conexión e intenta otra vez",
        badCart: "Algo de tu pedido quedó desactualizado. Lo vaciamos — vuelve a elegir tus platillos.",
      },
      updatedReloading: "Actualizamos el menú — recargando tu pantalla. Tu pedido sigue en el carrito, solo dale a enviar otra vez.",
      retry: "Reintentar",
      emptyCart: "Vaciar el carrito y empezar de nuevo",
      cancel: "Cancelar",
      customerNameLabel: "Tu nombre (opcional)",
      quantity: "Cantidad",
      notes: "Notas para la cocina",
      notesPlaceholder: "Ej: sin picante, para llevar",
      photoComing: "Foto en camino",
      buildFrom: "Desde",
      buildCta: "Empezar",
      closedTitle: "Cerrado por ahora",
      closedBody: (unitName) => `${unitName} no está tomando pedidos en este momento.`,
      reopensAt: (time) => `Reabre ${time}.`,
      tryLaterHint: "Vuelve a intentar más tarde.",
      notAvailableTitle: "Menú no disponible",
      notAvailableBody: "Este menú no está disponible por ahora.",
      openNowLabel: "Abierto",
      closedNowLabel: "Cerrado",
      todayHoursLabel: (day, range) => `Hoy ${day.charAt(0).toUpperCase()}${day.slice(1)} ${range}`,
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
        recibido: "La cocina ya tiene tu orden",
        preparando: "Lo están preparando",
        listo: "¡Listo! Pasa por él",
        entregado: "¡Gracias!",
        cancelado: "Pedido cancelado",
      },
      subs: {
        recibido: "En un momento empiezan con él.",
        preparando: "Te avisamos aquí en cuanto esté.",
        listo: "Ve a la ventanilla y di tu número.",
        entregado: "Gracias por tu visita. Te esperamos en tu próxima compra.",
        cancelado: "Este pedido se canceló. Si no sabes por qué, pregunta en la ventanilla.",
      },
      etaWindow: (desde, hasta) => `Listo aproximadamente entre las ${desde} y las ${hasta}`,
      etaLate: "Está tardando un poco más de lo normal. Sale en cuanto la cocina lo libere.",
      readyAgo: (mins) => `Listo hace ${mins} min`,
      readyNow: "Listo apenas",
      notFound: "No encontramos ese pedido",
      notFoundSub: "El enlace puede estar viejo o el pedido ya se entregó hace rato.",
      backToMenu: "Volver al menú",
      due: "Paga en la ventanilla",
      payDueTitle: "Pago pendiente",
      payDueBody: "Puedes pagar ahora en la ventanilla o cuando recojas tu pedido. Pagar ahora hace más rápida la recogida.",
      payDueBodyReady: "Paga al recoger tu pedido.",
      imHere: "Ya estoy aquí",
      imHereDone: "Ya avisamos a la cocina que estás aquí",
      imHereHint: "Avísanos que ya estás esperando frente al food truck.",
      paid: "Ya está pagado",
      offline: "Sin conexión",
      connecting: "Conectando…",
      live: "En vivo",
      doneClose: "Ya puedes cerrar esta ventana, o volver atrás si quieres hacer otro pedido.",
      whatYouOrdered: "Lo que pediste",
      total: "Total",
      bell: "Avísame cuando esté listo",
      bellOn: "Te avisamos ✓",
      bellHint: "Mantén esta pantalla abierta para recibir el aviso.",
      bellHintOff: "Sin internet no se actualiza solo. Vuelve a cargar cuando tengas señal.",
      bellNote: "Listo. Te avisamos con un sonido en cuanto tu pedido esté.",
      bellDenied: "No diste permiso de notificación — igual te avisamos con un sonido si dejas esta pantalla abierta.",
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
      paymentMethodCash: "Efectivo",
      paymentMethodCard: "Tarjeta",
      paymentMethodPrompt: "¿Cómo pagó?",
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
      cancelOrder: "El cliente no llegó / cancelar",
      confirmCancelOrder: "Sí, cancelar — no se cobró",
      keepOrder: "No, mantener la orden",
      collectBadge: "Cobrar",
      collectNow: "Cobrar",
      arrivedBadge: "Ya llegó",
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
      reprintButton: "Reimprimir",
      printerMissingApp: "Esta tablet tiene la impresión activada, pero no está usando la app de FoodTruckOS — por eso no salen las comandas.",
      ticket: {
        order: "ORDEN",
        note: "Nota",
        toCollect: "POR COBRAR",
        paid: "PAGADA",
        reprint: "COPIA",
      },
      lookupButton: "Buscar pedido",
      lookupTitle: "Buscar pedido",
      lookupSubtitle: "Por número de orden, últimos 7 días. Si el número se repite, muestra el más reciente.",
      lookupFromDay: (fecha) => `del ${fecha}`,
      lookupPlaceholder: "Ej. 42",
      lookupSearch: "Buscar",
      lookupSearching: "Buscando…",
      lookupNotFound: "No encontramos ese folio en los últimos 7 días",
      lookupStatusRecibido: "Nueva",
      lookupStatusPreparando: "Preparando",
      lookupStatusListo: "Lista",
      lookupStatusEntregado: "Entregada",
      lookupStatusCancelado: "Cancelada",
      lookupPaidWith: (method) => `Pagada · ${method}`,
      lookupUnpaid: "Sin cobrar",
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
      backToTrucks: "← Trucks",
      trucksOverviewTitle: "Los trucks, ahora",
      trucksOverviewSubtitle: "Cómo va cada uno en este momento",
      trucksOverviewSalesToday: "Venta de hoy, todos los trucks",
      truckNewLabel: "Nuevas",
      truckPrepLabel: "Preparando",
      truckReadyLabel: "Listas",
      truckOldestLabel: "La más antigua",
      truckUnpaidLabel: "Por cobrar",
      truckUnpaidNone: "ninguna",
      truckSalesTodayLabel: "Venta de hoy",
      truckPausedPill: "En pausa",
      truckOpenPill: "Abierto",
      truckClosedPill: "Cerrado",
      truckOpensAtPill: (time) => `Abre ${time}`,
      viewTruckBoard: "Ver su tablero",
      attentionNeededTitle: "Requieren atención",
      attentionNeededEmpty: "Nada pasado de tiempo. Todos los trucks van al día.",
      trucksOverviewDisclaimer: "Se actualiza cada vez que entras a esta pantalla.",
      logout: "Cerrar sesión",
      confirmLogout: "¿Cerrar tu sesión en este dispositivo?",
      staffOnline: "En línea",
      staffOffline: "Desconectado",
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
        impersonatingBanner: (businessName) => `Estás viendo el panel de ${businessName} como administrador`,
        exitImpersonation: "Salir",
      },
      onboarding: {
        next: "Siguiente",
        back: "Atrás",
        skip: "Saltar el tour",
        finish: "Terminar",
        stepOf: (current, total) => `Paso ${current} de ${total}`,
        restartButton: "Ver el tutorial de nuevo",
        welcomeTitle: "¡Bienvenido a FoodTruckOS!",
        welcomeBody: "Te mostramos rápido qué puedes hacer en cada pantalla. Toma menos de dos minutos, y puedes saltarlo cuando quieras.",
        resumenTitle: "Resumen",
        resumenBody: "Aquí ves cómo va tu negocio: cuánto vendiste este mes, qué se vende más, y cómo se comparan tus trucks entre sí.",
        menuTitle: "Menú",
        menuBody: "Aquí armas lo que vendes: primero creas categorías (como \"Bebidas\" o \"Postres\"), y dentro de cada una agregas tus platillos.",
        menuCategoryTitle: "Crea tu primera categoría",
        menuCategoryBody: "Usa este botón para crear una categoría. Puedes editarla o eliminarla después, si no tiene platillos dentro.",
        menuProductTitle: "Agrega un platillo",
        menuProductBody: "Con este botón agregas un platillo: nombre, precio y foto. Si quieres que el cliente pueda pedirlo \"sin cebolla\" o \"con extra queso\", eso se configura después, al editar el platillo, en la sección de Personalización.",
        trucksTitle: "Trucks",
        trucksBody: "Aquí configuras cada camión: su nombre, foto y horario. El horario es lo que decide si tu menú aparece abierto o cerrado para el cliente.",
        trucksCreateTitle: "Configura tu primer truck",
        trucksCreateBody: "Nombre, foto y horario son lo único obligatorio. Los tiempos de aviso en cocina puedes dejarlos como están — son solo para avisarte si un pedido se está tardando. Cuando quieras, puedes agregar más trucks desde aquí abajo.",
        marcaTitle: "Marca",
        marcaBody: "Aquí le das la imagen a tu menú: sube tu logo, elige tu color, y el resto del estilo — así es como tus clientes te van a reconocer.",
        personalTitle: "Personal",
        personalBody: "Aquí das de alta a cada persona de tu equipo. Le pones su nombre y su rol, y el sistema le genera un PIN de 4 dígitos para entrar a cocina.",
        personalDeviceTitle: "Conecta el aparato de cada persona",
        personalDeviceBody: "Después de crear a la persona, usa este botón para asociar el celular o tablet donde va a trabajar — así cada aparato entra solo con su PIN correspondiente.",
        qrTitle: "Códigos QR",
        qrBody: "Aquí descargas o imprimes el código QR de cada truck. Tus clientes lo escanean para ver el menú y ordenar desde su celular, sin necesitar ninguna cuenta.",
        cuentaTitle: "Cuenta",
        cuentaBody: "Aquí ves tu plan, cuántos trucks tienes activos, y cómo entraste a tu cuenta. Si quieres volver a ver este tutorial, más abajo hay un botón para reiniciarlo.",
        doneTitle: "¡Listo!",
        doneBody: "Ya conoces todo el panel. Puedes empezar por Menú creando tu primera categoría, o ir directo a Trucks a configurar tu horario.",
      },
      truckApprovalBanner: {
        title: "¡Tu truck nuevo ya está aprobado!",
        body: (unitName) => `${unitName} ya está activo — ve a Trucks para configurar su horario y su marca.`,
        cta: "Configurarlo ahora",
        dismiss: "Ya lo vi",
      },
      signupRequestPage: {
        accountConfirmedBadge: "Tu cuenta ya está confirmada",
        oneStepLeft: "Solo falta este paso para quedar en revisión.",
        title: "Cuéntanos de tu negocio",
        intro: "Con estos datos revisamos tu solicitud y activamos tu panel — no necesitas hacer nada más después de enviarla.",
        businessNameLabel: "Nombre del negocio",
        cityLabel: "Ciudad",
        phoneLabel: "Teléfono (opcional)",
        noteLabel: "Algo más que debamos saber (opcional)",
        notePlaceholder: "Ej: cuántos trucks, en qué ubicaciones",
        submit: "Enviar solicitud",
        sending: "Enviando…",
        sent: "Listo, recibimos tu solicitud. Te contactamos pronto para activar tu panel.",
        pendingTitle: "Tu solicitud está en revisión",
        pendingBody: (businessName, city) => `Recibimos la solicitud de "${businessName}" en ${city}. Te contactamos pronto para activar tu panel.`,
        pendingSince: (date) => `Enviada el ${date}`,
        pendingNoActionNeeded: "No necesitas hacer nada más — en cuanto la aprobemos vas a poder entrar directo a tu panel con esta misma cuenta.",
      },
      suspendedTitle: "Cuenta suspendida",
      suspendedBody: "Tu suscripción no está vigente. El panel, la cocina y el menú de tus clientes están pausados hasta que se resuelva. Contáctanos para reactivarla.",
      trialBanner: (daysLeft) =>
        daysLeft <= 0
          ? "Tu prueba gratis termina hoy — contáctanos para no perder acceso."
          : daysLeft === 1
            ? "Tu prueba gratis termina mañana — contáctanos para seguir usando FoodTruckOS."
            : `Tu prueba gratis termina en ${daysLeft} días — contáctanos para seguir usando FoodTruckOS.`,
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
        copyFromSpanish: "Usar el mismo texto",
        suggestTranslation: "Traducir con IA",
        translating: "Traduciendo…",
        staleReloadToast: "Actualizamos el panel — recargando esta pantalla…",
      },
      menuPage: {
        title: "Tu menú",
        subtitle: "Aquí armas lo que tus clientes ven al escanear el código: platillos, precios y fotos. El interruptor de agotado es para “se me acabó hoy” — quitar del menú es permanente.",
        noCategory: "Sin categoría",
        addCategory: "+ Agregar categoría",
        createCategory: "Crear categoría",
        editCategory: "Editar categoría",
        deleteCategory: "Eliminar categoría",
        confirmRemoveCategory: "¿Eliminar esta categoría? Solo se puede si no tiene platillos.",
        noProductsInCategory: "Todavía no tiene platillos.",
        pricePlaceholder: "Precio",
        addProduct: "+ Agregar platillo",
        hideOptions: "Ocultar",
        showOptions: "Personalización",
        soldOut: "Se acabó",
        confirmRemove: "¿Seguro? Si solo se acabó hoy, usa el interruptor.",
        removeFromMenu: "Quitar del menú",
        noOptionGroups: "Sin grupos de personalización todavía.",
        personalizationHint: "¿Quieres que el cliente pueda personalizar este platillo? Ej. \"¿le agregamos algo?\" o \"¿le quitamos algo?\". Opcional.",
        nameAndDescriptionTitle: "Nombre y descripción",
        required: "obligatorio",
        optionalLabel: "opcional",
        selectRange: (min, max) => `elige ${min}–${max}`,
        deleteGroup: "Eliminar grupo",
        addOptionGroup: "+ Agregar grupo de opciones",
        addOption: "+ Agregar opción",
        addWithCost: "Agregar con costo",
        addNoCost: "Agregar sin costo",
        groupKindQuestion: "¿Este grupo es para agregar o para quitar ingredientes?",
        groupKindAdd: "Se agrega",
        groupKindAddHint: "Ej. extra queso, tocino",
        groupKindRemove: "Se quita",
        groupKindRemoveHint: "Ej. sin cebolla, sin picante",
        priceDeltaPlaceholder: "+$",
        priceDeltaHint: "Déjalo en 0 si no tiene costo extra",
        optionNameMissingError: "Escribe el nombre del ingrediente en español y en inglés",
        editOption: "Editar",
        minLabel: "mínimo",
        maxLabel: "máximo",
        requiredLabel: "obligatorio",
        allTrucksFilter: "Todos los trucks",
        statsLine: (total, out, noPhoto, scopeName) =>
          (scopeName ? `${total} platillo${total === 1 ? "" : "s"} se venden en ${scopeName}` : `${total} platillo${total === 1 ? "" : "s"} en total`) +
          (out ? ` · ${out} agotado${out === 1 ? "" : "s"}` : "") +
          (noPhoto ? ` · ${noPhoto} sin foto` : " · todos con foto"),
        categorySummaryLine: (count, noun, out, noPhoto) =>
          [`${count} ${noun}`, out ? `${out} agotado${out === 1 ? "" : "s"}` : null, noPhoto ? `${noPhoto} sin foto` : null]
            .filter(Boolean)
            .join(" · "),
        collapseCategory: "Colapsar",
        expandCategory: "Expandir",
        whoSellsIt: "¿Quién lo vende?",
        noPhotoShort: "Falta\nfoto",
        formError: "Revisa el nombre y el precio",
        categoryFormError: "Escribe el nombre en español y en inglés",
        productFormError: "Escribe el nombre en español e inglés, y un precio mayor a 0",
        categoryRequiredError: "Elige una categoría",
        editModalHint: "Los cambios se ven en el menú de tus clientes de inmediato.",
        addModalHint: "Aparece en el menú de tus clientes en cuanto lo guardes.",
        photoLabel: "Foto del platillo",
        photoHint: "Tómale la foto al platillo tal como sale de tu cocina. Nunca ponemos la foto de otro plato.",
        descriptionEsPlaceholder: "Descripción en español",
        descriptionEnPlaceholder: "Descripción en inglés",
        whichCategoryLabel: "¿En qué parte del menú?",
        exclusivityAll: "Todos",
        exclusivityAllHint: "Aparece en el menú de todos tus trucks",
        exclusivityOnly: (truckName: string) => `Solo ${truckName}`,
        exclusivityOnlyHint: "Aparece solo en el menú de este truck, en ningún otro",
        noPhotoYetHint: "Si todavía no tienes la foto, guárdalo sin ella: en el menú se muestra un espacio marcado y la agregas cuando puedas. Nunca ponemos la imagen de otro plato.",
        addProductSubmit: "Agregar al menú",
        addCategoryHint: "Los platillos que agregues después podrán ir aquí.",
        noTrucksExclusiveYet: "Este truck no tiene platillos propios todavía.",
      },
      trucksPage: {
        title: "Tus trucks",
        subtitle: "Aquí pausas el servicio cuando se acaba el gas o cambias de turno, ajustas horarios, y decides a partir de cuántos minutos una orden se marca como atrasada en la pantalla de cocina.",
        newTruckNote: "Alta de un truck nuevo: en esta fase la hacemos nosotros a mano, para confirmar ubicación y horarios contigo.",
        contactUs: "Escríbenos",
        showArchived: "Ver",
        hideArchived: "Ocultar",
        minSuffix: "minutos",
        reopenNow: "Reabrir ahora",
        pause: "Pausar servicio",
        pausedBadge: "En pausa",
        openBadge: "Abierto",
        closedByHoursBadge: "Cerrado",
        opensAtBadge: (time) => `Abre ${time}`,
        reopens: (when) => `Reabre ${when}`,
        untilManualReopen: "Hasta que reabras a mano",
        archiveTruck: "Dar de baja",
        archivedOn: (date) => `Archivado ${date}`,
        reactivate: "Reactivar",
        locationPlaceholder: "¿Dónde se para normalmente? (opcional)",
        taxTitle: "Cómo manejas el impuesto",
        taxHint: "Afecta el menú, el ticket y tus reportes.",
        taxAdd: "Se agrega al total",
        taxAddHint: "El menú muestra el precio y al final se suma el impuesto.",
        taxIncluded: "Ya viene incluido",
        taxIncludedHint: "Lo que ve en el menú es lo que paga. Sin sorpresas al final.",
        sharedSettingsTitle: (n) => `Ajustes para los ${n}`,
        sharedSettingsHint: "Valen para todo el negocio. Cualquier truck puede llevar los suyos si lo necesita.",
        alertThresholdsLabel: "Cuándo avisar que una orden se está tardando",
        amberLabel: "Ámbar",
        redLabel: "Rojo",
        alertTipWithData: (avg, amber, red) =>
          `Tu promedio real de los últimos 30 días es de ${avg} minutos por orden. Con estos números, una orden se pone ámbar a los ${amber} y roja a los ${red}. Si los pones muy bajos, todo se ve rojo y el aviso deja de servir.`,
        alertTipNoData: (amber, red) =>
          `Todavía no hay suficientes pedidos completados para calcular tu promedio real. Con estos números, una orden se pone ámbar a los ${amber} y roja a los ${red}.`,
        horarioLabel: "Horario",
        kitchenAlertsLabel: "Avisos de cocina",
        ownAlertsTag: "propios",
        businessAlertsTag: "los del negocio",
        closedAllWeek: "Cerrado toda la semana",
        editNamePhoto: "Nombre y foto",
        changeHours: "Cambiar horario",
        setOwnAlerts: "Poner avisos propios",
        removeOwnAlerts: "Quitar avisos propios",
        viewQr: "Ver su QR",
        editTruckHint: "Esto es lo que ve tu cliente al escanear el código de este truck.",
        photoLabelTruck: "Foto del truck",
        choosePhoto: "Elegir foto",
        changePhoto: "Cambiar foto",
        removePhoto: "Quitar",
        photoHintTruck: "Una foto del truck como se ve por fuera. Sirve para que el cliente confirme que está en el correcto.",
        nameQuestion: "¿Cómo le dices a este truck?",
        locationQuestion: "Ubicación",
        nameRequired: "El truck necesita un nombre",
        hoursModalTitle: (name) => `Horario de ${name}`,
        hoursModalHint: "Fuera de este horario tu menú avisa que están cerrados. Si un día no abres, apágalo.",
        applyToAllDays: "Poner este horario todos los días",
        applyToAllNeedsOne: "Enciende al menos un día primero",
        wouldBeLabel: "Quedaría:",
        saveSchedule: "Guardar horario",
        invalidHoursRange: "Revisa: hay días donde la hora de cierre no va después de la de apertura",
        closedDay: "Cerrado",
        ownAlertsModalTitle: (name) => `Avisos propios de ${name}`,
        ownAlertsModalHint: (amber, red) =>
          `Úsalo si este truck vende algo que tarda distinto, o si tiene mucha más fila que los otros. Ahora mismo usa los del negocio: ${amber} y ${red} minutos.`,
        onlyForLabel: (name) => `Solo para ${name}`,
        saveOwnAlerts: "Guardar",
        archiveModalTitle: (name) => `¿Dar de baja ${name}?`,
        archiveModalBody: "Deja de recibir pedidos y su código QR deja de servir. Su información no se borra: sus ventas siguen apareciendo en tus comparaciones, incluso las del año pasado. Lo guardamos dos años por si lo quieres reactivar — y reactivarlo toma minutos, no un alta nueva.",
        archiveModalBilling: "Dejas de pagarlo desde el siguiente periodo. Este mes ya está cubierto.",
        confirmArchiveText: "Se archiva, no se borra. ¿Seguro?",
        yesArchive: "Sí, dar de baja",
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
        requestTruckButton: "Pedir un truck nuevo",
        requestPending: (date) => `Ya pediste un truck nuevo el ${date} — en revisión.`,
        requestTruckTitle: "Pedir un truck nuevo",
        requestTruckBody: "Te contactamos para confirmar dónde va a estar y sus horarios. Lo dejamos listo con tu menú, tu marca y su QR para imprimir.",
        requestTruckPriceLabel: "Con este truck, tu plan sería",
        requestTruckPricePreview: (trucks, price) => `${trucks} trucks · $${price} por truck`,
        requestTruckTotalPreview: (total) => `$${total} al mes en total`,
        requestTruckBillingNote: "Al aprobarlo, tu truck queda activo de inmediato y se cobra el mes completo ese mismo momento — sin importar el día en que lo pidas, nunca prorrateado.",
        requestTruckNoteLabel: "¿Algo que debamos saber? (opcional)",
        requestTruckNotePlaceholder: "Ubicación, horario, lo que sea útil",
        requestTruckCancel: "Cancelar",
        requestTruckSubmit: "Enviar solicitud",
      },
      marcaPage: {
        title: "Tu marca",
        subtitle: "Lo que ve tu cliente cuando escanea el código — cuatro decisiones, ninguna más.",
        step1: "1 · TU LOGO",
        uploadLogoTitle: "Sube tu logo",
        uploadLogoHint: "PNG o JPG. Va montado directo sobre el encabezado — con fondo transparente se ve mejor.",
        step2: "2 · TU COLOR",
        chooseColorTitle: "Elige tu color",
        chooseColorHint: "Diez colores probados bajo el sol. Cualquiera funciona — no hay forma de elegir mal.",
        contrastConfirm: (colorName, ratio) => `${colorName} · el texto se ajusta solo y queda en ${ratio}:1 de contraste. Se lee bajo el sol.`,
        step3: "3 · TU ESTILO",
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
        addPreviewLabel: "Agregar",
        previewNoProducts: "Tus platillos aparecerán aquí en cuanto los agregues en Menú.",
        motifStep: "DETALLE",
        motifTitle: "El dibujo de fondo",
        motifHint: "Unas líneas discretas en el encabezado, según lo que vendes.",
        headerStyleStep: "DETALLE",
        headerStyleTitle: "El encabezado",
        headerStyleHint: "Cómo se muestra tu logo arriba del menú.",
        headerStyleColor: "Color de marca",
        headerStyleColorHint: "Tu logo va sobre una placa, con el color que elegiste.",
        headerStyleBlack: "Negro, logo montado",
        headerStyleBlackHint: "Encabezado negro, tu logo va directo encima — ideal si tu logo ya tiene fondo oscuro o es transparente.",
        truckOverrideSummary: "¿Un truck con otra marca?",
        truckOverrideBody: "Normalmente los trucks comparten logo y color, y cada uno lleva su propio nombre y foto. Si alguno opera con otra marca, aquí puedes darle color propio — es una excepción, no algo que tengas que decidir.",
        truckOverrideOwn: "Color propio",
        truckOverrideRemove: "Quitar",
        truckOverrideInherits: "Usa el del negocio",
      },
      personalPage: {
        title: "Tu personal",
        subtitle: "Tu personal no necesita correo ni contraseña. La tablet del truck se conecta una vez y se queda conectada; cada persona entra con su PIN de cuatro dígitos.",
        selfServiceTitle: "Esto lo manejas tú, cuando quieras",
        selfServiceBody: "Entra alguien nuevo, le creas un PIN. Se va, lo borras y deja de funcionar en ese momento. Se pierde una tablet, revocas su acceso desde aquí. No tienes que avisarnos ni esperar a nadie.",
        staffTitle: "Personas",
        addPerson: "Agregar persona",
        staffHint: "Cada quien con su PIN, para saber quién atendió cada orden.",
        whoLabel: "¿Cómo se llama?",
        namePlaceholder: "Nombre y apellido",
        nameMissingError: "Falta el nombre",
        deviceNameMissingError: "Ponle un nombre al dispositivo y elige un truck",
        addStaffHint: "Le vamos a crear un PIN de cuatro dígitos. Solo eso necesita para entrar.",
        whatWillDoLabel: "¿Qué va a hacer?",
        roleCocina: "Cocina",
        roleCocinaHint: "Ve las órdenes y las va marcando",
        roleCajero: "Cajero",
        roleCajeroHint: "Además captura pedidos y cobra",
        roleEncargado: "Encargado",
        roleEncargadoHint: "También ve las ventas de su truck",
        whichTruckLabel: "¿En qué truck?",
        allTrucks: "Todos los trucks",
        encargadoAllTrucksHint: "El encargado ve y puede operar todos los trucks del negocio — no se elige uno solo.",
        deviceUnitHint: "Es el truck donde empieza este dispositivo al emparejarse. Si quien entra con su PIN es un encargado, de todos modos va a poder ver y operar los demás trucks.",
        truckArchivedSuffix: " (dado de baja)",
        createPin: "Crear su PIN",
        pinRevealTitle: "Listo, ya puede entrar",
        pinRevealHint: (name) => `Este es el PIN de ${name}. Anótalo o mándaselo — no lo podemos volver a mostrar después, así que captúralo ahora.`,
        pinRevealLabel: (name, truck) => `PIN de ${name} · ${truck}`,
        understood: "Entendido",
        noStaffYet: "Todavía no has dado de alta a nadie. Agrega a la primera persona.",
        showRemoved: (n) => `Ver personal dado de baja (${n})`,
        hideRemoved: (n) => `Ocultar personal dado de baja (${n})`,
        confirmRemoveAccess: "Su PIN deja de servir de inmediato. ¿Quitar?",
        resetPin: "Restablecer PIN",
        resettingPin: "Restableciendo…",
        confirmResetPin: "Su PIN actual deja de servir. ¿Restablecer?",
        yesReset: "Sí, restablecer",
        pinResetTitle: "Listo, tiene un PIN nuevo",
        pinResetHint: (name) => `Este es el nuevo PIN de ${name}. El anterior ya no funciona. Anótalo o mándaselo — no lo podemos volver a mostrar después.`,
        pinMaskedLabel: "••••",
        usedToday: "usó su PIN hoy",
        usedYesterday: "usó su PIN ayer",
        usedDaysAgo: (n) => `usó su PIN hace ${n} días`,
        neverUsedPin: "todavía no ha entrado",
        stillHereBadge: "¿sigue aquí?",
        devicesTitle: "Tablets y celulares conectados",
        devicesHint: "Los aparatos que ya están dentro del sistema. Se conectan una sola vez.",
        pairTablet: "Conectar un aparato",
        deviceNamePlaceholder: "Nombre del aparato (ej. Tablet de cocina)",
        whichTruckDeviceLabel: "¿De qué truck es?",
        generateCode: "Generar código",
        connectDeviceTitle: "Conectar un aparato",
        connectDeviceHint: "En la tablet o el celular, abre la página del sistema y escribe este código. Con eso queda conectado y ya no lo vuelve a pedir.",
        pairingCodeLabel: "Código para conectar",
        codeExpiresIn: (mmss) => `Sirve por ${mmss} más`,
        codeExpired: "Se venció. Genera otro.",
        close: "Cerrar",
        connectedSince: (date) => `Conectado desde el ${date}`,
        lastSeenToday: "última vez hoy",
        lastSeenYesterday: "última vez ayer",
        lastSeenDaysAgo: (n) => `última vez hace ${n} días`,
        neverConnected: "Nunca se ha conectado",
        printingOn: "Imprime comandas",
        printingOff: "Sin impresión",
        printerUnnamed: "Impresora sin nombre",
        printerNeverPrinted: "todavía no imprime",
        printerLastOk: (fecha: string) => `última impresión el ${fecha}`,
        ticketCopies: (n) => (n === 1 ? "1 copia" : `${n} copias`),
        noDevicesYet: "Todavía no hay dispositivos.",
        showRevoked: (n) => `Ver desconectados (${n})`,
        hideRevoked: (n) => `Ocultar desconectados (${n})`,
        pairedBadge: "Activo",
        waitingCodeBadge: "Esperando código",
        confirmRevoke: "Deja de entrar al sistema ahora mismo. ¿Desconectar?",
        yesRevoke: "Sí, desconectar",
        revoke: "Desconectar",
      },
      qrPage: {
        title: "Tus códigos QR",
        subtitle: "Uno por truck. Imprímelo y pégalo donde el comensal lo vea al hacer fila.",
        noActiveTrucks: "Todavía no hay ningún truck activo.",
        download: "Descargar para imprimir",
        openMenu: "Abrir el menú",
        realTitle: "Estos códigos son de verdad",
        realBody: "Escanéalos ahorita con la cámara de tu celular para comprobarlo — te van a mandar a la dirección que aparece debajo de cada uno.",
        viewKitchenTitle: "¿Cómo va la cocina ahora mismo?",
        viewKitchenBody: "Mira en vivo cuántas órdenes tiene cada truck, sin tener que pedirle el celular a nadie.",
        viewKitchenCta: "Ver cocina en vivo",
        howToTitle: "Qué hacer con ellos",
        how1: "Imprímelos en grande, mínimo del tamaño de una hoja carta. Un QR chiquito no se escanea desde la fila.",
        how2: "Pégalos donde se vean mientras esperan: la ventanilla, un costado del truck, las mesas si tienes.",
        how3: "Plastifícalos o mételos en un micaje. Van a aguantar sol, grasa y lluvia.",
        how4: "No los tapes con nada ni les pegues cosas encima. Si se raya o se despinta, imprime otro — es el mismo código.",
        printAll: "Imprimir los carteles",
        posterMsg: "Escanea y pide desde tu celular",
        posterMsg2: "Scan to order from your phone",
        posterStepsTitle: "Cómo funciona",
        posterStep1: "Escanea este código",
        posterStep2: "Elige tus platillos",
        posterStep3: "Recibe tu número de orden",
        posterStep4: "Te avisamos cuando esté listo",
        posterPayNote: "Paga en la ventanilla — antes o al recogerlo.",
      },
      cuentaPage: {
        title: "Tu cuenta",
        subtitle: "Aquí ves tu plan, cuántos trucks tienes activos, y desde dónde iniciaste sesión.",
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
        howYouPayTitle: "Cómo pagas hoy",
        howYouPayHint: "Fase piloto",
        howYouPayManual: "Te mandamos el recibo por correo y lo pagas por transferencia. El cobro automático con tarjeta llega en una fase futura; cuando esté, lo activas desde aquí y dejas de recibir el correo.",
        howYouPayStripe: "Se cobra automático a tu tarjeta guardada cada mes — no tienes que hacer nada.",
        yourDataTitle: "Tus datos",
        yourDataHint: "Lo que sale en el recibo",
        businessLabel: "Negocio",
        emailLabel: "Correo",
        signInLabel: "Entras con",
        signInGoogle: "Cuenta de Google",
        signInPassword: "Correo y contraseña",
        leaveTitle: "¿Te quieres ir?",
        cancelConsequencesTitle: "¿Cancelar tu suscripción?",
        cancelConsequencesIntro: "Antes de que decidas, esto es lo que va a pasar:",
        cancelConsequence1: (n) => `Tus ${n} truck${n === 1 ? "" : "s"} siguen funcionando hasta que termine el periodo que ya pagaste.`,
        cancelConsequence2: "Después, tus códigos QR dejan de abrir el menú.",
        cancelConsequence3: "Tu información no se borra. Ventas, menú y marca se guardan dos años. Si regresas, reactivar toma minutos.",
        cancelConsequence4: "No te cobramos nada más. No hay penalización.",
        cancelKeepGoing: "Mejor no",
        cancelContinue: "Sí, quiero cancelar",
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
        yearDelta: "Diferencia",
        noData: "sin datos",
        monthlySales: "Venta mes a mes",
        vsLabel: (a, b) => `${a} contra ${b}`,
        eachTruckIn: (month) => `Cada truck en ${month}`,
        whereFrom: "De dónde llegan",
        topSelling: "Lo que más se vende",
        piecesThisMonth: "piezas este mes",
        salesActivity: "Actividad de venta",
        salesActivityHint: "A qué hora entra el primer y el último pedido de cada truck, en promedio, y cómo se compara con el horario que publicaste — últimos 30 días.",
        salesActivityDisclaimer: "Esto mide a qué hora entran los pedidos, comparado con tu horario publicado en Trucks. No registra entradas ni salidas de personal, y no sirve para calcular pagos.",
      ledgerTitle: "Tus pedidos",
      ledgerSubtitle: "Últimos 30 días. Filtra y descarga para comparar contra tu caja o tu banco.",
      ledgerFilterTruck: "Truck",
      ledgerFilterAllTrucks: "Todos",
      ledgerFilterFrom: "Desde",
      ledgerFilterTo: "Hasta",
      ledgerFilterPaymentMethod: "Medio de pago",
      ledgerFilterAllMethods: "Todos",
      ledgerFilterPaymentStatus: "Estado de pago",
      ledgerFilterAllStatuses: "Todos",
      ledgerFilterChannel: "Canal",
      ledgerFilterAllChannels: "Todos",
      ledgerSearchPlaceholder: "Orden o nombre del cliente",
      ledgerExport: "Descargar CSV",
      ledgerEmpty: "No hay pedidos con estos filtros.",
      ledgerColFolio: "Orden",
      ledgerColDate: "Fecha",
      ledgerColTruck: "Truck",
      ledgerColChannel: "Canal",
      ledgerColStatus: "Estado",
      ledgerColPayment: "Pago",
      ledgerColTotal: "Total",
      ledgerShowingCount: (n) => `${n} pedido${n === 1 ? "" : "s"}`,
      ledgerStatusPaid: "Pagada",
      ledgerStatusUnpaid: "Sin cobrar",
      ledgerChannelQr: "QR",
      ledgerChannelVentanilla: "Ventanilla",
        lateOpenInsightTitle: (unitName, minutes) => `${unitName} empieza a vender ${minutes} minutos tarde`,
        lateOpenInsightBody: (amount) => `Al ritmo de venta de esa unidad, esa franja ronda los ${amount} al mes — es una estimación a partir de su venta por hora, no un dato exacto.`,
        highlightsTitle: "Puntos clave",
        highlightsHint: "De los últimos 30 días, para ayudarte a decidir.",
        noHighlightsYet: "Todavía no hay suficientes pedidos para mostrar puntos clave.",
        peakHourHighlight: (range, count) => `Tu hora con más ventas es de ${range}, con ${count} pedido${count === 1 ? "" : "s"} en los últimos 30 días.`,
        bestDayHighlight: (dayName, amount) => `${dayName} es tu día más fuerte: ${amount} en venta promedio.`,
        avgPrepHighlight: (minutes) => `En promedio, un pedido tarda ${minutes} min en estar listo desde que se recibe.`,
        topProductHighlight: (name, qty) => `Tu platillo más vendido este mes es ${name}, con ${qty} vendidos.`,
        noSalesToGraph: "Todavía no hay ventas registradas para graficar.",
        noActiveTrucks: "Todavía no hay trucks activos.",
        noSalesThisMonth: "Todavía no hay ventas este mes.",
        noOrdersThisMonth: "Todavía no hay pedidos este mes.",
        noPreviousMonth: "sin mes anterior",
        byQrLabel: "por QR",
        qrChannel: "Código QR",
        ventanillaChannel: "Ventanilla",
        daysWithSales: (n) => `${n} día${n === 1 ? "" : "s"} con ventas, últimos 30 días`,
        opensLate: (dur) => `primera venta ${dur} después de la apertura`,
        opensOnTime: "primera venta a tiempo",
        noPublishedHours: "sin horario publicado",
        firstOrder: "primer pedido:",
        lastOrder: "último pedido:",
        closesEarly: (dur) => `última venta ${dur} antes del cierre`,
        noOrdersLast30: (name) => `${name} — sin órdenes en los últimos 30 días.`,
        pendingCollectionTitle: "Pendiente de cobro",
        pendingInProgressLabel: "En curso, sin cobrar",
        pendingInProgressHint: "Todavía en cocina — puede cobrarse al entregar.",
        pendingDeliveredLabel: "Entregados sin cobrar",
        pendingDeliveredHint: "Ya salieron de cocina y nadie cobró. Revísalos con tu personal.",
        noShowLabel: "No recogidas",
        noShowHint: "El cliente ordenó y nunca llegó por su pedido. Nunca fue una venta — queda aquí solo como historia.",
        noneLabel: "ninguna",
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
      reactivateAsk: "¿Cómo vuelve?",
      reactivateAsTrial: "Prueba (14 días)",
      reactivateAsPaid: "De pago",
      cancel: "Cancelar",
      suspend: "Suspender",
      recoveryButton: "Mandar enlace de contraseña",
      recoveryHint: "Le manda al dueño el mismo correo de \"olvidé mi contraseña\". Él elige la contraseña; nosotros nunca la vemos.",
      recoveryConfirm: "¿Mandar el enlace al dueño?",
      recoverySend: "Mandar",
      recoverySent: (email) => `Enlace mandado a ${email}`,
      statusTrial: "Periodo de prueba",
      statusActive: "Activa",
      statusSuspended: "Suspendida",
      statusCancelled: "Cancelada",
      trialNoLimit: "Sin vencimiento",
      trialSave: "Guardar",
      trialSetDays: (n) => `${n} días`,
      trialExpired: "Prueba vencida",
      trialDaysLeft: (n) => (n === 1 ? "Queda 1 día" : `Quedan ${n} días`),
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
      pendingRequestsHeader: "Solicitudes pendientes",
      noPendingRequests: "Nada pendiente.",
      requestApprove: "Aprobar y dar de alta",
      requestReject: "Descartar",
      requestedOn: (date) => `Pedido el ${date}`,
      currentTrucksLabel: (n) => `${n} truck${n === 1 ? "" : "s"} activos`,
      actionTruckRequestApproved: "Aprobó truck nuevo",
      actionTruckRequestRejected: "Rechazó truck nuevo",
      actionAdminViewedBusiness: "Vio el panel",
      actionArchiveWarningSent: "Avisó por archivo próximo a vencer",
      archivedExpiryHeader: "Archivo por vencer",
      archivedExpiryHint: "Se conservan 2 años; contacta al cliente antes de que se cumpla el plazo. Nada se borra automáticamente.",
      archivedOn: (date) => `Archivado el ${date}`,
      retentionOverdue: "Ya cumplió los 2 años",
      retentionMonthsLeft: (n) => `${n} mes${n === 1 ? "" : "es"} antes del corte`,
      archiveContactedBadge: "Cliente contactado",
      archiveMarkContacted: "Marcar contactado",
      businessSignupsHeader: "Nuevos negocios",
      noBusinessSignups: "Nada pendiente.",
      businessSignupApprove: "Aprobar y activar",
      businessSignupApproving: "Activando…",
      businessSignupConfirm: "Confirmar alta",
      firstUnitNameLabel: "Nombre del primer truck",
      firstUnitLocationLabel: "Ubicación",
      actionBusinessSignupApproved: "Activó negocio nuevo",
      actionBusinessSignupRejected: "Rechazó solicitud de negocio",
      actionProductRetired: "Quitó un platillo del menú",
      actionProductCreated: "Agregó un platillo",
      actionStaffCreated: "Agregó personal",
      actionStaffPinReset: "Restableció un PIN",
      actionStaffRemoved: "Quitó personal",
      actionDeviceCreated: "Emparejó un dispositivo",
      actionDeviceRevoked: "Revocó un dispositivo",
      billingNoteTitle: "Cobro automático:",
      billingNoteBody:
        "en Fase 1 la suscripción se cobra fuera del sistema y aquí solo se registra el estado. Cada cliente ya lleva marcado si cobra por transferencia manual o si tiene Stripe conectado, para no tener que rehacer la tabla cuando se active — la conexión en sí entra en Fase 2. Hasta entonces, suspender por falta de pago es una acción manual.",
      billingRuleTitle: "Regla de facturación:",
      billingRuleBody:
        "los cambios de trucks aplican al siguiente periodo, nunca a mitad de mes. Aprobar una solicitud aquí agenda el cambio; no toca el cobro del mes en curso. Dar de baja un truck archiva su información dos años; no la borra.",
    },
    auth: {
      signatureEyebrow: "Cocina en vivo",
      signatureHeadline: "De la orden a la ventanilla, sin perder ni una.",
      signatureBody: "Cada pedido que llega por QR o en ventanilla aparece al instante en la pantalla de cocina — así lo ve tu equipo ahora mismo.",
      ticketNew: "Nueva",
      ticketPrep: "Preparando",
      ticketReady: "Lista",
      loginTitle: "Entra a tu panel",
      loginSubtitle: "Para dueños y equipo de FoodTruckOS.",
      googleButton: "Continuar con Google",
      dividerLabel: "o con tu correo",
      orGoogleLabel: "o continúa con Google",
      emailLabel: "Correo",
      emailPlaceholder: "tu@negocio.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Tu contraseña",
      signInButton: "Entrar",
      signingIn: "Entrando…",
      invalidCredentials: "Ese correo y contraseña no coinciden con ninguna cuenta.",
      tryMagicLinkHint: "¿Entraste antes con un enlace por correo? Pide uno nuevo abajo — no hace falta contraseña.",
      magicLinkButton: "Enviarme un enlace de acceso",
      sendingMagicLink: "Enviando…",
      magicLinkSentTitle: "Revisa tu correo",
      magicLinkSentBody: (email) => `Te mandamos un enlace de acceso a ${email}. Ábrelo desde este mismo dispositivo para entrar.`,
      magicLinkError: "No pudimos enviar el enlace. Intenta de nuevo en un momento.",
      forgotPassword: "Olvidé mi contraseña",
      recoverTitle: "Recuperar contraseña",
      recoverSubtitle: "Te mandamos un enlace para elegir una nueva.",
      recoverEmail: "Tu correo",
      recoverSend: "Mandar enlace",
      recoverSending: "Enviando…",
      recoverSentTitle: "Enlace enviado",
      recoverSentBody: (email) => `Si ${email} tiene una cuenta, ahí está el enlace para elegir una contraseña nueva.`,
      recoverSentNote: "Revisa también el correo no deseado. El enlace sirve una sola vez y vence en una hora — si lo abres dos veces, la segunda dirá que ya no vale.",
      recoverTooSoon: (segundos) => `Ya mandamos uno hace un momento. Espera ${segundos} s antes de pedir otro.`,
      recoverFailed: "No pudimos mandar el enlace. Revisa el correo e inténtalo otra vez.",
      recoverResend: "Mandar otro enlace",
      recoverResendIn: (segundos) => `Puedes pedir otro en ${segundos} s`,
      recoverBackToLogin: "Volver a entrar",
      linkFailed: "No pudimos validar ese enlace: puede que ya se haya usado o que haya vencido. Pide uno nuevo.",
      newPasswordTitle: "Nueva contraseña",
      newPasswordSubtitle: "Elige una de al menos 8 caracteres.",
      newPasswordField: "Nueva contraseña",
      newPasswordSave: "Guardar contraseña",
      newPasswordSaving: "Guardando…",
      newPasswordDone: "Listo, entrando a tu panel…",
      newPasswordFailed: "No pudimos actualizar tu contraseña. Pide un enlace nuevo.",
      newPasswordNoSession: "Este enlace ya no vale. Pide uno nuevo desde \"Olvidé mi contraseña\".",
      noAccountYet: "¿Tu negocio todavía no está en FoodTruckOS?",
      registerLink: "Solicita tu acceso",
      registerTitle: "Solicita tu acceso",
      registerSubtitle: "Cuéntanos de tu negocio y te contactamos para activar tu panel — no se necesita tarjeta ni contraseña ahora mismo.",
      freeTrialNote: "Empiezas con una prueba gratuita; el cobro arranca hasta que decidas seguir.",
      businessNameLabel: "Nombre del negocio",
      businessNamePlaceholder: "Ej: Taquería El Buen Sazón",
      cityLabel: "Ciudad",
      cityPlaceholder: "Ej: El Reno, OK",
      phoneLabel: "Teléfono (opcional)",
      phonePlaceholder: "Para contactarte más rápido",
      registerEmailHint: "Te mandamos un enlace a este correo para confirmar la solicitud — sin contraseña que recordar.",
      requestButton: "Enviar solicitud",
      sendingRequest: "Enviando…",
      requestError: "No pudimos enviar tu solicitud. Intenta de nuevo en un momento.",
      requestSentTitle: "Ya casi — revisa tu correo",
      requestSentBody: (email) => `Te mandamos un enlace de confirmación a ${email}. Ábrelo para dejar registrada tu solicitud, y nuestro equipo te contacta pronto para activar tu panel.`,
      alreadyHaveAccount: "¿Ya tienes cuenta?",
      backToLogin: "Entrar",
    },
    landing: {
      navProduct: "Producto",
      navBenefits: "Beneficios",
      navPricing: "Precios",
      navLogin: "Iniciar sesión",
      ctaTrial: "Prueba gratis",
      heroEyebrow: "Cocina en vivo, pedido por QR, cero comisión",
      heroTitleLine1: "Tu food truck,",
      heroTitleAccent: "iluminado de verdad",
      heroSub: "El comensal escanea, ordena desde su celular con tu marca — no la nuestra — y el pedido aparece al instante en tu cocina. Sin apps, sin comisión por pedido, sin curva de aprendizaje.",
      heroCtaPrimary: "Empieza tu prueba gratis",
      heroCtaSecondary: "Ver cómo funciona",
      heroMeta: "Sin tarjeta para empezar · Cancela cuando quieras",
      showcaseEyebrow: "Así se ve tu cocina",
      showcaseTitle: "Cada orden, en tiempo real",
      showcaseSub: "Mueve el mouse sobre el panel — así reacciona tu pantalla de cocina en cada turno.",
      boardTitle: "Cocina — en vivo",
      boardLive: "EN VIVO",
      order1Name: "2× Torta de asada",
      order1Items: "sin cebolla · extra queso",
      order1Badge: "NUEVO",
      order2Name: "Orden de tacos (4)",
      order2Items: "para llevar",
      order2Badge: "4 MIN",
      order3Name: "Quesabirria + agua",
      order3Items: "consomé extra",
      order3Badge: "LISTA",
      stat1Label: "Pedidos hoy",
      stat2Label: "Prom. entrega",
      stat3Label: "Venta hoy",
      showcaseHint: "Avanzar una orden toma un solo toque — hecho para manos ocupadas en hora pico.",
      navEnter: "Entrar",
      printEyebrow: "Comanda impresa",
      printTitle: "El riel de tickets es la cola de tu cocina",
      printSub: "No es un extra: es como trabaja el gremio. Conecta una impresora Bluetooth a la tablet y cada pedido — por QR o de ventanilla — sale en papel al instante.",
      printWhy1Title: "Dos cocineros, dos tickets",
      printWhy1Body: "Cada quien toma el suyo del riel y avanzan en paralelo. Una pantalla con tres columnas no replica eso.",
      printWhy2Title: "Manos ocupadas, papel limpio",
      printWhy2Body: "Se lee sin tocar nada. Nadie despega la mano de la plancha para deslizar una pantalla grasosa.",
      printWhy3Title: "Sin señal, igual imprime",
      printWhy3Body: "La impresora cuelga de la tablet por Bluetooth, no de internet. El pedido de ventanilla sale aunque el truck se quede sin datos.",
      printPickTitle: "Tú eliges cómo montarlo",
      printOptionATitle: "Dos tablets",
      printOptionABody: "Una en cocina y otra en la ventanilla. Es como funciona hoy y no necesitas comprar nada más.",
      printOptionBTitle: "Tablet + impresora",
      printOptionBBody: "Una sola tablet y la comanda en papel. La impresora es opcional: la agregas cuando quieras.",
      printHardwareNote: "Nosotros ponemos la aplicación y te acompañamos en la instalación. La tablet y la impresora las compras tú, de una lista corta de equipos que probamos nosotros — así no dependes de nuestro inventario ni de nuestros envíos.",
      ticketTruck: "TRUCK CENTRO",
      ticketOrder: "ORDEN",
      ticketItem1: "TORTA DE ASADA",
      ticketItem1Remove: "CEBOLLA",
      ticketItem1Add: "Queso extra",
      ticketItem2: "QUESABIRRIA",
      ticketItem2Note: "bien dorada",
      ticketCustomer: "Marisol",
      ticketCollect: "COBRAR AL ENTREGAR",
      ticketCaption: "La comanda que sale de verdad — lo que se quita va en mayúsculas, porque es el error caro en cocina.",
      benefitsEyebrow: "Por qué FoodTruckOS",
      benefitsTitle: "Todo lo que tu negocio necesita, en un solo lugar",
      benefitsSub: "Cada función existe porque un dueño de food truck la necesitó primero.",
      benefit1Title: "Tu negocio, en vivo",
      benefit1Body: "Abre el panel y mira, al instante, cuánto vendes, qué se agota y cómo va cada truck — sin esperar al cierre del día.",
      benefit2Title: "Tus clientes ordenan en segundos",
      benefit2Body: "Escanean un código y piden desde su propio celular. Sin apps que instalar, sin filas, sin clientes que se cansan de esperar.",
      benefit3Title: "Cero comisión, cero letra chica",
      benefit3Body: "Nunca cobramos por pedido ni te atamos a un contrato. Pagas tu mensualidad y el 100% de cada venta es tuyo.",
      benefit4Title: "Tu negocio en la palma de tu mano",
      benefit4Body: "Precios, pausas, personal y reportes — todo desde el celular, estés en el truck, en casa o en la fila del súper.",
      benefit5Title: "Tu menú, siempre al día",
      benefit5Body: "Cambia un precio o marca un platillo agotado en segundos, y se refleja al instante en el celular de tus clientes.",
      benefit6Title: "Imprime tus QR las veces que quieras",
      benefit6Body: "Descarga el código de cada truck y ponlo en tu ventanilla, tu mesa o tu volante — sin límite y sin costo extra.",
      benefit7Title: "Tu marca, no la nuestra",
      benefit7Body: "Logo, color y estilo del negocio en cada pantalla que ve tu cliente. FoodTruckOS trabaja detrás, invisible.",
      benefit8Title: "Insights que trabajan por ti",
      benefit8Body: "El panel te avisa solo qué platillo se vende más, cuándo tienes más movimiento y qué truck va mejor — sin armar una sola gráfica.",
      pricingEyebrow: "Precio simple",
      pricingTitle: "Mientras más trucks, más barato por unidad",
      pricingSub: "Sin comisión por pedido. Sin permanencia mínima. Cancela cuando quieras.",
      price1Tag: "1 truck",
      price2Tag: "2 trucks",
      price3Tag: "3 o más",
      priceNote: "por truck",
      pricePer: "/mes",
      ctaTitle: "Tu food truck, en línea en minutos",
      ctaSub: "Crea tu cuenta gratis y tu truck queda listo para recibir pedidos hoy mismo. Sin tarjeta, sin instalación, sin compromiso.",
      footerCredit: "Desarrollado por Vibrancy GG. Todos los derechos reservados.",
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
      orderError: {
        emptyCart: "Your cart is empty",
        verifyFailed: "We couldn't verify the truck's status. Try again.",
        unavailable: "This truck isn't available right now",
        paused: "This truck is paused right now",
        closed: "This truck is closed right now — come back during its hours",
        sendFailed: "We couldn't send your order. Check your connection and try again",
        badCart: "Something in your cart is out of date. We emptied it — please add your food again.",
      },
      updatedReloading: "We just updated the menu — reloading your screen. Your order is still in your cart, just tap send again.",
      retry: "Retry",
      emptyCart: "Empty the cart and start over",
      cancel: "Cancel",
      customerNameLabel: "Your name (optional)",
      quantity: "Quantity",
      notes: "Notes for the kitchen",
      notesPlaceholder: "e.g. no spice, to go",
      photoComing: "Photo coming",
      buildFrom: "From",
      buildCta: "Start",
      closedTitle: "Closed right now",
      closedBody: (unitName) => `${unitName} isn't taking orders at the moment.`,
      reopensAt: (time) => `Reopens ${time}.`,
      tryLaterHint: "Please try again later.",
      notAvailableTitle: "Menu unavailable",
      notAvailableBody: "This menu isn't available right now.",
      openNowLabel: "Open",
      closedNowLabel: "Closed",
      todayHoursLabel: (day, range) => `Today ${day} ${range}`,
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
        recibido: "The kitchen has your order",
        preparando: "They are cooking it",
        listo: "Ready! Come get it",
        entregado: "Thank you!",
        cancelado: "Order cancelled",
      },
      subs: {
        recibido: "They will start on it in a moment.",
        preparando: "We will tell you here as soon as it is done.",
        listo: "Head to the window and say your number.",
        entregado: "Thanks for stopping by. We hope to see you again soon.",
        cancelado: "This order was cancelled. If you are not sure why, ask at the window.",
      },
      etaWindow: (desde, hasta) => `Ready around ${desde}–${hasta}`,
      etaLate: "It is taking a little longer than usual. It goes out as soon as the kitchen frees it up.",
      readyAgo: (mins) => `Ready ${mins} min ago`,
      readyNow: "Just now",
      notFound: "We could not find that order",
      notFoundSub: "The link may be old, or the order was already picked up a while ago.",
      backToMenu: "Back to the menu",
      due: "Pay at the window",
      payDueTitle: "Payment due",
      payDueBody: "You can pay now at the window or when you pick your order up. Paying now makes pickup faster.",
      payDueBodyReady: "Pay when you pick your order up.",
      imHere: "I'm here",
      imHereDone: "We told the kitchen you are here",
      imHereHint: "Let us know you are already waiting at the food truck.",
      paid: "Already paid",
      offline: "Offline",
      connecting: "Connecting…",
      live: "Live",
      doneClose: "You can close this window now, or go back if you want to order again.",
      whatYouOrdered: "What you ordered",
      total: "Total",
      bell: "Tell me when it's ready",
      bellOn: "We'll tell you ✓",
      bellHint: "Keep this screen open to get the alert.",
      bellHintOff: "Without internet this won't update on its own. Reload when you have signal.",
      bellNote: "Done. We'll play a sound as soon as your order is ready.",
      bellDenied: "You didn't allow notifications — we'll still play a sound if you leave this screen open.",
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
      paymentMethodCash: "Cash",
      paymentMethodCard: "Card",
      paymentMethodPrompt: "How did they pay?",
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
      collectNow: "Collect",
      arrivedBadge: "Here now",
      cancelOrder: "Customer never showed / cancel",
      confirmCancelOrder: "Yes, cancel — nothing was charged",
      keepOrder: "No, keep the order",
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
      reprintButton: "Print again",
      printerMissingApp: "This tablet has printing turned on, but it is not running the FoodTruckOS app — that is why no tickets come out.",
      ticket: {
        order: "ORDER",
        note: "Note",
        toCollect: "TO COLLECT",
        paid: "PAID",
        reprint: "COPY",
      },
      lookupButton: "Find order",
      lookupTitle: "Find order",
      lookupSubtitle: "By order number, last 7 days. If the number repeats, shows the most recent one.",
      lookupFromDay: (fecha) => `from ${fecha}`,
      lookupPlaceholder: "E.g. 42",
      lookupSearch: "Search",
      lookupSearching: "Searching…",
      lookupNotFound: "We couldn't find that folio in the last 7 days",
      lookupStatusRecibido: "New",
      lookupStatusPreparando: "In progress",
      lookupStatusListo: "Ready",
      lookupStatusEntregado: "Picked up",
      lookupStatusCancelado: "Cancelled",
      lookupPaidWith: (method) => `Paid · ${method}`,
      lookupUnpaid: "Not paid yet",
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
      backToTrucks: "← Trucks",
      trucksOverviewTitle: "The trucks, right now",
      trucksOverviewSubtitle: "How each one is doing at this moment",
      trucksOverviewSalesToday: "Today's sales, all trucks",
      truckNewLabel: "New",
      truckPrepLabel: "Prepping",
      truckReadyLabel: "Ready",
      truckOldestLabel: "Oldest one",
      truckUnpaidLabel: "Unpaid",
      truckUnpaidNone: "none",
      truckSalesTodayLabel: "Sales today",
      truckPausedPill: "Paused",
      truckOpenPill: "Open",
      truckClosedPill: "Closed",
      truckOpensAtPill: (time) => `Opens ${time}`,
      viewTruckBoard: "View its board",
      attentionNeededTitle: "Need attention",
      attentionNeededEmpty: "Nothing running late. All trucks are on track.",
      trucksOverviewDisclaimer: "Refreshes every time you open this screen.",
      logout: "Log out",
      confirmLogout: "Log out of this device?",
      staffOnline: "Online",
      staffOffline: "Offline",
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
        impersonatingBanner: (businessName) => `You're viewing ${businessName}'s panel as an admin`,
        exitImpersonation: "Exit",
      },
      onboarding: {
        next: "Next",
        back: "Back",
        skip: "Skip tour",
        finish: "Finish",
        stepOf: (current, total) => `Step ${current} of ${total}`,
        restartButton: "Watch the tutorial again",
        welcomeTitle: "Welcome to FoodTruckOS!",
        welcomeBody: "We'll show you quickly what you can do on each screen. It takes less than two minutes, and you can skip it anytime.",
        resumenTitle: "Summary",
        resumenBody: "This is where you see how your business is doing: how much you sold this month, what's selling best, and how your trucks compare.",
        menuTitle: "Menu",
        menuBody: "This is where you build what you sell: first you create categories (like \"Drinks\" or \"Desserts\"), then add your items inside each one.",
        menuCategoryTitle: "Create your first category",
        menuCategoryBody: "Use this button to create a category. You can edit or delete it later, as long as it has no items in it.",
        menuProductTitle: "Add an item",
        menuProductBody: "This button adds an item: name, price, and photo. If you want customers to order it \"no onion\" or \"extra cheese,\" that's set up afterward, when editing the item, in the Customization section.",
        trucksTitle: "Trucks",
        trucksBody: "This is where you configure each truck: its name, photo, and hours. The hours decide whether your menu shows as open or closed to customers.",
        trucksCreateTitle: "Set up your first truck",
        trucksCreateBody: "Name, photo, and hours are the only required fields. You can leave the kitchen alert timers as they are — they just warn you if an order is taking too long. You can add more trucks anytime from down here.",
        marcaTitle: "Brand",
        marcaBody: "This is where you give your menu its look: upload your logo, pick your color, and the rest of the style — this is how customers will recognize you.",
        personalTitle: "Staff",
        personalBody: "This is where you add each person on your team. Enter their name and role, and the system generates a 4-digit PIN for them to get into the kitchen screen.",
        personalDeviceTitle: "Connect each person's device",
        personalDeviceBody: "After creating a person, use this button to link the phone or tablet they'll work from — that way each device only unlocks with its matching PIN.",
        qrTitle: "QR codes",
        qrBody: "This is where you download or print each truck's QR code. Customers scan it to see the menu and order from their phone, no account needed.",
        cuentaTitle: "Account",
        cuentaBody: "This is where you see your plan, how many trucks you have active, and how you signed in. If you want to watch this tutorial again, there's a button further down to restart it.",
        doneTitle: "All set!",
        doneBody: "You now know your way around the panel. You can start in Menu by creating your first category, or head straight to Trucks to set your hours.",
      },
      truckApprovalBanner: {
        title: "Your new truck is approved!",
        body: (unitName) => `${unitName} is now active — go to Trucks to set up its hours and branding.`,
        cta: "Set it up now",
        dismiss: "Got it",
      },
      signupRequestPage: {
        accountConfirmedBadge: "Your account is already confirmed",
        oneStepLeft: "Just this step left before it goes under review.",
        title: "Tell us about your business",
        intro: "With this info we review your request and activate your panel — nothing else to do after you send it.",
        businessNameLabel: "Business name",
        cityLabel: "City",
        phoneLabel: "Phone (optional)",
        noteLabel: "Anything else we should know (optional)",
        notePlaceholder: "E.g. how many trucks, which locations",
        submit: "Send request",
        sending: "Sending…",
        sent: "Got it, we received your request. We'll reach out soon to activate your panel.",
        pendingTitle: "Your request is under review",
        pendingBody: (businessName, city) => `We received the request for "${businessName}" in ${city}. We'll reach out soon to activate your panel.`,
        pendingSince: (date) => `Sent on ${date}`,
        pendingNoActionNeeded: "Nothing else to do — once we approve it you'll be able to go straight into your panel with this same account.",
      },
      suspendedTitle: "Account suspended",
      suspendedBody: "Your subscription isn't active. Your panel, kitchen, and customer menu are paused until it's resolved. Contact us to reactivate it.",
      trialBanner: (daysLeft) =>
        daysLeft <= 0
          ? "Your free trial ends today — contact us to keep your access."
          : daysLeft === 1
            ? "Your free trial ends tomorrow — contact us to keep using FoodTruckOS."
            : `Your free trial ends in ${daysLeft} days — contact us to keep using FoodTruckOS.`,
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
        copyFromSpanish: "Use the same text",
        suggestTranslation: "Translate with AI",
        translating: "Translating…",
        staleReloadToast: "We just updated the panel — reloading this screen…",
      },
      menuPage: {
        title: "Your menu",
        subtitle: "This is what your customers see when they scan the code: dishes, prices, and photos. The sold-out switch is for “ran out today” — removing from the menu is permanent.",
        noCategory: "No category",
        addCategory: "+ Add category",
        createCategory: "Create category",
        editCategory: "Edit category",
        deleteCategory: "Delete category",
        confirmRemoveCategory: "Delete this category? Only possible if it has no items.",
        noProductsInCategory: "No items yet.",
        pricePlaceholder: "Price",
        addProduct: "+ Add item",
        hideOptions: "Hide",
        showOptions: "Customization",
        soldOut: "Sold out",
        confirmRemove: "Sure? If it just ran out today, use the switch instead.",
        removeFromMenu: "Remove from menu",
        noOptionGroups: "No customization groups yet.",
        personalizationHint: "Want customers to be able to customize this item? E.g. \"add something?\" or \"remove something?\". Optional.",
        nameAndDescriptionTitle: "Name and description",
        required: "required",
        optionalLabel: "optional",
        selectRange: (min, max) => `choose ${min}–${max}`,
        deleteGroup: "Delete group",
        addOptionGroup: "+ Add option group",
        addOption: "+ Add option",
        addWithCost: "Add with a cost",
        addNoCost: "Add with no cost",
        groupKindQuestion: "Is this group for adding or removing ingredients?",
        groupKindAdd: "Added",
        groupKindAddHint: "E.g. extra cheese, bacon",
        groupKindRemove: "Removed",
        groupKindRemoveHint: "E.g. no onion, not spicy",
        priceDeltaPlaceholder: "+$",
        priceDeltaHint: "Leave it at 0 if there's no extra cost",
        optionNameMissingError: "Enter the ingredient's name in Spanish and English",
        editOption: "Edit",
        minLabel: "minimum",
        maxLabel: "maximum",
        requiredLabel: "required",
        allTrucksFilter: "All trucks",
        statsLine: (total, out, noPhoto, scopeName) =>
          (scopeName ? `${total} item${total === 1 ? "" : "s"} sold at ${scopeName}` : `${total} item${total === 1 ? "" : "s"} total`) +
          (out ? ` · ${out} sold out` : "") +
          (noPhoto ? ` · ${noPhoto} without a photo` : " · all with photos"),
        categorySummaryLine: (count, noun, out, noPhoto) =>
          [`${count} ${noun}`, out ? `${out} sold out` : null, noPhoto ? `${noPhoto} without a photo` : null]
            .filter(Boolean)
            .join(" · "),
        collapseCategory: "Collapse",
        expandCategory: "Expand",
        whoSellsIt: "Who sells it?",
        noPhotoShort: "No\nphoto",
        formError: "Check the name and the price",
        categoryFormError: "Enter the name in Spanish and English",
        productFormError: "Enter the name in Spanish and English, and a price greater than 0",
        categoryRequiredError: "Choose a category",
        editModalHint: "Changes show up in your customers' menu right away.",
        addModalHint: "It shows up in your customers' menu as soon as you save it.",
        photoLabel: "Photo of the dish",
        photoHint: "Take the photo of the dish exactly as it leaves your kitchen. We never use another dish's photo.",
        descriptionEsPlaceholder: "Description in Spanish",
        descriptionEnPlaceholder: "Description in English",
        whichCategoryLabel: "Which part of the menu?",
        exclusivityAll: "All",
        exclusivityAllHint: "Shows up on every truck's menu",
        exclusivityOnly: (truckName: string) => `Only ${truckName}`,
        exclusivityOnlyHint: "Shows up on this truck's menu only, nowhere else",
        noPhotoYetHint: "If you don't have the photo yet, save it without one: the menu shows a marked space and you can add it later. We never use another dish's image.",
        addProductSubmit: "Add to menu",
        addCategoryHint: "Items you add later can go here.",
        noTrucksExclusiveYet: "This truck doesn't have its own items yet.",
      },
      trucksPage: {
        title: "Your trucks",
        subtitle: "Pause service here when you run out of gas or switch shifts, adjust hours, and decide after how many minutes an order gets flagged as late on the kitchen screen.",
        newTruckNote: "Adding a new truck: right now we do it by hand, to confirm location and hours with you.",
        contactUs: "Email us",
        showArchived: "Show",
        hideArchived: "Hide",
        minSuffix: "minutes",
        reopenNow: "Reopen now",
        pause: "Pause service",
        pausedBadge: "Paused",
        openBadge: "Open",
        closedByHoursBadge: "Closed",
        opensAtBadge: (time) => `Opens ${time}`,
        reopens: (when) => `Reopens ${when}`,
        untilManualReopen: "Until you reopen it by hand",
        archiveTruck: "Retire truck",
        archivedOn: (date) => `Archived ${date}`,
        reactivate: "Reactivate",
        locationPlaceholder: "Where does it usually park? (optional)",
        taxTitle: "How you handle tax",
        taxHint: "Affects the menu, the ticket, and your reports.",
        taxAdd: "Added to the total",
        taxAddHint: "The menu shows the price and tax is added at the end.",
        taxIncluded: "Already included",
        taxIncludedHint: "What they see on the menu is what they pay. No surprises at the end.",
        sharedSettingsTitle: (n) => `Settings for all ${n}`,
        sharedSettingsHint: "Applies to the whole business. Any truck can use its own if it needs to.",
        alertThresholdsLabel: "When to flag that an order is taking too long",
        amberLabel: "Amber",
        redLabel: "Red",
        alertTipWithData: (avg, amber, red) =>
          `Your real average over the last 30 days is ${avg} minutes per order. With these numbers, an order turns amber at ${amber} and red at ${red}. Set them too low and everything looks red — the alert stops being useful.`,
        alertTipNoData: (amber, red) =>
          `There aren't enough completed orders yet to calculate your real average. With these numbers, an order turns amber at ${amber} and red at ${red}.`,
        horarioLabel: "Hours",
        kitchenAlertsLabel: "Kitchen alerts",
        ownAlertsTag: "own",
        businessAlertsTag: "the business's",
        closedAllWeek: "Closed all week",
        editNamePhoto: "Name and photo",
        changeHours: "Change hours",
        setOwnAlerts: "Set own alerts",
        removeOwnAlerts: "Remove own alerts",
        viewQr: "View its QR",
        editTruckHint: "This is what your customer sees when they scan this truck's code.",
        photoLabelTruck: "Truck photo",
        choosePhoto: "Choose photo",
        changePhoto: "Change photo",
        removePhoto: "Remove",
        photoHintTruck: "A photo of the truck as it looks from outside. Helps the customer confirm they're at the right one.",
        nameQuestion: "What do you call this truck?",
        locationQuestion: "Location",
        nameRequired: "The truck needs a name",
        hoursModalTitle: (name) => `Hours for ${name}`,
        hoursModalHint: "Outside these hours your menu shows as closed. If you don't open some day, turn it off.",
        applyToAllDays: "Use these hours every day",
        applyToAllNeedsOne: "Turn on at least one day first",
        wouldBeLabel: "This would read:",
        saveSchedule: "Save hours",
        invalidHoursRange: "Check: some days have a closing time that isn't after the opening time",
        closedDay: "Closed",
        ownAlertsModalTitle: (name) => `Own alerts for ${name}`,
        ownAlertsModalHint: (amber, red) =>
          `Use this if this truck sells something that takes different timing, or has a much longer line than the others. Right now it uses the business's: ${amber} and ${red} minutes.`,
        onlyForLabel: (name) => `Only for ${name}`,
        saveOwnAlerts: "Save",
        archiveModalTitle: (name) => `Retire ${name}?`,
        archiveModalBody: "It stops taking orders and its QR code stops working. Its information isn't deleted: its sales keep showing up in your comparisons, even last year's. We keep it for two years in case you want to reactivate it — and reactivating takes minutes, not a whole new setup.",
        archiveModalBilling: "You stop paying for it starting next period. This month is already covered.",
        confirmArchiveText: "This archives it, doesn't delete it. Sure?",
        yesArchive: "Yes, retire it",
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
        requestTruckButton: "Request a new truck",
        requestPending: (date) => `You requested a new truck on ${date} — under review.`,
        requestTruckTitle: "Request a new truck",
        requestTruckBody: "We'll contact you to confirm where it'll be and its hours. We'll set it up with your menu, your brand, and a QR ready to print.",
        requestTruckPriceLabel: "With this truck, your plan would be",
        requestTruckPricePreview: (trucks, price) => `${trucks} trucks · $${price} per truck`,
        requestTruckTotalPreview: (total) => `$${total} a month total`,
        requestTruckBillingNote: "Once approved, your truck goes live right away and you're charged for the full month at that moment — no matter what day you request it, never prorated.",
        requestTruckNoteLabel: "Anything we should know? (optional)",
        requestTruckNotePlaceholder: "Location, hours, anything useful",
        requestTruckCancel: "Cancel",
        requestTruckSubmit: "Send request",
      },
      marcaPage: {
        title: "Your brand",
        subtitle: "What your customer sees when they scan the code — four decisions, nothing more.",
        step1: "1 · YOUR LOGO",
        uploadLogoTitle: "Upload your logo",
        uploadLogoHint: "PNG or JPG. It sits right on the header — a transparent background looks best.",
        step2: "2 · YOUR COLOR",
        chooseColorTitle: "Choose your color",
        chooseColorHint: "Ten colors tested in direct sunlight. Any of them works — there's no wrong choice.",
        contrastConfirm: (colorName, ratio) => `${colorName} · the text adjusts itself and stays at a ${ratio}:1 contrast ratio. Readable in direct sun.`,
        step3: "3 · YOUR STYLE",
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
        addPreviewLabel: "Add",
        previewNoProducts: "Your dishes will show up here once you add them in Menu.",
        motifStep: "DETAIL",
        motifTitle: "Background artwork",
        motifHint: "A few discreet lines in the header, based on what you sell.",
        headerStyleStep: "DETAIL",
        headerStyleTitle: "The header",
        headerStyleHint: "How your logo shows above the menu.",
        headerStyleColor: "Brand color",
        headerStyleColorHint: "Your logo sits on a plate, in the color you picked.",
        headerStyleBlack: "Black, logo mounted",
        headerStyleBlackHint: "Black header, your logo sits right on top — great if your logo already has a dark or transparent background.",
        truckOverrideSummary: "A truck with a different brand?",
        truckOverrideBody: "Normally your trucks share the same logo and color, and each keeps its own name and photo. If one operates under a different brand, you can give it its own color here — it's an exception, not something you have to decide.",
        truckOverrideOwn: "Own color",
        truckOverrideRemove: "Remove",
        truckOverrideInherits: "Uses the business color",
      },
      personalPage: {
        title: "Your staff",
        subtitle: "Your staff doesn't need an email or a password. The truck's tablet connects once and stays connected; each person enters with their four-digit PIN.",
        selfServiceTitle: "You handle this yourself, whenever you want",
        selfServiceBody: "Someone new starts, you create their PIN. They leave, you delete it and it stops working right then. Lost a tablet? Revoke its access here. No need to tell us or wait on anyone.",
        staffTitle: "People",
        addPerson: "Add person",
        staffHint: "Each person with their own PIN, so you know who handled each order.",
        whoLabel: "What's their name?",
        namePlaceholder: "First and last name",
        nameMissingError: "Name is required",
        deviceNameMissingError: "Give the device a name and pick a truck",
        addStaffHint: "We'll create a four-digit PIN for them. That's all they need to enter.",
        whatWillDoLabel: "What will they do?",
        roleCocina: "Kitchen",
        roleCocinaHint: "Sees the orders and marks them as they go",
        roleCajero: "Cashier",
        roleCajeroHint: "Also takes orders and collects payment",
        roleEncargado: "Manager",
        roleEncargadoHint: "Also sees their truck's sales",
        whichTruckLabel: "Which truck?",
        allTrucks: "All trucks",
        encargadoAllTrucksHint: "The manager sees and can operate every truck in the business — there's no single one to pick.",
        deviceUnitHint: "This is the truck this device starts on once paired. If whoever signs in with their PIN is a manager, they'll still be able to see and operate the other trucks.",
        truckArchivedSuffix: " (archived)",
        createPin: "Create their PIN",
        pinRevealTitle: "Done, they can enter now",
        pinRevealHint: (name) => `This is ${name}'s PIN. Write it down or send it to them — we can't show it again after this, so capture it now.`,
        pinRevealLabel: (name, truck) => `${name}'s PIN · ${truck}`,
        understood: "Got it",
        noStaffYet: "You haven't added anyone yet. Add your first person.",
        showRemoved: (n) => `Show removed staff (${n})`,
        hideRemoved: (n) => `Hide removed staff (${n})`,
        confirmRemoveAccess: "Their PIN stops working right away. Remove?",
        resetPin: "Reset PIN",
        resettingPin: "Resetting…",
        confirmResetPin: "Their current PIN stops working. Reset?",
        yesReset: "Yes, reset",
        pinResetTitle: "Done, they have a new PIN",
        pinResetHint: (name) => `This is ${name}'s new PIN. The old one no longer works. Write it down or send it — we can't show it again after this.`,
        pinMaskedLabel: "••••",
        usedToday: "used their PIN today",
        usedYesterday: "used their PIN yesterday",
        usedDaysAgo: (n) => `used their PIN ${n} days ago`,
        neverUsedPin: "hasn't entered yet",
        stillHereBadge: "still around?",
        devicesTitle: "Connected tablets and phones",
        devicesHint: "The devices already inside the system. They connect just once.",
        pairTablet: "Connect a device",
        deviceNamePlaceholder: "Device name (e.g. Kitchen tablet)",
        whichTruckDeviceLabel: "Which truck is it for?",
        generateCode: "Generate code",
        connectDeviceTitle: "Connect a device",
        connectDeviceHint: "On the tablet or phone, open the system's page and type this code. That connects it, and it won't ask again.",
        pairingCodeLabel: "Code to connect",
        codeExpiresIn: (mmss) => `Valid for ${mmss} more`,
        codeExpired: "It expired. Generate another one.",
        close: "Close",
        connectedSince: (date) => `Connected since ${date}`,
        lastSeenToday: "last seen today",
        lastSeenYesterday: "last seen yesterday",
        lastSeenDaysAgo: (n) => `last seen ${n} days ago`,
        neverConnected: "Never connected",
        printingOn: "Prints tickets",
        printingOff: "No printing",
        printerUnnamed: "Unnamed printer",
        printerNeverPrinted: "has not printed yet",
        printerLastOk: (fecha: string) => `last printed on ${fecha}`,
        ticketCopies: (n) => (n === 1 ? "1 copy" : `${n} copies`),
        noDevicesYet: "No devices yet.",
        showRevoked: (n) => `Show disconnected (${n})`,
        hideRevoked: (n) => `Hide disconnected (${n})`,
        pairedBadge: "Active",
        waitingCodeBadge: "Waiting for code",
        confirmRevoke: "It stops entering the system right away. Disconnect?",
        yesRevoke: "Yes, disconnect",
        revoke: "Disconnect",
      },
      qrPage: {
        title: "Your QR codes",
        subtitle: "One per truck. Print it and post it where the customer sees it while in line.",
        noActiveTrucks: "No active trucks yet.",
        download: "Download to print",
        openMenu: "Open the menu",
        realTitle: "These codes are real",
        realBody: "Scan them right now with your phone's camera to check — they'll take you to the address shown under each one.",
        viewKitchenTitle: "How's the kitchen doing right now?",
        viewKitchenBody: "See live how many orders each truck has, without asking anyone for their phone.",
        viewKitchenCta: "View live kitchen",
        howToTitle: "What to do with them",
        how1: "Print them big, at least letter-size. A tiny QR doesn't scan from the line.",
        how2: "Post them where people see them while waiting: the window, the side of the truck, the tables if you have any.",
        how3: "Laminate them or put them in a sleeve. They'll take sun, grease, and rain.",
        how4: "Don't cover them with anything. If one gets scratched or faded, print another — it's the same code.",
        printAll: "Print the posters",
        posterMsg: "Escanea y pide desde tu celular",
        posterMsg2: "Scan to order from your phone",
        posterStepsTitle: "How it works",
        posterStep1: "Scan this code",
        posterStep2: "Pick your food",
        posterStep3: "Get your order number",
        posterStep4: "We tell you when it is ready",
        posterPayNote: "Pay at the window — before or when you pick it up.",
      },
      cuentaPage: {
        title: "Your account",
        subtitle: "This is where you see your plan, how many trucks you have active, and where you signed in from.",
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
        howYouPayTitle: "How you pay today",
        howYouPayHint: "Pilot phase",
        howYouPayManual: "We email you the receipt and you pay by bank transfer. Automatic card billing is coming in a future phase; once it's ready, you'll turn it on from here and stop getting the email.",
        howYouPayStripe: "Your saved card is charged automatically every month — nothing to do on your end.",
        yourDataTitle: "Your info",
        yourDataHint: "What shows up on your receipt",
        businessLabel: "Business",
        emailLabel: "Email",
        signInLabel: "You sign in with",
        signInGoogle: "Google account",
        signInPassword: "Email and password",
        leaveTitle: "Want to leave?",
        cancelConsequencesTitle: "Cancel your subscription?",
        cancelConsequencesIntro: "Before you decide, here's exactly what happens:",
        cancelConsequence1: (n) => `Your ${n} truck${n === 1 ? "" : "s"} keep working until the period you already paid for ends.`,
        cancelConsequence2: "After that, your QR codes stop opening the menu.",
        cancelConsequence3: "Your information isn't deleted. Sales, menu, and brand are kept for two years. If you come back, reactivating takes minutes.",
        cancelConsequence4: "We don't charge you anything else. No penalty.",
        cancelKeepGoing: "Never mind",
        cancelContinue: "Yes, I want to cancel",
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
        yearDelta: "Difference",
        noData: "no data",
        monthlySales: "Sales month by month",
        vsLabel: (a, b) => `${a} vs. ${b}`,
        eachTruckIn: (month) => `Each truck in ${month}`,
        whereFrom: "Where sales come from",
        topSelling: "Best sellers",
        piecesThisMonth: "units this month",
        salesActivity: "Sales activity",
        salesActivityHint: "What time the first and last order of each truck come in, on average, and how that compares to the hours you published — last 30 days.",
        salesActivityDisclaimer: "This measures what time orders come in, compared to the hours you published in Trucks. It doesn't log staff clock-ins or clock-outs, and it's not used to calculate pay.",
      ledgerTitle: "Your orders",
      ledgerSubtitle: "Last 30 days. Filter and download to compare against your register or your bank.",
      ledgerFilterTruck: "Truck",
      ledgerFilterAllTrucks: "All",
      ledgerFilterFrom: "From",
      ledgerFilterTo: "To",
      ledgerFilterPaymentMethod: "Payment method",
      ledgerFilterAllMethods: "All",
      ledgerFilterPaymentStatus: "Payment status",
      ledgerFilterAllStatuses: "All",
      ledgerFilterChannel: "Channel",
      ledgerFilterAllChannels: "All",
      ledgerSearchPlaceholder: "Order or customer name",
      ledgerExport: "Download CSV",
      ledgerEmpty: "No orders match these filters.",
      ledgerColFolio: "Order",
      ledgerColDate: "Date",
      ledgerColTruck: "Truck",
      ledgerColChannel: "Channel",
      ledgerColStatus: "Status",
      ledgerColPayment: "Payment",
      ledgerColTotal: "Total",
      ledgerShowingCount: (n) => `${n} order${n === 1 ? "" : "s"}`,
      ledgerStatusPaid: "Paid",
      ledgerStatusUnpaid: "Not paid",
      ledgerChannelQr: "QR",
      ledgerChannelVentanilla: "Counter",
        lateOpenInsightTitle: (unitName, minutes) => `${unitName} starts selling ${minutes} minutes late`,
        lateOpenInsightBody: (amount) => `At that unit's sales pace, that gap runs about ${amount} a month — an estimate from its hourly sales rate, not an exact figure.`,
        highlightsTitle: "Key highlights",
        highlightsHint: "From the last 30 days, to help you decide.",
        noHighlightsYet: "Not enough orders yet to show highlights.",
        peakHourHighlight: (range, count) => `Your busiest hour is ${range}, with ${count} order${count === 1 ? "" : "s"} in the last 30 days.`,
        bestDayHighlight: (dayName, amount) => `${dayName} is your strongest day: ${amount} in average sales.`,
        avgPrepHighlight: (minutes) => `On average, an order is ready ${minutes} min after it's received.`,
        topProductHighlight: (name, qty) => `Your best-selling item this month is ${name}, with ${qty} sold.`,
        noSalesToGraph: "No sales recorded yet to graph.",
        noActiveTrucks: "No active trucks yet.",
        noSalesThisMonth: "No sales yet this month.",
        noOrdersThisMonth: "No orders yet this month.",
        noPreviousMonth: "no previous month",
        byQrLabel: "by QR",
        qrChannel: "QR code",
        ventanillaChannel: "Counter",
        daysWithSales: (n) => `${n} day${n === 1 ? "" : "s"} with sales, last 30 days`,
        opensLate: (dur) => `first sale ${dur} after opening`,
        opensOnTime: "first sale on time",
        noPublishedHours: "no published hours",
        firstOrder: "first order:",
        lastOrder: "last order:",
        closesEarly: (dur) => `last sale ${dur} before closing`,
        noOrdersLast30: (name) => `${name} — no orders in the last 30 days.`,
        pendingCollectionTitle: "Pending collection",
        pendingInProgressLabel: "In progress, unpaid",
        pendingInProgressHint: "Still in the kitchen — can still be charged at pickup.",
        pendingDeliveredLabel: "Delivered without charging",
        pendingDeliveredHint: "Already left the kitchen and no one charged for it. Follow up with your staff.",
        noShowLabel: "No-shows",
        noShowHint: "The customer ordered and never came to pick it up. Never a sale — kept here only as a record.",
        noneLabel: "none",
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
      reactivateAsk: "Comes back as:",
      reactivateAsTrial: "Trial (14 days)",
      reactivateAsPaid: "Paid",
      cancel: "Cancel",
      suspend: "Suspend",
      recoveryButton: "Send password link",
      recoveryHint: "Sends the owner the same \"forgot my password\" email. They pick the password; we never see it.",
      recoveryConfirm: "Send the link to the owner?",
      recoverySend: "Send",
      recoverySent: (email) => `Link sent to ${email}`,
      statusTrial: "Trial",
      statusActive: "Active",
      statusSuspended: "Suspended",
      statusCancelled: "Cancelled",
      trialNoLimit: "No expiry",
      trialSave: "Save",
      trialSetDays: (n) => `${n} days`,
      trialExpired: "Trial expired",
      trialDaysLeft: (n) => (n === 1 ? "1 day left" : `${n} days left`),
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
      pendingRequestsHeader: "Pending requests",
      noPendingRequests: "Nothing pending.",
      requestApprove: "Approve and activate",
      requestReject: "Dismiss",
      requestedOn: (date) => `Requested on ${date}`,
      currentTrucksLabel: (n) => `${n} active truck${n === 1 ? "" : "s"}`,
      actionTruckRequestApproved: "Approved a new truck",
      actionTruckRequestRejected: "Rejected a new truck",
      actionAdminViewedBusiness: "Viewed the panel",
      actionArchiveWarningSent: "Sent a heads-up about archive expiring",
      archivedExpiryHeader: "Archive expiring soon",
      archivedExpiryHint: "Kept for 2 years; contact the client before the deadline hits. Nothing is deleted automatically.",
      archivedOn: (date) => `Archived on ${date}`,
      retentionOverdue: "Already past 2 years",
      retentionMonthsLeft: (n) => `${n} month${n === 1 ? "" : "s"} left`,
      archiveContactedBadge: "Client contacted",
      archiveMarkContacted: "Mark contacted",
      businessSignupsHeader: "New businesses",
      noBusinessSignups: "Nothing pending.",
      businessSignupApprove: "Approve and activate",
      businessSignupApproving: "Activating…",
      businessSignupConfirm: "Confirm setup",
      firstUnitNameLabel: "First truck's name",
      firstUnitLocationLabel: "Location",
      actionBusinessSignupApproved: "Activated new business",
      actionBusinessSignupRejected: "Rejected business request",
      actionProductRetired: "Removed a dish from the menu",
      actionProductCreated: "Added a dish",
      actionStaffCreated: "Added staff",
      actionStaffPinReset: "Reset a PIN",
      actionStaffRemoved: "Removed staff",
      actionDeviceCreated: "Paired a device",
      actionDeviceRevoked: "Revoked a device",
      billingNoteTitle: "Automatic billing:",
      billingNoteBody:
        "in Phase 1, subscriptions are billed outside the system and this only records the status. Every client is already marked as manual transfer or Stripe-connected, so the table won't need rework once it's activated — the actual connection lands in Phase 2. Until then, suspending for non-payment is a manual action.",
      billingRuleTitle: "Billing rule:",
      billingRuleBody:
        "truck changes apply to the next billing period, never mid-month. Approving a request here schedules the change; it doesn't touch this month's charge. Removing a truck archives its data for two years; it doesn't delete it.",
    },
    auth: {
      signatureEyebrow: "Live kitchen",
      signatureHeadline: "From the order to the window, without losing one.",
      signatureBody: "Every order placed by QR or at the counter shows up instantly on the kitchen screen — this is what your team sees right now.",
      ticketNew: "New",
      ticketPrep: "Cooking",
      ticketReady: "Ready",
      loginTitle: "Sign in to your panel",
      loginSubtitle: "For FoodTruckOS owners and staff.",
      googleButton: "Continue with Google",
      dividerLabel: "or with your email",
      orGoogleLabel: "or continue with Google",
      emailLabel: "Email",
      emailPlaceholder: "you@yourbusiness.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Your password",
      signInButton: "Sign in",
      signingIn: "Signing in…",
      invalidCredentials: "That email and password don't match any account.",
      tryMagicLinkHint: "Did you sign in before with an emailed link? Request a new one below — no password needed.",
      magicLinkButton: "Email me a sign-in link",
      sendingMagicLink: "Sending…",
      magicLinkSentTitle: "Check your email",
      magicLinkSentBody: (email) => `We sent a sign-in link to ${email}. Open it on this same device to continue.`,
      magicLinkError: "We couldn't send the link. Try again in a moment.",
      forgotPassword: "Forgot my password",
      recoverTitle: "Reset your password",
      recoverSubtitle: "We'll email you a link to pick a new one.",
      recoverEmail: "Your email",
      recoverSend: "Send link",
      recoverSending: "Sending…",
      recoverSentTitle: "Link sent",
      recoverSentBody: (email) => `If ${email} has an account, the link to pick a new password is there.`,
      recoverSentNote: "Check your spam folder too. The link works once and expires in an hour — open it twice and the second time it will say it is no longer valid.",
      recoverTooSoon: (segundos) => `We just sent one. Wait ${segundos}s before asking for another.`,
      recoverFailed: "We couldn't send the link. Check the address and try again.",
      recoverResend: "Send another link",
      recoverResendIn: (segundos) => `You can ask for another in ${segundos}s`,
      recoverBackToLogin: "Back to sign in",
      linkFailed: "We couldn't validate that link: it may have been used already or expired. Ask for a new one.",
      newPasswordTitle: "New password",
      newPasswordSubtitle: "Pick one with at least 8 characters.",
      newPasswordField: "New password",
      newPasswordSave: "Save password",
      newPasswordSaving: "Saving…",
      newPasswordDone: "Done — taking you to your panel…",
      newPasswordFailed: "We couldn't update your password. Ask for a new link.",
      newPasswordNoSession: "This link is no longer valid. Ask for a new one from \"Forgot my password\".",
      noAccountYet: "Is your business not on FoodTruckOS yet?",
      registerLink: "Request access",
      registerTitle: "Request access",
      registerSubtitle: "Tell us about your business and we'll reach out to set up your panel — no card or password needed right now.",
      freeTrialNote: "You start with a free trial; billing only kicks in once you decide to continue.",
      businessNameLabel: "Business name",
      businessNamePlaceholder: "e.g. Golden State Tacos",
      cityLabel: "City",
      cityPlaceholder: "e.g. El Reno, OK",
      phoneLabel: "Phone (optional)",
      phonePlaceholder: "So we can reach you faster",
      registerEmailHint: "We'll send a link to this email to confirm the request — no password to remember.",
      requestButton: "Send request",
      sendingRequest: "Sending…",
      requestError: "We couldn't send your request. Try again in a moment.",
      requestSentTitle: "Almost there — check your email",
      requestSentBody: (email) => `We sent a confirmation link to ${email}. Open it to log your request, and our team will reach out soon to set up your panel.`,
      alreadyHaveAccount: "Already have an account?",
      backToLogin: "Sign in",
    },
    landing: {
      navProduct: "Product",
      navBenefits: "Benefits",
      navPricing: "Pricing",
      navLogin: "Log in",
      ctaTrial: "Free trial",
      heroEyebrow: "Live kitchen screen, QR ordering, zero commission",
      heroTitleLine1: "Your food truck,",
      heroTitleAccent: "truly lit up",
      heroSub: "Diners scan a code and order from their own phone — under your brand, not ours — and the order shows up instantly on your kitchen screen. No apps, no commission, no learning curve.",
      heroCtaPrimary: "Start your free trial",
      heroCtaSecondary: "See how it works",
      heroMeta: "No card to start · Cancel anytime",
      showcaseEyebrow: "This is your kitchen",
      showcaseTitle: "Every order, in real time",
      showcaseSub: "Move your mouse over the panel — this is how your kitchen screen reacts on every shift.",
      boardTitle: "Kitchen — live",
      boardLive: "LIVE",
      order1Name: "2× Carne asada torta",
      order1Items: "no onion · extra cheese",
      order1Badge: "NEW",
      order2Name: "Taco order (4)",
      order2Items: "to go",
      order2Badge: "4 MIN",
      order3Name: "Quesabirria + water",
      order3Items: "extra consommé",
      order3Badge: "READY",
      stat1Label: "Orders today",
      stat2Label: "Avg. delivery",
      stat3Label: "Sales today",
      showcaseHint: "Moving an order forward takes one tap — built for busy hands at rush hour.",
      navEnter: "Sign in",
      printEyebrow: "Printed tickets",
      printTitle: "The ticket rail is your kitchen's queue",
      printSub: "Not an extra — it is how the trade works. Pair a Bluetooth printer with the tablet and every order, by QR or at the counter, comes out on paper right away.",
      printWhy1Title: "Two cooks, two tickets",
      printWhy1Body: "Each one takes their own off the rail and they work in parallel. A screen with three columns cannot do that.",
      printWhy2Title: "Busy hands, clean paper",
      printWhy2Body: "You read it without touching anything. Nobody lifts a hand off the griddle to swipe a greasy screen.",
      printWhy3Title: "No signal, still prints",
      printWhy3Body: "The printer hangs off the tablet over Bluetooth, not off the internet. A counter order prints even when the truck loses data.",
      printPickTitle: "You choose the setup",
      printOptionATitle: "Two tablets",
      printOptionABody: "One in the kitchen, one at the window. That is how it works today and you buy nothing extra.",
      printOptionBTitle: "Tablet + printer",
      printOptionBBody: "A single tablet and the ticket on paper. The printer is optional — add it whenever you want.",
      printHardwareNote: "We provide the app and walk you through the setup. You buy the tablet and the printer yourself, from a short list of gear we test — so you never wait on our stock or our shipping.",
      ticketTruck: "CENTRO TRUCK",
      ticketOrder: "ORDER",
      ticketItem1: "STEAK TORTA",
      ticketItem1Remove: "ONION",
      ticketItem1Add: "Extra cheese",
      ticketItem2: "QUESABIRRIA",
      ticketItem2Note: "extra crispy",
      ticketCustomer: "Marisol",
      ticketCollect: "COLLECT ON DELIVERY",
      ticketCaption: "The ticket that actually prints — anything removed goes in caps, because that is the expensive mistake in a kitchen.",
      benefitsEyebrow: "Why FoodTruckOS",
      benefitsTitle: "Everything your business needs, in one place",
      benefitsSub: "Every feature exists because a food truck owner needed it first.",
      benefit1Title: "Your business, live",
      benefit1Body: "Open the panel and see, instantly, how much you're selling, what's running out, and how each truck is doing — no waiting for closing time.",
      benefit2Title: "Your customers order in seconds",
      benefit2Body: "They scan a code and order from their own phone. No apps to install, no lines, no customers who give up waiting.",
      benefit3Title: "Zero commission, zero fine print",
      benefit3Body: "We never charge per order, and there's no contract locking you in. You pay a flat monthly fee and keep 100% of every sale.",
      benefit4Title: "Your business in the palm of your hand",
      benefit4Body: "Prices, pauses, staff and reports — all from your phone, whether you're at the truck, at home, or in the checkout line.",
      benefit5Title: "Your menu, always up to date",
      benefit5Body: "Change a price or mark a dish sold out in seconds, and it shows instantly on your customers' phones.",
      benefit6Title: "Print your QR codes as many times as you want",
      benefit6Body: "Download each truck's code and put it on your window, your table or your flyer — no limit, no extra cost.",
      benefit7Title: "Your brand, not ours",
      benefit7Body: "Your logo, color and style on every screen your customer sees. FoodTruckOS works behind the scenes, invisible.",
      benefit8Title: "Insights that work for you",
      benefit8Body: "The panel tells you on its own what's selling best, when you're busiest, and which truck is doing better — no charts to build.",
      pricingEyebrow: "Simple pricing",
      pricingTitle: "The more trucks, the cheaper each one gets",
      pricingSub: "No commission per order. No minimum commitment. Cancel anytime.",
      price1Tag: "1 truck",
      price2Tag: "2 trucks",
      price3Tag: "3 or more",
      priceNote: "per truck",
      pricePer: "/mo",
      ctaTitle: "Your food truck, online in minutes",
      ctaSub: "Create your free account and your truck is ready to take orders today. No card, no install, no commitment.",
      footerCredit: "Built by Vibrancy GG. All rights reserved.",
    },
  },
}
