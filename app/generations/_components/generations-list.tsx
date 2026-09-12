import { AudioLines, AudioWaveform, Clock } from "lucide-react";

import { GenerationCard } from "./generation-card";
import type { GenerationItem } from "./generation-card";

export function GenerationsList({
  generations,
}: {
  generations: GenerationItem[];
}) {
  if (!generations.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface/50 py-16 backdrop-blur">
        <div className="relative flex w-25 items-center justify-center">
          <div className="absolute left-0 -rotate-30 rounded-full bg-muted p-3">
            <AudioLines className="size-4 text-muted-foreground" />
          </div>

          <div className="relative z-10 rounded-full bg-foreground p-3">
            <AudioWaveform className="size-4 text-background" />
          </div>

          <div className="absolute right-0 rotate-30 rounded-full bg-muted p-3">
            <Clock className="size-4 text-muted-foreground" />
          </div>
        </div>
        <p className="font-display text-lg font-bold">No generations yet</p>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Generate some audio in the studio and it will show up here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {generations.map((generation) => (
        <div key={generation.id} className="py-6 first:pt-0 last:pb-0">
          <GenerationCard generation={generation} />
        </div>
      ))}
    </div>
  );
}
