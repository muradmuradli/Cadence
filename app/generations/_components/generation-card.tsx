"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { VoicePreviewPanel } from "@/components/voice-preview/voice-preview-panel";
import { VoicePreviewMobile } from "@/components/voice-preview/voice-preview-mobile";
import { sliders } from "@/lib/constants/sliders";
import { useTRPC } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

export type GenerationItem =
  inferRouterOutputs<AppRouter>["generations"]["getAll"][number];

export function GenerationCard({ generation }: { generation: GenerationItem }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(
    trpc.generations.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Generation deleted");
        queryClient.invalidateQueries({
          queryKey: trpc.generations.getAll.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete generation");
      },
    }),
  );

  const paramValues: Record<string, number> = {
    temperature: generation.temperature,
    topP: generation.topP,
    topK: generation.topK,
    repetitionPenalty: generation.repetitionPenalty,
  };

  const voice = { id: generation.voiceId ?? undefined, name: generation.voiceName };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
          <VoiceAvatar
            seed={generation.voiceId ?? generation.voiceName}
            name={generation.voiceName}
            className="shrink-0"
          />
          <span className="font-medium text-foreground">
            {generation.voiceName}
          </span>
          <span>&middot;</span>
          <span title={new Date(generation.createdAt).toLocaleString()}>
            {formatDistanceToNow(new Date(generation.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/text-to-speech/${generation.id}`}>
              <Pencil className="size-4" />
              Open in studio
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <p className="text-base leading-relaxed text-foreground">
        {generation.text}
      </p>

      <div className="flex flex-wrap gap-2">
        {sliders.map((s) => (
          <span
            key={s.id}
            className="rounded-full border border-border bg-surface-2/50 px-3 py-1 font-mono text-xs text-muted-foreground"
          >
            {s.label}:{" "}
            <span className="text-foreground">{paramValues[s.id]}</span>
          </span>
        ))}
      </div>

      <VoicePreviewPanel
        audioUrl={generation.audioUrl}
        voice={voice}
        text={generation.text}
        autoplay={false}
      />
      <VoicePreviewMobile
        audioUrl={generation.audioUrl}
        voice={voice}
        text={generation.text}
        autoplay={false}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete generation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this generation and its audio.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive! text-white! hover:bg-destructive/90!"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate(
                  { id: generation.id },
                  { onSuccess: () => setShowDeleteDialog(false) },
                );
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
