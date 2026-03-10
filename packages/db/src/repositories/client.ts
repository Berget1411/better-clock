import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "../client";
import { client } from "../schema/time-tracker";

export const clientRepository = {
  async getClients(organizationId: string, showArchived = false) {
    return db
      .select({
        id: client.id,
        name: client.name,
        address: client.address,
        currency: client.currency,
        isArchived: client.isArchived,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      })
      .from(client)
      .where(
        showArchived
          ? eq(client.organizationId, organizationId)
          : and(eq(client.organizationId, organizationId), eq(client.isArchived, false)),
      )
      .orderBy(asc(client.name));
  },

  async getClientById(organizationId: string, clientId: number) {
    const [found] = await db
      .select({
        id: client.id,
        name: client.name,
        address: client.address,
        currency: client.currency,
        isArchived: client.isArchived,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      })
      .from(client)
      .where(and(eq(client.organizationId, organizationId), eq(client.id, clientId)))
      .limit(1);

    return found ?? null;
  },

  async findClientByNormalizedName(organizationId: string, name: string) {
    const [found] = await db
      .select({ id: client.id, name: client.name })
      .from(client)
      .where(
        and(
          eq(client.organizationId, organizationId),
          sql`lower(${client.name}) = ${name.trim().toLowerCase()}`,
        ),
      )
      .limit(1);

    return found ?? null;
  },

  async createClient(
    organizationId: string,
    input: { name: string; address?: string | null; currency: string },
  ) {
    const [created] = await db
      .insert(client)
      .values({
        organizationId,
        name: input.name.trim(),
        address: input.address ?? null,
        currency: input.currency,
      })
      .returning({
        id: client.id,
        name: client.name,
        address: client.address,
        currency: client.currency,
        isArchived: client.isArchived,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      });

    return created;
  },

  async updateClient(
    organizationId: string,
    clientId: number,
    input: {
      name?: string;
      address?: string | null;
      currency?: string;
      isArchived?: boolean;
    },
  ) {
    const [updated] = await db
      .update(client)
      .set({
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.isArchived !== undefined ? { isArchived: input.isArchived } : {}),
      })
      .where(and(eq(client.organizationId, organizationId), eq(client.id, clientId)))
      .returning({
        id: client.id,
        name: client.name,
        address: client.address,
        currency: client.currency,
        isArchived: client.isArchived,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      });

    return updated ?? null;
  },

  async deleteClient(organizationId: string, clientId: number) {
    const [deleted] = await db
      .delete(client)
      .where(and(eq(client.organizationId, organizationId), eq(client.id, clientId)))
      .returning({ id: client.id });

    return deleted ?? null;
  },
};
