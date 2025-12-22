import { calculateScenario } from "@/lib/pricing/calculator";
import { prisma } from "@/lib/prisma";
import type { PricingScenarioPayload } from "@/lib/pricing/types";
import Link from "next/link";
import { DuplicateScenarioButton } from "@/components/DuplicateScenarioButton";

const fetchScenario = async (id: string) => {
  return prisma.pricingScenario.findUnique({
    where: { id },
    include: {
      paxBreakdown: true,
      exchangeRates: true,
      costLines: true,
      margin: true,
      commission: true,
    },
  });
};

export default async function ScenarioDetailPage({ params }: { params: { id: string } }) {
  const scenario = await fetchScenario(params.id);
  if (!scenario) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-center text-sm text-red-500">Scenario not found.</p>
      </div>
    );
  }
  const latestRate = scenario.exchangeRates.at(-1);
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
    costLines: scenario.costLines.map((line) => ({
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
  });

  const payload: PricingScenarioPayload = {
    name: scenario.name,
    destination: scenario.destination,
    notes: scenario.notes ?? undefined,
    nights: scenario.nights,
    currency: scenario.currency,
    paxCounts: {
      single: scenario.paxBreakdown?.single ?? 0,
      double: scenario.paxBreakdown?.double ?? 0,
      triple: scenario.paxBreakdown?.triple ?? 0,
      chdPlus6: scenario.paxBreakdown?.chdPlus6 ?? 0,
      chdMinus6: scenario.paxBreakdown?.chdMinus6 ?? 0,
      infant: scenario.paxBreakdown?.infant ?? 0,
    },
    roomAllocation: scenario.paxBreakdown?.roomAllocation ?? undefined,
    exchangeRate: {
      source: latestRate?.source ?? "AUTO",
      rate: latestRate?.rate ?? 1,
      timestamp: latestRate?.timestamp.toISOString() ?? new Date().toISOString(),
    },
    costLines: scenario.costLines.map((line) => ({
      id: line.id,
      label: line.label,
      type: line.type,
      applyRule: line.applyRule,
      amount: line.amount,
      quantity: line.quantity,
      appliesTo: line.appliesTo,
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

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Pricing detail</p>
          <h1 className="text-3xl font-semibold text-slate-900">{scenario.name}</h1>
          <p className="text-sm text-slate-500">{scenario.destination}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/pricing/scenarios/${scenario.id}/compare?ids=${scenario.id}`}
            className="rounded-full border px-3 py-2 text-xs font-semibold text-slate-600"
          >
            Compare
          </Link>
          <ExportLinks scenarioId={scenario.id} />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Sales price: {calc.salesTotal.toFixed(0)} DZD</p>
        <p className="text-sm text-slate-500">Per pax (rounded): {calc.perPaxPrice.toFixed(0)} DZD</p>
        <p className="text-sm text-slate-500">Commission: {calc.commissionTotal.toFixed(0)} DZD</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Pax breakdown</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            {Object.entries(scenario.paxBreakdown ?? {}).map(([key, value]) => (
              <p key={key}>
                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</span>: {value}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Totals</p>
          <div className="mt-3 space-y-2 text-sm">
            <p>Total cost: {calc.totalCostDzd.toFixed(0)} DZD</p>
            <p>Margin: {calc.marginTotal.toFixed(0)} DZD</p>
            <p>Exchange rate used: {calc.selectedRate.toFixed(3)}</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.1em] text-blue-600">Cost lines</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Apply</th>
                <th className="px-3 py-2">Amount (QAR)</th>
              </tr>
            </thead>
            <tbody>
              {scenario.costLines.map((line) => (
                <tr key={line.id} className="border-t">
                  <td className="px-3 py-2 font-semibold">{line.label}</td>
                  <td className="px-3 py-2">{line.type}</td>
                  <td className="px-3 py-2">{line.applyRule}</td>
                  <td className="px-3 py-2">{line.amount * line.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-slate-500">
          <p>Margin config per pax category stored for manual fine tuning.</p>
        </div>
      </div>
      <DuplicateScenarioButton scenario={payload} />
    </div>
  );
}

function ExportLinks({ scenarioId }: { scenarioId: string }) {
  return (
    <div className="flex gap-2">
      {["pdf", "whatsapp", "json"].map((format) => (
        <a
          key={format}
          href={`/api/pricing/${scenarioId}/export?format=${format}`}
          className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          {format.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
