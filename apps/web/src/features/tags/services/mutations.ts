import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { TAGS_COPY } from "../constants";

function useInvalidateTags() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries(trpc.timeTracker.listTags.queryOptions({}));
}

function showMutationError(error: { message?: string }) {
  toast.error(error.message || "Something went wrong");
}

export function useCreateTag() {
  const invalidate = useInvalidateTags();

  return useMutation(
    trpc.timeTracker.createTag.mutationOptions({
      onSuccess: () => {
        toast.success(TAGS_COPY.tagCreated);
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useUpdateTag() {
  const invalidate = useInvalidateTags();

  return useMutation(
    trpc.timeTracker.updateTag.mutationOptions({
      onSuccess: () => {
        toast.success(TAGS_COPY.tagUpdated);
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useDeleteTag() {
  const invalidate = useInvalidateTags();

  return useMutation(
    trpc.timeTracker.deleteTag.mutationOptions({
      onSuccess: () => {
        toast.success(TAGS_COPY.tagDeleted);
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}
