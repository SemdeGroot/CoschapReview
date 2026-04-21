import { z } from "zod";

export const courseInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Code is te kort.")
    .max(80, "Code is te lang.")
    .regex(/^[a-z0-9-]+$/, "Gebruik alleen kleine letters, cijfers en koppeltekens."),
  title: z.string().trim().min(2, "Titel is te kort.").max(120, "Titel is te lang."),
  location: z.string().trim().min(1, "Locatie is verplicht.").max(200),
  description: z.string().trim().min(1, "Beschrijving is verplicht.").max(2000),
  studiegids_url: z.union([z.literal(""), z.string().trim().url("Ongeldige URL.")]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Ongeldige kleurcode."),
  type_id: z.number().int().min(1, "Selecteer een type apotheek."),
});

export type CourseInput = z.infer<typeof courseInputSchema>;
