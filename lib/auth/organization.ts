import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

const COOKIE_WRITE_ERROR = "Cookies can only be modified";

function isCookieWriteError(error: unknown): error is Error {
  return error instanceof Error && error.message.includes(COOKIE_WRITE_ERROR);
}

// better-auth's shared session middleware (used by every authenticated
// endpoint - getSession, organization.create, .setActive, all of it)
// opportunistically refreshes the session-data cookie whenever the cached
// session is nearing its refresh window, which Next.js only allows from a
// Server Action or Route Handler. This module runs from tRPC procedures
// during a Server Component's render (prefetch), which is neither - so
// *any* of these calls can throw that write error, even though the actual
// mutation already succeeded on the auth server. This wraps a call so that
// specific throw is treated as "no result available right now" instead of
// crashing the request.
async function tolerateCookieWriteError<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (isCookieWriteError(error)) {
      Sentry.logger.warn(
        "Suppressed a cookie-write error from an auth call made during SSR prefetch",
        { label, error: (error as Error).message },
      );
      return null;
    }

    throw error;
  }
}

// Queries the auth server's own table directly instead of going through
// auth.organization.getFullOrganization(): that SDK call unreliably reports
// "not found" for an org that demonstrably exists in this exact table,
// immediately after it was created in the very same request - almost
// certainly a session/member visibility check racing the write, not a real
// "doesn't exist yet". A direct read of the deterministic slug has no such
// caveat and no cookie side effects to tolerate.
async function findPersonalOrganizationId(slug: string): Promise<string | null> {
  const result = await db.execute<{ id: string }>(
    sql`select id from neon_auth.organization where slug = ${slug} limit 1`,
  );

  return result.rows[0]?.id ?? null;
}

async function createPersonalOrganization(slug: string, name: string) {
  return tolerateCookieWriteError("create", () =>
    auth.organization.create({ name, slug }),
  );
}

// Best-effort only - never the source of the org id we actually return.
// Whether this persists into the session cookie for next time doesn't
// affect correctness of the current request.
async function tryActivate(slug: string): Promise<void> {
  await tolerateCookieWriteError("setActive", () =>
    auth.organization.setActive({ organizationSlug: slug }),
  );
}

// Every user gets a personal organization behind the scenes - there's no
// multi-member/invite flow yet, so this just gives each user a stable orgId
// to scope their data by, without making them think about "organizations".
export async function ensurePersonalOrganization(
  userId: string,
  userName: string | null | undefined,
  userEmail: string,
): Promise<string> {
  const slug = `personal-${userId}`;

  const existingId = await findPersonalOrganizationId(slug);

  if (existingId) {
    await tryActivate(slug);
    return existingId;
  }

  const firstName = userName?.trim().split(/\s+/)[0];
  const name = `${firstName || userEmail}'s Workspace`;

  const createResult = await createPersonalOrganization(slug, name);

  if (createResult?.data) {
    await tryActivate(slug);
    return createResult.data.id;
  }

  // Either lost a create race against a concurrent request for the same
  // user, or the create call itself hit the cookie-write error and we
  // don't know if it went through - either way, the org should now exist
  // under our deterministic slug, so look it up. Note: better-auth reports
  // an already-exists collision with code "validation_failed" (a generic
  // validation error code), not a distinguishable "already exists" code -
  // the only reliable signal is that create() didn't return data - so this
  // always retries by slug on any create failure rather than trying to
  // match a specific error code/message.
  const error = createResult?.error;

  const retryId = await findPersonalOrganizationId(slug);

  if (retryId) {
    await tryActivate(slug);
    return retryId;
  }

  Sentry.logger.error("Failed to provision personal organization", {
    userId,
    error,
  });

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error?.message ?? "Failed to provision organization",
  });
}
