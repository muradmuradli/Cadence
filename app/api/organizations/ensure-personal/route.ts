import { auth } from "@/lib/auth/server";
import { ensurePersonalOrganization } from "@/lib/auth/organization";

// A real Route Handler - unlike a Server Component's render (where tRPC
// prefetch runs org-provisioning today as a fallback), this context is
// explicitly allowed to write cookies. Calling this right after sign-in/
// sign-up means the session's activeOrganizationId is already set by the
// time the user reaches any page that prefetches org-scoped data, so the
// RSC-context fallback in orgProcedure never has to run for the normal
// happy path.
export async function POST() {
  const { data: session } = await auth.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (session.session.activeOrganizationId) {
    return Response.json({ orgId: session.session.activeOrganizationId });
  }

  const orgId = await ensurePersonalOrganization(
    session.user.id,
    session.user.name,
    session.user.email,
  );

  return Response.json({ orgId });
}
