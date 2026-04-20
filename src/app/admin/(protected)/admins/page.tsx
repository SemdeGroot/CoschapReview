import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminManager } from "@/components/admin-manager";
import { isSuperuserEmail } from "@/lib/superuser";

export const metadata = { title: "Admin - Admins" };

export default async function AdminAdminsPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: { user } }, { data: admins }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("admins").select("*").order("created_at", { ascending: true }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admins</h1>
        <p className="text-sm text-muted-foreground">
          E-mailadressen die toegang hebben tot <span className="font-mono">/admin</span>.
        </p>
      </div>

      <AdminManager
        admins={admins ?? []}
        isSuperuser={isSuperuserEmail(user?.email)}
      />
    </div>
  );
}
