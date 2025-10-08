"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AnimatedTextProps {
  className?: string;
  texts: string[];
}

export const MorphingText: React.FC<AnimatedTextProps> = ({
  texts,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 400); // Smooth transition timing
    }, 4000); // Change every 4 seconds for better readability

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div
      className={cn(
        "relative overflow-hidden min-h-[4rem] flex items-center justify-center",
        className,
      )}
    >
      <p
        className={cn(
          "text-2xl sm:text-3xl text-muted-foreground font-semibold transition-all duration-700 ease-in-out text-center leading-tight",
          isVisible
            ? "opacity-100 transform translate-y-0 scale-100"
            : "opacity-0 transform translate-y-1 scale-98",
        )}
      >
        {texts[currentIndex]}
      </p>
    </div>
  );
};
