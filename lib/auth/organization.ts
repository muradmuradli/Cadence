import { TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth/server";

// Every user gets a personal organization behind the scenes - there's no
// multi-member/invite flow yet, so this just gives each user a stable orgId
// to scope their data by, without making them think about "organizations".
export async function ensurePersonalOrganization(
  userId: string,
  userName: string | null | undefined,
  userEmail: string,
): Promise<string> {
  const { data: organizations } = await auth.organization.list();
  const existing = organizations?.[0];

  if (existing) {
    await auth.organization.setActive({ organizationId: existing.id });
    return existing.id;
  }

  const firstName = userName?.trim().split(/\s+/)[0];

  const { data: created, error } = await auth.organization.create({
    name: `${firstName || userEmail}'s Workspace`,
    slug: `personal-${userId}`,
  });

  if (created) {
    return created.id;
  }

  // Another concurrent request may have created it first - fall back to it
  // instead of erroring out.
  const { data: retryOrganizations } = await auth.organization.list();
  const retryExisting = retryOrganizations?.[0];

  if (retryExisting) {
    await auth.organization.setActive({ organizationId: retryExisting.id });
    return retryExisting.id;
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error?.message ?? "Failed to provision organization",
  });
}
