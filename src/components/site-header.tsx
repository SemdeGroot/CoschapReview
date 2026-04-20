import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-semibold tracking-tight"
        >
          <span className="text-base">
            CoschapReview
            <span className="ml-2 hidden text-xs font-normal text-muted-foreground sm:inline">
              Farmacie coschappen
            </span>
          </span>
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
