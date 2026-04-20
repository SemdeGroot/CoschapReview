"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const reviewInputSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(3, "De titel moet minimaal 3 tekens bevatten.").max(120),
  body: z.string().trim().min(10, "De review moet minimaal 10 tekens bevatten.").max(4000),
  rating: z.number().int().min(1).max(5),
});

export type ReviewSubmitResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function submitReviewAction(
  input: z.input<typeof reviewInputSchema>,
): Promise<ReviewSubmitResult> {
  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error: "Je sessie is verlopen. Bevestig je e-mailadres opnieuw.",
    };
  }

  const { courseId, ...rest } = parsed.data;

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .maybeSingle();
  if (courseError || !course) {
    return { ok: false, error: "Coschap niet gevonden." };
  }

  const { error } = await supabase.from("reviews").insert({
    course_id: courseId,
    author_id: user.id,
    ...rest,
  });
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Je hebt dit coschap al beoordeeld. Vraag een admin om je bestaande review eerst te verwijderen.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/coschappen/${course.slug}`);
  return { ok: true, redirectTo: `/coschappen/${course.slug}` };
}
