"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReportPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const { data: stats } = useSWR("/api/reports/stats", fetcher);

  useEffect(() => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocLoading(false);
        },
        () => setLocLoading(false),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
      );
    } else {
      setLocLoading(false);
    }
  }, []);

  const onFileChange = async (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const disabled = useMemo(
    () => !photoDataUrl || !coords,
    [photoDataUrl, coords],
  );

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoDataUrl,
          lat: coords?.lat,
          lng: coords?.lng,
          address,
          description,
          severity,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccessId(json.id);
        mutate("/api/reports");
        mutate("/api/reports/stats");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh px-6 md:px-10 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Report a Pothole</h1>
          <p className="text-muted-foreground">
            Anonymous, fast, and mobile-friendly.
          </p>
        </header>

        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              {!photoDataUrl ? (
                <label
                  className={cn(
                    "flex items-center justify-center aspect-video rounded-md border bg-card cursor-pointer",
                  )}
                >
                  <input
                    id="photo"
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => onFileChange(e.target.files?.[0])}
                  />
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-3xl" aria-hidden>
                      📷
                    </span>
                    <span>Tap to take or upload a photo</span>
                  </div>
                </label>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Pothole preview"
                    src={photoDataUrl || "/placeholder.svg"}
                    className="aspect-video w-full rounded-md object-cover border"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="secondary"
                      onClick={() => setPhotoDataUrl(undefined)}
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="rounded-md border p-4 flex flex-col gap-2">
                <div className="text-sm">
                  {locLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="h-4 w-4" /> Getting your location...
                    </span>
                  ) : coords ? (
                    <span>
                      📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Couldn&apos;t get location automatically
                    </span>
                  )}
                </div>
                <Input
                  placeholder="Add nearby address or landmark (optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the pothole (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    aria-label={`Severity ${s}`}
                    className={cn(
                      "h-10 w-10 rounded-full border flex items-center justify-center",
                      s <= severity
                        ? "bg-primary text-primary-foreground"
                        : "bg-card",
                    )}
                    onClick={() => setSeverity(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                1 = Minor, 5 = Dangerous
              </p>
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                disabled={disabled || submitting}
                onClick={onSubmit}
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
              {successId && (
                <div className="mt-3 rounded-md border bg-card p-4 text-sm">
                  <p className="font-medium">Report submitted!</p>
                  <p className="text-muted-foreground">
                    Tracking ID: <span className="font-mono">{successId}</span>
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button asChild size="sm">
                      <a href={`/potholes/${successId}`}>View Details</a>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <a href="/map">Open Map</a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          {stats
            ? `${(stats.total || 0).toLocaleString()} reports submitted so far`
            : ""}
        </div>
      </div>
    </main>
  );
}
