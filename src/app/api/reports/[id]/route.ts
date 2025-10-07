import { NextResponse } from "next/server";

const globalAny = globalThis as any;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const r = (globalAny.__REPORTS__ as any[]).find((x) => x.id === params.id);
  if (!r) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(r);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json().catch(() => ({}));
  const reports = globalAny.__REPORTS__ as any[];
  const idx = reports.findIndex((x) => x.id === params.id);
  if (idx === -1)
    return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const r = reports[idx];
  if (body.action === "verifyFixed") {
    r.verifications.fixed += 1;
    if (r.status === "fixed" && r.verifications.fixed >= 3) {
      r.status = "verified";
    } else if (r.status === "new" || r.status === "acknowledged") {
      r.status = "fixed";
    }
  } else if (body.action === "verifyNotFixed") {
    r.verifications.notFixed += 1;
    if (r.status === "fixed" || r.status === "verified") {
      // fall back if community flags not fixed
      if (r.verifications.notFixed >= 2) {
        r.status = "acknowledged";
      }
    }
  } else if (body.action === "acknowledge") {
    r.status = "acknowledged";
  }
  reports[idx] = r;
  return NextResponse.json({ ok: true, report: r });
}
