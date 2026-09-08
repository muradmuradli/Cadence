import { z } from "zod";
import { sliders, type Slider } from "@/lib/constants/sliders";
import { TEXT_MAX_LENGTH } from "@/lib/constants/values";

function sliderBounds(id: Slider["id"]) {
  const slider = sliders.find((s) => s.id === id)!;
  return z.number().min(slider.min).max(slider.max);
}

export const textToSpeechSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Write something to generate speech")
    .max(TEXT_MAX_LENGTH, `Script must be under ${TEXT_MAX_LENGTH} characters`),
  temperature: sliderBounds("temperature"),
  topP: sliderBounds("topP"),
  topK: sliderBounds("topK"),
  repetitionPenalty: sliderBounds("repetitionPenalty"),
});

export type TextToSpeechFormValues = z.infer<typeof textToSpeechSchema>;
