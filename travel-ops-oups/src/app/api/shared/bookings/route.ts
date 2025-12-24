import { NextResponse } from "next/server";
import { mockBookings } from "@/lib/mockData";
import { readSharedData, writeSharedData } from "@/lib/sharedStorage";
import type { Booking } from "@/types";

type Payload = {
  bookings: Booking[];
};

export async function GET() {
  const bookings = await readSharedData("bookings.json", mockBookings);
  return NextResponse.json(bookings);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Payload>;
  if (!body?.bookings || !Array.isArray(body.bookings)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await writeSharedData("bookings.json", body.bookings);
  return NextResponse.json({ success: true });
}
