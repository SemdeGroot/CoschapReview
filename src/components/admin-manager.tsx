"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addAdminAction, removeAdminAction } from "@/server-actions/admin";
import { SUPERUSER_EMAIL } from "@/lib/superuser";

type Admin = { email: string; created_at: string };

type Props = {
  admins: Admin[];
  isSuperuser: boolean;
};

export function AdminManager({ admins, isSuperuser }: Props) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    startTransition(async () => {
      const res = await addAdminAction(value);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${value} toegevoegd als admin.`);
      setEmail("");
    });
  }

  function handleRemove(targetEmail: string) {
    startTransition(async () => {
      const res = await removeAdminAction(targetEmail);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${targetEmail} verwijderd als admin.`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-3 py-3 text-left font-medium">Toegevoegd</th>
              {isSuperuser && <th className="px-3 py-3 text-right font-medium">Acties</th>}
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isSelf = a.email.toLowerCase() === SUPERUSER_EMAIL.toLowerCase();
              return (
                <tr key={a.email} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono">
                    {a.email}
                    {isSelf && (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        superuser
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  {isSuperuser && (
                    <td className="px-3 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf || pending}
                        onClick={() => handleRemove(a.email)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                        <span className="sr-only">Verwijderen</span>
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isSuperuser && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            type="email"
            placeholder="nieuw@umail.leidenuniv.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            className="max-w-sm"
          />
          <Button
            type="submit"
            disabled={pending || !email.trim()}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {pending ? "Toevoegen..." : "Admin toevoegen"}
          </Button>
        </form>
      )}
    </div>
  );
}
