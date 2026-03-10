import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

function useInvalidateClients() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: trpc.client.list.queryKey() });
  };
}

function showMutationError(error: { message?: string }) {
  toast.error(error.message || "Something went wrong");
}

export function useCreateClient() {
  const invalidate = useInvalidateClients();

  return useMutation(
    trpc.client.create.mutationOptions({
      onSuccess: () => {
        toast.success("Client created");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useUpdateClient() {
  const invalidate = useInvalidateClients();

  return useMutation(
    trpc.client.update.mutationOptions({
      onSuccess: () => {
        toast.success("Client updated");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useDeleteClient() {
  const invalidate = useInvalidateClients();

  return useMutation(
    trpc.client.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Client deleted");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}
