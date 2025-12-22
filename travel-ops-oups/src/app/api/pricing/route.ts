import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { CostLine } from "@/lib/pricing/types";

const paxCategoryEnum = ["SINGLE", "DOUBLE", "TRIPLE", "CHD_PLUS6", "CHD_MINUS6", "INF"] as const;

const costLineSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  type: z.enum(["ROOM", "VISA", "TRANSFER", "EXCURSION", "TICKET", "SERVICE_FEE", "OTHER"]),
  applyRule: z.enum(["PER_PAX", "PER_ROOM", "PER_NIGHT", "PER_STAY", "PER_GROUP"]),
  amount: z.number().nonnegative(),
  quantity: z.number().int().positive().optional().default(1),
  appliesTo: z.array(z.enum(paxCategoryEnum)).or(z.literal("ALL")),
  optional: z.boolean().optional().default(false),
});

const marginSchema = z.object({
  single: z.number().nonnegative(),
  double: z.number().nonnegative(),
  triple: z.number().nonnegative(),
  chdPlus6: z.number().nonnegative(),
  chdMinus6: z.number().nonnegative(),
  infant: z.number().nonnegative(),
});

const commissionSchema = z.object({
  tier1: z.number().nonnegative(),
  tier2: z.number().nonnegative(),
  tier3: z.number().nonnegative(),
  tier4: z.number().nonnegative(),
  includeInfants: z.boolean(),
  includeInSales: z.boolean(),
});

const scenarioSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  destination: z.string().min(2),
  notes: z.string().optional(),
  nights: z.number().int().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currency: z.string().min(3),
  paxCounts: z.object({
    single: z.number().int().nonnegative(),
    double: z.number().int().nonnegative(),
    triple: z.number().int().nonnegative(),
    chdPlus6: z.number().int().nonnegative(),
    chdMinus6: z.number().int().nonnegative(),
    infant: z.number().int().nonnegative(),
  }),
  roomAllocation: z.object({
    singleRooms: z.number().int().nonnegative().optional(),
    doubleRooms: z.number().int().nonnegative().optional(),
    tripleRooms: z.number().int().nonnegative().optional(),
  }).partial().optional(),
  exchangeRate: z.object({
    source: z.enum(["AUTO", "MANUAL"]),
    rate: z.number().positive(),
    timestamp: z.string(),
  }),
  costLines: z.array(costLineSchema).min(1),
  margin: marginSchema,
  commission: commissionSchema,
});

const allCategories = paxCategoryEnum;

const normalizeCostLine = (line: z.infer<typeof costLineSchema>): CostLine => {
  return {
    id: line.id ?? crypto.randomUUID(),
    label: line.label,
    type: line.type,
    applyRule: line.applyRule,
    amount: line.amount,
    quantity: line.quantity ?? 1,
    appliesTo: line.appliesTo === "ALL" ? (allCategories as const) : line.appliesTo,
    optional: line.optional ?? false,
  };
};

export async function GET() {
  const scenarios = await prisma.pricingScenario.findMany({
    include: {
      paxBreakdown: true,
      exchangeRates: true,
      costLines: true,
      margin: true,
      commission: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(scenarios);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = scenarioSchema.parse(body);
  const normalizedLines = parsed.costLines.map(normalizeCostLine);
  const data = {
    name: parsed.name,
    destination: parsed.destination,
    notes: parsed.notes,
    nights: parsed.nights,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    currency: parsed.currency,
    state: "DRAFT" as const,
    paxBreakdown: {
      create: {
        single: parsed.paxCounts.single,
        double: parsed.paxCounts.double,
        triple: parsed.paxCounts.triple,
        chdPlus6: parsed.paxCounts.chdPlus6,
        chdMinus6: parsed.paxCounts.chdMinus6,
        infant: parsed.paxCounts.infant,
        roomAllocation: parsed.roomAllocation ? parsed.roomAllocation : null,
      },
    },
    exchangeRates: {
      create: {
        source: parsed.exchangeRate.source,
        rate: parsed.exchangeRate.rate,
        manual: parsed.exchangeRate.source === "MANUAL",
        timestamp: new Date(parsed.exchangeRate.timestamp),
      },
    },
    costLines: {
      create: normalizedLines.map((line) => ({
        id: line.id,
        label: line.label,
        type: line.type,
        applyRule: line.applyRule,
        amount: line.amount,
        quantity: line.quantity,
        optional: line.optional,
        appliesTo: line.appliesTo,
      })),
    },
    margin: {
      create: parsed.margin,
    },
    commission: {
      create: parsed.commission,
    },
  };

  const scenario = parsed.id
    ? await prisma.pricingScenario.update({
        where: { id: parsed.id },
        data,
      })
    : await prisma.pricingScenario.create({ data });

  return NextResponse.json(scenario);
}
