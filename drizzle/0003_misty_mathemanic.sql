CREATE TYPE "public"."notification_type" AS ENUM('ORGANIZATION_INVITE');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_email" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"organization_id" text NOT NULL,
	"organization_name" text NOT NULL,
	"invitation_id" text NOT NULL,
	"inviter_user_id" text NOT NULL,
	"inviter_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "notification_recipient_email_idx" ON "notification" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "notification_invitation_id_idx" ON "notification" USING btree ("invitation_id");