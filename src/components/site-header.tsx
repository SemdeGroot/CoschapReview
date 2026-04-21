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
    <header className="site-shell-top sticky top-0 z-40 border-b border-black/6 shadow-[0_1px_0_rgba(17,22,24,0.04)]">
      <div className="site-gutter mx-auto flex w-full max-w-6xl items-center justify-between pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
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
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {user?.email ? (
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            ) : null}
            <Button
              asChild
              size="sm"
              className="border border-primary/12 bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(92,119,143,0.18)] hover:bg-primary/92"
            >
              <Link href="/#coschappen">Bekijk coschappen</Link>
            </Button>
            {user ? (
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="gap-2 border border-black/8 bg-white/62 text-foreground shadow-none hover:bg-white/88 hover:text-foreground"
                >
                  <LogOut size={14} />
                  Uitloggen
                </Button>
              </form>
            ) : null}
          </div>

          {user ? (
            <form action={signOutAction} className="sm:hidden">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="gap-2 border border-black/8 bg-white/62 text-foreground shadow-none hover:bg-white/88 hover:text-foreground"
              >
                <LogOut size={14} />
                Uitloggen
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
