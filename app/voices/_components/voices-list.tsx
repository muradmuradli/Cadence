import { AudioLines, Mic, Volume2 } from "lucide-react";

import { VoiceCard } from "./voice-card";
import type { VoiceItem } from "./voice-card";

interface VoicesListProps {
  title: string;
  voices: VoiceItem[];
}

export function VoicesList({ title, voices }: VoicesListProps) {
  if (!voices.length) {
    return (
      <div className="space-y-4">
        <h3 className="font-display text-lg font-extrabold">{title}</h3>

        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface/50 py-12 backdrop-blur">
          <div className="relative flex h-14 w-32 items-center justify-center">
            <div className="absolute left-0 -rotate-30 rounded-full bg-muted p-4">
              <Volume2 className="size-5 text-muted-foreground" />
            </div>

            <div className="relative z-10 rounded-full bg-foreground p-4">
              <Mic className="size-5 text-background" />
            </div>

            <div className="absolute right-0 rotate-30 rounded-full bg-muted p-4">
              <AudioLines className="size-5 text-muted-foreground" />
            </div>
          </div>

          <p className="font-display text-lg font-bold">No voices found</p>

          <p className="max-w-md text-center text-sm text-muted-foreground">
            {title} will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-extrabold">{title}</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {voices.map((voice) => (
          <VoiceCard key={voice.id} voice={voice} />
        ))}
      </div>
    </div>
  );
}
