"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { courseInputSchema, type CourseInput } from "@/lib/course-input";
import { buildCourseSlugBase } from "@/lib/course-submission";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

const duplicateCheckSchema = z.object({
  title: z.string().trim().min(2, "Naam is te kort.").max(120, "Naam is te lang."),
  location: z.string().trim().min(1, "Plaats is verplicht.").max(200, "Plaats is te lang."),
});

const publicCourseSchema = duplicateCheckSchema.extend({
  description: z.string().trim().min(10, "Beschrijving is te kort.").max(2000, "Beschrijving is te lang."),
  studiegids_url: z.union([z.literal(""), z.string().trim().url("Vul een geldige website-URL in.")]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Ongeldige kleurcode."),
  type_id: z.number().int().min(1, "Selecteer een type apotheek."),
});

export type PublicCourseInput = z.infer<typeof publicCourseSchema>;

type DuplicateCandidate = {
  id: string;
  slug: string;
  title: string;
  location: string;
  title_similarity: number;
  location_similarity: number;
  combined_similarity: number;
  exact_duplicate: boolean;
};

async function buildUniqueSlug(title: string, location: string) {
  const supabase = await createSupabaseServerClient();
  const baseSlug = buildCourseSlugBase(title, location).slice(0, 68).replace(/-$/g, "") || "apotheek";

  const { data, error } = await supabase
    .from("courses")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(error.message);
  }

  const existingSlugs = new Set((data ?? []).map((course) => course.slug));
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  for (let suffix = 2; suffix < 200; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`;
    if (!existingSlugs.has(candidate)) return candidate;
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function findCourseDuplicateCandidatesAction(
  input: z.input<typeof duplicateCheckSchema>,
): Promise<ActionResult<{ exactDuplicate: boolean; candidates: DuplicateCandidate[] }>> {
  const parsed = duplicateCheckSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("find_course_duplicate_candidates", {
    input_title: parsed.data.title,
    input_location: parsed.data.location,
    match_limit: 5,
  });

  if (error) return { ok: false, error: "Kon niet controleren op vergelijkbare apotheken." };

  const candidates = (data ?? []).filter(
    (candidate): candidate is DuplicateCandidate =>
      Boolean(candidate?.id && candidate?.slug && candidate?.title && candidate?.location),
  );

  return {
    ok: true,
    data: {
      exactDuplicate: candidates.some((candidate) => candidate.exact_duplicate),
      candidates,
    },
  };
}

export async function createPublicCourseAction(
  input: z.input<typeof publicCourseSchema>,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = publicCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Bevestig eerst je student e-mailadres voordat je een apotheek toevoegt." };
  }

  let slug: string;

  try {
    slug = await buildUniqueSlug(parsed.data.title, parsed.data.location);
  } catch {
    return { ok: false, error: "Kon deze apotheek niet voorbereiden om toe te voegen." };
  }

  const { data, error } = await supabase
    .from("courses")
    .insert({
      slug,
      title: parsed.data.title,
      location: parsed.data.location,
      description: parsed.data.description,
      studiegids_url: parsed.data.studiegids_url,
      color: parsed.data.color,
      type_id: parsed.data.type_id,
    })
    .select("slug")
    .maybeSingle();

  if (error) {
    if (
      error.code === "23505" &&
      error.message.includes("courses_title_location_normalized_idx")
    ) {
      return {
        ok: false,
        error: "Er bestaat al een apotheek met deze naam op deze locatie.",
      };
    }

    if (error.code === "23505") {
      return { ok: false, error: "Deze apotheek kon niet worden toegevoegd door een dubbele waarde." };
    }

    return { ok: false, error: error.message };
  }

  revalidatePath("/");

  return { ok: true, data: { slug: data?.slug ?? slug } };
}

export async function updatePublicCourseAction(
  courseId: string,
  input: CourseInput,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = courseInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Bevestig eerst je student e-mailadres voordat je een apotheek bewerkt." };
  }

  const { data, error } = await supabase
    .from("courses")
    .update({
      slug: parsed.data.slug,
      title: parsed.data.title,
      location: parsed.data.location,
      description: parsed.data.description,
      studiegids_url: parsed.data.studiegids_url,
      color: parsed.data.color,
      type_id: parsed.data.type_id,
    })
    .eq("id", courseId)
    .select("slug")
    .maybeSingle();

  if (error) {
    if (
      error.code === "23505" &&
      error.message.includes("courses_title_location_normalized_idx")
    ) {
      return {
        ok: false,
        error: "Er bestaat al een apotheek met deze naam op deze locatie.",
      };
    }

    if (error.code === "23505") {
      return { ok: false, error: "Deze code is al in gebruik." };
    }

    return { ok: false, error: error.message };
  }

  const slug = data?.slug ?? parsed.data.slug;
  revalidatePath("/");
  revalidatePath(`/coschappen/${slug}`);

  return { ok: true, data: { slug } };
}
