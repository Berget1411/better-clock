import z from "zod";

export const clientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  address: z.string().nullable(),
  currency: z.string(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const listClientsInputSchema = z.object({
  showArchived: z.boolean().optional().default(false),
});

export const createClientInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  address: z.string().trim().max(500).optional().nullable(),
  currency: z.string().trim().length(3).toUpperCase().default("USD"),
});

export const updateClientInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(100).optional(),
  address: z.string().trim().max(500).optional().nullable(),
  currency: z.string().trim().length(3).toUpperCase().optional(),
  isArchived: z.boolean().optional(),
});

export const deleteClientInputSchema = z.object({
  id: z.number().int().positive(),
});

export type Client = z.infer<typeof clientSchema>;
export type ListClientsInput = z.infer<typeof listClientsInputSchema>;
export type CreateClientInput = z.infer<typeof createClientInputSchema>;
export type UpdateClientInput = z.infer<typeof updateClientInputSchema>;
export type DeleteClientInput = z.infer<typeof deleteClientInputSchema>;
