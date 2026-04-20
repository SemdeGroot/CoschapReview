import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { CourseEditModal } from "@/components/course-edit-modal";
import { Icon } from "@/lib/icons/Icon";
import {
  SpecializationBadge,
  type SpecializationPill,
} from "@/components/specialization-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteCourseAction } from "@/server-actions/admin";

export const metadata = { title: "Admin - Coschappen" };

export default async function AdminCoursesPage() {
  const supabase = await createSupabaseServerClient();

  const [coursesRes, mappingRes, specsRes] = await Promise.all([
    supabase
      .from("courses_with_stats")
      .select("*")
      .order("title", { ascending: true }),
    supabase.from("course_specializations").select("*"),
    supabase.from("specializations").select("id, code, name"),
  ]);

  const allSpecs = specsRes.data ?? [];

  const specLookup = new Map<number, { code: string; name: string }>();
  for (const s of allSpecs) {
    specLookup.set(s.id, { code: s.code, name: s.name });
  }
  const specsByCourse = new Map<string, SpecializationPill[]>();
  const rawSpecsByCourse = new Map<string, { specialization_id: number; role: "core" | "elective" }[]>();
  for (const m of mappingRes.data ?? []) {
    const spec = specLookup.get(m.specialization_id);
    if (!spec) continue;
    const list = specsByCourse.get(m.course_id) ?? [];
    list.push({ code: spec.code, name: spec.name, role: m.role as "core" | "elective" });
    specsByCourse.set(m.course_id, list);

    const raw = rawSpecsByCourse.get(m.course_id) ?? [];
    raw.push({ specialization_id: m.specialization_id, role: m.role as "core" | "elective" });
    rawSpecsByCourse.set(m.course_id, raw);
  }

  const courses = (coursesRes.data ?? []).filter((c) => c.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Coschappen
          </h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} coschap{courses.length === 1 ? "" : "pen"} in het overzicht.
          </p>
        </div>
        <Button
          disabled
          title="Toevoegen volgt in een volgende stap"
          className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
        >
          <Plus size={14} /> Coschap toevoegen
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Coschap</th>
              <th className="px-3 py-3 text-left font-medium">Locatie</th>
              <th className="px-3 py-3 text-left font-medium">Code</th>
              <th className="px-3 py-3 text-right font-medium">Reviews</th>
              <th className="px-3 py-3 text-right font-medium">Acties</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const specs = specsByCourse.get(course.id!) ?? [];
              const rawSpecs = rawSpecsByCourse.get(course.id!) ?? [];
              const deleteCourse = deleteCourseAction.bind(null, course.id!);
              return (
                <tr
                  key={course.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-white"
                        style={{ backgroundColor: course.color ?? "#001158" }}
                      >
                        <Icon name={course.icon} size={16} className="text-white" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{course.title}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {specs.slice(0, 6).map((s) => (
                            <SpecializationBadge
                              key={s.code}
                              code={s.code}
                              name={s.name}
                              role={s.role}
                            />
                          ))}
                        </div>
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
                          id: course.id!,
                          title: course.title!,
                          location: course.location ?? "",
                          description: course.description ?? "",
                          studiegids_url: course.studiegids_url ?? "",
                          color: course.color ?? "#001158",
                          icon: course.icon ?? "hospital",
                          ec: course.ec ?? 6,
                        }}
                        allSpecs={allSpecs}
                        currentSpecs={rawSpecs}
                      />
                      <ConfirmDeleteButton
                        title={`"${course.title}" verwijderen?`}
                        description="Dit verwijdert het coschap en alle bijbehorende reviews definitief. Dit kan niet ongedaan worden gemaakt."
                        action={deleteCourse}
                        successMessage="Coschap verwijderd."
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
