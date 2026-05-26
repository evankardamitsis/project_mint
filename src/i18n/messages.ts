export type AppLocale = "en" | "el";

export type Messages = {
  nav: {
    electricGuitars: string;
    synthsKeyboards: string;
    effectsPedals: string;
    proAudio: string;
  };
  header: {
    sell: string;
    logIn: string;
    join: string;
    searchAria: string;
    savedAria: string;
    accountPurchases: string;
    accountSaved: string;
    accountSettings: string;
    accountMyListings: string;
    accountAdmin: string;
    accountUsers: string;
    roleAdmin: string;
    roleSuperAdmin: string;
  };
  footer: {
    tagline: string;
    copyrightLine: string;
    company: string;
    legal: string;
    about: string;
    help: string;
    contact: string;
    privacy: string;
    terms: string;
    language: string;
  };
  home: {
    heroKicker: string;
    heroHeadline1: string;
    heroHeadline2: string;
    heroHeadline3: string;
    heroSubtitle: string;
    browseGear: string;
    startSelling: string;
    statActiveListings: string;
    statActiveShops: string;
    statBuyerProtection: string;
    boostZoneNote: string;
    heroRecentlyListed: string;
    latest: string;
    sectionSynths: string;
    sectionEffects: string;
    seeAll: string;
    listingsWhenLive: string;
  };
  trust: {
    protectedPayments: string;
    paymentHeld: string;
    proofPhotos: string;
    trackingVerified: string;
    disputeSupport: string;
  };
  browse: {
    title: string;
    pageHeading: string;
    pageSubtitleMany: string;
    searchPlaceholder: string;
    countOne: string;
    countMany: string;
    emptyFilteredTitle: string;
    emptyFilteredBody: string;
    clearFilters: string;
    emptyNoneTitle: string;
    emptyNoneBody: string;
    listingsSection: string;
    clearAllLink: string;
    filterCategory: string;
    filterBrand: string;
    filterCondition: string;
    filterPrice: string;
    filterPriceDrops: string;
    filterAllCategories: string;
    filterAllBrands: string;
    filterAnyCondition: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    priceAny: string;
    priceUnder250: string;
    price250to500: string;
    price500to1000: string;
    priceOver1000: string;
    saveSearchCta: string;
    saveSearchSaved: string;
    saveSearchViewAlerts: string;
    saveSearchSubtleNoFilters: string;
    saveSearchNameLabel: string;
    saveSearchNotifications: string;
    saveSearchSubmit: string;
    saveSearchCancel: string;
    saveSearchGuestHint: string;
    saveSearchPromptText: string;
    saveSearchPromptAction: string;
  };
  sell: {
    title: string;
    subtitle: string;
    newListing: string;
    getStarted: string;
    browseGear: string;
    tile1h: string;
    tile1t: string;
    tile2h: string;
    tile2t: string;
    tile3h: string;
    tile3t: string;
    footerBuyer: string;
    footerSeller: string;
    footerSellerTail: string;
    openHub: string;
    sellerAccessTitle: string;
    sellersKicker: string;
  };
  listingNotFound: {
    title: string;
    body: string;
    back: string;
    similar: string;
  };
  dashboard: {
    seller: string;
    buyer: string;
    admin: string;
    sellerShopFallback: string;
    buyerAccountFallback: string;
  };
  buyerNav: {
    overview: string;
    purchases: string;
    offers: string;
    follows: string;
    alerts: string;
  };
  buyerWatchlist: {
    title: string;
    emptyTitle: string;
    emptyDescription: string;
    browseCta: string;
  };
  buyerHome: {
    headline: string;
    lead: string;
    cardPurchasesTitle: string;
    cardPurchasesBody: string;
    cardOffersTitle: string;
    cardOffersBody: string;
    cardSavedTitle: string;
    cardSavedBody: string;
    cardSavedCta: string;
    cardHelpTitle: string;
    cardHelpBody: string;
    cardAlertsTitle: string;
    cardAlertsBody: string;
  };
  buyerAlerts: {
    title: string;
    emptyTitle: string;
    emptyBody: string;
    browseCta: string;
    viewResults: string;
    notificationsOn: string;
    notificationsOff: string;
    toggleAlertsOn: string;
    toggleAlertsOff: string;
    delete: string;
    matchOne: string;
    matchMany: string;
    savedOnPrefix: string;
  };
  sellerOrders: {
    pageTitle: string;
    pageDescription: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  sellerNav: {
    overview: string;
    listings: string;
    newListing: string;
    orders: string;
    offers: string;
    profile: string;
  };
  sellerHub: {
    noProfileHeroTitle: string;
    noProfileHeroSubtitle: string;
    noProfileEmptyTitle: string;
    noProfileEmptyDesc: string;
    setupProfileBtn: string;
    heroShopName: string;
    heroTitle: string;
    heroSubtitle: string;
    statLive: string;
    statOffers: string;
    statOrders: string;
    statsFooter: string;
    newListingBtn: string;
    allListingsBtn: string;
    ordersBtn: string;
    offersBtn: string;
    profileBtn: string;
    editProfileBtn: string;
    onShelfTitle: string;
    viewAllBtn: string;
    noListingsTitle: string;
    noListingsDesc: string;
    createListingBtn: string;
    reviewLabel: string;
    soldLabel: string;
    totalLabel: string;
  };
  sellerOrderDetail: {
    backBtn: string;
    kicker: string;
    title: string;
    buyerPrefix: string;
    buyerSuffix: string;
    buyerFallback: string;
    orderSummarySrTitle: string;
    pdSectionTitle: string;
    disputeSrTitle: string;
  };
  buyerPurchases: {
    title: string;
    description: string;
    emptyTitle: string;
    emptyBody: string;
    browseCta: string;
    backBtn: string;
    orderKicker: string;
    orderTitle: string;
    orderSubtitle: string;
    nextStep: string;
    delivery: string;
    confirmSection: string;
    orderSummarySrTitle: string;
  };
  buyerNotifications: {
    title: string;
    count: string;
    emptyTitle: string;
    emptyBody: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    yesterday: string;
    daysAgo: string;
  };
  disputes: {
    reasonLabel: string;
    reasonDamaged: string;
    reasonNotAsDescribed: string;
    reasonNotReceived: string;
    reasonCounterfeit: string;
    reasonOther: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    submitBtn: string;
    submittingBtn: string;
    refundNote: string;
    backToOrder: string;
    reportTitle: string;
    reportDescription: string;
    supportKicker: string;
    supportTitle: string;
    supportBody: string;
    viewCase: string;
    existingCase: string;
    openHelp: string;
    pendingHint: string;
    paymentHint: string;
    closedHint: string;
  };
  orderSummary: {
    listingKicker: string;
    seller: string;
    buyer: string;
    viewListing: string;
    placedOn: string;
    total: string;
    item: string;
    platformFee: string;
    protectedDelivery: string;
  };
  confirmDelivery: {
    kicker: string;
    title: string;
    body: string;
    confirmBtn: string;
    processingBtn: string;
    errorFallback: string;
  };
  demoPayment: {
    kicker: string;
    title: string;
    body: string;
    payBtn: string;
    processingBtn: string;
    errorFallback: string;
  };
  adminNav: {
    overview: string;
    listings: string;
    users: string;
    orders: string;
    disputes: string;
  };
  adminOverview: {
    title: string;
    subtitle: string;
    statPending: string;
    statActiveListings: string;
    statUsers: string;
    statOrders: string;
    urgentBody: string;
    urgentAction: string;
    disputesBody: string;
    disputesAction: string;
  };
  adminListings: {
    title: string;
    subtitle: string;
    tabPending: string;
    tabActive: string;
    tabArchived: string;
    tabRejected: string;
    tabAll: string;
    emptyMsg: string;
    viewBtn: string;
    approveBtn: string;
    archiveBtn: string;
    rejectBtn: string;
    cancelBtn: string;
    rejectReasonLabel: string;
    rejectReasonPlaceholder: string;
    rejectConfirmBtn: string;
    actionFailed: string;
  };
  adminUsers: {
    title: string;
    subtitle: string;
    total: string;
    searchPlaceholder: string;
    searchBtn: string;
    clearBtn: string;
    emptyMsg: string;
    pageOf: string;
    prevPage: string;
    nextPage: string;
  };
  adminUserDetail: {
    backBtn: string;
    sellerProfileKicker: string;
    sectionListings: string;
    sectionSales: string;
    sectionIncomingOffers: string;
    sectionPurchases: string;
    sectionOutgoingOffers: string;
    emptyListings: string;
    emptySales: string;
    emptyIncomingOffers: string;
    emptyPurchases: string;
    emptyOutgoingOffers: string;
    roleTitle: string;
    roleNote: string;
  };
  userRoleActions: {
    ownerNote: string;
    setAdminBtn: string;
    removeAdminBtn: string;
    processingBtn: string;
    successMsg: string;
    demoteNote: string;
    promoteNote: string;
  };
  adminOrders: {
    title: string;
    subtitle: string;
    emptyMsg: string;
  };
  adminDisputes: {
    title: string;
    subtitle: string;
    tabAll: string;
    tabOpen: string;
    tabAwaitingSeller: string;
    tabAwaitingBuyer: string;
    tabUnderReview: string;
    tabResolvedBuyer: string;
    tabResolvedSeller: string;
    tabRefunded: string;
    tabClosed: string;
    colPhoto: string;
    colListing: string;
    colBuyer: string;
    colSeller: string;
    colReason: string;
    colStatus: string;
    colCreated: string;
    colActions: string;
    reviewBtn: string;
    noDisputes: string;
    noDisputesFiltered: string;
  };
};

export const MESSAGES: Record<AppLocale, Messages> = {
  en: {
    nav: {
      electricGuitars: "Electric Guitars",
      synthsKeyboards: "Synths & Keyboards",
      effectsPedals: "Effects & Pedals",
      proAudio: "Pro Audio",
    },
    header: {
      sell: "Sell",
      logIn: "Log in",
      join: "Join",
      searchAria: "Search",
      savedAria: "Saved",
      accountPurchases: "My purchases",
      accountSaved: "Saved",
      accountSettings: "Settings",
      accountMyListings: "My listings",
      accountAdmin: "Admin",
      accountUsers: "Users",
      roleAdmin: "Admin",
      roleSuperAdmin: "Super admin",
    },
    footer: {
      tagline: "Music gear & collectibles — buy and sell with confidence.",
      copyrightLine: "© 2026 mint. — Athens, Greece",
      company: "Company",
      legal: "Legal",
      about: "About",
      help: "Help & FAQ",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      language: "Language",
    },
    home: {
      heroKicker: "Second-hand gear marketplace",
      heroHeadline1: "Buy.",
      heroHeadline2: "Sell.",
      heroHeadline3: "Protected.",
      heroSubtitle:
        "Second-hand music gear and collectibles — with payment protection, proof photos, and tracked delivery.",
      browseGear: "Browse gear",
      startSelling: "Start selling",
      statActiveListings: "Active listings",
      statActiveShops: "Active seller shops",
      statBuyerProtection: "Buyer protection",
      boostZoneNote: "Boost zone — featured listings will appear here",
      heroRecentlyListed: "RECENTLY LISTED",
      latest: "Latest listings",
      sectionSynths: "Synths & Keyboards",
      sectionEffects: "Effects & Pedals",
      seeAll: "See all",
      listingsWhenLive: "Listings will show up here once sellers go live.",
    },
    trust: {
      protectedPayments: "Protected payments",
      paymentHeld: "Payment held",
      proofPhotos: "Proof photos",
      trackingVerified: "Tracking verified",
      disputeSupport: "Dispute support",
    },
    browse: {
      title: "Browse gear",
      pageHeading: "Gear",
      pageSubtitleMany: "{n} listings from verified sellers",
      searchPlaceholder: "Search gear, brands…",
      countOne: "1 listing",
      countMany: "{n} listings",
      emptyFilteredTitle: "No listings found",
      emptyFilteredBody: "Try adjusting your filters or browse all gear.",
      clearFilters: "Clear filters",
      emptyNoneTitle: "No listings yet",
      emptyNoneBody:
        "New gear shows up here as soon as sellers publish listings.",
      listingsSection: "Listings",
      clearAllLink: "Clear all",
      filterCategory: "Category",
      filterBrand: "Brand",
      filterCondition: "Condition",
      filterPrice: "Price",
      filterPriceDrops: "Price drops",
      filterAllCategories: "All categories",
      filterAllBrands: "All brands",
      filterAnyCondition: "Any condition",
      sortNewest: "Newest",
      sortPriceAsc: "Price: low",
      sortPriceDesc: "Price: high",
      priceAny: "Any price",
      priceUnder250: "Under €250",
      price250to500: "€250 – €500",
      price500to1000: "€500 – €1,000",
      priceOver1000: "Over €1,000",
      saveSearchCta: "Save this search",
      saveSearchSaved: "Saved search",
      saveSearchViewAlerts: "View in alerts",
      saveSearchSubtleNoFilters:
        "Add a search or filters to save this browse for later.",
      saveSearchNameLabel: "Name",
      saveSearchNotifications:
        "Email me when there are new matches (coming soon)",
      saveSearchSubmit: "Save",
      saveSearchCancel: "Cancel",
      saveSearchGuestHint: "Sign in to save searches and get alerts later.",
      saveSearchPromptText:
        "Save this search and get notified when new listings are added.",
      saveSearchPromptAction: "Save →",
    },
    sell: {
      title: "Sell gear with protection built in.",
      subtitle:
        "List your gear, accept offers, ship with proof photos and tracking, and get paid after protected delivery — all on mint.",
      newListing: "New listing",
      getStarted: "Get started",
      browseGear: "Browse gear",
      tile1h: "Protected for every sale",
      tile1t:
        "Payment is held until the buyer confirms delivery. You get paid, guaranteed.",
      tile2h: "Proof photos built in",
      tile2t:
        "Upload packaging photos before you ship. Disputes are resolved fairly with evidence.",
      tile3h: "No upfront fees",
      tile3t:
        "Listing is free. A small commission applies only when your item sells.",
      footerBuyer:
        "Create a seller profile, add payout details when you are ready, and publish listings for review — there is no fee to list.",
      footerSeller: "You are set up as a seller.",
      footerSellerTail: "to manage listings, orders, and offers.",
      openHub: "Open your seller hub",
      sellerAccessTitle: "Create a seller account to list gear",
      sellersKicker: "For sellers",
    },
    listingNotFound: {
      title: "Listing not found",
      body: "This listing may have been sold or is no longer available.",
      back: "Back to browse",
      similar: "Browse similar gear →",
    },
    dashboard: {
      seller: "Manage listings, orders, offers, and your shop in one place.",
      buyer: "Track purchases, offers, and deliveries from one place.",
      admin: "Moderation, disputes, and marketplace health.",
      sellerShopFallback: "Your shop",
      buyerAccountFallback: "Your account",
    },
    buyerNav: {
      overview: "Overview",
      purchases: "Purchases",
      offers: "Offers",
      follows: "Following",
      alerts: "Alerts",
    },
    buyerWatchlist: {
      title: "Watchlist",
      emptyTitle: "Nothing saved yet",
      emptyDescription:
        "Save gear you're interested in and come back to it later.",
      browseCta: "Browse gear",
    },
    buyerHome: {
      headline: "Your mint.",
      lead: "Purchases, offers, and buyer protection — in one calm place.",
      cardPurchasesTitle: "Purchases",
      cardPurchasesBody:
        "Orders you placed with Buy now or an accepted offer. Track delivery and proof photos.",
      cardOffersTitle: "Offers",
      cardOffersBody:
        "Negotiations on listings — counters, acceptances, and expiries stay here.",
      cardSavedTitle: "Watchlist",
      cardSavedBody:
        "Save listings while you browse — your shortlist stays here.",
      cardSavedCta: "Open watchlist",
      cardHelpTitle: "Protected delivery",
      cardHelpBody:
        "Payments can be held until tracking and photos look good. Open a case from an order if you need help.",
      cardAlertsTitle: "Saved searches",
      cardAlertsBody:
        "Keep filter combinations handy — we will add alerts when new listings match.",
    },
    buyerAlerts: {
      title: "Saved searches",
      emptyTitle: "No saved searches yet",
      emptyBody:
        "Save searches and we’ll help you spot the right gear when it appears.",
      browseCta: "Browse gear",
      viewResults: "View results",
      notificationsOn: "Notifications on",
      notificationsOff: "Notifications off",
      toggleAlertsOn: "Turn alerts on",
      toggleAlertsOff: "Turn alerts off",
      delete: "Delete",
      matchOne: "1 match",
      matchMany: "{n} matches",
      savedOnPrefix: "Saved",
    },
    sellerOrders: {
      pageTitle: "Orders",
      pageDescription:
        "When a buyer completes checkout on one of your listings, the order will appear here.",
      emptyTitle: "No orders yet",
      emptyDescription:
        "When a buyer completes checkout on one of your listings, the order will appear here.",
    },
    sellerNav: {
      overview: "Overview",
      listings: "Listings",
      newListing: "New listing",
      orders: "Orders",
      offers: "Offers",
      profile: "Profile",
    },
    sellerHub: {
      noProfileHeroTitle: "Your shop on mint.",
      noProfileHeroSubtitle:
        "Set up a seller profile to list gear with protected delivery.",
      noProfileEmptyTitle: "Complete your seller profile",
      noProfileEmptyDesc:
        "A few details unlock listings, offers, and orders — all in one place.",
      setupProfileBtn: "Set up profile",
      heroShopName: "Your shop",
      heroTitle: "Your shop",
      heroSubtitle:
        "List gear, answer offers, and ship with proof — buyers see you as a marketplace seller, not a dashboard.",
      statLive: "Live listings",
      statOffers: "Offers",
      statOrders: "Orders",
      statsFooter: "{pending} in review · {sold} sold · {total} total",
      newListingBtn: "New listing",
      allListingsBtn: "All listings",
      ordersBtn: "Orders",
      offersBtn: "Offers",
      profileBtn: "Profile",
      editProfileBtn: "Edit profile",
      onShelfTitle: "On the shelf",
      viewAllBtn: "View all",
      noListingsTitle: "No listings yet",
      noListingsDesc:
        "Publish your first piece of gear — photos up front help it sell.",
      createListingBtn: "Create listing",
      reviewLabel: "in review",
      soldLabel: "sold",
      totalLabel: "total",
    },
    sellerOrderDetail: {
      backBtn: "← Orders",
      kicker: "Sale",
      title: "Ship with proof",
      buyerPrefix: "Buyer",
      buyerSuffix: "— add photos and tracking to release payment.",
      buyerFallback: "Buyer",
      orderSummarySrTitle: "Order summary",
      pdSectionTitle: "Ship with Protected Delivery",
      disputeSrTitle: "Dispute",
    },
    buyerPurchases: {
      title: "Purchases",
      description:
        "Gear you bought on mint — track delivery, proof photos, and buyer protection.",
      emptyTitle: "No purchases yet",
      emptyBody: "Your completed purchases will appear here.",
      browseCta: "Browse listings",
      backBtn: "← Purchases",
      orderKicker: "Your order",
      orderTitle: "Tracking & Protection",
      orderSubtitle: "Photos, tracking, and help on this page.",
      nextStep: "Next step",
      delivery: "Delivery",
      confirmSection: "Confirm receipt",
      orderSummarySrTitle: "Order summary",
    },
    buyerNotifications: {
      title: "Notifications",
      count: "{n} notifications",
      emptyTitle: "All quiet",
      emptyBody:
        "We'll notify you about price drops, offers, and order updates.",
      justNow: "Just now",
      minutesAgo: "{n} min ago",
      hoursAgo: "{n} h ago",
      yesterday: "Yesterday",
      daysAgo: "{n} days ago",
    },
    disputes: {
      reasonLabel: "Reason",
      reasonDamaged: "Damaged",
      reasonNotAsDescribed: "Not as described",
      reasonNotReceived: "Not received",
      reasonCounterfeit: "Counterfeit",
      reasonOther: "Other",
      descriptionLabel: "What happened?",
      descriptionPlaceholder: "At least {n} characters…",
      submitBtn: "Submit dispute",
      submittingBtn: "Submitting…",
      refundNote:
        "Refunds are placeholder only — no money moves until Stripe is integrated.",
      backToOrder: "← Back to order",
      reportTitle: "Report an issue",
      reportDescription:
        "Describe the problem and attach photos or documents. This opens a dispute and pauses the order for review.",
      supportKicker: "Support",
      supportTitle: "Help with this order",
      supportBody:
        "Something went wrong? mint reviews photos and tracking for a fair resolution.",
      viewCase: "View case",
      existingCase: "You have a case on record",
      openHelp: "Help with this order",
      pendingHint:
        "Help is available after payment and shipping are complete.",
      paymentHint:
        "Complete payment so funds can be held — then you can reach out if needed.",
      closedHint: "This order is closed — help is not available.",
    },
    orderSummary: {
      listingKicker: "Listing",
      seller: "Seller",
      buyer: "Buyer",
      viewListing: "View listing",
      placedOn: "Placed",
      total: "Total",
      item: "Item",
      platformFee: "Platform fee",
      protectedDelivery: "Protected delivery",
    },
    confirmDelivery: {
      kicker: "Confirm receipt",
      title: "Did your gear arrive?",
      body: "Confirm that the gear arrived and is in the expected condition. Payment is automatically released to the seller once you confirm.",
      confirmBtn: "Confirm delivery",
      processingBtn: "Processing…",
      errorFallback: "Something went wrong.",
    },
    demoPayment: {
      kicker: "Checkout",
      title: "Demo payment",
      body: "Simulates a successful payment and fund hold. Stripe will replace this later — nothing is charged in production.",
      payBtn: "Mark as paid (demo)",
      processingBtn: "Processing…",
      errorFallback: "Could not update.",
    },
    adminNav: {
      overview: "Overview",
      listings: "Listings",
      users: "Users",
      orders: "Orders",
      disputes: "Disputes",
    },
    adminOverview: {
      title: "Overview",
      subtitle: "mint marketplace status",
      statPending: "Pending approval",
      statActiveListings: "Active listings",
      statUsers: "Users",
      statOrders: "Orders",
      urgentBody: "{n} listings waiting for your approval.",
      urgentAction: "Review listings →",
      disputesBody: "{n} open disputes need attention.",
      disputesAction: "View disputes →",
    },
    adminListings: {
      title: "Listings",
      subtitle: "Review and approve new listings before they appear on the marketplace.",
      tabPending: "Pending review",
      tabActive: "Active",
      tabArchived: "Archived",
      tabRejected: "Rejected",
      tabAll: "All",
      emptyMsg: "No listings in this category.",
      viewBtn: "View",
      approveBtn: "Approve",
      archiveBtn: "Archive",
      rejectBtn: "Reject",
      cancelBtn: "Cancel",
      rejectReasonLabel: "Reason (optional)",
      rejectReasonPlaceholder: "Rejection reason",
      rejectConfirmBtn: "Confirm rejection",
      actionFailed: "Action failed.",
    },
    adminUsers: {
      title: "Users",
      subtitle: "Manage roles and access.",
      total: "{n} total.",
      searchPlaceholder: "Search by name or email…",
      searchBtn: "Search",
      clearBtn: "Clear",
      emptyMsg: "No users found.",
      pageOf: "Page {page} of {total}",
      prevPage: "← Previous",
      nextPage: "Next →",
    },
    adminUserDetail: {
      backBtn: "← Users",
      sellerProfileKicker: "Seller profile",
      sectionListings: "Listings",
      sectionSales: "Sales",
      sectionIncomingOffers: "Incoming offers",
      sectionPurchases: "Purchases",
      sectionOutgoingOffers: "Sent offers",
      emptyListings: "No listings.",
      emptySales: "No sales.",
      emptyIncomingOffers: "No offers.",
      emptyPurchases: "No purchases.",
      emptyOutgoingOffers: "No sent offers.",
      roleTitle: "Role management",
      roleNote: "Only the owner can change roles.",
    },
    userRoleActions: {
      ownerNote: "The owner cannot change role.",
      setAdminBtn: "Make Admin",
      removeAdminBtn: "Remove Admin",
      processingBtn: "Processing…",
      successMsg: "Role updated.",
      demoteNote: "Removing admin will revert the user to seller.",
      promoteNote: "The user will gain access to the admin panel.",
    },
    adminOrders: {
      title: "Orders",
      subtitle: "All marketplace orders — adjust status for support.",
      emptyMsg: "No orders yet.",
    },
    adminDisputes: {
      title: "Disputes",
      subtitle: "Manage buyer-seller disputes and reports.",
      tabAll: "All",
      tabOpen: "Open",
      tabAwaitingSeller: "Awaiting seller",
      tabAwaitingBuyer: "Awaiting buyer",
      tabUnderReview: "Under review",
      tabResolvedBuyer: "Resolved (buyer)",
      tabResolvedSeller: "Resolved (seller)",
      tabRefunded: "Refunded",
      tabClosed: "Closed",
      colPhoto: "Photo",
      colListing: "Listing",
      colBuyer: "Buyer",
      colSeller: "Seller",
      colReason: "Reason",
      colStatus: "Status",
      colCreated: "Created",
      colActions: "Actions",
      reviewBtn: "Review",
      noDisputes: "No disputes.",
      noDisputesFiltered: "No disputes in this category.",
    },
  },
  el: {
    nav: {
      electricGuitars: "Ηλεκτρικές κιθάρες",
      synthsKeyboards: "Συνθεσάιζερ & πλήκτρα",
      effectsPedals: "Εφέ & πετάλια",
      proAudio: "Επαγγελματικός ήχος",
    },
    header: {
      sell: "Πώληση",
      logIn: "Σύνδεση",
      join: "Εγγραφή",
      searchAria: "Αναζήτηση",
      savedAria: "Αποθηκευμένα",
      accountPurchases: "Αγορές μου",
      accountSaved: "Αποθηκευμένα",
      accountSettings: "Ρυθμίσεις",
      accountMyListings: "Αγγελίες μου",
      accountAdmin: "Admin",
      accountUsers: "Χρήστες",
      roleAdmin: "Admin",
      roleSuperAdmin: "Super Admin",
    },
    footer: {
      tagline:
        "Μουσικός εξοπλισμός & συλλεκτικά — αγορά και πώληση με ασφάλεια.",
      copyrightLine: "© 2026 mint. — Αθήνα, Ελλάδα",
      company: "Εταιρεία",
      legal: "Νομικά",
      about: "Σχετικά",
      help: "Βοήθεια & FAQ",
      contact: "Επικοινωνία",
      privacy: "Πολιτική απορρήτου",
      terms: "Όροι χρήσης",
      language: "Γλώσσα",
    },
    home: {
      heroKicker: "Αγορά μεταχειρισμένου εξοπλισμού",
      heroHeadline1: "Αγόρασε.",
      heroHeadline2: "Πούλησε.",
      heroHeadline3: "Προστατευμένα.",
      heroSubtitle:
        "Μεταχειρισμένος μουσικός εξοπλισμός και συλλεκτικά — με προστασία πληρωμής, φωτογραφίες απόδειξης και ιχνηλάτηση αποστολής.",
      browseGear: "Δες αγγελίες",
      startSelling: "Ξεκίνα πωλήσεις",
      statActiveListings: "Ενεργές αγγελίες",
      statActiveShops: "Ενεργά καταστήματα πωλητών",
      statBuyerProtection: "Προστασία αγοραστή",
      boostZoneNote: "Ζώνη boost — εδώ θα εμφανίζονται προβεβλημένες αγγελίες",
      heroRecentlyListed: "ΠΡΟΣΦΑΤΕΣ ΑΓΓΕΛΙΕΣ",
      latest: "Νέες αγγελίες",
      sectionSynths: "Συνθεσάιζερ & πλήκτρα",
      sectionEffects: "Εφέ & πετάλια",
      seeAll: "Όλες",
      listingsWhenLive:
        "Οι αγγελίες θα εμφανίζονται εδώ μόλις οι πωλητές ξεκινήσουν.",
    },
    trust: {
      protectedPayments: "Προστατευμένες πληρωμές",
      paymentHeld: "Ασφαλής πληρωμή",
      proofPhotos: "Ασφαλής παράδοση",
      trackingVerified: "Παρακολούθηση αποστολής",
      disputeSupport: "Υποστήριξη διαφορών",
    },
    browse: {
      title: "Αναζήτηση εξοπλισμού",
      pageHeading: "Εξοπλισμός",
      pageSubtitleMany: "{n} αγγελίες από επαληθευμένους πωλητές",
      searchPlaceholder: "Αναζήτησε εξοπλισμό, μάρκες...",
      countOne: "1 αγγελία",
      countMany: "{n} αγγελίες",
      emptyFilteredTitle: "Δεν βρέθηκαν αγγελίες",
      emptyFilteredBody: "Δοκίμασε άλλα φίλτρα ή δες όλον τον εξοπλισμό.",
      clearFilters: "Καθαρισμός φίλτρων",
      emptyNoneTitle: "Δεν υπάρχουν αγγελίες ακόμη",
      emptyNoneBody:
        "Νέες αγγελίες εμφανίζονται εδώ μόλις τις δημοσιεύσουν οι πωλητές.",
      listingsSection: "Αγγελίες",
      clearAllLink: "Καθαρισμός",
      filterCategory: "Κατηγορία",
      filterBrand: "Μάρκα",
      filterCondition: "Κατάσταση",
      filterPrice: "Τιμή",
      filterPriceDrops: "Μειώσεις τιμής",
      filterAllCategories: "Όλες οι κατηγορίες",
      filterAllBrands: "Όλες οι μάρκες",
      filterAnyCondition: "Οποιαδήποτε",
      sortNewest: "Νεότερα",
      sortPriceAsc: "Τιμή: χαμηλά",
      sortPriceDesc: "Τιμή: ψηλά",
      priceAny: "Οποιαδήποτε τιμή",
      priceUnder250: "Κάτω από €250",
      price250to500: "€250 – €500",
      price500to1000: "€500 – €1.000",
      priceOver1000: "Πάνω από €1.000",
      saveSearchCta: "Αποθήκευση αναζήτησης",
      saveSearchSaved: "Αποθηκευμένη αναζήτηση",
      saveSearchViewAlerts: "Δες στις ειδοποιήσεις",
      saveSearchSubtleNoFilters:
        "Πρόσθεσε όρους ή φίλτρα για να αποθηκεύσεις αυτή την αναζήτηση.",
      saveSearchNameLabel: "Όνομα",
      saveSearchNotifications:
        "Στείλε email όταν υπάρχουν νέα αποτελέσματα (σύντομα)",
      saveSearchSubmit: "Αποθήκευση",
      saveSearchCancel: "Ακύρωση",
      saveSearchGuestHint:
        "Συνδέσου για να αποθηκεύεις αναζητήσεις και ειδοποιήσεις.",
      saveSearchPromptText:
        "Αποθήκευσε αυτή την αναζήτηση και ειδοποιήσου όταν προστεθούν νέες αγγελίες.",
      saveSearchPromptAction: "Αποθήκευση →",
    },
    sell: {
      title: "Πούλησε εξοπλισμό με ενσωματωμένη προστασία.",
      subtitle:
        "Ανάρτησε αγγελίες, δέξου προσφορές, στείλε με αποδείξεις και tracking, και πληρώσου μετά την προστατευμένη παράδοση — όλα στο mint.",
      newListing: "Νέα αγγελία",
      getStarted: "Ξεκίνα",
      browseGear: "Δες αγγελίες",
      tile1h: "Προστασία σε κάθε πώληση",
      tile1t:
        "Η πληρωμή δεσμεύεται μέχρι να επιβεβαιωθεί η παράδοση. Πληρώνεσαι, εγγυημένα.",
      tile2h: "Αποδεικτικές φωτογραφίες",
      tile2t:
        "Ανέβασε φωτογραφίες συσκευασίας πριν την αποστολή. Οι διαφορές λύνονται δίκαια με αποδείξεις.",
      tile3h: "Χωρίς προκαταβολή",
      tile3t: "Η καταχώριση είναι δωρεάν. Μικρή προμήθεια μόνο όταν πουλήσεις.",
      footerBuyer:
        "Δημιούργησε προφίλ πωλητή, πρόσθεσε στοιχεία πληρωμής όταν είσαι έτοιμος και δημοσίευσε αγγελίες για έλεγχο — χωρίς χρέωση καταχώρισης.",
      footerSeller: "Έχεις ενεργό προφίλ πωλητή.",
      footerSellerTail:
        "για να διαχειρίζεσαι αγγελίες, παραγγελίες και προσφορές.",
      openHub: "Άνοιξε το κέντρο πωλητή",
      sellerAccessTitle:
        "Δημιούργησε λογαριασμό πωλητή για να αναρτήσεις αγγελίες",
      sellersKicker: "ΓΙΑ ΠΩΛΗΤΕΣ",
    },
    listingNotFound: {
      title: "Η αγγελία δεν βρέθηκε",
      body: "Η αγγελία μπορεί να πωλήθηκε ή να μην είναι πλέον διαθέσιμη.",
      back: "Πίσω στην αναζήτηση",
      similar: "Παρόμοιος εξοπλισμός →",
    },
    dashboard: {
      seller:
        "Διαχείριση αγγελιών, παραγγελιών, προσφορών και του καταστήματός σου σε ένα μέρος.",
      buyer: "Παρακολούθηση αγορών, προσφορών και παραδόσεων από ένα μέρος.",
      admin: "Συντονισμός, διαφορές και υγεία της αγοράς.",
      sellerShopFallback: "Το κατάστημά σου",
      buyerAccountFallback: "Ο λογαριασμός σου",
    },
    buyerNav: {
      overview: "Επισκόπηση",
      purchases: "Αγορές",
      offers: "Προσφορές",
      follows: "Ακολουθώ",
      alerts: "Ειδοποιήσεις",
    },
    buyerWatchlist: {
      title: "Αποθηκευμένα",
      emptyTitle: "Δεν έχεις αποθηκεύσει ακόμη",
      emptyDescription:
        "Αποθήκευσε αγγελίες που σε ενδιαφέρουν και επέστρεψε αργότερα.",
      browseCta: "Περιήγηση",
    },
    buyerHome: {
      headline: "Το mint. σου.",
      lead: "Αγορές, προσφορές και προστασία αγοραστή — σε ένα ήρεμο μέρος.",
      cardPurchasesTitle: "Αγορές",
      cardPurchasesBody:
        "Παραγγελίες με Άμεση αγορά ή αποδεκτή προσφορά. Παρακολούθησε παράδοση με αποδεικτικές φωτογραφίες.",
      cardOffersTitle: "Προσφορές",
      cardOffersBody:
        "Διαπραγματεύσεις σε αγγελίες — αντιπροσφορές, αποδοχές και λήξεις μένουν εδώ.",
      cardSavedTitle: "Αποθηκευμένα",
      cardSavedBody:
        "Αποθήκευσε αγγελίες ενώ περιηγείσαι — η λίστα σου μένει εδώ.",
      cardSavedCta: "Άνοιξε τα αποθηκευμένα",
      cardHelpTitle: "Προστατευμένη παράδοση",
      cardHelpBody:
        "Οι πληρωμές μπορεί να κρατούνται μέχρι το tracking και οι φωτογραφίες να είναι εντάξει. Άνοιξε υπόθεση από την παραγγελία αν χρειάζεσαι βοήθεια.",
      cardAlertsTitle: "Αποθηκευμένες αναζητήσεις",
      cardAlertsBody:
        "Κράτα συνδυασμούς φίλτρων — θα προσθέσουμε ειδοποιήσεις όταν εμφανίζονται νέες αγγελίες.",
    },
    buyerAlerts: {
      title: "Αποθηκευμένες αναζητήσεις",
      emptyTitle: "Δεν έχεις αποθηκευμένες αναζητήσεις",
      emptyBody:
        "Αποθήκευσε αναζητήσεις και θα σε βοηθήσουμε να εντοπίσεις τον κατάλληλο εξοπλισμό όταν εμφανίζεται.",
      browseCta: "Περιήγηση",
      viewResults: "Αποτελέσματα",
      notificationsOn: "Ειδοποιήσεις ενεργές",
      notificationsOff: "Ειδοποιήσεις ανενεργές",
      toggleAlertsOn: "Ενεργοποίηση ειδοποιήσεων",
      toggleAlertsOff: "Απενεργοποίηση ειδοποιήσεων",
      delete: "Διαγραφή",
      matchOne: "1 ταίριασμα",
      matchMany: "{n} ταιριάσματα",
      savedOnPrefix: "Αποθηκεύτηκε",
    },
    sellerOrders: {
      pageTitle: "Παραγγελίες",
      pageDescription:
        "Παραγγελίες που εκτελείς — στείλε με αποδείξεις για εμπιστοσύνη.",
      emptyTitle: "Δεν υπάρχουν παραγγελίες ακόμη",
      emptyDescription:
        "Όταν ένας αγοραστής ολοκληρώσει την πληρωμή για μια αγγελία σου, η παραγγελία θα εμφανιστεί εδώ.",
    },
    sellerNav: {
      overview: "Επισκόπηση",
      listings: "Αγγελίες",
      newListing: "Νέα αγγελία",
      orders: "Παραγγελίες",
      offers: "Προσφορές",
      profile: "Προφίλ",
    },
    sellerHub: {
      noProfileHeroTitle: "Το κατάστημά σου στο mint.",
      noProfileHeroSubtitle:
        "Δημιούργησε προφίλ πωλητή για να αναρτήσεις gear με προστατευμένη παράδοση.",
      noProfileEmptyTitle: "Συμπλήρωσε το προφίλ πωλητή",
      noProfileEmptyDesc:
        "Λίγες λεπτομέρειες ξεκλειδώνουν αγγελίες, προσφορές και παραγγελίες — όλα σε ένα μέρος.",
      setupProfileBtn: "Δημιουργία προφίλ",
      heroShopName: "Το κατάστημά σου",
      heroTitle: "Το κατάστημά σου",
      heroSubtitle:
        "Ανάρτησε gear, απάντησε σε προσφορές και στείλε με αποδείξεις — οι αγοραστές σε βλέπουν ως πωλητή αγοράς.",
      statLive: "Ενεργές αγγελίες",
      statOffers: "Προσφορές",
      statOrders: "Παραγγελίες",
      statsFooter: "{pending} υπό έγκριση · {sold} πουλήθηκαν · {total} συνολικά",
      newListingBtn: "Νέα αγγελία",
      allListingsBtn: "Όλες οι αγγελίες",
      ordersBtn: "Παραγγελίες",
      offersBtn: "Προσφορές",
      profileBtn: "Προφίλ",
      editProfileBtn: "Επεξεργασία προφίλ",
      onShelfTitle: "Στο ράφι",
      viewAllBtn: "Όλες",
      noListingsTitle: "Δεν υπάρχουν αγγελίες ακόμη",
      noListingsDesc:
        "Δημοσίευσε το πρώτο σου gear — οι φωτογραφίες μπροστά βοηθούν στις πωλήσεις.",
      createListingBtn: "Δημιουργία αγγελίας",
      reviewLabel: "υπό έγκριση",
      soldLabel: "πουλήθηκαν",
      totalLabel: "συνολικά",
    },
    sellerOrderDetail: {
      backBtn: "← Παραγγελίες",
      kicker: "Πώληση",
      title: "Αποστολή με απόδειξη",
      buyerPrefix: "Αγοραστής",
      buyerSuffix: "— πρόσθεσε φωτογραφίες και tracking για να αποδεσμευτεί η πληρωμή.",
      buyerFallback: "Αγοραστής",
      orderSummarySrTitle: "Σύνοψη παραγγελίας",
      pdSectionTitle: "Αποστολή με Protected Delivery",
      disputeSrTitle: "Υπόθεση",
    },
    buyerPurchases: {
      title: "Αγορές",
      description:
        "Gear που αγόρασες στο mint — παρακολούθηση παράδοσης, φωτογραφίες απόδειξης και αγοραστική προστασία.",
      emptyTitle: "Καμία αγορά ακόμη",
      emptyBody: "Οι ολοκληρωμένες αγορές σου θα εμφανίζονται εδώ.",
      browseCta: "Αναζήτηση αγγελιών",
      backBtn: "← Αγορές",
      orderKicker: "Η παραγγελία σου",
      orderTitle: "Παρακολούθηση & Προστασία",
      orderSubtitle: "Φωτογραφίες, tracking και βοήθεια σε αυτή τη σελίδα.",
      nextStep: "Επόμενο βήμα",
      delivery: "Παράδοση",
      confirmSection: "Επιβεβαίωσε παραλαβή",
      orderSummarySrTitle: "Σύνοψη παραγγελίας",
    },
    buyerNotifications: {
      title: "Ειδοποιήσεις",
      count: "{n} ειδοποιήσεις",
      emptyTitle: "Όλα ήσυχα",
      emptyBody:
        "Θα σε ειδοποιήσουμε για πτώσεις τιμών, προσφορές και ενημερώσεις παραγγελιών.",
      justNow: "Μόλις τώρα",
      minutesAgo: "{n} λεπτά πριν",
      hoursAgo: "{n} ώρες πριν",
      yesterday: "Χθες",
      daysAgo: "{n} μέρες πριν",
    },
    disputes: {
      reasonLabel: "Αιτία",
      reasonDamaged: "Κατεστραμμένο",
      reasonNotAsDescribed: "Δεν αντιστοιχεί στην περιγραφή",
      reasonNotReceived: "Δεν παρελήφθη",
      reasonCounterfeit: "Παραποιημένο",
      reasonOther: "Άλλο",
      descriptionLabel: "Τι συνέβη;",
      descriptionPlaceholder: "Τουλάχιστον {n} χαρακτήρες…",
      submitBtn: "Υποβολή καταγγελίας",
      submittingBtn: "Υποβολή…",
      refundNote:
        "Οι επιστροφές χρημάτων είναι ενδεικτικές — δεν πραγματοποιείται καμία κίνηση χρημάτων έως ότου ενεργοποιηθεί το Stripe.",
      backToOrder: "← Πίσω στην παραγγελία",
      reportTitle: "Αναφορά προβλήματος",
      reportDescription:
        "Περιέγραψε το πρόβλημα και επισύναψε φωτογραφίες ή έγγραφα. Αυτό ανοίγει διαφορά και παγώνει την παραγγελία για έλεγχο.",
      supportKicker: "Υποστήριξη",
      supportTitle: "Βοήθεια για αυτή την παραγγελία",
      supportBody:
        "Κάτι δεν πήγε καλά; Η mint ελέγχει τις φωτογραφίες και το tracking για δίκαιη επίλυση.",
      viewCase: "Δες υπόθεση",
      existingCase: "Έχεις υπόθεση καταχωρημένη",
      openHelp: "Βοήθεια για αυτή την παραγγελία",
      pendingHint:
        "Η βοήθεια είναι διαθέσιμη μετά την ολοκλήρωση πληρωμής και αποστολής.",
      paymentHint:
        "Ολοκλήρωσε την πληρωμή για να μπορεί να δεσμευτεί το ποσό — τότε μπορείς να επικοινωνήσεις αν χρειαστεί.",
      closedHint: "Αυτή η παραγγελία είναι κλειστή — η βοήθεια δεν είναι διαθέσιμη.",
    },
    orderSummary: {
      listingKicker: "Αγγελία",
      seller: "Πωλητής",
      buyer: "Αγοραστής",
      viewListing: "Δες αγγελία",
      placedOn: "Τοποθετήθηκε",
      total: "Σύνολο",
      item: "Αντικείμενο",
      platformFee: "Προμήθεια πλατφόρμας",
      protectedDelivery: "Προστατευμένη παράδοση",
    },
    confirmDelivery: {
      kicker: "Επιβεβαίωση παραλαβής",
      title: "Έλαβες το gear;",
      body: "Επιβεβαίωσε ότι το gear έφτασε και είναι στην αναμενόμενη κατάσταση. Η πληρωμή αποδεσμεύεται αυτόματα στον πωλητή μόλις επιβεβαιώσεις.",
      confirmBtn: "Επιβεβαίωσε Παραλαβή",
      processingBtn: "Επεξεργασία…",
      errorFallback: "Κάτι πήγε στραβά.",
    },
    demoPayment: {
      kicker: "Ολοκλήρωση αγοράς",
      title: "Demo πληρωμή",
      body: "Προσομοιώνει επιτυχημένη πληρωμή και δέσμευση κεφαλαίων. Το Stripe θα αντικαταστήσει αυτό αργότερα — δεν χρεώνεται τίποτα σε production.",
      payBtn: "Επισήμανση ως πληρωμένο (demo)",
      processingBtn: "Επεξεργασία…",
      errorFallback: "Δεν ήταν δυνατή η ενημέρωση.",
    },
    adminNav: {
      overview: "Επισκόπηση",
      listings: "Αγγελίες",
      users: "Χρήστες",
      orders: "Παραγγελίες",
      disputes: "Διαφορές",
    },
    adminOverview: {
      title: "Επισκόπηση",
      subtitle: "Κατάσταση αγοράς mint",
      statPending: "Αναμένουν έγκριση",
      statActiveListings: "Ενεργές αγγελίες",
      statUsers: "Χρήστες",
      statOrders: "Παραγγελίες",
      urgentBody: "{n} αγγελίες περιμένουν έγκριση.",
      urgentAction: "Έλεγχος αγγελιών →",
      disputesBody: "{n} ανοιχτές διαφορές χρειάζονται προσοχή.",
      disputesAction: "Δες διαφορές →",
    },
    adminListings: {
      title: "Αγγελίες",
      subtitle: "Έλεγξε και έγκρινε νέες αγγελίες πριν εμφανιστούν στην αγορά.",
      tabPending: "Προς έγκριση",
      tabActive: "Ενεργές",
      tabArchived: "Αρχειοθετημένες",
      tabRejected: "Απορριφθείσες",
      tabAll: "Όλες",
      emptyMsg: "Δεν υπάρχουν αγγελίες σε αυτή την κατηγορία.",
      viewBtn: "Προβολή",
      approveBtn: "Έγκριση",
      archiveBtn: "Αρχειοθέτηση",
      rejectBtn: "Απόρριψη",
      cancelBtn: "Ακύρωση",
      rejectReasonLabel: "Αιτιολογία (προαιρετικά)",
      rejectReasonPlaceholder: "Λόγος απόρριψης",
      rejectConfirmBtn: "Επιβεβαίωση απόρριψης",
      actionFailed: "Η ενέργεια απέτυχε.",
    },
    adminUsers: {
      title: "Χρήστες",
      subtitle: "Διαχείριση ρόλων και πρόσβασης.",
      total: "{n} συνολικά.",
      searchPlaceholder: "Αναζήτηση με όνομα ή email...",
      searchBtn: "Αναζήτηση",
      clearBtn: "Καθαρισμός",
      emptyMsg: "Δεν βρέθηκαν χρήστες.",
      pageOf: "Σελίδα {page} από {total}",
      prevPage: "← Προηγούμενη",
      nextPage: "Επόμενη →",
    },
    adminUserDetail: {
      backBtn: "← Χρήστες",
      sellerProfileKicker: "Προφίλ πωλητή",
      sectionListings: "Αγγελίες",
      sectionSales: "Πωλήσεις",
      sectionIncomingOffers: "Εισερχόμενες προσφορές",
      sectionPurchases: "Αγορές",
      sectionOutgoingOffers: "Αποσταλμένες προσφορές",
      emptyListings: "Δεν υπάρχουν αγγελίες.",
      emptySales: "Δεν υπάρχουν πωλήσεις.",
      emptyIncomingOffers: "Δεν υπάρχουν προσφορές.",
      emptyPurchases: "Δεν υπάρχουν αγορές.",
      emptyOutgoingOffers: "Δεν υπάρχουν αποσταλμένες προσφορές.",
      roleTitle: "Διαχείριση ρόλου",
      roleNote: "Μόνο ο ιδιοκτήτης μπορεί να αλλάξει ρόλους.",
    },
    userRoleActions: {
      ownerNote: "Ο ιδιοκτήτης δεν μπορεί να αλλάξει ρόλο.",
      setAdminBtn: "Ορισμός Admin",
      removeAdminBtn: "Αφαίρεση Admin",
      processingBtn: "Επεξεργασία…",
      successMsg: "Ο ρόλος ενημερώθηκε.",
      demoteNote: "Η αφαίρεση θα επαναφέρει τον χρήστη στον ρόλο πωλητή.",
      promoteNote: "Ο χρήστης θα αποκτήσει πρόσβαση στο admin panel.",
    },
    adminOrders: {
      title: "Παραγγελίες",
      subtitle: "Όλες οι παραγγελίες της αγοράς — ρύθμιση κατάστασης για υποστήριξη.",
      emptyMsg: "Δεν υπάρχουν παραγγελίες ακόμη.",
    },
    adminDisputes: {
      title: "Διαφορές",
      subtitle: "Διαχείριση αναφορών και διαφορών αγοραστών-πωλητών.",
      tabAll: "Όλες",
      tabOpen: "Ανοιχτές",
      tabAwaitingSeller: "Αναμένει πωλητή",
      tabAwaitingBuyer: "Αναμένει αγοραστή",
      tabUnderReview: "Υπό εξέταση",
      tabResolvedBuyer: "Επιλύθηκε (αγοραστής)",
      tabResolvedSeller: "Επιλύθηκε (πωλητής)",
      tabRefunded: "Επιστροφή χρημάτων",
      tabClosed: "Κλειστή",
      colPhoto: "Φωτογραφία",
      colListing: "Αγγελία",
      colBuyer: "Αγοραστής",
      colSeller: "Πωλητής",
      colReason: "Αιτία",
      colStatus: "Κατάσταση",
      colCreated: "Ημερομηνία",
      colActions: "Ενέργειες",
      reviewBtn: "Αξιολόγηση",
      noDisputes: "Δεν υπάρχουν διαφορές.",
      noDisputesFiltered: "Δεν υπάρχουν διαφορές σε αυτή την κατηγορία.",
    },
  },
};
