"use client";

import { sliders } from "@/lib/constants/sliders";
import { SliderField } from "./slider-field";
import { VoiceSelector } from "./voice-selector";

export function SettingsPanelSettings() {
  return (
    <div className="space-y-7">
      <VoiceSelector />

      <div className="space-y-7">
        {sliders.map((s) => (
          <SliderField key={s.id} slider={s} />
        ))}
      </div>
    </div>
  );
}
