"use client";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Link from "next/link";
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
  const [severity, setSeverity] = useState(1);
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

  if (successId) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          )}
        />
        <main className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-600 dark:text-green-500 mb-4">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Report Submitted!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for helping improve Bengaluru&apos;s roads.
              </p>
            </div>

            <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 text-left space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tracking ID</p>
                <p className="text-lg font-mono font-semibold">{successId}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Save this ID to track your report&apos;s status and updates.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[var(--primary)] hover:bg-[var(--primary-dark)]"
              >
                <Link href={`/potholes/${successId}`}>View Report</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/map">View Map</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/">Go Home</Link>
              </Button>
            </div>

            {stats && (
              <p className="text-sm text-muted-foreground pt-4">
                You&apos;re one of {stats.total.toLocaleString()} citizens
                making a difference
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />

      <main className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto w-full space-y-12">
          {/* Header - Centered */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Report a Pothole
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Help improve Bengaluru&apos;s roads. Quick, anonymous, and
              impactful.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-8 sm:p-10 space-y-8">
            {/* Photo Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="photo" className="text-base font-semibold">
                  1. Photo Evidence
                </Label>
                {photoDataUrl && (
                  <button
                    onClick={() => setPhotoDataUrl(undefined)}
                    className="text-xs text-muted-foreground hover:text-[var(--primary)] transition-colors duration-200 font-medium"
                  >
                    Change
                  </button>
                )}
              </div>
              {!photoDataUrl ? (
                <label
                  className={cn(
                    "relative flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed bg-muted/30 hover:bg-muted/50 hover:border-[var(--primary)]/50 transition-all group",
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
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <svg
                          className="w-8 h-8 text-[var(--primary)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Upload or Capture Photo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Clear image of the pothole
                      </p>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Pothole preview"
                    src={photoDataUrl}
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Location */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                2. Location Details
              </Label>
              <div className="space-y-3">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {locLoading ? (
                        <Spinner className="h-5 w-5 text-muted-foreground" />
                      ) : coords ? (
                        <svg
                          className="w-5 h-5 text-[var(--primary)]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-muted-foreground"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {locLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Detecting your location...
                        </p>
                      ) : coords ? (
                        <p className="text-sm font-medium">
                          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Location access required
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Input
                  placeholder="Nearby landmark or street name (optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-background border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Severity */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                3. Severity Assessment
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 py-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={`Severity ${s}`}
                      className={cn(
                        "h-14 w-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all duration-200",
                        s === severity
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg scale-110"
                          : "bg-background border-border hover:border-[var(--primary)]/50 hover:scale-105",
                      )}
                      onClick={() => setSeverity(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-2">
                  <span>Minor Issue</span>
                  <span>Critical Hazard</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Description */}
            <div className="space-y-4">
              <Label htmlFor="description" className="text-base font-semibold">
                4. Additional Details{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder="Any additional context that might help (size, depth, traffic impact, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background border-border min-h-[100px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                size="lg"
                disabled={disabled || submitting}
                onClick={onSubmit}
                className="w-full h-12 text-base font-bold bg-[var(--primary)] hover:bg-[var(--primary)] disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
