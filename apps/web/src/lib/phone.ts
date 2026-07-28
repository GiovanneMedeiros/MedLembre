const NON_DIGITS = /\D/g;

export function normalizePhoneDigits(value: string): string {
  let digits = value.replace(NON_DIGITS, "");
  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }
  return digits;
}

export function isValidBrazilianWhatsApp(value: string): boolean {
  const digits = normalizePhoneDigits(value);
  if (digits.length !== 11) return false;

  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  return digits[2] === "9";
}

export function formatWhatsAppInput(value: string): string {
  const digits = normalizePhoneDigits(value).slice(0, 11);
  const ddd = digits.slice(0, 2);
  const first = digits.slice(2, 7);
  const second = digits.slice(7, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${ddd}`;
  if (digits.length <= 7) return `(${ddd}) ${first}`;
  return `(${ddd}) ${first}-${second}`;
}
