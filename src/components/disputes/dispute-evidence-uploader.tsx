import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

export function DisputeEvidenceUploader({
  inputId = "evidence",
  inputName = "evidence",
}: {
  inputId?: string;
  inputName?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>Evidence (photos or PDF)</Label>
      <p className="text-xs text-muted-foreground">
        Required for damaged, not as described, or counterfeit. Optional for not received. Up to 8 files, 5 MB each.
      </p>
      <Input id={inputId} name={inputName} type="file" multiple accept={ACCEPT} />
    </div>
  );
}
