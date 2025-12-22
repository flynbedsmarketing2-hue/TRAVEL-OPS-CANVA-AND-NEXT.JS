import type { CostLine, MarginConfig, CommissionConfig } from "@/lib/pricing/types";

export type ScenarioView = {
  id: string;
  name: string;
  destination: string;
  nights: number;
  createdAt: string;
  currency: string;
  paxCounts: Record<string, number>;
  exchangeRate: number;
  costLines: CostLine[];
  margin: MarginConfig;
  commission: CommissionConfig;
};
