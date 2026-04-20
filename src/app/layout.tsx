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
  icons: {
    icon: "/logo.png",
  },
  title: {
    default: "Farmacoschap",
    template: "%s | Farmacoschap",
  },
  description:
    "Farmacoschap. Platform voor ervaringen over coschappen in de apotheek.",
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
      "Beoordelingen van coschappen in de apotheek voor MSc-studenten in Nederland.",
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
