import type { TrackerProject } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useMemo, useState } from "react";
import { FolderPlusIcon, PlusCircleIcon } from "lucide-react";
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
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 justify-start border-0 px-3 text-left"
        >
          <PlusCircleIcon data-icon="inline-start" />
          <span className="truncate">{selectedProject?.name ?? "Project"}</span>
        </Button>
      </PopoverTrigger>
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
