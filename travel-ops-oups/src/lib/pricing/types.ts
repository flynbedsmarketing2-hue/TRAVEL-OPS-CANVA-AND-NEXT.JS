export type PaxCounts = {
  single: number;
  double: number;
  triple: number;
  chdPlus6: number;
  chdMinus6: number;
  infant: number;
};

export type RoomAllocation = {
  singleRooms?: number;
  doubleRooms?: number;
  tripleRooms?: number;
};

export type CostType = "ROOM" | "VISA" | "TRANSFER" | "EXCURSION" | "TICKET" | "SERVICE_FEE" | "OTHER";
export type ApplyRule = "PER_PAX" | "PER_ROOM" | "PER_NIGHT" | "PER_STAY" | "PER_GROUP";
export type PaxCategory = "SINGLE" | "DOUBLE" | "TRIPLE" | "CHD_PLUS6" | "CHD_MINUS6" | "INF";

export type CostLine = {
  id: string;
  label: string;
  type: CostType;
  applyRule: ApplyRule;
  amount: number;
  quantity: number;
  appliesTo: PaxCategory[] | "ALL";
  optional: boolean;
};

export type ExchangeRate = {
  source: "AUTO" | "MANUAL";
  rate: number;
  timestamp: string;
};

export type MarginConfig = {
  single: number;
  double: number;
  triple: number;
  chdPlus6: number;
  chdMinus6: number;
  infant: number;
};

export type CommissionConfig = {
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
  includeInfants: boolean;
  includeInSales: boolean;
};

export type PricingScenarioPayload = {
  id?: string;
  name: string;
  destination: string;
  notes?: string;
  nights: number;
  startDate?: string;
  endDate?: string;
  currency: string;
  paxCounts: PaxCounts;
  roomAllocation?: RoomAllocation;
  exchangeRate: ExchangeRate;
  costLines: CostLine[];
  margin: MarginConfig;
  commission: CommissionConfig;
};

export type CostLineResult = {
  id: string;
  label: string;
  amountSource: number;
  amountDzd: number;
  applyRule: ApplyRule;
};

export type CalculationResult = {
  totalCostSource: number;
  totalCostDzd: number;
  marginTotal: number;
  marginPercent: number;
  commissionTotal: number;
  salesTotal: number;
  perPaxPrice: number;
  commissionIncluded: boolean;
  selectedRate: number;
  lineResults: CostLineResult[];
};
