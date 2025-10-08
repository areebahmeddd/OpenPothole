import { NextResponse } from "next/server";

type Report = {
  id: string;
  photoDataUrl?: string;
  lat: number;
  lng: number;
  address?: string;
  description?: string;
  severity: number;
  status: "new" | "acknowledged" | "fixed" | "verified";
  createdAt: number;
  verifications: { fixed: number; notFixed: number };
};

const globalAny = globalThis as any;
if (!globalAny.__REPORTS__) {
  const now = Date.now();
  globalAny.__REPORTS__ = [
    {
      id: "BLR-1247",
      lat: 12.9716,
      lng: 77.5946,
      address: "MG Road, Bengaluru",
      severity: 3,
      status: "verified",
      createdAt: now - 1000 * 60 * 60 * 24 * 10,
      verifications: { fixed: 6, notFixed: 1 },
    },
    {
      id: "BLR-1248",
      lat: 12.9352,
      lng: 77.6245,
      address: "Koramangala 1st Block",
      severity: 4,
      status: "fixed",
      createdAt: now - 1000 * 60 * 60 * 24 * 2,
      verifications: { fixed: 1, notFixed: 0 },
    },
    {
      id: "BLR-1249",
      lat: 13.0358,
      lng: 77.597,
      address: "Hebbal Flyover",
      severity: 5,
      status: "acknowledged",
      createdAt: now - 1000 * 60 * 60 * 24 * 1,
      verifications: { fixed: 0, notFixed: 0 },
    },
    {
      id: "BLR-1250",
      lat: 12.9141,
      lng: 77.6387,
      address: "HSR Layout",
      severity: 2,
      status: "new",
      createdAt: now - 1000 * 60 * 60 * 3,
      verifications: { fixed: 0, notFixed: 0 },
    },
  ] as Report[];
}

export async function GET() {
  return NextResponse.json(globalAny.__REPORTS__);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `BLR-${Math.floor(1000 + Math.random() * 9000)}`;
  const report: Report = {
    id,
    photoDataUrl: body.photoDataUrl,
    lat: Number(body.lat),
    lng: Number(body.lng),
    address: body.address || "",
    description: body.description || "",
    severity: Math.max(1, Math.min(5, Number(body.severity) || 1)),
    status: "new",
    createdAt: Date.now(),
    verifications: { fixed: 0, notFixed: 0 },
  };
  globalAny.__REPORTS__.unshift(report);
  return NextResponse.json({ id }, { status: 201 });
}
