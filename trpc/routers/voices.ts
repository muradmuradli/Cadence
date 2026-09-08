import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { voice } from "@/lib/db/schema";
import { deleteAudio } from "@/lib/s3";
import { createTRPCRouter, orgProcedure, protectedProcedure } from "../init";

export const voicesRouter = createTRPCRouter({
  // Only the "custom" half is org-scoped — system voices aren't tied to an
  // org at all, so this stays on protectedProcedure (just signed in) rather
  // than orgProcedure, which would hard-fail for a signed-in user who isn't
  // in an org yet, even though they should still be able to see built-in
  // voices.
  getAll: protectedProcedure
    .input(
      z
        .object({
          query: z.string().trim().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const orgId = ctx.session.session.activeOrganizationId;

      const searchFilter = input?.query
        ? or(
            ilike(voice.name, `%${input.query}%`),
            ilike(voice.description, `%${input.query}%`),
          )
        : undefined;

      const voiceColumns = {
        id: voice.id,
        name: voice.name,
        description: voice.description,
        category: voice.category,
        language: voice.language,
        variant: voice.variant,
      };

      const [custom, system] = await Promise.all([
        orgId
          ? db
              .select(voiceColumns)
              .from(voice)
              .where(
                and(
                  eq(voice.variant, "CUSTOM"),
                  eq(voice.orgId, orgId),
                  searchFilter,
                ),
              )
              .orderBy(desc(voice.createdAt))
          : Promise.resolve([]),
        db
          .select(voiceColumns)
          .from(voice)
          .where(and(eq(voice.variant, "SYSTEM"), searchFilter))
          .orderBy(asc(voice.name)),
      ]);

      return { custom, system };
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingVoice = await db.query.voice.findFirst({
        where: and(
          eq(voice.id, input.id),
          eq(voice.variant, "CUSTOM"),
          eq(voice.orgId, ctx.orgId),
        ),
        columns: { id: true, s3ObjectKey: true },
      });

      if (!existingVoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      await db.delete(voice).where(eq(voice.id, existingVoice.id));

      if (existingVoice.s3ObjectKey) {
        // In production, consider background jobs, retries, cron jobs etc.
        await deleteAudio(existingVoice.s3ObjectKey).catch(() => {});
      }

      return { success: true };
    }),
});
