import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons/Icon";
import { getIconKeyByTypeCode } from "@/lib/icons/registry";
import { type ReviewCardData } from "@/components/review-card";
import { ReviewListSection } from "@/components/review-list-section";
import { SpecializationBadge } from "@/components/specialization-badge";
import { StatPill } from "@/components/stat-pill";
import { getCourseIconColor } from "@/lib/colors";
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

  const { course, ownReviewId } = detail;
  const reviews = await fetchReviews(course.id);
  const iconColor = getCourseIconColor(course.color);

  return (
    <>
      <section
        className="animate-fade-up border-b border-border"
        style={{
          background: `linear-gradient(180deg, ${course.color}08 0%, transparent 100%)`,
        }}
      >
        <div className="site-gutter mx-auto w-full max-w-5xl py-10 sm:py-14">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Alle coschappen
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ backgroundColor: course.color, color: iconColor }}
              aria-hidden
            >
              <Icon name={getIconKeyByTypeCode(course.type_code)} size={28} className="text-current" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{course.location}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {course.type_code && course.type_name && (
                  <SpecializationBadge
                    code={course.type_code}
                    name={course.type_name}
                  />
                )}
              </div>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto sm:self-start"
            >
              <Link href={`/coschappen/${course.slug}/review`}>
                <Pencil size={16} /> {ownReviewId ? "Review bewerken" : "Review schrijven"}
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-4 rounded-lg border border-border bg-card p-5 sm:gap-x-6">
            <StatPill
              label="Score"
              value={course.avg_rating ? course.avg_rating.toFixed(1) : "—"}
              hint={course.avg_rating ? "/ 5" : undefined}
            />
            <StatPill label="Reviews" value={course.review_count} />
          </div>
        </div>
      </section>

      <section className="site-gutter animate-fade-up-d1 mx-auto w-full max-w-5xl py-10">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <ReviewListSection
            courseSlug={course.slug}
            reviewCount={course.review_count}
            reviews={reviews}
            ownReviewId={ownReviewId}
          />

          <aside className="order-1 space-y-5 lg:order-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Over deze apotheek
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {course.description}
              </p>
              {course.studiegids_url ? (
                <a
                  href={course.studiegids_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Website openen <ExternalLink size={12} />
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

async function fetchCourseDetail(code: string) {
  const supabase = await createSupabaseServerClient();
  const [
    { data: course },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase.from("courses_with_stats").select("*").eq("slug", code).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!course?.id) return null;

  const { data: ownReview } = user
    ? await supabase.from("reviews").select("id").eq("course_id", course.id).maybeSingle()
    : { data: null };

  return {
    course: {
      id: course.id,
      slug: course.slug ?? code,
      title: course.title ?? "Onbekende apotheek",
      location: course.location ?? "",
      description: course.description ?? "",
      studiegids_url: course.studiegids_url ?? "",
      color: course.color ?? "#001158",
      type_code: course.type_code ?? null,
      type_name: course.type_name ?? null,
      avg_rating: Number(course.avg_rating ?? 0),
      review_count: Number(course.review_count ?? 0),
    },
    ownReviewId: ownReview?.id ?? null,
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
