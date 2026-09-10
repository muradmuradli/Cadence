import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const voiceVariantEnum = pgEnum("voice_variant", ["SYSTEM", "CUSTOM"]);

export const voiceCategoryEnum = pgEnum("voice_category", [
  "AUDIOBOOK",
  "CONVERSATIONAL",
  "CUSTOMER_SERVICE",
  "GENERAL",
  "NARRATIVE",
  "CHARACTERS",
  "MEDITATION",
  "MOTIVATIONAL",
  "PODCAST",
  "ADVERTISING",
  "VOICEOVER",
  "CORPORATE",
]);

export type VoiceCategory = (typeof voiceCategoryEnum.enumValues)[number];

export const voice = pgTable(
  "voice",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    orgId: text("org_id"),

    name: text("name").notNull(),
    description: text("description"),
    category: voiceCategoryEnum("category").notNull().default("GENERAL"),
    language: text("language").notNull().default("en-US"),
    variant: voiceVariantEnum("variant").notNull(),
    s3ObjectKey: text("s3_object_key"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("voice_variant_idx").on(table.variant),
    index("voice_org_id_idx").on(table.orgId),
  ],
);

export const generation = pgTable(
  "generation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    orgId: text("org_id").notNull(),

    voiceId: text("voice_id").references(() => voice.id, {
      onDelete: "set null",
    }),

    text: text("text").notNull(),
    voiceName: text("voice_name").notNull(),
    s3ObjectKey: text("s3_object_key"),
    temperature: doublePrecision("temperature").notNull(),
    topP: doublePrecision("top_p").notNull(),
    topK: integer("top_k").notNull(),
    repetitionPenalty: doublePrecision("repetition_penalty").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("generation_org_id_idx").on(table.orgId),
    index("generation_voice_id_idx").on(table.voiceId),
  ],
);

// Generic, reusable notification feed - deliberately knows nothing about
// what it's notifying about beyond `type` (used to route UI behavior, e.g.
// opening the invitations modal) and `referenceId` (a pointer to whatever
// entity that type refers to - the better-auth invitation id for
// ORGANIZATION_INVITE). Users live in Neon Auth's own store, not this
// database, so recipientEmail is a plain unforeign-keyed reference to that,
// same as voice.orgId / generation.orgId - and it's email rather than a
// userId because that's the only identifier we can resolve for an arbitrary
// recipient without admin API access.
export const notificationTypeEnum = pgEnum("notification_type", [
  "ORGANIZATION_INVITE",
]);

export const notification = pgTable(
  "notification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    recipientEmail: text("recipient_email").notNull(),
    type: notificationTypeEnum("type").notNull(),
    message: text("message").notNull(),
    referenceId: text("reference_id"),
    read: boolean("read").notNull().default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notification_recipient_email_idx").on(table.recipientEmail),
    index("notification_reference_id_idx").on(table.referenceId),
  ],
);

export const voiceRelations = relations(voice, ({ many }) => ({
  generations: many(generation),
}));

export const generationRelations = relations(generation, ({ one }) => ({
  voice: one(voice, {
    fields: [generation.voiceId],
    references: [voice.id],
  }),
}));
