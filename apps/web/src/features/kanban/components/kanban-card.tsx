import { useDraggable } from "@dnd-kit/core";
import {
  CalendarIcon,
  GripVertical,
  AlertCircleIcon,
  ArrowUpIcon,
  MinusIcon,
  ArrowDownIcon,
} from "lucide-react";
import { cn } from "@open-learn/ui/lib/utils";
import { Badge } from "@open-learn/ui/components/badge";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "../constants";

export type KanbanCardData = {
  id: number;
  columnId: number;
  boardId: number;
  title: string;
  description: string | null;
  priority: string;
  storyPoints: number | null;
  dueDate: string | null;
  assigneeId: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

interface KanbanCardProps {
  card: KanbanCardData;
  isOverlay?: boolean;
  onClick?: (card: KanbanCardData) => void;
}

function PriorityIcon({ priority }: { priority: string }) {
  const cls = cn("size-3.5", PRIORITY_COLOR[priority] ?? PRIORITY_COLOR.none);
  if (priority === "urgent") return <AlertCircleIcon className={cls} />;
  if (priority === "high") return <ArrowUpIcon className={cls} />;
  if (priority === "medium") return <MinusIcon className={cls} />;
  if (priority === "low") return <ArrowDownIcon className={cls} />;
  return null;
}

export function KanbanCard({ card, isOverlay = false, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: { type: "card", card },
  });

  const isOverdue =
    card.dueDate !== null && new Date(card.dueDate) < new Date() && !card.isArchived;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={cn(
        "group relative rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-all",
        "hover:shadow-md hover:border-border/80",
        "cursor-pointer select-none",
        isDragging && !isOverlay && "opacity-40 ring-2 ring-primary/30",
        isOverlay && "shadow-xl ring-2 ring-primary/50 rotate-1 scale-105 cursor-grabbing",
      )}
      onClick={() => onClick?.(card)}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="size-3.5 text-muted-foreground" />
      </div>

      <div className="ml-3 flex flex-col gap-1.5">
        {/* Title */}
        <p className="text-sm font-medium leading-snug line-clamp-2">{card.title}</p>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority */}
          {card.priority !== "none" && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs",
                PRIORITY_COLOR[card.priority] ?? PRIORITY_COLOR.none,
              )}
            >
              <PriorityIcon priority={card.priority} />
              <span className="hidden sm:inline">
                {PRIORITY_LABEL[card.priority] ?? card.priority}
              </span>
            </span>
          )}

          {/* Story points */}
          {card.storyPoints !== null && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 font-mono">
              {card.storyPoints}
            </Badge>
          )}

          {/* Due date */}
          {card.dueDate !== null && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-3" />
              {new Date(card.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
