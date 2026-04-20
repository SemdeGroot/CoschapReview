export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Built for pharmacy students. Not affiliated with any hospital or pharmacy chain.
        </p>
        <p className="text-xs">
          Reviews stay anonymous. Admin access is handled through the whitelist.
        </p>
      </div>
    </footer>
  );
}
