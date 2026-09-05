import type { Metadata } from "next";
import { Suspense } from "react";
import { TextToSpeechView } from "./text-to-speech-view";

export const metadata: Metadata = {
  title: "Text to Speech",
  description:
    "Write a script, tune creativity, variety, expression and flow, then render lifelike speech instantly.",
};

export default function TextToSpeechPage() {
  return (
    <Suspense>
      <TextToSpeechView />
    </Suspense>
  );
}
