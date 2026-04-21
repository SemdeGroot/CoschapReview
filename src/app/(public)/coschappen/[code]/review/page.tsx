import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ReviewFlow } from "@/components/review-flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteParams = Promise<{ code: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: RouteParams }) {
  const { code } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("title")
    .eq("slug", code)
    .maybeSingle();
  return { title: data ? `Review schrijven · ${data.title}` : "Review schrijven" };
}

export default async function AddReviewPage({ params }: { params: RouteParams }) {
  const { code } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("slug", code)
    .maybeSingle();
  if (!course) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existingReview } = user
    ? await supabase
        .from("reviews")
        .select("id, title, body, rating")
        .eq("course_id", course.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="site-gutter animate-fade-up mx-auto w-full max-w-xl py-10 sm:py-14">
      <Link
        href={`/coschappen/${course.slug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Terug naar {course.title}
      </Link>
      <ReviewFlow
        course={{ id: course.id, slug: course.slug, title: course.title }}
        initialEmail={user?.email ?? null}
        initialReview={existingReview}
      />
    </div>
  );
}
