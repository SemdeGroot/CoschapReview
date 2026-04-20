"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmailDomainField } from "@/components/email-domain-field";
import { requestOtpAction } from "@/server-actions/auth";
import { verifyAdminOtpAction } from "@/server-actions/admin";
import {
  ALLOWED_EMAIL_DOMAIN_LABEL,
  DEFAULT_EMAIL_DOMAIN,
  buildAllowedEmail,
  type AllowedEmailDomain,
} from "@/lib/email-domains";
type Stage = "email" | "code";

export function AdminLoginFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [emailDomain, setEmailDomain] = useState<AllowedEmailDomain>(DEFAULT_EMAIL_DOMAIN);
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const email = buildAllowedEmail(emailLocalPart, emailDomain);

  function onSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const res = await requestOtpAction(email);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Er is een 6-cijferige code naar je e-mailadres gestuurd.");
      setStage("code");
    });
  }

  function onVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(token)) {
      toast.error("Vul de 6-cijferige code uit je e-mail in.");
      return;
    }
    startTransition(async () => {
      const res = await verifyAdminOtpAction(email, token);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      router.push(res.redirectTo);
      router.refresh();
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Admintoegang</CardTitle>
        <CardDescription>
          {stage === "email"
            ? "Bevestig je e-mailadres om verder te gaan."
            : `Er is een 6-cijferige code gestuurd naar ${email}.`}
        </CardDescription>
      </CardHeader>

      {stage === "email" ? (
        <form onSubmit={onSendCode}>
          <CardContent className="space-y-2">
            <EmailDomainField
              localPart={emailLocalPart}
              domain={emailDomain}
              onLocalPartChange={setEmailLocalPart}
              onDomainChange={setEmailDomain}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Toegestaan: {ALLOWED_EMAIL_DOMAIN_LABEL}
            </p>
          </CardContent>
          <CardFooter className="mt-5">
            <Button type="submit" className="w-full" disabled={pending}>
              <Mail size={16} /> {pending ? "Versturen..." : "Code versturen"}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={onVerifyCode}>
          <CardContent className="space-y-2">
            <Label htmlFor="code">Verificatiecode</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={8}
              required
              placeholder="12345678"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={pending}
              className="tracking-[0.4em] text-center text-lg font-mono"
            />
          </CardContent>
          <CardFooter className="mt-5 flex-col gap-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Controleren..." : "Bevestigen"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setStage("email");
                setCode("");
              }}
              disabled={pending}
            >
              <ArrowLeft size={14} /> Ander e-mailadres gebruiken
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
