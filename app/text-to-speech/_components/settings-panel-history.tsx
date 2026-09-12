"use client";

import { useState } from "react";
import { AudioLines, AudioWaveform, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

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
import { useTRPC } from "@/trpc/client";

export function SettingsPanelHistory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: generations } = useSuspenseQuery(
    trpc.generations.getAll.queryOptions(),
  );

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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

  if (!generations.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
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
        <p className="max-w-48 text-center text-sm text-muted-foreground">
          Generate some audio and it will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {generations.map((generation) => (
        <div
          key={generation.id}
          className="flex min-w-0 items-center gap-1 rounded-lg pr-1 transition-colors hover:bg-muted"
        >
          <Link
            href={`/text-to-speech/${generation.id}`}
            className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-medium text-foreground">
                {generation.text.length > 60
                  ? `${generation.text.slice(0, 60)}…`
                  : generation.text}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <VoiceAvatar
                  seed={generation.voiceId ?? generation.voiceName}
                  name={generation.voiceName}
                  className="shrink-0"
                />
                <span>{generation.voiceName}</span>
                <span>&middot;</span>
                <span>
                  {formatDistanceToNow(new Date(generation.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={(e) => {
              e.preventDefault();
              setPendingDeleteId(generation.id);
            }}
          >
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        </div>
      ))}

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
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
                if (!pendingDeleteId) return;
                deleteMutation.mutate(
                  { id: pendingDeleteId },
                  { onSuccess: () => setPendingDeleteId(null) },
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
