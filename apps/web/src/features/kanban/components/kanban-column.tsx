import { useDroppable } from "@dnd-kit/core";
import { PlusIcon, MoreHorizontalIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@open-learn/ui/lib/utils";
import { Button } from "@open-learn/ui/components/button";
import { Badge } from "@open-learn/ui/components/badge";
import { ScrollArea } from "@open-learn/ui/components/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import { KanbanCard } from "./kanban-card";
import type { KanbanCardData } from "./kanban-card";

export type KanbanColumnData = {
  id: number;
  name: string;
  color: string | null;
  position: number;
  wipLimit: number | null;
  cards: KanbanCardData[];
};

interface KanbanColumnProps {
  column: KanbanColumnData;
  isDraggingOver?: boolean;
  onAddCard?: (columnId: number) => void;
  onEditColumn?: (column: KanbanColumnData) => void;
  onDeleteColumn?: (columnId: number) => void;
  onCardClick?: (card: KanbanCardData) => void;
}

export function KanbanColumn({
  column,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  onCardClick,
}: KanbanColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  const isWipExceeded = column.wipLimit !== null && column.cards.length > column.wipLimit;

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {column.color && (
            <span
              className="size-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: column.color }}
            />
          )}
          <h3 className="text-sm font-semibold truncate">{column.name}</h3>
          <Badge
            variant={isWipExceeded ? "destructive" : "secondary"}
            className="text-xs px-1.5 h-4 font-mono flex-shrink-0"
          >
            {column.cards.length}
            {column.wipLimit !== null && `/${column.wipLimit}`}
          </Badge>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => onAddCard?.(column.id)}
          >
            <PlusIcon className="size-3.5" />
          </Button>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6">
                <MoreHorizontalIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onEditColumn?.(column);
                }}
              >
                <Pencil data-icon="inline-start" />
                Edit column
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteColumn?.(column.id);
                }}
              >
                <Trash2 data-icon="inline-start" />
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-lg transition-colors duration-150 min-h-20",
          "bg-muted/40 border border-dashed border-transparent",
          isOver && "bg-primary/5 border-primary/30",
          column.cards.length === 0 && "border-border/40",
        )}
      >
        <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
          <div className="flex flex-col gap-2 p-2">
            {column.cards.map((card) => (
              <KanbanCard key={card.id} card={card} onClick={onCardClick} />
            ))}
            {column.cards.length === 0 && (
              <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/60">
                No cards
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
