export type AppLocale = "en" | "el";

export type Messages = {
  nav: {
    electricGuitars: string;
    synthsKeyboards: string;
    effectsPedals: string;
    proAudio: string;
  };
  header: { sell: string; logIn: string; join: string; searchAria: string; savedAria: string };
  footer: {
    tagline: string;
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
    heroLine1: string;
    heroLine2: string;
    heroSubtitle: string;
    browseGear: string;
    startSelling: string;
    latest: string;
    seeAll: string;
    listingsWhenLive: string;
  };
  trust: {
    protectedPayments: string;
    paymentHeld: string;
    sellerProof: string;
    trackingVerified: string;
    disputeSupport: string;
  };
  browse: {
    title: string;
    countOne: string;
    countMany: string;
    emptyFilteredTitle: string;
    emptyFilteredBody: string;
    clearFilters: string;
    emptyNoneTitle: string;
    emptyNoneBody: string;
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
  buyerHome: { title: string; lead: string; emptyDescription: string };
  sellerOrders: { pageTitle: string; pageDescription: string; emptyTitle: string; emptyDescription: string };
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
    },
    footer: {
      tagline: "Music gear & collectibles — buy and sell with confidence.",
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
      heroLine1: "Buy and sell",
      heroLine2: "protected gear.",
      heroSubtitle:
        "Second-hand music gear and collectibles — with payment protection, proof photos, and tracked delivery.",
      browseGear: "Browse gear",
      startSelling: "Start selling",
      latest: "Latest listings",
      seeAll: "See all",
      listingsWhenLive: "Listings will show up here once sellers go live.",
    },
    trust: {
      protectedPayments: "Protected payments",
      paymentHeld: "Payment held",
      sellerProof: "Seller uploads proof",
      trackingVerified: "Tracking verified",
      disputeSupport: "Dispute support",
    },
    browse: {
      title: "Browse gear",
      countOne: "1 listing",
      countMany: "{n} listings",
      emptyFilteredTitle: "No listings found",
      emptyFilteredBody: "Try adjusting your filters or browse all gear.",
      clearFilters: "Clear filters",
      emptyNoneTitle: "No listings yet",
      emptyNoneBody: "New gear shows up here as soon as sellers publish listings.",
    },
    sell: {
      title: "Sell on mint.",
      subtitle:
        "List second-hand gear with optional protected delivery: packaging checklist, photos, tracking, and a buyer dispute window after delivery.",
      newListing: "New listing",
      getStarted: "Get started",
      browseGear: "Browse gear",
      tile1h: "Protected for every sale",
      tile1t: "Payment is held until the buyer confirms delivery. You get paid, guaranteed.",
      tile2h: "Proof photos built in",
      tile2t: "Upload packaging photos before you ship. Disputes are resolved fairly with evidence.",
      tile3h: "No upfront fees",
      tile3t: "Listing is free. A small commission applies only when your item sells.",
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
    buyerHome: {
      title: "Buyer overview",
      lead: "Track purchases, offers, and any protected-delivery disputes from one place.",
      emptyDescription: "You haven't made any purchases yet. Browse gear to find something you love.",
    },
    sellerOrders: {
      pageTitle: "Orders",
      pageDescription: "When a buyer completes checkout on one of your listings, the order will appear here.",
      emptyTitle: "No orders yet",
      emptyDescription: "When a buyer completes checkout on one of your listings, the order will appear here.",
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
    },
    footer: {
      tagline: "Μουσικός εξοπλισμός & συλλεκτικά — αγορά και πώληση με ασφάλεια.",
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
      heroLine1: "Αγόρασε και πούλησε",
      heroLine2: "με προστασία.",
      heroSubtitle:
        "Μεταχειρισμένος μουσικός εξοπλισμός και συλλεκτικά — με προστασία πληρωμής, φωτογραφίες απόδειξης και ιχνηλάτηση αποστολής.",
      browseGear: "Δες αγγελίες",
      startSelling: "Ξεκίνα πωλήσεις",
      latest: "Νέες αγγελίες",
      seeAll: "Όλες",
      listingsWhenLive: "Οι αγγελίες θα εμφανίζονται εδώ μόλις οι πωλητές ξεκινήσουν.",
    },
    trust: {
      protectedPayments: "Προστατευμένες πληρωμές",
      paymentHeld: "Κράτηση πληρωμής",
      sellerProof: "Αποδεικτικά από τον πωλητή",
      trackingVerified: "Επιβεβαίωση αποστολής",
      disputeSupport: "Υποστήριξη διαφορών",
    },
    browse: {
      title: "Αναζήτηση εξοπλισμού",
      countOne: "1 αγγελία",
      countMany: "{n} αγγελίες",
      emptyFilteredTitle: "Δεν βρέθηκαν αγγελίες",
      emptyFilteredBody: "Δοκίμασε άλλα φίλτρα ή δες όλον τον εξοπλισμό.",
      clearFilters: "Καθαρισμός φίλτρων",
      emptyNoneTitle: "Δεν υπάρχουν αγγελίες ακόμη",
      emptyNoneBody: "Νέες αγγελίες εμφανίζονται εδώ μόλις τις δημοσιεύσουν οι πωλητές.",
    },
    sell: {
      title: "Πούλησε στο mint.",
      subtitle:
        "Δημοσίευσε μεταχειρισμένο εξοπλισμό με προαιρετική προστατευμένη παράδοση: checklist συσκευασίας, φωτογραφίες, tracking και παράθυρο διαφοράς μετά την παράδοση.",
      newListing: "Νέα αγγελία",
      getStarted: "Ξεκίνα",
      browseGear: "Δες αγγελίες",
      tile1h: "Προστασία σε κάθε πώληση",
      tile1t: "Η πληρωμή κρατείται μέχρι ο αγοραστής να επιβεβαιώσει την παράδοση. Πληρώνεσαι, εγγυημένα.",
      tile2h: "Φωτογραφίες απόδειξης",
      tile2t: "Ανέβασε φωτογραφίες συσκευασίας πριν την αποστολή. Οι διαφορές λύνονται δίκαια με αποδείξεις.",
      tile3h: "Χωρίς προκαταβολή",
      tile3t: "Η καταχώριση είναι δωρεάν. Μικρή προμήθεια μόνο όταν πουλήσεις.",
      footerBuyer:
        "Δημιούργησε προφίλ πωλητή, πρόσθεσε στοιχεία πληρωμής όταν είσαι έτοιμος και δημοσίευσε αγγελίες για έλεγχο — χωρίς χρέωση καταχώρισης.",
      footerSeller: "Έχεις ενεργό προφίλ πωλητή.",
      footerSellerTail: "για να διαχειρίζεσαι αγγελίες, παραγγελίες και προσφορές.",
      openHub: "Άνοιξε το κέντρο πωλητή",
      sellerAccessTitle: "Δημιούργησε λογαριασμό πωλητή για να αναρτήσεις αγγελίες",
    },
    listingNotFound: {
      title: "Η αγγελία δεν βρέθηκε",
      body: "Η αγγελία μπορεί να πωλήθηκε ή να μην είναι πλέον διαθέσιμη.",
      back: "Πίσω στην αναζήτηση",
      similar: "Παρόμοιος εξοπλισμός →",
    },
    dashboard: {
      seller: "Διαχείριση αγγελιών, παραγγελιών, προσφορών και του καταστήματός σου σε ένα μέρος.",
      buyer: "Παρακολούθηση αγορών, προσφορών και παραδόσεων από ένα μέρος.",
      admin: "Συντονισμός, διαφορές και υγεία της αγοράς.",
      sellerShopFallback: "Το κατάστημά σου",
      buyerAccountFallback: "Ο λογαριασμός σου",
    },
    buyerHome: {
      title: "Επισκόπηση αγοραστή",
      lead: "Παρακολούθησε αγορές, προσφορές και τυχόν διαφορές προστατευμένης παράδοσης από ένα μέρος.",
      emptyDescription: "Δεν έχεις κάνει ακόμη αγορές. Δες εξοπλισμό και βρες κάτι που σου ταιριάζει.",
    },
    sellerOrders: {
      pageTitle: "Παραγγελίες",
      pageDescription: "Όταν ένας αγοραστής ολοκληρώσει την πληρωμή για μια αγγελία σου, η παραγγελία θα εμφανιστεί εδώ.",
      emptyTitle: "Δεν υπάρχουν παραγγελίες ακόμη",
      emptyDescription: "Όταν ένας αγοραστής ολοκληρώσει την πληρωμή για μια αγγελία σου, η παραγγελία θα εμφανιστεί εδώ.",
    },
  },
};
