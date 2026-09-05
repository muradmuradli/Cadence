"use client";

import { Sparkles } from "lucide-react";
import { useWatch } from "react-hook-form";
import { WaveLine } from "@/components/waveform";
import { COST_PER_UNIT, TEXT_MAX_LENGTH } from "@/lib/constants/values";
import { useTextToSpeech } from "./text-to-speech-context";

export function ScriptPanel() {
  const { form, isPending } = useTextToSpeech();
  const text = useWatch({ control: form.control, name: "text" });
  const error = form.formState.errors.text;

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Script
      </span>

      <div className="relative mt-3">
        <textarea
          {...form.register("text")}
          rows={12}
          maxLength={TEXT_MAX_LENGTH}
          className="w-full resize-none bg-transparent font-display text-2xl leading-snug outline-none placeholder:text-muted-foreground/40"
          placeholder="Type or paste the line you want spoken…"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-surface to-transparent" />
      </div>

      <WaveLine className="mt-4 text-primary/40" />

      {error && <p className="mt-3 text-xs text-magenta">{error.message}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs text-muted-foreground">
          est. ${(text.length * COST_PER_UNIT).toFixed(4)}
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground">
            {text.length}/{TEXT_MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-sonic px-7 py-3 font-display text-base font-extrabold text-background transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <Sparkles
              className={`h-4 w-4 ${isPending ? "animate-pulse" : ""}`}
            />
            {isPending ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
