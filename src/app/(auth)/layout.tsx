import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            mint<span className="text-mint">.</span>
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            Protected second-hand gear — sign in to continue.
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
