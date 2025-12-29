import type { TravelPackage, OpsProject, OpsGroup, PackageStatus } from "../types";
import type { Product, ProductHotelRate } from "../types/product";

const DEFAULT_RESPONSIBLE = "TravelOPS";

const formatDate = (value?: string) => value ?? "";

const mapStatus = (status: Product["status"]): PackageStatus =>
  status === "published" ? "published" : "draft";

const buildOpsProject = (product: Product): OpsProject => {
  const groups: OpsGroup[] = product.departures.map((departure, index) => ({
    id: departure.id || `dep-${index + 1}`,
    flightLabel: departure.flightPlan || departure.airline || `Depart ${index + 1}`,
    airline: departure.airlineOther || departure.airline,
    departureDate: departure.periodStart,
    returnDate: departure.periodEnd,
    status: "pending_validation",
    suppliers: [],
    costs: [],
    timeline: [],
  }));

  return {
    id: `ops-${product.id}`,
    packageId: product.id,
    groups,
  };
};

const rateLabel = (rate: ProductHotelRate): string => {
  switch (rate.category) {
    case "single":
      return "Single";
    case "double":
      return "Double";
    case "triple":
      return "Triple";
    case "baby":
      return "Baby";
    case "child1":
      return "Child 1";
    case "child2":
      return "Child 2";
    default:
      return "Rate";
  }
};

export const mapProductToTravelPackage = (product: Product): TravelPackage => {
  const primaryCity = product.hotels[0]?.city || "";
  const pricing = product.hotels.flatMap((hotel) =>
    hotel.rates.map((rate) => ({
      label: `${hotel.name || "Hotel"} ${rateLabel(rate)}`,
      unitPrice: rate.salePrice || rate.publicFromPrice || 0,
      commission: product.commission.adultDzd,
    }))
  );

  const itineraryDays = product.programDays.map((item, index) => ({
    dayNumber: index + 1,
    description: item,
  }));

  return {
    id: product.id,
    status: mapStatus(product.status),
    general: {
      productName: product.name,
      productCode: product.productId || "DRAFT",
      responsible: DEFAULT_RESPONSIBLE,
      creationDate: product.createdAt,
      stock: product.paxCount,
    },
    flights: {
      destination: primaryCity,
      cities: primaryCity ? [primaryCity] : [],
      flights: product.departures.map((departure) => ({
        airline: departure.airlineOther || departure.airline,
        departureDate: formatDate(departure.periodStart),
        returnDate: formatDate(departure.periodEnd),
        details: departure.flightPlan,
      })),
    },
    accommodations: product.hotels.map((hotel) => ({
      name: hotel.name,
      category: hotel.stars ? `${hotel.stars}*` : undefined,
      pension: hotel.pension,
      mapLink: hotel.mapLink,
    })),
    pricing,
    agencyCommissions: {
      adulte: { t1: product.commission.adultDzd, t2: product.commission.adultDzd, t3: product.commission.adultDzd },
      enfant: product.commission.childDzd,
      bebe: product.commission.infantDzd,
    },
    content: {
      included: product.servicesPackage.includes,
      excluded: [],
      excursionsIncluded: [],
      excursionsExtra: product.excursionsExtra,
    },
    itinerary: {
      active: product.programDays.length > 0,
      days: itineraryDays,
      partnerName: product.partner.name,
      emergencyContact: product.partner.phone,
    },
    opsProject: buildOpsProject(product),
  };
};

