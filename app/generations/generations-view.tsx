"use client";

import { useQueryState } from "nuqs";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Navbar } from "@/components/navbar";
import { useTRPC } from "@/trpc/client";

import { GenerationsList } from "./_components/generations-list";
import { GenerationsToolbar } from "./_components/generations-toolbar";
import { generationsSearchParams } from "./_state/params";

export function GenerationsView() {
  const trpc = useTRPC();
  const [query] = useQueryState("query", generationsSearchParams.query);
  const { data: generations } = useSuspenseQuery(
    trpc.generations.getAll.queryOptions({ query }),
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
            generations
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
            Every render, <span className="text-sonic">on record.</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Browse, replay, and manage everything you&apos;ve generated.
          </p>
        </section>

        <div className="mt-10 space-y-8">
          <GenerationsToolbar />
          <GenerationsList generations={generations} />
        </div>
      </main>
    </div>
  );
}
