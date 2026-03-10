import type { TrackerTag } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useMemo, useState } from "react";
import { PlusCircleIcon, TagsIcon } from "lucide-react";
import { Badge } from "@open-learn/ui/components/badge";
import { Button } from "@open-learn/ui/components/button";
import { Input } from "@open-learn/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@open-learn/ui/components/popover";
import { Separator } from "@open-learn/ui/components/separator";
import { cn } from "@open-learn/ui/lib/utils";

import { useCreateTag } from "../services/mutations";

interface CompactTagPickerProps {
  value: number[];
  onChange: (value: number[]) => void;
  tags: TrackerTag[];
  range: TrackerOverviewRange;
}

export function CompactTagPicker({ value, onChange, tags, range }: CompactTagPickerProps) {
  const [search, setSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const createTag = useCreateTag(range);
  const selectedTags = useMemo(() => tags.filter((tag) => value.includes(tag.id)), [tags, value]);
  const filteredTags = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return tags;
    }

    return tags.filter((tag) => tag.name.toLowerCase().includes(normalizedSearch));
  }, [search, tags]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 justify-start border-0 px-3 text-left"
        >
          <TagsIcon data-icon="inline-start" />
          <span className="truncate">
            {selectedTags.length === 0
              ? "Tags"
              : selectedTags.length === 1
                ? selectedTags[0]?.name
                : `${selectedTags.length} tags`}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Tags</PopoverTitle>
          <PopoverDescription>Add or remove tags for this activity.</PopoverDescription>
        </PopoverHeader>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tags"
        />
        {selectedTags.length ? (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex max-h-48 flex-col overflow-y-auto border">
          {filteredTags.map((tag) => {
            const isSelected = value.includes(tag.id);

            return (
              <Button
                key={tag.id}
                type="button"
                variant={isSelected ? "secondary" : "ghost"}
                className={cn(
                  "h-8 justify-start rounded-none border-0",
                  isSelected && "shadow-none",
                )}
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
        <Separator />
        <div className="flex flex-col gap-2">
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
              onChange(value.includes(tag.id) ? value : [...value, tag.id]);
              setNewTagName("");
            }}
            disabled={createTag.isPending || !newTagName.trim()}
          >
            <PlusCircleIcon data-icon="inline-start" />
            Create tag
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
