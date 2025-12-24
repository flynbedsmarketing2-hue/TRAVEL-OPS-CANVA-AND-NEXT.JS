import { readSharedData, writeSharedData } from "@/lib/sharedStorage";
import { NextResponse } from "next/server";
import type { ContentItem } from "@/types";

const FILENAME = "content.json";

type Payload = {
  content: ContentItem[];
};

export async function GET() {
  const content = await readSharedData<ContentItem[]>(FILENAME, []);
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Payload>;
  if (!body?.content || !Array.isArray(body.content)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await writeSharedData(FILENAME, body.content);
  return NextResponse.json({ success: true });
}
