import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { HealthCheck } from "./health-check";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function Test() {
  prefetch(trpc.health.queryOptions());
  return (
    <HydrateClient>
      <ErrorBoundary fallback="<div>Error</div>">
        <Suspense fallback="<div>Loading</div>">
          <HealthCheck />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
