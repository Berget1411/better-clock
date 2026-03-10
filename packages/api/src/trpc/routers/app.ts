import { systemProcedures } from "../../modules/system";
import { timeTrackerRouter } from "../../modules/time-tracker";
import { todoRouter } from "../../modules/todo";
import { router } from "../init";

export const appRouter = router({
  ...systemProcedures,
  timeTracker: timeTrackerRouter,
  todo: todoRouter,
});

export type AppRouter = typeof appRouter;
