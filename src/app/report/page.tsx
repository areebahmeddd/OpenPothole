"use client";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/DotPattern";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  MapPin,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReportPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  const [photos, setPhotos] = useState<string[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [isAdditionalDetailsExpanded, setIsAdditionalDetailsExpanded] =
    useState(false);
  const [locationDetails, setLocationDetails] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isPinOnMapOpen, setIsPinOnMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const pinMapRef = useRef<any>(null);
  const pinMarkerRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const { data: stats } = useSWR("/api/reports/stats", fetcher);

  const copyToClipboard = async () => {
    if (!successId) return;

    try {
      await navigator.clipboard.writeText(successId);
      toast({
        title: "Copied!",
        description: "Tracking ID copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const fetchLocationDetails = async (lat: number, lng: number) => {
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
      );
      const data = await response.json();
      setLocationDetails(data);
    } finally {
      setLocationLoading(false);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=en&countrycodes=in&bounded=1&viewbox=77.3,12.7,77.9,13.2`,
      );
      const data = await response.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Could not search for locations",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCoords({ lat, lng });
    fetchLocationDetails(lat, lng);
    setSearchQuery(result.display_name);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const clearLocationSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setCoords(newCoords);
          fetchLocationDetails(newCoords.lat, newCoords.lng);
        },
        () => {
          setCoords(null);
          setLocationDetails(null);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
      );
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setCoords(newCoords);
          setLocLoading(false);
          fetchLocationDetails(newCoords.lat, newCoords.lng);
        },
        () => setLocLoading(false),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
      );
    } else {
      setLocLoading(false);
    }
  }, []);

  const ensureLeafletLoaded = async (): Promise<any> => {
    if (typeof window === "undefined") return;
    if ((window as any).L) return (window as any).L;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      const loaded = new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Leaflet"));
      });
      document.body.appendChild(script);
      await loaded;
    }

    return (window as any).L;
  };

  useEffect(() => {
    let cancelled = false;
    async function initPinMap() {
      if (!isPinOnMapOpen) return;
      const L = await ensureLeafletLoaded();
      if (cancelled || !mapContainerRef.current || !L) return;

      const lat = coords?.lat ?? 12.9716;
      const lng = coords?.lng ?? 77.5946;

      if (!pinMapRef.current) {
        pinMapRef.current = L.map(mapContainerRef.current).setView(
          [lat, lng],
          14,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          crossOrigin: true,
        }).addTo(pinMapRef.current);

        pinMapRef.current.on("click", (e: any) => {
          const { lat: clat, lng: clng } = e.latlng;
          setCoords({ lat: clat, lng: clng } as any);
          if (pinMarkerRef.current) {
            pinMarkerRef.current.setLatLng([clat, clng]);
          } else {
            pinMarkerRef.current = L.marker([clat, clng], {
              draggable: true,
            }).addTo(pinMapRef.current);
            pinMarkerRef.current.on("dragend", () => {
              const p = pinMarkerRef.current.getLatLng();
              setCoords({ lat: p.lat, lng: p.lng } as any);
            });
          }
        });
      } else {
        pinMapRef.current.setView(
          [lat, lng],
          pinMapRef.current.getZoom() || 14,
        );
      }

      if (coords) {
        if (pinMarkerRef.current) {
          pinMarkerRef.current.setLatLng([coords.lat, coords.lng]);
        } else {
          pinMarkerRef.current = L.marker([coords.lat, coords.lng], {
            draggable: true,
          }).addTo(pinMapRef.current);
          pinMarkerRef.current.on("dragend", () => {
            const p = pinMarkerRef.current.getLatLng();
            setCoords({ lat: p.lat, lng: p.lng } as any);
          });
        }
      }
    }

    initPinMap();
    return () => {
      cancelled = true;
    };
  }, [isPinOnMapOpen, coords]);

  useEffect(() => {
    if (coords) {
      fetchLocationDetails(coords.lat, coords.lng);
    }
  }, [coords]);

  const onFileChange = async (files?: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (imageFiles.length === 0) return;

    let processedCount = 0;
    const newPhotos: string[] = [];

    for (const file of imageFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        newPhotos.push(reader.result as string);
        processedCount++;

        if (processedCount === imageFiles.length) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }
      };
      reader.onerror = () => {
        processedCount++;
        if (processedCount === imageFiles.length) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const disabled = useMemo(
    () => photos.length === 0 || !coords,
    [photos, coords],
  );

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos,
          lat: coords?.lat,
          lng: coords?.lng,
          description,
          severity,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccessId(json.id);
        mutate("/api/reports");
        mutate("/api/reports/stats");
      } else {
        toast({
          title: "Submission Failed",
          description:
            "There was an error submitting your report. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-600 dark:text-green-500 mb-4 animate-fade-in-up">
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
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight animate-fade-in-up animate-delay-100">
                Report Submitted!
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-in-up animate-delay-200">
                Thank you for helping improve Bengaluru&apos;s roads.
              </p>
            </div>

            <div className="group relative flex flex-col justify-between rounded-xl bg-card/50 backdrop-blur-sm border p-8 hover:border-[var(--primary)]/50 transition-all duration-500 overflow-hidden animate-fade-in-up animate-delay-300">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/3"></div>
              <div
                className="absolute inset-0 rounded-xl border border-[var(--primary)]/20 animate-pulse"
                style={{ animationDuration: "3s" }}
              ></div>

              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10 transition-all duration-300 group/copy"
                title="Copy tracking ID"
              >
                <Copy className="h-4 w-4 text-muted-foreground group-hover/copy:text-[var(--primary)] transition-colors duration-300" />
              </button>

              <div className="relative z-10 text-center space-y-3">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-[var(--primary)] transition-colors duration-300">
                  Tracking ID
                </p>
                <h3 className="text-3xl font-bold tracking-tight font-mono group-hover:scale-105 transition-transform duration-300">
                  {successId}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Save this ID to track your report&apos;s status and updates.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-400">
              <Button
                asChild
                size="lg"
                className="bg-[var(--primary)] hover:bg-[var(--primary)] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Link href={`/potholes/${successId}`}>View Report</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="hover:bg-background hover:border-border transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Link href="/map">View Map</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="transition-all duration-300 hover:scale-105"
              >
                <Link href="/" className="inline-flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            {stats && (
              <div className="pt-4 text-center animate-fade-in-up animate-delay-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
                  <span>
                    You&apos;re one of {stats.total.toLocaleString()} citizens
                    making a difference!
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative min-h-screen">
        <DotPattern className="fill-muted-foreground/40 [mask-image:radial-gradient(1600px_circle_at_center,white,transparent)]" />

        <main className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="max-w-2xl mx-auto w-full space-y-12">
            <div className="text-center space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight animate-fade-in-up">
                Report a Pothole
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in-up animate-delay-100">
                Help improve Bengaluru&apos;s roads. Quick, anonymous, and
                impactful.
              </p>
            </div>

            <div className="group relative flex flex-col justify-between rounded-xl bg-card/50 backdrop-blur-sm border p-8 hover:border-[var(--primary)]/50 transition-all duration-500 overflow-hidden animate-fade-in-up animate-delay-200">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/3"></div>
              <div
                className="absolute inset-0 rounded-xl border border-[var(--primary)]/20 animate-pulse"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="photo" className="text-base font-semibold">
                      1. Photo Evidence
                    </Label>
                    {photos.length > 0 && (
                      <button
                        onClick={() => setPhotos([])}
                        className="text-xs text-muted-foreground hover:text-[var(--primary)] transition-colors duration-200 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {photos.length === 0 ? (
                    <div className="space-y-4">
                      <label
                        className={cn(
                          "relative flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed bg-muted/30 hover:bg-muted/50 hover:border-[var(--primary)]/50 transition-all group cursor-pointer",
                        )}
                      >
                        <input
                          className="sr-only"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          multiple
                          onChange={(e) => onFileChange(e.target.files)}
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
                              Upload or Capture Photos
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Clear images of the pothole
                            </p>
                          </div>
                        </div>
                      </label>
                      <div className="flex gap-2 justify-center">
                        <label className="cursor-pointer">
                          <input
                            className="sr-only"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            onChange={(e) => onFileChange(e.target.files)}
                          />
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-[var(--primary)] transition-colors duration-200">
                            <svg
                              className="w-4 h-4"
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
                            <span>Camera</span>
                          </div>
                        </label>
                        <span className="text-[var(--primary)]/60 flex items-center">
                          •
                        </span>
                        <label className="cursor-pointer">
                          <input
                            className="sr-only"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => onFileChange(e.target.files)}
                          />
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-[var(--primary)] transition-colors duration-200">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Gallery</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-sm font-medium text-[var(--primary)]">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {photos.length} photo{photos.length !== 1 ? "s" : ""}{" "}
                          added
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <div className="relative rounded-xl overflow-hidden border">
                              <img
                                alt={`Pothole photo ${index + 1}`}
                                src={photo}
                                className="aspect-video w-full object-contain"
                              />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 w-6 h-6 text-muted-foreground hover:text-[var(--primary)] flex items-center justify-center transition-colors duration-200"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {photos.length < 5 && (
                        <div className="flex justify-center">
                          <label className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors cursor-pointer group">
                            <div className="p-1 rounded-full bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </div>
                            Add more photos
                            <input
                              className="sr-only"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => onFileChange(e.target.files)}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    2. Location Details
                  </Label>

                  <div className="relative" ref={searchContainerRef}>
                    <div className="relative">
                      <div className="absolute top-2.5 left-3 flex items-center pointer-events-none">
                        <svg
                          className="h-4 w-4 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <textarea
                        placeholder="Search for a location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus-visible:border-ring focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none transition-colors resize-none min-h-[40px] max-h-32 overflow-y-auto"
                        rows={1}
                        style={
                          {
                            fieldSizing: "content",
                          } as React.CSSProperties
                        }
                      />
                      {isSearching ? (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Spinner className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ) : (
                        searchQuery && (
                          <button
                            onClick={clearLocationSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-lg group"
                            title="Clear search and use GPS location"
                          >
                            <X className="h-4 w-4 text-muted-foreground group-hover:text-[var(--primary)] transition-colors duration-200" />
                          </button>
                        )
                      )}
                    </div>

                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => selectSearchResult(result)}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                          >
                            <div className="text-sm font-medium text-foreground truncate">
                              {result.display_name}
                            </div>
                            {result.address && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {[
                                  result.address.road,
                                  result.address.suburb,
                                  result.address.city_district,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

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
                          {locLoading || locationLoading ? (
                            <p className="text-sm text-muted-foreground">
                              Detecting your location...
                            </p>
                          ) : coords && locationDetails ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {locationDetails.address?.road && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Street:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.road}
                                    </span>
                                  </div>
                                )}
                                {locationDetails.address?.house_number && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      House No:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.house_number}
                                    </span>
                                  </div>
                                )}
                                {locationDetails.address?.suburb && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Area:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.suburb}
                                    </span>
                                  </div>
                                )}
                                {locationDetails.address?.neighbourhood && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Neighborhood:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.neighbourhood}
                                    </span>
                                  </div>
                                )}
                                {locationDetails.address?.city_district && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Ward:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.city_district}
                                    </span>
                                  </div>
                                )}
                                {locationDetails.address?.postcode && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Pincode:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.postcode}
                                    </span>
                                  </div>
                                )}
                                {locationDetails.address?.city && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      City:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.city}
                                    </span>
                                  </div>
                                )}
                                {locationDetails.address?.state && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      State:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.state}
                                    </span>
                                  </div>
                                )}
                                {locationDetails.address?.country && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Country:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {locationDetails.address.country}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {(locationDetails.address?.amenity ||
                                locationDetails.address?.shop ||
                                locationDetails.address?.tourism ||
                                locationDetails.address?.leisure) && (
                                <div className="pt-2 border-t border-border/50">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Nearby:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {locationDetails.address?.amenity && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                                        {locationDetails.address.amenity}
                                      </span>
                                    )}
                                    {locationDetails.address?.shop && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                                        {locationDetails.address.shop}
                                      </span>
                                    )}
                                    {locationDetails.address?.tourism && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                                        {locationDetails.address.tourism}
                                      </span>
                                    )}
                                    {locationDetails.address?.leisure && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                                        {locationDetails.address.leisure}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                                <div className="flex justify-between">
                                  <span>
                                    Coordinates: {coords.lat.toFixed(5)},{" "}
                                    {coords.lng.toFixed(5)}
                                  </span>
                                  <span>
                                    Accuracy: ±
                                    {Math.round((coords as any).accuracy || 0)}m
                                  </span>
                                </div>
                              </div>
                            </div>
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
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground text-center">
                        Prefer exact placement? Pinpoint the pothole on the map.
                      </div>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => setIsPinOnMapOpen((v) => !v)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-[var(--primary)] transition-colors duration-200"
                          aria-expanded={isPinOnMapOpen}
                        >
                          <MapPin className="w-4 h-4" />
                          <span>
                            {isPinOnMapOpen ? "Hide map" : "Show map"}
                          </span>
                        </button>
                      </div>
                    </div>
                    {isPinOnMapOpen && (
                      <div className="overflow-hidden rounded-xl border">
                        <div
                          ref={mapContainerRef}
                          style={{ width: "100%", height: 320 }}
                          aria-label="Choose pothole location on map"
                        />
                        <div className="p-3 text-xs text-muted-foreground border-t bg-muted/20">
                          Click to place a marker, then drag it to adjust the
                          location.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border" />

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

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() =>
                      setIsAdditionalDetailsExpanded(
                        !isAdditionalDetailsExpanded,
                      )
                    }
                    className="group w-full flex items-center justify-between text-left rounded-lg p-2 -m-2"
                  >
                    <Label className="text-base font-semibold cursor-pointer">
                      4. Additional Details{" "}
                      <span className="text-muted-foreground font-normal text-sm">
                        (optional)
                      </span>
                    </Label>
                    <div className="flex items-center justify-center w-6 h-6">
                      {isAdditionalDetailsExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-[var(--primary)] transition-colors duration-200" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-[var(--primary)] transition-colors duration-200" />
                      )}
                    </div>
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isAdditionalDetailsExpanded
                        ? "max-h-96 opacity-100 mt-3"
                        : "max-h-0 opacity-0 mt-0",
                    )}
                  >
                    <Textarea
                      id="description"
                      placeholder="Any additional context that might help (size, depth, traffic impact, etc.)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-background border-border min-h-[100px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="lg"
                    disabled={disabled || submitting}
                    onClick={onSubmit}
                    className="w-full h-12 text-base font-bold bg-[var(--primary)] hover:bg-[var(--primary)] disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
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
          </div>
        </main>
      </div>

      <Footer />
      <Toaster />
    </div>
  );
}
