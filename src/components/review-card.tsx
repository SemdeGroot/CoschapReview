import Link from "next/link";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Rating } from "@/components/rating";

export type ReviewCardData = {
  id: string;
  title: string;
  body: string;
  rating: number;
  isOwnReview?: boolean;
  editHref?: string;
};

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <header className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-snug text-foreground">
              {review.title}
            </h3>
            {review.isOwnReview ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                Jouw review
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Rating value={review.rating} size="md" />
          {review.isOwnReview && review.editHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={review.editHref}>
                <Pencil size={14} />
                <span>Bewerken</span>
              </Link>
            </Button>
          ) : null}
        </div>
      </header>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {review.body}
      </p>
    </article>
  );
}
