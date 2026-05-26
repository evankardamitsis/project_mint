import { SellerTabBar } from "@/components/seller/seller-tab-bar";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { requireRole } from "@/lib/roles";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("seller");

  const locale = await getLocale();
  const s = MESSAGES[locale].sellerNav;

  return (
    <>
      <SellerTabBar labels={s} />
      <div className="min-h-[50vh] bg-[var(--color-background-page)]">
        <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">{children}</main>
      </div>
    </>
  );
}
