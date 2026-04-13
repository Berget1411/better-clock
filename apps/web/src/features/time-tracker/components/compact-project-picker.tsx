import type { TrackerProject } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useMemo, useState } from "react";
import { FolderPlusIcon, FolderIcon } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@open-learn/ui/components/tooltip";
import { cn } from "@open-learn/ui/lib/utils";

import { useCreateProject } from "../services/mutations";

interface CompactProjectPickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
  projects: TrackerProject[];
  range: TrackerOverviewRange;
}

export function CompactProjectPicker({
  value,
  onChange,
  projects,
  range,
}: CompactProjectPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const createProject = useCreateProject(range);
  const selectedProject = projects.find((project) => project.id === value) ?? null;
  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return projects;
    }

    return projects.filter((project) => project.name.toLowerCase().includes(normalizedSearch));
  }, [projects, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "relative shrink-0 rounded p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  selectedProject
                    ? "text-foreground hover:text-foreground/70"
                    : "text-muted-foreground/50 hover:text-muted-foreground",
                )}
              >
                <FolderIcon className="size-4" />
                {selectedProject && (
                  <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-primary" />
                )}
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {selectedProject ? `Project: ${selectedProject.name}` : "Add project"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Project</PopoverTitle>
          <PopoverDescription>Pick a project or create a new one inline.</PopoverDescription>
        </PopoverHeader>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search project"
        />
        <div className="flex max-h-48 flex-col overflow-y-auto border">
          <Button
            type="button"
            variant={value === null ? "secondary" : "ghost"}
            className="h-8 justify-start rounded-none border-0"
            onClick={() => onChange(null)}
          >
            No project
          </Button>
          {filteredProjects.map((project) => (
            <Button
              key={project.id}
              type="button"
              variant={value === project.id ? "secondary" : "ghost"}
              className={cn(
                "h-8 justify-start rounded-none border-0",
                value === project.id && "shadow-none",
              )}
              onClick={() => onChange(project.id)}
            >
              {project.name}
            </Button>
          ))}
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <Input
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="New project name"
            disabled={createProject.isPending}
          />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!newProjectName.trim()) {
                return;
              }

              const project = await createProject.mutateAsync({ name: newProjectName.trim() });
              onChange(project.id);
              setNewProjectName("");
            }}
            disabled={createProject.isPending || !newProjectName.trim()}
          >
            <FolderPlusIcon data-icon="inline-start" />
            Create project
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
