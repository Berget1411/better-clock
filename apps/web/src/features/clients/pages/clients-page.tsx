import type { Client } from "@open-learn/api/modules/client/client.schema";

import { useState } from "react";
import { ChevronDownIcon, PencilIcon, SearchIcon } from "lucide-react";

import {
  AppPage,
  AppPageHeader,
  AppPageHeaderMeta,
  AppSurface,
  AppSurfaceHeader,
} from "@/components/app-page-shell";
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

import { ArchivedBadge } from "@/components/archived-badge";
import { useTableSelection } from "@/hooks/use-table-selection";

import { ClientInlineEditor } from "../components/client-inline-editor";
import { ClientRowActions } from "../components/client-row-actions";
import { useCreateClient } from "../services/mutations";
import { useClientsQuery } from "../services/queries";

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

  const showArchived = filter === "archived" || filter === "all";
  const { data: clients, isLoading } = useClientsQuery(showArchived);
  const createClient = useCreateClient();

  const filtered = (clients ?? []).filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase());

    if (filter === "active") {
      return matchesSearch && !client.isArchived;
    }

    if (filter === "archived") {
      return matchesSearch && client.isArchived;
    }

    return matchesSearch;
  });

  const { selectedIds, toggleSelect, toggleSelectAll, allSelected, someSelected } =
    useTableSelection({ items: filtered });

  async function handleAdd() {
    if (!newName.trim()) {
      return;
    }

    await createClient.mutateAsync({ name: newName.trim(), currency: "USD" });
    setNewName("");
  }

  const activeCount = (clients ?? []).filter((client) => !client.isArchived).length;

  return (
    <AppPage>
      <AppPageHeader
        title="Clients"
        description="Keep client records clean so projects, billing, and reporting inherit the right context."
      >
        <AppPageHeaderMeta
          items={[
            { label: "Total", value: String(clients?.length ?? 0) },
            { label: "Active", value: String(activeCount) },
            { label: "Selected", value: String(selectedIds.size) },
          ]}
        />
      </AppPageHeader>

      <AppSurface>
        <AppSurfaceHeader label="Directory" />

        <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
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

            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name"
                className="w-56 pl-8"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Add new client"
              className="w-52"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleAdd();
                }
              }}
            />
            <Button
              onClick={() => void handleAdd()}
              disabled={!newName.trim() || createClient.isPending}
            >
              Add client
            </Button>
          </div>
        </div>

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
      </AppSurface>
    </AppPage>
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
        {client.isArchived ? <ArchivedBadge className="ml-2" /> : null}
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
      {[1, 2, 3].map((item) => (
        <TableRow key={item}>
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
