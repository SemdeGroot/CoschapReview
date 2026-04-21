"use client";

import { useState, useEffect, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCourseAction } from "@/server-actions/admin";

type Spec = { id: number; code: string; name: string };

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
  course: CourseData;
  allSpecs: Spec[];
};

export function CourseEditModal({ course, allSpecs }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [slug, setSlug] = useState(course.slug);
  const [title, setTitle] = useState(course.title);
  const [location, setLocation] = useState(course.location);
  const [description, setDescription] = useState(course.description);
  const [studiegidsUrl, setStudiegidsUrl] = useState(course.studiegids_url);
  const [color, setColor] = useState(course.color);
  const [typeId, setTypeId] = useState<number>(course.type_id ?? allSpecs[0]?.id ?? 0);

  useEffect(() => {
    if (!open) return;
    setSlug(course.slug);
    setTitle(course.title);
    setLocation(course.location);
    setDescription(course.description);
    setStudiegidsUrl(course.studiegids_url);
    setColor(course.color);
    setTypeId(course.type_id ?? allSpecs[0]?.id ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateCourseAction(course.id, {
        slug,
        title,
        location,
        description,
        studiegids_url: studiegidsUrl,
        color,
        type_id: typeId,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Apotheek bijgewerkt.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil size={14} />
          <span className="sr-only sm:not-sr-only">Bewerken</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Apotheek bewerken</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-slug">Code (URL)</Label>
            <Input
              id="edit-slug"
              required
              minLength={2}
              maxLength={80}
              pattern="[a-z0-9-]+"
              placeholder="bijv. apotheek-jansen-leiden"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Naam</Label>
            <Input
              id="edit-title"
              required
              minLength={2}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Locatie</Label>
            <Input
              id="edit-location"
              required
              maxLength={200}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Beschrijving</Label>
            <textarea
              id="edit-description"
              required
              maxLength={2000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={pending}
              className="w-full min-h-[80px] max-h-[240px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-url">Apotheek website</Label>
            <Input
              id="edit-url"
              type="url"
              required
              value={studiegidsUrl}
              onChange={(e) => setStudiegidsUrl(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Type apotheek</Label>
            <Select
              value={String(typeId)}
              onValueChange={(v) => setTypeId(Number(v))}
              disabled={pending}
            >
              <SelectTrigger id="edit-type" className="w-full">
                <SelectValue placeholder="Selecteer type" />
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
            <Label htmlFor="edit-color">Kleur</Label>
            <div className="flex items-center gap-3">
              <input
                id="edit-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
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
      </DialogContent>
    </Dialog>
  );
}
