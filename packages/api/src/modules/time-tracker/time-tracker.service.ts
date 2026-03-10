import { TRPCError } from "@trpc/server";
import { timeTrackerRepository } from "@open-learn/db";

import type {
  CreateManualEntryInput,
  CreateProjectInput,
  CreateTagInput,
  DeleteEntryInput,
  DiscardTimerInput,
  OverviewInput,
  StartTimerInput,
  StopTimerInput,
  TrackerEntry,
  TrackerOverview,
  UpdateActiveTimerInput,
  UpdateEntryInput,
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
  tags: Array<{ id: number; name: string }>;
}): TrackerEntry {
  return {
    id: entry.id,
    description: entry.description,
    isBillable: entry.isBillable,
    startAt: entry.startAt.toISOString(),
    endAt: entry.endAt?.toISOString() ?? null,
    project: entry.project,
    tags: entry.tags,
  };
}

async function validateProjectAndTags(userId: string, projectId: number | null, tagIds: number[]) {
  const uniqueTagIds = [...new Set(tagIds)];

  if (projectId !== null) {
    const project = await timeTrackerRepository.getProjectById(userId, projectId);

    if (!project) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Selected project was not found",
      });
    }
  }

  if (uniqueTagIds.length) {
    const tags = await timeTrackerRepository.getTagsByIds(userId, uniqueTagIds);

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
  async overview(userId: string, input: OverviewInput): Promise<TrackerOverview> {
    const from = parseDate(input.from, "from");
    const to = parseDate(input.to, "to");

    if (to <= from) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Range end must be after range start",
      });
    }

    const [activeEntry, entries, projects, tags] = await Promise.all([
      timeTrackerRepository.getActiveEntry(userId),
      timeTrackerRepository.getEntriesInRange(userId, from, to),
      timeTrackerRepository.getProjects(userId),
      timeTrackerRepository.getTags(userId),
    ]);

    return {
      activeEntry: activeEntry ? mapEntry(activeEntry) : null,
      entries: entries.map(mapEntry),
      projects,
      tags,
    };
  },

  async startTimer(userId: string, input: StartTimerInput) {
    const tagIds = await validateProjectAndTags(userId, input.projectId, input.tagIds);

    return timeTrackerRepository.startTimer(
      userId,
      {
        description: input.description.trim(),
        projectId: input.projectId,
        tagIds,
        isBillable: input.isBillable,
      },
      new Date(),
    );
  },

  async updateActiveTimer(userId: string, input: UpdateActiveTimerInput) {
    const tagIds = await validateProjectAndTags(userId, input.projectId, input.tagIds);
    const updatedEntry = await timeTrackerRepository.updateActiveTimer(userId, {
      entryId: input.entryId,
      description: input.description.trim(),
      projectId: input.projectId,
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

  async stopTimer(userId: string, input: StopTimerInput) {
    const stoppedEntry = await timeTrackerRepository.stopTimer(userId, input.entryId, new Date());

    if (!stoppedEntry) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Active timer not found",
      });
    }

    return stoppedEntry;
  },

  async discardTimer(userId: string, input: DiscardTimerInput) {
    const deletedEntry = await timeTrackerRepository.discardTimer(userId, input.entryId);

    if (!deletedEntry) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Active timer not found",
      });
    }

    return deletedEntry;
  },

  async createManualEntry(userId: string, input: CreateManualEntryInput) {
    const startAt = parseDate(input.startAt, "startAt");
    const endAt = parseDate(input.endAt, "endAt");
    const tagIds = await validateProjectAndTags(userId, input.projectId, input.tagIds);

    ensureChronologicalOrder(startAt, endAt);

    return timeTrackerRepository.createManualEntry(userId, {
      description: input.description.trim(),
      projectId: input.projectId,
      tagIds,
      isBillable: input.isBillable,
      startAt,
      endAt,
    });
  },

  async updateEntry(userId: string, input: UpdateEntryInput) {
    const startAt = parseDate(input.startAt, "startAt");
    const endAt = parseDate(input.endAt, "endAt");
    const tagIds = await validateProjectAndTags(userId, input.projectId, input.tagIds);

    ensureChronologicalOrder(startAt, endAt);

    const updatedEntry = await timeTrackerRepository.updateEntry(userId, {
      entryId: input.entryId,
      description: input.description.trim(),
      projectId: input.projectId,
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

  async deleteEntry(userId: string, input: DeleteEntryInput) {
    const deletedEntry = await timeTrackerRepository.deleteEntry(userId, input.entryId);

    if (!deletedEntry) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }

    return deletedEntry;
  },

  async createProject(userId: string, input: CreateProjectInput) {
    const name = normalizeName(input.name);
    const existingProject = await timeTrackerRepository.findProjectByNormalizedName(userId, name);

    if (existingProject) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A project with that name already exists",
      });
    }

    return timeTrackerRepository.createProject(userId, name);
  },

  async createTag(userId: string, input: CreateTagInput) {
    const name = normalizeName(input.name);
    const existingTag = await timeTrackerRepository.findTagByNormalizedName(userId, name);

    if (existingTag) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A tag with that name already exists",
      });
    }

    return timeTrackerRepository.createTag(userId, name);
  },
};
