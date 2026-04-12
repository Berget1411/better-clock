import { cn } from "@open-learn/ui/lib/utils";

interface ArchivedBadgeProps {
  className?: string;
}

export function ArchivedBadge({ className }: ArchivedBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-none border border-border/70 bg-muted px-1.5 py-0.5 text-xs text-muted-foreground",
        className,
      )}
    >
      archived
    </span>
  );
}
