interface ProjectColorDotProps {
  color?: string | null;
  size?: "sm" | "md";
}

export function ProjectColorDot({ color, size = "md" }: ProjectColorDotProps) {
  const dim = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${dim}`}
      style={{ backgroundColor: color ?? "#94a3b8" }}
    />
  );
}
