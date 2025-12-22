import { ApplyRule, CostLine, CommissionConfig, ExchangeRate, MarginConfig, PaxCounts } from "./types";

type Rooms = {
  singleRooms: number;
  doubleRooms: number;
  tripleRooms: number;
};

const deriveRooms = (counts: PaxCounts, override?: Partial<Rooms>): Rooms => {
  if (override?.singleRooms !== undefined || override?.doubleRooms !== undefined || override?.tripleRooms !== undefined) {
    return {
      singleRooms: override?.singleRooms ?? 0,
      doubleRooms: override?.doubleRooms ?? 0,
      tripleRooms: override?.tripleRooms ?? 0,
    };
  }

  const singles = Math.max(0, counts.single);
  const doubles = Math.ceil(Math.max(0, counts.double) / 2);
  const triples = Math.ceil(Math.max(0, counts.triple) / 3);

  return {
    singleRooms: singles,
    doubleRooms: doubles,
    tripleRooms: triples,
  };
};

const totalPax = (counts: PaxCounts) =>
  counts.single + counts.double + counts.triple + counts.chdPlus6 + counts.chdMinus6 + counts.infant;

const applyRuleMultipliers = (rule: ApplyRule, line: CostLine, nights: number, roomsCount: number, relevantPax: number) => {
  const qty = Math.max(1, line.quantity);
  switch (rule) {
    case "PER_NIGHT":
      return line.amount * nights * qty;
    case "PER_STAY":
    case "PER_GROUP":
      return line.amount * qty;
    case "PER_ROOM":
      return line.amount * roomsCount * qty;
    case "PER_PAX":
      return line.amount * relevantPax * qty;
    default:
      return line.amount * qty;
  }
};

const totalRelevantPax = (counts: PaxCounts, appliesTo: CostLine["appliesTo"]) => {
  if (appliesTo === "ALL") return totalPax(counts);
  let sum = 0;
  appliesTo.forEach((category) => {
    switch (category) {
      case "SINGLE":
        sum += counts.single;
        break;
      case "DOUBLE":
        sum += counts.double;
        break;
      case "TRIPLE":
        sum += counts.triple;
        break;
      case "CHD_PLUS6":
        sum += counts.chdPlus6;
        break;
      case "CHD_MINUS6":
        sum += counts.chdMinus6;
        break;
      case "INF":
        sum += counts.infant;
        break;
    }
  });
  return sum;
};

const getCommissionTier = (totalPax: number) => {
  if (totalPax <= 5) return "tier1";
  if (totalPax <= 9) return "tier2";
  if (totalPax <= 15) return "tier3";
  return "tier4";
};

export type CalculationResult = {
  totalCostSource: number;
  totalCostDzd: number;
  marginTotal: number;
  marginPercent: number;
  commissionTotal: number;
  salesTotal: number;
  perPaxPrice: number;
  selectedRate: number;
  lineResults: {
    id: string;
    label: string;
    amountSource: number;
    amountDzd: number;
    optional: boolean;
  }[];
};

export function calculateScenario({
  nights,
  paxCounts,
  roomAllocation,
  costLines,
  exchangeRate,
  margin,
  commission,
}: {
  nights: number;
  paxCounts: PaxCounts;
  roomAllocation?: Partial<Rooms>;
  costLines: CostLine[];
  exchangeRate: ExchangeRate;
  margin: MarginConfig;
  commission: CommissionConfig;
}): CalculationResult {
  const rooms = deriveRooms(paxCounts, roomAllocation);
  const roomsCount = rooms.singleRooms + rooms.doubleRooms + rooms.tripleRooms;
  const totalPaxCount = totalPax(paxCounts);

  let totalCostSource = 0;
  const lineResults = costLines.map((line) => {
    const relevantPax =
      line.appliesTo === "ALL" ? totalPaxCount : totalRelevantPax(paxCounts, line.appliesTo);
    const baseCost = applyRuleMultipliers(line.applyRule, line, nights, roomsCount, relevantPax);
    totalCostSource += baseCost;
    return {
      id: line.id,
      label: line.label,
      amountSource: baseCost,
      amountDzd: baseCost * exchangeRate.rate,
      optional: line.optional,
    };
  });

  const totalCostDzd = totalCostSource * exchangeRate.rate;
  const marginTotal =
    paxCounts.single * margin.single +
    paxCounts.double * margin.double +
    paxCounts.triple * margin.triple +
    paxCounts.chdPlus6 * margin.chdPlus6 +
    paxCounts.chdMinus6 * margin.chdMinus6 +
    paxCounts.infant * margin.infant;
  const marginPercent = totalCostDzd ? (marginTotal / totalCostDzd) * 100 : 0;

  const commissionBasePax =
    commission.includeInfants === false ? totalPaxCount - paxCounts.infant : totalPaxCount;
  const tier = getCommissionTier(commissionBasePax);
  const commissionPerPax = commission[tier as keyof CommissionConfig] as number;
  const commissionTotal = commissionPerPax * commissionBasePax;

  const baseSales = totalCostDzd + marginTotal;
  const salesTotal = commission.includeInSales ? baseSales + commissionTotal : baseSales;
  const perPaxPrice = Math.round(salesTotal / Math.max(1, commissionBasePax) / 1000) * 1000;

  return {
    totalCostSource,
    totalCostDzd,
    marginTotal,
    marginPercent,
    commissionTotal,
    salesTotal,
    perPaxPrice,
    selectedRate: exchangeRate.rate,
    lineResults,
  };
}
