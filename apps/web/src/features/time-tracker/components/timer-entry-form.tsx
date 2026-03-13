import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";
import type {
  TrackerEntry,
  TrackerProject,
  TrackerTag,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { z } from "zod";
import { Button } from "@open-learn/ui/components/button";
import { Collapsible, CollapsibleContent } from "@open-learn/ui/components/collapsible";
import { FieldError } from "@open-learn/ui/components/field";

import { useStartTimer, useStopTimer, useUpdateActiveTimer } from "../services/mutations";
import { formatDuration, getElapsedSeconds, getTimerFormValues } from "../utils/date-time";
import { getCompatibleTaskId } from "../utils/task-reference";
import { ActivityReferenceInput } from "./activity-reference-input";
import { BillableBadge } from "./billable-badge";
import { CompactBillableToggle } from "./compact-billable-toggle";
import { CompactProjectPicker } from "./compact-project-picker";
import { CompactTagPicker } from "./compact-tag-picker";

const timerFormSchema = z.object({
  description: z.string().max(500, "Description must be 500 characters or less"),
  projectId: z.number().nullable(),
  taskId: z.number().nullable(),
  tagIds: z.array(z.number()),
  isBillable: z.boolean(),
});

interface TimerEntryFormProps {
  activeEntry: TrackerEntry | null;
  projects: TrackerProject[];
  tasks: TaskListItem[];
  tags: TrackerTag[];
  range: TrackerOverviewRange;
}

export function TimerEntryForm({ activeEntry, projects, tasks, tags, range }: TimerEntryFormProps) {
  const [now, setNow] = useState(() => new Date());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activityMode, setActivityMode] = useState<"description" | "task">(
    activeEntry?.task ? "task" : "description",
  );
  const startTimer = useStartTimer(range);
  const updateActiveTimer = useUpdateActiveTimer(range);
  const stopTimer = useStopTimer(range);
  const form = useForm({
    defaultValues: getTimerFormValues(activeEntry),
    validators: { onSubmit: timerFormSchema },
    onSubmit: async ({ value }) => {
      if (activeEntry) {
        await updateActiveTimer.mutateAsync({
          entryId: activeEntry.id,
          description: value.description.trim(),
          projectId: value.projectId,
          taskId: value.taskId,
          tagIds: value.tagIds,
          isBillable: value.isBillable,
        });
        await stopTimer.mutateAsync({ entryId: activeEntry.id });
        return;
      }

      await startTimer.mutateAsync({
        description: value.description.trim(),
        projectId: value.projectId,
        taskId: value.taskId,
        tagIds: value.tagIds,
        isBillable: value.isBillable,
      });
      form.reset(getTimerFormValues(null));
      setActivityMode("description");
      setDetailsOpen(false);
    },
  });

  useEffect(() => {
    form.reset(getTimerFormValues(activeEntry));
    setActivityMode(activeEntry?.task ? "task" : "description");
  }, [activeEntry]);

  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    const interval = window.setInterval(() => setNow(new Date()), 1000);

    return () => window.clearInterval(interval);
  }, [activeEntry]);

  const elapsedLabel = useMemo(() => {
    if (!activeEntry) {
      return "00:00:00";
    }

    return formatDuration(getElapsedSeconds(activeEntry.startAt, now));
  }, [activeEntry, now]);

  return (
    <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-2"
      >
        <form.Field name="description">
          {(descriptionField) => {
            const isInvalid =
              descriptionField.state.meta.isTouched && !descriptionField.state.meta.isValid;

            return (
              <>
                <div className="flex flex-col gap-2 rounded-none border bg-card p-2 md:flex-row md:items-center md:gap-2">
                  <form.Subscribe selector={(state) => state.values.projectId}>
                    {(projectId) => (
                      <form.Field name="taskId">
                        {(taskField) => (
                          <ActivityReferenceInput
                            mode={activityMode}
                            onModeChange={setActivityMode}
                            description={{
                              id: "tracker-description",
                              value: descriptionField.state.value,
                              onBlur: descriptionField.handleBlur,
                              onChange: descriptionField.handleChange,
                              isInvalid,
                              placeholder: "What are you working on? (optional)",
                            }}
                            taskId={taskField.state.value}
                            projectId={projectId}
                            onTaskChange={taskField.handleChange}
                            tasks={tasks}
                          />
                        )}
                      </form.Field>
                    )}
                  </form.Subscribe>

                  {activeEntry ? <BillableBadge isBillable={activeEntry.isBillable} /> : null}

                  <div className="flex min-w-32 items-center justify-center px-3 text-lg font-semibold tabular-nums text-foreground">
                    {elapsedLabel}
                  </div>

                  <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
                    {({ isSubmitting }) => (
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          startTimer.isPending ||
                          updateActiveTimer.isPending ||
                          stopTimer.isPending
                        }
                        className="min-w-24"
                      >
                        {activeEntry ? "Stop" : "Start"}
                      </Button>
                    )}
                  </form.Subscribe>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDetailsOpen((open) => !open)}
                    aria-label={detailsOpen ? "Hide timer details" : "Edit timer details"}
                  >
                    {detailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </Button>
                </div>

                <div className="px-2">
                  <FieldError errors={descriptionField.state.meta.errors} />
                </div>
              </>
            );
          }}
        </form.Field>

        <CollapsibleContent className="grid gap-2 rounded-none border bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <form.Field name="projectId">
              {(projectField) => (
                <form.Field name="taskId">
                  {(taskField) => (
                    <CompactProjectPicker
                      value={projectField.state.value}
                      onChange={(projectId) => {
                        projectField.handleChange(projectId);
                        taskField.handleChange(
                          getCompatibleTaskId(tasks, taskField.state.value, projectId),
                        );
                      }}
                      projects={projects}
                      range={range}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>

            <form.Field name="tagIds">
              {(tagField) => (
                <CompactTagPicker
                  value={tagField.state.value}
                  onChange={tagField.handleChange}
                  tags={tags}
                  range={range}
                />
              )}
            </form.Field>

            <form.Field name="isBillable">
              {(billableField) => (
                <CompactBillableToggle
                  checked={billableField.state.value}
                  onCheckedChange={billableField.handleChange}
                />
              )}
            </form.Field>
          </div>
        </CollapsibleContent>
      </form>
    </Collapsible>
  );
}
