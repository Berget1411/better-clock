import type {
  TrackerEntry,
  TrackerOverview,
  UpdateEntryInput,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

function useInvalidateOverview(_range: TrackerOverviewRange) {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: trpc.timeTracker.overview.queryKey() });
}

function showMutationError(error: { message?: string }) {
  toast.error(error.message || "Something went wrong");
}

function applyOptimisticEntryUpdate(
  overview: TrackerOverview | undefined,
  input: UpdateEntryInput,
): TrackerOverview | undefined {
  if (!overview) {
    return overview;
  }

  const nextProject = input.projectId
    ? (overview.projects.find((project) => project.id === input.projectId) ?? null)
    : null;
  const nextTags = overview.tags.filter((tag) => input.tagIds.includes(tag.id));

  const updateEntry = (entry: TrackerEntry | null) => {
    if (!entry || entry.id !== input.entryId) {
      return entry;
    }

    return {
      ...entry,
      description: input.description,
      isBillable: input.isBillable,
      startAt: input.startAt,
      endAt: input.endAt,
      project: nextProject,
      task: input.taskId === null ? null : entry.task?.id === input.taskId ? entry.task : null,
      tags: nextTags,
    } satisfies TrackerEntry;
  };

  return {
    ...overview,
    activeEntry: updateEntry(overview.activeEntry),
    entries: overview.entries.map((entry) => updateEntry(entry) ?? entry),
  };
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
  const queryClient = useQueryClient();
  const invalidate = useInvalidateOverview(range);

  return useMutation(
    trpc.timeTracker.updateEntry.mutationOptions({
      onMutate: async (input) => {
        const queryKey = trpc.timeTracker.overview.queryKey();

        await queryClient.cancelQueries({ queryKey });

        const previousOverviews = queryClient.getQueriesData<TrackerOverview>({ queryKey });

        for (const [key, overview] of previousOverviews) {
          queryClient.setQueryData<TrackerOverview | undefined>(
            key,
            applyOptimisticEntryUpdate(overview, input),
          );
        }

        return { previousOverviews };
      },
      onSuccess: () => {
        toast.success("Entry updated");
      },
      onError: (error, _input, context) => {
        for (const [key, overview] of context?.previousOverviews ?? []) {
          queryClient.setQueryData(key, overview);
        }

        showMutationError(error);
      },
      onSettled: () => {
        invalidate();
      },
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
