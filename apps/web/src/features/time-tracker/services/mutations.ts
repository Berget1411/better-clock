import type { TrackerOverviewRange } from "../utils/date-time";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

function useInvalidateOverview(range: TrackerOverviewRange) {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries(trpc.timeTracker.overview.queryOptions(range));
}

function showMutationError(error: { message?: string }) {
  toast.error(error.message || "Something went wrong");
}

export function useStartTimer(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.startTimer.mutationOptions({
      onSuccess: () => {
        toast.success("Timer started");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useUpdateActiveTimer(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.updateActiveTimer.mutationOptions({
      onSuccess: () => {
        toast.success("Active timer updated");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useStopTimer(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.stopTimer.mutationOptions({
      onSuccess: () => {
        toast.success("Timer stopped");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useDiscardTimer(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.discardTimer.mutationOptions({
      onSuccess: () => {
        toast.success("Active timer discarded");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useCreateManualEntry(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.createManualEntry.mutationOptions({
      onSuccess: () => {
        toast.success("Manual entry saved");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useUpdateEntry(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.updateEntry.mutationOptions({
      onSuccess: () => {
        toast.success("Entry updated");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useDeleteEntry(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.deleteEntry.mutationOptions({
      onSuccess: () => {
        toast.success("Entry deleted");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}

export function useCreateProject(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

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

export function useCreateTag(range: TrackerOverviewRange) {
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.createTag.mutationOptions({
      onSuccess: () => {
        toast.success("Tag created");
        invalidate();
      },
      onError: showMutationError,
    }),
  );
}
