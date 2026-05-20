/** Greek copy for seeded English photo requirement labels. */
const PHOTO_REQUIREMENT_COPY: Record<string, { label: string; description: string }> = {
  "Front photo": {
    label: "Μπροστινή φωτογραφία",
    description: "Ολόκληρο το μπρος — χορδές και pickups ορατά.",
  },
  "Back photo": {
    label: "Πίσω φωτογραφία",
    description: "Πίσω μέρος, πλάκα λαιμού, τυχόν φθορές.",
  },
  Headstock: {
    label: "Κεφαλή (headstock)",
    description: "Λογότυπο, κλειδιά, καβαλέτο — επαληθεύει γνησιότητα.",
  },
  "Serial number": {
    label: "Σειριακός αριθμός",
    description: "Φωτογράφισε ευκρινώς τον αριθμό serial.",
  },
  "Close-up blemishes": {
    label: "Φθορές από κοντά",
    description: "Χτυπήματα, φθορές τάστων — η ειλικρίνεια χτίζει εμπιστοσύνη.",
  },
  "Accessories / case": {
    label: "Αξεσουάρ / θήκη",
    description: "Θήκη, tremolo arm, έγγραφα αν υπάρχουν.",
  },
};

export function photoRequirementDisplay(label: string, helperText: string | null) {
  const copy = PHOTO_REQUIREMENT_COPY[label];
  if (copy) {
    return copy;
  }
  return {
    label,
    description: helperText ?? "",
  };
}
