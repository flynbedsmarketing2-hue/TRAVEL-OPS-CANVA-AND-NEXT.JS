import type { CostLine, MarginConfig, CommissionConfig, PaxCounts } from "@/lib/pricing/types";

export type ScenarioView = {
  id: string;
  name: string;
  destination: string;
  nights: number;
  createdAt: string;
  currency: string;
  paxCounts: PaxCounts;
  exchangeRate: number;
  costLines: CostLine[];
  margin: MarginConfig;
  commission: CommissionConfig;
};
