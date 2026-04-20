export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Gemaakt voor farmaciestudenten. Niet verbonden aan een ziekenhuis of apotheekketen.
        </p>
        <p className="text-xs">
          Reviews blijven anoniem. Admintoegang wordt beheerd via de whitelist.
        </p>
      </div>
    </footer>
  );
}
