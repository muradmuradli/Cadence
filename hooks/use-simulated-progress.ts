"use client";

import { useEffect, useRef, useState } from "react";

// There's no real progress channel from the TTS backend (a single request/
// response, no streaming). This animates a believable progress percentage
// toward `cap` over `estimatedMs`, easing out so it never quite finishes on
// its own - the caller flips `active` off once the real result comes back,
// which is what actually completes the bar.
export function useSimulatedProgress(
  active: boolean,
  estimatedMs: number,
  cap = 92,
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
      const t = Math.min(1, (Date.now() - start) / estimatedMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * cap);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, estimatedMs, cap]);

  return active ? progress : 0;
}
