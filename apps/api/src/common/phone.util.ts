export function toE164BR(digits: string): string {
  const clean = digits.replace(/\D/g, '');
  const withCountryCode = clean.startsWith('55') ? clean : `55${clean}`;
  return `+${withCountryCode}`;
}

export function toWhatsAppNumber(digits: string): string {
  return toE164BR(digits).slice(1);
}
