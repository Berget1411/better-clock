import { TRPCError } from "@trpc/server";
import { taskRepository, timeTrackerRepository } from "@open-learn/db";

import type {
  CreateManualEntryInput,
  CreateProjectInput,
  CreateTagInput,
  DeleteEntryInput,
  DeleteProjectInput,
  DeleteTagInput,
  DiscardTimerInput,
  ListProjectsInput,
  OverviewInput,
  StartTimerInput,
  StopTimerInput,
  TrackerEntry,
  TrackerOverview,
  TrackerProjectFull,
  UpdateActiveTimerInput,
  UpdateEntryInput,
  UpdateProjectInput,
  UpdateTagInput,
} from "./time-tracker.schema";

function parseDate(value: string, fieldName: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be a valid datetime`,
    });
  }

  return date;
}

function ensureChronologicalOrder(startAt: Date, endAt: Date) {
  if (endAt <= startAt) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "End time must be after start time",
    });
  }
}

function mapEntry(entry: {
  id: number;
  description: string;
  isBillable: boolean;
  startAt: Date;
  endAt: Date | null;
  project: { id: number; name: string } | null;
  task: { id: number; displayKey: string; title: string; status: string } | null;
  tags: Array<{ id: number; name: string }>;
}): TrackerEntry {
  return {
    id: entry.id,
    description: entry.description,
    isBillable: entry.isBillable,
    startAt: entry.startAt.toISOString(),
    endAt: entry.endAt?.toISOString() ?? null,
    project: entry.project,
    task: entry.task
      ? {
          id: entry.task.id,
          displayKey: entry.task.displayKey,
          title: entry.task.title,
          status: entry.task.status as NonNullable<TrackerEntry["task"]>["status"],
        }
      : null,
    tags: entry.tags,
  };
}

async function validateProjectTaskAndTags(
  organizationId: string,
  projectId: number | null,
  taskId: number | null,
  tagIds: number[],
) {
  const uniqueTagIds = [...new Set(tagIds)];

  if (projectId !== null) {
    const project = await timeTrackerRepository.getProjectById(organizationId, projectId);

    if (!project) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Selected project was not found",
      });
    }
  }

  if (taskId !== null) {
    const task = await taskRepository.getTaskById(organizationId, taskId);

    if (!task) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Selected task was not found",
      });
    }

    if (projectId !== null && task.projectId !== projectId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Selected task must belong to the selected project",
      });
    }
  }

  if (uniqueTagIds.length) {
    const tags = await timeTrackerRepository.getTagsByIds(organizationId, uniqueTagIds);

    if (tags.length !== uniqueTagIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "One or more selected tags were not found",
      });
    }
  }

  return uniqueTagIds;
}

function normalizeName(name: string) {
  return name.trim();
}

export const timeTrackerService = {
  async overview(
    organizationId: string,
    userId: string,
    input: OverviewInput,
  ): Promise<TrackerOverview> {
    const from = parseDate(input.from, "from");
    const to = parseDate(input.to, "to");

    if (to <= from) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Range end must be after range start",
      });
    }

    const [activeEntry, entries, projects, tags] = await Promise.all([
      timeTrackerRepository.getActiveEntry(organizationId, userId),
      timeTrackerRepository.getEntriesInRange(organizationId, userId, from, to),
      timeTrackerRepository.getProjects(organizationId),
      timeTrackerRepository.getTags(organizationId),
    ]);

    return {
      activeEntry: activeEntry ? mapEntry(activeEntry) : null,
      entries: entries.map(mapEntry),
      projects,
      tags,
    };
  },

  async startTimer(organizationId: string, userId: string, input: StartTimerInput) {
    const tagIds = await validateProjectTaskAndTags(
      organizationId,
      input.projectId,
      input.taskId,
      input.tagIds,
    );

    return timeTrackerRepository.startTimer(
      organizationId,
      userId,
      {
        description: input.description.trim(),
        projectId: input.projectId,
        taskId: input.taskId,
        tagIds,
        isBillable: input.isBillable,
      },
      new Date(),
    );
  },

  async updateActiveTimer(organizationId: string, userId: string, input: UpdateActiveTimerInput) {
    const tagIds = await validateProjectTaskAndTags(
      organizationId,
      input.projectId,
      input.taskId,
      input.tagIds,
    );
    const updatedEntry = await timeTrackerRepository.updateActiveTimer(organizationId, userId, {
      entryId: input.entryId,
      description: input.description.trim(),
      projectId: input.projectId,
      taskId: input.taskId,
      tagIds,
      isBillable: input.isBillable,
    });

    if (!updatedEntry) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Active timer not found",
      });
    }

    return updatedEntry;
  },

  async stopTimer(organizationId: string, userId: string, input: StopTimerInput) {
    const stoppedEntry = await timeTrackerRepository.stopTimer(
      organizationId,
      userId,
      input.entryId,
      new Date(),
    );

    if (!stoppedEntry) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Active timer not found",
      });
    }

    return stoppedEntry;
  },

  async discardTimer(organizationId: string, userId: string, input: DiscardTimerInput) {
    const deletedEntry = await timeTrackerRepository.discardTimer(
      organizationId,
      userId,
      input.entryId,
    );

    if (!deletedEntry) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Active timer not found",
      });
    }

    return deletedEntry;
  },

  async createManualEntry(organizationId: string, userId: string, input: CreateManualEntryInput) {
    const startAt = parseDate(input.startAt, "startAt");
    const endAt = parseDate(input.endAt, "endAt");
    const tagIds = await validateProjectTaskAndTags(
      organizationId,
      input.projectId,
      input.taskId,
      input.tagIds,
    );

    ensureChronologicalOrder(startAt, endAt);

    return timeTrackerRepository.createManualEntry(organizationId, userId, {
      description: input.description.trim(),
      projectId: input.projectId,
      taskId: input.taskId,
      tagIds,
      isBillable: input.isBillable,
      startAt,
      endAt,
    });
  },

  async updateEntry(organizationId: string, userId: string, input: UpdateEntryInput) {
    const startAt = parseDate(input.startAt, "startAt");
    const endAt = parseDate(input.endAt, "endAt");
    const tagIds = await validateProjectTaskAndTags(
      organizationId,
      input.projectId,
      input.taskId,
      input.tagIds,
    );

    ensureChronologicalOrder(startAt, endAt);

    const updatedEntry = await timeTrackerRepository.updateEntry(organizationId, userId, {
      entryId: input.entryId,
      description: input.description.trim(),
      projectId: input.projectId,
      taskId: input.taskId,
      tagIds,
      isBillable: input.isBillable,
      startAt,
      endAt,
    });

    if (!updatedEntry) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }

    return updatedEntry;
  },

  async deleteEntry(organizationId: string, userId: string, input: DeleteEntryInput) {
    const deletedEntry = await timeTrackerRepository.deleteEntry(
      organizationId,
      userId,
      input.entryId,
    );

    if (!deletedEntry) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }

    return deletedEntry;
  },

  async createProject(organizationId: string, userId: string, input: CreateProjectInput) {
    const name = normalizeName(input.name);
    const existingProject = await timeTrackerRepository.findProjectByNormalizedName(
      organizationId,
      name,
    );

    if (existingProject) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A project with that name already exists",
      });
    }

    return timeTrackerRepository.createProject(organizationId, userId, {
      name,
      clientId: input.clientId ?? null,
      color: input.color ?? null,
      hourlyRate: input.hourlyRate ?? null,
      access: input.access ?? "public",
    });
  },

  async listProjects(
    organizationId: string,
    input: ListProjectsInput,
  ): Promise<TrackerProjectFull[]> {
    const rows = await timeTrackerRepository.getProjectsWithStats(
      organizationId,
      input.showArchived,
    );

    return rows
      .filter((row) => {
        if (input.clientId !== undefined && input.clientId !== null) {
          if (row.clientId !== input.clientId) return false;
        }
        if (input.access) {
          if (row.access !== input.access) return false;
        }
        if (input.hasBilling === true) {
          if (!row.hourlyRate || Number(row.hourlyRate) <= 0) return false;
        }
        if (input.hasBilling === false) {
          if (row.hourlyRate && Number(row.hourlyRate) > 0) return false;
        }
        return true;
      })
      .map((row) => {
        const trackedSeconds = Number(row.trackedSeconds) || 0;
        const hourlyRate = row.hourlyRate ? Number(row.hourlyRate) : 0;
        const amount = (trackedSeconds / 3600) * hourlyRate;

        return {
          id: row.id,
          name: row.name,
          clientId: row.clientId,
          clientName: row.clientName ?? null,
          clientCurrency: row.clientCurrency ?? null,
          color: row.color,
          hourlyRate: row.hourlyRate ?? null,
          isArchived: row.isArchived,
          access: row.access,
          trackedSeconds,
          amount,
        };
      });
  },

  async updateProject(organizationId: string, input: UpdateProjectInput): Promise<{ id: number }> {
    const existing = await timeTrackerRepository.getProjectById(organizationId, input.id);

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    }

    if (
      input.name !== undefined &&
      input.name.trim().toLowerCase() !== existing.name.toLowerCase()
    ) {
      const duplicate = await timeTrackerRepository.findProjectByNormalizedName(
        organizationId,
        input.name,
      );
      if (duplicate && duplicate.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A project with that name already exists",
        });
      }
    }

    const updated = await timeTrackerRepository.updateProject(organizationId, input.id, {
      name: input.name,
      clientId: input.clientId,
      color: input.color,
      hourlyRate: input.hourlyRate,
      isArchived: input.isArchived,
      access: input.access,
    });

    if (!updated) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    }

    return { id: updated.id };
  },

  async deleteProject(organizationId: string, input: DeleteProjectInput): Promise<{ id: number }> {
    const deleted = await timeTrackerRepository.deleteProject(organizationId, input.id);

    if (!deleted) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    }

    return { id: deleted.id };
  },

  async createTag(organizationId: string, userId: string, input: CreateTagInput) {
    const name = normalizeName(input.name);
    const existingTag = await timeTrackerRepository.findTagByNormalizedName(organizationId, name);

    if (existingTag) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A tag with that name already exists",
      });
    }

    return timeTrackerRepository.createTag(organizationId, userId, name);
  },

  async listTags(organizationId: string) {
    return timeTrackerRepository.getTags(organizationId);
  },

  async updateTag(organizationId: string, input: UpdateTagInput) {
    const name = normalizeName(input.name);
    const existingTag = await timeTrackerRepository.findTagByNormalizedName(organizationId, name);

    if (existingTag && existingTag.id !== input.id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A tag with that name already exists",
      });
    }

    const tag = await timeTrackerRepository.updateTag(organizationId, input.id, name);

    if (!tag) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tag not found",
      });
    }

    return tag;
  },

  async deleteTag(organizationId: string, input: DeleteTagInput) {
    const tag = await timeTrackerRepository.deleteTag(organizationId, input.id);

    if (!tag) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tag not found",
      });
    }

    return tag;
  },
};
