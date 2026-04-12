import type { TrackerProject } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { CalendarViewKey } from "../utils/calendar";

import { Badge } from "@open-learn/ui/components/badge";
import { Button } from "@open-learn/ui/components/button";
import { ButtonGroup } from "@open-learn/ui/components/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { CALENDAR_COPY, CALENDAR_VIEW_OPTIONS } from "../constants/calendar";

interface CalendarToolbarProps {
  title: string;
  view: CalendarViewKey;
  projectFilter: string;
  projects: TrackerProject[];
  onViewChange: (view: CalendarViewKey) => void;
  onProjectFilterChange: (value: string) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function CalendarToolbar({
  title,
  view,
  projectFilter,
  projects,
  onViewChange,
  onProjectFilterChange,
  onToday,
  onPrevious,
  onNext,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border bg-card p-3 ring-1 ring-foreground/10 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <ButtonGroup>
          <Button type="button" variant="outline" className="h-8 px-3" onClick={onPrevious}>
            <ChevronLeftIcon />
            <span className="sr-only">Previous period</span>
          </Button>
          <Button type="button" variant="outline" className="h-8 px-3" onClick={onNext}>
            <ChevronRightIcon />
            <span className="sr-only">Next period</span>
          </Button>
        </ButtonGroup>
        <Button type="button" variant="outline" className="h-8 px-3" onClick={onToday}>
          Today
        </Button>
        <Badge
          variant="outline"
          className="h-8 px-2 uppercase tracking-[0.18em] text-muted-foreground"
        >
          {CALENDAR_COPY.myEntries}
        </Badge>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <ButtonGroup>
          {CALENDAR_VIEW_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={view === option.value ? "secondary" : "outline"}
              className="h-8 px-3"
              onClick={() => onViewChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>

        <Select value={projectFilter} onValueChange={onProjectFilterChange}>
          <SelectTrigger className="h-8 min-w-36">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
