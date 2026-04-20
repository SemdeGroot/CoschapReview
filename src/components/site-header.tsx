import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <Image src="/logo.png" alt="Farmacoschap logo" width={52} height={52} className="h-13 w-auto" priority />
          Farmacoschap
        </Link>
        <Button
          asChild
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="#coschappen">Bekijk coschappen</Link>
        </Button>
      </div>
    </header>
  );
}
