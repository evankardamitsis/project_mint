import { SellerTabBar } from "@/components/seller/seller-tab-bar";
import { requireRole } from "@/lib/roles";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("seller");

  return (
    <>
      <SellerTabBar />
      <div className="min-h-[50vh] bg-(--color-background-page)">
        <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">{children}</main>
      </div>
    </>
  );
}
