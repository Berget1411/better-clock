import type { TrackerProjectFull } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

import { useState, useMemo } from "react";
import {
  SearchIcon,
  ChevronDownIcon,
  StarIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
} from "lucide-react";
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

import { useClientsQuery } from "@/features/clients/services/queries";
import { useProjectsQuery } from "../services/queries";
import { CreateProjectDialog } from "../components/create-project-dialog";
import { ProjectColorDot } from "../components/project-color-dot";
import { ProjectInlineEditor } from "../components/project-inline-editor";
import { ProjectRowActions } from "../components/project-row-actions";

type StatusFilter = "active" | "archived" | "all";
type AccessFilter = "all" | "public" | "private" | "team";
type BillingFilter = "all" | "billable" | "non-billable";
type SortKey = "name" | "client" | "tracked" | "amount";
type SortDir = "asc" | "desc";

function formatTrackedHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function formatAmount(amount: number, currency: string | null): string {
  const c = currency ?? "USD";
  return `${amount.toFixed(2)} ${c}`;
}

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");
  const [clientFilter, setClientFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const showArchived = statusFilter === "archived" || statusFilter === "all";

  const { data: projects, isLoading } = useProjectsQuery({
    showArchived,
    clientId: clientFilter,
    access: accessFilter === "all" ? null : accessFilter,
    hasBilling: billingFilter === "all" ? null : billingFilter === "billable" ? true : false,
  });

  const { data: clients } = useClientsQuery(false);

  const filtered = useMemo(() => {
    let list = (projects ?? []).filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "active" && p.isArchived) return false;
      if (statusFilter === "archived" && !p.isArchived) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "client") cmp = (a.clientName ?? "").localeCompare(b.clientName ?? "");
      else if (sortKey === "tracked") cmp = a.trackedSeconds - b.trackedSeconds;
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [projects, search, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
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
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filtered.length;

  function SortableHead({ label, col }: { label: string; col: SortKey }) {
    const active = sortKey === col;
    return (
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
      >
        {label}
        {active ? (
          <ArrowUpIcon
            className={`h-3 w-3 transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`}
          />
        ) : (
          <ArrowUpDownIcon className="h-3 w-3 opacity-40" />
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button onClick={() => setDialogOpen(true)}>Create new project</Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {statusFilter === "active"
                ? "Active"
                : statusFilter === "archived"
                  ? "Archived"
                  : "All"}
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("archived")}>
              Archived
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Client */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {clientFilter
                ? ((clients ?? []).find((c) => c.id === clientFilter)?.name ?? "Client")
                : "Client"}
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setClientFilter(null)}>All clients</DropdownMenuItem>
            {(clients ?? []).map((c) => (
              <DropdownMenuItem key={c.id} onClick={() => setClientFilter(c.id)}>
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Access */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {accessFilter === "all"
                ? "Access"
                : accessFilter.charAt(0).toUpperCase() + accessFilter.slice(1)}
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setAccessFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccessFilter("public")}>Public</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccessFilter("private")}>Private</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccessFilter("team")}>Team</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Billing */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {billingFilter === "all"
                ? "Billing"
                : billingFilter === "billable"
                  ? "Billable"
                  : "Non-billable"}
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setBillingFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBillingFilter("billable")}>
              Billable
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBillingFilter("non-billable")}>
              Non-billable
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="relative ml-auto">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find by name"
            className="pl-8 w-56"
          />
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
              <TableHead>
                <SortableHead label="Name" col="name" />
              </TableHead>
              <TableHead className="w-36">
                <SortableHead label="Client" col="client" />
              </TableHead>
              <TableHead className="w-28">
                <SortableHead label="Tracked" col="tracked" />
              </TableHead>
              <TableHead className="w-32">
                <SortableHead label="Amount" col="amount" />
              </TableHead>
              <TableHead className="w-24">Access</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <ProjectTableSkeleton />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {search ? "No projects match your search." : "No projects yet. Create one above."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((project) =>
                editingId === project.id ? (
                  <ProjectInlineEditor
                    key={project.id}
                    project={project}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <ProjectTableRow
                    key={project.id}
                    project={project}
                    selected={selectedIds.has(project.id)}
                    onToggleSelect={() => toggleSelect(project.id)}
                    onEdit={() => setEditingId(project.id)}
                  />
                ),
              )
            )}
          </TableBody>
        </Table>
      </div>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

interface ProjectTableRowProps {
  project: TrackerProjectFull;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
}

function ProjectTableRow({ project, selected, onToggleSelect, onEdit }: ProjectTableRowProps) {
  const [starred, setStarred] = useState(false);

  return (
    <TableRow className="group">
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${project.name}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ProjectColorDot color={project.color} />
          <span className="font-medium">{project.name}</span>
          {project.isArchived && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              archived
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{project.clientName ?? ""}</TableCell>
      <TableCell className="tabular-nums">{formatTrackedHours(project.trackedSeconds)}</TableCell>
      <TableCell className="tabular-nums">
        {formatAmount(project.amount, project.clientCurrency)}
      </TableCell>
      <TableCell className="capitalize">{project.access}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => setStarred((s) => !s)}
            aria-label="Star project"
          >
            <StarIcon
              className={`size-4 transition-colors ${starred ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            aria-label="Edit project"
          >
            <PencilIcon className="size-4" />
          </Button>
          <ProjectRowActions project={project} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProjectTableSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="size-4" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-14" />
          </TableCell>
          <TableCell />
        </TableRow>
      ))}
    </>
  );
}
