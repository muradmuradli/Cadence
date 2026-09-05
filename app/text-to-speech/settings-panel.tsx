"use client";

import { sliders } from "@/lib/constants/sliders";
import { SliderField } from "./slider-field";
import { useTextToSpeech } from "./text-to-speech-context";

export function SettingsPanel() {
  const { tab, setTab } = useTextToSpeech();

  return (
    <aside className="h-fit rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur">
      <div className="flex gap-1 rounded-full bg-surface-2 p-1">
        {(["settings", "history"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "bg-sonic text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "settings" ? (
        <div className="mt-7 space-y-7">
          {sliders.map((s) => (
            <SliderField key={s.id} slider={s} />
          ))}
        </div>
      ) : (
        <div className="mt-7 flex flex-col items-center gap-2 py-12 text-center">
          <p className="font-display text-lg font-bold">Nothing here yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Your recent text-to-speech renders will be listed here.
          </p>
        </div>
      )}
    </aside>
  );
}
