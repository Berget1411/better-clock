import type {
  TrackerProject,
  TrackerTag,
} from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { Field, FieldError, FieldGroup, FieldLabel } from "@open-learn/ui/components/field";
import { Input } from "@open-learn/ui/components/input";
import { Switch } from "@open-learn/ui/components/switch";

import { ProjectPicker } from "./project-picker";
import { TagPicker } from "./tag-picker";

interface EntryMetadataFieldsProps {
  description: {
    value: string;
    onBlur: () => void;
    onChange: (value: string) => void;
    isInvalid: boolean;
    errors: Array<{ message?: string } | undefined>;
  };
  projectId: number | null;
  onProjectChange: (value: number | null) => void;
  projects: TrackerProject[];
  tagIds: number[];
  onTagIdsChange: (value: number[]) => void;
  tags: TrackerTag[];
  isBillable: boolean;
  onBillableChange: (value: boolean) => void;
  range: TrackerOverviewRange;
}

export function EntryMetadataFields({
  description,
  projectId,
  onProjectChange,
  projects,
  tagIds,
  onTagIdsChange,
  tags,
  isBillable,
  onBillableChange,
  range,
}: EntryMetadataFieldsProps) {
  return (
    <FieldGroup>
      <Field data-invalid={description.isInvalid}>
        <FieldLabel htmlFor="tracker-description">Description</FieldLabel>
        <Input
          id="tracker-description"
          value={description.value}
          onBlur={description.onBlur}
          onChange={(event) => description.onChange(event.target.value)}
          aria-invalid={description.isInvalid}
          placeholder="What are you working on?"
        />
        <FieldError errors={description.errors} />
      </Field>

      <ProjectPicker
        value={projectId}
        onChange={onProjectChange}
        projects={projects}
        range={range}
      />

      <TagPicker value={tagIds} onChange={onTagIdsChange} tags={tags} range={range} />

      <Field orientation="horizontal">
        <FieldLabel htmlFor="tracker-billable">Billable</FieldLabel>
        <Switch id="tracker-billable" checked={isBillable} onCheckedChange={onBillableChange} />
      </Field>
    </FieldGroup>
  );
}
