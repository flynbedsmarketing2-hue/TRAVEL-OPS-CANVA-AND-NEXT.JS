export type ProductStatus = "draft" | "published";

export type ProductType = "maison" | "tiers" | "autre";

export type StopMode = "one_stop" | "multi_stops";

export type PensionType = "RO" | "BB" | "HB" | "FB" | "AI" | "UAI";

export type ServiceMode = "package" | "details";

export type HotelRateCategory =
  | "single"
  | "double"
  | "triple"
  | "baby"
  | "child1"
  | "child2";

export type MaisonScenario1TripType = "Une seule ville" | "Circuit / Combiné";

export type MaisonScenario1PricingMode = "Par sortie" | "Par bundle";

export type MaisonScenario1Currency = "DZD" | "EUR" | "USD";

export interface MaisonScenario1Departure {
  id: string;
  airline: string;
  airlineOther?: string;
  dateFrom?: string;
  dateTo?: string;
  flightPlan?: string;
  purchasePriceDZD: number;
  contractPNR?: string;
  freeSeatsCount?: number;
  freeSeatTaxesToPay?: number;
}

export interface MaisonScenario1PriceLine {
  id: string;
  label: string;
  ageRange?: string;
  purchaseAmount: number;
  notes?: string;
}

export interface MaisonScenario1Hotel {
  id: string;
  hotelName: string;
  currency: MaisonScenario1Currency;
  exchangeRate?: number;
  priceLines: MaisonScenario1PriceLine[];
  stars?: number;
  board?: string;
  googleMapsLink?: string;
}

export interface MaisonScenario1City {
  id: string;
  cityName: string;
  hotels: MaisonScenario1Hotel[];
}

export interface MaisonScenario1ServicePricing {
  purchasePrice: number;
  currency: MaisonScenario1Currency;
  exchangeRate?: number;
}

export interface MaisonScenario1ExtraService extends MaisonScenario1ServicePricing {
  id: string;
  serviceName: string;
}

export interface MaisonScenario1Excursion {
  id: string;
  name: string;
  source?: string;
  purchasePrice: number;
  notes?: string;
}

export interface MaisonScenario1 {
  productType: "Produit Maison (Flynbeds)";
  productName: string;
  productCode: string;
  duration: { nightsNN: number; daysJJ: number };
  departures: MaisonScenario1Departure[];
  tripType: MaisonScenario1TripType;
  accommodation: MaisonScenario1City[];
  commissions: { commissionAdult: number; commissionChild: number; commissionBaby: number };
  services: {
    airportTransferEnabled: boolean;
    airportTransfer?: MaisonScenario1ServicePricing;
    visaEnabled: boolean;
    visa?: MaisonScenario1ServicePricing;
    extraServices: MaisonScenario1ExtraService[];
  };
  excursions: {
    includedExcursionsList: string;
    pricingMode: MaisonScenario1PricingMode;
    excursions: MaisonScenario1Excursion[];
    extraExcursionsList: string;
  };
  program: {
    dayByDayProgram: string;
    practicalNotes?: string;
    uploads: string[];
  };
  designer: {
    designerName: string;
    designerEmail: string;
    designerPhone: string;
  };
}

export interface ProductDeparture {
  id: string;
  airline: string;
  airlineOther?: string;
  purchasePriceDzd: number;
  pnr?: string;
  documentUrl?: string;
  periodStart?: string;
  periodEnd?: string;
  flightPlan?: string;
  freePaxEnabled: boolean;
  freePaxCount: number;
  freePaxTaxesDzd: number;
}

export interface ProductHotelRate {
  id: string;
  category: HotelRateCategory;
  purchasePrice: number;
  currency: string;
  exchangeRate: number;
  salePrice: number;
  comboLabel: string;
  childAgeMin?: number;
  childAgeMax?: number;
  withBed?: boolean;
}

export interface ProductHotel {
  id: string;
  city: string;
  name: string;
  mapLink?: string;
  stars?: number;
  pension: PensionType;
  contractUrl?: string;
  rates: ProductHotelRate[];
}

export interface ProductService {
  id: string;
  name: string;
  purchasePrice: number;
  currency: string;
  exchangeRate: number;
}

export interface Product {
  id: string;
  productId?: string;
  status: ProductStatus;
  productType: ProductType;
  nights: number;
  days: number;
  name: string;
  paxCount: number;
  stopMode: StopMode;
  departures: ProductDeparture[];
  hotels: ProductHotel[];
  commission: {
    adultDzd: number;
    childDzd: number;
    infantDzd: number;
  };
  servicesMode: ServiceMode;
  servicesPackage: {
    purchasePrice: number;
    currency: string;
    exchangeRate: number;
    includes: string[];
  };
  servicesDetails: ProductService[];
  servicesOtherIncludes: string[];
  excursionsExtra: string[];
  programDays: string[];
  maisonScenario1?: MaisonScenario1;
  partner: {
    name?: string;
    phone?: string;
    whatsapp?: string;
  };
  createdAt: string;
  updatedAt: string;
}
