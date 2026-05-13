export function ProofImageGrid({
  items,
  label,
}: {
  items: { src: string; alt: string }[];
  label?: string;
}) {
  if (!items.length) {
    return <p className="text-xs text-muted-foreground">No uploads yet.</p>;
  }
  return (
    <div className="space-y-2">
      {label ? <p className="text-xs font-medium text-muted-foreground">{label}</p> : null}
      <div className="flex flex-wrap gap-2">
        {items.map((img, i) => (
          <a
            key={`${img.src}-${i}`}
            href={img.src}
            target="_blank"
            rel="noreferrer"
            className="relative block size-24 overflow-hidden rounded-xl bg-[var(--color-background-page)] ring-1 ring-[#e0ddd8]/60"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} className="size-full object-cover" />
          </a>
        ))}
      </div>
    </div>
  );
}
