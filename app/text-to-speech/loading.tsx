import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { sliders } from "@/lib/constants/sliders";

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grain opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-40 h-88 w-88 rounded-full bg-magenta/15 blur-[130px]"
      />

      <Navbar />

      <main className="relative mx-auto max-w-6xl px-6 py-12 md:px-8">
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
            text to speech
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
            Type it. <span className="text-sonic">Hear it.</span>
          </h1>
        </section>

        <div className="mt-10 flex items-center gap-2 md:hidden">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
        </div>

        <div className="mt-4 grid gap-6 md:mt-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-4 h-32 w-full rounded-lg" />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <Skeleton className="h-3 w-20" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-11 w-32 rounded-full" />
                </div>
              </div>
            </div>

            <div className="hidden min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur md:flex">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>

          <aside className="hidden h-fit rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur md:block">
            <div className="flex gap-1 rounded-full bg-surface-2 p-1">
              <Skeleton className="h-9 flex-1 rounded-full" />
              <Skeleton className="h-9 flex-1 rounded-full" />
            </div>

            <div className="mt-7 space-y-7">
              <div>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-11 w-full rounded-lg" />
              </div>

              <div className="space-y-7">
                {sliders.map((slider) => (
                  <div key={slider.id} className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
