import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = MESSAGES[locale];

  return (
    <>
      <SiteHeader locale={locale} messages={messages} />
      <div className="flex-1 bg-background">{children}</div>
      <SiteFooter messages={messages} />
    </>
  );
}
