import type { TrackerProject } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type { TrackerOverviewRange } from "../utils/date-time";

import { useState } from "react";
import { Button } from "@open-learn/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@open-learn/ui/components/field";
import { Input } from "@open-learn/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";

import { useCreateProject } from "../services/mutations";

interface ProjectPickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
  projects: TrackerProject[];
  range: TrackerOverviewRange;
}

export function ProjectPicker({ value, onChange, projects, range }: ProjectPickerProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const createProject = useCreateProject(range);

  return (
    <Field>
      <FieldLabel>Project</FieldLabel>
      <Select
        value={value === null ? "none" : String(value)}
        onValueChange={(nextValue) => onChange(nextValue === "none" ? null : Number(nextValue))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a project" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="none">No project</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription>Pick an existing project or create one inline.</FieldDescription>
      <div className="flex flex-col gap-2 sm:flex-row">
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
            setNewProjectName("");
            onChange(project.id);
          }}
          disabled={createProject.isPending || !newProjectName.trim()}
        >
          Add project
        </Button>
      </div>
    </Field>
  );
}
