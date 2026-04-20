"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALLOWED_EMAIL_DOMAINS,
  type AllowedEmailDomain,
  getEmailExampleLocalPart,
} from "@/lib/email-domains";

type Props = {
  localPart: string;
  domain: AllowedEmailDomain;
  onLocalPartChange: (value: string) => void;
  onDomainChange: (value: AllowedEmailDomain) => void;
  disabled?: boolean;
};

export function EmailDomainField({
  localPart,
  domain,
  onLocalPartChange,
  onDomainChange,
  disabled = false,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email-local-part">E-mailadres</Label>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          id="email-local-part"
          type="text"
          autoComplete="email"
          required
          placeholder={getEmailExampleLocalPart(domain)}
          value={localPart}
          onChange={(e) => onLocalPartChange(e.target.value)}
          disabled={disabled}
        />
        <Select
          value={domain}
          onValueChange={(value) => onDomainChange(value as AllowedEmailDomain)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALLOWED_EMAIL_DOMAINS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({`@${option.value}`})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
