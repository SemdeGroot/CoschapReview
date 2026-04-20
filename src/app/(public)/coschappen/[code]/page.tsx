import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons/Icon";
import { type ReviewCardData } from "@/components/review-card";
import { ReviewListSection } from "@/components/review-list-section";
import {
  SpecializationBadge,
  type SpecializationPill,
} from "@/components/specialization-badge";
import { StatPill } from "@/components/stat-pill";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteParams = Promise<{ code: string }>;

export async function generateMetadata({ params }: { params: RouteParams }) {
  const { code } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("title")
    .eq("slug", code)
    .maybeSingle();
  if (!data) return { title: "Coschap niet gevonden" };
  return {
    title: data.title,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: RouteParams;
}) {
  const { code } = await params;
  const detail = await fetchCourseDetail(code);
  if (!detail) notFound();

  const { course, specializations } = detail;
  const reviews = await fetchReviews(course.id);

  return (
    <>
      <section
        className="border-b border-border"
        style={{
          background: `linear-gradient(180deg, ${course.color}08 0%, transparent 100%)`,
        }}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Alle coschappen
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: course.color }}
              aria-hidden
            >
              <Icon name={course.icon} size={28} className="text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{course.location}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {specializations.map((s) => (
                  <SpecializationBadge
                    key={s.code}
                    code={s.code}
                    name={s.name}
                    role={s.role}
                  />
                ))}
              </div>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 sm:self-start"
            >
              <Link href={`/coschappen/${course.slug}/review`}>
                <Pencil size={16} /> Review schrijven
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-2">
            <StatPill
              label="Score"
              value={course.avg_rating ? course.avg_rating.toFixed(1) : "—"}
              hint={course.avg_rating ? "/ 5" : undefined}
            />
            <StatPill label="Reviews" value={course.review_count} />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <ReviewListSection
            courseSlug={course.slug}
            reviewCount={course.review_count}
            reviews={reviews}
          />

          <aside className="order-1 space-y-5 lg:order-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Over deze apotheek
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {course.description}
              </p>
              <a
                href={course.studiegids_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Website openen <ExternalLink size={12} />
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

async function fetchCourseDetail(code: string) {
  const supabase = await createSupabaseServerClient();
  const { data: course } = await supabase
    .from("courses_with_stats")
    .select("*")
    .eq("slug", code)
    .maybeSingle();

  if (!course?.id) return null;

  const [{ data: mapping }, { data: specs }] = await Promise.all([
    supabase
      .from("course_specializations")
      .select("role, specialization_id")
      .eq("course_id", course.id),
    supabase.from("specializations").select("id, code, name"),
  ]);

  const specLookup = new Map<number, { code: string; name: string }>();
  for (const s of specs ?? []) {
    specLookup.set(s.id, { code: s.code, name: s.name });
  }

  const specializations: SpecializationPill[] = [];
  for (const row of mapping ?? []) {
    const spec = specLookup.get(row.specialization_id);
    if (!spec) continue;
    specializations.push({
      code: spec.code,
      name: spec.name,
      role: row.role as "core" | "elective",
    });
  }
  specializations.sort((a, b) => {
    if (a.role !== b.role) return a.role === "core" ? -1 : 1;
    return a.code.localeCompare(b.code);
  });

  return {
    course: {
      id: course.id,
      slug: course.slug ?? code,
      title: course.title ?? "Onbekende apotheek",
      location: course.location ?? "",
      description: course.description ?? "",
      studiegids_url: course.studiegids_url ?? "#",
      color: course.color ?? "#001158",
      icon: course.icon ?? "hospital",
      avg_rating: Number(course.avg_rating ?? 0),
      review_count: Number(course.review_count ?? 0),
    },
    specializations,
  };
}

async function fetchReviews(courseId: string): Promise<ReviewCardData[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("reviews_public")
    .select("*")
    .eq("course_id", courseId);

  const reviews = (data ?? [])
    .filter((r) => r.id && r.title && r.body)
    .map((r) => ({
      id: r.id!,
      title: r.title!,
      body: r.body!,
      rating: Number(r.rating ?? 0),
    }));

  for (let i = reviews.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [reviews[i], reviews[j]] = [reviews[j], reviews[i]];
  }

  return reviews;
}
