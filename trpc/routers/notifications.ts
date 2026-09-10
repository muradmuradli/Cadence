import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

export const notificationsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(notification)
      .where(eq(notification.recipientEmail, ctx.user.email.toLowerCase()))
      .orderBy(desc(notification.createdAt))
      .limit(50);
  }),

  markRead: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(notification)
        .set({ read: true })
        .where(
          and(
            eq(notification.id, input.id),
            eq(notification.recipientEmail, ctx.user.email.toLowerCase()),
          ),
        );

      return { success: true };
    }),
});
