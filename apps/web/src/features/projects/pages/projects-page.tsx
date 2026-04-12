import type { TrackerProjectFull } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

import { useMemo, useState } from "react";
import { ArrowUpDownIcon, ArrowUpIcon, PencilIcon, SearchIcon, StarIcon } from "lucide-react";

import {
  AppPage,
  AppPageHeader,
  AppPageHeaderMeta,
  AppSurface,
  AppSurfaceHeader,
} from "@/components/app-page-shell";
import { useClientsQuery } from "@/features/clients/services/queries";
import { Button } from "@open-learn/ui/components/button";
import { Checkbox } from "@open-learn/ui/components/checkbox";
import { Input } from "@open-learn/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@open-learn/ui/components/toggle-group";
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
import { formatCurrencyAmount, formatDurationHM } from "@/utils/format";

import { CreateProjectDialog } from "../components/create-project-dialog";
import { ProjectColorDot } from "../components/project-color-dot";
import { ProjectInlineEditor } from "../components/project-inline-editor";
import { ProjectRowActions } from "../components/project-row-actions";
import { useProjectsQuery } from "../services/queries";

type StatusFilter = "active" | "archived" | "all";
type AccessFilter = "all" | "public" | "private" | "team";
type BillingFilter = "all" | "billable" | "non-billable";
type SortKey = "name" | "client" | "tracked" | "amount";
type SortDir = "asc" | "desc";

interface SortableHeadProps {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (col: SortKey) => void;
}

function SortableHead({ label, col, sortKey, sortDir, onSort }: SortableHeadProps) {
  const active = sortKey === col;
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
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

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");
  const [clientFilter, setClientFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const showArchived = statusFilter === "archived" || statusFilter === "all";

  const { data: projects, isLoading } = useProjectsQuery({
    showArchived,
    clientId: clientFilter,
    access: accessFilter === "all" ? null : accessFilter,
    hasBilling: billingFilter === "all" ? null : billingFilter === "billable",
  });

  const { data: clients } = useClientsQuery(false);

  const filtered = useMemo(() => {
    let list = (projects ?? []).filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (statusFilter === "active" && project.isArchived) {
        return false;
      }

      if (statusFilter === "archived" && !project.isArchived) {
        return false;
      }

      return true;
    });

    list = [...list].sort((left, right) => {
      let comparison = 0;

      if (sortKey === "name") {
        comparison = left.name.localeCompare(right.name);
      } else if (sortKey === "client") {
        comparison = (left.clientName ?? "").localeCompare(right.clientName ?? "");
      } else if (sortKey === "tracked") {
        comparison = left.trackedSeconds - right.trackedSeconds;
      } else if (sortKey === "amount") {
        comparison = left.amount - right.amount;
      }

      return sortDir === "asc" ? comparison : -comparison;
    });

    return list;
  }, [projects, search, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  }

  const { selectedIds, toggleSelect, toggleSelectAll, allSelected, someSelected } =
    useTableSelection({ items: filtered });

  const activeProjects = (projects ?? []).filter((project) => !project.isArchived).length;

  return (
    <AppPage>
      <AppPageHeader
        title="Projects"
        description="Control what work can be tracked, who can access it, and how it rolls into billing."
        actions={<Button onClick={() => setDialogOpen(true)}>Create new project</Button>}
      >
        <AppPageHeaderMeta
          items={[
            { label: "Total", value: String(projects?.length ?? 0) },
            { label: "Active", value: String(activeProjects) },
            { label: "Selected", value: String(selectedIds.size) },
          ]}
        />
      </AppPageHeader>

      <AppSurface>
        <AppSurfaceHeader
          label="Portfolio"
          title="Filter and organise projects"
          description="Keep status, access, billing, and search controls together in one clear management surface."
        />

        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-3">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={statusFilter}
            onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}
          >
            <ToggleGroupItem value="active">Active</ToggleGroupItem>
            <ToggleGroupItem value="archived">Archived</ToggleGroupItem>
            <ToggleGroupItem value="all">All</ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={clientFilter?.toString() ?? "all"}
            onValueChange={(v) => setClientFilter(v === "all" ? null : Number(v))}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {(clients ?? []).map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={accessFilter} onValueChange={(v) => setAccessFilter(v as AccessFilter)}>
            <SelectTrigger size="sm" className="w-32">
              <SelectValue placeholder="Access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All access</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>

          <Select value={billingFilter} onValueChange={(v) => setBillingFilter(v as BillingFilter)}>
            <SelectTrigger size="sm" className="w-32">
              <SelectValue placeholder="Billing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All billing</SelectItem>
              <SelectItem value="billable">Billable</SelectItem>
              <SelectItem value="non-billable">Non-billable</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative ml-auto">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find by name"
              className="w-52 pl-8"
            />
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
              <TableHead>
                <SortableHead
                  label="Name"
                  col="name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              </TableHead>
              <TableHead className="w-36">
                <SortableHead
                  label="Client"
                  col="client"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              </TableHead>
              <TableHead className="w-28">
                <SortableHead
                  label="Tracked"
                  col="tracked"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              </TableHead>
              <TableHead className="w-32">
                <SortableHead
                  label="Amount"
                  col="amount"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
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
      </AppSurface>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppPage>
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
          {project.isArchived ? <ArchivedBadge /> : null}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{project.clientName ?? ""}</TableCell>
      <TableCell className="tabular-nums">{formatDurationHM(project.trackedSeconds)}</TableCell>
      <TableCell className="tabular-nums">
        {formatCurrencyAmount(project.amount, project.clientCurrency)}
      </TableCell>
      <TableCell className="capitalize">{project.access}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => setStarred((current) => !current)}
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
      {[1, 2, 3].map((item) => (
        <TableRow key={item}>
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
