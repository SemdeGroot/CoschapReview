export const ALLOWED_EMAIL_DOMAINS = [
  "umail.leidenuniv.nl",
  "students.uu.nl",
] as const;

export const ALLOWED_EMAIL_EXAMPLES = [
  "s1234567@umail.leidenuniv.nl",
  "j.a.janssen@students.uu.nl",
] as const;

export const ALLOWED_EMAIL_DOMAIN_LABEL = ALLOWED_EMAIL_DOMAINS
  .map((domain) => `@${domain}`)
  .join(", ");

export function isAllowedEmailDomain(email: string) {
  const normalised = email.trim().toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some((domain) => normalised.endsWith(`@${domain}`));
}
