export const marketingNav = [
  { href: "/browse", label: "Browse" },
  { href: "/sell", label: "Sell" },
] as const;

export const sellerNav = [
  { href: "/seller", label: "Overview" },
  { href: "/seller/listings", label: "Listings" },
  { href: "/seller/listings/new", label: "New listing" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/offers", label: "Offers" },
] as const;

export const buyerNav = [
  { href: "/buyer", label: "Overview" },
  { href: "/buyer/purchases", label: "Purchases" },
  { href: "/buyer/offers", label: "Offers" },
] as const;

export const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/disputes", label: "Disputes" },
] as const;
