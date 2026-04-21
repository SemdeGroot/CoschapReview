import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-shell-bottom mt-16 border-t border-black/6">
      <div className="site-shell-bottom">
        <div className="site-gutter mx-auto flex w-full max-w-6xl items-center justify-between gap-4 py-6 text-xs text-foreground/72">
          <p>&copy; 2026 Farmacoschap. Platform voor ervaringen over coschappen in de apotheek.</p>
          <Link
            href="/contact"
            className="shrink-0 rounded-full px-3 py-2 transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </div>
      </div>
      <div className="site-shell-bottom h-[env(safe-area-inset-bottom)]" aria-hidden />
    </footer>
  );
}
