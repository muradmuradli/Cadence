CREATE TYPE "public"."voice_category" AS ENUM('AUDIOBOOK', 'CONVERSATIONAL', 'CUSTOMER_SERVICE', 'GENERAL', 'NARRATIVE', 'CHARACTERS', 'MEDITATION', 'MOTIVATIONAL', 'PODCAST', 'ADVERTISING', 'VOICEOVER', 'CORPORATE');--> statement-breakpoint
CREATE TYPE "public"."voice_variant" AS ENUM('SYSTEM', 'CUSTOM');--> statement-breakpoint
CREATE TABLE "generation" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"voice_id" text,
	"text" text NOT NULL,
	"voice_name" text NOT NULL,
	"r2_object_key" text,
	"temperature" double precision NOT NULL,
	"top_p" double precision NOT NULL,
	"top_k" integer NOT NULL,
	"repetition_penalty" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text,
	"name" text NOT NULL,
	"description" text,
	"category" "voice_category" DEFAULT 'GENERAL' NOT NULL,
	"language" text DEFAULT 'en-US' NOT NULL,
	"variant" "voice_variant" NOT NULL,
	"r2_object_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation" ADD CONSTRAINT "generation_voice_id_voice_id_fk" FOREIGN KEY ("voice_id") REFERENCES "public"."voice"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_org_id_idx" ON "generation" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "generation_voice_id_idx" ON "generation" USING btree ("voice_id");--> statement-breakpoint
CREATE INDEX "voice_variant_idx" ON "voice" USING btree ("variant");--> statement-breakpoint
CREATE INDEX "voice_org_id_idx" ON "voice" USING btree ("org_id");