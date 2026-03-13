import { systemProcedures } from "../../modules/system";
import { taskRouter } from "../../modules/task";
import { organizationRouter } from "../../modules/organization";
import { timeTrackerRouter } from "../../modules/time-tracker";
import { clientRouter } from "../../modules/client";
import { router } from "../init";

export const appRouter = router({
  ...systemProcedures,
  organization: organizationRouter,
  timeTracker: timeTrackerRouter,
  task: taskRouter,
  client: clientRouter,
});

export type AppRouter = typeof appRouter;
