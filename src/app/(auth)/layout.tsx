import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            Project Mint
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            Protected second-hand music gear in Greece.
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
