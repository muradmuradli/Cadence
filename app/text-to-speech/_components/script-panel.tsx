"use client";

import { Sparkles } from "lucide-react";
import { useSelector } from "@tanstack/react-form";
import { WaveLine } from "@/components/waveform";
import { COST_PER_UNIT, TEXT_MAX_LENGTH } from "@/lib/constants/values";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { ttsFormOptions } from "../_state/text-to-speech-form";

export function ScriptPanel() {
  const form = useTypedAppFormContext(ttsFormOptions);
  const text = useSelector(form.store, (s) => s.values.text);
  const isSubmitting = useSelector(form.store, (s) => s.isSubmitting);
  const errors = useSelector(form.store, (s) => s.fieldMeta.text?.errors);

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Script
      </span>

      <div className="relative mt-3">
        <textarea
          value={text}
          onChange={(e) => form.setFieldValue("text", e.target.value)}
          rows={6}
          maxLength={TEXT_MAX_LENGTH}
          className="w-full resize-none bg-transparent font-display text-2xl leading-snug outline-none placeholder:text-muted-foreground/40"
          placeholder="Type or paste the line you want spoken…"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-surface to-transparent" />
      </div>

      <WaveLine className="mt-4 text-primary/40" />

      {errors && errors.length > 0 && (
        <p className="mt-3 text-xs text-magenta">{String(errors[0])}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-xs text-muted-foreground">
          est. ${(text.length * COST_PER_UNIT).toFixed(4)}
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground">
            {text.length}/{TEXT_MAX_LENGTH}
          </span>
          <button
            type="button"
            onClick={() => form.handleSubmit()}
            disabled={!text.trim() || isSubmitting}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-sonic px-7 py-3 font-display text-base font-extrabold text-background transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <Sparkles
              className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`}
            />
            {isSubmitting ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
