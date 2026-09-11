"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clapperboard,
  Gamepad2,
  Heart,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { WaveLine } from "@/components/waveform";
import { Navbar } from "@/components/navbar";
import { LatestGeneration } from "./_components/latest-generation";

const sample =
  "The city sounds different after midnight — fewer engines, more wind, and somewhere down the block, a radio nobody remembers turning on.";

const MAX_CHARS = 5000;

const quickActions = [
  {
    icon: BookOpen,
    title: "Narrate a Story",
    desc: "Bring characters to life with expressive AI narration that breathes between the lines.",
    tone: "primary" as const,
  },
  {
    icon: Megaphone,
    title: "Record an Ad",
    desc: "Produce punchy commercial spots in any voice, tone, or accent — ready for broadcast.",
    tone: "magenta" as const,
  },
  {
    icon: Clapperboard,
    title: "Direct a Movie Scene",
    desc: "Block dialogue across multiple voices with cinematic pacing and emotional cues.",
    tone: "acid" as const,
  },
  {
    icon: Gamepad2,
    title: "Voice a Game Character",
    desc: "Give NPCs and heroes a voice that fits the world — from gruff warlords to curious companions.",
    tone: "primary" as const,
  },
  {
    icon: Sparkles,
    title: "Introduce Your Podcast",
    desc: "Generate a memorable show intro that sets the mood in the first five seconds.",
    tone: "magenta" as const,
  },
  {
    icon: Heart,
    title: "Guide a Meditation",
    desc: "Calm, measured pacing for breathwork, body scans, and slow wind-downs.",
    tone: "acid" as const,
  },
];

export function DashboardView() {
  const router = useRouter();
  const [text, setText] = useState(sample);

  const handleGenerate = () => {
    if (!text.trim()) return;
    router.push(`/text-to-speech?text=${encodeURIComponent(text)}`);
  };

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
        <section className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
            new render
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
            Give the words <span className="text-sonic">a body.</span>
          </h1>
        </section>

        <div className="mt-10 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Script
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {text.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}{" "}
              chars · ~{Math.max(1, Math.round(text.length / 14))}s
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            maxLength={MAX_CHARS}
            className="w-full resize-none bg-transparent font-display text-2xl leading-snug outline-none placeholder:text-muted-foreground/40"
            placeholder="Type or paste the line you want spoken…"
          />
          <WaveLine className="mt-4 text-primary/40" />

          <button
            onClick={handleGenerate}
            disabled={!text.trim()}
            className="group mt-8 flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-sonic px-8 py-4 font-display text-lg font-extrabold text-background transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <Sparkles className="h-5 w-5" />
            Generate
          </button>
        </div>

        <section className="mt-14">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
            latest render
          </p>
          <div className="mt-4">
            <LatestGeneration />
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-extrabold">
              Quick actions
            </h2>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              start from a template
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.title}
                  className="group relative flex flex-col rounded-2xl border border-border bg-surface/50 p-6 transition-colors hover:border-acid/60 hover:bg-surface"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      a.tone === "acid"
                        ? "bg-acid text-acid-foreground"
                        : a.tone === "magenta"
                          ? "bg-magenta text-background"
                          : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-extrabold">
                    {a.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {a.desc}
                  </p>
                  <Link
                    href={`/text-to-speech?text=${encodeURIComponent(text)}`}
                    className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors group-hover:border-acid group-hover:bg-acid group-hover:text-acid-foreground"
                  >
                    Try now
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
