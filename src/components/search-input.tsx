"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  placeholder?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({
  placeholder = "Zoek op apotheek, plaats of type...",
  className,
  value,
  onChange,
}: Props) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Zoekopdracht wissen"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
