"use client";

import { AudioLines, Download, Pause, Play } from "lucide-react";
import { useWatch } from "react-hook-form";
import { Waveform } from "@/components/waveform";
import { useTextToSpeech } from "./text-to-speech-context";

export function VoicePreview() {
  const { form, rendered, playing, togglePlay } = useTextToSpeech();
  const text = useWatch({ control: form.control, name: "text" });

  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
        voice preview
      </p>
      {rendered ? (
        <div className="mt-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sonic text-background transition-transform hover:scale-105"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="ml-1 h-5 w-5" />
              )}
            </button>
            <div className="h-20 min-w-0 flex-1">
              <Waveform
                seed={9}
                bars={36}
                active={playing}
                progress={playing ? 1 : 0.5}
                tone="magenta"
                className="sm:hidden"
              />
              <Waveform
                seed={9}
                bars={90}
                active={playing}
                progress={playing ? 1 : 0.5}
                tone="magenta"
                className="hidden sm:flex"
              />
            </div>
            <button
              type="button"
              className="hidden shrink-0 cursor-pointer items-center gap-2 rounded-full bg-acid px-5 py-2 text-sm font-bold text-acid-foreground sm:flex"
            >
              <Download className="h-4 w-4" /> WAV
            </button>
          </div>

          <button
            type="button"
            className="mt-4 flex cursor-pointer items-center gap-2 rounded-full bg-acid px-5 py-2 text-sm font-bold text-acid-foreground sm:hidden"
          >
            <Download className="h-4 w-4" /> WAV
          </button>

          <p className="mt-3 truncate font-mono text-xs text-muted-foreground">
            &ldquo;{text.slice(0, 90) || "Untitled render"}&rdquo;
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 py-12 text-center">
          <AudioLines className="h-8 w-8 text-muted-foreground/60" />
          <p className="font-display text-lg font-bold">No render yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Write a script and hit Generate — your latest render will appear
            right here.
          </p>
        </div>
      )}
    </div>
  );
}
