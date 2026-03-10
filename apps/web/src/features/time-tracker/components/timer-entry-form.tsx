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
import { Input } from "@open-learn/ui/components/input";

import { useStartTimer, useStopTimer, useUpdateActiveTimer } from "../services/mutations";
import { formatDuration, getElapsedSeconds, getTimerFormValues } from "../utils/date-time";
import { CompactProjectPicker } from "./compact-project-picker";
import { CompactTagPicker } from "./compact-tag-picker";

const timerFormSchema = z.object({
  description: z.string().max(500, "Description must be 500 characters or less"),
  projectId: z.number().nullable(),
  tagIds: z.array(z.number()),
  isBillable: z.boolean(),
});

interface TimerEntryFormProps {
  activeEntry: TrackerEntry | null;
  projects: TrackerProject[];
  tags: TrackerTag[];
  range: TrackerOverviewRange;
}

export function TimerEntryForm({ activeEntry, projects, tags, range }: TimerEntryFormProps) {
  const [now, setNow] = useState(() => new Date());
  const [detailsOpen, setDetailsOpen] = useState(false);
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
          tagIds: value.tagIds,
          isBillable: false,
        });
        await stopTimer.mutateAsync({ entryId: activeEntry.id });
        return;
      }

      await startTimer.mutateAsync({
        description: value.description.trim(),
        projectId: value.projectId,
        tagIds: value.tagIds,
        isBillable: false,
      });
      form.reset(getTimerFormValues(null));
      setDetailsOpen(false);
    },
  });

  useEffect(() => {
    form.reset(getTimerFormValues(activeEntry));
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
                  <div className="min-w-0 flex-1">
                    <Input
                      id="tracker-description"
                      value={descriptionField.state.value}
                      onBlur={descriptionField.handleBlur}
                      onChange={(event) => descriptionField.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="What are you working on? (optional)"
                      className="h-10 text-sm"
                    />
                  </div>

                  {!activeEntry ? (
                    <>
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
                    </>
                  ) : null}

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
                          stopTimer.isPending ||
                          updateActiveTimer.isPending
                        }
                        className="min-w-24"
                      >
                        {activeEntry ? "Stop" : "Start"}
                      </Button>
                    )}
                  </form.Subscribe>

                  {activeEntry ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDetailsOpen((open) => !open)}
                      aria-label={detailsOpen ? "Hide timer details" : "Edit timer details"}
                    >
                      {detailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </Button>
                  ) : null}
                </div>

                <FieldError errors={descriptionField.state.meta.errors} />
              </>
            );
          }}
        </form.Field>

        <CollapsibleContent className="border border-t-0 bg-card p-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
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

            <Button
              type="button"
              variant="ghost"
              className="h-10 justify-start px-3 text-muted-foreground"
              onClick={() => setDetailsOpen(false)}
            >
              <ChevronDownIcon data-icon="inline-start" />
              Done editing
            </Button>
          </div>
        </CollapsibleContent>
      </form>
    </Collapsible>
  );
}
