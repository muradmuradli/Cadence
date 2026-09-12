import type { Metadata } from "next";
import { DashboardView } from "./dashboard-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";
import { requireSession } from "@/lib/auth/require-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Cadence",
  description:
    "Turn any script into lifelike speech: type a line, generate, then play and download the render.",
};

export default async function DashboardPage() {
  await requireSession();

  prefetch(trpc.generations.getAll.queryOptions());

  return (
    <HydrateClient>
      <DashboardView />
    </HydrateClient>
  );
}
