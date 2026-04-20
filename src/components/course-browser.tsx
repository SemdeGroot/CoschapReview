"use client";

import { useState } from "react";

import { CourseList, type CourseListItem } from "@/components/course-list";
import { SearchInput } from "@/components/search-input";
import { SortDropdown } from "@/components/sort-dropdown";
import {
  COURSE_SORT_OPTIONS,
  DEFAULT_COURSE_SORT,
  resolveCourseSort,
} from "@/lib/sort";

type Props = {
  courses: CourseListItem[];
};

export function CourseBrowser({ courses }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(DEFAULT_COURSE_SORT);
  const sortOption = resolveCourseSort(sort);

  const filteredCourses = courses.filter((course) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;

    return [
      course.title,
      course.location,
      ...course.specializations.map((specialization) => specialization.name ?? ""),
    ].some((value) => value.toLowerCase().includes(needle));
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const left = a[sortOption.column as keyof CourseListItem];
    const right = b[sortOption.column as keyof CourseListItem];

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
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <SearchInput className="w-full sm:w-72" value={query} onChange={setQuery} />
        <SortDropdown options={COURSE_SORT_OPTIONS} value={sort} onChange={setSort} />
      </div>
      <div
        className={
          sortedCourses.length > 8
            ? "max-h-[560px] overflow-y-auto rounded-lg border border-border pr-1"
            : undefined
        }
      >
        <CourseList courses={sortedCourses} />
      </div>
    </div>
  );
}
