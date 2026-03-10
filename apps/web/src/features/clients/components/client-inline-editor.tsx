import type { Client } from "@open-learn/api/modules/client/client.schema";

import { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@open-learn/ui/components/button";
import { Input } from "@open-learn/ui/components/input";
import { TableCell, TableRow } from "@open-learn/ui/components/table";

import { useUpdateClient } from "../services/mutations";
import { CurrencySelect } from "./currency-select";

interface ClientInlineEditorProps {
  client: Client;
  onCancel: () => void;
}

export function ClientInlineEditor({ client, onCancel }: ClientInlineEditorProps) {
  const [name, setName] = useState(client.name);
  const [address, setAddress] = useState(client.address ?? "");
  const [currency, setCurrency] = useState(client.currency);

  const updateClient = useUpdateClient();

  async function handleSave() {
    if (!name.trim()) return;

    await updateClient.mutateAsync({
      id: client.id,
      name: name.trim(),
      address: address.trim() || null,
      currency,
    });

    onCancel();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onCancel();
  }

  return (
    <TableRow>
      <TableCell />
      <TableCell>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client name"
          className="h-8 w-48"
          autoFocus
          onKeyDown={handleKeyDown}
        />
      </TableCell>
      <TableCell>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address (optional)"
          className="h-8"
          onKeyDown={handleKeyDown}
        />
      </TableCell>
      <TableCell>
        <CurrencySelect value={currency} onChange={setCurrency} className="h-8 text-sm" />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={handleSave}
            disabled={!name.trim() || updateClient.isPending}
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
