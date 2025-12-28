import { calculateScenario } from "@/lib/pricing/calculator";
import type { CalculationResult, CostLine } from "@/lib/pricing/types";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const fetchScenarios = async (ids: string[]) => {
  return prisma.pricingScenario.findMany({
    where: { id: { in: ids } },
    include: {
      paxBreakdown: true,
      exchangeRates: true,
      costLines: true,
      margin: true,
      commission: true,
    },
  });
};

type Scenario = Awaited<ReturnType<typeof fetchScenarios>>[number];

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ids?: string };
}) {
  const ids = (searchParams.ids ?? params.id).split(",").filter(Boolean);
  const scenarios = await fetchScenarios(ids);
  const calculations = scenarios.map((scenario: Scenario) => {
    const latestRate = scenario.exchangeRates.at(-1);
    return {
      id: scenario.id,
      name: scenario.name,
      result: calculateScenario({
        nights: scenario.nights,
        paxCounts: {
          single: scenario.paxBreakdown?.single ?? 0,
          double: scenario.paxBreakdown?.double ?? 0,
          triple: scenario.paxBreakdown?.triple ?? 0,
          chdPlus6: scenario.paxBreakdown?.chdPlus6 ?? 0,
          chdMinus6: scenario.paxBreakdown?.chdMinus6 ?? 0,
          infant: scenario.paxBreakdown?.infant ?? 0,
        },
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
          source: latestRate?.source ?? "AUTO",
          rate: latestRate?.rate ?? 1,
          timestamp: latestRate?.timestamp.toISOString() ?? new Date().toISOString(),
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
      }),
    };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--token-primary)]">Scenario compare</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Compare variants</h1>
        </div>
        <Link href="/pricing/scenarios" className="rounded-full border px-4 py-2 text-xs font-semibold text-[var(--muted)]">
          Return to list
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--token-surface)] p-4 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.2em] text-gray-500">
              <th className="px-3 py-2">Scenario</th>
              <th className="px-3 py-2">Sales price</th>
              <th className="px-3 py-2">Per pax</th>
              <th className="px-3 py-2">Margin</th>
              <th className="px-3 py-2">Commission</th>
              <th className="px-3 py-2">Exchange</th>
            </tr>
          </thead>
          <tbody>
            {calculations.map(({ id, name, result }: { id: string; name: string; result: CalculationResult }) => (
              <tr key={id} className="border-t">
                <td className="px-3 py-2 font-semibold">{name}</td>
                <td className="px-3 py-2">{result.salesTotal.toFixed(0)}</td>
                <td className="px-3 py-2">{result.perPaxPrice.toFixed(0)}</td>
                <td className="px-3 py-2">{result.marginTotal.toFixed(0)}</td>
                <td className="px-3 py-2">{result.commissionTotal.toFixed(0)}</td>
                <td className="px-3 py-2">{result.selectedRate.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
