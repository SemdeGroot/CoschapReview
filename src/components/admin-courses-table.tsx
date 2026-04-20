"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { CourseEditModal } from "@/components/course-edit-modal";
import { Icon } from "@/lib/icons/Icon";
import { getIconKeyByTypeCode } from "@/lib/icons/registry";
import { SpecializationBadge } from "@/components/specialization-badge";
import { deleteCourseAction } from "@/server-actions/admin";

type Spec = { id: number; code: string; name: string };

export type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  location: string;
  color: string;
  type_id: number | null;
  type_code: string | null;
  type_name: string | null;
  review_count: number;
  description: string;
  studiegids_url: string;
};

type Props = {
  courses: AdminCourseRow[];
  allSpecs: Spec[];
};

export function AdminCoursesTable({ courses, allSpecs }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? courses.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          (c.location ?? "").toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
        );
      })
    : courses;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Zoek op naam, locatie of code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Apotheek</th>
              <th className="px-3 py-3 text-left font-medium">Locatie</th>
              <th className="px-3 py-3 text-left font-medium">Code</th>
              <th className="px-3 py-3 text-right font-medium">Reviews</th>
              <th className="px-3 py-3 text-right font-medium">Acties</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Geen coschappen gevonden{query ? ` voor "${query}"` : ""}.
                </td>
              </tr>
            ) : (
              filtered.map((course) => {
                const deleteCourse = deleteCourseAction.bind(null, course.id);
                const iconKey = getIconKeyByTypeCode(course.type_code);
                return (
                  <tr key={course.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-white"
                          style={{ backgroundColor: course.color ?? "#001158" }}
                        >
                          <Icon name={iconKey} size={16} className="text-white" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{course.title}</div>
                          {course.type_name && (
                            <div className="mt-1">
                              <SpecializationBadge
                                code={course.type_code ?? ""}
                                name={course.type_name}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle text-sm text-muted-foreground">
                      {course.location}
                    </td>
                    <td className="px-3 py-3 align-middle text-xs font-mono text-muted-foreground">
                      {course.slug}
                    </td>
                    <td className="px-3 py-3 text-right align-middle tabular-nums">
                      {course.review_count ?? 0}
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/coschappen/${course.slug}`} target="_blank">
                            <ExternalLink size={14} />
                            <span className="sr-only sm:not-sr-only">Bekijk</span>
                          </Link>
                        </Button>
                        <CourseEditModal
                          course={{
                            id: course.id,
                            slug: course.slug,
                            title: course.title,
                            location: course.location ?? "",
                            description: course.description ?? "",
                            studiegids_url: course.studiegids_url ?? "",
                            color: course.color ?? "#001158",
                            type_id: course.type_id ?? null,
                          }}
                          allSpecs={allSpecs}
                        />
                        <ConfirmDeleteButton
                          title={`"${course.title}" verwijderen?`}
                          description="Dit verwijdert de apotheek en alle bijbehorende reviews definitief. Dit kan niet ongedaan worden gemaakt."
                          action={deleteCourse}
                          successMessage="Apotheek verwijderd."
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
