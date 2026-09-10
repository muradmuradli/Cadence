CREATE TYPE "public"."notification_type" AS ENUM('ORGANIZATION_INVITE');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_email" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"message" text NOT NULL,
	"reference_id" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "notification_recipient_email_idx" ON "notification" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "notification_reference_id_idx" ON "notification" USING btree ("reference_id");