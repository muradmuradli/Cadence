import { useMemo } from "react";
import { Avatar, Style } from "@dicebear/core";
import glassStyleDefinition from "@dicebear/styles/glass.json";

const glassStyle = new Style(glassStyleDefinition);

export function useVoiceAvatar(seed: string) {
  return useMemo(() => {
    return new Avatar(glassStyle, {
      seed,
      size: 128,
    }).toDataUri();
  }, [seed]);
}
