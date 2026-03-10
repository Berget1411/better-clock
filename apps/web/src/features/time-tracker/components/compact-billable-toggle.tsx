import { Switch } from "@open-learn/ui/components/switch";
import { cn } from "@open-learn/ui/lib/utils";

import { BillableBadge } from "./billable-badge";

export function CompactBillableToggle({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 border bg-background px-3 text-sm",
        className,
      )}
    >
      <Switch
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label="Toggle billable status"
      />
      <BillableBadge isBillable={checked} className="h-auto" />
    </div>
  );
}
