import Link from "next/link";
import { ArrowRight, Search, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type CourseListItem } from "@/components/course-list";
import { CourseBrowser } from "@/components/course-browser";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SpecializationPill } from "@/components/specialization-badge";

export default async function LandingPage() {
  const courses = await fetchCourses();

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-leiden-surface to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star size={14} className="text-accent" /> Anonieme ervaringen van farmaciestudenten
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Kies je coschap met meer context dan alleen een naam.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Lees eerlijke reviews over begeleiding en de dagelijkse praktijk in openbare,
            ziekenhuis- en poliklinische apotheken, geschreven door studenten die er echt hebben
            meegelopen.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="#coschappen">
                Bekijk coschappen <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="coschappen" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Alle coschappen</h2>
            <p className="text-sm text-muted-foreground">
              {courses.length} coschap{courses.length === 1 ? "" : "pen"} verdeeld over 2 categorieen
            </p>
          </div>
        </div>

        <CourseBrowser courses={courses} />

        {courses.length > 0 && (
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Search size={12} /> Open een coschap om reviews te lezen of zelf een ervaring te delen.
          </p>
        )}
      </section>
    </>
  );
}

async function fetchCourses(): Promise<CourseListItem[]> {
  const supabase = await createSupabaseServerClient();
  const query = supabase
    .from("courses_with_stats")
    .select("*")
    .order("review_count", { ascending: false });

  const { data: coursesData, error: coursesError } = await query;
  if (coursesError) {
    console.error("Failed to load courses", coursesError);
    return [];
  }
  const courses = (coursesData ?? []).filter((c) => c.id && c.slug && c.title);
  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id!) ;

  const [{ data: mappingData }, { data: specsData }] = await Promise.all([
    supabase
      .from("course_specializations")
      .select("course_id, role, specialization_id")
      .in("course_id", courseIds),
    supabase.from("specializations").select("id, code, name"),
  ]);

  const specLookup = new Map<number, { code: string; name: string }>();
  for (const s of specsData ?? []) {
    specLookup.set(s.id, { code: s.code, name: s.name });
  }

  const specsByCourse = new Map<string, SpecializationPill[]>();
  for (const m of mappingData ?? []) {
    const spec = specLookup.get(m.specialization_id);
    if (!spec) continue;
    const list = specsByCourse.get(m.course_id) ?? [];
    list.push({ code: spec.code, name: spec.name, role: m.role as "core" | "elective" });
    specsByCourse.set(m.course_id, list);
  }
  for (const list of specsByCourse.values()) {
    list.sort((a, b) => {
      if (a.role !== b.role) return a.role === "core" ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }

  return courses.map((c) => ({
    id: c.id!,
    slug: c.slug!,
    title: c.title!,
    location: c.location ?? "",
    color: c.color ?? "#001158",
    icon: c.icon ?? "hospital",
    avg_rating: Number(c.avg_rating ?? 0),
    review_count: Number(c.review_count ?? 0),
    specializations: specsByCourse.get(c.id!) ?? [],
  }));
}
