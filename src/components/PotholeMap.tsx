"use client";

import { useToast } from "@/hooks/useToast";
import { useEffect, useRef, useState } from "react";

type Report = {
  id: string;
  lat: number;
  lng: number;
  address?: string;
  description?: string;
  photoDataUrl?: string;
  status: "new" | "acknowledged" | "fixed" | "verified";
  severity?: number;
};

declare global {
  interface Window {
    L: any;
  }
}

async function ensureLeafletLoaded(): Promise<any> {
  if (typeof window === "undefined") return;
  if (window.L) return window.L;

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

  return window.L;
}

export default function PotholeMap({
  reports,
  requestLocation,
}: {
  reports: Report[];
  requestLocation?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const userLocationRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  const defaultCenter: [number, number] = [12.9716, 77.5946];
  const center: [number, number] =
    userLocation ||
    (reports?.[0] ? [reports[0].lat, reports[0].lng] : defaultCenter);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationError(null);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = await ensureLeafletLoaded();
      if (cancelled || !containerRef.current || !L) return;

      const css = getComputedStyle(document.documentElement);
      const pick = (name: string, fallback: string) =>
        css.getPropertyValue(name).trim() || fallback;
      const colorPrimary = pick("--primary", "#2563eb");
      const colorPrimaryFg = pick("--primary-foreground", "#ffffff");
      const colorAccent = pick("--accent", "#22c55e");
      const colorDestructive = pick("--destructive", "#ef4444");
      const colorBorder = pick("--border", "rgba(0,0,0,0.12)");
      const colorMutedFg = pick("--muted-foreground", "#6b7280");

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current).setView(center, 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          crossOrigin: true,
        }).addTo(mapRef.current);

        getUserLocation();
      } else {
        mapRef.current.setView(center, mapRef.current.getZoom() || 12);
      }

      if (layerRef.current) {
        layerRef.current.remove();
      }

      const layer = L.layerGroup();
      reports?.forEach((r: Report) => {
        const statusColor =
          r.status === "new"
            ? colorDestructive
            : r.status === "acknowledged"
              ? "#f59e0b"
              : r.status === "fixed"
                ? colorAccent
                : colorPrimary;

        const icon = L.divIcon({
          html: `<div style="width:18px;height:18px;border-radius:50%;background:${statusColor};border:2px solid rgba(0,0,0,.2);box-shadow:0 1px 2px rgba(0,0,0,.2)"></div>`,
          className: "",
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const statusLabel =
          r.status === "new"
            ? "New"
            : r.status === "acknowledged"
              ? "In Progress"
              : r.status === "fixed"
                ? "Fixed"
                : r.status === "verified"
                  ? "Verified"
                  : r.status;

        const popupHtml = `
          <style>
            .leaflet-popup-content-wrapper {
              background: transparent !important;
              padding: 0 !important;
              box-shadow: none !important;
            }
            .leaflet-popup-tip {
              display: none !important;
            }
            .leaflet-popup-close-button {
              color: ${colorMutedFg} !important;
              font-size: 20px !important;
              padding: 8px 12px !important;
              transition: color 0.15s ease !important;
            }
            .leaflet-popup-close-button:hover {
              color: ${colorDestructive} !important;
            }
          </style>
          <div style="width:280px;max-width:280px;">
            <div style="border-radius:16px;overflow:hidden;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border:1px solid ${colorBorder};box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);">
              <img alt="Reported pothole" src="${r.photoDataUrl || "/reported-pothole.jpg"}" style="display:block;width:100%;height:160px;object-fit:cover;" />
              <div style="padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                  <div style="font-size:14px;font-weight:600;">Severity: ${r.severity ?? 1}/5</div>
                  <div style="padding:6px 12px;border-radius:12px;background:${statusColor}10;color:${statusColor};font-size:12px;font-weight:600;border:1px solid ${statusColor}20;">${statusLabel}</div>
                </div>
                <div style="color:${colorMutedFg};font-size:13px;line-height:1.5;margin-bottom:14px;">${r.address || "Location not specified"}</div>
                <a href="/potholes/${r.id}" style="display:block;text-align:center;padding:10px 16px;border-radius:12px;background:${colorPrimary};color:${colorPrimaryFg};text-decoration:none;font-size:13px;font-weight:600;transition:opacity 0.15s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">View details</a>
              </div>
            </div>
          </div>
        `;

        L.marker([r.lat, r.lng], { icon }).addTo(layer).bindPopup(popupHtml, {
          className: "custom-popup",
          maxWidth: 300,
          closeButton: true,
        });
      });

      layer.addTo(mapRef.current);
      layerRef.current = layer;

      if (userLocation && mapRef.current) {
        if (userLocationRef.current) {
          mapRef.current.removeLayer(userLocationRef.current);
        }

        const userIcon = L.divIcon({
          html: `
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #3b82f6;
              border: 3px solid white;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
              animation: pulse 2s infinite;
            ">
            </div>
            <style>
              @keyframes pulse {
                0% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3); }
                50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1); }
                100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3); }
              }
            </style>
          `,
          className: "user-location-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userLocationRef.current = L.marker(userLocation, { icon: userIcon })
          .addTo(mapRef.current)
          .bindPopup(
            `
            <div style="text-align: center; padding: 8px;">
              <div style="font-weight: 600; color: #3b82f6; margin-bottom: 4px;">Your Location</div>
              <div style="font-size: 12px; color: #6b7280;">Current position</div>
            </div>
          `,
            {
              className: "user-location-popup",
              closeButton: false,
              autoClose: false,
              closeOnClick: false,
            },
          );
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [reports, center, userLocation]);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 14, { animate: true, duration: 1 });
    }
  }, [userLocation]);

  useEffect(() => {
    if (locationError) {
      toast({
        title: "Location Disabled",
        description: locationError,
        variant: "destructive",
      });
    }
  }, [locationError, toast]);

  useEffect(() => {
    if (requestLocation) {
      getUserLocation();
    }
  }, [requestLocation]);

  useEffect(() => {
    return () => {
      try {
        if (userLocationRef.current) {
          userLocationRef.current.remove();
          userLocationRef.current = null;
        }
        if (layerRef.current) {
          layerRef.current.remove();
          layerRef.current = null;
        }
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch {}
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-label="Bengaluru pothole map"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "80dvh",
        borderRadius: "12px",
      }}
    />
  );
}
