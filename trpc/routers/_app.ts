import { createTRPCRouter } from "../init";
// import { billingRouter } from "./billing";
import { generationsRouter } from "./generations";
import { notificationsRouter } from "./notifications";
import { organizationsRouter } from "./organizations";
import { voicesRouter } from "./voices";
export const appRouter = createTRPCRouter({
  voices: voicesRouter,
  organizations: organizationsRouter,
  notifications: notificationsRouter,
  generations: generationsRouter,
  // billing: billingRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
