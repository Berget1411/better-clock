import { useState } from "react";

interface UseTableSelectionOptions<T extends { id: number }> {
  items: T[];
}

interface UseTableSelectionReturn {
  selectedIds: Set<number>;
  toggleSelect: (id: number) => void;
  toggleSelectAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
}

export function useTableSelection<T extends { id: number }>({
  items,
}: UseTableSelectionOptions<T>): UseTableSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const areAllSelected = items.length > 0 && items.every((item) => prev.has(item.id));
      if (areAllSelected) {
        for (const item of items) {
          next.delete(item.id);
        }
      } else {
        for (const item of items) {
          next.add(item.id);
        }
      }
      return next;
    });
  }

  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const someSelected = items.some((item) => selectedIds.has(item.id)) && !allSelected;

  return { selectedIds, toggleSelect, toggleSelectAll, allSelected, someSelected };
}
