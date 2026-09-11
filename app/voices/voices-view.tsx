"use client";

import { useQueryState } from "nuqs";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Navbar } from "@/components/navbar";
import { useTRPC } from "@/trpc/client";

import { VoicesList } from "./_components/voices-list";
import { VoicesToolbar } from "./_components/voices-toolbar";
import { voicesSearchParams } from "./_state/params";

export function VoicesView() {
  const trpc = useTRPC();
  const [query] = useQueryState("query", voicesSearchParams.query);
  const { data } = useSuspenseQuery(
    trpc.voices.getAll.queryOptions({ query }),
  );

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
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
            voices
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
            Every voice, <span className="text-sonic">on tap.</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Discover your voices, or make your own.
          </p>
        </section>

        <div className="mt-10 space-y-10">
          <VoicesToolbar />
          <VoicesList title="Team Voices" voices={data.custom} />
          <VoicesList title="Built-in Voices" voices={data.system} />
        </div>
      </main>
    </div>
  );
}
