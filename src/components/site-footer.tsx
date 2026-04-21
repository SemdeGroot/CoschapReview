import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-shell mt-16 border-t border-black/6 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6 text-xs text-foreground/72 sm:px-6">
        <p>&copy; 2026 Farmacoschap. Platform voor ervaringen over coschappen in de apotheek.</p>
        <Link href="/contact" className="shrink-0 transition-colors hover:text-foreground">
          Contact
        </Link>
      </div>
    </footer>
  );
}
