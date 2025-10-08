"use client";

import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/DotPattern";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Navigation } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useRef, useState } from "react";
import useSWR from "swr";

const PotholeMap = dynamic(() => import("@/components/PotholeMap"), {
  ssr: false,
});

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MapPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { data, isLoading } = useSWR(
    apiUrl ? `${apiUrl}/reports` : null,
    fetcher,
  );
  const [status, setStatus] = useState<string>("all");
  const [minSeverity, setMinSeverity] = useState<number>(1);
  const [locationRequested, setLocationRequested] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const [position, setPosition] = useState({ x: 32, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartTime = useRef<number>(0);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r: any) => {
      const okStatus = status === "all" ? true : r.status === status;
      const okSeverity = (r.severity || 1) >= minSeverity;
      return okStatus && okSeverity;
    });
  }, [data, status, minSeverity]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (dragRef.current) {
      dragStartTime.current = Date.now();
      const rect = dragRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const timeSinceStart = Date.now() - dragStartTime.current;
      if (timeSinceStart < 50) return;

      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const maxX = window.innerWidth - 384;
      const maxY = window.innerHeight - 64;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging, dragOffset],
  );

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp, { passive: false });
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <main className="h-[calc(100vh-4rem)] relative bg-background overflow-hidden">
      <DotPattern className="fill-muted-foreground/40 [mask-image:radial-gradient(1600px_circle_at_center,white,transparent)]" />

      <section className="absolute inset-0 z-0 rounded-t-3xl overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-full w-full" />
              <p className="text-sm text-muted-foreground">
                Loading map data...
              </p>
            </div>
          </div>
        ) : (
          <PotholeMap reports={filtered} requestLocation={locationRequested} />
        )}
      </section>

      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
        <Button
          variant="outline"
          size="sm"
          className="bg-background/95 backdrop-blur-md border-border/50 shadow-lg hover:bg-background/95"
          onClick={() => {
            setLocationRequested(true);
            setTimeout(() => setLocationRequested(false), 100);
          }}
        >
          <Navigation className="h-4 w-4 mr-2" />
          My Location
        </Button>
      </div>

      <div className="relative z-10 pointer-events-none h-full">
        <div
          className="hidden lg:flex absolute pointer-events-auto"
          style={{
            left: position.x,
            top: position.y === 0 ? "50%" : position.y,
            transform: position.y === 0 ? "translateY(-50%)" : "none",
          }}
        >
          <div className="max-w-sm" ref={dragRef}>
            <div
              className={cn(
                "group relative flex flex-col justify-between rounded-2xl bg-background/80 backdrop-blur-md border border-border/60 shadow-xl hover:border-[var(--primary)]/50 transition-all duration-300 overflow-hidden",
                isDragging ? "select-none" : "",
                isMinimized ? "p-4 space-y-3" : "p-6 space-y-5",
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center justify-center w-full h-3 cursor-move rounded-md transition-colors duration-150 select-none"
                  onMouseDown={handleMouseDown}
                  style={{ touchAction: "none" }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                    <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                    <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                    <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                    <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div
                className={cn("space-y-2", isCollapsed ? "" : "pb-4 border-b")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">
                      OpenPothole Map
                    </h1>
                    <span className="inline-flex items-center rounded-full bg-background/60 border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {filtered.length}{" "}
                      {filtered.length === 1 ? "report" : "reports"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="group flex items-center justify-center w-7 h-7"
                    aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
                    title={isCollapsed ? "Expand" : "Collapse"}
                  >
                    {isCollapsed ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-[var(--primary)] transition-colors duration-200" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-[var(--primary)] transition-colors duration-200" />
                    )}
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <div
                  className={cn(
                    "overflow-hidden transition-[max-height] duration-200 ease-in-out",
                    isCollapsed ? "max-h-0" : "max-h-96",
                  )}
                >
                  <div className="space-y-5">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold">
                        Status Filter
                      </Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full h-10 bg-background/50 border-border">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="acknowledged">
                            In Progress
                          </SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">
                        Severity Level
                      </Label>
                      <div className="flex items-center justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            aria-label={`Severity ${s}`}
                            className={cn(
                              "h-11 w-11 rounded-xl border-2 flex items-center justify-center font-bold text-base transition-all duration-200",
                              s === minSeverity
                                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md scale-105"
                                : "bg-background/50 border-border hover:border-[var(--primary)]/50 hover:scale-105",
                            )}
                            onClick={() => setMinSeverity(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Minor</span>
                        <span>Critical</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isMinimized && !isCollapsed && (
                <div className="flex items-start gap-2 text-muted-foreground pt-4 border-t">
                  <svg
                    className="w-4 h-4 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-[11px] leading-relaxed">
                    Click on the markers to view the report details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:hidden absolute bottom-0 left-0 right-0 pointer-events-auto max-h-[60vh] overflow-y-auto">
          <div
            className={cn(
              "group relative flex flex-col justify-between rounded-t-3xl border-t border-l border-r bg-background/85 backdrop-blur-md shadow-xl hover:border-[var(--primary)]/50 transition-all duration-300 overflow-hidden",
              isMinimized ? "p-4 space-y-3 pb-4" : "p-5 space-y-5 pb-6",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight">
                  OpenPothole Map
                </h1>
                <span className="inline-flex items-center rounded-full bg-background/60 border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "report" : "reports"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="group flex items-center justify-center w-7 h-7"
                aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-[var(--primary)] transition-colors duration-200" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-[var(--primary)] transition-colors duration-200" />
                )}
              </button>
            </div>

            {!isMinimized && (
              <div
                className={cn(
                  "overflow-hidden transition-[max-height] duration-200 ease-in-out",
                  isCollapsed ? "max-h-0" : "max-h-96",
                )}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full h-10 bg-background/50 border-border text-sm">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="acknowledged">
                          In Progress
                        </SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Severity Level
                    </Label>
                    <div className="flex items-center justify-between gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-label={`Severity ${s}`}
                          className={cn(
                            "h-10 w-10 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all duration-200",
                            s === minSeverity
                              ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                              : "bg-background/50 border-border active:scale-95",
                          )}
                          onClick={() => setMinSeverity(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                      <span>Minor</span>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isMinimized && !isCollapsed && (
              <div className="flex items-start gap-2 text-muted-foreground pt-2">
                <svg
                  className="w-3.5 h-3.5 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[10px] leading-relaxed">
                  Click on the markers to view the report details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
