import { calculateScenario } from "../lib/pricing/calculator";

describe("Pricing calculator", () => {
  it("applies margins and exchange rate correctly", () => {
    const result = calculateScenario({
      nights: 3,
      paxCounts: { single: 2, double: 2, triple: 1, chdPlus6: 1, chdMinus6: 0, infant: 1 },
      costLines: [
        {
          id: "line-room",
          label: "Room Rate",
          type: "ROOM",
          applyRule: "PER_NIGHT",
          amount: 1000,
          quantity: 1,
          appliesTo: "ALL",
          optional: false,
        },
        {
          id: "line-visa",
          label: "eVisa",
          type: "VISA",
          applyRule: "PER_PAX",
          amount: 50,
          quantity: 1,
          appliesTo: ["SINGLE", "DOUBLE", "TRIPLE"],
          optional: false,
        },
      ],
      exchangeRate: {
        source: "MANUAL",
        rate: 44,
        timestamp: new Date().toISOString(),
      },
      margin: {
        single: 40000,
        double: 40000,
        triple: 40000,
        chdPlus6: 20000,
        chdMinus6: 15000,
        infant: 10000,
      },
      commission: {
        tier1: 1000,
        tier2: 1500,
        tier3: 2000,
        tier4: 2500,
        includeInfants: false,
        includeInSales: true,
      },
    });

    expect(result.totalCostSource).toBeGreaterThan(0);
    expect(result.totalCostDzd).toBeGreaterThan(result.totalCostSource);
    expect(result.marginPercent).toBeGreaterThan(0);
    expect(result.salesTotal).toBeGreaterThan(result.totalCostDzd);
  });
});
