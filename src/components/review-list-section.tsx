"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReviewCard, type ReviewCardData } from "@/components/review-card";
import { SortDropdown } from "@/components/sort-dropdown";
import {
  DEFAULT_REVIEW_SORT,
  REVIEW_SORT_OPTIONS,
  resolveReviewSort,
} from "@/lib/sort";

type Props = {
  courseSlug: string;
  reviewCount: number;
  reviews: ReviewCardData[];
};

export function ReviewListSection({ courseSlug, reviewCount, reviews }: Props) {
  const [sort, setSort] = useState(DEFAULT_REVIEW_SORT);
  const sortOption = resolveReviewSort(sort);

  const sortedReviews = [...reviews].sort((a, b) => {
    const left = a[sortOption.column as keyof ReviewCardData];
    const right = b[sortOption.column as keyof ReviewCardData];

    if (typeof left === "number" && typeof right === "number") {
      return sortOption.ascending ? left - right : right - left;
    }

    const leftText = String(left ?? "");
    const rightText = String(right ?? "");
    return sortOption.ascending
      ? leftText.localeCompare(rightText, "nl")
      : rightText.localeCompare(leftText, "nl");
  });

  return (
    <div className="order-2 lg:order-1">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Reviews{" "}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            ({reviewCount})
          </span>
        </h2>
        {reviews.length > 0 && (
          <SortDropdown options={REVIEW_SORT_OPTIONS} value={sort} onChange={setSort} />
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <Star size={24} className="mx-auto text-accent" />
          <h3 className="mt-2 text-base font-semibold text-foreground">
            Nog geen reviews
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Deel als eerste je ervaring met deze apotheek.
          </p>
          <Button
            asChild
            className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href={`/coschappen/${courseSlug}/review`}>
              <Pencil size={14} /> Schrijf de eerste review
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
