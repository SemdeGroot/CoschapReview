"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ALLOWED_EMAIL_DOMAIN_LABEL, isAllowedEmailDomain } from "@/lib/email-domains";

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

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Send a 6-digit OTP to an email address. Session is not created yet; call
 * verifyOtpAction with the returned code. Session cookies are httpOnly.
 */
export async function requestOtpAction(rawEmail: string): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldig e-mailadres." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { shouldCreateUser: true, emailRedirectTo: undefined },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Verify the OTP code. On success, Supabase sets httpOnly session cookies via
 * the server client — future requests from this browser are authenticated.
 */
export async function verifyOtpAction(
  email: string,
  code: string,
): Promise<ActionResult> {
  const parsed = verifySchema.safeParse({ email, code });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
