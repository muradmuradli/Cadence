"use client";

import { useSuspenseQueries } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Navbar } from "@/components/navbar";
import { ScriptPanel } from "./_components/script-panel";
import { SettingsPanel } from "./_components/settings-panel";
import {
  TextToSpeechForm,
  type TTSFormValues,
} from "./_state/text-to-speech-form";
import { TTSVoicesProvider } from "./_state/tts-voices-context";
import { VoicePreviewPanel } from "./_components/voice-preview-panel";
import { VoicePreviewMobile } from "./_components/voice-preview-mobile";

export function TextToSpeechDetailView({
  generationId,
}: {
  generationId: string;
}) {
  const trpc = useTRPC();
  const [generationQuery, voicesQuery] = useSuspenseQueries({
    queries: [
      trpc.generations.getById.queryOptions({ id: generationId }),
      trpc.voices.getAll.queryOptions(),
    ],
  });

  const data = generationQuery.data;
  const { custom: customVoices, system: systemVoices } = voicesQuery.data;
  const allVoices = [...customVoices, ...systemVoices];

  const fallbackVoiceId = allVoices[0]?.id ?? "";

  // Requested voice may no longer exist (deleted); fall back to first available
  const resolvedVoiceId =
    data.voiceId && allVoices.some((v) => v.id === data.voiceId)
      ? data.voiceId
      : fallbackVoiceId;

  const defaultValues: TTSFormValues = {
    text: data.text,
    voiceId: resolvedVoiceId,
    temperature: data.temperature,
    topP: data.topP,
    topK: data.topK,
    repetitionPenalty: data.repetitionPenalty,
  };

  // Use the denormalized voiceName snapshot instead of a populated voice relation
  // so the preview always shows the voice name at the time of generation,
  // even if the voice was later renamed or deleted.
  const generationVoice = {
    id: data.voiceId ?? undefined,
    name: data.voiceName,
  };

  return (
    <TTSVoicesProvider value={{ customVoices, systemVoices, allVoices }}>
      <div className="relative min-h-screen bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grain opacity-30"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/20 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-40 h-88 w-88 rounded-full bg-magenta/15 blur-[130px]"
        />

        <Navbar />

        <main className="relative mx-auto max-w-6xl px-6 py-12 md:px-8">
          <section>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
              text to speech
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
              Type it. <span className="text-sonic">Hear it.</span>
            </h1>
          </section>

          <TextToSpeechForm key={generationId} defaultValues={defaultValues}>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                <ScriptPanel />
                <VoicePreviewPanel
                  audioUrl={data.audioUrl}
                  voice={generationVoice}
                  text={data.text}
                />
                <VoicePreviewMobile
                  audioUrl={data.audioUrl}
                  voice={generationVoice}
                  text={data.text}
                />
              </div>
              <SettingsPanel />
            </div>
          </TextToSpeechForm>
        </main>
      </div>
    </TTSVoicesProvider>
  );
}
