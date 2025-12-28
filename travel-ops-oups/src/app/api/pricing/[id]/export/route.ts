import { prisma } from "@/lib/prisma";
import { calculateScenario } from "@/lib/pricing/calculator";
import type { CostLine, RoomAllocation } from "@/lib/pricing/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = await context.params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";
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
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  const latestExchange = scenario.exchangeRates[scenario.exchangeRates.length - 1];
  const calc = calculateScenario({
    nights: scenario.nights,
    paxCounts: {
      single: scenario.paxBreakdown?.single ?? 0,
      double: scenario.paxBreakdown?.double ?? 0,
      triple: scenario.paxBreakdown?.triple ?? 0,
      chdPlus6: scenario.paxBreakdown?.chdPlus6 ?? 0,
      chdMinus6: scenario.paxBreakdown?.chdMinus6 ?? 0,
      infant: scenario.paxBreakdown?.infant ?? 0,
    },
    roomAllocation: (scenario.paxBreakdown?.roomAllocation as RoomAllocation | null) ?? undefined,
    costLines: scenario.costLines.map((line: CostLine) => ({
      id: line.id,
      label: line.label,
      type: line.type,
      applyRule: line.applyRule,
      amount: line.amount,
      quantity: line.quantity,
      appliesTo: line.appliesTo,
      optional: line.optional,
    })),
    exchangeRate: {
      source: latestExchange?.source ?? "AUTO",
      rate: latestExchange?.rate ?? 1,
      timestamp: latestExchange?.timestamp.toISOString() ?? new Date().toISOString(),
    },
    margin: {
      single: scenario.margin?.single ?? 40000,
      double: scenario.margin?.double ?? 40000,
      triple: scenario.margin?.triple ?? 40000,
      chdPlus6: scenario.margin?.chdPlus6 ?? 20000,
      chdMinus6: scenario.margin?.chdMinus6 ?? 15000,
      infant: scenario.margin?.infant ?? 10000,
    },
    commission: {
      tier1: scenario.commission?.tier1 ?? 1000,
      tier2: scenario.commission?.tier2 ?? 1500,
      tier3: scenario.commission?.tier3 ?? 2000,
      tier4: scenario.commission?.tier4 ?? 2500,
      includeInfants: scenario.commission?.includeInfants ?? false,
      includeInSales: scenario.commission?.includeInSales ?? true,
    },
  });

  const payload = {
    scenarioId: scenario.id,
    name: scenario.name,
    destination: scenario.destination,
    nights: scenario.nights,
    recap: calc,
  };

  if (format === "pdf") {
    return NextResponse.json(
      { message: `PDF placeholder for ${scenario.name}`, payload, format },
      { status: 200 }
    );
  }

  if (format === "whatsapp") {
    const text = `Pricing ${scenario.name} (${scenario.destination}): ${Math.round(calc.perPaxPrice)} DZD per pax.`;
    return NextResponse.json({ text, payload, format }, { status: 200 });
  }

  return NextResponse.json({ payload }, { status: 200 });
}
