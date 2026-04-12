import type { ReactNode } from "react";

import { Badge } from "@open-learn/ui/components/badge";
import { cn } from "@open-learn/ui/lib/utils";

export function AppPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex w-full min-w-0 flex-col gap-6", className)}>{children}</div>;
}

export function AppPageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 border-b border-border/70 pb-4 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children ? <div className="mt-3">{children}</div> : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
      ) : null}
    </section>
  );
}

export function AppPageHeaderMeta({
  items,
  className,
}: {
  items: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((item) => (
        <Badge
          key={item.label}
          variant="outline"
          className="rounded-none border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {item.label}
          <span className="ml-2 text-foreground">{item.value}</span>
        </Badge>
      ))}
    </div>
  );
}

export function AppSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-none border border-border/60 bg-background ring-1 ring-foreground/10",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AppSurfaceHeader({
  label,
  title,
  description,
  actions,
  className,
}: {
  label?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/60 bg-muted/15 px-4 py-3 lg:flex-row lg:items-start lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {label ? (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
        ) : null}
        {title ? <p className="mt-0.5 text-sm font-medium">{title}</p> : null}
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
      ) : null}
    </div>
  );
}
