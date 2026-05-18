import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { getIconKeyByTypeCode } from "@/lib/icons/registry";

export const dynamic = "force-dynamic";

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables.");
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function GET() {
  const supabase = createPublicSupabaseClient();

  const [coursesRes, specsRes] = await Promise.all([
    supabase
      .from("courses_with_stats")
      .select("*")
      .order("review_count", { ascending: false }),
    supabase
      .from("specializations")
      .select("id, code, name")
      .order("id", { ascending: true }),
  ]);

  if (coursesRes.error || specsRes.error) {
    console.error("Failed to load public course overview", {
      coursesError: coursesRes.error,
      specializationsError: specsRes.error,
    });

    return NextResponse.json(
      { error: "Kon de coschappen niet laden." },
      { status: 500 },
    );
  }

  const courses = (coursesRes.data ?? [])
    .filter((course) => course.id && course.slug && course.title)
    .map((course) => ({
      id: course.id!,
      slug: course.slug!,
      title: course.title!,
      location: course.location ?? "",
      description: course.description ?? "",
      studiegids_url: course.studiegids_url ?? "",
      color: course.color ?? "#001158",
      icon: getIconKeyByTypeCode(course.type_code),
      type_id: course.type_id ?? null,
      avg_rating: Number(course.avg_rating ?? 0),
      review_count: Number(course.review_count ?? 0),
      specializations: course.type_code && course.type_name
        ? [{ code: course.type_code, name: course.type_name }]
        : [],
    }));

  return NextResponse.json({
    courses,
    specializations: specsRes.data ?? [],
  });
}
