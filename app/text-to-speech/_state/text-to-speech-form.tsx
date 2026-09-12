"use client";

import { createContext, useContext, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useAppForm } from "@/hooks/use-app-form";

// Signals that generation actually finished (vs. still in flight) so the
// progress bar can show a real 100% for a beat before the page navigates
// away, instead of freezing at its simulated cap and then vanishing.
const GenerationCompleteContext = createContext(false);

export function useIsGenerationComplete() {
  return useContext(GenerationCompleteContext);
}

const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text"),
  voiceId: z.string().min(1, "Please select a voice"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});

export function TextToSpeechForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const createMutation = useMutation(trpc.generations.create.mutationOptions());
  const [isComplete, setIsComplete] = useState(false);

  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValues,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const data = await createMutation.mutateAsync({
          text: value.text.trim(),
          voiceId: value.voiceId,
          temperature: value.temperature,
          topP: value.topP,
          topK: value.topK,
          repetitionPenalty: value.repetitionPenalty,
        });

        setIsComplete(true);
        toast.success("Audio generated successfully!");
        // Let the bar actually reach 100% on screen before the page
        // navigates away, instead of jumping straight from its simulated
        // cap to a fresh route.
        await new Promise((resolve) => setTimeout(resolve, 450));
        router.push(`/text-to-speech/${data.id}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";

        toast.error(message);
      }
    },
  });

  return (
    <GenerationCompleteContext.Provider value={isComplete}>
      <form.AppForm>{children}</form.AppForm>
    </GenerationCompleteContext.Provider>
  );
}
