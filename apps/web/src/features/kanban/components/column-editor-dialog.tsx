import { useState, useEffect } from "react";
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
import { Label } from "@open-learn/ui/components/label";
import { COLUMN_COLORS } from "../constants";
import type { KanbanColumnData } from "./kanban-column";
import { cn } from "@open-learn/ui/lib/utils";

interface ColumnEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  column?: KanbanColumnData | null;
  onSave: (data: {
    boardId: number;
    id?: number;
    name: string;
    color: string | null;
    wipLimit: number | null;
  }) => void;
}

export function ColumnEditorDialog({
  open,
  onOpenChange,
  boardId,
  column,
  onSave,
}: ColumnEditorDialogProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [wipLimit, setWipLimit] = useState<string>("");

  const isEditing = !!column;

  useEffect(() => {
    if (open) {
      setName(column?.name ?? "");
      setSelectedColor(column?.color ?? null);
      setWipLimit(
        column?.wipLimit !== null && column?.wipLimit !== undefined ? String(column.wipLimit) : "",
      );
    }
  }, [open, column]);

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      boardId,
      id: column?.id,
      name: name.trim(),
      color: selectedColor,
      wipLimit: wipLimit !== "" ? Number(wipLimit) : null,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit column" : "Add column"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="col-name">Name</Label>
            <Input
              id="col-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Column name"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedColor(null)}
                className={cn(
                  "size-6 rounded-full border-2 transition-transform",
                  selectedColor === null ? "border-primary scale-110" : "border-border",
                  "bg-muted",
                )}
                title="No color"
              />
              {COLUMN_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "size-6 rounded-full border-2 transition-transform",
                    selectedColor === color ? "border-primary scale-110" : "border-transparent",
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* WIP limit */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wip-limit">
              WIP limit
              <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="wip-limit"
              type="number"
              min={1}
              value={wipLimit}
              onChange={(e) => setWipLimit(e.target.value)}
              placeholder="No limit"
              className="h-8 w-24"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? "Save" : "Add column"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
