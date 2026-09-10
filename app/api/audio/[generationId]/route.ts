import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/server";
import { ensurePersonalOrganization } from "@/lib/auth/organization";
import { db } from "@/lib/db";
import { generation } from "@/lib/db/schema";
import { getSignedAudioUrl } from "@/lib/s3";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ generationId: string }> },
) {
  const { data: session } = await auth.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const orgId =
    session.session.activeOrganizationId ??
    (await ensurePersonalOrganization(
      session.user.id,
      session.user.name,
      session.user.email,
    ));

  const { generationId } = await params;

  const [found] = await db
    .select({ s3ObjectKey: generation.s3ObjectKey })
    .from(generation)
    .where(and(eq(generation.id, generationId), eq(generation.orgId, orgId)));

  if (!found) {
    return new Response("Not found", { status: 404 });
  }

  if (!found.s3ObjectKey) {
    return new Response("Audio is not available yet", { status: 409 });
  }

  const signedUrl = await getSignedAudioUrl(found.s3ObjectKey);
  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    return new Response("Failed to fetch audio", { status: 502 });
  }

  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
