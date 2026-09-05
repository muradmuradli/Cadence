"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { sliders, type Slider } from "@/lib/constants/sliders";
import {
  textToSpeechSchema,
  type TextToSpeechFormValues,
} from "@/lib/schemas/text-to-speech";

const defaultSliderValues = Object.fromEntries(
  sliders.map((s) => [s.id, s.defaultValue]),
) as Record<Slider["id"], number>;

type Tab = "settings" | "history";

interface TextToSpeechContextValue {
  form: UseFormReturn<TextToSpeechFormValues>;
  submit: () => void;
  isPending: boolean;
  rendered: boolean;
  playing: boolean;
  togglePlay: () => void;
  tab: Tab;
  setTab: (tab: Tab) => void;
}

const TextToSpeechContext = createContext<TextToSpeechContextValue | null>(
  null,
);

export function TextToSpeechProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("settings");
  const [rendered, setRendered] = useState(false);
  const [playing, setPlaying] = useState(false);

  const form = useForm<TextToSpeechFormValues>({
    resolver: zodResolver(textToSpeechSchema),
    defaultValues: {
      ...defaultSliderValues,
      text: searchParams.get("text") ?? "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (values: TextToSpeechFormValues) => {
      // TODO: replace with the real generation endpoint once it exists.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Generate text-to-speech:", values);
      return values;
    },
    onSuccess: () => {
      setRendered(true);
      setPlaying(true);
    },
  });

  const submit = form.handleSubmit((values) => {
    generateMutation.mutate(values);
  });

  return (
    <TextToSpeechContext.Provider
      value={{
        form,
        submit,
        isPending: generateMutation.isPending,
        rendered,
        playing,
        togglePlay: () => setPlaying((p) => !p),
        tab,
        setTab,
      }}
    >
      {children}
    </TextToSpeechContext.Provider>
  );
}

export function useTextToSpeech() {
  const ctx = useContext(TextToSpeechContext);
  if (!ctx) {
    throw new Error(
      "useTextToSpeech must be used within a TextToSpeechProvider",
    );
  }
  return ctx;
}
