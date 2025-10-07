"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import useSWR from "swr";

const PotholeMap = dynamic(() => import("@/components/pothole-map"), {
  ssr: false,
});

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MapPage() {
  const { data, isLoading } = useSWR("/api/reports", fetcher);
  const [status, setStatus] = useState<string>("all");
  const [minSeverity, setMinSeverity] = useState<number>(1);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r: any) => {
      const okStatus = status === "all" ? true : r.status === status;
      const okSeverity = (r.severity || 1) >= minSeverity;
      return okStatus && okSeverity;
    });
  }, [data, status, minSeverity]);

  return (
    <main className="min-h-dvh grid grid-cols-1 lg:grid-cols-[320px_1fr]">
      <aside className="border-r bg-card/60 p-4 space-y-4">
        <h1 className="text-xl font-semibold">Pothole Map</h1>
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="fixed">Fixed (pending)</SelectItem>
                  <SelectItem value="verified">Verified ✅</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Min severity</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={minSeverity}
                onChange={(e) => setMinSeverity(Number(e.target.value || 1))}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Tap markers to view photo and details.
            </div>
          </CardContent>
        </Card>
      </aside>
      <section className="relative">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-[70dvh] w-full" />
          </div>
        ) : (
          <PotholeMap reports={filtered} />
        )}
      </section>
    </main>
  );
}
