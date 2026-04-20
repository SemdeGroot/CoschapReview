import Link from "next/link";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span
            className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
            aria-hidden
          >
            <Building2 size={18} />
          </span>
          <span className="text-base">
            CoschapReview
            <span className="ml-2 hidden text-xs font-normal text-muted-foreground sm:inline">
              Coschap Apotheken
            </span>
          </span>
        </Link>
        <Button
          asChild
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="#coschappen">Browse coschappen</Link>
        </Button>
      </div>
    </header>
  );
}
