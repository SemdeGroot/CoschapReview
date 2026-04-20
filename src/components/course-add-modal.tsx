"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { createCourseAction } from "@/server-actions/admin";

type Spec = { id: number; code: string; name: string };

type Props = {
  allSpecs: Spec[];
};

export function CourseAddModal({ allSpecs }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [studiegidsUrl, setStudiegidsUrl] = useState("");
  const [color, setColor] = useState("#001158");
  const [typeId, setTypeId] = useState<number>(allSpecs[0]?.id ?? 0);

  function resetForm() {
    setSlug("");
    setTitle("");
    setLocation("");
    setDescription("");
    setStudiegidsUrl("");
    setColor("#001158");
    setTypeId(allSpecs[0]?.id ?? 0);
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) resetForm();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCourseAction({
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
      toast.success("Apotheek toegevoegd.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus size={14} /> Apotheek toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apotheek toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-slug">Code (URL)</Label>
            <Input
              id="add-slug"
              required
              minLength={2}
              maxLength={80}
              pattern="[a-z0-9-]+"
              placeholder="bijv. apotheek-jansen-leiden"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              Alleen kleine letters, cijfers en koppeltekens. Wordt gebruikt in de URL.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-title">Naam</Label>
            <Input
              id="add-title"
              required
              minLength={2}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-location">Locatie</Label>
            <Input
              id="add-location"
              required
              maxLength={200}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-description">Beschrijving</Label>
            <textarea
              id="add-description"
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
            <Label htmlFor="add-url">Apotheek website</Label>
            <Input
              id="add-url"
              type="url"
              required
              placeholder="https://..."
              value={studiegidsUrl}
              onChange={(e) => setStudiegidsUrl(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-type">Type apotheek</Label>
            <Select
              value={String(typeId)}
              onValueChange={(v) => setTypeId(Number(v))}
              disabled={pending}
            >
              <SelectTrigger id="add-type" className="w-full">
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
            <Label htmlFor="add-color">Kleur</Label>
            <div className="flex items-center gap-3">
              <input
                id="add-color"
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
              {pending ? "Toevoegen..." : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
