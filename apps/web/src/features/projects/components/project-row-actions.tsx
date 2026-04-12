import type { TrackerProjectFull } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

import { RowActions } from "@/components/row-actions";

import { useDeleteProject, useUpdateProject } from "../services/mutations";

interface ProjectRowActionsProps {
  project: TrackerProjectFull;
}

export function ProjectRowActions({ project }: ProjectRowActionsProps) {
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  return (
    <RowActions
      isArchived={project.isArchived}
      onToggleArchive={() =>
        updateProject.mutate({ id: project.id, isArchived: !project.isArchived })
      }
      isArchivePending={updateProject.isPending}
      onDelete={() => deleteProject.mutate({ id: project.id })}
      deleteTitle="Delete project"
      deleteDescription={
        <>
          Are you sure you want to permanently delete{" "}
          <span className="font-medium">{project.name}</span>? Time entries linked to this project
          will have their project cleared.
        </>
      }
    />
  );
}
