import type {
  TrackerEntry,
  TrackerProject,
  TrackerTag,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { ChevronUpIcon, Trash2Icon } from "lucide-react";
import { z } from "zod";
import { Button } from "@open-learn/ui/components/button";
import { FieldError } from "@open-learn/ui/components/field";
import { Input } from "@open-learn/ui/components/input";

import { useDeleteEntry, useUpdateEntry } from "../services/mutations";
import {
  combineDateAndTime,
  formatDuration,
  formatRelativeDateLabel,
  getEditableEntryValues,
} from "../utils/date-time";
import { CompactDatePicker } from "./compact-date-picker";
import { CompactProjectPicker } from "./compact-project-picker";
import { CompactTagPicker } from "./compact-tag-picker";

const editEntrySchema = z
  .object({
    description: z.string().max(500, "Description must be 500 characters or less"),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    projectId: z.number().nullable(),
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

interface ActivityInlineEditorProps {
  entry: TrackerEntry;
  projects: TrackerProject[];
  tags: TrackerTag[];
  range: TrackerOverviewRange;
  onCancel: () => void;
}

export function ActivityInlineEditor({
  entry,
  projects,
  tags,
  range,
  onCancel,
}: ActivityInlineEditorProps) {
  const updateEntry = useUpdateEntry(range);
  const deleteEntry = useDeleteEntry(range);
  const form = useForm({
    defaultValues: getEditableEntryValues(entry),
    validators: { onSubmit: editEntrySchema },
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
                    <div className="flex flex-col gap-2 bg-card p-2 md:flex-row md:items-center md:gap-2">
                      <div className="min-w-0 flex-1">
                        <Input
                          value={descriptionField.state.value}
                          onBlur={descriptionField.handleBlur}
                          onChange={(event) => descriptionField.handleChange(event.target.value)}
                          aria-invalid={descriptionInvalid}
                          placeholder="Add a description (optional)"
                          className="h-10 text-sm"
                        />
                      </div>

                      <form.Field name="projectId">
                        {(projectField) => (
                          <CompactProjectPicker
                            value={projectField.state.value}
                            onChange={projectField.handleChange}
                            projects={projects}
                            range={range}
                          />
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
                          {(field) => (
                            <Input
                              type="time"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                              className="h-10 w-full min-w-24 text-sm md:w-28"
                            />
                          )}
                        </form.Field>
                        <div className="flex h-10 items-center text-muted-foreground">–</div>
                        <form.Field name="endTime">
                          {(field) => (
                            <Input
                              type="time"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                              className="h-10 w-full min-w-24 text-sm md:w-28"
                            />
                          )}
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
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmitting || updateEntry.isPending}>
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                await deleteEntry.mutateAsync({ entryId: entry.id });
                                onCancel();
                              }}
                              disabled={deleteEntry.isPending}
                            >
                              <Trash2Icon />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
                              <ChevronUpIcon />
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
