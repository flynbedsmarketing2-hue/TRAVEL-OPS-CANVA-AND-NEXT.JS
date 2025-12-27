'use client';

import { useEffect, useMemo, useState } from "react";
import { calculateScenario } from "@/lib/pricing/calculator";
import { costTemplates } from "@/lib/pricing/templates";
import type { CostLine, MarginConfig, CommissionConfig, PaxCounts, PricingScenarioPayload } from "@/lib/pricing/types";

const defaultPaxCounts: PaxCounts = {
  single: 0,
  double: 0,
  triple: 0,
  chdPlus6: 0,
  chdMinus6: 0,
  infant: 0,
};

const defaultMargin: MarginConfig = {
  single: 40000,
  double: 40000,
  triple: 40000,
  chdPlus6: 20000,
  chdMinus6: 15000,
  infant: 10000,
};

const defaultCommission: CommissionConfig = {
  tier1: 1500,
  tier2: 2000,
  tier3: 2500,
  tier4: 3000,
  includeInfants: false,
  includeInSales: true,
};

const applyRuleHelp: Record<CostLine["applyRule"], string> = {
  PER_PAX: "Per pax",
  PER_ROOM: "Per room",
  PER_NIGHT: "Per night",
  PER_STAY: "Per stay",
  PER_GROUP: "Per group",
};

const categories: { key: keyof PaxCounts; label: string }[] = [
  { key: "single", label: "Single" },
  { key: "double", label: "Double" },
  { key: "triple", label: "Triple" },
  { key: "chdPlus6", label: "CHD +6" },
  { key: "chdMinus6", label: "CHD -6" },
  { key: "infant", label: "INF" },
];

type WizardStep = "basics" | "pax" | "exchange" | "costs" | "margin" | "review";

export default function PricingWizardPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("basics");
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<PricingScenarioPayload>({
    name: "",
    destination: "",
    nights: 3,
    currency: "QAR",
    notes: "",
    paxCounts: defaultPaxCounts,
    roomAllocation: {},
    exchangeRate: { source: "AUTO", rate: 44, timestamp: new Date().toISOString() },
    costLines: costTemplates,
    margin: defaultMargin,
    commission: defaultCommission,
  });

  const result = useMemo(() => {
    return calculateScenario({
      nights: scenario.nights,
      paxCounts: scenario.paxCounts,
      roomAllocation: scenario.roomAllocation,
      costLines: scenario.costLines,
      exchangeRate: scenario.exchangeRate,
      margin: scenario.margin,
      commission: scenario.commission,
    });
  }, [scenario]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...scenario, id: scenarioId }),
        });
        const data = await response.json();
        if (data?.id) {
          setScenarioId(data.id);
        }
      } catch (error) {
        console.error("Draft save error", error);
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [scenario, scenarioId]);

  const updateScenario = (changes: Partial<PricingScenarioPayload>) => {
    setScenario((prev) => ({ ...prev, ...changes }));
  };

  const wizardSteps: WizardStep[] = ["basics", "pax", "exchange", "costs", "margin", "review"];

  const navLabel = (step: WizardStep) => {
    switch (step) {
      case "basics":
        return "A. Scenario basics";
      case "pax":
        return "B. Pax & rooms";
      case "exchange":
        return "C. Exchange rate";
      case "costs":
        return "D. Cost lines";
      case "margin":
        return "E. Margin & commission";
      case "review":
        return "F. Review & export";
    }
  };

  const handleAddCostLine = (template: Partial<CostLine> = {}) => {
    const nextLine: CostLine = {
      id: crypto.randomUUID(),
      label: template.label ?? "Other cost",
      type: template.type ?? "OTHER",
      applyRule: template.applyRule ?? "PER_PAX",
      amount: template.amount ?? 0,
      quantity: template.quantity ?? 1,
      appliesTo: template.appliesTo ?? "ALL",
      optional: template.optional ?? false,
    };
    updateScenario({ costLines: [...scenario.costLines, nextLine] });
  };

  const renderStep = () => {
    switch (currentStep) {
      case "basics":
        return (
          <div>
            <WizardCard title="Scenario basics" description="Tell us about the offer you build.">
              <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
                <label className="block space-y-1 text-sm">
                  <span className="font-semibold">Scenario name</span>
                  <input
                    value={scenario.name}
                    onChange={(event) => updateScenario({ name: event.target.value })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="font-semibold">Destination / city</span>
                  <input
                    value={scenario.destination}
                    onChange={(event) => updateScenario({ destination: event.target.value })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="font-semibold">Nights</span>
                  <input
                    type="number"
                    min={1}
                    value={scenario.nights}
                    onChange={(event) => updateScenario({ nights: Number(event.target.value) })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="font-semibold">Currency (source)</span>
                  <input
                    value={scenario.currency}
                    onChange={(event) => updateScenario({ currency: event.target.value.toUpperCase() })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block space-y-1 text-sm col-span-full">
                  <span className="font-semibold">Notes</span>
                  <textarea
                    value={scenario.notes}
                    onChange={(event) => updateScenario({ notes: event.target.value })}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </WizardCard>
          </div>
        );
      case "pax":
        return (
          <WizardCard
            title="Pax breakdown & rooms"
            description="Mix single/double/triple + children categories."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {categories.map((category) => (
                <label key={category.key} className="block space-y-1 text-sm">
                  <span className="font-semibold">{category.label}</span>
                  <input
                    type="number"
                    min={0}
                    value={scenario.paxCounts[category.key]}
                    onChange={(event) =>
                      updateScenario({
                        paxCounts: {
                          ...scenario.paxCounts,
                          [category.key]: Number(event.target.value),
                        },
                      })
                    }
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Room allocation (optional)</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {["singleRooms", "doubleRooms", "tripleRooms"].map((key) => (
                  <label key={key} className="block space-y-1 text-sm">
                    <span className="font-semibold">{key.replace("Rooms", "")} rooms</span>
                    <input
                      type="number"
                      min={0}
                      value={(scenario.roomAllocation as Record<string, number | undefined>)[key] ?? ""}
                      onChange={(event) =>
                        updateScenario({
                          roomAllocation: {
                            ...(scenario.roomAllocation ?? {}),
                            [key]: event.target.value ? Number(event.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                ))}
              </div>
            </div>
          </WizardCard>
        );
      case "exchange":
        return (
          <WizardCard title="Exchange rate" description="Keep rate history and auto/manual modes.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Rate source</span>
                <select
                  value={scenario.exchangeRate.source}
                  onChange={(event) =>
                    updateScenario({
                      exchangeRate: {
                        ...scenario.exchangeRate,
                        source: event.target.value as "AUTO" | "MANUAL",
                      },
                    })
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="AUTO">Auto</option>
                  <option value="MANUAL">Manual override</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-semibold">QAR → DZD</span>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  value={scenario.exchangeRate.rate}
                  onChange={(event) =>
                    updateScenario({
                      exchangeRate: {
                        ...scenario.exchangeRate,
                        rate: Number(event.target.value),
                        timestamp: new Date().toISOString(),
                      },
                    })
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </label>
            </div>
          </WizardCard>
        );
      case "costs":
        return (
          <WizardCard title="Cost lines" description="Add dynamic cost items plus templates.">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {costTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleAddCostLine(template)}
                    className="rounded-full border px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {scenario.costLines.map((line) => (
                  <div key={line.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{line.label}</p>
                      <span className="text-xs uppercase text-gray-500">{applyRuleHelp[line.applyRule]}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                      <label className="space-y-1">
                        <span className="text-xs text-gray-500">Amount (QAR)</span>
                        <input
                          type="number"
                          min={0}
                          value={line.amount}
                          onChange={(event) =>
                            updateScenario({
                              costLines: scenario.costLines.map((item) =>
                                item.id === line.id ? { ...item, amount: Number(event.target.value) } : item
                              ),
                            })
                          }
                          className="w-full rounded border px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs text-gray-500">Quantity</span>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(event) =>
                            updateScenario({
                              costLines: scenario.costLines.map((item) =>
                                item.id === line.id ? { ...item, quantity: Number(event.target.value) } : item
                              ),
                            })
                          }
                          className="w-full rounded border px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs text-gray-500">Applies to</span>
                        <select
                          value={line.appliesTo === "ALL" ? "ALL" : line.appliesTo.join(",")}
                          onChange={(event) =>
                            updateScenario({
                              costLines: scenario.costLines.map((item) => {
                                if (item.id !== line.id) return item;
                                const value = event.target.value;
                                return {
                                  ...item,
                                  appliesTo: value === "ALL" ? "ALL" : (value.split(",") as CostLine["appliesTo"]),
                                };
                              }),
                            })
                          }
                          className="w-full rounded border px-2 py-1 text-sm"
                        >
                          <option value="ALL">All pax</option>
                          <option value="SINGLE,DOUBLE,TRIPLE">Adults</option>
                          <option value="CHD_PLUS6">CHD +6</option>
                          <option value="CHD_MINUS6">CHD -6</option>
                          <option value="INF">Infant</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </WizardCard>
        );
      case "margin":
        return (
          <WizardCard title="Margin & commission" description="Set fixed margin / commission tiers">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.entries(scenario.margin).map(([key, value]) => (
                <label key={key} className="space-y-1 text-sm">
                  <span className="font-semibold">{key}</span>
                  <input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(event) =>
                      updateScenario({
                        margin: {
                          ...scenario.margin,
                          [key]: Number(event.target.value),
                        },
                      })
                    }
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.entries(scenario.commission)
                .filter(([key]) => key.startsWith("tier"))
                .map(([key, value]) => (
                  <label key={key} className="space-y-1 text-sm">
                    <span className="font-semibold">{key.toUpperCase()}</span>
                    <input
                      type="number"
                      min={0}
                      value={value}
                      onChange={(event) =>
                        updateScenario({
                          commission: {
                            ...scenario.commission,
                            [key]: Number(event.target.value),
                          },
                        })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={scenario.commission.includeInfants}
                  onChange={(event) =>
                    updateScenario({
                      commission: { ...scenario.commission, includeInfants: event.target.checked },
                    })
                  }
                />
                Include infants in commission
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={scenario.commission.includeInSales}
                  onChange={(event) =>
                    updateScenario({
                      commission: { ...scenario.commission, includeInSales: event.target.checked },
                    })
                  }
                />
                Include commission in sales price
              </label>
            </div>
          </WizardCard>
        );
      case "review":
        return (
          <WizardCard title="Review & finalize" description="Recap + exports">
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border bg-gray-50 p-3">
                <p>Total cost (source): {result.totalCostSource.toFixed(0)}</p>
                <p>Total cost (DZD): {result.totalCostDzd.toFixed(0)}</p>
                <p>Margin: {result.marginTotal.toFixed(0)} ({result.marginPercent.toFixed(1)}%)</p>
                <p>Commission: {result.commissionTotal.toFixed(0)}</p>
                <p>Sales total: {result.salesTotal.toFixed(0)}</p>
                <p>Per pax price (rounded): {result.perPaxPrice.toFixed(0)} DZD</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="px-3 py-2">Line</th>
                      <th className="px-3 py-2">Source QAR</th>
                      <th className="px-3 py-2">Converted DZD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.lineResults.map((line) => (
                      <tr key={line.id} className="border-t">
                        <td className="px-3 py-2 font-semibold">{line.label}</td>
                        <td className="px-3 py-2">{line.amountSource.toFixed(0)}</td>
                        <td className="px-3 py-2">{line.amountDzd.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-4 text-sm">
              <a
                href={`/api/pricing/${scenarioId ?? "preview"}/export?format=pdf`}
                className="rounded-full bg-[var(--token-accent)] px-4 py-2 text-[var(--token-inverse)]"
              >
                Export PDF
              </a>
              <a
                href={`/api/pricing/${scenarioId ?? "preview"}/export?format=whatsapp`}
                className="rounded-full bg-[var(--token-accent)] px-4 py-2 text-[var(--token-inverse)]"
              >
                WhatsApp text
              </a>
              <a
                href={`/api/pricing/${scenarioId ?? "preview"}/export?format=json`}
                className="rounded-full bg-[var(--token-surface)] px-4 py-2 text-[var(--token-inverse)]"
              >
                Download JSON
              </a>
            </div>
          </WizardCard>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--token-primary)]">Pricing module</p>
          <h1 className="text-3xl font-semibold text-[var(--text)]">Adaptive pricing wizard</h1>
        </div>
        <div className="text-sm text-gray-500">
          Autosaving scenario {scenarioId ? `(${scenarioId})` : "(draft)"}...
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {wizardSteps.map((step) => (
          <button
            key={step}
            onClick={() => setCurrentStep(step)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
              currentStep === step
                ? "border-[var(--token-accent)]/40 bg-[var(--token-accent)]/10 text-[var(--token-accent)]"
                : "border-[var(--border)] bg-[var(--token-surface)]"
            }`}
          >
            <p className="font-semibold">{navLabel(step)}</p>
            <p className="text-xs uppercase tracking-widest text-gray-500">Step {wizardSteps.indexOf(step) + 1}</p>
          </button>
        ))}
      </div>
      {renderStep()}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={() => setCurrentStep((prev) => wizardSteps[Math.max(0, wizardSteps.indexOf(prev) - 1)])}
          className="rounded-full border px-4 py-2 text-sm text-[var(--text)]"
        >
          Back
        </button>
        <button
          onClick={() => {
            const nextIndex = Math.min(wizardSteps.length - 1, wizardSteps.indexOf(currentStep) + 1);
            setCurrentStep(wizardSteps[nextIndex]);
          }}
          className="rounded-full bg-[var(--token-accent)] px-4 py-2 text-sm text-[var(--token-inverse)]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function WizardCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--token-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-[var(--text)]">{title}</p>
          <p className="text-xs uppercase tracking-widest text-gray-500">{description}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}


