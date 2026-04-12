import { useState } from "react";

import { AppPage, AppPageHeader, AppPageHeaderMeta } from "@/components/app-page-shell";
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
    <Tabs value={view} onValueChange={setView}>
      <AppPage>
        <AppPageHeader
          title={TASK_COPY.pageTitle}
          description="Switch between a dense planning table and a flow-oriented board without losing the same task context."
          actions={
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
          }
        >
          <AppPageHeaderMeta
            items={[
              { label: "Tasks", value: String(tasksQuery.data?.length ?? 0) },
              { label: "Projects", value: String(projectsQuery.data?.length ?? 0) },
              { label: "View", value: view === "table" ? "Table" : "Kanban" },
            ]}
          />
        </AppPageHeader>

        <TabsContent value="table" className="mt-0">
          <TasksTable
            tasks={tasksQuery.data ?? []}
            projects={projectsQuery.data ?? []}
            isLoading={tasksQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="kanban" className="mt-0">
          <TasksKanban
            tasks={tasksQuery.data ?? []}
            projects={projectsQuery.data ?? []}
            isLoading={tasksQuery.isLoading}
          />
        </TabsContent>
      </AppPage>
    </Tabs>
  );
}
