export function normalizeCourseIdentity(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slugifyCoursePart(value: string) {
  return normalizeCourseIdentity(value).replace(/\s+/g, "-");
}

export function buildCourseSlugBase(title: string, location: string) {
  const parts = [slugifyCoursePart(title), slugifyCoursePart(location)].filter(Boolean);
  return parts.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "apotheek";
}
