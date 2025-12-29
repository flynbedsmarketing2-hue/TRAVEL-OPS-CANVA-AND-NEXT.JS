import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const parseDate = (value?: string) => (value ? new Date(value) : null);

const mapProductType = (value?: string) => {
  switch (value) {
    case "maison":
    case "MAISON":
      return "MAISON";
    case "tiers":
    case "TIERS":
      return "TIERS";
    case "autre":
    case "AUTRE":
      return "AUTRE";
    default:
      return "MAISON";
  }
};

const mapStopMode = (value?: string) => {
  switch (value) {
    case "one_stop":
    case "ONE_STOP":
      return "ONE_STOP";
    case "multi_stops":
    case "MULTI_STOPS":
      return "MULTI_STOPS";
    default:
      return "ONE_STOP";
  }
};

const mapServiceMode = (value?: string) => {
  switch (value) {
    case "details":
    case "DETAILS":
      return "DETAILS";
    case "package":
    case "PACKAGE":
    default:
      return "PACKAGE";
  }
};

const mapRateCategory = (value?: string) => {
  switch (value) {
    case "single":
    case "SINGLE":
      return "SINGLE";
    case "double":
    case "DOUBLE":
      return "DOUBLE";
    case "triple":
    case "TRIPLE":
      return "TRIPLE";
    case "baby":
    case "BABY":
      return "BABY";
    case "child1":
    case "CHILD1":
      return "CHILD1";
    case "child2":
    case "CHILD2":
      return "CHILD2";
    default:
      return "SINGLE";
  }
};

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      departures: true,
      hotels: { include: { rates: true } },
      services: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        status: "DRAFT",
        productType: mapProductType(body.productType),
        nights: body.nights ?? 0,
        days: body.days ?? 0,
        name: body.name ?? "",
        paxCount: body.paxCount ?? 0,
        stopMode: mapStopMode(body.stopMode),
        commissionAdultDzd: body.commission?.adultDzd ?? 0,
        commissionChildDzd: body.commission?.childDzd ?? 0,
        commissionInfantDzd: body.commission?.infantDzd ?? 0,
        servicesMode: mapServiceMode(body.servicesMode),
        servicesPackagePrice: body.servicesPackage?.purchasePrice ?? 0,
        servicesPackageCurrency: body.servicesPackage?.currency ?? "DZD",
        servicesPackageRate: body.servicesPackage?.exchangeRate ?? 1,
        servicesPackageIncludes: body.servicesPackage?.includes ?? [],
        servicesOtherIncludes: body.servicesOtherIncludes ?? [],
        excursionsExtra: body.excursionsExtra ?? [],
        programDays: body.programDays ?? [],
        partnerName: body.partner?.name ?? null,
        partnerPhone: body.partner?.phone ?? null,
        partnerWhatsapp: body.partner?.whatsapp ?? null,
        departures: {
          create: (body.departures ?? []).map((departure: Record<string, unknown>) => ({
            airline: departure.airline ?? "",
            airlineOther: departure.airlineOther ?? null,
            purchasePriceDzd: Number(departure.purchasePriceDzd ?? 0),
            pnr: departure.pnr ?? null,
            documentUrl: departure.documentUrl ?? null,
            periodStart: parseDate(departure.periodStart as string | undefined),
            periodEnd: parseDate(departure.periodEnd as string | undefined),
            flightPlan: departure.flightPlan ?? null,
            freePaxEnabled: Boolean(departure.freePaxEnabled),
            freePaxCount: Number(departure.freePaxCount ?? 0),
            freePaxTaxesDzd: Number(departure.freePaxTaxesDzd ?? 0),
          })),
        },
        hotels: {
          create: (body.hotels ?? []).map((hotel: Record<string, unknown>) => ({
            city: hotel.city ?? "",
            name: hotel.name ?? "",
            mapLink: hotel.mapLink ?? null,
            stars: hotel.stars ?? null,
            pension: hotel.pension ?? "RO",
            contractUrl: hotel.contractUrl ?? null,
            rates: {
              create: (hotel.rates ?? []).map((rate: Record<string, unknown>) => ({
                category: mapRateCategory(rate.category as string | undefined),
                purchasePrice: Number(rate.purchasePrice ?? 0),
                currency: rate.currency ?? "DZD",
                exchangeRate: Number(rate.exchangeRate ?? 1),
                salePrice: Number(rate.salePrice ?? 0),
                comboLabel: rate.comboLabel ?? "",
                childAgeMin: rate.childAgeMin ?? null,
                childAgeMax: rate.childAgeMax ?? null,
                withBed: rate.withBed ?? null,
              })),
            },
          })),
        },
        services: {
          create: (body.servicesDetails ?? []).map((service: Record<string, unknown>) => ({
            name: service.name ?? "",
            purchasePrice: Number(service.purchasePrice ?? 0),
            currency: service.currency ?? "DZD",
            exchangeRate: Number(service.exchangeRate ?? 1),
          })),
        },
      },
      include: {
        departures: true,
        hotels: { include: { rates: true } },
        services: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product";
    console.error("Create product failed", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
