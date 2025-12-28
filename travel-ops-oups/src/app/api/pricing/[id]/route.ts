import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function resolveParams(context: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  return await context.params;
}

export async function GET(
  _: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = await resolveParams(context);
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

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = await resolveParams(context);
  const payload = await request.json();
  await prisma.pricingScenario.update({
    where: { id: params.id },
    data: { ...payload },
  });
  return NextResponse.json({ success: true });
}
