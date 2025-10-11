"use client";

import { Footer } from "@/components/footer";
import { MorphingText } from "@/components/MorphingText";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/DotPattern";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CheckCircle, Eye, MapPin, Plus, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, fixed: 0, rate: 0 });
  const [whatIsRef, whatIsVisible] = useScrollAnimation();
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reports/stats`,
          {
            cache: "no-store",
          },
        );
        if (res && res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative">
        <DotPattern className="fill-muted-foreground/40 [mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]" />

        <section className="relative py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#8b5e3c] via-[#734a2e] to-[#8b5e3c] bg-clip-text text-transparent animate-fade-in-up">
                  OpenPothole
                </h1>
                <p className="text-sm text-muted-foreground/70 mt-2 font-medium animate-fade-in-up animate-delay-100">
                  by Open India Initiative
                </p>
                <div className="animate-fade-in-up animate-delay-200">
                  <MorphingText
                    texts={[
                      "ಸಮುದಾಯ-ಚಾಲಿತ ನಾಗರಿಕ ಕ್ರಿಯೆ",
                      "समुदाय-संचालित नागरिक कार्य",
                      "Community-Driven Civic Action",
                    ]}
                    className="text-muted-foreground mt-4"
                  />
                </div>
                <p className="mt-6 text-lg text-muted-foreground animate-fade-in-up animate-delay-300">
                  Fast, <span className="font-bold">anonymous</span> pothole
                  tracking for Bangalore. Report issues, track fixes, and verify
                  repairs as a community.{" "}
                </p>
                <div className="mt-8 flex flex-wrap gap-4 animate-fade-in-up animate-delay-400">
                  <Button
                    asChild
                    size="lg"
                    className="font-bold px-8 bg-[var(--primary)] hover:bg-[var(--primary)] transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
                    className="font-bold hover:bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Link href="/map" className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      View Map
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center relative animate-fade-in-up animate-delay-500">
                <div className="relative w-64 h-64 sm:w-96 sm:h-96 animate-float">
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

            <div className="flex justify-center mb-6 animate-fade-in-up animate-delay-600">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full smooth-pulse"></div>
                Real-time data
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="animate-fade-in-up animate-delay-700">
                <StatsCard
                  label="Potholes Reported"
                  value={stats.total || 0}
                  animationDelay={0}
                />
              </div>
              <div className="animate-fade-in-up animate-delay-800">
                <StatsCard
                  label="Potholes Fixed"
                  value={stats.fixed || 0}
                  animationDelay={200}
                />
              </div>
              <div className="animate-fade-in-up animate-delay-900">
                <StatsCard
                  label="Resolution Rate"
                  value={Math.round((stats.rate || 0) * 10) / 10}
                  suffix="%"
                  animationDelay={400}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          ref={whatIsRef}
          className={`py-16 px-4 sm:px-6 lg:px-8 bg-background transition-all duration-1000 ${
            whatIsVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-1000 delay-200 ${
                  whatIsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                What is{" "}
                <span className="text-[var(--primary)]">OpenPothole</span>?
              </h2>
              <p
                className={`max-w-2xl mx-auto text-muted-foreground transition-all duration-1000 delay-300 ${
                  whatIsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                A community-driven platform where citizens report potholes and
                verify repairs themselves. Built on{" "}
                <a
                  href="https://www.open311.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >
                  Open311 API standards
                </a>{" "}
                for transparent, accessible civic engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div
                className={`flex flex-col items-center text-center transition-all duration-1000 delay-400 ${
                  whatIsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
              >
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community-Driven</h3>
                <p className="text-muted-foreground">
                  Citizens report potholes and verify repairs themselves. No
                  login required.
                </p>
              </div>

              <div
                className={`flex flex-col items-center text-center transition-all duration-1000 delay-500 ${
                  whatIsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
              >
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Anonymous Reporting
                </h3>
                <p className="text-muted-foreground">
                  Reports are securely submitted to the concerned zonal engineer
                  while keeping your identity private.
                </p>
              </div>

              <div
                className={`flex flex-col items-center text-center transition-all duration-1000 delay-600 ${
                  whatIsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
              >
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Community Verification
                </h3>
                <p className="text-muted-foreground">
                  Authorities fix the pothole after reviewing reports and
                  citizens verify the repairs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={howItWorksRef}
          className={`py-20 lg:py-32 bg-muted/30 transition-all duration-1000 ${
            howItWorksVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <h2
                className={`text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4 transition-all duration-1000 delay-200 ${
                  howItWorksVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                How it <span className="text-[var(--primary)]">Works</span>
              </h2>
              <p
                className={`text-lg text-muted-foreground font-light max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
                  howItWorksVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Simple, fast, and effective pothole reporting in three steps. No
                technical expertise required.
              </p>
            </div>

            <div className="relative">
              <div
                className={`absolute top-4 inset-x-0 hidden lg:block transition-all duration-1000 delay-400 ${
                  howItWorksVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex justify-center items-center px-16">
                  <div className="flex-1 h-0.5 bg-[var(--primary)]/20"></div>
                  <div className="w-8 h-8 rounded-full bg-background border-2 border-[var(--primary)]/20 flex items-center justify-center mx-4">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] smooth-pulse"></div>
                  </div>
                  <div className="flex-1 h-0.5 bg-[var(--primary)]/20"></div>
                  <div className="w-8 h-8 rounded-full bg-background border-2 border-[var(--primary)]/20 flex items-center justify-center mx-4">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] smooth-pulse"></div>
                  </div>
                  <div className="flex-1 h-0.5 bg-[var(--primary)]/20"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 relative z-10">
                <div
                  className={`flex flex-col items-center text-center transition-all duration-1000 delay-500 ${
                    howItWorksVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-[var(--primary)]/20 mb-6 shadow-sm relative z-20">
                    <Plus className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--primary)] mb-2">
                      Step 01
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      <span className="text-[var(--primary)]">Report</span>
                    </h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Capture geotagged photo and submit report via Open311 API.
                      Takes less than 2 minutes.
                    </p>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-center text-center transition-all duration-1000 delay-600 ${
                    howItWorksVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-[var(--primary)]/20 mb-6 shadow-sm relative z-20">
                    <Eye className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--primary)] mb-2">
                      Step 02
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      <span className="text-[var(--primary)]">Track</span>
                    </h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Monitor report status and community verification progress
                      via real-time updates.
                    </p>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-center text-center transition-all duration-1000 delay-700 ${
                    howItWorksVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-[var(--primary)]/20 mb-6 shadow-sm relative z-20">
                    <CheckCircle className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--primary)] mb-2">
                      Step 03
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      <span className="text-[var(--primary)]">Verify</span>
                    </h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Validate repair quality with multiple citizens confirming
                      accuracy and accountability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
