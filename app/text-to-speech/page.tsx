import type { Metadata } from "next";
import { TextToSpeechView } from "./text-to-speech-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";
import { requireSession } from "@/lib/auth/require-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Text to Speech" };

export default async function TextToSpeechPage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string; voiceId?: string }>;
}) {
  await requireSession();

  const { text, voiceId } = await searchParams;

  prefetch(trpc.voices.getAll.queryOptions());
  prefetch(trpc.generations.getAll.queryOptions());

  return (
    <HydrateClient>
      <TextToSpeechView initialValues={{ text, voiceId }} />
    </HydrateClient>
  );
}
