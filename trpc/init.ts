import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/server";
import { ensurePersonalOrganization } from "@/lib/auth/organization";
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

const sentryMiddleware = t.middleware(async ({ path, type, next }) => {
  const result = await next();

  if (!result.ok) {
    Sentry.captureException(result.error, {
      tags: { trpcPath: path, trpcType: type },
    });
  }

  return result;
});

export const baseProcedure = t.procedure.use(sentryMiddleware);
export const protectedProcedure = baseProcedure.use(async ({ next }) => {
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

  const orgId =
    session.session.activeOrganizationId ??
    (await ensurePersonalOrganization(
      session.user.id,
      session.user.name,
      session.user.email,
    ));

  return next({
    ctx: {
      userId: session.user.id,
      orgId,
    },
  });
});
