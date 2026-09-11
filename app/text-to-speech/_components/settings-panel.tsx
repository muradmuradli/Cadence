"use client";

import { useState } from "react";
import { SettingsPanelHistory } from "./settings-panel-history";
import { SettingsPanelSettings } from "./settings-panel-settings";

type Tab = "settings" | "history";

export function SettingsPanel() {
  const [tab, setTab] = useState<Tab>("settings");

  return (
    <aside className="hidden h-fit rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur md:block">
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

      <div className="mt-7">
        {tab === "settings" ? <SettingsPanelSettings /> : <SettingsPanelHistory />}
      </div>
    </aside>
  );
}
