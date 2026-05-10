/**
 * Parse a euro amount from form input (comma or dot decimal) to integer cents.
 */
export function eurosToCents(input: string): { ok: true; cents: number } | { ok: false; error: string } {
  const trimmed = input.trim().replace(/\s/g, "");
  if (!trimmed) {
    return { ok: false, error: "Price is required." };
  }
  const normalized = trimmed.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return {
      ok: false,
      error: "Enter a valid price (e.g. 1299 or 1299.50).",
    };
  }
  const euros = Number.parseFloat(normalized);
  if (!Number.isFinite(euros) || euros < 0) {
    return { ok: false, error: "Price must be zero or positive." };
  }
  if (euros > 1_000_000) {
    return { ok: false, error: "Price is too large." };
  }
  return { ok: true, cents: Math.round(euros * 100) };
}

/** Display cents as a euro string suitable for controlled price inputs. */
export function centsToEurosInput(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) {
    return "";
  }
  const s = (cents / 100).toFixed(2);
  if (s.endsWith(".00")) {
    return String(Math.round(cents / 100));
  }
  return s.replace(/0$/, "").replace(/\.$/, "");
}
