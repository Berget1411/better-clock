import { systemProcedures } from "../../modules/system";
import { organizationRouter } from "../../modules/organization";
import { timeTrackerRouter } from "../../modules/time-tracker";
import { todoRouter } from "../../modules/todo";
import { clientRouter } from "../../modules/client";
import { kanbanRouter } from "../../modules/kanban";
import { router } from "../init";

export const appRouter = router({
  ...systemProcedures,
  organization: organizationRouter,
  timeTracker: timeTrackerRouter,
  todo: todoRouter,
  client: clientRouter,
  kanban: kanbanRouter,
});

export type AppRouter = typeof appRouter;
