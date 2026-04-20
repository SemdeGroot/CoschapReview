import { CourseAddModal } from "@/components/course-add-modal";
import { AdminCoursesTable, type AdminCourseRow } from "@/components/admin-courses-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin - Coschappen" };

export default async function AdminCoursesPage() {
  const supabase = await createSupabaseServerClient();

  const [coursesRes, specsRes] = await Promise.all([
    supabase
      .from("courses_with_stats")
      .select("*")
      .order("title", { ascending: true }),
    supabase.from("specializations").select("id, code, name"),
  ]);

  const allSpecs = (specsRes.data ?? []).sort((a, b) => a.id - b.id);
  const courses: AdminCourseRow[] = (coursesRes.data ?? [])
    .filter((c) => c.id)
    .map((c) => ({
      id: c.id!,
      slug: c.slug!,
      title: c.title!,
      location: c.location ?? "",
      color: c.color ?? "#001158",
      type_id: c.type_id ?? null,
      type_code: c.type_code ?? null,
      type_name: c.type_name ?? null,
      review_count: Number(c.review_count ?? 0),
      description: c.description ?? "",
      studiegids_url: c.studiegids_url ?? "",
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Coschappen
          </h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} coschaplocatie{courses.length === 1 ? "" : "s"} in het overzicht.
          </p>
        </div>
        <CourseAddModal allSpecs={allSpecs} />
      </div>

      <AdminCoursesTable courses={courses} allSpecs={allSpecs} />
    </div>
  );
}
