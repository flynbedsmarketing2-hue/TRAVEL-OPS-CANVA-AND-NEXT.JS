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
  publicFromPrice?: number;
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
  partner: {
    name?: string;
    phone?: string;
    whatsapp?: string;
  };
  createdAt: string;
  updatedAt: string;
}
