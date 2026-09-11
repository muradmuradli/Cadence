"use client";

import { ChevronDown } from "lucide-react";
import { useSelector } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { DrawerTrigger } from "@/components/ui/drawer";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { useTTSVoices } from "../_state/tts-voices-context";
import { ttsFormOptions } from "../_state/text-to-speech-form";

export function VoiceSelectorButton() {
  const { allVoices } = useTTSVoices();

  const form = useTypedAppFormContext(ttsFormOptions);
  const voiceId = useSelector(form.store, (s) => s.values.voiceId);

  const currentVoice = allVoices.find((v) => v.id === voiceId) ?? allVoices[0];

  const buttonLabel = currentVoice?.name ?? "Select voice";

  return (
    <DrawerTrigger asChild>
      <Button
        variant="outline"
        size="lg"
        className="h-12 flex-1 justify-start gap-2 px-3"
      >
        {currentVoice && (
          <VoiceAvatar seed={currentVoice.id} name={currentVoice.name} />
        )}
        <span className="flex-1 truncate text-left text-sm font-medium">
          {buttonLabel}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </Button>
    </DrawerTrigger>
  );
}
