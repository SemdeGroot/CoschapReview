"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  createPublicCourseAction,
  findCourseDuplicateCandidatesAction,
} from "@/server-actions/courses";
import {
  ALLOWED_EMAIL_DOMAIN_LABEL,
  DEFAULT_EMAIL_DOMAIN,
  buildAllowedEmail,
  getAllowedEmailDomain,
  getEmailLocalPart,
  type AllowedEmailDomain,
} from "@/lib/email-domains";
import { DEFAULT_COURSE_COLOR } from "@/lib/colors";

type Spec = { id: number; code: string; name: string };
type Stage = "email" | "code" | "form";

type DuplicateCandidate = {
  id: string;
  slug: string;
  title: string;
  location: string;
  combined_similarity: number;
};

type Props = {
  allSpecs: Spec[];
  initialEmail: string | null;
};

export function PublicCourseAddModal({ allSpecs, initialEmail }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMatches, setWarningMatches] = useState<DuplicateCandidate[]>([]);
  const [stage, setStage] = useState<Stage>(initialEmail ? "form" : "email");
  const [emailLocalPart, setEmailLocalPart] = useState(getEmailLocalPart(initialEmail));
  const [emailDomain, setEmailDomain] = useState<AllowedEmailDomain>(
    getAllowedEmailDomain(initialEmail) ?? DEFAULT_EMAIL_DOMAIN,
  );
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_COURSE_COLOR);
  const [typeId, setTypeId] = useState<number>(allSpecs[0]?.id ?? 0);
  const email = useMemo(
    () => buildAllowedEmail(emailLocalPart, emailDomain),
    [emailDomain, emailLocalPart],
  );

  function resetForm() {
    setWarningOpen(false);
    setWarningMatches([]);
    setStage(initialEmail ? "form" : "email");
    setEmailLocalPart(getEmailLocalPart(initialEmail));
    setEmailDomain(getAllowedEmailDomain(initialEmail) ?? DEFAULT_EMAIL_DOMAIN);
    setCode("");
    setTitle("");
    setLocation("");
    setDescription("");
    setWebsite("");
    setColor(DEFAULT_COURSE_COLOR);
    setTypeId(allSpecs[0]?.id ?? 0);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function submitCourse(force = false) {
    startTransition(async () => {
      if (!force) {
        const duplicateCheck = await findCourseDuplicateCandidatesAction({ title, location });
        if (!duplicateCheck.ok) {
          toast.error(duplicateCheck.error);
          return;
        }

        if (duplicateCheck.data.exactDuplicate) {
          toast.error("Er bestaat al een apotheek met deze naam op deze locatie.");
          return;
        }

        if (duplicateCheck.data.candidates.length > 0) {
          setWarningMatches(duplicateCheck.data.candidates);
          setWarningOpen(true);
          return;
        }
      }

      const result = await createPublicCourseAction({
        title,
        location,
        description,
        studiegids_url: website.trim(),
        color,
        type_id: typeId,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Apotheek toegevoegd.");
      setWarningOpen(false);
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

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCourse(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus size={14} /> Apotheek toevoegen
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apotheek toevoegen</DialogTitle>
            <DialogDescription>
              Voeg een ontbrekende apotheek toe zodat andere studenten daar ook reviews over kunnen lezen en plaatsen.
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
                <Label htmlFor="course-add-code">Verificatiecode</Label>
                <Input
                  id="course-add-code"
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
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="public-course-title">Naam</Label>
                <Input
                  id="public-course-title"
                  required
                  minLength={2}
                  maxLength={120}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="public-course-location">Locatie</Label>
                <Input
                  id="public-course-location"
                  required
                  maxLength={200}
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  disabled={pending}
                  placeholder="Leiden"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="public-course-type">Type apotheek</Label>
                <Select
                  value={String(typeId)}
                  onValueChange={(value) => setTypeId(Number(value))}
                  disabled={pending}
                >
                  <SelectTrigger id="public-course-type" className="w-full">
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
                <Label htmlFor="public-course-description">Beschrijving</Label>
                <textarea
                  id="public-course-description"
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
                <Label htmlFor="public-course-website">Apotheek website</Label>
                <Input
                  id="public-course-website"
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  disabled={pending}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Optioneel. Laat leeg als je de website niet weet.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="public-course-color">Kleur</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="public-course-color"
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    disabled={pending}
                    className="h-9 w-14 cursor-pointer rounded-md border border-input bg-background p-1 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="font-mono text-sm text-muted-foreground">{color}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Je krijgt eerst een waarschuwing als de naam en locatie lijken op een bestaande apotheek.
              </p>

              <DialogFooter className="gap-2 sm:justify-between">
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
                  {pending ? "Controleren..." : "Apotheek toevoegen"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={warningOpen} onOpenChange={setWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vergelijkbare apotheken gevonden</AlertDialogTitle>
            <AlertDialogDescription>
              Deze apotheken lijken op jouw invoer. Is jouw apotheek echt anders, dan kun je alsnog doorgaan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            {warningMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                <div className="font-medium text-foreground">{match.title}</div>
                <div className="text-muted-foreground">{match.location}</div>
              </div>
            ))}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Terug</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                submitCourse(true);
              }}
            >
              {pending ? "Toevoegen..." : "Toch doorgaan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
