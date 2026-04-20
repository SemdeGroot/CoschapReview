import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <p>&copy; 2026 Farmacoschap. Onafhankelijk platform voor anonieme ervaringen over farmaciecoschappen.</p>
        <Link href="/contact" className="shrink-0 hover:text-foreground transition-colors">
          Contact
        </Link>
      </div>
    </footer>
  );
}
