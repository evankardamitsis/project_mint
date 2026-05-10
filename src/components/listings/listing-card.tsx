import Image from "next/image";
import Link from "next/link";

import { ConditionBadge } from "@/components/condition-badge";
import { Price } from "@/components/price";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ListingCondition } from "@/types/domain";

export function ListingCard({
  title,
  slug,
  priceCents,
  currency = "EUR",
  condition,
  location,
  imageUrl,
  imageAlt,
  className,
  footer,
}: {
  title: string;
  slug: string;
  priceCents: number;
  currency?: string;
  condition: ListingCondition;
  location?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  className?: string;
  footer?: React.ReactNode;
}) {
  return (
    <Link href={`/listing/${slug}`} className={cn("group block", className)}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-4/3 w-full bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Photo coming soon
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <p className="line-clamp-2 min-w-0 text-sm font-medium leading-snug">
              {title}
            </p>
            <Price
              amountCents={priceCents}
              currency={currency}
              className="shrink-0 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ConditionBadge condition={condition} />
            {location ? (
              <span className="text-xs text-muted-foreground">{location}</span>
            ) : null}
          </div>
          {footer}
        </div>
      </Card>
    </Link>
  );
}
