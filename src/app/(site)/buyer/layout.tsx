import { BuyerTabBar } from "@/components/buyer/buyer-tab-bar";
import { requireUser } from "@/lib/auth/guards";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/buyer");
  const locale = await getLocale();
  const s = MESSAGES[locale].buyerNav;

  return (
    <>
      <BuyerTabBar labels={s} />
      <div className="min-h-[50vh] bg-[var(--color-background-page)]">
        <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">{children}</main>
      </div>
    </>
  );
}
