import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: trpc.timeTracker.listProjects.queryKey() });
}

function showMutationError(error: { message?: string }) {
  toast.error(error.message || "Something went wrong");
}

export function useCreateProject() {
  const invalidate = useInvalidateProjects();

  return useMutation(
    trpc.timeTracker.createProject.mutationOptions({
      onSuccess: () => {
        toast.success("Project created");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useUpdateProject() {
  const invalidate = useInvalidateProjects();

  return useMutation(
    trpc.timeTracker.updateProject.mutationOptions({
      onSuccess: () => {
        toast.success("Project updated");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjects();

  return useMutation(
    trpc.timeTracker.deleteProject.mutationOptions({
      onSuccess: () => {
        toast.success("Project deleted");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}
