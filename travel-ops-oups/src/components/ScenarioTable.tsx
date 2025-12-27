'use client';

import { useMemo, useState } from "react";
import { calculateScenario } from "@/lib/pricing/calculator";
import { ScenarioView } from "@/types/pricing";
import Link from "next/link";

type FilterOption = "recent" | "high" | "low";

export default function ScenarioTable({ initialScenarios }: { initialScenarios: ScenarioView[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("recent");

  const filtered = useMemo(() => {
    const bySearch = initialScenarios.filter((scenario) =>
      `${scenario.name} ${scenario.destination}`.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === "high") {
      return [...bySearch].sort((a, b) => a.nights - b.nights);
    }
    if (filter === "low") {
      return [...bySearch].sort((a, b) => b.nights - a.nights);
    }
    return bySearch;
  }, [filter, initialScenarios, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--token-primary)]">Pricing scenarios</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Scenario catalog</h1>
        </div>
        <Link href="/pricing" className="rounded-full bg-[var(--token-accent)] px-4 py-2 text-sm text-[var(--token-inverse)]">
          Launch wizard
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search scenarios"
          className="block w-full max-w-md rounded border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as FilterOption)}
          className="rounded border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)]"
        >
          <option value="recent">Latest</option>
          <option value="high">Shortest nights first</option>
          <option value="low">Longest nights first</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--token-surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--token-surface-2)] text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Scenario</th>
              <th className="px-4 py-3">Nights</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Cost (DZD)</th>
              <th className="px-4 py-3">Per pax (DZD)</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((scenario) => {
              const calc = calculateScenario({
                nights: scenario.nights,
                paxCounts: scenario.paxCounts,
                roomAllocation: undefined,
                costLines: scenario.costLines.map((line) => ({
                  ...line,
                  appliesTo: "ALL",
                })),
                exchangeRate: { source: "AUTO", rate: scenario.exchangeRate, timestamp: new Date().toISOString() },
                margin: scenario.margin,
                commission: scenario.commission,
              });
              return (
                <tr key={scenario.id} className="border-t last:border-b">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{scenario.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      Created {new Date(scenario.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">{scenario.nights}</td>
                  <td className="px-4 py-3">{scenario.destination}</td>
                  <td className="px-4 py-3">{calc.totalCostDzd.toFixed(0)}</td>
                  <td className="px-4 py-3">{calc.perPaxPrice.toFixed(0)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/pricing/scenarios/${scenario.id}`}
                      className="rounded-full bg-[var(--token-accent)] px-3 py-1 text-xs font-semibold text-[var(--token-inverse)]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

