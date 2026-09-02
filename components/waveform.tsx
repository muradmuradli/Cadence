import { cn } from "@/lib/utils";

function pseudoBars(seed: number, count: number) {
  const out: number[] = [];
  let x = seed * 9301 + 49297;
  for (let i = 0; i < count; i++) {
    x = (x * 9301 + 49297) % 233280;
    const base = Math.abs(Math.sin(i / 3 + seed)) * 0.55;
    out.push(Math.min(1, 0.18 + base + (x / 233280) * 0.45));
  }
  return out;
}

export function Waveform({
  seed = 3,
  bars = 64,
  className,
  active = false,
  progress = 1,
  tone = "primary",
}: {
  seed?: number;
  bars?: number;
  className?: string;
  active?: boolean;
  progress?: number;
  tone?: "primary" | "magenta" | "acid";
}) {
  const values = pseudoBars(seed, bars);
  const toneClass =
    tone === "acid"
      ? "bg-acid"
      : tone === "magenta"
        ? "bg-magenta"
        : "bg-primary";

  return (
    <div className={cn("flex h-full w-full items-center gap-0.5", className)}>
      {values.map((v, i) => {
        const played = i / bars <= progress;
        return (
          <span
            key={i}
            className={cn(
              "flex-1 origin-center rounded-full transition-colors",
              played ? toneClass : "bg-border",
              active && played && "animate-bar",
            )}
            style={{
              height: `${(v * 100).toFixed(2)}%`,
              animationDelay: active ? `${(i % 11) * 70}ms` : undefined,
              animationDuration: active
                ? `${700 + (i % 5) * 120}ms`
                : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

export function WaveLine({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-6 w-full text-border", className)}
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 12 Q 25 0, 50 12 T 100 12 T 150 12 T 200 12 T 250 12 T 300 12 T 350 12 T 400 12 T 450 12 T 500 12 T 550 12 T 600 12 T 650 12 T 700 12 T 750 12 T 800 12 T 850 12 T 900 12 T 950 12 T 1000 12 T 1050 12 T 1100 12 T 1150 12 T 1200 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
