import type { TaskListItem, TaskStatus } from "@open-learn/api/modules/task/task.schema";

import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@open-learn/ui/components/alert-dialog";
import { Button } from "@open-learn/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";

import { TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from "../constants";
import { useDeleteTask, useUpdateTask } from "../services/mutations";

interface TaskRowActionsProps {
  task: TaskListItem;
  onEdit: (task: TaskListItem) => void;
}

export function TaskRowActions({ task, onEdit }: TaskRowActionsProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  function handleStatusChange(status: TaskStatus) {
    updateTask.mutate({ id: task.id, status });
  }

  function handleDelete() {
    deleteTask.mutate({ id: task.id });
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Task actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Set status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {TASK_STATUS_OPTIONS.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={task.status === status || updateTask.isPending}
                >
                  {TASK_STATUS_LABELS[status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem variant="destructive" onSelect={(event) => event.preventDefault()}>
              <Trash2Icon className="size-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task</AlertDialogTitle>
          <AlertDialogDescription>
            Permanently delete <span className="font-medium">{task.title}</span>? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
