import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getReport(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${id}`, {
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json();
}

export default async function PotholeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) return notFound();

  const timeline = [
    { key: "new", label: "Reported" },
    { key: "acknowledged", label: "In Progress" },
    { key: "fixed", label: "Fixed" },
    { key: "verified", label: "Verified" },
  ];

  const activeIdx = timeline.findIndex((x) => x.key === report.status);

  async function verify(action: "verifyFixed" | "verifyNotFixed") {
    "use server";
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />

      <main className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>•</span>
              <Link href="/map" className="hover:text-foreground transition-colors">Map</Link>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Report #{report.id}
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="text-muted-foreground">Bengaluru</span>
              <span className="text-muted-foreground">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-muted-foreground">Severity</span>
                <span className="font-semibold text-foreground">{report.severity}/5</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold capitalize border border-[var(--primary)]/20">
                {report.status}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Image & Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Image */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.photoDataUrl || "/placeholder.svg"}
                  alt="Reported pothole"
                  className="w-full aspect-video object-cover"
                />
              </div>

              {/* Description */}
              {report.description && (
                <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-2">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status Timeline
                </h3>
                <div className="space-y-3 pt-2">
                  {timeline.map((t, idx) => {
                    const active = idx <= activeIdx;
                    const current = idx === activeIdx;
                    return (
                      <div key={t.key} className="flex items-center gap-4">
                        <div className={cn(
                          "w-3 h-3 rounded-full transition-all shrink-0",
                          current ? "bg-[var(--primary)] ring-4 ring-[var(--primary)]/20 scale-125" :
                            active ? "bg-[var(--primary)]" : "bg-muted border-2 border-border"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          current ? "text-foreground font-semibold" :
                            active ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {t.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Info & Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Location & Info */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-5">
                <h3 className="text-base font-semibold flex items-center gap-2 pb-2 border-b">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Report Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Location</p>
                    <p className="text-sm leading-relaxed">
                      {report.address || `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Submitted On</p>
                    <p className="text-sm">
                      {new Date(report.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(report.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-4">
                <h3 className="text-base font-semibold pb-2 border-b">Community Actions</h3>
                <div className="space-y-3">
                  <form action={verify.bind(null, "verifyFixed")} className="w-full">
                    <Button type="submit" className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-dark)] font-semibold">
                      ✓ Mark as Fixed
                    </Button>
                  </form>
                  <form action={verify.bind(null, "verifyNotFixed")} className="w-full">
                    <Button type="submit" variant="outline" className="w-full h-11 font-semibold">
                      Still Not Fixed
                    </Button>
                  </form>
                  <Button asChild variant="ghost" className="w-full h-11 font-semibold">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `I reported a pothole in Bengaluru via @OpenPothole`,
                      )}`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Share on X
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
