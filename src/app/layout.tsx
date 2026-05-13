import type { Metadata } from "next";
import { Roboto, Roboto_Condensed, Roboto_Mono } from "next/font/google";

import { getLocale } from "@/i18n/get-locale";
import "./globals.css";

/** Roboto matches `--font-display` (Roboto Condensed) for consistent Greek at UI sizes; Inter read as a different face next to condensed headlines. */
const robotoSans = Roboto({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "greek", "greek-ext"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-code",
  subsets: ["latin", "latin-ext", "greek"],
  display: "swap",
});

const displayCondensed = Roboto_Condensed({
  subsets: ["latin", "latin-ext", "greek", "greek-ext"],
  weight: ["800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "mint.",
    template: "%s · mint.",
  },
  description:
    "Protected marketplace for music gear & collectibles — with optional protected delivery and payment hold.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale === "el" ? "el" : "en"}
      className={`${robotoSans.className} ${robotoSans.variable} ${robotoMono.variable} ${displayCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
