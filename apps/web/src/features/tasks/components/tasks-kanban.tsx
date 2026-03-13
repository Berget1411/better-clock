import type { TaskListItem, TaskStatus } from "@open-learn/api/modules/task/task.schema";
import type { TrackerProjectFull } from "@open-learn/api/modules/time-tracker/time-tracker.schema";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  CollisionDetection,
  UniqueIdentifier,
} from "@dnd-kit/core";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@open-learn/ui/components/badge";
import { Button } from "@open-learn/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@open-learn/ui/components/empty";
import { Input } from "@open-learn/ui/components/input";
import { Skeleton } from "@open-learn/ui/components/skeleton";
import { cn } from "@open-learn/ui/lib/utils";
import { FolderKanbanIcon, SearchIcon } from "lucide-react";

import { TASK_COPY, TASK_STATUS_LABELS, TASK_STATUS_OPTIONS } from "../constants";
import { useUpdateTask } from "../services/mutations";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskRowActions } from "./task-row-actions";
import { TaskTypeBadge } from "./task-type-badge";

interface TasksKanbanProps {
  tasks: TaskListItem[];
  projects: TrackerProjectFull[];
  isLoading: boolean;
}

const columnPriorityCollision: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const pointerColumnCollisions = pointerCollisions.filter(
    (collision) => collision.data?.droppableContainer?.data?.current?.type === "column",
  );

  if (pointerColumnCollisions.length > 0) {
    return pointerColumnCollisions;
  }

  const rectCollisions = rectIntersection(args);
  const rectColumnCollisions = rectCollisions.filter(
    (collision) => collision.data?.droppableContainer?.data?.current?.type === "column",
  );

  if (rectColumnCollisions.length > 0) {
    return rectColumnCollisions;
  }

  return rectCollisions;
};

function TasksKanbanSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {TASK_STATUS_OPTIONS.map((status) => (
        <div
          key={status}
          className="min-h-72 rounded-none border border-border/60 bg-muted/20 p-3 ring-1 ring-foreground/10"
        >
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-none" />
            <Skeleton className="h-5 w-8 rounded-none" />
          </div>
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`${status}-${index}`}
                className="rounded-none border border-border/60 bg-background p-3 ring-1 ring-foreground/10"
              >
                <Skeleton className="mb-2 h-4 w-16 rounded-none" />
                <Skeleton className="mb-2 h-4 w-full rounded-none" />
                <Skeleton className="h-4 w-24 rounded-none" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskKanbanCard({
  task,
  onEdit,
}: {
  task: TaskListItem;
  onEdit: (task: TaskListItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: "card",
      card: task,
      status: task.status,
    },
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      className={cn(
        "group rounded-none border border-border/60 bg-background p-3 ring-1 ring-foreground/10 transition-colors",
        "cursor-grab active:cursor-grabbing touch-none select-none",
        isDragging && "opacity-40",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="mb-1 tabular-nums text-[11px] font-medium text-muted-foreground">
            {task.displayKey}
          </p>
          <h3 className="line-clamp-2 text-sm text-foreground">{task.title}</h3>
        </div>
        <div onPointerDown={(event) => event.stopPropagation()}>
          <TaskRowActions task={task} onEdit={onEdit} />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TaskTypeBadge type={task.type} />
      </div>

      {task.projectName ? (
        <p className="mb-3 truncate text-xs text-muted-foreground">{task.projectName}</p>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <TaskPriorityBadge priority={task.priority} />
        <span className="text-[11px] text-muted-foreground">
          {new Date(task.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </article>
  );
}

function TaskKanbanColumn({
  status,
  tasks,
  activeOverStatus,
  onEdit,
}: {
  status: TaskStatus;
  tasks: TaskListItem[];
  activeOverStatus: TaskStatus | null;
  onEdit: (task: TaskListItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      columnId: status,
    },
  });

  const isActive = activeOverStatus === status || isOver;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[28rem] min-w-[18rem] flex-col rounded-none border border-border/60 bg-muted/20 p-3 ring-1 ring-foreground/10 transition-colors",
        isActive && "border-foreground/20 bg-muted/35",
      )}
      aria-label={TASK_STATUS_LABELS[status]}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {TASK_STATUS_LABELS[status]}
        </p>
        <Badge variant="outline" className="rounded-none tabular-nums">
          {tasks.length}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskKanbanCard key={task.id} task={task} onEdit={onEdit} />)
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-none border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </div>
    </section>
  );
}

function TaskKanbanOverlayCard({ task }: { task: TaskListItem }) {
  return (
    <div className="w-[18rem] rounded-none border border-border/60 bg-background p-3 ring-1 ring-foreground/10">
      <p className="mb-1 tabular-nums text-[11px] font-medium text-muted-foreground">
        {task.displayKey}
      </p>
      <h3 className="mb-3 line-clamp-2 text-sm text-foreground">{task.title}</h3>
      <div className="flex items-center justify-between gap-2">
        <TaskTypeBadge type={task.type} />
        <TaskPriorityBadge priority={task.priority} />
      </div>
    </div>
  );
}

export function TasksKanban({ tasks, projects, isLoading }: TasksKanbanProps) {
  const updateTask = useUpdateTask();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [activeTask, setActiveTask] = useState<TaskListItem | null>(null);
  const [activeOverStatus, setActiveOverStatus] = useState<TaskStatus | null>(null);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) =>
      [task.displayKey, task.title, task.projectName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [search, tasks]);

  const tasksByStatus = useMemo(
    () =>
      Object.fromEntries(
        TASK_STATUS_OPTIONS.map((status) => [
          status,
          filteredTasks.filter((task) => task.status === status),
        ]),
      ) as Record<TaskStatus, TaskListItem[]>,
    [filteredTasks],
  );

  const statusIds = useMemo(() => new Set<TaskStatus>(TASK_STATUS_OPTIONS), []);
  const cardStatusMap = useMemo(() => {
    const entries = filteredTasks.map((task) => [String(task.id), task.status] as const);
    return new Map<string, TaskStatus>(entries);
  }, [filteredTasks]);

  const findTargetStatus = useCallback(
    (overId: UniqueIdentifier | undefined): TaskStatus | null => {
      if (!overId) {
        return null;
      }

      const normalized = String(overId) as TaskStatus;
      if (statusIds.has(normalized)) {
        return normalized;
      }

      return cardStatusMap.get(String(overId)) ?? null;
    },
    [cardStatusMap, statusIds],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const card = tasks.find((entry) => entry.id === Number(event.active.id)) ?? null;
      setActiveTask(card);
      setActiveOverStatus(card?.status ?? null);
    },
    [tasks],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      setActiveOverStatus(findTargetStatus(event.over?.id));
    },
    [findTargetStatus],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const task = tasks.find((entry) => entry.id === Number(event.active.id)) ?? null;
      const nextStatus = findTargetStatus(event.over?.id);

      setActiveTask(null);
      setActiveOverStatus(null);

      if (!task || !nextStatus || task.status === nextStatus) {
        return;
      }

      updateTask.mutate({ id: task.id, status: nextStatus });
    },
    [findTargetStatus, tasks, updateTask],
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setActiveOverStatus(null);
  }, []);

  const hasTasks = tasks.length > 0;
  const hasFilteredTasks = filteredTasks.length > 0;

  return (
    <>
      <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} projects={projects} />
      <TaskFormDialog
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null);
          }
        }}
        task={editingTask}
        projects={projects}
      />

      <section className="overflow-hidden rounded-none border border-border/60 bg-background ring-1 ring-foreground/10">
        <div className="flex flex-col justify-between gap-3 border-b border-border/60 px-4 py-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-64 flex-1 lg:w-64 lg:flex-none">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={TASK_COPY.searchPlaceholder}
                className="w-full pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Drag cards between columns to update status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setCreateOpen(true)}>{TASK_COPY.addTask}</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4">
            <TasksKanbanSkeleton />
          </div>
        ) : !hasTasks ? (
          <Empty className="border-0 px-6 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderKanbanIcon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>{TASK_COPY.emptyTitle}</EmptyTitle>
              <EmptyDescription>{TASK_COPY.emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => setCreateOpen(true)}>{TASK_COPY.addTask}</Button>
          </Empty>
        ) : !hasFilteredTasks ? (
          <Empty className="border-0 px-6 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>{TASK_COPY.noResults}</EmptyTitle>
              <EmptyDescription>
                Try a different search query to reveal matching tasks.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={columnPriorityCollision}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="flex min-w-max gap-4">
                {TASK_STATUS_OPTIONS.map((status) => (
                  <TaskKanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    activeOverStatus={activeOverStatus}
                    onEdit={setEditingTask}
                  />
                ))}
              </div>
              <DragOverlay modifiers={[snapCenterToCursor]} dropAnimation={null}>
                {activeTask ? <TaskKanbanOverlayCard task={activeTask} /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </section>
    </>
  );
}
