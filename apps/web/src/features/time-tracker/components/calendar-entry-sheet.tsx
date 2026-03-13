import type { TaskListItem } from "@open-learn/api/modules/task/task.schema";
import type {
  TrackerEntry,
  TrackerProject,
  TrackerTag,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { CalendarSheetMode } from "../utils/calendar";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@open-learn/ui/components/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@open-learn/ui/components/field";
import { Input } from "@open-learn/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@open-learn/ui/components/sheet";

import { useCreateManualEntry, useDeleteEntry, useUpdateEntry } from "../services/mutations";
import { getCompatibleTaskId } from "../utils/task-reference";
import { getDefaultSlotEnd } from "../utils/calendar";
import { ActivityReferenceInput } from "./activity-reference-input";
import { CompactBillableToggle } from "./compact-billable-toggle";
import { CompactProjectPicker } from "./compact-project-picker";
import { CompactTagPicker } from "./compact-tag-picker";
import {
  combineDateAndTime,
  getEditableEntryValues,
  toLocalDateInputValue,
  toLocalTimeInputValue,
} from "../utils/date-time";

const calendarEntrySchema = z
  .object({
    description: z.string().max(500, "Description must be 500 characters or less"),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    projectId: z.number().nullable(),
    taskId: z.number().nullable(),
    tagIds: z.array(z.number()),
    isBillable: z.boolean(),
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

interface CalendarEntrySheetProps {
  open: boolean;
  mode: CalendarSheetMode;
  entry: TrackerEntry | null;
  selection: { start: Date; end: Date } | null;
  projects: TrackerProject[];
  tasks: TaskListItem[];
  tags: TrackerTag[];
  range: TrackerOverviewRange;
  onOpenChange: (open: boolean) => void;
}

function getInitialValues(
  entry: TrackerEntry | null,
  selection: { start: Date; end: Date } | null,
) {
  if (entry) {
    return getEditableEntryValues(entry);
  }

  const start = selection?.start ?? new Date();
  const end = selection?.end ?? getDefaultSlotEnd(start);

  return {
    description: "",
    date: toLocalDateInputValue(start),
    startTime: toLocalTimeInputValue(start),
    endTime: toLocalTimeInputValue(end),
    projectId: null as number | null,
    taskId: null as number | null,
    tagIds: [] as number[],
    isBillable: false,
  };
}

export function CalendarEntrySheet({
  open,
  mode,
  entry,
  selection,
  projects,
  tasks,
  tags,
  range,
  onOpenChange,
}: CalendarEntrySheetProps) {
  const initialValues = useMemo(() => getInitialValues(entry, selection), [entry, selection]);
  const [activityMode, setActivityMode] = useState<"description" | "task">(
    entry?.task ? "task" : "description",
  );
  const createEntry = useCreateManualEntry(range);
  const updateEntry = useUpdateEntry(range);
  const deleteEntry = useDeleteEntry(range);
  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: calendarEntrySchema },
    onSubmit: async ({ value }) => {
      const startAt = combineDateAndTime(value.date, value.startTime);
      const endAt = combineDateAndTime(value.date, value.endTime);

      if (!startAt || !endAt) {
        return;
      }

      const payload = {
        description: value.description.trim(),
        projectId: value.projectId,
        taskId: value.taskId,
        tagIds: value.tagIds,
        isBillable: value.isBillable,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };

      if (mode === "edit" && entry) {
        await updateEntry.mutateAsync({
          entryId: entry.id,
          ...payload,
        });
      } else {
        await createEntry.mutateAsync(payload);
      }

      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(initialValues);
    setActivityMode(entry?.task ? "task" : "description");
  }, [entry, form, initialValues, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl" side="right">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{mode === "edit" ? "Edit entry" : "Create entry"}</SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? "Update the tracked time, activity, and metadata for this entry."
              : "Add a finished time entry directly from the calendar."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <form.Subscribe selector={(state) => ({ values: state.values })}>
              {({ values }) => (
                <>
                  <form.Field name="description">
                    {(descriptionField) => {
                      const descriptionInvalid =
                        descriptionField.state.meta.isTouched &&
                        !descriptionField.state.meta.isValid;

                      return (
                        <FieldGroup>
                          <Field>
                            <FieldLabel className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              Activity
                            </FieldLabel>
                            <FieldContent>
                              <form.Field name="taskId">
                                {(taskField) => (
                                  <ActivityReferenceInput
                                    mode={activityMode}
                                    onModeChange={setActivityMode}
                                    description={{
                                      id: "calendar-entry-description",
                                      value: descriptionField.state.value,
                                      onBlur: descriptionField.handleBlur,
                                      onChange: descriptionField.handleChange,
                                      isInvalid: descriptionInvalid,
                                      placeholder: "What did you work on?",
                                    }}
                                    taskId={taskField.state.value}
                                    projectId={values.projectId}
                                    onTaskChange={taskField.handleChange}
                                    tasks={tasks}
                                  />
                                )}
                              </form.Field>
                              <FieldError errors={descriptionField.state.meta.errors} />
                            </FieldContent>
                          </Field>
                        </FieldGroup>
                      );
                    }}
                  </form.Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <form.Field name="date">
                      {(field) => (
                        <Field>
                          <FieldLabel className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Date
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="date"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                              className="h-10"
                            />
                            <FieldError errors={field.state.meta.errors} />
                          </FieldContent>
                        </Field>
                      )}
                    </form.Field>

                    <div className="grid gap-4 grid-cols-2">
                      <form.Field name="startTime">
                        {(field) => (
                          <Field>
                            <FieldLabel className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              Start
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                type="time"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                                aria-invalid={
                                  field.state.meta.isTouched && !field.state.meta.isValid
                                }
                                className="h-10"
                              />
                            </FieldContent>
                          </Field>
                        )}
                      </form.Field>

                      <form.Field name="endTime">
                        {(field) => (
                          <Field>
                            <FieldLabel className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              End
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                type="time"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                                aria-invalid={
                                  field.state.meta.isTouched && !field.state.meta.isValid
                                }
                                className="h-10"
                              />
                              <FieldError errors={field.state.meta.errors} />
                            </FieldContent>
                          </Field>
                        )}
                      </form.Field>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Project
                      </FieldLabel>
                      <FieldContent>
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
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Tags
                      </FieldLabel>
                      <FieldContent>
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
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Billing
                    </FieldLabel>
                    <FieldContent>
                      <form.Field name="isBillable">
                        {(billableField) => (
                          <CompactBillableToggle
                            checked={billableField.state.value}
                            onCheckedChange={billableField.handleChange}
                            className="h-10"
                          />
                        )}
                      </form.Field>
                    </FieldContent>
                  </Field>
                </>
              )}
            </form.Subscribe>
          </div>

          <SheetFooter className="border-t">
            {mode === "edit" && entry ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 justify-center border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={async () => {
                  await deleteEntry.mutateAsync({ entryId: entry.id });
                  onOpenChange(false);
                }}
                disabled={deleteEntry.isPending}
              >
                Delete entry
              </Button>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
                {({ isSubmitting }) => (
                  <Button
                    type="submit"
                    className="h-9 px-3"
                    disabled={
                      isSubmitting ||
                      createEntry.isPending ||
                      updateEntry.isPending ||
                      deleteEntry.isPending
                    }
                  >
                    {mode === "edit" ? "Save changes" : "Save entry"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
