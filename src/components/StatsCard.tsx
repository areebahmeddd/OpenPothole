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
  const [showDots, setShowDots] = useState(true);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoaded(true);
      setTimeout(() => {
        setShowDots(false);
      }, 300);
    }, 2000 + animationDelay);

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
        const currentValue =
          startValue + (endValue - startValue) * easeOutCubic;

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 600);
    }
  }, [isLoaded, value]);

  return (
    <div
      className="group relative flex flex-col justify-between rounded-xl bg-card/50 backdrop-blur-sm border p-8 hover:border-[var(--primary)]/50 transition-all duration-500 overflow-hidden hover:shadow-lg animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
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
          className="text-5xl font-bold tracking-tight group-hover:scale-105 transition-transform duration-300 text-center relative"
          style={{ animationDuration: "4s" }}
        >
          <div
            className={`transition-all duration-700 ease-in-out ${showDots ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute"}`}
          >
            <div className="flex items-center justify-center gap-1">
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
          </div>
          <div
            className={`transition-all duration-700 ease-in-out ${!showDots ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
          >
            <span>
              {displayValue % 1 === 0
                ? displayValue.toLocaleString()
                : displayValue.toFixed(1).replace(/\.0$/, "")}
              {suffix}
            </span>
          </div>
        </h3>
      </div>
    </div>
  );
}
