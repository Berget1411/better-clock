import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";
import type { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDownIcon } from "lucide-react";

import { Checkbox } from "@open-learn/ui/components/checkbox";

import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskRowActions } from "./task-row-actions";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskTypeBadge } from "./task-type-badge";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "../constants";

const statusOrder: Record<TaskListItem["status"], number> = {
  backlog: 0,
  todo: 1,
  in_progress: 2,
  done: 3,
  canceled: 4,
};

const priorityOrder: Record<TaskListItem["priority"], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function SortableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
    >
      {label}
      <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
    </button>
  );
}

export function getTaskColumns({
  onEdit,
}: {
  onEdit: (task: TaskListItem) => void;
}): ColumnDef<TaskListItem>[] {
  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label={`Select ${row.original.title}`}
        />
      ),
      size: 36,
    },
    {
      accessorKey: "displayKey",
      header: ({ column }) => (
        <SortableHeader
          label="Task"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-foreground">{row.original.displayKey}</span>
      ),
      sortingFn: (left, right) => left.original.id - right.original.id,
      size: 132,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader
          label="Title"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2">
          <TaskTypeBadge type={row.original.type} />
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">{row.original.title}</p>
            {row.original.projectName ? (
              <p className="truncate text-xs text-muted-foreground">{row.original.projectName}</p>
            ) : null}
          </div>
        </div>
      ),
      size: 640,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader
          label="Status"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
      sortingFn: (left, right) =>
        statusOrder[left.original.status] - statusOrder[right.original.status],
      filterFn: (row, columnId, value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return true;
        }

        return value.includes(row.getValue(columnId));
      },
      size: 180,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <SortableHeader
          label="Priority"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => <TaskPriorityBadge priority={row.original.priority} />,
      sortingFn: (left, right) =>
        priorityOrder[left.original.priority] - priorityOrder[right.original.priority],
      filterFn: (row, columnId, value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return true;
        }

        return value.includes(row.getValue(columnId));
      },
      size: 160,
    },
    {
      accessorKey: "projectId",
      header: () => null,
      cell: () => null,
      enableHiding: true,
      filterFn: (row, _columnId, value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return true;
        }

        return value.includes(row.original.projectId);
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      header: () => null,
      cell: ({ row }) => <TaskRowActions task={row.original} onEdit={onEdit} />,
      size: 48,
    },
  ];
}
