import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
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

export const voiceRelations = relations(voice, ({ many }) => ({
  generations: many(generation),
}));

export const generationRelations = relations(generation, ({ one }) => ({
  voice: one(voice, {
    fields: [generation.voiceId],
    references: [voice.id],
  }),
}));
