"use client";

import { useState, useTransition } from "react";
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
import { updateCourseAction } from "@/server-actions/admin";
import { iconRegistry } from "@/lib/icons/registry";

type Spec = { id: number; code: string; name: string };
type SpecRole = "core" | "elective";

type CourseData = {
  id: string;
  title: string;
  location: string;
  description: string;
  studiegids_url: string;
  color: string;
  icon: string;
  ec: number;
};

type Props = {
  course: CourseData;
  allSpecs: Spec[];
  currentSpecs: { specialization_id: number; role: SpecRole }[];
};

export function CourseEditModal({ course, allSpecs, currentSpecs }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(course.title);
  const [location, setLocation] = useState(course.location);
  const [description, setDescription] = useState(course.description);
  const [studiegidsUrl, setStudiegidsUrl] = useState(course.studiegids_url);
  const [color, setColor] = useState(course.color);
  const [icon, setIcon] = useState(course.icon);
  const [ec, setEc] = useState(course.ec);
  const [specs, setSpecs] = useState<{ specialization_id: number; role: SpecRole }[]>(currentSpecs);

  function toggleSpec(id: number, role: SpecRole) {
    setSpecs((prev) => {
      const existing = prev.find((s) => s.specialization_id === id);
      if (!existing) return [...prev, { specialization_id: id, role }];
      if (existing.role === role) return prev.filter((s) => s.specialization_id !== id);
      return prev.map((s) => s.specialization_id === id ? { ...s, role } : s);
    });
  }

  function isSelected(id: number, role: SpecRole) {
    return specs.some((s) => s.specialization_id === id && s.role === role);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateCourseAction(course.id, {
        title,
        location,
        description,
        studiegids_url: studiegidsUrl,
        color,
        icon,
        ec,
        specializations: specs,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Coschap bijgewerkt.");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Coschap bewerken</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="edit-url">Studiegids URL</Label>
            <Input
              id="edit-url"
              type="url"
              required
              value={studiegidsUrl}
              onChange={(e) => setStudiegidsUrl(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icoon</Label>
              <select
                id="edit-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                disabled={pending}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {iconRegistry.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ec">EC</Label>
              <Input
                id="edit-ec"
                type="number"
                required
                min={1}
                max={30}
                value={ec}
                onChange={(e) => setEc(Number(e.target.value))}
                disabled={pending}
              />
            </div>
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

          {allSpecs.length > 0 && (
            <div className="space-y-2">
              <Label>Specialisaties</Label>
              <div className="space-y-2 rounded-md border border-border p-3">
                {allSpecs.map((spec) => (
                  <div key={spec.id} className="flex items-center gap-4">
                    <span className="w-32 text-sm font-medium">{spec.name}</span>
                    <div className="flex gap-2">
                      {(["core", "elective"] as SpecRole[]).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleSpec(spec.id, role)}
                          disabled={pending}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            isSelected(spec.id, role)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {role === "core" ? "Kern" : "Keuze"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
