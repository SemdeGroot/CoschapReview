"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/server-actions/auth";

type PublicSignOutButtonProps = {
  className?: string;
};

export function PublicSignOutButton({
  className,
}: PublicSignOutButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOutAction();

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleSignOut}
      disabled={pending}
    >
      <LogOut size={14} />
      {pending ? "Uitloggen..." : "Uitloggen"}
    </Button>
  );
}
