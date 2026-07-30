export const MEDICATION_COLORS = [
  "brand",
  "blue",
  "emerald",
  "amber",
  "purple",
  "pink",
  "teal",
  "ink",
] as const;

export type MedicationColorKey = (typeof MEDICATION_COLORS)[number];

// Classes concretas (não geradas dinamicamente) para o Tailwind conseguir
// detectar e incluir no build.
const DOT_CLASSES: Record<MedicationColorKey, string> = {
  brand: "bg-brand-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  teal: "bg-teal-500",
  ink: "bg-ink-700",
};

const RING_CLASSES: Record<MedicationColorKey, string> = {
  brand: "ring-brand-500",
  blue: "ring-blue-500",
  emerald: "ring-emerald-500",
  amber: "ring-amber-500",
  purple: "ring-purple-500",
  pink: "ring-pink-500",
  teal: "ring-teal-500",
  ink: "ring-ink-700",
};

function normalize(cor: string): MedicationColorKey {
  return (MEDICATION_COLORS as readonly string[]).includes(cor)
    ? (cor as MedicationColorKey)
    : "brand";
}

export function medicationDotClass(cor: string): string {
  return DOT_CLASSES[normalize(cor)];
}

export function medicationRingClass(cor: string): string {
  return RING_CLASSES[normalize(cor)];
}
