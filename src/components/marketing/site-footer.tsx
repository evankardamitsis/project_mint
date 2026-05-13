import Link from "next/link";

import type { Messages } from "@/i18n/messages";

export function SiteFooter({
  messages: m,
}: {
  messages: Messages;
}) {
  return (
    <footer className="mt-auto border-t-[3px] border-[#1a7a4a] bg-[#111111] px-5 pb-[18px] pt-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-4 flex flex-col justify-between gap-8 border-b border-[#1e1e1e] pb-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-[18px] font-black text-white">
              mint<span className="text-[#1a7a4a]">.</span>
            </p>
            <p className="mt-[3px] text-[9px] font-bold uppercase tracking-[0.07em] text-[#444444]">{m.footer.tagline}</p>
          </div>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#555555]">{m.footer.company}</p>
              <Link href="#" className="mb-[5px] block text-[11px] text-[#666666] no-underline hover:text-white">
                {m.footer.about}
              </Link>
              <Link href="#" className="mb-[5px] block text-[11px] text-[#666666] no-underline hover:text-white">
                {m.footer.help}
              </Link>
              <Link href="#" className="mb-[5px] block text-[11px] text-[#666666] no-underline hover:text-white">
                {m.footer.contact}
              </Link>
            </div>
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#555555]">{m.footer.legal}</p>
              <Link href="#" className="mb-[5px] block text-[11px] text-[#666666] no-underline hover:text-white">
                {m.footer.privacy}
              </Link>
              <Link href="#" className="mb-[5px] block text-[11px] text-[#666666] no-underline hover:text-white">
                {m.footer.terms}
              </Link>
            </div>
          </div>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#2e2e2e]">{m.footer.copyrightLine}</p>
      </div>
    </footer>
  );
}
