import { NextResponse } from "next/server";

const globalAny = globalThis as any;

export async function GET() {
  const list = (globalAny.__REPORTS__ as any[]) || [];
  const total = list.length;
  const fixed = list.filter(
    (r) => r.status === "fixed" || r.status === "verified",
  ).length;
  const rate = total ? Math.round((fixed / total) * 100) : 0;
  return NextResponse.json({ total, fixed, rate });
}
