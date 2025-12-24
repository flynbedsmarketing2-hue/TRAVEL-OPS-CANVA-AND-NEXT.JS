import { NextResponse } from "next/server";
import { mockPackages } from "@/lib/mockData";
import { readSharedData, writeSharedData } from "@/lib/sharedStorage";
import type { TravelPackage } from "@/types";

type Payload = {
  packages: TravelPackage[];
};

export async function GET() {
  const packages = await readSharedData("packages.json", mockPackages);
  return NextResponse.json(packages);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Payload>;
  if (!body?.packages || !Array.isArray(body.packages)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await writeSharedData("packages.json", body.packages);
  return NextResponse.json({ success: true });
}
