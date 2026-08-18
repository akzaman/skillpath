export function expiryFromDays(days: number | null | undefined, from = new Date()): Date | null {
  const n = Number(days ?? 0);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(from.getTime() + Math.round(n) * 86_400_000);
}

export function isAccessActive(expiresAt: string | Date | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export function daysLeft(expiresAt: string | Date | null | undefined): number | null {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
}

export function accessLabel(expiresAt: string | Date | null | undefined): string {
  if (!expiresAt) return "Unlimited access";
  const left = daysLeft(expiresAt);
  if (left === null) return "Unlimited access";
  if (left <= 0) return "Access ended";
  if (left === 1) return "1 day left";
  return `${left} days left`;
}
