import { TRPCError } from "@trpc/server";
import { clientRepository } from "@open-learn/db";

import type {
  Client,
  CreateClientInput,
  DeleteClientInput,
  ListClientsInput,
  UpdateClientInput,
} from "./client.schema";

function mapClient(row: {
  id: number;
  name: string;
  address: string | null;
  currency: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Client {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    currency: row.currency,
    isArchived: row.isArchived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const clientService = {
  async list(organizationId: string, input: ListClientsInput): Promise<Client[]> {
    const rows = await clientRepository.getClients(organizationId, input.showArchived);
    return rows.map(mapClient);
  },

  async create(organizationId: string, input: CreateClientInput): Promise<Client> {
    const existing = await clientRepository.findClientByNormalizedName(organizationId, input.name);

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A client with that name already exists",
      });
    }

    const created = await clientRepository.createClient(organizationId, {
      name: input.name,
      address: input.address ?? null,
      currency: input.currency,
    });

    if (!created) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create client" });
    }

    return mapClient(created);
  },

  async update(organizationId: string, input: UpdateClientInput): Promise<Client> {
    const existing = await clientRepository.getClientById(organizationId, input.id);

    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
    }

    if (input.name !== undefined && input.name !== existing.name) {
      const duplicate = await clientRepository.findClientByNormalizedName(
        organizationId,
        input.name,
      );

      if (duplicate && duplicate.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A client with that name already exists",
        });
      }
    }

    const updated = await clientRepository.updateClient(organizationId, input.id, {
      name: input.name,
      address: input.address,
      currency: input.currency,
      isArchived: input.isArchived,
    });

    if (!updated) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
    }

    return mapClient(updated);
  },

  async delete(organizationId: string, input: DeleteClientInput): Promise<{ id: number }> {
    const deleted = await clientRepository.deleteClient(organizationId, input.id);

    if (!deleted) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
    }

    return { id: deleted.id };
  },
};
