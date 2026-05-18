import { Skeleton } from "@/components/ui/skeleton";

export function AdminCoursesSkeleton() {
  return (
    <div className="space-y-4">
      <AdminPageHeaderSkeleton hasAction />
      <Skeleton className="h-10 w-full" />
      <AdminTableSkeleton columns={5} rows={7} />
    </div>
  );
}

export function AdminReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <AdminPageHeaderSkeleton />
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-2/3 max-w-sm" />
                <Skeleton className="mt-2 h-4 w-56" />
              </div>
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAdminsSkeleton() {
  return (
    <div className="space-y-4">
      <AdminPageHeaderSkeleton />
      <AdminTableSkeleton columns={3} rows={4} />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

function AdminPageHeaderSkeleton({ hasAction = false }: { hasAction?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      </div>
      {hasAction ? <Skeleton className="h-10 w-36" /> : null}
    </div>
  );
}

function AdminTableSkeleton({ columns, rows }: { columns: number; rows: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="grid gap-3 border-b border-border bg-muted/40 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-20" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 px-4 py-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={columnIndex === 0 ? "h-4 w-4/5" : "h-4 w-2/3"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
