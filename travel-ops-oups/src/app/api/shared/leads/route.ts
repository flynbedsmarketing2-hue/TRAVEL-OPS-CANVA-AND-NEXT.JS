import { readSharedData, writeSharedData } from "@/lib/sharedStorage";
import { NextResponse } from "next/server";
import type { Lead } from "@/types";

const FILENAME = "leads.json";

type Payload = {
  leads: Lead[];
};

export async function GET() {
  const leads = await readSharedData<Lead[]>(FILENAME, []);
  return NextResponse.json(leads);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Payload>;
  if (!body?.leads || !Array.isArray(body.leads)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await writeSharedData(FILENAME, body.leads);
  return NextResponse.json({ success: true });
}
