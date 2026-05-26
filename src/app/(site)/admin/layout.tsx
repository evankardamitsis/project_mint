import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { requireRole } from "@/lib/roles";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  const locale = await getLocale();
  const s = MESSAGES[locale].adminNav;

  return (
    <>
      <AdminTabBar labels={s} />
      <div className="min-h-[50vh] bg-[var(--color-background-page)]">
        <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">{children}</main>
      </div>
    </>
  );
}
