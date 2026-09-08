"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Navbar } from "@/components/navbar";
import { ScriptPanel } from "./_components/script-panel";
import { VoicePreviewPlaceholder } from "./_components/voice-preview-placeholder";
import { SettingsPanel } from "./_components/settings-panel";
import {
  TextToSpeechForm,
  defaultTTSValues,
  type TTSFormValues,
} from "./text-to-speech-form";
import { TTSVoicesProvider } from "./tts-voices-context";

export function TextToSpeechView({
  initialValues,
}: {
  initialValues?: Partial<TTSFormValues>;
}) {
  const trpc = useTRPC();
  const { data: voices } = useSuspenseQuery(trpc.voices.getAll.queryOptions());

  const { custom: customVoices, system: systemVoices } = voices;

  const allVoices = [...customVoices, ...systemVoices];
  const fallbackVoiceId = allVoices[0]?.id ?? "";

  // Requested voice may no longer exist (deleted); fall back to first available
  const resolvedVoiceId =
    initialValues?.voiceId &&
    allVoices.some((v) => v.id === initialValues.voiceId)
      ? initialValues.voiceId
      : fallbackVoiceId;

  const defaultValues: TTSFormValues = {
    ...defaultTTSValues,
    ...initialValues,
    voiceId: resolvedVoiceId,
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

          <TextToSpeechForm defaultValues={defaultValues}>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                <ScriptPanel />
                <VoicePreviewPlaceholder />
              </div>
              <SettingsPanel />
            </div>
          </TextToSpeechForm>
        </main>
      </div>
    </TTSVoicesProvider>
  );
}
