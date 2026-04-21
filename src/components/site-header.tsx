import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/server-actions/auth";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="site-shell sticky top-0 z-40 border-b border-black/6 pt-[env(safe-area-inset-top)] text-white shadow-[0_8px_24px_rgba(17,22,24,0.08)]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="relative flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo.png"
            alt="Farmacoschap logo"
            width={52}
            height={52}
            className="h-13 w-auto"
            priority
          />
          Farmacoschap
        </Link>
        <div className="relative flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="border border-white/50 bg-white/88 text-primary shadow-none hover:bg-white"
          >
            <Link href="/#coschappen">Bekijk coschappen</Link>
          </Button>
          {user ? (
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="gap-2 border border-white/28 bg-white/8 text-white hover:bg-white/14 hover:text-white"
              >
                <LogOut size={14} />
                Sign out
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
