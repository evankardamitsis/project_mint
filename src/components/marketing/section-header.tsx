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
    <div className="mb-0 flex w-full items-end justify-between border-b-2 border-solid border-[#111111] pb-[10px] pt-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#111111]">{title}</h2>
      <Link
        href={seeAllHref}
        className="shrink-0 cursor-pointer text-[11px] font-bold uppercase tracking-[0.08em] text-[#1a7a4a] no-underline hover:underline hover:underline-offset-[3px]"
      >
        {seeAllLabel}
        {" →"}
      </Link>
    </div>
  );
}
