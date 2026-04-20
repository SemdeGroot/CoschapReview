import type { Metadata } from "next";
import { Bitter, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://farmacoschap.nl"),
  title: {
    default: "Farmacoschap",
    template: "%s | Farmacoschap",
  },
  description:
    "Farmacoschap helpt MSc-farmaciestudenten in Nederland met eerlijke reviews van ziekenhuis-, poliklinische en openbare apotheekcoschappen.",
  keywords: [
    "farmacoschap",
    "farmacie coschap",
    "apotheek coschap",
    "farmacie stages nederland",
    "leiden utrecht groningen farmacie",
  ],
  openGraph: {
    title: "Farmacoschap",
    description:
      "Eerlijke reviews van farmaciecoschappen voor MSc-studenten in Nederland.",
    siteName: "Farmacoschap",
    locale: "nl_NL",
    type: "website",
  },
  other: {
    "geo.region": "NL",
    "geo.placename": "Netherlands",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${inter.variable} ${bitter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
