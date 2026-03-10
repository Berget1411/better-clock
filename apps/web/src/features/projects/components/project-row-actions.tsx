import type { TrackerProjectFull } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

import { MoreVerticalIcon, ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react";
import { Button } from "@open-learn/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@open-learn/ui/components/dropdown-menu";
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

import { useDeleteProject, useUpdateProject } from "../services/mutations";

interface ProjectRowActionsProps {
  project: TrackerProjectFull;
}

export function ProjectRowActions({ project }: ProjectRowActionsProps) {
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  function handleToggleArchive() {
    updateProject.mutate({ id: project.id, isArchived: !project.isArchived });
  }

  function handleDelete() {
    deleteProject.mutate({ id: project.id });
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVerticalIcon className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleArchive} disabled={updateProject.isPending}>
            {project.isArchived ? (
              <>
                <ArchiveRestoreIcon className="mr-2 h-4 w-4" />
                Unarchive
              </>
            ) : (
              <>
                <ArchiveIcon className="mr-2 h-4 w-4" />
                Archive
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete{" "}
            <span className="font-medium">{project.name}</span>? Time entries linked to this project
            will have their project cleared.
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
