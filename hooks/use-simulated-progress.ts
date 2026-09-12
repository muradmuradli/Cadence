"use client";

import { useEffect, useRef, useState } from "react";

// There's no real progress channel from the TTS backend (a single request/
// response, no streaming). This animates a believable progress percentage
// that asymptotically approaches `cap` the longer it runs, rather than
// hard-stopping once `estimatedMs` elapses - actual generation time varies
// far more than a text-length-based guess can predict, so a hard cutoff
// just freezes the bar dead when a generation runs long. `complete` snaps
// it to 100 once the caller knows the real result came back, instead of
// leaving it hanging at `cap`.
export function useSimulatedProgress(
  active: boolean,
  estimatedMs: number,
  { cap = 92, complete = false }: { cap?: number; complete?: boolean } = {},
) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startRef.current = null;
      return;
    }

    startRef.current = Date.now();
    let frame: number;

    const tick = () => {
      const start = startRef.current ?? Date.now();
      const elapsed = Date.now() - start;
      const eased = cap * (1 - Math.exp(-elapsed / estimatedMs));
      setProgress(eased);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, estimatedMs, cap]);

  if (complete) return 100;
  return active ? progress : 0;
}
