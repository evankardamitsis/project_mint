import type { DisputeAssetView } from "@/types/disputes";

export function DisputeEvidenceGrid({ assets, title = "Evidence" }: { assets: DisputeAssetView[]; title?: string }) {
  const items = assets
    .filter((a) => a.signedUrl)
    .map((a, i) => ({ src: a.signedUrl as string, alt: `Evidence ${i + 1}` }));
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No evidence files attached.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((img, i) => (
          <a
            key={`${img.src}-${i}`}
            href={img.src}
            target="_blank"
            rel="noreferrer"
            className="relative block size-28 overflow-hidden rounded-lg border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} className="size-full object-cover" />
          </a>
        ))}
      </div>
    </div>
  );
}
