"use client";

import { Info } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="w-full border-b border-border/20 bg-accent/60 backdrop-blur supports-[backdrop-filter]:bg-accent/50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start sm:justify-center gap-2 py-2 text-xs sm:text-sm text-muted-foreground">
          <Info
            className="h-4 w-4 shrink-0 text-[var(--primary)]"
            aria-hidden
          />
          <p className="text-left sm:text-center leading-snug">
            We are not affiliated with BBMP or any government. This community
            project aims to connect citizens with city teams to get potholes
            fixed faster.
          </p>
        </div>
      </div>
    </div>
  );
}
