import * as React from "react";
import { MoreHorizontal, Pencil, Plus, Search } from "lucide-react";

import { useTableSelection } from "@/hooks/use-table-selection";

import { Button } from "@open-learn/ui/components/button";
import { Checkbox } from "@open-learn/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import { Input } from "@open-learn/ui/components/input";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@open-learn/ui/components/table";

import { TAGS_COPY } from "../constants";
import { useCreateTag, useDeleteTag, useUpdateTag } from "../services/mutations";
import { useTagsQuery } from "../services/queries";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tag {
  id: number;
  name: string;
}

// ─── Tag row ──────────────────────────────────────────────────────────────────

interface TagRowProps {
  tag: Tag;
  selected: boolean;
  onToggleSelect: () => void;
  onSave: (id: number, name: string) => void;
  onDelete: (id: number) => void;
}

function TagRow({ tag, selected, onToggleSelect, onSave, onDelete }: TagRowProps) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(tag.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  React.useEffect(() => {
    if (!editing) setValue(tag.name);
  }, [tag.name, editing]);

  function handleStartEdit() {
    setValue(tag.name);
    setEditing(true);
  }

  function handleSave() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== tag.name) {
      onSave(tag.id, trimmed);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setValue(tag.name);
      setEditing(false);
    }
  }

  return (
    <TableRow className="group">
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${tag.name}`}
        />
      </TableCell>
      <TableCell>
        {editing ? (
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-7 w-64"
          />
        ) : (
          <span className="font-medium">{tag.name}</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={handleStartEdit}
          >
            <Pencil className="size-4" />
            <span className="sr-only">{TAGS_COPY.renameTag}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(tag.id)}
              >
                {TAGS_COPY.deleteTag}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TagsTable() {
  const tagsQuery = useTagsQuery();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [search, setSearch] = React.useState("");
  const [newTagName, setNewTagName] = React.useState("");

  const tags: Tag[] = tagsQuery.data ?? [];

  const filtered = search.trim()
    ? tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : tags;

  const { selectedIds, toggleSelect, toggleSelectAll, allSelected, someSelected } =
    useTableSelection({ items: filtered });

  function handleAdd() {
    const name = newTagName.trim();
    if (!name) return;
    createTag.mutate({ name }, { onSuccess: () => setNewTagName("") });
  }

  function handleAddKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAdd();
  }

  function handleSave(id: number, name: string) {
    updateTag.mutate({ id, name });
  }

  function handleDelete(id: number) {
    deleteTag.mutate({ id });
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-8 w-64"
              placeholder={TAGS_COPY.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder={TAGS_COPY.addPlaceholder}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={handleAddKeyDown}
            className="w-48"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newTagName.trim() || createTag.isPending}
          >
            <Plus className="mr-2 size-4" />
            {TAGS_COPY.addButton}
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>{TAGS_COPY.columnName}</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tagsQuery.isPending ? (
            <>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="size-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                {TAGS_COPY.emptyState}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                selected={selectedIds.has(tag.id)}
                onToggleSelect={() => toggleSelect(tag.id)}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
