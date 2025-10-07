import Link from "next/link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/80 bg-background/95 border-b">
      <div className="mx-auto max-w-6xl px-6 md:px-10 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          RoadWatch BLR
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            className="text-sm text-muted-foreground hover:text-foreground"
            href="/map"
          >
            Map
          </Link>
          <Link
            className="text-sm text-muted-foreground hover:text-foreground"
            href="/report"
          >
            Report
          </Link>
        </nav>
      </div>
    </header>
  );
}
