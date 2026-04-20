import type { ComponentType, SVGProps } from "react";
import { Building2, Store } from "lucide-react";

export type IconMeta = {
  key: string;
  label: string;
  component: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
};

export const iconRegistry: IconMeta[] = [
  { key: "hospital", label: "Hospital pharmacy", component: Building2 },
  { key: "public", label: "Public pharmacy", component: Store },
];

export const iconByKey: Record<string, IconMeta> = Object.fromEntries(
  iconRegistry.map((icon) => [icon.key, icon]),
);

export const DEFAULT_ICON_KEY = "hospital";

export function getIconMeta(key: string | null | undefined): IconMeta {
  if (!key) return iconByKey[DEFAULT_ICON_KEY];
  return iconByKey[key] ?? iconByKey[DEFAULT_ICON_KEY];
}
