import { cn } from "@/lib/utils";

type Props = {
  code: string;
  name?: string;
  className?: string;
};

export type SpecializationPill = {
  code: string;
  name: string;
};

export function SpecializationBadge({ code, name, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground",
        className,
      )}
      title={name ?? code}
    >
      {name ?? code}
    </span>
  );
}
