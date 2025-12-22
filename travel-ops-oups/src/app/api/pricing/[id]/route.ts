import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const scenario = await prisma.pricingScenario.findUnique({
    where: { id: params.id },
    include: {
      paxBreakdown: true,
      exchangeRates: true,
      costLines: true,
      margin: true,
      commission: true,
    },
  });
  if (!scenario) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(scenario);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  await prisma.pricingScenario.update({
    where: { id: params.id },
    data: { ...payload },
  });
  return NextResponse.json({ success: true });
}
