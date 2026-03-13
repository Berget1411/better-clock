import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(trpc.task.list.queryOptions({}));
}

function showMutationError(error: { message?: string }) {
  toast.error(error.message || "Something went wrong");
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();

  return useMutation(
    trpc.task.create.mutationOptions({
      onSuccess: () => {
        toast.success("Task created");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks();

  return useMutation(
    trpc.task.update.mutationOptions({
      onSuccess: () => {
        toast.success("Task updated");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();

  return useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Task deleted");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}
