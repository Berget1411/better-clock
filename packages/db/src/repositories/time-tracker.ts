import { and, desc, eq, gte, inArray, isNotNull, isNull, lt, sql } from "drizzle-orm";

import { db } from "../client";
import { trackerProject, trackerTag, timeEntry, timeEntryTag } from "../schema/time-tracker";

type EntryRow = {
  id: number;
  description: string;
  isBillable: boolean;
  startAt: Date;
  endAt: Date | null;
  projectId: number | null;
  projectName: string | null;
};

type TrackerEntryRecord = {
  id: number;
  description: string;
  isBillable: boolean;
  startAt: Date;
  endAt: Date | null;
  project: { id: number; name: string } | null;
  tags: Array<{ id: number; name: string }>;
};

async function hydrateEntries(rows: EntryRow[]): Promise<TrackerEntryRecord[]> {
  if (!rows.length) {
    return [];
  }

  const tagRows = await db
    .select({
      timeEntryId: timeEntryTag.timeEntryId,
      id: trackerTag.id,
      name: trackerTag.name,
    })
    .from(timeEntryTag)
    .innerJoin(trackerTag, eq(timeEntryTag.tagId, trackerTag.id))
    .where(
      inArray(
        timeEntryTag.timeEntryId,
        rows.map((row) => row.id),
      ),
    );

  const tagsByEntryId = new Map<number, Array<{ id: number; name: string }>>();

  for (const tagRow of tagRows) {
    const entryTags = tagsByEntryId.get(tagRow.timeEntryId) ?? [];
    entryTags.push({ id: tagRow.id, name: tagRow.name });
    tagsByEntryId.set(tagRow.timeEntryId, entryTags);
  }

  return rows.map((row) => ({
    id: row.id,
    description: row.description,
    isBillable: row.isBillable,
    startAt: row.startAt,
    endAt: row.endAt,
    project: row.projectId && row.projectName ? { id: row.projectId, name: row.projectName } : null,
    tags: tagsByEntryId.get(row.id) ?? [],
  }));
}

async function insertEntryTags(entryId: number, tagIds: number[]) {
  if (!tagIds.length) {
    return;
  }

  await db.insert(timeEntryTag).values(
    tagIds.map((tagId) => ({
      timeEntryId: entryId,
      tagId,
    })),
  );
}

async function replaceEntryTags(entryId: number, tagIds: number[]) {
  await db.delete(timeEntryTag).where(eq(timeEntryTag.timeEntryId, entryId));
  await insertEntryTags(entryId, tagIds);
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export const timeTrackerRepository = {
  async getProjects(organizationId: string) {
    return db
      .select({ id: trackerProject.id, name: trackerProject.name })
      .from(trackerProject)
      .where(eq(trackerProject.organizationId, organizationId))
      .orderBy(trackerProject.name);
  },

  async getProjectById(organizationId: string, projectId: number) {
    const [project] = await db
      .select({ id: trackerProject.id, name: trackerProject.name })
      .from(trackerProject)
      .where(
        and(eq(trackerProject.organizationId, organizationId), eq(trackerProject.id, projectId)),
      )
      .limit(1);

    return project ?? null;
  },

  async findProjectByNormalizedName(organizationId: string, name: string) {
    const [project] = await db
      .select({ id: trackerProject.id, name: trackerProject.name })
      .from(trackerProject)
      .where(
        and(
          eq(trackerProject.organizationId, organizationId),
          sql`lower(${trackerProject.name}) = ${normalizeName(name)}`,
        ),
      )
      .limit(1);

    return project ?? null;
  },

  async createProject(organizationId: string, userId: string, name: string) {
    const [project] = await db
      .insert(trackerProject)
      .values({ organizationId, userId, name: name.trim() })
      .returning({ id: trackerProject.id, name: trackerProject.name });

    return project;
  },

  async getTags(organizationId: string) {
    return db
      .select({ id: trackerTag.id, name: trackerTag.name })
      .from(trackerTag)
      .where(eq(trackerTag.organizationId, organizationId))
      .orderBy(trackerTag.name);
  },

  async getTagsByIds(organizationId: string, tagIds: number[]) {
    if (!tagIds.length) {
      return [];
    }

    return db
      .select({ id: trackerTag.id, name: trackerTag.name })
      .from(trackerTag)
      .where(and(eq(trackerTag.organizationId, organizationId), inArray(trackerTag.id, tagIds)));
  },

  async findTagByNormalizedName(organizationId: string, name: string) {
    const [tag] = await db
      .select({ id: trackerTag.id, name: trackerTag.name })
      .from(trackerTag)
      .where(
        and(
          eq(trackerTag.organizationId, organizationId),
          sql`lower(${trackerTag.name}) = ${normalizeName(name)}`,
        ),
      )
      .limit(1);

    return tag ?? null;
  },

  async createTag(organizationId: string, userId: string, name: string) {
    const [tag] = await db
      .insert(trackerTag)
      .values({ organizationId, userId, name: name.trim() })
      .returning({ id: trackerTag.id, name: trackerTag.name });

    return tag;
  },

  async getActiveEntry(organizationId: string, userId: string) {
    const rows = await db
      .select({
        id: timeEntry.id,
        description: timeEntry.description,
        isBillable: timeEntry.isBillable,
        startAt: timeEntry.startAt,
        endAt: timeEntry.endAt,
        projectId: trackerProject.id,
        projectName: trackerProject.name,
      })
      .from(timeEntry)
      .leftJoin(trackerProject, eq(timeEntry.projectId, trackerProject.id))
      .where(
        and(
          eq(timeEntry.organizationId, organizationId),
          eq(timeEntry.userId, userId),
          isNull(timeEntry.endAt),
        ),
      )
      .limit(1);

    const [entry] = await hydrateEntries(rows);

    return entry ?? null;
  },

  async getEntriesInRange(organizationId: string, userId: string, from: Date, to: Date) {
    const rows = await db
      .select({
        id: timeEntry.id,
        description: timeEntry.description,
        isBillable: timeEntry.isBillable,
        startAt: timeEntry.startAt,
        endAt: timeEntry.endAt,
        projectId: trackerProject.id,
        projectName: trackerProject.name,
      })
      .from(timeEntry)
      .leftJoin(trackerProject, eq(timeEntry.projectId, trackerProject.id))
      .where(
        and(
          eq(timeEntry.organizationId, organizationId),
          eq(timeEntry.userId, userId),
          isNotNull(timeEntry.endAt),
          gte(timeEntry.startAt, from),
          lt(timeEntry.startAt, to),
        ),
      )
      .orderBy(desc(timeEntry.startAt), desc(timeEntry.id));

    return hydrateEntries(rows);
  },

  async startTimer(
    organizationId: string,
    userId: string,
    input: { description: string; projectId: number | null; tagIds: number[]; isBillable: boolean },
    startedAt: Date,
  ) {
    await db
      .update(timeEntry)
      .set({ endAt: startedAt })
      .where(
        and(
          eq(timeEntry.organizationId, organizationId),
          eq(timeEntry.userId, userId),
          isNull(timeEntry.endAt),
        ),
      );

    const [createdEntry] = await db
      .insert(timeEntry)
      .values({
        organizationId,
        userId,
        description: input.description,
        projectId: input.projectId,
        isBillable: input.isBillable,
        startAt: startedAt,
      })
      .returning({ id: timeEntry.id });

    if (!createdEntry) {
      throw new Error("Failed to create active timer");
    }

    await insertEntryTags(createdEntry.id, input.tagIds);

    return createdEntry;
  },

  async updateActiveTimer(
    organizationId: string,
    userId: string,
    input: {
      entryId: number;
      description: string;
      projectId: number | null;
      tagIds: number[];
      isBillable: boolean;
    },
  ) {
    const [updatedEntry] = await db
      .update(timeEntry)
      .set({
        description: input.description,
        projectId: input.projectId,
        isBillable: input.isBillable,
      })
      .where(
        and(
          eq(timeEntry.id, input.entryId),
          eq(timeEntry.organizationId, organizationId),
          eq(timeEntry.userId, userId),
          isNull(timeEntry.endAt),
        ),
      )
      .returning({ id: timeEntry.id });

    if (!updatedEntry) {
      return null;
    }

    await replaceEntryTags(input.entryId, input.tagIds);

    return updatedEntry;
  },

  async stopTimer(organizationId: string, userId: string, entryId: number, stoppedAt: Date) {
    const [entry] = await db
      .update(timeEntry)
      .set({ endAt: stoppedAt })
      .where(
        and(
          eq(timeEntry.id, entryId),
          eq(timeEntry.organizationId, organizationId),
          eq(timeEntry.userId, userId),
          isNull(timeEntry.endAt),
        ),
      )
      .returning({ id: timeEntry.id });

    return entry ?? null;
  },

  async discardTimer(organizationId: string, userId: string, entryId: number) {
    const [entry] = await db
      .delete(timeEntry)
      .where(
        and(
          eq(timeEntry.id, entryId),
          eq(timeEntry.organizationId, organizationId),
          eq(timeEntry.userId, userId),
          isNull(timeEntry.endAt),
        ),
      )
      .returning({ id: timeEntry.id });

    return entry ?? null;
  },

  async createManualEntry(
    organizationId: string,
    userId: string,
    input: {
      description: string;
      projectId: number | null;
      tagIds: number[];
      isBillable: boolean;
      startAt: Date;
      endAt: Date;
    },
  ) {
    const [createdEntry] = await db
      .insert(timeEntry)
      .values({
        organizationId,
        userId,
        description: input.description,
        projectId: input.projectId,
        isBillable: input.isBillable,
        startAt: input.startAt,
        endAt: input.endAt,
      })
      .returning({ id: timeEntry.id });

    if (!createdEntry) {
      throw new Error("Failed to create manual entry");
    }

    await insertEntryTags(createdEntry.id, input.tagIds);

    return createdEntry;
  },

  async updateEntry(
    organizationId: string,
    userId: string,
    input: {
      entryId: number;
      description: string;
      projectId: number | null;
      tagIds: number[];
      isBillable: boolean;
      startAt: Date;
      endAt: Date;
    },
  ) {
    const [updatedEntry] = await db
      .update(timeEntry)
      .set({
        description: input.description,
        projectId: input.projectId,
        isBillable: input.isBillable,
        startAt: input.startAt,
        endAt: input.endAt,
      })
      .where(
        and(
          eq(timeEntry.id, input.entryId),
          eq(timeEntry.organizationId, organizationId),
          eq(timeEntry.userId, userId),
          isNotNull(timeEntry.endAt),
        ),
      )
      .returning({ id: timeEntry.id });

    if (!updatedEntry) {
      return null;
    }

    await replaceEntryTags(input.entryId, input.tagIds);

    return updatedEntry;
  },

  async deleteEntry(organizationId: string, userId: string, entryId: number) {
    const [entry] = await db
      .delete(timeEntry)
      .where(
        and(
          eq(timeEntry.id, entryId),
          eq(timeEntry.organizationId, organizationId),
          eq(timeEntry.userId, userId),
          isNotNull(timeEntry.endAt),
        ),
      )
      .returning({ id: timeEntry.id });

    return entry ?? null;
  },
};
