import type {
  TaskListItem,
  TaskPriority,
  TaskStatus,
} from "@open-learn/api/modules/task/task.schema";
import type { TrackerProjectFull } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { ColumnFiltersState, RowSelectionState, SortingState } from "@tanstack/react-table";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FolderKanbanIcon } from "lucide-react";

import { Button } from "@open-learn/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@open-learn/ui/components/empty";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@open-learn/ui/components/table";

import { TASK_COPY } from "../constants";
import { getTaskColumns } from "./task-columns";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskTablePagination } from "./task-table-pagination";
import { TaskTableToolbar } from "./task-table-toolbar";

interface TasksTableProps {
  tasks: TaskListItem[];
  projects: TrackerProjectFull[];
  isLoading: boolean;
}

function TasksTableSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[36px_132px_minmax(320px,1fr)_180px_160px_48px] gap-0 border-b border-border/60 px-4 py-3"
        >
          <Skeleton className="h-4 w-4 rounded-none" />
          <Skeleton className="h-4 w-20 rounded-none" />
          <Skeleton className="h-4 w-full rounded-none" />
          <Skeleton className="h-4 w-28 rounded-none" />
          <Skeleton className="h-4 w-20 rounded-none" />
          <Skeleton className="ml-auto h-4 w-4 rounded-none" />
        </div>
      ))}
    </div>
  );
}

function toggleFilterValue<TValue extends string | number>(values: TValue[], value: TValue) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

export function TasksTable({ tasks, projects, isLoading }: TasksTableProps) {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [
      { id: "status", value: selectedStatuses },
      { id: "priority", value: selectedPriorities },
      { id: "projectId", value: selectedProjectIds },
    ],
    [selectedPriorities, selectedProjectIds, selectedStatuses],
  );

  const columns = useMemo(
    () =>
      getTaskColumns({
        onEdit: (task) => setEditingTask(task),
      }),
    [],
  );

  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
      globalFilter: search,
      rowSelection,
      columnFilters,
      columnVisibility: {
        projectId: false,
        updatedAt: false,
      },
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).trim().toLowerCase();

      if (!query) {
        return true;
      }

      return [row.original.displayKey, row.original.title, row.original.projectName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const hasTasks = tasks.length > 0;
  const hasFilteredRows = table.getFilteredRowModel().rows.length > 0;

  return (
    <>
      <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} projects={projects} />
      <TaskFormDialog
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null);
          }
        }}
        task={editingTask}
        projects={projects}
      />

      <section className="overflow-hidden rounded-none border border-border/60 bg-background ring-1 ring-foreground/10">
        <TaskTableToolbar
          search={search}
          onSearchChange={setSearch}
          projects={projects}
          selectedStatuses={selectedStatuses}
          selectedPriorities={selectedPriorities}
          selectedProjectIds={selectedProjectIds}
          onToggleStatus={(status) =>
            setSelectedStatuses((current) => toggleFilterValue(current, status))
          }
          onTogglePriority={(priority) =>
            setSelectedPriorities((current) => toggleFilterValue(current, priority))
          }
          onToggleProject={(projectId) =>
            setSelectedProjectIds((current) => toggleFilterValue(current, projectId))
          }
          onAddTask={() => setCreateOpen(true)}
        />

        {isLoading ? (
          <TasksTableSkeleton />
        ) : !hasTasks ? (
          <Empty className="border-0 px-6 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderKanbanIcon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>{TASK_COPY.emptyTitle}</EmptyTitle>
              <EmptyDescription>{TASK_COPY.emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => setCreateOpen(true)}>{TASK_COPY.addTask}</Button>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-border/60 hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} style={{ width: header.getSize() }}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {hasFilteredRows ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      {TASK_COPY.noResults}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TaskTablePagination table={table} />
          </>
        )}
      </section>
    </>
  );
}
