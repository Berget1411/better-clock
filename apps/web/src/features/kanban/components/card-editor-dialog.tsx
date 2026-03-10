import { useState, useEffect } from "react";
import { Trash2, Archive, CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@open-learn/ui/components/dialog";
import { Button } from "@open-learn/ui/components/button";
import { Input } from "@open-learn/ui/components/input";
import { Textarea } from "@open-learn/ui/components/textarea";
import { Label } from "@open-learn/ui/components/label";
import { Badge } from "@open-learn/ui/components/badge";
import { Separator } from "@open-learn/ui/components/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";
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
import { cn } from "@open-learn/ui/lib/utils";
import { CARD_PRIORITIES, PRIORITY_LABEL, PRIORITY_COLOR } from "../constants";
import type { KanbanCardData } from "./kanban-card";

interface CardEditorDialogProps {
  card: KanbanCardData | null;
  columnName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, updates: Partial<CardEditorFields>) => void;
  onDelete: (id: number) => void;
}

export type CardEditorFields = {
  title: string;
  description: string | null;
  priority: string;
  storyPoints: number | null;
  dueDate: Date | null;
  isArchived: boolean;
};

export function CardEditorDialog({
  card,
  columnName,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: CardEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("none");
  const [storyPoints, setStoryPoints] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Sync fields when card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setPriority(card.priority ?? "none");
      setStoryPoints(card.storyPoints !== null ? String(card.storyPoints) : "");
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : "");
    }
  }, [card]);

  if (!card) return null;

  function handleSave() {
    if (!card || !title.trim()) return;
    const sp = storyPoints !== "" ? Number(storyPoints) : null;
    const dd = dueDate ? new Date(dueDate) : null;
    onSave(card.id, {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      storyPoints: sp,
      dueDate: dd,
    });
    onOpenChange(false);
  }

  function handleDelete() {
    if (!card) return;
    onDelete(card.id);
    setConfirmDeleteOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">Edit card</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Column breadcrumb */}
            {columnName && (
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {columnName}
                </Badge>
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title"
                className="text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-desc">Description</Label>
              <Textarea
                id="card-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description…"
                className="min-h-20 resize-none"
              />
            </div>

            <Separator />

            {/* Metadata row */}
            <div className="grid grid-cols-3 gap-3">
              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        <span className={cn("text-sm", PRIORITY_COLOR[p])}>
                          {PRIORITY_LABEL[p]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Story points */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="story-points">Points</Label>
                <Input
                  id="story-points"
                  type="number"
                  min={0}
                  max={999}
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="—"
                  className="h-8 font-mono"
                />
              </div>

              {/* Due date */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="due-date" className="flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  Due
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between mt-2">
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                <Trash2 data-icon="inline-start" />
                Delete
              </Button>
              {!card.isArchived && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    onSave(card.id, { isArchived: true });
                    onOpenChange(false);
                  }}
                >
                  <Archive data-icon="inline-start" />
                  Archive
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="sm" onClick={handleSave} disabled={!title.trim()}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete card?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{card.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
