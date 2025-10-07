"use client";

import { useEffect, useRef } from "react";

// Types used by the component
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

// Provide a global type for window.L to keep TS happy.
declare global {
  interface Window {
    L: any;
  }
}

// Load Leaflet CSS/JS from CDN once on the client.
async function ensureLeafletLoaded(): Promise<any> {
  if (typeof window === "undefined") return;
  if (window.L) return window.L;

  // Inject CSS if not present
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }

  // Inject JS if not present
  if (!document.getElementById("leaflet-js")) {
    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    // Resolve after load
    const loaded = new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Leaflet"));
    });
    document.body.appendChild(script);
    await loaded;
  }

  return window.L;
}

export default function PotholeMap({ reports }: { reports: Report[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const center: [number, number] = reports?.[0]
    ? [reports[0].lat, reports[0].lng]
    : [12.9716, 77.5946]; // Bengaluru

  // Initialize map and keep it alive; update markers when `reports` change.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = await ensureLeafletLoaded();
      if (cancelled || !containerRef.current || !L) return;

      // Resolve CSS vars to actual color values to avoid var(...) in inline styles
      const css = getComputedStyle(document.documentElement);
      const pick = (name: string, fallback: string) =>
        css.getPropertyValue(name).trim() || fallback;
      const colorPrimary = pick("--primary", "#2563eb");
      const colorPrimaryFg = pick("--primary-foreground", "#ffffff");
      const colorAccent = pick("--accent", "#22c55e");
      const colorDestructive = pick("--destructive", "#ef4444");
      const colorBorder = pick("--border", "rgba(0,0,0,0.12)");
      const colorMutedFg = pick("--muted-foreground", "#6b7280");

      // Initialize map once
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current).setView(center, 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          crossOrigin: true,
        }).addTo(mapRef.current);
      } else {
        mapRef.current.setView(center, mapRef.current.getZoom() || 12);
      }

      // Clear old layer if any
      if (layerRef.current) {
        layerRef.current.remove();
      }

      const layer = L.layerGroup();
      reports?.forEach((r: Report) => {
        // Map status → resolved color
        const statusColor =
          r.status === "new"
            ? colorDestructive
            : r.status === "acknowledged"
              ? "oklch(0.83 0.17 90)" // keep simple literal, widely supported now
              : r.status === "fixed"
                ? colorAccent
                : colorPrimary;

        const icon = L.divIcon({
          html: `<div style="width:18px;height:18px;border-radius:50%;background:${statusColor};border:2px solid rgba(0,0,0,.2);box-shadow:0 1px 2px rgba(0,0,0,.2)"></div>`,
          className: "",
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const popupHtml = `
          <div style="width:256px;max-width:256px">
            <div style="border-radius:8px;overflow:hidden;border:1px solid ${colorBorder}">
              <img alt="Reported pothole" src="${r.photoDataUrl || "/reported-pothole.jpg"}" style="display:block;width:100%;height:140px;object-fit:cover" />
              <div style="padding:8px;font-size:12px;line-height:1.4;">
                <div style="font-weight:600;">Severity: ${r.severity ?? 1}/5</div>
                <div style="color:${colorMutedFg}">${r.address || "No address provided"}</div>
                <div style="color:${colorMutedFg};font-size:11px">Status: ${r.status}</div>
                <a href="/potholes/${r.id}" style="display:inline-flex;margin-top:8px;padding:6px 10px;border-radius:6px;background:${colorPrimary};color:${colorPrimaryFg};text-decoration:none;">View details</a>
              </div>
            </div>
          </div>
        `;

        L.marker([r.lat, r.lng], { icon }).addTo(layer).bindPopup(popupHtml);
      });

      layer.addTo(mapRef.current);
      layerRef.current = layer;
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [reports, center]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (layerRef.current) {
          layerRef.current.remove();
          layerRef.current = null;
        }
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch {
        // ignore
      }
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
