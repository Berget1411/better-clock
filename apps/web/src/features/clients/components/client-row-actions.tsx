import type { Client } from "@open-learn/api/modules/client/client.schema";

import { RowActions } from "@/components/row-actions";

import { useDeleteClient, useUpdateClient } from "../services/mutations";

interface ClientRowActionsProps {
  client: Client;
}

export function ClientRowActions({ client }: ClientRowActionsProps) {
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  return (
    <RowActions
      isArchived={client.isArchived}
      onToggleArchive={() => updateClient.mutate({ id: client.id, isArchived: !client.isArchived })}
      isArchivePending={updateClient.isPending}
      onDelete={() => deleteClient.mutate({ id: client.id })}
      deleteTitle="Delete client"
      deleteDescription={
        <>
          Are you sure you want to permanently delete{" "}
          <span className="font-medium">{client.name}</span>? This action cannot be undone.
        </>
      }
    />
  );
}
