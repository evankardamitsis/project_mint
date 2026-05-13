import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-[var(--color-background-page)]">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block text-2xl font-black uppercase tracking-[-0.06em] text-[#111111]">
            mint<span className="text-mint">.</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Second-hand gear with protected delivery — sign in to buy or sell.
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">{children}</div>
      </div>
    </div>
  );
}
