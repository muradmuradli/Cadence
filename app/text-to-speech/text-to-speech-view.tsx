"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ScriptPanel } from "./script-panel";
import { SettingsPanel } from "./settings-panel";
import {
  TextToSpeechProvider,
  useTextToSpeech,
} from "./text-to-speech-context";
import { VoicePreview } from "./voice-preview";

export function TextToSpeechView() {
  return (
    <TextToSpeechProvider>
      <TextToSpeechLayout />
    </TextToSpeechProvider>
  );
}

function TextToSpeechLayout() {
  const { submit } = useTextToSpeech();

  return (
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
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
              text to speech
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
              Type it. <span className="text-sonic">Hear it.</span>
            </h1>
          </div>
          <Link
            href="/documentation"
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-acid hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4 text-acid" />
            Don&apos;t know how?
          </Link>
        </section>

        <form
          onSubmit={submit}
          className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]"
        >
          <div className="space-y-6">
            <ScriptPanel />
            <VoicePreview />
          </div>

          <SettingsPanel />
        </form>
      </main>
    </div>
  );
}
