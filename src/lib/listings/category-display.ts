/** Greek labels for seeded category names (English `name` in DB). */
export const CATEGORY_LABELS: Record<string, string> = {
  Accessories: "Αξεσουάρ",
  "Acoustic Guitars": "Ακουστικές Κιθάρες",
  Amps: "Ενισχυτές",
  Bass: "Μπάσο",
  "DJ Gear": "DJ Εξοπλισμός",
  Drums: "Drums & Κρουστά",
  "Effects & Pedals": "Εφέ & Πεντάλ",
  "Electric Guitars": "Ηλεκτρικές Κιθάρες",
  "Pro Audio": "Επαγγελματικός Ήχος",
  "Synths & Keyboards": "Synths & Πλήκτρα",
};

export function categoryDisplayName(name: string): string {
  return CATEGORY_LABELS[name] ?? name;
}
