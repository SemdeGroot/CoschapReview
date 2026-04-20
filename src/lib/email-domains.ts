export const ALLOWED_EMAIL_DOMAINS = [
  { value: "umail.leidenuniv.nl", label: "Leiden", exampleLocalPart: "s1234567" },
  { value: "students.uu.nl", label: "Utrecht", exampleLocalPart: "j.a.janssen" },
  { value: "student.rug.nl", label: "Groningen", exampleLocalPart: "s1234567" },
] as const;

export type AllowedEmailDomain = (typeof ALLOWED_EMAIL_DOMAINS)[number]["value"];

export const DEFAULT_EMAIL_DOMAIN: AllowedEmailDomain = "umail.leidenuniv.nl";

export const ALLOWED_EMAIL_EXAMPLES = ALLOWED_EMAIL_DOMAINS.map(
  ({ value, exampleLocalPart }) => `${exampleLocalPart}@${value}`,
);

export const ALLOWED_EMAIL_DOMAIN_LABEL = ALLOWED_EMAIL_DOMAINS
  .map(({ value }) => `@${value}`)
  .join(", ");

export function isAllowedEmailDomain(email: string) {
  const normalised = email.trim().toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some(({ value }) => normalised.endsWith(`@${value}`));
}

export function getAllowedEmailDomain(email: string | null | undefined): AllowedEmailDomain | null {
  const normalised = email?.trim().toLowerCase() ?? "";
  const match = ALLOWED_EMAIL_DOMAINS.find(({ value }) =>
    normalised.endsWith(`@${value}`),
  );
  return match?.value ?? null;
}

export function getEmailLocalPart(email: string | null | undefined) {
  const normalised = email?.trim().toLowerCase() ?? "";
  const [localPart] = normalised.split("@");
  return localPart ?? "";
}

export function buildAllowedEmail(localPart: string, domain: AllowedEmailDomain) {
  const normalisedLocalPart = getEmailLocalPart(localPart).replace(/\s+/g, "");
  return `${normalisedLocalPart}@${domain}`;
}

export function getEmailExampleLocalPart(domain: AllowedEmailDomain) {
  return (
    ALLOWED_EMAIL_DOMAINS.find(({ value }) => value === domain)?.exampleLocalPart ?? "s1234567"
  );
}
