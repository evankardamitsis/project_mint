/** Two-letter initials for avatars (shop name or person name). */
export function initialsFromDisplayName(name: string | null | undefined): string {
  const base = (name ?? "").trim();
  if (!base) {
    return "?";
  }
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase() || "?";
}
