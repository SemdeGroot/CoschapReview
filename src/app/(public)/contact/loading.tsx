import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        <Skeleton className="mt-2 h-5 w-5/6 max-w-lg" />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="space-y-5">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-11 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-28 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
