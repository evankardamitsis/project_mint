"use client";

function TickerItem({ text }: { text: string }) {
  const sep = " · ";
  const idx = text.indexOf(sep);
  if (idx === -1) {
    return <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.05em] text-[#555555]">{text}</span>;
  }
  const head = text.slice(0, idx);
  const tail = text.slice(idx);
  return (
    <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.05em]">
      <span className="font-bold text-[#cccccc]">{head}</span>
      <span className="text-[#555555]">{tail}</span>
    </span>
  );
}

export function LiveTicker({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="group/live-ticker flex items-center gap-3 overflow-hidden bg-[#111111] px-5 py-[9px]">
      <span className="mint-pulse-dot size-[5px] shrink-0 rounded-full bg-[#1a7a4a]" aria-hidden />
      <span className="mr-1 shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-[#1a7a4a]">Live</span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="mint-marquee flex w-max gap-5 group-hover/live-ticker:[animation-play-state:paused]">
          {loop.map((line, i) => (
            <span key={`${i}-${line.slice(0, 12)}`} className="flex shrink-0 items-center gap-5">
              <TickerItem text={line} />
              <span className="text-[#2a2a2a]" aria-hidden>
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
