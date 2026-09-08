import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { voice, type VoiceCategory } from "@/lib/db/schema";
import { uploadAudio } from "@/lib/s3";
import { CANONICAL_SYSTEM_VOICE_NAMES } from "@/voices/data/voice-scoping";

const SYSTEM_VOICES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "system-voices",
);

interface VoiceMetadata {
  description: string;
  category: VoiceCategory;
  language: string;
}

const systemVoiceMetadata: Record<string, VoiceMetadata> = {
  Aaron: {
    description: "Soothing and calm, like a self-help audiobook narrator",
    category: "AUDIOBOOK",
    language: "en-US",
  },
  Abigail: {
    description: "Friendly and conversational with a warm, approachable tone",
    category: "CONVERSATIONAL",
    language: "en-GB",
  },
  Anaya: {
    description: "Polite and professional, suited for customer service",
    category: "CUSTOMER_SERVICE",
    language: "en-IN",
  },
  Andy: {
    description: "Versatile and clear, a reliable all-purpose narrator",
    category: "GENERAL",
    language: "en-US",
  },
  Archer: {
    description: "Laid-back and reflective with a steady, storytelling pace",
    category: "NARRATIVE",
    language: "en-US",
  },
  Brian: {
    description: "Professional and helpful with a clear customer support tone",
    category: "CUSTOMER_SERVICE",
    language: "en-US",
  },
  Chloe: {
    description: "Bright and bubbly with a cheerful, outgoing personality",
    category: "CORPORATE",
    language: "en-AU",
  },
  Dylan: {
    description:
      "Thoughtful and intimate, like a quiet late-night conversation",
    category: "GENERAL",
    language: "en-US",
  },
  Emmanuel: {
    description: "Nasally and distinctive with a quirky, cartoon-like quality",
    category: "CHARACTERS",
    language: "en-US",
  },
  Ethan: {
    description: "Polished and warm with crisp, studio-quality delivery",
    category: "VOICEOVER",
    language: "en-US",
  },
  Evelyn: {
    description: "Warm Southern charm with a heartfelt, down-to-earth feel",
    category: "CONVERSATIONAL",
    language: "en-US",
  },
  Gavin: {
    description: "Calm and reassuring with a smooth, natural flow",
    category: "MEDITATION",
    language: "en-US",
  },
  Gordon: {
    description: "Warm and encouraging with an uplifting, motivational tone",
    category: "MOTIVATIONAL",
    language: "en-US",
  },
  Ivan: {
    description: "Deep and cinematic with a dramatic, movie-character presence",
    category: "CHARACTERS",
    language: "ru-RU",
  },
  Laura: {
    description: "Authentic and warm with a conversational Midwestern tone",
    category: "CONVERSATIONAL",
    language: "en-US",
  },
  Lucy: {
    description: "Direct and composed with a professional phone manner",
    category: "CUSTOMER_SERVICE",
    language: "en-US",
  },
  Madison: {
    description: "Energetic and unfiltered with a casual, chatty vibe",
    category: "PODCAST",
    language: "en-US",
  },
  Marisol: {
    description: "Confident and polished with a persuasive, ad-ready delivery",
    category: "ADVERTISING",
    language: "en-US",
  },
  Meera: {
    description: "Friendly and helpful with a clear, service-oriented tone",
    category: "CUSTOMER_SERVICE",
    language: "en-IN",
  },
  Walter: {
    description: "Old and raspy with deep gravitas, like a wise grandfather",
    category: "NARRATIVE",
    language: "en-US",
  },
};

async function readSystemVoiceAudio(name: string) {
  const filePath = path.join(SYSTEM_VOICES_DIR, `${name}.wav`);
  const buffer = Buffer.from(await fs.readFile(filePath));
  return { buffer, contentType: "audio/wav" };
}

async function seedSystemVoice(name: string) {
  const { buffer, contentType } = await readSystemVoiceAudio(name);
  const meta = systemVoiceMetadata[name];

  const existingSystemVoice = await db.query.voice.findFirst({
    where: and(eq(voice.variant, "SYSTEM"), eq(voice.name, name)),
    columns: { id: true },
  });

  if (existingSystemVoice) {
    const s3ObjectKey = `voices/system/${existingSystemVoice.id}`;

    await uploadAudio({ key: s3ObjectKey, buffer, contentType });

    await db
      .update(voice)
      .set({
        s3ObjectKey,
        ...(meta && {
          description: meta.description,
          category: meta.category,
          language: meta.language,
        }),
      })
      .where(eq(voice.id, existingSystemVoice.id));
    return;
  }

  const [created] = await db
    .insert(voice)
    .values({
      name,
      variant: "SYSTEM",
      orgId: null,
      ...(meta && {
        description: meta.description,
        category: meta.category,
        language: meta.language,
      }),
    })
    .returning({ id: voice.id });

  const s3ObjectKey = `voices/system/${created.id}`;

  try {
    await uploadAudio({ key: s3ObjectKey, buffer, contentType });

    await db
      .update(voice)
      .set({ s3ObjectKey })
      .where(eq(voice.id, created.id));
  } catch (error) {
    await db
      .delete(voice)
      .where(eq(voice.id, created.id))
      .catch(() => {});

    throw error;
  }
}

async function main() {
  console.log(
    `Seeding ${CANONICAL_SYSTEM_VOICE_NAMES.length} system voices...`,
  );

  for (const name of CANONICAL_SYSTEM_VOICE_NAMES) {
    console.log(`- ${name}`);
    await seedSystemVoice(name);
  }

  console.log("System voice seed completed.");
}

main().catch((error) => {
  console.error("Failed to seed system voices:", error);
  process.exitCode = 1;
});
