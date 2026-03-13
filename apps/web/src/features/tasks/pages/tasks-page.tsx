import { useState } from "react";

import { useProjectsQuery } from "@/features/projects/services/queries";
import { Badge } from "@open-learn/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@open-learn/ui/components/tabs";

import { TasksKanban } from "../components/tasks-kanban";
import { TasksTable } from "../components/tasks-table";
import { TASK_COPY } from "../constants";
import { useTasksQuery } from "../services/queries";

export function TasksPage() {
  const [view, setView] = useState("table");
  const tasksQuery = useTasksQuery();
  const projectsQuery = useProjectsQuery({ showArchived: false });

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{TASK_COPY.pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{TASK_COPY.pageDescription}</p>
        </div>

        <Tabs value={view} onValueChange={setView} className="gap-3">
          <TabsList variant="line">
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="kanban">
              Kanban
              <Badge
                variant="outline"
                className="rounded-none px-1.5 py-0 text-[10px] uppercase tracking-[0.18em]"
              >
                New
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <TasksTable
              tasks={tasksQuery.data ?? []}
              projects={projectsQuery.data ?? []}
              isLoading={tasksQuery.isLoading}
            />
          </TabsContent>

          <TabsContent value="kanban">
            <TasksKanban
              tasks={tasksQuery.data ?? []}
              projects={projectsQuery.data ?? []}
              isLoading={tasksQuery.isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
