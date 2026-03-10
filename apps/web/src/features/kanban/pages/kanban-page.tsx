import { useState, useCallback } from "react";
import {
  PlusIcon,
  KanbanIcon,
  MoreHorizontalIcon,
  Pencil,
  Trash2,
  ArrowLeftIcon,
} from "lucide-react";
import { Button } from "@open-learn/ui/components/button";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import { Badge } from "@open-learn/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@open-learn/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@open-learn/ui/components/alert-dialog";
import { Input } from "@open-learn/ui/components/input";
import { Label } from "@open-learn/ui/components/label";
import { cn } from "@open-learn/ui/lib/utils";
import { useBoardsQuery, useBoardQuery } from "../services/queries";
import {
  useCreateBoard,
  useDeleteBoard,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  useMoveCard,
} from "../services/mutations";
import { KanbanBoard } from "../components/kanban-board";
import { ColumnEditorDialog } from "../components/column-editor-dialog";
import { CardEditorDialog } from "../components/card-editor-dialog";
import { CARD_PRIORITIES } from "../constants";
import type { KanbanColumnData } from "../components/kanban-column";
import type { KanbanCardData } from "../components/kanban-card";
import { BOARD_COLORS } from "../constants";

// ─── Board list ───────────────────────────────────────────────────────────────

function BoardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function CreateBoardDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, color: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);

  function handleSave() {
    if (!name.trim()) return;
    onSave(name.trim(), color);
    setName("");
    setColor(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create board</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="board-name">Name</Label>
            <Input
              id="board-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My board"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setColor(null)}
                className={cn(
                  "size-7 rounded-full border-2 transition-transform bg-muted",
                  color === null ? "border-primary scale-110" : "border-border",
                )}
                title="No color"
              />
              {BOARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform",
                    color === c ? "border-primary scale-110" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Active board view ────────────────────────────────────────────────────────

function BoardView({ boardId, onBack }: { boardId: number; onBack: () => void }) {
  const { data: board, isLoading } = useBoardQuery(boardId);

  // Column mutations
  const createColumn = useCreateColumn(boardId);
  const updateColumn = useUpdateColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);

  // Card mutations
  const createCard = useCreateCard(boardId);
  const updateCard = useUpdateCard(boardId);
  const deleteCard = useDeleteCard(boardId);
  const moveCard = useMoveCard(boardId);

  // Dialog state
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumnData | null>(null);
  const [newCardColumnId, setNewCardColumnId] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCardData | null>(null);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [deleteColId, setDeleteColId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardOpen, setNewCardOpen] = useState(false);

  const handleAddCard = useCallback((columnId: number) => {
    setNewCardColumnId(columnId);
    setNewCardTitle("");
    setNewCardOpen(true);
  }, []);

  const handleCreateCard = useCallback(() => {
    if (!newCardTitle.trim() || !newCardColumnId) return;
    createCard.mutate({
      boardId,
      columnId: newCardColumnId,
      title: newCardTitle.trim(),
    });
    setNewCardOpen(false);
    setNewCardTitle("");
    setNewCardColumnId(null);
  }, [newCardTitle, newCardColumnId, boardId, createCard]);

  const handleCardClick = useCallback((card: KanbanCardData) => {
    setEditingCard(card);
    setCardDialogOpen(true);
  }, []);

  const handleCardSave = useCallback(
    (
      id: number,
      updates: {
        title?: string;
        description?: string | null;
        priority?: string;
        storyPoints?: number | null;
        dueDate?: Date | null;
        isArchived?: boolean;
      },
    ) => {
      const { priority: rawPriority, ...rest } = updates;
      const priority = rawPriority as (typeof CARD_PRIORITIES)[number] | undefined;
      updateCard.mutate({ id, ...rest, priority });
    },
    [updateCard],
  );

  const handleCardDelete = useCallback(
    (id: number) => {
      deleteCard.mutate({ id });
    },
    [deleteCard],
  );

  const handleCardMove = useCallback(
    (params: { cardId: number; targetColumnId: number; orderedCardIds: number[] }) => {
      moveCard.mutate(params);
    },
    [moveCard],
  );

  const handleColumnSave = useCallback(
    (data: {
      boardId: number;
      id?: number;
      name: string;
      color: string | null;
      wipLimit: number | null;
    }) => {
      if (data.id !== undefined) {
        updateColumn.mutate({
          id: data.id,
          name: data.name,
          color: data.color,
          wipLimit: data.wipLimit,
        });
      } else {
        createColumn.mutate({
          boardId: data.boardId,
          name: data.name,
          color: data.color,
          wipLimit: data.wipLimit,
        });
      }
    },
    [createColumn, updateColumn],
  );

  const handleDeleteColumn = useCallback((columnId: number) => {
    setDeleteColId(columnId);
  }, []);

  const handleConfirmDeleteColumn = useCallback(() => {
    if (deleteColId !== null) {
      deleteColumn.mutate({ id: deleteColId });
    }
    setDeleteColId(null);
  }, [deleteColId, deleteColumn]);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 w-72 flex-shrink-0">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <KanbanIcon className="size-10 text-muted-foreground/30" />
        <p className="text-muted-foreground">Board not found.</p>
      </div>
    );
  }

  const columns: KanbanColumnData[] = board.columns.map((col) => ({
    ...col,
    cards: col.cards.map((card) => ({
      ...card,
      dueDate: card.dueDate ?? null,
    })),
  }));

  const findColumnName = (columnId: number) => board.columns.find((c) => c.id === columnId)?.name;

  return (
    <>
      {/* Board toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8" onClick={onBack}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          {board.color && (
            <span className="size-3 rounded-full" style={{ backgroundColor: board.color }} />
          )}
          <h1 className="text-xl font-semibold">{board.name}</h1>
          <Badge variant="secondary" className="text-xs font-mono">
            {board.columns.reduce((acc, col) => acc + col.cards.length, 0)} cards
          </Badge>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingColumn(null);
            setColumnDialogOpen(true);
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Add column
        </Button>
      </div>

      {/* Board */}
      <div className="overflow-x-auto -mx-1 px-1">
        <KanbanBoard
          columns={columns}
          onCardMove={handleCardMove}
          onAddCard={handleAddCard}
          onAddColumn={() => {
            setEditingColumn(null);
            setColumnDialogOpen(true);
          }}
          onEditColumn={(col) => {
            setEditingColumn(col);
            setColumnDialogOpen(true);
          }}
          onDeleteColumn={handleDeleteColumn}
          onCardClick={handleCardClick}
        />
      </div>

      {/* Add card quick dialog */}
      <Dialog open={newCardOpen} onOpenChange={setNewCardOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add card</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-card-title">Title</Label>
            <Input
              id="new-card-title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Card title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCard();
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleCreateCard}
              disabled={!newCardTitle.trim() || createCard.isPending}
            >
              Add card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column editor */}
      <ColumnEditorDialog
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        boardId={boardId}
        column={editingColumn}
        onSave={handleColumnSave}
      />

      {/* Card details */}
      <CardEditorDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        card={editingCard}
        columnName={editingCard ? findColumnName(editingCard.columnId) : undefined}
        onSave={handleCardSave}
        onDelete={handleCardDelete}
      />

      {/* Confirm delete column */}
      <AlertDialog
        open={deleteColId !== null}
        onOpenChange={(open) => !open && setDeleteColId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete column?</AlertDialogTitle>
            <AlertDialogDescription>
              All cards in this column will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDeleteColumn}
            >
              Delete column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Kanban page ──────────────────────────────────────────────────────────────

export default function KanbanPage() {
  const { data: boards, isLoading } = useBoardsQuery();
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();

  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [deleteBoardId, setDeleteBoardId] = useState<number | null>(null);

  if (activeBoardId !== null) {
    return (
      <div className="flex flex-col h-full p-4">
        <BoardView boardId={activeBoardId} onBack={() => setActiveBoardId(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kanban</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your boards and track work visually.
          </p>
        </div>
        <Button onClick={() => setCreateBoardOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New board
        </Button>
      </div>

      {/* Board grid */}
      {isLoading && <BoardsSkeleton />}

      {!isLoading && boards !== undefined && boards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 border-2 border-dashed rounded-xl">
          <KanbanIcon className="size-12 text-muted-foreground/30" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">No boards yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Create a board to start organizing your work.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCreateBoardOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Create your first board
          </Button>
        </div>
      )}

      {!isLoading && boards !== undefined && boards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <button
              key={board.id}
              type="button"
              className={cn(
                "group relative flex flex-col gap-2 p-4 rounded-xl border bg-card",
                "text-left transition-all hover:shadow-md hover:border-border/80",
                "cursor-pointer",
              )}
              onClick={() => setActiveBoardId(board.id)}
            >
              {/* Color stripe */}
              {board.color && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{ backgroundColor: board.color }}
                />
              )}

              {/* Board name */}
              <div className="flex items-start justify-between gap-2 mt-1">
                <span className="text-sm font-semibold line-clamp-2 flex-1">{board.name}</span>

                {/* Board actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontalIcon className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteBoardId(board.id);
                      }}
                    >
                      <Trash2 data-icon="inline-start" />
                      Delete board
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Dates */}
              <p className="text-xs text-muted-foreground">
                {new Date(board.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Create board dialog */}
      <CreateBoardDialog
        open={createBoardOpen}
        onOpenChange={setCreateBoardOpen}
        onSave={(name, color) => {
          createBoard.mutate({ name, color });
        }}
      />

      {/* Confirm delete board */}
      <AlertDialog
        open={deleteBoardId !== null}
        onOpenChange={(open) => !open && setDeleteBoardId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete board?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the board and all its columns and cards. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteBoardId !== null) {
                  deleteBoard.mutate({ id: deleteBoardId });
                }
                setDeleteBoardId(null);
              }}
            >
              Delete board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
