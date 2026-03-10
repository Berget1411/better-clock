import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { PlusCircleIcon } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@open-learn/ui/components/button";
import { kanbanCollisionDetection } from "../lib/collision-detection";
import { KanbanColumn } from "./kanban-column";
import type { KanbanColumnData } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import type { KanbanCardData } from "./kanban-card";

interface KanbanBoardProps {
  columns: KanbanColumnData[];
  onCardMove: (params: {
    cardId: number;
    targetColumnId: number;
    orderedCardIds: number[];
  }) => void;
  onAddCard?: (columnId: number) => void;
  onAddColumn?: () => void;
  onEditColumn?: (column: KanbanColumnData) => void;
  onDeleteColumn?: (columnId: number) => void;
  onCardClick?: (card: KanbanCardData) => void;
}

export function KanbanBoard({
  columns,
  onCardMove,
  onAddCard,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onCardClick,
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);

  // Build lookup maps for efficient drag resolution
  const cardColumnMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const col of columns) {
      for (const card of col.cards) {
        map.set(card.id, col.id);
      }
    }
    return map;
  }, [columns]);

  const columnIds = useMemo(() => new Set(columns.map((c) => c.id)), [columns]);

  const cardsByColumn = useMemo(() => {
    const map = new Map<number, KanbanCardData[]>();
    for (const col of columns) {
      map.set(col.id, col.cards);
    }
    return map;
  }, [columns]);

  /**
   * Resolve the column id from a drag `over.id`.
   * The id may be a column prefix ("column-X") or a card prefix ("card-X").
   */
  const findTargetColumnId = useCallback(
    (overId: string | number): number | null => {
      const id = String(overId);
      if (id.startsWith("column-")) {
        const colId = Number(id.replace("column-", ""));
        return columnIds.has(colId) ? colId : null;
      }
      if (id.startsWith("card-")) {
        const cardId = Number(id.replace("card-", ""));
        return cardColumnMap.get(cardId) ?? null;
      }
      return null;
    },
    [columnIds, cardColumnMap],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "card") {
      setActiveCard(data.card as KanbanCardData);
    }
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback only — actual state change happens on dragEnd
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCard(null);
      const { active, over } = event;
      if (!over || !active) return;

      const cardId = Number(String(active.id).replace("card-", ""));
      const targetColumnId = findTargetColumnId(over.id);
      if (targetColumnId === null) return;

      const currentColumnId = cardColumnMap.get(cardId);
      if (currentColumnId === undefined) return;

      // Build the new ordered list for the target column
      const targetCards = (cardsByColumn.get(targetColumnId) ?? []).filter((c) => c.id !== cardId);

      // Determine insertion position
      if (over.id !== `column-${targetColumnId}`) {
        // Dropped over a card — insert before that card
        const overCardId = Number(String(over.id).replace("card-", ""));
        const overIndex = targetCards.findIndex((c) => c.id === overCardId);
        if (overIndex !== -1) {
          targetCards.splice(overIndex, 0, { id: cardId } as KanbanCardData);
        } else {
          targetCards.push({ id: cardId } as KanbanCardData);
        }
      } else {
        // Dropped directly on a column — append to end
        targetCards.push({ id: cardId } as KanbanCardData);
      }

      onCardMove({
        cardId,
        targetColumnId,
        orderedCardIds: targetCards.map((c) => c.id),
      });
    },
    [findTargetColumnId, cardColumnMap, cardsByColumn, onCardMove],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 items-start overflow-x-auto pb-4 min-h-0">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            onAddCard={onAddCard}
            onEditColumn={onEditColumn}
            onDeleteColumn={onDeleteColumn}
            onCardClick={onCardClick}
          />
        ))}

        {/* Add column button */}
        <div className="flex-shrink-0 w-72">
          <Button
            variant="outline"
            className="w-full border-dashed text-muted-foreground"
            onClick={onAddColumn}
          >
            <PlusCircleIcon data-icon="inline-start" />
            Add column
          </Button>
        </div>
      </div>

      {/* Drag overlay — renders the card under the cursor */}
      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
