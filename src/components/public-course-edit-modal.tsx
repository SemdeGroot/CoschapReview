"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmailDomainField } from "@/components/email-domain-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestOtpAction, verifyOtpAction } from "@/server-actions/auth";
import { updatePublicCourseAction } from "@/server-actions/courses";
import {
  ALLOWED_EMAIL_DOMAIN_LABEL,
  DEFAULT_EMAIL_DOMAIN,
  buildAllowedEmail,
  getAllowedEmailDomain,
  getEmailLocalPart,
  type AllowedEmailDomain,
} from "@/lib/email-domains";

type Spec = { id: number; code: string; name: string };
type Stage = "email" | "code" | "form";

type CourseData = {
  id: string;
  slug: string;
  title: string;
  location: string;
  description: string;
  studiegids_url: string;
  color: string;
  type_id: number | null;
};

type Props = {
  allSpecs: Spec[];
  course: CourseData;
  initialEmail: string | null;
  triggerClassName?: string;
  triggerLabel?: string;
};

export function PublicCourseEditModal({
  allSpecs,
  course,
  initialEmail,
  triggerClassName,
  triggerLabel = "Bewerken",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>(initialEmail ? "form" : "email");
  const [emailLocalPart, setEmailLocalPart] = useState(getEmailLocalPart(initialEmail));
  const [emailDomain, setEmailDomain] = useState<AllowedEmailDomain>(
    getAllowedEmailDomain(initialEmail) ?? DEFAULT_EMAIL_DOMAIN,
  );
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState(course.slug);
  const [title, setTitle] = useState(course.title);
  const [location, setLocation] = useState(course.location);
  const [description, setDescription] = useState(course.description);
  const [studiegidsUrl, setStudiegidsUrl] = useState(course.studiegids_url);
  const [color, setColor] = useState(course.color);
  const [typeId, setTypeId] = useState<number>(course.type_id ?? allSpecs[0]?.id ?? 0);
  const email = buildAllowedEmail(emailLocalPart, emailDomain);

  function resetForm() {
    setStage(initialEmail ? "form" : "email");
    setEmailLocalPart(getEmailLocalPart(initialEmail));
    setEmailDomain(getAllowedEmailDomain(initialEmail) ?? DEFAULT_EMAIL_DOMAIN);
    setCode("");
    setSlug(course.slug);
    setTitle(course.title);
    setLocation(course.location);
    setDescription(course.description);
    setStudiegidsUrl(course.studiegids_url);
    setColor(course.color);
    setTypeId(course.type_id ?? allSpecs[0]?.id ?? 0);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      resetForm();
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updatePublicCourseAction(course.id, {
        slug,
        title,
        location,
        description,
        studiegids_url: studiegidsUrl,
        color,
        type_id: typeId,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Apotheek bijgewerkt.");
      setOpen(false);
      router.push(`/coschappen/${result.data.slug}`);
      router.refresh();
    });
  }

  function onSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await requestOtpAction(email);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Er is een 6-cijferige code naar je student e-mailadres gestuurd.");
      setStage("code");
    });
  }

  function onVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(token)) {
      toast.error("Vul de 6-cijferige code uit je e-mail in.");
      return;
    }

    startTransition(async () => {
      const result = await verifyOtpAction(email, token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("E-mailadres bevestigd.");
      setStage("form");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <Pencil size={14} />
          <span>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apotheek bewerken</DialogTitle>
          <DialogDescription>
            Community edits zijn toegestaan. Controleer de gegevens zorgvuldig voordat je opslaat.
          </DialogDescription>
        </DialogHeader>

        {stage === "email" ? (
          <form onSubmit={onSendCode} className="space-y-4">
            <EmailDomainField
              localPart={emailLocalPart}
              domain={emailDomain}
              onLocalPartChange={setEmailLocalPart}
              onDomainChange={setEmailDomain}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Toegestane domeinen: {ALLOWED_EMAIL_DOMAIN_LABEL}
            </p>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={pending}>
                <Mail size={16} /> {pending ? "Versturen..." : "Code versturen"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {stage === "code" ? (
          <form onSubmit={onVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-edit-code">Verificatiecode</Label>
              <Input
                id="course-edit-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]*"
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                disabled={pending}
                className="text-center font-mono tracking-[0.4em]"
              />
              <p className="text-xs text-muted-foreground">
                Er is een 6-cijferige code gestuurd naar{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStage("email");
                  setCode("");
                }}
                disabled={pending}
              >
                <ArrowLeft size={14} /> Ander e-mailadres gebruiken
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Controleren..." : "Bevestigen"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {stage === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="public-edit-slug">Code (URL)</Label>
              <Input
                id="public-edit-slug"
                required
                minLength={2}
                maxLength={80}
                pattern="[a-z0-9-]+"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-edit-title">Naam</Label>
              <Input
                id="public-edit-title"
                required
                minLength={2}
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-edit-location">Locatie</Label>
              <Input
                id="public-edit-location"
                required
                maxLength={200}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-edit-type">Type apotheek</Label>
              <Select
                value={String(typeId)}
                onValueChange={(value) => setTypeId(Number(value))}
                disabled={pending}
              >
                <SelectTrigger id="public-edit-type" className="w-full">
                  <SelectValue placeholder="Selecteer een type" />
                </SelectTrigger>
                <SelectContent>
                  {allSpecs.map((spec) => (
                    <SelectItem key={spec.id} value={String(spec.id)}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-edit-description">Beschrijving</Label>
              <textarea
                id="public-edit-description"
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={pending}
                className="max-h-[280px] min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Bijvoorbeeld: Openbare apotheek gespecialiseerd in baxterproductie."
              />
              <p className="text-xs text-muted-foreground">
                Beschrijf de apotheek feitelijk en objectief. Dit is nog geen review, maar basisinformatie over de locatie.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-edit-website">Apotheek website</Label>
              <Input
                id="public-edit-website"
                type="url"
                value={studiegidsUrl}
                onChange={(event) => setStudiegidsUrl(event.target.value)}
                disabled={pending}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="public-edit-color">Kleur</Label>
              <div className="flex items-center gap-3">
                <input
                  id="public-edit-color"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  disabled={pending}
                  className="h-9 w-14 cursor-pointer rounded-md border border-input bg-background p-1 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="font-mono text-sm text-muted-foreground">{color}</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {pending ? "Opslaan..." : "Opslaan"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
