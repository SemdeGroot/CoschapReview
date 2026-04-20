"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { RatingInput } from "@/components/rating-input";
import { requestOtpAction, verifyOtpAction } from "@/server-actions/auth";
import { submitReviewAction } from "@/server-actions/reviews";
import {
  ALLOWED_EMAIL_DOMAIN_LABEL,
  DEFAULT_EMAIL_DOMAIN,
  buildAllowedEmail,
  getAllowedEmailDomain,
  getEmailLocalPart,
  type AllowedEmailDomain,
} from "@/lib/email-domains";

type Stage = "email" | "code" | "form";

type Props = {
  course: { id: string; slug: string; title: string };
  initialEmail: string | null;
};

export function ReviewFlow({ course, initialEmail }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(initialEmail ? "form" : "email");
  const [emailLocalPart, setEmailLocalPart] = useState(getEmailLocalPart(initialEmail));
  const [emailDomain, setEmailDomain] = useState<AllowedEmailDomain>(
    getAllowedEmailDomain(initialEmail) ?? DEFAULT_EMAIL_DOMAIN,
  );
  const [code, setCode] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);

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
      const res = await verifyOtpAction(email, token);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("E-mailadres bevestigd.");
      setStage("form");
    });
  }

  function onSubmitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) {
      toast.error("Kies een score met sterren.");
      return;
    }
    startTransition(async () => {
      const res = await submitReviewAction({
        courseId: course.id,
        title: title.trim(),
        body: body.trim(),
        rating,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Je review is geplaatst.");
      router.push(res.redirectTo);
      router.refresh();
    });
  }

  if (stage === "email") {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Bevestig je e-mailadres</CardTitle>
          <CardDescription>
            Je ontvangt een 6-cijferige code om te bevestigen dat je een echte reviewer bent. Je
            review blijft anoniem en je e-mailadres wordt nergens getoond.
          </CardDescription>
        </CardHeader>
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
      </Card>
    );
  }

  if (stage === "code") {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Vul je code in</CardTitle>
          <CardDescription>
            Er is een 6-cijferige code gestuurd naar{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onVerifyCode}>
          <CardContent className="space-y-2">
            <Label htmlFor="code">Verificatiecode</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={pending}
              className="tracking-[0.4em] text-center text-lg font-mono"
            />
          </CardContent>
          <CardFooter className="mt-5 flex-col gap-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Controleren..." : "Bevestigen en doorgaan"}
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
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Schrijf je review</CardTitle>
        <CardDescription>
          Je reviewt <span className="font-medium text-foreground">{course.title}</span>.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmitReview}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              required
              minLength={3}
              maxLength={120}
              placeholder="Bijvoorbeeld: goede begeleiding, veel geleerd, maar wel druk"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Jouw ervaring</Label>
            <textarea
              id="body"
              required
              minLength={10}
              maxLength={4000}
              rows={6}
              placeholder="Hoe was de begeleiding? Wat deed je op een normale dag? Wat moeten toekomstige studenten vooraf weten?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={pending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              {body.length} / 4000
            </p>
            <p className="text-xs text-muted-foreground">
              Houd je review netjes, feitelijk en behulpzaam voor andere studenten. Onnodig kwetsende of ongepaste reviews kunnen worden verwijderd.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Score</Label>
            <RatingInput value={rating} onChange={setRating} />
            <p className="text-xs text-muted-foreground">
              Geef dit coschap een simpele beoordeling van 1 tot 5 sterren.
            </p>
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex-col gap-2">
          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={pending}
          >
            {pending ? "Plaatsen..." : "Review plaatsen"}
          </Button>
          <Button asChild type="button" variant="ghost" size="sm" className="w-full">
            <Link href={`/coschappen/${course.slug}`}>Annuleren</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
