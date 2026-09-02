import { AudioLines, ArrowRight } from "lucide-react";
import { Waveform } from "@/components/waveform";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-8 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grain opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/30 blur-[130px] animate-drift"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-88 w-88 rounded-full bg-magenta/25 blur-[130px]"
      />

      <div className="relative flex items-center gap-2">
        <AudioLines className="h-5 w-5 text-acid" />
        <span className="font-display text-lg font-extrabold">
          CAD<span className="text-sonic">ENCE</span>
        </span>
      </div>

      <h1 className="relative mt-10 max-w-2xl font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
        Type it.
        <br />
        <span className="text-sonic">Hear it breathe.</span>
      </h1>
      <p className="relative mt-6 max-w-lg text-base text-muted-foreground">
        Twenty-four studio voices, instant cloning from a ten second sample,
        and renders that sound like they were tracked in a booth.
      </p>

      <div className="relative mt-10 h-16 w-full max-w-md">
        <Waveform seed={9} bars={64} active tone="magenta" className="opacity-70" />
      </div>

      <Link
        href="/auth"
        className="group relative mt-10 inline-flex items-center gap-3 rounded-full bg-acid px-6 py-3.5 font-display text-base font-bold text-acid-foreground transition-transform hover:scale-[1.02]"
      >
        Get started
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
