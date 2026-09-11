import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/server";
import { ensurePersonalOrganization } from "@/lib/auth/organization";
import { db } from "@/lib/db";
import { voice } from "@/lib/db/schema";
import { getSignedAudioUrl } from "@/lib/s3";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ voiceId: string }> },
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

  const { voiceId } = await params;

  const [found] = await db
    .select({
      variant: voice.variant,
      orgId: voice.orgId,
      s3ObjectKey: voice.s3ObjectKey,
    })
    .from(voice)
    .where(eq(voice.id, voiceId));

  if (!found) {
    return new Response("Not found", { status: 404 });
  }

  if (found.variant === "CUSTOM" && found.orgId !== orgId) {
    return new Response("Not found", { status: 404 });
  }

  if (!found.s3ObjectKey) {
    return new Response("Voice audio is not available yet", { status: 409 });
  }

  const signedUrl = await getSignedAudioUrl(found.s3ObjectKey);
  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    return new Response("Failed to fetch voice audio", { status: 502 });
  }

  const contentType =
    audioResponse.headers.get("content-type") || "audio/wav";

  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        found.variant === "SYSTEM"
          ? "public, max-age=86400"
          : "private, max-age=3600",
    },
  });
}
