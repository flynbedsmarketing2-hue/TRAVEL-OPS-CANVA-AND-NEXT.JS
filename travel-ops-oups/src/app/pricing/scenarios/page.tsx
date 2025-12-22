import { prisma } from "@/lib/prisma";
import ScenarioTable from "@/components/ScenarioTable";
import type { ScenarioView } from "@/types/pricing";

const fetchScenarios = async (): Promise<ScenarioView[]> => {
  const rows = await prisma.pricingScenario.findMany({
    include: {
      paxBreakdown: true,
      exchangeRates: true,
      costLines: true,
      margin: true,
      commission: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((scenario) => {
    const latestExchange = scenario.exchangeRates.at(-1);
    return {
      id: scenario.id,
      name: scenario.name,
      destination: scenario.destination,
      nights: scenario.nights,
      createdAt: scenario.createdAt.toISOString(),
      currency: scenario.currency,
      paxCounts: {
        single: scenario.paxBreakdown?.single ?? 0,
        double: scenario.paxBreakdown?.double ?? 0,
        triple: scenario.paxBreakdown?.triple ?? 0,
        chdPlus6: scenario.paxBreakdown?.chdPlus6 ?? 0,
        chdMinus6: scenario.paxBreakdown?.chdMinus6 ?? 0,
        infant: scenario.paxBreakdown?.infant ?? 0,
      },
      exchangeRate: latestExchange?.rate ?? 1,
      costLines: scenario.costLines.map((line) => ({
        id: line.id,
        label: line.label,
        applyRule: line.applyRule,
        amount: line.amount,
        quantity: line.quantity,
        optional: line.optional,
      })),
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
    };
  });
};

export default async function PricingScenariosPage() {
  const scenarios = await fetchScenarios();
  return <ScenarioTable initialScenarios={scenarios} />;
}
