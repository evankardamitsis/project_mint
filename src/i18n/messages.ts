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
    watchlist: string;
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
      watchlist: "Watchlist",
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
      watchlist: "Αποθηκευμένα",
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
  },
};
