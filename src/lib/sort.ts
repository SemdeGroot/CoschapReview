export type SortOption = {
  value: string;
  label: string;
  column: string;
  ascending: boolean;
};

export const COURSE_SORT_OPTIONS: SortOption[] = [
  { value: "reviews.desc", label: "Meest besproken", column: "review_count", ascending: false },
  { value: "reviews.asc", label: "Minst besproken", column: "review_count", ascending: true },
  { value: "rating.desc", label: "Hoogst beoordeeld", column: "avg_rating", ascending: false },
  { value: "rating.asc", label: "Laagst beoordeeld", column: "avg_rating", ascending: true },
  { value: "title.asc", label: "Naam A-Z", column: "title", ascending: true },
];

export const DEFAULT_COURSE_SORT = "reviews.desc";

export function resolveCourseSort(value: string | undefined | null): SortOption {
  return (
    COURSE_SORT_OPTIONS.find((option) => option.value === value) ??
    COURSE_SORT_OPTIONS.find((option) => option.value === DEFAULT_COURSE_SORT)!
  );
}

export const REVIEW_SORT_OPTIONS: SortOption[] = [
  { value: "date.desc", label: "Nieuwste eerst", column: "created_at", ascending: false },
  { value: "date.asc", label: "Oudste eerst", column: "created_at", ascending: true },
  { value: "rating.desc", label: "Hoogst beoordeeld", column: "rating", ascending: false },
  { value: "rating.asc", label: "Laagst beoordeeld", column: "rating", ascending: true },
];

export const DEFAULT_REVIEW_SORT = "date.desc";

export function resolveReviewSort(value: string | undefined | null): SortOption {
  return (
    REVIEW_SORT_OPTIONS.find((option) => option.value === value) ??
    REVIEW_SORT_OPTIONS.find((option) => option.value === DEFAULT_REVIEW_SORT)!
  );
}
