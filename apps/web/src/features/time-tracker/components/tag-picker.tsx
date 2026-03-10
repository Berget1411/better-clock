import type { TrackerTag } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useMemo, useState } from "react";
import { Badge } from "@open-learn/ui/components/badge";
import { Button } from "@open-learn/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@open-learn/ui/components/field";
import { Input } from "@open-learn/ui/components/input";
import { cn } from "@open-learn/ui/lib/utils";

import { useCreateTag } from "../services/mutations";

interface TagPickerProps {
  value: number[];
  onChange: (value: number[]) => void;
  tags: TrackerTag[];
  range: TrackerOverviewRange;
}

export function TagPicker({ value, onChange, tags, range }: TagPickerProps) {
  const [newTagName, setNewTagName] = useState("");
  const createTag = useCreateTag(range);
  const selectedTags = useMemo(() => tags.filter((tag) => value.includes(tag.id)), [tags, value]);

  return (
    <Field>
      <FieldLabel>Tags</FieldLabel>
      <FieldDescription>Select any relevant tags for this activity.</FieldDescription>
      {selectedTags.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = value.includes(tag.id);

          return (
            <Button
              key={tag.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={cn("h-auto px-3 py-1", isSelected && "shadow-none")}
              onClick={() => {
                if (isSelected) {
                  onChange(value.filter((tagId) => tagId !== tag.id));
                  return;
                }

                onChange([...value, tag.id]);
              }}
            >
              {tag.name}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={newTagName}
          onChange={(event) => setNewTagName(event.target.value)}
          placeholder="New tag name"
          disabled={createTag.isPending}
        />
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            if (!newTagName.trim()) {
              return;
            }

            const tag = await createTag.mutateAsync({ name: newTagName.trim() });
            setNewTagName("");
            onChange(value.includes(tag.id) ? value : [...value, tag.id]);
          }}
          disabled={createTag.isPending || !newTagName.trim()}
        >
          Add tag
        </Button>
      </div>
    </Field>
  );
}
