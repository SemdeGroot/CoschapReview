import { CourseBrowserSkeleton } from "@/components/course-browser-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-leiden-surface to-background">
        <div className="site-gutter mx-auto w-full max-w-6xl py-16 sm:py-24">
          <Skeleton className="h-12 w-full max-w-3xl" />
          <Skeleton className="mt-5 h-5 w-full max-w-xl" />
          <Skeleton className="mt-2 h-5 w-4/5 max-w-lg" />
          <Skeleton className="mt-8 h-11 w-44 rounded-lg" />
        </div>
      </section>

      <section className="site-gutter mx-auto w-full max-w-6xl py-10">
        <div className="mb-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>

        <CourseBrowserSkeleton />
      </section>
    </>
  );
}
