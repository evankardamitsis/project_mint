import Image from "next/image";
import { cn } from "@/lib/utils";

const cellRotate = [
  "rotate-1",
  "-rotate-2",
  "rotate-2",
  "-rotate-1",
] as const;

export function HomeHeroCollage({
  cells,
}: {
  cells: { imageUrl: string | null; title: string }[];
}) {
  const list = [...cells];
  while (list.length < 4) {
    list.push({ imageUrl: null, title: "" });
  }
  const four = list.slice(0, 4);

  return (
    <div className="relative w-full max-w-xl lg:max-w-none">
      <div className="relative grid w-full grid-cols-2 gap-3 lg:gap-4">
        {four.map((cell, i) => (
          <div
            key={i}
            className={cn(
              "relative aspect-square overflow-hidden rounded-2xl bg-[#F0EEE9] transition-transform duration-300 hover:rotate-0",
              cellRotate[i] ?? "",
            )}
          >
            {cell.imageUrl ? (
              <Image
                src={cell.imageUrl}
                alt={cell.title || "Listing"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 45vw, 320px"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
