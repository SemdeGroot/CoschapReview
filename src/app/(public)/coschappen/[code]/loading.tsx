import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-leiden-surface/60 to-background">
        <div className="site-gutter mx-auto w-full max-w-5xl py-10 sm:py-14">
          <Skeleton className="mb-6 h-4 w-32" />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Skeleton className="size-14 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-10 w-full max-w-xl" />
              <Skeleton className="mt-3 h-4 w-40" />
              <div className="mt-3 flex gap-1.5">
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-lg sm:w-44" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-4 rounded-lg border border-border bg-card p-5 sm:gap-x-6">
            <div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-2 h-7 w-20" />
            </div>
            <div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-2 h-7 w-16" />
            </div>
          </div>
        </div>
      </section>

      <section className="site-gutter mx-auto w-full max-w-5xl py-10">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="order-2 lg:order-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-7 w-32" />
                <Skeleton className="mt-2 h-4 w-full max-w-md" />
              </div>
              <Skeleton className="h-10 w-full sm:w-40" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-border bg-card p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-24" />
                  <Skeleton className="mt-4 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-11/12" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
              ))}
            </div>
          </div>

          <aside className="order-1 space-y-5 lg:order-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-11/12" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-5 h-4 w-28" />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
