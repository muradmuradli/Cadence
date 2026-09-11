"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { VoicePreviewPanel } from "@/components/voice-preview/voice-preview-panel";
import { VoicePreviewMobile } from "@/components/voice-preview/voice-preview-mobile";
import { VoicePreviewPlaceholder } from "@/components/voice-preview/voice-preview-placeholder";

export function LatestGeneration() {
  const trpc = useTRPC();
  const { data: generations } = useSuspenseQuery(
    trpc.generations.getAll.queryOptions(),
  );

  const latest = generations[0];

  if (!latest) {
    return <VoicePreviewPlaceholder />;
  }

  const audioUrl = `/api/audio/${latest.id}`;
  const voice = { id: latest.voiceId ?? undefined, name: latest.voiceName };

  return (
    <>
      <VoicePreviewPanel
        audioUrl={audioUrl}
        voice={voice}
        text={latest.text}
        autoplay={false}
      />
      <VoicePreviewMobile
        audioUrl={audioUrl}
        voice={voice}
        text={latest.text}
        autoplay={false}
      />
    </>
  );
}
