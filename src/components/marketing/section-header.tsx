import Link from "next/link";

export function SectionHeader({
  title,
  seeAllHref,
  seeAllLabel,
}: {
  title: string;
  seeAllHref: string;
  seeAllLabel: string;
}) {
  return (
    <div className="mb-0 flex items-end justify-between border-b-2 border-[#111111] pb-2">
      <h2 className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111111]">{title}</h2>
      <Link
        href={seeAllHref}
        className="shrink-0 cursor-pointer text-[9px] font-bold uppercase tracking-[0.09em] text-[#1a7a4a] no-underline hover:underline hover:underline-offset-[3px]"
      >
        {seeAllLabel}
        {" →"}
      </Link>
    </div>
  );
}
