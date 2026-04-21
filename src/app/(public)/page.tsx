import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type CourseListItem } from "@/components/course-list";
import { CourseBrowser } from "@/components/course-browser";
import { PublicCourseAddModal } from "@/components/public-course-add-modal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getIconKeyByTypeCode } from "@/lib/icons/registry";

export default async function LandingPage() {
  const [courses, allSpecs, initialEmail] = await Promise.all([
    fetchCourses(),
    fetchSpecializations(),
    fetchInitialEmail(),
  ]);

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-leiden-surface to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="animate-fade-up max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Kies je coschap op basis van echte ervaringen.
          </h1>
          <p className="animate-fade-up-d1 mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Beoordelingen door studenten die zelf meegelopen hebben in
            openbare, ziekenhuis- en poliklinische apotheken.
          </p>
          <div className="animate-fade-up-d2 mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <a href="#coschappen">
                Bekijk coschappen <ArrowRight size={16} />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="coschappen" className="animate-fade-up-d3 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Alle coschappen</h2>
            <p className="text-sm text-muted-foreground">
              {courses.length} verschillende coschaplocaties
            </p>
          </div>
          <PublicCourseAddModal allSpecs={allSpecs} initialEmail={initialEmail} />
        </div>

        <CourseBrowser courses={courses} allSpecs={allSpecs} initialEmail={initialEmail} />

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
  const { data: coursesData, error: coursesError } = await supabase
    .from("courses_with_stats")
    .select("*")
    .order("review_count", { ascending: false });

  if (coursesError) {
    console.error("Failed to load courses", coursesError);
    return [];
  }

  return (coursesData ?? [])
    .filter((c) => c.id && c.slug && c.title)
    .map((c) => ({
      id: c.id!,
      slug: c.slug!,
      title: c.title!,
      location: c.location ?? "",
      description: c.description ?? "",
      studiegids_url: c.studiegids_url ?? "",
      color: c.color ?? "#001158",
      icon: getIconKeyByTypeCode(c.type_code),
      type_id: c.type_id ?? null,
      avg_rating: Number(c.avg_rating ?? 0),
      review_count: Number(c.review_count ?? 0),
      specializations: c.type_code && c.type_name
        ? [{ code: c.type_code, name: c.type_name }]
        : [],
    }));
}

async function fetchSpecializations() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("specializations")
    .select("id, code, name")
    .order("id", { ascending: true });

  return data ?? [];
}

async function fetchInitialEmail() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email?.trim().toLowerCase() ?? null;
}
