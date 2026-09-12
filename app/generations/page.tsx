import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { requireSession } from "@/lib/auth/require-session";
import { generationsSearchParamsCache } from "./_state/params";
import { GenerationsView } from "./generations-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Generations" };

export default async function GenerationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireSession();

  const { query } = await generationsSearchParamsCache.parse(searchParams);

  prefetch(trpc.generations.getAll.queryOptions({ query }));

  return (
    <HydrateClient>
      <GenerationsView />
    </HydrateClient>
  );
}
