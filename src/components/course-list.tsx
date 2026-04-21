import Link from "next/link";
import { ExternalLink, MessageSquare, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons/Icon";
import { getIconKeyByTypeCode } from "@/lib/icons/registry";
import { Rating } from "@/components/rating";
import {
  SpecializationBadge,
  type SpecializationPill,
} from "@/components/specialization-badge";
import { getCourseIconColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  location: string;
  description: string;
  studiegids_url: string;
  color: string;
  icon: string;
  type_id: number | null;
  avg_rating: number;
  review_count: number;
  specializations: SpecializationPill[];
};

type Props = {
  courses: CourseListItem[];
  listKey?: number;
  animated?: boolean;
  onEditCourse: (course: CourseListItem) => void;
};

export function CourseList({ courses, listKey = 0, animated = false, onEditCourse }: Props) {
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <h3 className="text-base font-semibold text-foreground">Geen coschappen gevonden</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Probeer een andere zoekterm of wis je filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <DesktopTable
        courses={courses}
        animated={animated}
        listKey={listKey}
        onEditCourse={onEditCourse}
      />
      <MobileCards
        courses={courses}
        animated={animated}
        listKey={listKey}
        onEditCourse={onEditCourse}
      />
    </>
  );
}

function DesktopTable({
  courses,
  animated,
  listKey,
  onEditCourse,
}: Omit<Props, "animated" | "listKey"> & { animated: boolean; listKey: number }) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Apotheek</th>
            <th className="px-3 py-3 text-left font-medium">Plaats</th>
            <th className="px-3 py-3 text-left font-medium">Beoordeling</th>
            <th className="px-3 py-3 text-right font-medium">Reviews</th>
            <th className="px-3 py-3 text-right font-medium">Acties</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <CourseRow
              key={`${listKey}-${course.id}`}
              course={course}
              index={index}
              animated={animated}
              onEditCourse={onEditCourse}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CourseRow({
  course,
  index,
  animated,
  onEditCourse,
}: {
  course: CourseListItem;
  index: number;
  animated: boolean;
  onEditCourse: (course: CourseListItem) => void;
}) {
  const detailHref = `/coschappen/${course.slug}`;
  const iconColor = getCourseIconColor(course.color);

  return (
    <tr
      className="group border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
      style={animated ? { animation: `fade-up 0.35s ${index * 30}ms ease-out both` } : undefined}
    >
      <td className="px-4 py-3">
        <Link href={detailHref} className="flex items-start gap-3">
          <span
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: course.color, color: iconColor }}
          >
            <Icon name={getIconKeyByTypeCode(course.specializations[0]?.code)} size={16} className="text-current" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground group-hover:text-primary">
              {course.title}
            </span>
            <span className="mt-1 flex flex-wrap gap-1">
              {course.specializations.slice(0, 5).map((s) => (
                <SpecializationBadge key={s.code} code={s.code} name={s.name} />
              ))}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-3 py-3 align-middle text-sm text-muted-foreground">
        <Link href={detailHref} className="block py-1 transition-colors hover:text-primary focus-visible:text-primary">
          {course.location}
        </Link>
      </td>
      <td className="px-3 py-3 align-middle">
        <Link href={detailHref} className="block py-1">
          <Rating value={course.avg_rating} />
        </Link>
      </td>
      <td className="px-3 py-3 align-middle text-right">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1 py-1 text-sm tabular-nums text-foreground transition-colors hover:text-primary focus-visible:text-primary"
        >
          <MessageSquare size={12} className="text-muted-foreground" />
          {course.review_count}
        </Link>
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEditCourse(course)}>
            <Pencil size={14} />
            <span>Bewerken</span>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={detailHref}>
              <ExternalLink size={14} />
              <span>Open</span>
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function MobileCards({
  courses,
  animated,
  listKey,
  onEditCourse,
}: Omit<Props, "animated" | "listKey"> & { animated: boolean; listKey: number }) {
  return (
    <div className="space-y-3 md:hidden">
      {courses.map((course, index) => {
        const iconColor = getCourseIconColor(course.color);

        return (
          <div
            key={`${listKey}-${course.id}`}
            style={animated ? { animation: `fade-up 0.6s ${index * 50}ms ease-out both` } : undefined}
            className={cn(
              "block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors",
              "hover:border-primary/30 hover:bg-secondary/30",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: course.color, color: iconColor }}
              >
                <Icon name={getIconKeyByTypeCode(course.specializations[0]?.code)} size={20} className="text-current" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <Link href={`/coschappen/${course.slug}`} className="block">
                      <h3 className="text-sm font-semibold leading-snug text-foreground hover:text-primary">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{course.location}</p>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {course.specializations.slice(0, 4).map((s) => (
                    <SpecializationBadge key={s.code} code={s.code} name={s.name} />
                  ))}
                </div>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Score</dt>
                <dd className="mt-0.5">
                  <Rating value={course.avg_rating} size="sm" />
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Reviews</dt>
                <dd className="mt-0.5 font-medium tabular-nums">{course.review_count}</dd>
              </div>
          </dl>
          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEditCourse(course)}>
              <Pencil size={14} />
              <span>Bewerken</span>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/coschappen/${course.slug}`}>Openen</Link>
            </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
