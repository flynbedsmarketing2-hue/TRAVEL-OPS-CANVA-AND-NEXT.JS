import { readSharedData, writeSharedData } from "@/lib/sharedStorage";
import { NextResponse } from "next/server";
import type { Task } from "@/types";

const FILENAME = "tasks.json";

type Payload = {
  tasks: Task[];
};

export async function GET() {
  const tasks = await readSharedData<Task[]>(FILENAME, []);
  return NextResponse.json(tasks);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Payload>;
  if (!body?.tasks || !Array.isArray(body.tasks)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await writeSharedData(FILENAME, body.tasks);
  return NextResponse.json({ success: true });
}
