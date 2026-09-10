import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@/lib/auth/server";
import { ensurePersonalOrganization } from "@/lib/auth/organization";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

export const organizationsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const activeOrganizationId =
      ctx.session.session.activeOrganizationId ??
      (await ensurePersonalOrganization(
        ctx.user.id,
        ctx.user.name,
        ctx.user.email,
      ));

    const { data: organizations } = await auth.organization.list();

    return {
      organizations: organizations ?? [],
      activeOrganizationId,
    };
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(60),
      }),
    )
    .mutation(async ({ input }) => {
      const { data, error } = await auth.organization.create({
        name: input.name,
        slug: createId(),
      });

      if (error || !data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message ?? "Failed to create organization",
        });
      }

      return data;
    }),

  setActive: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const { error } = await auth.organization.setActive({
        organizationId: input.organizationId,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to switch organization",
        });
      }

      return { success: true };
    }),

  // Invitations are only meaningful between already-registered users here -
  // there's no email-delivery/signup-gate flow. The invitee sees the invite
  // in their own notifications/invitations UI the next time they're signed in.
  inviteMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        email: z.email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();

      const { data: invitation, error } = await auth.organization.inviteMember(
        {
          email,
          organizationId: input.organizationId,
          role: "member",
        },
      );

      if (error || !invitation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error?.message ?? "Failed to invite member",
        });
      }

      const { data: organization } = await auth.organization.getFullOrganization(
        { query: { organizationId: input.organizationId } },
      );

      const inviterName = ctx.user.name || ctx.user.email;
      const organizationName = organization?.name ?? "an organization";

      await db.insert(notification).values({
        recipientEmail: email,
        type: "ORGANIZATION_INVITE",
        message: `${inviterName} invited you to ${organizationName}`,
        referenceId: invitation.id,
      });

      return invitation;
    }),

  getMyInvitations: protectedProcedure.query(async ({ ctx }) => {
    const { data: invitations } = await auth.organization.listUserInvitations(
      {},
    );
    const pending = invitations ?? [];

    if (pending.length === 0) {
      return [];
    }

    // listUserInvitations doesn't tell us who invited them by name - pull the
    // message we rendered into our own notification row at invite time.
    const notifications = await db
      .select({
        referenceId: notification.referenceId,
        message: notification.message,
      })
      .from(notification)
      .where(
        and(
          eq(notification.recipientEmail, ctx.user.email.toLowerCase()),
          eq(notification.type, "ORGANIZATION_INVITE"),
          inArray(
            notification.referenceId,
            pending.map((invitation) => invitation.id),
          ),
        ),
      );

    const messageByInvitationId = new Map(
      notifications.map((n) => [n.referenceId, n.message]),
    );

    return pending.map((invitation) => ({
      ...invitation,
      message:
        messageByInvitationId.get(invitation.id) ??
        `You were invited to ${invitation.organizationName}`,
    }));
  }),

  acceptInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const { error } = await auth.organization.acceptInvitation({
        invitationId: input.invitationId,
      });

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message ?? "Failed to accept invitation",
        });
      }

      await db
        .update(notification)
        .set({ read: true })
        .where(
          and(
            eq(notification.type, "ORGANIZATION_INVITE"),
            eq(notification.referenceId, input.invitationId),
          ),
        );

      return { success: true };
    }),

  rejectInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const { error } = await auth.organization.rejectInvitation({
        invitationId: input.invitationId,
      });

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message ?? "Failed to reject invitation",
        });
      }

      await db
        .update(notification)
        .set({ read: true })
        .where(
          and(
            eq(notification.type, "ORGANIZATION_INVITE"),
            eq(notification.referenceId, input.invitationId),
          ),
        );

      return { success: true };
    }),
});
