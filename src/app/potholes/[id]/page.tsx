import { DescriptionText } from "@/components/DescriptionText";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/DotPattern";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

async function getReport(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null as any;
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

  const submittedDate = new Date(report.createdAt);
  const submittedDateStr = submittedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const submittedTimeStr = submittedDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const hasDescription =
    !!report.description && report.description.trim().length > 0;

  const formatStepTime = (key: string): string | null => {
    const date =
      key === "new"
        ? new Date(report.createdAt)
        : key === report.status
          ? new Date(report.updatedAt || report.createdAt)
          : null;
    if (!date) return null;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function verify(action: "verifyFixed" | "verifyNotFixed") {
    "use server";
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative min-h-screen">
        <DotPattern className="fill-muted-foreground/40 [mask-image:radial-gradient(1600px_circle_at_center,white,transparent)]" />

        <main className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Report #{report.id}
              </h1>
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-muted-foreground">Bengaluru</span>
                <span className="text-foreground">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-muted-foreground">Severity</span>
                  <span className="font-semibold text-foreground">
                    {report.severity}/5
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <div className="group relative flex flex-col justify-between rounded-xl bg-card/50 backdrop-blur-sm border overflow-hidden hover:border-[var(--primary)]/50 transition-all duration-500 h-full">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/3"></div>
                  <div
                    className="absolute inset-0 rounded-xl border border-[var(--primary)]/20 animate-pulse"
                    style={{ animationDuration: "3s" }}
                  ></div>
                  <div className="relative z-10 h-full">
                    <img
                      src={report.photoDataUrl}
                      alt="Reported pothole"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="group relative flex flex-col justify-between rounded-xl bg-card/50 backdrop-blur-sm border p-6 hover:border-[var(--primary)]/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/3"></div>
                  <div
                    className="absolute inset-0 rounded-xl border border-[var(--primary)]/20 animate-pulse"
                    style={{ animationDuration: "3s" }}
                  ></div>
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-base font-semibold flex items-center gap-2 pb-2 border-b">
                      <svg
                        className="w-5 h-5 text-[var(--primary)]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      Report Details
                    </h3>
                    <div
                      className={cn(hasDescription ? "space-y-6" : "space-y-4")}
                    >
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Location
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm leading-relaxed">
                            {report.address ||
                              `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}`}
                          </p>
                          <a
                            href={`https://www.google.com/maps?q=${report.lat},${report.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[var(--primary)] hover:underline whitespace-nowrap"
                          >
                            View on map
                          </a>
                        </div>
                      </div>
                      {report.description && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">
                            Description
                          </p>
                          <DescriptionText text={report.description} />
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Submitted On
                        </p>
                        <p className="text-sm">
                          {submittedDateStr}
                          <span className="text-foreground mx-2">•</span>
                          {submittedTimeStr}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Officer Details
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Name</span>
                          <span className="font-medium">
                            {report.officer?.name || "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1.5">
                          <span className="text-muted-foreground">Contact</span>
                          <span className="font-medium text-right">
                            {report.officer?.contact?.value ? (
                              report.officer?.contact?.method === "email" ? (
                                <a
                                  className="underline-offset-2 hover:underline"
                                  href={`mailto:${report.officer.contact.value}`}
                                >
                                  {report.officer.contact.value}
                                </a>
                              ) : report.officer?.contact?.method ===
                                "phone" ? (
                                <a
                                  className="underline-offset-2 hover:underline"
                                  href={`tel:${report.officer.contact.value}`}
                                >
                                  {report.officer.contact.value}
                                </a>
                              ) : (
                                report.officer.contact.value
                              )
                            ) : (
                              "—"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1.5">
                          <span className="text-muted-foreground">Status</span>
                          <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold capitalize border border-[var(--primary)]/20">
                            {report.officer?.status || "pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="space-y-3">
                      <h3 className="text-base font-semibold">
                        Community Actions
                      </h3>
                      <form
                        action={verify.bind(null, "verifyFixed")}
                        className="w-full"
                      >
                        <Button
                          type="submit"
                          className="w-full h-11 bg-[var(--primary)] font-semibold hover:bg-[var(--primary)] active:bg-[var(--primary)] focus:bg-[var(--primary)]"
                        >
                          Mark as Fixed
                        </Button>
                      </form>
                      <form
                        action={verify.bind(null, "verifyNotFixed")}
                        className="w-full"
                      >
                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full h-11 font-semibold hover:bg-transparent active:bg-transparent focus:bg-transparent hover:text-inherit active:text-inherit focus:text-inherit"
                        >
                          Still Not Fixed
                        </Button>
                      </form>
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full h-11 font-semibold"
                      >
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `I reported a pothole in Bengaluru via @OpenPothole`,
                          )}`}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
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

            <div className="group relative flex flex-col justify-between rounded-xl bg-card/50 backdrop-blur-sm border p-6 hover:border-[var(--primary)]/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/3"></div>
              <div
                className="absolute inset-0 rounded-xl border border-[var(--primary)]/20 animate-pulse"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="relative z-10 space-y-6">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[var(--primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Status Timeline
                </h3>
                <div className="relative pl-10">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[var(--primary)]/20" />

                  <div className="divide-y divide-border/60">
                    {timeline.map((t, idx) => {
                      const isDone = idx < activeIdx;
                      const isCurrent = idx === activeIdx;
                      const timeLabel = formatStepTime(t.key);
                      return (
                        <div key={t.key} className="relative py-4">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 -translate-x-1/2">
                            <div
                              className={cn(
                                "rounded-full border-2",
                                isCurrent
                                  ? "w-5 h-5 bg-background border-[var(--primary)] ring-4 ring-[var(--primary)]/20"
                                  : isDone
                                    ? "w-3.5 h-3.5 bg-[var(--primary)] border-[var(--primary)]"
                                    : "w-3.5 h-3.5 bg-muted border-border",
                              )}
                            />
                          </div>
                          <div className="ml-4 pl-6 flex items-center justify-between gap-6">
                            <span
                              className={cn(
                                "text-sm font-medium tracking-tight",
                                isCurrent
                                  ? "text-foreground"
                                  : isDone
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                              )}
                            >
                              {t.label}
                            </span>
                            <span
                              className={cn(
                                "text-xs tabular-nums",
                                timeLabel
                                  ? "text-muted-foreground"
                                  : "text-transparent",
                              )}
                            >
                              {timeLabel || "--"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
