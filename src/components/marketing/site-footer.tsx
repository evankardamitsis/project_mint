import { SITE_CONTAINER } from "@/config/site-layout";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-warm-bg py-10 text-center">
      <div className={SITE_CONTAINER}>
        <p className="text-sm font-semibold text-ink">
          mint<span className="text-mint">.</span>
        </p>
        <p className="mt-1 text-xs text-text-muted">Music gear & collectibles — buy and sell with confidence.</p>
      </div>
    </footer>
  );
}
