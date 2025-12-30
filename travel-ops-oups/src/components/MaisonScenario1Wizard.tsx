"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Minus, Plus, Trash2, Upload } from "lucide-react";
import type {
  MaisonScenario1,
  MaisonScenario1City,
  MaisonScenario1Currency,
  MaisonScenario1Departure,
  MaisonScenario1Excursion,
  MaisonScenario1ExtraService,
  MaisonScenario1Hotel,
  MaisonScenario1PriceLine,
  MaisonScenario1PricingMode,
  MaisonScenario1TripType,
  Product,
} from "../types/product";
import { useProductStore } from "../stores/useProductStore";
import { cn } from "./ui/cn";

type DraftProduct = Omit<Product, "id" | "productId" | "createdAt" | "updatedAt"> & {
  productId?: string;
};

type Props = {
  initialProduct?: Product | null;
};

const STEP_LABELS = [
  "Identite produit",
  "Transport aerien",
  "Type de voyage",
  "Hebergement",
  "Commissions",
  "Services inclus",
  "Excursions",
  "Programme & contenu",
  "Concepteur",
];

const CURRENCY_OPTIONS: MaisonScenario1Currency[] = ["DZD", "EUR", "USD"];
const BOARD_OPTIONS = ["RO", "BB", "HB", "FB", "AI", "UAI"];
const AIRLINE_OPTIONS = ["Air Algerie", "Turkish Airlines", "Pegasus", "Qatar Airways", "Emirates", "Autre"];

const formatTwo = (value: number) => `${Math.max(0, value)}`.padStart(2, "0");

const generateProductCode = () => {
  const today = new Date();
  const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MAISON-${stamp}-${rand}`;
};

const createDeparture = (): MaisonScenario1Departure => ({
  id: crypto.randomUUID(),
  airline: "",
  airlineOther: "",
  dateFrom: "",
  dateTo: "",
  flightPlan: "",
  purchasePriceDZD: 0,
  contractPNR: "",
  freeSeatsCount: undefined,
  freeSeatTaxesToPay: undefined,
});

const createPriceLine = (): MaisonScenario1PriceLine => ({
  id: crypto.randomUUID(),
  label: "",
  ageRange: "",
  purchaseAmount: 0,
  notes: "",
});

const createHotel = (): MaisonScenario1Hotel => ({
  id: crypto.randomUUID(),
  hotelName: "",
  currency: "DZD",
  exchangeRate: 1,
  priceLines: [createPriceLine()],
  stars: undefined,
  board: "RO",
  googleMapsLink: "",
});

const createCity = (): MaisonScenario1City => ({
  id: crypto.randomUUID(),
  cityName: "",
  hotels: [createHotel()],
});

const createExtraService = (): MaisonScenario1ExtraService => ({
  id: crypto.randomUUID(),
  serviceName: "",
  purchasePrice: 0,
  currency: "DZD",
  exchangeRate: 1,
});

const createExcursion = (): MaisonScenario1Excursion => ({
  id: crypto.randomUUID(),
  name: "",
  source: "",
  purchasePrice: 0,
  notes: "",
});

const createScenarioDraft = (seed?: MaisonScenario1): MaisonScenario1 => ({
  productType: "Produit Maison (Flynbeds)",
  productName: seed?.productName ?? "",
  productCode: seed?.productCode ?? generateProductCode(),
  duration: {
    nightsNN: seed?.duration?.nightsNN ?? 7,
    daysJJ: seed?.duration?.daysJJ ?? 8,
  },
  departures: seed?.departures?.length ? seed.departures : [createDeparture()],
  tripType: seed?.tripType ?? "Une seule ville",
  accommodation: seed?.accommodation?.length ? seed.accommodation : [createCity()],
  commissions: {
    commissionAdult: seed?.commissions?.commissionAdult ?? 0,
    commissionChild: seed?.commissions?.commissionChild ?? 0,
    commissionBaby: seed?.commissions?.commissionBaby ?? 0,
  },
  services: {
    airportTransferEnabled: seed?.services?.airportTransferEnabled ?? false,
    airportTransfer: seed?.services?.airportTransfer ?? { purchasePrice: 0, currency: "DZD", exchangeRate: 1 },
    visaEnabled: seed?.services?.visaEnabled ?? false,
    visa: seed?.services?.visa ?? { purchasePrice: 0, currency: "DZD", exchangeRate: 1 },
    extraServices: seed?.services?.extraServices?.length ? seed.services.extraServices : [],
  },
  excursions: {
    includedExcursionsList: seed?.excursions?.includedExcursionsList ?? "",
    pricingMode: seed?.excursions?.pricingMode ?? "Par sortie",
    excursions: seed?.excursions?.excursions?.length ? seed.excursions.excursions : [],
    extraExcursionsList: seed?.excursions?.extraExcursionsList ?? "",
  },
  program: {
    dayByDayProgram: seed?.program?.dayByDayProgram ?? "",
    practicalNotes: seed?.program?.practicalNotes ?? "",
    uploads: seed?.program?.uploads ?? [],
  },
  designer: {
    designerName: seed?.designer?.designerName ?? "",
    designerEmail: seed?.designer?.designerEmail ?? "",
    designerPhone: seed?.designer?.designerPhone ?? "",
  },
});

const createBaseDraft = (): DraftProduct => ({
  status: "draft",
  productType: "maison",
  nights: 0,
  days: 0,
  name: "",
  paxCount: 0,
  stopMode: "one_stop",
  departures: [],
  hotels: [],
  commission: {
    adultDzd: 0,
    childDzd: 0,
    infantDzd: 0,
  },
  servicesMode: "package",
  servicesPackage: {
    purchasePrice: 0,
    currency: "DZD",
    exchangeRate: 1,
    includes: [],
  },
  servicesDetails: [],
  servicesOtherIncludes: [],
  excursionsExtra: [],
  programDays: [],
  partner: {
    name: "",
    phone: "",
    whatsapp: "",
  },
  maisonScenario1: createScenarioDraft(),
});

const isValidUrl = (value: string) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.host);
  } catch {
    return false;
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

type ValidationResult = { errors: string[]; fieldErrors: Record<string, string> };

const validateScenario = (scenario: MaisonScenario1): ValidationResult => {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  const pushField = (key: string, message: string) => {
    if (!fieldErrors[key]) fieldErrors[key] = message;
  };

  if (!scenario.productName.trim()) {
    errors.push("Nom produit requis.");
    pushField("productName", "Champ requis.");
  }
  if (scenario.duration.nightsNN <= 0) {
    errors.push("Nombre de nuites invalide.");
    pushField("duration.nightsNN", "Obligatoire.");
  }
  if (scenario.duration.daysJJ <= 0) {
    errors.push("Nombre de jours invalide.");
    pushField("duration.daysJJ", "Obligatoire.");
  }
  if (!scenario.departures.length) {
    errors.push("Au moins un depart est requis.");
  }

  scenario.departures.forEach((departure, index) => {
    if (!departure.airline.trim()) {
      pushField(`departures.${index}.airline`, "Champ requis.");
    }
    if (departure.freeSeatsCount && departure.freeSeatsCount > 0) {
      if (departure.freeSeatTaxesToPay === undefined || departure.freeSeatTaxesToPay < 0) {
        pushField(`departures.${index}.freeSeatTaxesToPay`, "Taxes requises.");
      }
    }
    if (departure.purchasePriceDZD < 0) {
      pushField(`departures.${index}.purchasePriceDZD`, "Doit etre >= 0.");
    }
  });

  scenario.accommodation.forEach((city, cityIndex) => {
    if (!city.cityName.trim()) {
      pushField(`accommodation.${cityIndex}.cityName`, "Champ requis.");
    }
    city.hotels.forEach((hotel, hotelIndex) => {
      if (!hotel.hotelName.trim()) {
        pushField(`accommodation.${cityIndex}.hotels.${hotelIndex}.hotelName`, "Champ requis.");
      }
      if (!hotel.googleMapsLink || !isValidUrl(hotel.googleMapsLink)) {
        pushField(`accommodation.${cityIndex}.hotels.${hotelIndex}.googleMapsLink`, "Lien requis.");
      }
      if (hotel.currency !== "DZD" && (!hotel.exchangeRate || hotel.exchangeRate <= 0)) {
        pushField(`accommodation.${cityIndex}.hotels.${hotelIndex}.exchangeRate`, "Taux requis.");
      }
      if (!hotel.priceLines.length) {
        errors.push("Au moins une ligne de prix par hotel.");
      }
      hotel.priceLines.forEach((line, lineIndex) => {
        if (!line.label.trim()) {
          pushField(
            `accommodation.${cityIndex}.hotels.${hotelIndex}.priceLines.${lineIndex}.label`,
            "Champ requis."
          );
        }
        if (line.purchaseAmount < 0) {
          pushField(
            `accommodation.${cityIndex}.hotels.${hotelIndex}.priceLines.${lineIndex}.purchaseAmount`,
            "Doit etre >= 0."
          );
        }
        const labelLower = line.label.toLowerCase();
        const requiresAge =
          labelLower.includes("enfant") ||
          labelLower.includes("bebe") ||
          labelLower.includes("child") ||
          labelLower.includes("baby");
        if (requiresAge && !line.ageRange?.trim()) {
          pushField(
            `accommodation.${cityIndex}.hotels.${hotelIndex}.priceLines.${lineIndex}.ageRange`,
            "Age requis."
          );
        }
      });
    });
  });

  if (scenario.commissions.commissionAdult < 0) {
    pushField("commissions.adult", "Doit etre >= 0.");
  }
  if (scenario.commissions.commissionChild < 0) {
    pushField("commissions.child", "Doit etre >= 0.");
  }
  if (scenario.commissions.commissionBaby < 0) {
    pushField("commissions.baby", "Doit etre >= 0.");
  }

  if (scenario.services.airportTransferEnabled) {
    const transfer = scenario.services.airportTransfer;
    if (!transfer) {
      pushField("services.airportTransfer", "Prix requis.");
    } else if (transfer.currency !== "DZD" && (!transfer.exchangeRate || transfer.exchangeRate <= 0)) {
      pushField("services.airportTransfer.exchangeRate", "Taux requis.");
    }
  }
  if (scenario.services.visaEnabled) {
    const visa = scenario.services.visa;
    if (!visa) {
      pushField("services.visa", "Prix requis.");
    } else if (visa.currency !== "DZD" && (!visa.exchangeRate || visa.exchangeRate <= 0)) {
      pushField("services.visa.exchangeRate", "Taux requis.");
    }
  }
  scenario.services.extraServices.forEach((service, index) => {
    if (!service.serviceName.trim()) {
      pushField(`services.extraServices.${index}.serviceName`, "Champ requis.");
    }
    if (service.currency !== "DZD" && (!service.exchangeRate || service.exchangeRate <= 0)) {
      pushField(`services.extraServices.${index}.exchangeRate`, "Taux requis.");
    }
  });

  scenario.excursions.excursions.forEach((excursion, index) => {
    if (!excursion.name.trim()) {
      pushField(`excursions.${index}.name`, "Champ requis.");
    }
    if (excursion.purchasePrice < 0) {
      pushField(`excursions.${index}.purchasePrice`, "Doit etre >= 0.");
    }
  });

  if (!scenario.program.dayByDayProgram.trim()) {
    errors.push("Programme jour par jour requis.");
    pushField("program.dayByDayProgram", "Champ requis.");
  }

  if (!scenario.designer.designerName.trim()) {
    errors.push("Nom du concepteur requis.");
    pushField("designer.designerName", "Champ requis.");
  }
  if (!scenario.designer.designerEmail.trim()) {
    errors.push("Email du concepteur requis.");
    pushField("designer.designerEmail", "Champ requis.");
  }
  if (!scenario.designer.designerPhone.trim()) {
    errors.push("Telephone du concepteur requis.");
    pushField("designer.designerPhone", "Champ requis.");
  }

  return { errors, fieldErrors };
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-[var(--token-danger,#b42318)]">{message}</p> : null;

const formatDate = (value?: string) => value ?? "-";

const buildSummaryHtml = (scenario: MaisonScenario1) => {
  const departureRows = scenario.departures
    .map(
      (dep, index) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${index + 1}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
          dep.airlineOther || dep.airline || "-"
        )}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${formatDate(
          dep.dateFrom
        )} - ${formatDate(dep.dateTo)}</td>
      </tr>`
    )
    .join("");

  const hotelLines = scenario.accommodation
    .map((city) =>
      city.hotels
        .map(
          (hotel) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
            city.cityName || "-"
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
            hotel.hotelName || "-"
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
            hotel.board || "-"
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${
            hotel.stars ? `${hotel.stars}*` : "-"
          }</td>
        </tr>`
        )
        .join("")
    )
    .join("");

  return `
    <section style="page-break-after:always;">
      <div style="border:2px solid var(--token-border, #e5e5e5);border-radius:16px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:var(--token-muted,#777777);">Scenario 1</div>
            <div style="font-size:22px;font-weight:800;margin-top:4px;color:var(--token-text,#111111);">${escapeHtml(
              scenario.productName || "Produit Maison"
            )}</div>
            <div style="margin-top:6px;font-size:12px;color:var(--token-muted,#777777);">
              Code: <strong style="color:var(--token-text,#111111);">${escapeHtml(
                scenario.productCode || "-"
              )}</strong>
            </div>
            <div style="margin-top:6px;font-size:12px;color:var(--token-muted,#777777);">
              Duree: <strong style="color:var(--token-text,#111111);">${scenario.duration.nightsNN}N / ${
    scenario.duration.daysJJ
  }J</strong>
            </div>
          </div>
          <div style="text-align:right;font-size:12px;color:var(--token-muted,#777777);">
            <div>Type voyage</div>
            <div style="font-weight:700;color:var(--token-text,#111111);">${escapeHtml(
              scenario.tripType
            )}</div>
          </div>
        </div>
      </div>
      <div style="margin-top:18px;">
        <h3 style="margin:0 0 6px;font-size:14px;font-weight:800;">Departs</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">#</th>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Compagnie</th>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Periode</th>
            </tr>
          </thead>
          <tbody>${departureRows || `<tr><td colspan="3" style="padding:6px 8px;">-</td></tr>`}</tbody>
        </table>
      </div>
      <div style="margin-top:18px;">
        <h3 style="margin:0 0 6px;font-size:14px;font-weight:800;">Hotels</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Ville</th>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Hotel</th>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Pension</th>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Etoiles</th>
            </tr>
          </thead>
          <tbody>${hotelLines || `<tr><td colspan="4" style="padding:6px 8px;">-</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
};

const buildDeparturesHtml = (scenario: MaisonScenario1) =>
  scenario.departures
    .map(
      (departure, index) => `
      <section style="margin-bottom:18px;">
        <h3 style="margin:0 0 6px;font-size:14px;font-weight:800;">Depart ${index + 1}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tbody>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);width:35%;">Compagnie</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                departure.airlineOther || departure.airline || "-"
              )}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Periode</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${formatDate(
                departure.dateFrom
              )} - ${formatDate(departure.dateTo)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Plan de vol</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                departure.flightPlan || "-"
              )}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Prix achat (DZD)</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${departure.purchasePriceDZD}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">PNR/Contrat</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                departure.contractPNR || "-"
              )}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Places gratuites</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${
                departure.freeSeatsCount ?? 0
              } (Taxes: ${departure.freeSeatTaxesToPay ?? 0})</td>
            </tr>
          </tbody>
        </table>
      </section>
    `
    )
    .join("");

const buildAccommodationHtml = (scenario: MaisonScenario1) =>
  scenario.accommodation
    .map(
      (city) => `
      <section style="margin-bottom:16px;">
        <h3 style="margin:0 0 6px;font-size:14px;font-weight:800;">Ville: ${escapeHtml(
          city.cityName || "-"
        )}</h3>
        ${city.hotels
          .map(
            (hotel) => `
            <div style="border:1px solid var(--token-border, #e5e5e5);border-radius:12px;padding:10px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;gap:12px;">
                <div style="font-weight:700;">${escapeHtml(hotel.hotelName || "-")}</div>
                <div style="font-size:12px;color:var(--token-muted,#777777);">${escapeHtml(
                  hotel.board || "-"
                )} ${hotel.stars ? `| ${hotel.stars}*` : ""}</div>
              </div>
              <div style="font-size:11px;color:var(--token-muted,#777777);margin-top:4px;">${escapeHtml(
                hotel.googleMapsLink || "-"
              )}</div>
              <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;">
                <thead>
                  <tr>
                    <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Label</th>
                    <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Age</th>
                    <th style="text-align:right;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Achat</th>
                    <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${hotel.priceLines
                    .map(
                      (line) => `
                    <tr>
                      <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                        line.label || "-"
                      )}</td>
                      <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                        line.ageRange || "-"
                      )}</td>
                      <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);text-align:right;">${line.purchaseAmount} ${
                        hotel.currency
                      }</td>
                      <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                        line.notes || "-"
                      )}</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
          )
          .join("")}
      </section>
    `
    )
    .join("");

export default function MaisonScenario1Wizard({ initialProduct }: Props) {
  const router = useRouter();
  const { createDraft, updateDraft, publishProduct } = useProductStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState(initialProduct?.id ?? "");
  const [draft, setDraft] = useState<DraftProduct>(() => {
    if (!initialProduct) return createBaseDraft();
    return {
      ...initialProduct,
      maisonScenario1: createScenarioDraft(initialProduct.maisonScenario1),
    };
  });

  const scenario = draft.maisonScenario1 ?? createScenarioDraft();
  const { errors, fieldErrors } = useMemo(() => validateScenario(scenario), [scenario]);

  const updateScenario = (update: Partial<MaisonScenario1>) =>
    setDraft((prev) => ({ ...prev, maisonScenario1: { ...(prev.maisonScenario1 ?? scenario), ...update } }));

  const updateDeparture = (index: number, update: Partial<MaisonScenario1Departure>) =>
    updateScenario({
      departures: scenario.departures.map((dep, idx) => (idx === index ? { ...dep, ...update } : dep)),
    });

  const updateCity = (index: number, update: Partial<MaisonScenario1City>) =>
    updateScenario({
      accommodation: scenario.accommodation.map((city, idx) => (idx === index ? { ...city, ...update } : city)),
    });

  const updateHotel = (cityIndex: number, hotelIndex: number, update: Partial<MaisonScenario1Hotel>) =>
    updateScenario({
      accommodation: scenario.accommodation.map((city, idx) => {
        if (idx !== cityIndex) return city;
        const hotels = city.hotels.map((hotel, hIdx) => (hIdx === hotelIndex ? { ...hotel, ...update } : hotel));
        return { ...city, hotels };
      }),
    });

  const updatePriceLine = (
    cityIndex: number,
    hotelIndex: number,
    lineIndex: number,
    update: Partial<MaisonScenario1PriceLine>
  ) =>
    updateScenario({
      accommodation: scenario.accommodation.map((city, idx) => {
        if (idx !== cityIndex) return city;
        const hotels = city.hotels.map((hotel, hIdx) => {
          if (hIdx !== hotelIndex) return hotel;
          const priceLines = hotel.priceLines.map((line, lIdx) => (lIdx === lineIndex ? { ...line, ...update } : line));
          return { ...hotel, priceLines };
        });
        return { ...city, hotels };
      }),
    });

  const updateExtraService = (index: number, update: Partial<MaisonScenario1ExtraService>) =>
    updateScenario({
      services: {
        ...scenario.services,
        extraServices: scenario.services.extraServices.map((service, idx) => (idx === index ? { ...service, ...update } : service)),
      },
    });

  const updateExcursion = (index: number, update: Partial<MaisonScenario1Excursion>) =>
    updateScenario({
      excursions: {
        ...scenario.excursions,
        excursions: scenario.excursions.excursions.map((exc, idx) => (idx === index ? { ...exc, ...update } : exc)),
      },
    });

  const buildPayload = (status: Product["status"]) => {
    const tripType = scenario.tripType;
    return {
      ...draft,
      status,
      productType: "maison",
      name: scenario.productName,
      nights: scenario.duration.nightsNN,
      days: scenario.duration.daysJJ,
      stopMode: tripType === "Circuit / Combiné" ? "multi_stops" : "one_stop",
      maisonScenario1: scenario,
    };
  };

  const saveDraft = async () => {
    setSaving(true);
    setActionError(null);
    try {
      const payload = buildPayload("draft");
      if (!draftId) {
        const created = await createDraft(payload);
        setDraftId(created.id);
        router.replace(`/packages/${created.id}`);
      } else {
        await updateDraft(draftId, payload);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de sauvegarder.";
      setActionError(message);
    } finally {
      setSaving(false);
    }
  };

  const generatePdf = async (payload: MaisonScenario1) => {
    const html2pdf = (await import("html2pdf.js")).default as unknown as () => {
      set: (options: unknown) => unknown;
      from: (element: HTMLElement) => unknown;
      toPdf: () => {
        get: (
          key: "pdf"
        ) => Promise<{
          internal: { getNumberOfPages: () => number; pageSize: { getWidth: () => number; getHeight: () => number } };
          setPage: (n: number) => void;
          setFontSize: (n: number) => void;
          setTextColor: (n: number) => void;
          text: (text: string, x: number, y: number, options?: { align?: "left" | "center" | "right" }) => void;
        }>;
        save: () => void;
      };
    };

    const root = document.createElement("div");
    root.style.width = "794px";
    root.style.padding = "20mm";
    root.style.fontFamily = "Arial";
    root.style.color = "var(--token-text, #111111)";

    const pages = [
      buildSummaryHtml(payload),
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Identite produit</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tbody>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);width:35%;">Nom</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(payload.productName || "-")}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Code</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(payload.productCode || "-")}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Duree</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${payload.duration.nightsNN}N / ${payload.duration.daysJJ}J</td></tr>
          </tbody>
        </table>
      </section>`,
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Transport aerien</h2>${buildDeparturesHtml(
        payload
      )}</section>`,
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Type de voyage</h2>
        <p style="font-size:12px;">${escapeHtml(payload.tripType)}</p>
      </section>`,
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Hebergement</h2>${buildAccommodationHtml(
        payload
      )}</section>`,
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Commissions</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tbody>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Adulte</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${payload.commissions.commissionAdult}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Enfant</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${payload.commissions.commissionChild}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Bebe</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${payload.commissions.commissionBaby}</td></tr>
          </tbody>
        </table>
      </section>`,
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Services inclus</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tbody>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Transfert aeroport</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${
              payload.services.airportTransferEnabled
                ? `${payload.services.airportTransfer?.purchasePrice ?? 0} ${payload.services.airportTransfer?.currency ?? "DZD"}`
                : "Non"
            }</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Visa</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${
              payload.services.visaEnabled
                ? `${payload.services.visa?.purchasePrice ?? 0} ${payload.services.visa?.currency ?? "DZD"}`
                : "Non"
            }</td></tr>
          </tbody>
        </table>
        ${
          payload.services.extraServices.length
            ? `<div style="margin-top:10px;">
                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                  <thead><tr>
                    <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Service</th>
                    <th style="text-align:right;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Achat</th>
                  </tr></thead>
                  <tbody>
                    ${payload.services.extraServices
                      .map(
                        (service) => `
                      <tr>
                        <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                          service.serviceName || "-"
                        )}</td>
                        <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);text-align:right;">${service.purchasePrice} ${service.currency}</td>
                      </tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>`
            : ""
        }
      </section>`,
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Excursions</h2>
        <p style="font-size:12px;white-space:pre-wrap;">${escapeHtml(
          payload.excursions.includedExcursionsList || "-"
        )}</p>
        ${
          payload.excursions.pricingMode === "Par sortie" && payload.excursions.excursions.length
            ? `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:10px;">
              <thead><tr>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Nom</th>
                <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Source</th>
                <th style="text-align:right;padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);background:var(--token-surface-2, #f7f7f7);">Achat</th>
              </tr></thead>
              <tbody>
                ${payload.excursions.excursions
                  .map(
                    (exc) => `
                  <tr>
                    <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                      exc.name || "-"
                    )}</td>
                    <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
                      exc.source || "-"
                    )}</td>
                    <td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);text-align:right;">${exc.purchasePrice}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
            : ""
        }
        <div style="margin-top:10px;font-size:12px;white-space:pre-wrap;">${escapeHtml(
          payload.excursions.extraExcursionsList || "-"
        )}</div>
      </section>`,
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Programme</h2>
        <p style="font-size:12px;white-space:pre-wrap;">${escapeHtml(
          payload.program.dayByDayProgram || "-"
        )}</p>
        ${
          payload.program.practicalNotes
            ? `<p style="margin-top:10px;font-size:12px;white-space:pre-wrap;">${escapeHtml(
                payload.program.practicalNotes
              )}</p>`
            : ""
        }
        ${
          payload.program.uploads.length
            ? `<div style="margin-top:10px;font-size:11px;color:var(--token-muted,#777777);">Uploads: ${payload.program.uploads
                .map((file) => escapeHtml(file))
                .join(", ")}</div>`
            : ""
        }
      </section>`,
      `<section><h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Concepteur</h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tbody>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Nom</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
              payload.designer.designerName || "-"
            )}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Email</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
              payload.designer.designerEmail || "-"
            )}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">Telephone</td><td style="padding:6px 8px;border-bottom:1px solid var(--token-border, #e5e5e5);">${escapeHtml(
              payload.designer.designerPhone || "-"
            )}</td></tr>
          </tbody>
        </table>
      </section>`,
      `<section style="margin-top:18px;">
        <h2 style="font-size:16px;font-weight:800;margin:0 0 10px;">Signature</h2>
        <div style="display:flex;justify-content:space-between;gap:20px;">
          <div style="flex:1;border:1px dashed var(--token-border,#e5e5e5);padding:18px;border-radius:12px;">Prepare par</div>
          <div style="flex:1;border:1px dashed var(--token-border,#e5e5e5);padding:18px;border-radius:12px;">Valide par</div>
          <div style="flex:1;border:1px dashed var(--token-border,#e5e5e5);padding:18px;border-radius:12px;">Date</div>
        </div>
      </section>`,
    ];

    root.innerHTML = pages.join('<div style="page-break-after:always;"></div>');

    const safeName = payload.productName.trim().replace(/[^A-Za-z0-9-_]+/g, "_") || "produit";
    const filename = `${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    const generatedAt = new Date().toLocaleString("fr-FR");

    const worker = html2pdf()
      .set({
        margin: 20,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { format: "a4", orientation: "portrait", unit: "mm" },
      })
      .from(root)
      .toPdf();

    const pdf = await (worker as unknown as {
      get: (
        key: "pdf"
      ) => Promise<{
        internal: { getNumberOfPages: () => number; pageSize: { getWidth: () => number; getHeight: () => number } };
        setPage: (n: number) => void;
        setFontSize: (n: number) => void;
        setTextColor: (n: number) => void;
        text: (text: string, x: number, y: number, options?: { align?: "left" | "center" | "right" }) => void;
      }>;
    }).get("pdf");
    const total = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= total; i += 1) {
      pdf.setPage(i);
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text("TravelOPS", 12, h - 10);
      pdf.text(`${generatedAt}`, w / 2, h - 10, { align: "center" });
      pdf.text(`Page ${i}/${total}`, w - 12, h - 10, { align: "right" });
    }
    (worker as unknown as { save: () => void }).save();
  };

  const handlePublish = async () => {
    if (errors.length) return;
    setSaving(true);
    setActionError(null);
    try {
      const payload = buildPayload("draft");
      let id = draftId;
      if (id) {
        await updateDraft(id, payload);
      } else {
        const created = await createDraft(payload);
        id = created.id;
        setDraftId(created.id);
        router.replace(`/packages/${created.id}`);
      }
      if (id) {
        await publishProduct(id);
      }
      await generatePdf(scenario);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de publier. Verifie les champs puis reessaie.";
      setActionError(message);
    } finally {
      setSaving(false);
    }
  };

  const stepDisabled = false;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
      <aside className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
        {STEP_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm",
              step === index
                ? "border-[var(--token-accent)]/40 bg-[var(--token-accent)]/10"
                : "border-[var(--border)] bg-[var(--surface-2)]"
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs">
              {formatTwo(index + 1)}
            </span>
            <span className="font-semibold">{label}</span>
          </button>
        ))}
      </aside>

      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Scenario 1</p>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Produit Maison (Flynbeds)</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)]"
              disabled={saving}
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="rounded-full bg-[var(--token-text)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)]"
              disabled={saving || errors.length > 0}
            >
              Enregistrer & Generer PDF
            </button>
          </div>
        </header>

        {errors.length ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text)]">
            <div className="flex items-center gap-2 font-semibold">
              <Trash2 className="h-4 w-4" />
              Blocages publication
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {actionError ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text)]">
            <div className="flex items-center gap-2 font-semibold">
              <Trash2 className="h-4 w-4" />
              Action impossible
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">{actionError}</p>
          </div>
        ) : null}

        {step === 0 ? (
          <div className="section-shell space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Identite produit</h2>
            <label className="text-sm font-semibold">
              Type produit
              <input
                value={scenario.productType}
                readOnly
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]"
              />
            </label>
            <label className="text-sm font-semibold">
              Nom produit
              <input
                value={scenario.productName}
                onChange={(event) => updateScenario({ productName: event.target.value })}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
              <FieldError message={fieldErrors.productName} />
            </label>
            <label className="text-sm font-semibold">
              Code produit
              <input
                value={scenario.productCode}
                readOnly
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Nuitees (NN)
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateScenario({
                        duration: { ...scenario.duration, nightsNN: Math.max(0, scenario.duration.nightsNN - 1) },
                      })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={scenario.duration.nightsNN}
                    onChange={(event) =>
                      updateScenario({ duration: { ...scenario.duration, nightsNN: Number(event.target.value) } })
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-center text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateScenario({ duration: { ...scenario.duration, nightsNN: scenario.duration.nightsNN + 1 } })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <FieldError message={fieldErrors["duration.nightsNN"]} />
              </label>
              <label className="text-sm font-semibold">
                Jours (JJ)
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateScenario({
                        duration: { ...scenario.duration, daysJJ: Math.max(0, scenario.duration.daysJJ - 1) },
                      })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={scenario.duration.daysJJ}
                    onChange={(event) =>
                      updateScenario({ duration: { ...scenario.duration, daysJJ: Number(event.target.value) } })
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-center text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateScenario({ duration: { ...scenario.duration, daysJJ: scenario.duration.daysJJ + 1 } })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <FieldError message={fieldErrors["duration.daysJJ"]} />
              </label>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="section-shell space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Transport aerien</h2>
            {scenario.departures.map((departure, index) => (
              <div
                key={departure.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Depart {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (scenario.departures.length <= 1) return;
                      updateScenario({ departures: scenario.departures.filter((_, idx) => idx !== index) });
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                    disabled={scenario.departures.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Compagnie
                    <select
                      value={departure.airline}
                      onChange={(event) => updateDeparture(index, { airline: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="">Selectionner</option>
                      {AIRLINE_OPTIONS.map((airline) => (
                        <option key={airline} value={airline}>
                          {airline}
                        </option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors[`departures.${index}.airline`]} />
                  </label>
                  {departure.airline === "Autre" ? (
                    <label className="text-sm font-semibold">
                      Compagnie (autre)
                      <input
                        value={departure.airlineOther ?? ""}
                        onChange={(event) => updateDeparture(index, { airlineOther: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      />
                    </label>
                  ) : null}
                  <label className="text-sm font-semibold">
                    Date debut
                    <input
                      type="date"
                      value={departure.dateFrom ?? ""}
                      onChange={(event) => updateDeparture(index, { dateFrom: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Date fin
                    <input
                      type="date"
                      value={departure.dateTo ?? ""}
                      onChange={(event) => updateDeparture(index, { dateTo: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold md:col-span-2">
                    Plan de vol
                    <textarea
                      value={departure.flightPlan ?? ""}
                      onChange={(event) => updateDeparture(index, { flightPlan: event.target.value })}
                      className="mt-1 min-h-[90px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm font-semibold">
                    Prix achat (DZD)
                    <input
                      type="number"
                      min={0}
                      value={departure.purchasePriceDZD}
                      onChange={(event) => updateDeparture(index, { purchasePriceDZD: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                    <FieldError message={fieldErrors[`departures.${index}.purchasePriceDZD`]} />
                  </label>
                  <label className="text-sm font-semibold">
                    Contrat PNR
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={departure.contractPNR ?? ""}
                        readOnly
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold">
                        <Upload className="h-4 w-4" />
                        Importer
                        <input
                          type="file"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            updateDeparture(index, { contractPNR: file?.name ?? "" });
                          }}
                        />
                      </label>
                    </div>
                  </label>
                  <label className="text-sm font-semibold">
                    Places gratuites
                    <input
                      type="number"
                      min={0}
                      value={departure.freeSeatsCount ?? ""}
                      onChange={(event) =>
                        updateDeparture(index, { freeSeatsCount: Number(event.target.value) || undefined })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Taxes places gratuites
                    <input
                      type="number"
                      min={0}
                      value={departure.freeSeatTaxesToPay ?? ""}
                      onChange={(event) =>
                        updateDeparture(index, { freeSeatTaxesToPay: Number(event.target.value) || undefined })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                    <FieldError message={fieldErrors[`departures.${index}.freeSeatTaxesToPay`]} />
                  </label>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateScenario({ departures: [...scenario.departures, createDeparture()] })}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Ajouter un depart
              </button>
              <button
                type="button"
                onClick={() => {
                  const last = scenario.departures[scenario.departures.length - 1];
                  if (!last) return;
                  updateScenario({ departures: [...scenario.departures, { ...last, id: crypto.randomUUID() }] });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                <Copy className="h-4 w-4" />
                Dupliquer precedent
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Type de voyage</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["Une seule ville", "Circuit / Combiné"] as MaisonScenario1TripType[]).map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3">
                  <input
                    type="radio"
                    name="tripType"
                    checked={scenario.tripType === option}
                    onChange={() => {
                      const next = option;
                      const accommodation =
                        next === "Une seule ville" ? [scenario.accommodation[0] ?? createCity()] : scenario.accommodation;
                      updateScenario({ tripType: next, accommodation });
                    }}
                  />
                  <span className="text-sm font-semibold">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="section-shell space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Hebergement</h2>
            {scenario.accommodation.map((city, cityIndex) => (
              <div key={city.id} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Ville {cityIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (scenario.accommodation.length <= 1) return;
                      updateScenario({ accommodation: scenario.accommodation.filter((_, idx) => idx !== cityIndex) });
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                    disabled={scenario.accommodation.length <= 1 || scenario.tripType !== "Circuit / Combiné"}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
                <label className="text-sm font-semibold">
                  Nom de la ville
                  <input
                    value={city.cityName}
                    onChange={(event) => updateCity(cityIndex, { cityName: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  />
                  <FieldError message={fieldErrors[`accommodation.${cityIndex}.cityName`]} />
                </label>
                {city.hotels.map((hotel, hotelIndex) => (
                  <div key={hotel.id} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Hotel {hotelIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          if (city.hotels.length <= 1) return;
                          updateCity(cityIndex, { hotels: city.hotels.filter((_, idx) => idx !== hotelIndex) });
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                        disabled={city.hotels.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-sm font-semibold">
                        Nom hotel
                        <input
                          value={hotel.hotelName}
                          onChange={(event) => updateHotel(cityIndex, hotelIndex, { hotelName: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        />
                        <FieldError
                          message={fieldErrors[`accommodation.${cityIndex}.hotels.${hotelIndex}.hotelName`]}
                        />
                      </label>
                      <label className="text-sm font-semibold">
                        Lien Google Maps
                        <input
                          value={hotel.googleMapsLink ?? ""}
                          onChange={(event) =>
                            updateHotel(cityIndex, hotelIndex, { googleMapsLink: event.target.value })
                          }
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        />
                        <FieldError
                          message={fieldErrors[`accommodation.${cityIndex}.hotels.${hotelIndex}.googleMapsLink`]}
                        />
                      </label>
                      <label className="text-sm font-semibold">
                        Devise
                        <select
                          value={hotel.currency}
                          onChange={(event) =>
                            updateHotel(cityIndex, hotelIndex, { currency: event.target.value as MaisonScenario1Currency })
                          }
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        >
                          {CURRENCY_OPTIONS.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </select>
                      </label>
                      {hotel.currency !== "DZD" ? (
                        <label className="text-sm font-semibold">
                          Taux change
                          <input
                            type="number"
                            min={0}
                            value={hotel.exchangeRate ?? ""}
                            onChange={(event) =>
                              updateHotel(cityIndex, hotelIndex, {
                                exchangeRate: Number(event.target.value) || undefined,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          />
                          <FieldError
                            message={fieldErrors[`accommodation.${cityIndex}.hotels.${hotelIndex}.exchangeRate`]}
                          />
                        </label>
                      ) : null}
                      <label className="text-sm font-semibold">
                        Etoiles
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={hotel.stars ?? ""}
                          onChange={(event) =>
                            updateHotel(cityIndex, hotelIndex, { stars: Number(event.target.value) || undefined })
                          }
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm font-semibold">
                        Pension
                        <select
                          value={hotel.board ?? "RO"}
                          onChange={(event) => updateHotel(cityIndex, hotelIndex, { board: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        >
                          {BOARD_OPTIONS.map((board) => (
                            <option key={board} value={board}>
                              {board}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Lignes de prix</p>
                        <button
                          type="button"
                          onClick={() =>
                            updateHotel(cityIndex, hotelIndex, {
                              priceLines: [...hotel.priceLines, createPriceLine()],
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter une ligne
                        </button>
                      </div>
                      {hotel.priceLines.map((line, lineIndex) => (
                        <div
                          key={line.id}
                          className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-4"
                        >
                          <label className="text-sm font-semibold md:col-span-2">
                            Label
                            <input
                              value={line.label}
                              onChange={(event) =>
                                updatePriceLine(cityIndex, hotelIndex, lineIndex, { label: event.target.value })
                              }
                              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                            />
                            <FieldError
                              message={fieldErrors[`accommodation.${cityIndex}.hotels.${hotelIndex}.priceLines.${lineIndex}.label`]}
                            />
                          </label>
                          <label className="text-sm font-semibold">
                            Age (enfants/bebes)
                            <input
                              value={line.ageRange ?? ""}
                              onChange={(event) =>
                                updatePriceLine(cityIndex, hotelIndex, lineIndex, { ageRange: event.target.value })
                              }
                              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                            />
                            <FieldError
                              message={fieldErrors[`accommodation.${cityIndex}.hotels.${hotelIndex}.priceLines.${lineIndex}.ageRange`]}
                            />
                          </label>
                          <label className="text-sm font-semibold">
                            Montant achat
                            <input
                              type="number"
                              min={0}
                              value={line.purchaseAmount}
                              onChange={(event) =>
                                updatePriceLine(cityIndex, hotelIndex, lineIndex, {
                                  purchaseAmount: Number(event.target.value),
                                })
                              }
                              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                            />
                            <FieldError
                              message={fieldErrors[`accommodation.${cityIndex}.hotels.${hotelIndex}.priceLines.${lineIndex}.purchaseAmount`]}
                            />
                          </label>
                          <label className="text-sm font-semibold md:col-span-4">
                            Notes
                            <input
                              value={line.notes ?? ""}
                              onChange={(event) =>
                                updatePriceLine(cityIndex, hotelIndex, lineIndex, { notes: event.target.value })
                              }
                              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                            />
                          </label>
                          <div className="md:col-span-4">
                            <button
                              type="button"
                              onClick={() => {
                                if (hotel.priceLines.length <= 1) return;
                                updateHotel(cityIndex, hotelIndex, {
                                  priceLines: hotel.priceLines.filter((_, idx) => idx !== lineIndex),
                                });
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                              disabled={hotel.priceLines.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateCity(cityIndex, { hotels: [...city.hotels, createHotel()] })}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un hotel
                  </button>
                </div>
              </div>
            ))}
            {scenario.tripType === "Circuit / Combiné" ? (
              <button
                type="button"
                onClick={() => updateScenario({ accommodation: [...scenario.accommodation, createCity()] })}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Ajouter une ville
              </button>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Commissions</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm font-semibold">
                Commission adulte
                <input
                  type="number"
                  min={0}
                  value={scenario.commissions.commissionAdult}
                  onChange={(event) =>
                    updateScenario({
                      commissions: { ...scenario.commissions, commissionAdult: Number(event.target.value) },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
                <FieldError message={fieldErrors["commissions.adult"]} />
              </label>
              <label className="text-sm font-semibold">
                Commission enfant
                <input
                  type="number"
                  min={0}
                  value={scenario.commissions.commissionChild}
                  onChange={(event) =>
                    updateScenario({
                      commissions: { ...scenario.commissions, commissionChild: Number(event.target.value) },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
                <FieldError message={fieldErrors["commissions.child"]} />
              </label>
              <label className="text-sm font-semibold">
                Commission bebe
                <input
                  type="number"
                  min={0}
                  value={scenario.commissions.commissionBaby}
                  onChange={(event) =>
                    updateScenario({
                      commissions: { ...scenario.commissions, commissionBaby: Number(event.target.value) },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
                <FieldError message={fieldErrors["commissions.baby"]} />
              </label>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="section-shell space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Services inclus</h2>
            <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={scenario.services.airportTransferEnabled}
                  onChange={(event) =>
                    updateScenario({
                      services: { ...scenario.services, airportTransferEnabled: event.target.checked },
                    })
                  }
                />
                Transfert aeroport
              </label>
              {scenario.services.airportTransferEnabled ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm font-semibold">
                    Prix achat
                    <input
                      type="number"
                      min={0}
                      value={scenario.services.airportTransfer?.purchasePrice ?? 0}
                      onChange={(event) =>
                        updateScenario({
                          services: {
                            ...scenario.services,
                            airportTransfer: {
                              ...(scenario.services.airportTransfer ?? { currency: "DZD" }),
                              purchasePrice: Number(event.target.value),
                            },
                          },
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Devise
                    <select
                      value={scenario.services.airportTransfer?.currency ?? "DZD"}
                      onChange={(event) =>
                        updateScenario({
                          services: {
                            ...scenario.services,
                            airportTransfer: {
                              ...(scenario.services.airportTransfer ?? { purchasePrice: 0 }),
                              currency: event.target.value as MaisonScenario1Currency,
                            },
                          },
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      {CURRENCY_OPTIONS.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </label>
                  {scenario.services.airportTransfer?.currency !== "DZD" ? (
                    <label className="text-sm font-semibold">
                      Taux change
                      <input
                        type="number"
                        min={0}
                        value={scenario.services.airportTransfer?.exchangeRate ?? ""}
                        onChange={(event) =>
                          updateScenario({
                            services: {
                              ...scenario.services,
                              airportTransfer: {
                                ...(scenario.services.airportTransfer ?? { purchasePrice: 0, currency: "DZD" }),
                                exchangeRate: Number(event.target.value) || undefined,
                              },
                            },
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      />
                      <FieldError message={fieldErrors["services.airportTransfer.exchangeRate"]} />
                    </label>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={scenario.services.visaEnabled}
                  onChange={(event) =>
                    updateScenario({
                      services: { ...scenario.services, visaEnabled: event.target.checked },
                    })
                  }
                />
                Visa
              </label>
              {scenario.services.visaEnabled ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm font-semibold">
                    Prix achat
                    <input
                      type="number"
                      min={0}
                      value={scenario.services.visa?.purchasePrice ?? 0}
                      onChange={(event) =>
                        updateScenario({
                          services: {
                            ...scenario.services,
                            visa: {
                              ...(scenario.services.visa ?? { currency: "DZD" }),
                              purchasePrice: Number(event.target.value),
                            },
                          },
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Devise
                    <select
                      value={scenario.services.visa?.currency ?? "DZD"}
                      onChange={(event) =>
                        updateScenario({
                          services: {
                            ...scenario.services,
                            visa: {
                              ...(scenario.services.visa ?? { purchasePrice: 0 }),
                              currency: event.target.value as MaisonScenario1Currency,
                            },
                          },
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      {CURRENCY_OPTIONS.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </label>
                  {scenario.services.visa?.currency !== "DZD" ? (
                    <label className="text-sm font-semibold">
                      Taux change
                      <input
                        type="number"
                        min={0}
                        value={scenario.services.visa?.exchangeRate ?? ""}
                        onChange={(event) =>
                          updateScenario({
                            services: {
                              ...scenario.services,
                              visa: {
                                ...(scenario.services.visa ?? { purchasePrice: 0, currency: "DZD" }),
                                exchangeRate: Number(event.target.value) || undefined,
                              },
                            },
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      />
                      <FieldError message={fieldErrors["services.visa.exchangeRate"]} />
                    </label>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Services extra</h3>
              {scenario.services.extraServices.map((service, index) => (
                <div
                  key={service.id}
                  className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-4"
                >
                  <label className="text-sm font-semibold md:col-span-2">
                    Service
                    <input
                      value={service.serviceName}
                      onChange={(event) => updateExtraService(index, { serviceName: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                    <FieldError message={fieldErrors[`services.extraServices.${index}.serviceName`]} />
                  </label>
                  <label className="text-sm font-semibold">
                    Prix achat
                    <input
                      type="number"
                      min={0}
                      value={service.purchasePrice}
                      onChange={(event) => updateExtraService(index, { purchasePrice: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Devise
                    <select
                      value={service.currency}
                      onChange={(event) => updateExtraService(index, { currency: event.target.value as MaisonScenario1Currency })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      {CURRENCY_OPTIONS.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </label>
                  {service.currency !== "DZD" ? (
                    <label className="text-sm font-semibold">
                      Taux change
                      <input
                        type="number"
                        min={0}
                        value={service.exchangeRate ?? ""}
                        onChange={(event) =>
                          updateExtraService(index, { exchangeRate: Number(event.target.value) || undefined })
                        }
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      />
                      <FieldError message={fieldErrors[`services.extraServices.${index}.exchangeRate`]} />
                    </label>
                  ) : null}
                  <div className="md:col-span-4">
                    <button
                      type="button"
                      onClick={() =>
                        updateScenario({
                          services: {
                            ...scenario.services,
                            extraServices: scenario.services.extraServices.filter((_, idx) => idx !== index),
                          },
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateScenario({
                    services: {
                      ...scenario.services,
                      extraServices: [...scenario.services.extraServices, createExtraService()],
                    },
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Ajouter un service
              </button>
            </div>
          </div>
        ) : null}

        {/* __STEP_SECTIONS__ */}

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
            disabled={step === 0}
          >
            Retour
          </button>
          <div className="text-xs text-[var(--muted)]">
            Etape {formatTwo(step + 1)} / {formatTwo(STEP_LABELS.length)}
          </div>
          <button
            type="button"
            onClick={() => {
              if (step === STEP_LABELS.length - 1) {
                handlePublish();
              } else {
                setStep((prev) => Math.min(STEP_LABELS.length - 1, prev + 1));
              }
            }}
            className="rounded-full bg-[var(--token-text)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)]"
            disabled={step === STEP_LABELS.length - 1 ? saving || errors.length > 0 || stepDisabled : stepDisabled}
          >
            {step === STEP_LABELS.length - 1 ? "Enregistrer & Generer PDF" : "Suivant"}
          </button>
        </footer>
      </section>
    </div>
  );
}
