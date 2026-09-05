"use client";

import { useWatch } from "react-hook-form";
import type { Slider } from "@/lib/constants/sliders";
import { useTextToSpeech } from "./text-to-speech-context";

export function SliderField({ slider }: { slider: Slider }) {
  const { form } = useTextToSpeech();
  const value = useWatch({ control: form.control, name: slider.id });

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-sm font-extrabold">
          {slider.label}
        </span>
        <span className="font-mono text-xs text-acid">{value}</span>
      </div>
      <input
        type="range"
        className="sonic-range mt-3"
        min={slider.min}
        max={slider.max}
        step={slider.step}
        {...form.register(slider.id, { valueAsNumber: true })}
      />
      <div className="mt-2 flex justify-between font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        <span>{slider.leftLabel}</span>
        <span>{slider.rightLabel}</span>
      </div>
    </div>
  );
}
