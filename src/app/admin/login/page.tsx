import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { AdminLoginFlow } from "@/components/admin-login-flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin · CoschapReview" };

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin) redirect("/admin/coschappen");
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-leiden-surface">
      <header className="flex items-center justify-center px-4 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span
            className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
            aria-hidden
          >
            <Building2 size={18} />
          </span>
          CoschapReview
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <AdminLoginFlow />
        </div>
      </main>
    </div>
  );
}
