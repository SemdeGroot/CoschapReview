import { Rating } from "@/components/rating";

export type ReviewCardData = {
  id: string;
  title: string;
  body: string;
  rating: number;
};

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <header className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-foreground">
            {review.title}
          </h3>
        </div>
        <Rating value={review.rating} size="md" />
      </header>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {review.body}
      </p>
    </article>
  );
}
