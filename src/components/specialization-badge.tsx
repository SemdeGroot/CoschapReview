import { cn } from "@/lib/utils";

type Props = {
  code: string;
  name?: string;
  role: "core" | "elective";
  className?: string;
};

export type SpecializationPill = {
  code: string;
  name: string;
  role: "core" | "elective";
};

export function SpecializationBadge({ code, name, role, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none",
        role === "core"
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground",
        className,
      )}
      title={name ?? code}
    >
      {name ?? code}
    </span>
  );
}
