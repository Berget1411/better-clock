import { Badge } from "@open-learn/ui/components/badge";
import { cn } from "@open-learn/ui/lib/utils";

export function BillableBadge({
  isBillable,
  className,
}: {
  isBillable: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-none px-2",
        isBillable
          ? "border-sky-600/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : "border-border bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      {isBillable ? "Billable" : "Non-billable"}
    </Badge>
  );
}
