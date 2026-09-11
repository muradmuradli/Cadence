import { eq } from "drizzle-orm";
import { parseBuffer } from "music-metadata";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@/lib/auth/server";
import { ensurePersonalOrganization } from "@/lib/auth/organization";
import { db } from "@/lib/db";
import { voice, voiceCategoryEnum, type VoiceCategory } from "@/lib/db/schema";
import { uploadAudio } from "@/lib/s3";
import {
  VOICE_MAX_UPLOAD_SIZE_BYTES,
  VOICE_MIN_DURATION_SECONDS,
} from "@/lib/constants/values";

const createVoiceSchema = z.object({
  name: z.string().min(1, "Voice name is required"),
  category: z.enum(
    voiceCategoryEnum.enumValues as [VoiceCategory, ...VoiceCategory[]],
  ),
  language: z.string().min(1, "Language is required"),
  description: z.string().nullish(),
});

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId =
    session.session.activeOrganizationId ??
    (await ensurePersonalOrganization(
      session.user.id,
      session.user.name,
      session.user.email,
    ));

  const url = new URL(request.url);

  const validation = createVoiceSchema.safeParse({
    name: url.searchParams.get("name"),
    category: url.searchParams.get("category"),
    language: url.searchParams.get("language"),
    description: url.searchParams.get("description"),
  });

  if (!validation.success) {
    return Response.json(
      {
        error: "Invalid input",
        issues: validation.error.issues,
      },
      { status: 400 },
    );
  }

  const { name, category, language, description } = validation.data;

  const fileBuffer = await request.arrayBuffer();

  if (!fileBuffer.byteLength) {
    return Response.json(
      { error: "Please upload an audio file" },
      { status: 400 },
    );
  }

  if (fileBuffer.byteLength > VOICE_MAX_UPLOAD_SIZE_BYTES) {
    return Response.json(
      { error: "Audio file exceeds the 20 MB size limit" },
      { status: 413 },
    );
  }

  const contentType = request.headers.get("content-type");

  if (!contentType) {
    return Response.json(
      { error: "Missing Content-Type header" },
      { status: 400 },
    );
  }

  const normalizedContentType =
    contentType.split(";")[0]?.trim() || "audio/wav";

  // Validate audio format and duration
  let duration: number;
  try {
    const metadata = await parseBuffer(
      new Uint8Array(fileBuffer),
      { mimeType: normalizedContentType },
      { duration: true },
    );
    duration = metadata.format.duration ?? 0;
  } catch {
    return Response.json(
      { error: "File is not a valid audio file" },
      { status: 422 },
    );
  }

  if (duration < VOICE_MIN_DURATION_SECONDS) {
    return Response.json(
      {
        error: `Audio too short (${duration.toFixed(1)}s). Minimum duration is ${VOICE_MIN_DURATION_SECONDS} seconds.`,
      },
      { status: 422 },
    );
  }

  let createdVoiceId: string | null = null;

  try {
    const [created] = await db
      .insert(voice)
      .values({
        name,
        variant: "CUSTOM",
        orgId,
        description: description ?? null,
        category,
        language,
      })
      .returning({ id: voice.id });

    createdVoiceId = created.id;
    const s3ObjectKey = `voices/orgs/${orgId}/${created.id}`;

    await uploadAudio({
      buffer: Buffer.from(fileBuffer),
      key: s3ObjectKey,
      contentType: normalizedContentType,
    });

    await db
      .update(voice)
      .set({ s3ObjectKey })
      .where(eq(voice.id, created.id));
  } catch (error) {
    Sentry.logger.error("Failed to create voice", { orgId, error });

    if (createdVoiceId) {
      await db
        .delete(voice)
        .where(eq(voice.id, createdVoiceId))
        .catch(() => {});
    }

    return Response.json(
      { error: "Failed to create voice. Please retry." },
      { status: 500 },
    );
  }

  return Response.json(
    { name, message: "Voice created successfully" },
    { status: 201 },
  );
}
