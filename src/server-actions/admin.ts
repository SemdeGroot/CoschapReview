"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ALLOWED_EMAIL_DOMAIN_LABEL, isAllowedEmailDomain } from "@/lib/email-domains";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .refine((value) => isAllowedEmailDomain(value), {
    message: `Gebruik een universitair e-mailadres van ${ALLOWED_EMAIL_DOMAIN_LABEL}.`,
  });

const verifySchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Vul de 6-cijferige code in."),
});

const OPAQUE_ERROR = "Verificatie mislukt. Controleer je code en probeer het opnieuw.";

async function currentAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;
  return user;
}

/**
 * Verify OTP and gate admin access. On success, sets the session and reports
 * success to the client. If the verified user is not on the whitelist, the
 * session is revoked immediately and a generic error is returned so admin
 * existence does not leak.
 */
export async function verifyAdminOtpAction(
  email: string,
  code: string,
): Promise<{ ok: true; redirectTo: string } | { ok: false; error: string }> {
  const parsed = verifySchema.safeParse({ email, code });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? OPAQUE_ERROR };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });
  if (error) return { ok: false, error: OPAQUE_ERROR };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, error: OPAQUE_ERROR };
  }
  return { ok: true, redirectTo: "/admin/coschappen" };
}

export async function adminSignOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteCourseAction(
  courseId: string,
): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Geen toegang." };

  const supabase = await createSupabaseServerClient();
  const { data: course } = await supabase
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .maybeSingle();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/coschappen");
  if (course?.slug) revalidatePath(`/coschappen/${course.slug}`);
  return { ok: true };
}

export async function deleteReviewAction(
  reviewId: string,
): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Geen toegang." };

  const supabase = await createSupabaseServerClient();
  const { data: review } = await supabase
    .from("reviews")
    .select("course_id, courses(slug)")
    .eq("id", reviewId)
    .maybeSingle();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  if (review?.courses?.slug) revalidatePath(`/coschappen/${review.courses.slug}`);
  return { ok: true };
}
