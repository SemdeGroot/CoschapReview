import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewLoading() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="mb-6 h-4 w-40" />

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />

        <div className="mt-8 space-y-6">
          <div>
            <Skeleton className="h-4 w-28" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="size-9 rounded-full" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-11 w-full" />
          </div>

          <div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-32 w-full" />
          </div>

          <div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-11 w-full" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Skeleton className="h-11 w-full rounded-lg sm:w-28" />
            <Skeleton className="h-11 w-full rounded-lg sm:w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
