import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";

async function getReport(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_VERCEL_URL ? "https://" + process.env.NEXT_PUBLIC_VERCEL_URL : ""}/api/reports/${id}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function PotholeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const report = await getReport(params.id);
  if (!report) return notFound();

  const timeline = [
    { key: "new", label: "Reported" },
    { key: "acknowledged", label: "In Progress" },
    { key: "fixed", label: "Fixed" },
    { key: "verified", label: "Community Verified" },
  ];

  async function verify(action: "verifyFixed" | "verifyNotFixed") {
    "use server";
    await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL ? "https://" + process.env.NEXT_PUBLIC_VERCEL_URL : ""}/api/reports/${report.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      },
    );
  }

  return (
    <main className="min-h-dvh px-6 md:px-10 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold">Report #{report.id}</h1>
          <p className="text-muted-foreground">
            Bengaluru • Severity {report.severity}/5
          </p>
        </header>

        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {report.photoDataUrl ? (
              <img
                src={report.photoDataUrl || "/placeholder.svg"}
                alt="Reported pothole"
                className="rounded-md border object-cover w-full aspect-video"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/placeholder.svg?height=360&width=640&query=pothole%20report`}
                alt="Pothole"
                className="rounded-md border w-full"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-md border p-4">
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium">
                  {report.address ||
                    `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}`}
                </div>
              </div>
              <div className="rounded-md border p-4">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium capitalize">{report.status}</div>
              </div>
              <div className="rounded-md border p-4">
                <div className="text-sm text-muted-foreground">Submitted</div>
                <div className="font-medium">
                  {new Date(report.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Status Timeline</div>
              <ol className="flex items-center gap-3 md:gap-4">
                {timeline.map((t, idx) => {
                  const activeIdx = timeline.findIndex(
                    (x) => x.key === report.status,
                  );
                  const active = idx <= activeIdx;
                  return (
                    <li key={t.key} className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${active ? "bg-primary" : "bg-muted border"}`}
                      />
                      <span
                        className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {t.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {report.description ? (
              <div className="rounded-md border p-4">
                <div className="text-sm text-muted-foreground">Description</div>
                <div>{report.description}</div>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-2">
              <form action={verify.bind(null, "verifyFixed")}>
                <Button type="submit" className="w-full sm:w-auto">
                  Mark as Fixed
                </Button>
              </form>
              <form action={verify.bind(null, "verifyNotFixed")}>
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Still Not Fixed
                </Button>
              </form>
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `I reported a pothole in Bengaluru: https://pothole.example/potholes/${report.id}`,
                  )}`}
                >
                  Share
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
