"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ALLOWED_EMAIL_DOMAIN_LABEL, isAllowedEmailDomain } from "@/lib/email-domains";
import { isSuperuserEmail, SUPERUSER_EMAIL } from "@/lib/superuser";

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

export async function addAdminAction(email: string): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin || !isSuperuserEmail(admin.email)) return { ok: false, error: "Geen toegang." };

  const parsed = z.string().trim().toLowerCase().email("Ongeldig e-mailadres.").safeParse(email);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldig e-mailadres." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("admins").insert({ email: parsed.data });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Dit e-mailadres is al een admin." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function removeAdminAction(email: string): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin || !isSuperuserEmail(admin.email)) return { ok: false, error: "Geen toegang." };
  if (email.toLowerCase() === SUPERUSER_EMAIL.toLowerCase()) {
    return { ok: false, error: "Het superuser-account kan niet verwijderd worden." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("admins").delete().eq("email", email);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/admins");
  return { ok: true };
}

const courseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Code is te kort.")
    .max(80, "Code is te lang.")
    .regex(/^[a-z0-9-]+$/, "Gebruik alleen kleine letters, cijfers en koppeltekens."),
  title: z.string().trim().min(2, "Titel is te kort.").max(120, "Titel is te lang."),
  location: z.string().trim().min(1, "Locatie is verplicht.").max(200),
  description: z.string().trim().min(1, "Beschrijving is verplicht.").max(2000),
  studiegids_url: z.string().trim().url("Ongeldige URL."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Ongeldige kleurcode."),
  type_id: z.number().int().min(1, "Selecteer een type apotheek."),
});

export type CourseInput = z.infer<typeof courseSchema>;

export async function createCourseAction(data: CourseInput): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Geen toegang." };

  const parsed = courseSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("courses").insert({
    slug: parsed.data.slug,
    title: parsed.data.title,
    location: parsed.data.location,
    description: parsed.data.description,
    studiegids_url: parsed.data.studiegids_url,
    color: parsed.data.color,
    type_id: parsed.data.type_id,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Deze code is al in gebruik." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/coschappen");
  return { ok: true };
}

export async function updateCourseAction(
  courseId: string,
  data: CourseInput,
): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Geen toegang." };

  const parsed = courseSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };

  const supabase = await createSupabaseServerClient();
  const { data: course, error: courseError } = await supabase
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
  if (courseError) {
    if (courseError.code === "23505") return { ok: false, error: "Deze code is al in gebruik." };
    return { ok: false, error: courseError.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/coschappen");
  if (course?.slug) revalidatePath(`/coschappen/${course.slug}`);
  return { ok: true };
}
