import { readSharedData, writeSharedData } from "@/lib/sharedStorage";
import { NextResponse } from "next/server";
import type { Campaign } from "@/types";

const FILENAME = "campaigns.json";

type Payload = {
  campaigns: Campaign[];
};

export async function GET() {
  const campaigns = await readSharedData<Campaign[]>(FILENAME, []);
  return NextResponse.json(campaigns);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Payload>;
  if (!body?.campaigns || !Array.isArray(body.campaigns)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await writeSharedData(FILENAME, body.campaigns);
  return NextResponse.json({ success: true });
}
