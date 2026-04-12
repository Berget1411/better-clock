import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";
import type {
  TrackerProject,
  TrackerTag,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@open-learn/ui/components/button";
import { FieldError } from "@open-learn/ui/components/field";
import { Input } from "@open-learn/ui/components/input";

import { useCreateManualEntry } from "../services/mutations";
import { getCompatibleTaskId } from "../utils/task-reference";
import {
  combineDateAndTime,
  formatDuration,
  formatRelativeDateLabel,
  getDefaultManualValues,
} from "../utils/date-time";
import { ActivityReferenceInput } from "./activity-reference-input";
import { CompactDatePicker } from "./compact-date-picker";
import { CompactProjectPicker } from "./compact-project-picker";
import { CompactTagPicker } from "./compact-tag-picker";

const manualEntrySchema = z
  .object({
    description: z.string().max(500, "Description must be 500 characters or less"),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    projectId: z.number().nullable(),
    taskId: z.number().nullable(),
    tagIds: z.array(z.number()),
  })
  .superRefine((value, ctx) => {
    const startAt = combineDateAndTime(value.date, value.startTime);
    const endAt = combineDateAndTime(value.date, value.endTime);

    if (!startAt || !endAt || endAt <= startAt) {
      ctx.addIssue({
        code: "custom",
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });

interface ManualEntryFormProps {
  projects: TrackerProject[];
  tasks: TaskListItem[];
  tags: TrackerTag[];
  range: TrackerOverviewRange;
}

export function ManualEntryForm({ projects, tasks, tags, range }: ManualEntryFormProps) {
  const [activityMode, setActivityMode] = useState<"description" | "task">("description");
  const createManualEntry = useCreateManualEntry(range);
  const form = useForm({
    defaultValues: getDefaultManualValues(),
    validators: { onSubmit: manualEntrySchema },
    onSubmit: async ({ value }) => {
      const startAt = combineDateAndTime(value.date, value.startTime);
      const endAt = combineDateAndTime(value.date, value.endTime);

      if (!startAt || !endAt) {
        return;
      }

      await createManualEntry.mutateAsync({
        description: value.description.trim(),
        projectId: value.projectId,
        taskId: value.taskId,
        tagIds: value.tagIds,
        isBillable: false,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      });

      form.reset(getDefaultManualValues());
      setActivityMode("description");
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-2"
    >
      <form.Subscribe selector={(state) => ({ values: state.values })}>
        {({ values }) => {
          const startAt = combineDateAndTime(values.date, values.startTime);
          const endAt = combineDateAndTime(values.date, values.endTime);
          const durationSeconds =
            startAt && endAt && endAt > startAt
              ? Math.floor((endAt.getTime() - startAt.getTime()) / 1000)
              : 0;

          return (
            <form.Field name="description">
              {(descriptionField) => {
                const descriptionInvalid =
                  descriptionField.state.meta.isTouched && !descriptionField.state.meta.isValid;

                return (
                  <>
                    <div className="flex flex-col gap-2 rounded-none border bg-card p-2 md:flex-row md:items-center md:gap-2">
                      <form.Field name="taskId">
                        {(taskField) => (
                          <ActivityReferenceInput
                            mode={activityMode}
                            onModeChange={setActivityMode}
                            description={{
                              id: "manual-description",
                              value: descriptionField.state.value,
                              onBlur: descriptionField.handleBlur,
                              onChange: descriptionField.handleChange,
                              isInvalid: descriptionInvalid,
                              placeholder: "What have you worked on? (optional)",
                            }}
                            taskId={taskField.state.value}
                            projectId={values.projectId}
                            onTaskChange={taskField.handleChange}
                            tasks={tasks}
                          />
                        )}
                      </form.Field>

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

                      <div className="flex flex-wrap gap-2 md:flex-nowrap">
                        <form.Field name="startTime">
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                              <Input
                                type="time"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                                aria-invalid={isInvalid}
                                className="h-10 w-full min-w-24 text-sm md:w-28"
                              />
                            );
                          }}
                        </form.Field>

                        <div className="flex h-10 items-center text-muted-foreground">–</div>

                        <form.Field name="endTime">
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched && !field.state.meta.isValid;

                            return (
                              <Input
                                type="time"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                                aria-invalid={isInvalid}
                                className="h-10 w-full min-w-24 text-sm md:w-28"
                              />
                            );
                          }}
                        </form.Field>
                      </div>

                      <form.Field name="date">
                        {(field) => (
                          <CompactDatePicker
                            value={field.state.value}
                            onChange={field.handleChange}
                            label={formatRelativeDateLabel(field.state.value)}
                          />
                        )}
                      </form.Field>

                      <div className="flex min-w-32 items-center justify-center px-3 text-lg font-semibold tabular-nums text-foreground">
                        {formatDuration(durationSeconds)}
                      </div>

                      <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
                        {({ isSubmitting }) => (
                          <Button
                            type="submit"
                            disabled={isSubmitting || createManualEntry.isPending}
                            className="min-w-24"
                          >
                            Add
                          </Button>
                        )}
                      </form.Subscribe>
                    </div>

                    <div className="flex flex-col gap-1 px-2 pb-2">
                      <FieldError errors={descriptionField.state.meta.errors} />
                      <form.Field name="date">
                        {(field) => <FieldError errors={field.state.meta.errors} />}
                      </form.Field>
                      <form.Field name="startTime">
                        {(field) => <FieldError errors={field.state.meta.errors} />}
                      </form.Field>
                      <form.Field name="endTime">
                        {(field) => <FieldError errors={field.state.meta.errors} />}
                      </form.Field>
                    </div>
                  </>
                );
              }}
            </form.Field>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
