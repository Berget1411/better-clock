import type { Client } from "@open-learn/api/modules/client/client.schema";

import { useState } from "react";
import { PencilIcon, SearchIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@open-learn/ui/components/button";
import { Checkbox } from "@open-learn/ui/components/checkbox";
import { Input } from "@open-learn/ui/components/input";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@open-learn/ui/components/table";

import { useClientsQuery } from "../services/queries";
import { useCreateClient } from "../services/mutations";
import { ClientInlineEditor } from "../components/client-inline-editor";
import { ClientRowActions } from "../components/client-row-actions";

type FilterMode = "active" | "archived" | "all";

const FILTER_LABELS: Record<FilterMode, string> = {
  active: "Show active",
  archived: "Show archived",
  all: "Show all",
};

export default function ClientsPage() {
  const [filter, setFilter] = useState<FilterMode>("active");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const showArchived = filter === "archived" || filter === "all";
  const { data: clients, isLoading } = useClientsQuery(showArchived);
  const createClient = useCreateClient();

  const filtered = (clients ?? []).filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return matchesSearch && !c.isArchived;
    if (filter === "archived") return matchesSearch && c.isArchived;
    return matchesSearch;
  });

  async function handleAdd() {
    if (!newName.trim()) return;
    await createClient.mutateAsync({ name: newName.trim(), currency: "USD" });
    setNewName("");
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filtered.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {FILTER_LABELS[filter]}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setFilter("active")}>Show active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("archived")}>
                Show archived
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("all")}>Show all</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="pl-8 w-56"
            />
          </div>
        </div>

        {/* Add new client */}
        <div className="flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add new client"
            className="w-52"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <Button onClick={handleAdd} disabled={!newName.trim() || createClient.isPending}>
            Add client
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
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
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-36">Currency</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <ClientTableSkeleton />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {search ? "No clients match your search." : "No clients yet. Add one above."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) =>
                editingId === client.id ? (
                  <ClientInlineEditor
                    key={client.id}
                    client={client}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <ClientTableRow
                    key={client.id}
                    client={client}
                    selected={selectedIds.has(client.id)}
                    onToggleSelect={() => toggleSelect(client.id)}
                    onEdit={() => setEditingId(client.id)}
                  />
                ),
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface ClientTableRowProps {
  client: Client;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
}

function ClientTableRow({ client, selected, onToggleSelect, onEdit }: ClientTableRowProps) {
  return (
    <TableRow className="group">
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${client.name}`}
        />
      </TableCell>
      <TableCell>
        <span className="font-medium">{client.name}</span>
        {client.isArchived && (
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            archived
          </span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{client.address ?? ""}</TableCell>
      <TableCell>{client.currency}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            aria-label="Edit client"
          >
            <PencilIcon className="size-4" />
          </Button>
          <ClientRowActions client={client} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function ClientTableSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="size-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell />
        </TableRow>
      ))}
    </>
  );
}
