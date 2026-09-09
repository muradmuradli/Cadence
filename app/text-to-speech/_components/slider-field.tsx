"use client";

import { useSelector } from "@tanstack/react-form";
import type { Slider } from "@/lib/constants/sliders";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { ttsFormOptions } from "../_state/text-to-speech-form";

export function SliderField({ slider }: { slider: Slider }) {
  const form = useTypedAppFormContext(ttsFormOptions);
  const value = useSelector(form.store, (s) => s.values[slider.id]);

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
        value={value}
        onChange={(e) =>
          form.setFieldValue(slider.id, e.target.valueAsNumber)
        }
      />
      <div className="mt-2 flex justify-between font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        <span>{slider.leftLabel}</span>
        <span>{slider.rightLabel}</span>
      </div>
    </div>
  );
}
