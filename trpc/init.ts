import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { auth } from "@/lib/auth/server";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  return {};
});

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
  });
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ next }) => {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session,
      user: session.user,
    },
  });
});

// Organization procedure - requires userId and orgId
export const orgProcedure = baseProcedure.use(async ({ next }) => {
  const { data: session } = await auth.getSession();

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { activeOrganizationId: orgId } = session.session;

  if (!orgId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Organization required",
    });
  }

  return next({
    ctx: {
      userId: session.user.id,
      orgId,
    },
  });
});
