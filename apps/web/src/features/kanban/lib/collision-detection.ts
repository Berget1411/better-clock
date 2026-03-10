import { pointerWithin, rectIntersection } from "@dnd-kit/core";
import type { CollisionDetection } from "@dnd-kit/core";

/**
 * Custom collision detection for kanban boards with nested droppables.
 *
 * Problem: when a card (droppable) lives inside a column (droppable), the
 * default strategy may prefer the card over the column, causing incorrect
 * drop targets.
 *
 * Solution: prioritize droppables that have `data.current.type === "column"`.
 * This ensures cross-column drops are always resolved against the column, not
 * a card inside it.
 */
export const kanbanCollisionDetection: CollisionDetection = (args) => {
  // First try pointer-within collisions
  const pointerCollisions = pointerWithin(args);

  // Prefer column-typed droppables
  const columnCollisions = pointerCollisions.filter(
    ({ data }) => data?.droppableContainer?.data?.current?.type === "column",
  );

  if (columnCollisions.length > 0) {
    return columnCollisions;
  }

  // Fall back to rect intersection, again preferring columns
  const rectCollisions = rectIntersection(args);
  const rectColumnCollisions = rectCollisions.filter(
    ({ data }) => data?.droppableContainer?.data?.current?.type === "column",
  );

  if (rectColumnCollisions.length > 0) {
    return rectColumnCollisions;
  }

  return rectCollisions;
};
