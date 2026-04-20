import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminReviewsList, type AdminReviewRow } from "@/components/admin-reviews-list";

export const metadata = { title: "Admin · Beoordelingen" };

export default async function AdminReviewsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, title, body, rating, created_at, author_id, course_id, courses(slug, title)")
    .order("created_at", { ascending: false });

  const authorIds = Array.from(
    new Set((reviews ?? []).map((r) => r.author_id)),
  );
  const emailByAuthor = new Map<string, string>();
  if (authorIds.length > 0) {
    const adminClient = createSupabaseAdminClient();
    const { data } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    for (const u of data.users) {
      if (authorIds.includes(u.id) && u.email) {
        emailByAuthor.set(u.id, u.email);
      }
    }
  }

  const rows: AdminReviewRow[] = (reviews ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    rating: r.rating,
    created_at: r.created_at,
    author_id: r.author_id,
    course_id: r.course_id,
    authorEmail: emailByAuthor.get(r.author_id) ?? "unknown@",
    courseSlug: r.courses?.slug ?? null,
    courseTitle: r.courses?.title ?? null,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Beoordelingen
        </h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} review{rows.length === 1 ? "" : "s"} gepubliceerd.
        </p>
      </div>

      <AdminReviewsList reviews={rows} />
    </div>
  );
}
