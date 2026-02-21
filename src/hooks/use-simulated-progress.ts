"use client";

import { useState, useEffect, useRef } from "react";

export function useSimulatedProgress(isActive: boolean) {
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setElapsedSeconds(0);
      startTimeRef.current = null;
      return;
    }

    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setElapsedSeconds(Math.floor(elapsed));
      // Asymptotic curve: fast at first, slows down toward 95%
      setProgress(95 * (1 - Math.exp(-elapsed / 12)));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return { progress, elapsedSeconds };
}
