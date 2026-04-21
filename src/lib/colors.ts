/**
 * Curated palette for coschap accents.
 * Based on the provided light-mode palette.
 */
export const COURSE_COLORS = [
  "#5C778F",
  "#4B97AD",
  "#475569",
  "#64748b",
  "#6b7280",
  "#2563eb",
  "#0ea5e9",
  "#0f766e",
  "#10b981",
  "#059669",
  "#d97706",
  "#f97316",
] as const;

export const DEFAULT_COURSE_COLOR = COURSE_COLORS[0];

const FALLBACK_TEXT_COLOR = "#111618";
const LIGHT_TEXT_COLOR = "#ffffff";

function normalizeHexColor(color: string | null | undefined) {
  if (!color) return DEFAULT_COURSE_COLOR;

  const value = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [r, g, b] = value.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return DEFAULT_COURSE_COLOR;
}

function hexToRgb(color: string) {
  const normalized = normalizeHexColor(color);
  const value = normalized.slice(1);

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function toLinearRgb(channel: number) {
  const normalized = channel / 255;
  if (normalized <= 0.03928) return normalized / 12.92;
  return ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(color: string) {
  const { r, g, b } = hexToRgb(color);
  return (
    0.2126 * toLinearRgb(r) +
    0.7152 * toLinearRgb(g) +
    0.0722 * toLinearRgb(b)
  );
}

function getContrastRatio(background: string, foreground: string) {
  const backgroundLuminance = getRelativeLuminance(background);
  const foregroundLuminance = getRelativeLuminance(foreground);
  const lightest = Math.max(backgroundLuminance, foregroundLuminance);
  const darkest = Math.min(backgroundLuminance, foregroundLuminance);

  return (lightest + 0.05) / (darkest + 0.05);
}

export function getCourseIconColor(backgroundColor: string | null | undefined) {
  const background = normalizeHexColor(backgroundColor);
  const whiteContrast = getContrastRatio(background, LIGHT_TEXT_COLOR);
  const darkContrast = getContrastRatio(background, FALLBACK_TEXT_COLOR);

  return whiteContrast >= darkContrast ? LIGHT_TEXT_COLOR : FALLBACK_TEXT_COLOR;
}
