"use client";

import { useEffect, useState } from "react";

interface StatsCardProps {
  label: string;
  value: number;
  suffix?: string;
  animationDelay?: number;
}

export function StatsCard({
  label,
  value,
  suffix = "",
  animationDelay = 0,
}: StatsCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 800 + animationDelay);

    return () => clearTimeout(loadingTimer);
  }, [animationDelay]);

  useEffect(() => {
    if (isLoaded) {
      const baseDuration = 2000;
      const duration = Math.min(baseDuration + value * 50, 4000);

      const startTime = Date.now();
      const startValue = 0;
      const endValue = value;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(
          startValue + (endValue - startValue) * easeOutCubic,
        );

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 100);
    }
  }, [isLoaded, value]);

  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-card/50 backdrop-blur-sm border p-8 hover:border-[var(--primary)]/50 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/3"></div>
      <div
        className="absolute inset-0 rounded-xl border border-[var(--primary)]/20 animate-pulse"
        style={{ animationDuration: "3s" }}
      ></div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground mb-3 group-hover:text-[var(--primary)] transition-colors duration-300">
          {label}
        </p>
        <h3
          className="text-5xl font-bold tracking-tight group-hover:scale-105 transition-transform duration-300 text-center"
          style={{ animationDuration: "4s" }}
        >
          {!isLoaded ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          ) : (
            <span>
              {displayValue.toLocaleString()}
              {suffix}
            </span>
          )}
        </h3>
      </div>
    </div>
  );
}
