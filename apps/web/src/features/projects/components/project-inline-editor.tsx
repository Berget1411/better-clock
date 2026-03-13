import type { TrackerProjectFull } from "@open-learn/api/modules/time-tracker/time-tracker.schema";

import { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@open-learn/ui/components/button";
import { Input } from "@open-learn/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";
import { TableCell, TableRow } from "@open-learn/ui/components/table";

import { useClientsQuery } from "@/features/clients/services/queries";
import { useUpdateProject } from "../services/mutations";
import { ProjectColorDot } from "./project-color-dot";

const COLOR_PRESETS = [
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#64748b",
];

interface ProjectInlineEditorProps {
  project: TrackerProjectFull;
  onCancel: () => void;
}

export function ProjectInlineEditor({ project, onCancel }: ProjectInlineEditorProps) {
  const [name, setName] = useState(project.name);
  const [clientId, setClientId] = useState<string>(
    project.clientId ? String(project.clientId) : "none",
  );
  const [color, setColor] = useState(project.color ?? COLOR_PRESETS[0]);
  const [hourlyRate, setHourlyRate] = useState(project.hourlyRate ?? "");
  const [access, setAccess] = useState<"public" | "private" | "team">(
    (project.access as "public" | "private" | "team") ?? "public",
  );

  const { data: clients } = useClientsQuery(false);
  const updateProject = useUpdateProject();

  async function handleSave() {
    if (!name.trim()) return;

    await updateProject.mutateAsync({
      id: project.id,
      name: name.trim(),
      clientId: clientId && clientId !== "none" ? parseInt(clientId, 10) : null,
      color,
      hourlyRate: hourlyRate || null,
      access,
    });

    onCancel();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onCancel();
  }

  return (
    <TableRow className="bg-muted/20">
      <TableCell />
      <TableCell>
        <div className="flex flex-col gap-2">
          {/* Color picker */}
          <div className="flex gap-1">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-4 w-4 rounded-full transition-all"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : undefined,
                  outlineOffset: color === c ? "1px" : undefined,
                }}
              />
            ))}
          </div>
          {/* Name field */}
          <div className="flex items-center gap-1.5">
            <ProjectColorDot color={color} />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="h-8"
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="No client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No client</SelectItem>
            {(clients ?? []).map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          placeholder="Rate/hr"
          className="h-8 w-24"
          onKeyDown={handleKeyDown}
        />
      </TableCell>
      <TableCell />
      <TableCell>
        <Select value={access} onValueChange={(v) => setAccess(v as "public" | "private" | "team")}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={handleSave}
            disabled={!name.trim() || updateProject.isPending}
          >
            <CheckIcon className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" className="size-8" onClick={onCancel}>
            <XIcon className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
