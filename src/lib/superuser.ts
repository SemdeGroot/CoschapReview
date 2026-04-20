export const SUPERUSER_EMAIL = "s.r.de.groot.2@umail.leidenuniv.nl";

export function isSuperuserEmail(email: string | null | undefined): boolean {
  return email?.toLowerCase() === SUPERUSER_EMAIL.toLowerCase();
}
