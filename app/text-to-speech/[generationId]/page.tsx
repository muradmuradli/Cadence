import { TextToSpeechDetailView } from "../text-to-speech-detail-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";
import { requireSession } from "@/lib/auth/require-session";

export const dynamic = "force-dynamic";

export default async function TextToSpeechDetailPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  await requireSession();

  const { generationId } = await params;

  prefetch(trpc.generations.getById.queryOptions({ id: generationId }));
  prefetch(trpc.voices.getAll.queryOptions());
  prefetch(trpc.generations.getAll.queryOptions()); // not consumed by this view yet

  return (
    <HydrateClient>
      <TextToSpeechDetailView generationId={generationId} />
    </HydrateClient>
  );
}
