export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, "").trim();
}

export function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateMacAddress(mac: string): boolean {
  return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac);
}

export function validateName(name: string): boolean {
  return /^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(name.trim());
}

export function sanitizePassword(input: string): string {
  return input.replace(/\s/g, "");
}
