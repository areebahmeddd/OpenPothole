import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

async function getStats() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL ? "https://" + process.env.NEXT_PUBLIC_VERCEL_URL : ""}/api/reports/stats`,
    {
      cache: "no-store",
    },
  ).catch(() => undefined);
  if (!res || !res.ok) return { total: 0, fixed: 0, rate: 0 };
  return res.json();
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <main className="min-h-dvh">
      <section className="px-6 md:px-10 py-12 md:py-20">
        <div className="mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            Bengaluru Civic Reporting
          </div>
          <h1
            className={cn(
              "text-balance text-4xl md:text-6xl font-semibold tracking-tight",
            )}
          >
            Report Potholes. Build Better Roads.
          </h1>
          <p className="text-pretty text-muted-foreground md:text-lg">
            Help make Bangalore&apos;s roads better. Take a photo, we&apos;ll
            handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/report">📸 Report a Pothole</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/map">🗺️ View Pothole Map</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Potholes Reported
                </p>
                <p className="text-2xl font-semibold">
                  {stats.total?.toLocaleString() ?? "0"}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Fixed</p>
                <p className="text-2xl font-semibold">
                  {stats.fixed?.toLocaleString() ?? "0"}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-semibold">
                  {Math.round(stats.rate || 0)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-12 md:py-16 bg-card/60 border-t">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="mb-3 text-3xl">👀</div>
                <h3 className="font-medium mb-1">Spot</h3>
                <p className="text-sm text-muted-foreground">
                  See a pothole in your area.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="mb-3 text-3xl">📸</div>
                <h3 className="font-medium mb-1">Report</h3>
                <p className="text-sm text-muted-foreground">
                  Snap a photo and submit the location.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="mb-3 text-3xl">📈</div>
                <h3 className="font-medium mb-1">Track</h3>
                <p className="text-sm text-muted-foreground">
                  Follow progress until it&apos;s fixed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-10 border-t">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Together, we can track and fix our city&apos;s potholes.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Link className="underline-offset-2 hover:underline" href="/map">
              Open Map
            </Link>
            <span aria-hidden>•</span>
            <Link className="underline-offset-2 hover:underline" href="/report">
              Submit Report
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
