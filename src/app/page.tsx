import { Footer } from "@/components/footer";
import { MorphingText } from "@/components/morphing-text";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/stats`, {
    cache: "no-store",
  }).catch(() => undefined);
  if (!res || !res.ok) return { total: 0, fixed: 0, rate: 0 };
  return res.json();
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[var(--primary)]">
                OpenPothole
              </h1>
              <MorphingText
                texts={[
                  "Community-Driven Civic Action",
                  "ಸಮುದಾಯ-ಚಾಲಿತ ನಾಗರಿಕ ಕ್ರಿಯೆ",
                  "समुदाय-संचालित नागरिक कार्य",
                ]}
                className="text-muted-foreground mt-4"
              />
              <p className="mt-6 text-lg text-muted-foreground">
                Fast, anonymous pothole tracking for Bangalore. Report issues,
                track fixes, and hold authorities accountable.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="font-bold px-8 bg-[var(--primary)] hover:bg-[var(--primary)]"
                >
                  <Link href="/report" className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Report Pothole
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="font-bold hover:bg-transparent"
                >
                  <Link href="/map" className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    View Map
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center relative">
              <div className="relative w-64 h-64 sm:w-96 sm:h-96">
                <div
                  className="absolute inset-0 bg-stone-100 dark:bg-stone-800/20 rounded-full animate-pulse"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div className="relative z-10 w-full h-full">
                  <div className="absolute inset-0 rounded-full bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]" />
                  <div className="absolute inset-3 rounded-full bg-[#1a1a1a]" />
                  <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#9c6a45] to-[#6a4a33] shadow-[0_20px_60px_rgba(0,0,0,0.6)]" />
                  <div className="absolute inset-14 rounded-full bg-[#d2b49c]/25" />
                  <div className="absolute inset-20 rounded-full bg-black/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Stats Indicator */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full smooth-pulse"></div>
              Real-time data
            </div>
          </div>

          {/* Stats Cards - Part of Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              label="Potholes Reported"
              value={stats.total || 0}
              animationDelay={0}
            />
            <StatsCard
              label="Potholes Fixed"
              value={stats.fixed || 0}
              animationDelay={200}
            />
            <StatsCard
              label="Resolution Rate"
              value={Math.round(stats.rate || 0)}
              suffix="%"
              animationDelay={400}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
