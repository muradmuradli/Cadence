import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, or } from "drizzle-orm";
import { chatterbox } from "@/lib/chatterbox-client";
import { db } from "@/lib/db";
import { generation, voice } from "@/lib/db/schema";
import { uploadAudio } from "@/lib/s3";
import { TEXT_MAX_LENGTH } from "@/lib/constants/values";
import { createTRPCRouter, orgProcedure } from "../init";

const generationColumns = {
  id: generation.id,
  voiceId: generation.voiceId,
  text: generation.text,
  voiceName: generation.voiceName,
  temperature: generation.temperature,
  topP: generation.topP,
  topK: generation.topK,
  repetitionPenalty: generation.repetitionPenalty,
  createdAt: generation.createdAt,
  updatedAt: generation.updatedAt,
};

export const generationsRouter = createTRPCRouter({
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [found] = await db
        .select(generationColumns)
        .from(generation)
        .where(
          and(eq(generation.id, input.id), eq(generation.orgId, ctx.orgId)),
        );

      if (!found) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...found,
        audioUrl: `/api/audio/${found.id}`,
      };
    }),

  getAll: orgProcedure.query(async ({ ctx }) => {
    return db
      .select(generationColumns)
      .from(generation)
      .where(eq(generation.orgId, ctx.orgId))
      .orderBy(desc(generation.createdAt));
  }),

  create: orgProcedure
    .input(
      z.object({
        text: z.string().min(1).max(TEXT_MAX_LENGTH),
        voiceId: z.string().min(1),
        temperature: z.number().min(0).max(2).default(0.8),
        topP: z.number().min(0).max(1).default(0.95),
        topK: z.number().min(1).max(10000).default(1000),
        repetitionPenalty: z.number().min(1).max(2).default(1.2),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const foundVoice = await db.query.voice.findFirst({
        where: and(
          eq(voice.id, input.voiceId),
          or(
            eq(voice.variant, "SYSTEM"),
            and(eq(voice.variant, "CUSTOM"), eq(voice.orgId, ctx.orgId)),
          ),
        ),
        columns: {
          id: true,
          name: true,
          s3ObjectKey: true,
        },
      });

      if (!foundVoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (!foundVoice.s3ObjectKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice audio not available",
        });
      }

      const { data, error } = await chatterbox.POST("/generate", {
        body: {
          prompt: input.text,
          voice_key: foundVoice.s3ObjectKey,
          temperature: input.temperature,
          top_p: input.topP,
          top_k: input.topK,
          repetition_penalty: input.repetitionPenalty,
          norm_loudness: true,
        },
        parseAs: "arrayBuffer",
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate audio",
        });
      }

      if (!(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid audio response",
        });
      }

      const buffer = Buffer.from(data);

      const [created] = await db
        .insert(generation)
        .values({
          orgId: ctx.orgId,
          text: input.text,
          voiceName: foundVoice.name,
          voiceId: foundVoice.id,
          temperature: input.temperature,
          topP: input.topP,
          topK: input.topK,
          repetitionPenalty: input.repetitionPenalty,
        })
        .returning({ id: generation.id });

      const s3ObjectKey = `generations/orgs/${ctx.orgId}/${created.id}`;

      try {
        await uploadAudio({ buffer, key: s3ObjectKey });

        await db
          .update(generation)
          .set({ s3ObjectKey })
          .where(eq(generation.id, created.id));
      } catch {
        await db
          .delete(generation)
          .where(eq(generation.id, created.id))
          .catch(() => {});

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      return {
        id: created.id,
      };
    }),
});
