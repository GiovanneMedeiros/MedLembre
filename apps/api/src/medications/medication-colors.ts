export const MEDICATION_COLORS = [
  'brand',
  'blue',
  'emerald',
  'amber',
  'purple',
  'pink',
  'teal',
  'ink',
] as const;

export type MedicationColor = (typeof MEDICATION_COLORS)[number];
