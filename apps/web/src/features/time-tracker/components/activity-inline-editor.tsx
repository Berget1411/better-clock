import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";
import type {
  TrackerEntry,
  TrackerProject,
  TrackerTag,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { ChevronUpIcon, Trash2Icon } from "lucide-react";
import { z } from "zod";
import { Button } from "@open-learn/ui/components/button";
import { FieldError } from "@open-learn/ui/components/field";
import { Input } from "@open-learn/ui/components/input";

import { useDeleteEntry, useUpdateEntry } from "../services/mutations";
import { getCompatibleTaskId } from "../utils/task-reference";
import {
  combineDateAndTime,
  formatDuration,
  formatRelativeDateLabel,
  getEditableEntryValues,
} from "../utils/date-time";
import { ActivityReferenceInput } from "./activity-reference-input";
import { CompactDatePicker } from "./compact-date-picker";
import { CompactProjectPicker } from "./compact-project-picker";
import { CompactTagPicker } from "./compact-tag-picker";

const activityEntrySchema = z
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

interface ActivityInlineEditorProps {
  entry: TrackerEntry;
  projects: TrackerProject[];
  tasks: TaskListItem[];
  tags: TrackerTag[];
  range: TrackerOverviewRange;
  onCancel: () => void;
}

export function ActivityInlineEditor({
  entry,
  projects,
  tasks,
  tags,
  range,
  onCancel,
}: ActivityInlineEditorProps) {
  const [activityMode, setActivityMode] = useState<"description" | "task">(
    entry.task ? "task" : "description",
  );
  const updateEntry = useUpdateEntry(range);
  const deleteEntry = useDeleteEntry(range);
  const form = useForm({
    defaultValues: getEditableEntryValues(entry),
    validators: { onSubmit: activityEntrySchema },
    onSubmit: async ({ value }) => {
      const startAt = combineDateAndTime(value.date, value.startTime);
      const endAt = combineDateAndTime(value.date, value.endTime);

      if (!startAt || !endAt) {
        return;
      }

      await updateEntry.mutateAsync({
        entryId: entry.id,
        description: value.description.trim(),
        projectId: value.projectId,
        taskId: value.taskId,
        tagIds: value.tagIds,
        isBillable: false,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      });

      onCancel();
    },
  });

  useEffect(() => {
    form.reset(getEditableEntryValues(entry));
    setActivityMode(entry.task ? "task" : "description");
  }, [entry]);

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
                    <div className="flex flex-col gap-2 rounded-none border bg-card p-2 md:flex-row md:items-center md:gap-1.5">
                      {/* Description / task — grows to fill space */}
                      <form.Field name="taskId">
                        {(taskField) => (
                          <ActivityReferenceInput
                            mode={activityMode}
                            onModeChange={setActivityMode}
                            description={{
                              value: descriptionField.state.value,
                              onBlur: descriptionField.handleBlur,
                              onChange: descriptionField.handleChange,
                              isInvalid: descriptionInvalid,
                              placeholder: "Add a description (optional)",
                            }}
                            taskId={taskField.state.value}
                            projectId={values.projectId}
                            onTaskChange={taskField.handleChange}
                            tasks={tasks}
                          />
                        )}
                      </form.Field>

                      {/* Project + tag icon buttons */}
                      <div className="flex items-center">
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
                      </div>

                      {/* Divider */}
                      <div className="hidden h-6 w-px shrink-0 bg-border md:block" />

                      {/* Time range + duration + date */}
                      <div className="flex items-center gap-1.5">
                        <form.Field name="startTime">
                          {(field) => (
                            <Input
                              type="time"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                              className="h-8 w-24 text-sm tabular-nums"
                            />
                          )}
                        </form.Field>

                        <span className="text-xs text-muted-foreground">–</span>

                        <form.Field name="endTime">
                          {(field) => (
                            <Input
                              type="time"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                              className="h-8 w-24 text-sm tabular-nums"
                            />
                          )}
                        </form.Field>

                        <span className="min-w-14 text-center text-xs font-medium tabular-nums text-muted-foreground">
                          {formatDuration(durationSeconds)}
                        </span>

                        <form.Field name="date">
                          {(field) => (
                            <CompactDatePicker
                              value={field.state.value}
                              onChange={field.handleChange}
                              label={formatRelativeDateLabel(field.state.value)}
                            />
                          )}
                        </form.Field>
                      </div>

                      <form.Subscribe
                        selector={(state) => ({
                          isSubmitting: state.isSubmitting,
                          isDirty: state.isDirty,
                        })}
                      >
                        {({ isSubmitting, isDirty }) => (
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={isSubmitting || updateEntry.isPending || !isDirty}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={async () => {
                                await deleteEntry.mutateAsync({ entryId: entry.id });
                                onCancel();
                              }}
                              disabled={deleteEntry.isPending}
                            >
                              <Trash2Icon className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground"
                              onClick={onCancel}
                            >
                              <ChevronUpIcon className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </form.Subscribe>
                    </div>

                    <div className="px-2 pb-2">
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
