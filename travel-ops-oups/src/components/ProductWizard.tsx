
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Copy, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import type {
  Product,
  ProductDeparture,
  ProductHotel,
  ProductHotelRate,
  ProductService,
  ProductType,
  StopMode,
  ServiceMode,
  PensionType,
  HotelRateCategory,
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
  "Type produit",
  "Duree",
  "Nom produit",
  "Vols / departs",
  "Stops",
  "Hebergement",
  "Commission B2B",
  "Services inclus",
  "Excursions extra",
  "Programme",
  "Partenaire local",
];

const CURRENCY_OPTIONS = ["DZD", "EUR", "USD", "SAR", "TRY", "Autre"];

const createDefaultDraft = (): DraftProduct => ({
  status: "draft",
  productType: "maison",
  nights: 7,
  days: 8,
  name: "",
  paxCount: 0,
  stopMode: "one_stop",
  departures: [
    {
      id: crypto.randomUUID(),
      airline: "",
      purchasePriceDzd: 0,
      pnr: "",
      documentUrl: "",
      periodStart: "",
      periodEnd: "",
      flightPlan: "",
      freePaxEnabled: false,
      freePaxCount: 0,
      freePaxTaxesDzd: 0,
    },
  ],
  hotels: [
    {
      id: crypto.randomUUID(),
      city: "",
      name: "",
      mapLink: "",
      stars: undefined,
      pension: "RO",
      contractUrl: "",
      rates: [
        createRate("single"),
        createRate("double"),
        createRate("triple"),
        createRate("baby"),
        createRate("child1", 2, 5, true),
        createRate("child2", 6, 11, false),
      ],
    },
  ],
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
});

function createRate(
  category: HotelRateCategory,
  childAgeMin?: number,
  childAgeMax?: number,
  withBed?: boolean
): ProductHotelRate {
  return {
    id: crypto.randomUUID(),
    category,
    purchasePrice: 0,
    currency: "DZD",
    exchangeRate: 1,
    salePrice: 0,
    comboLabel: "",
    childAgeMin,
    childAgeMax,
    withBed,
  };
}

const formatTwo = (value: number) => `${Math.max(0, value)}`.padStart(2, "0");

const parseDateInput = (value: string) => {
  const trimmed = value.trim();
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateInput = (value?: string) => {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
};

const validationSummary = (draft: DraftProduct) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (draft.productType !== "maison") {
    errors.push("Seul le produit maison est supporte pour le moment.");
  }
  if (draft.nights <= 0 || draft.days <= 0) {
    errors.push("Duree invalide.");
  }
  if (!draft.name.trim()) {
    errors.push("Nom produit requis.");
  }
  if (draft.paxCount <= 0) {
    errors.push("Pax global doit etre superieur a 0.");
  }

  draft.departures.forEach((dep, index) => {
    if (dep.periodStart && dep.periodEnd && dep.periodStart > dep.periodEnd) {
      errors.push(`Depart ${index + 1}: periode invalide (du > au).`);
    }
    if (dep.freePaxEnabled && dep.freePaxCount > draft.paxCount) {
      errors.push(`Depart ${index + 1}: pax gratuits > pax global.`);
    }
    if (dep.freePaxEnabled && dep.freePaxTaxesDzd < 0) {
      errors.push(`Depart ${index + 1}: taxes gratuites invalides.`);
    }
  });

  draft.hotels.forEach((hotel, index) => {
    hotel.rates.forEach((rate) => {
      if (rate.currency !== "DZD" && rate.exchangeRate <= 0) {
        errors.push(`Hotel ${index + 1}: taux change invalide pour ${rate.category}.`);
      }
      if (rate.salePrice < rate.purchasePrice) {
        warnings.push(`Hotel ${index + 1}: vente < achat pour ${rate.category}.`);
      }
    });

    const child1 = hotel.rates.find((rate) => rate.category === "child1");
    const child2 = hotel.rates.find((rate) => rate.category === "child2");
    if (child1 && child1.childAgeMin !== undefined && child1.childAgeMax !== undefined) {
      if (child1.childAgeMin >= child1.childAgeMax) {
        errors.push(`Hotel ${index + 1}: ages CHILD1 invalides.`);
      }
    }
    if (child2 && child2.childAgeMin !== undefined && child2.childAgeMax !== undefined) {
      if (child2.childAgeMin >= child2.childAgeMax) {
        errors.push(`Hotel ${index + 1}: ages CHILD2 invalides.`);
      }
    }
    if (
      child1 &&
      child2 &&
      child1.childAgeMin !== undefined &&
      child1.childAgeMax !== undefined &&
      child2.childAgeMin !== undefined &&
      child2.childAgeMax !== undefined
    ) {
      const overlap =
        child1.childAgeMin <= child2.childAgeMax && child2.childAgeMin <= child1.childAgeMax;
      if (overlap) {
        errors.push(`Hotel ${index + 1}: plages CHILD1/CHILD2 se chevauchent.`);
      }
    }
  });

  if (draft.servicesMode === "package" && draft.servicesPackage.currency !== "DZD" && draft.servicesPackage.exchangeRate <= 0) {
    errors.push("Services package: taux change invalide.");
  }
  draft.servicesDetails.forEach((service, index) => {
    if (service.currency !== "DZD" && service.exchangeRate <= 0) {
      errors.push(`Service ${index + 1}: taux change invalide.`);
    }
  });

  return { errors, warnings };
};
export default function ProductWizard({ initialProduct }: Props) {
  const router = useRouter();
  const { createDraft, updateDraft, publishProduct } = useProductStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState(initialProduct?.id ?? "");
  const [draft, setDraft] = useState<DraftProduct>(() =>
    initialProduct
      ? {
          ...initialProduct,
          status: initialProduct.status,
          productType: initialProduct.productType,
        }
      : createDefaultDraft()
  );
  const [servicesIncludesText, setServicesIncludesText] = useState(
    initialProduct?.servicesPackage?.includes.join("\n") ?? ""
  );
  const [servicesOtherText, setServicesOtherText] = useState(initialProduct?.servicesOtherIncludes.join("\n") ?? "");
  const [excursionsText, setExcursionsText] = useState(initialProduct?.excursionsExtra.join("\n") ?? "");
  const [programText, setProgramText] = useState(initialProduct?.programDays.join("\n") ?? "");

  useEffect(() => {
    setServicesIncludesText(draft.servicesPackage.includes.join("\n"));
    setServicesOtherText(draft.servicesOtherIncludes.join("\n"));
    setExcursionsText(draft.excursionsExtra.join("\n"));
    setProgramText(draft.programDays.join("\n"));
  }, [draftId]);

  const { errors, warnings } = useMemo(() => validationSummary(draft), [draft]);

  const setNights = (next: number) => setDraft((prev) => ({ ...prev, nights: Math.max(0, next) }));
  const setDays = (next: number) => setDraft((prev) => ({ ...prev, days: Math.max(0, next) }));

  const updateDeparture = (index: number, update: Partial<ProductDeparture>) => {
    setDraft((prev) => {
      const departures = [...prev.departures];
      departures[index] = { ...departures[index], ...update };
      return { ...prev, departures };
    });
  };

  const addDeparture = () => {
    setDraft((prev) => ({
      ...prev,
      departures: [
        ...prev.departures,
        {
          id: crypto.randomUUID(),
          airline: "",
          purchasePriceDzd: 0,
          pnr: "",
          documentUrl: "",
          periodStart: "",
          periodEnd: "",
          flightPlan: "",
          freePaxEnabled: false,
          freePaxCount: 0,
          freePaxTaxesDzd: 0,
        },
      ],
    }));
  };

  const duplicateDeparture = () => {
    setDraft((prev) => {
      const last = prev.departures[prev.departures.length - 1];
      if (!last) return prev;
      return {
        ...prev,
        departures: [...prev.departures, { ...last, id: crypto.randomUUID() }],
      };
    });
  };

  const removeDeparture = (index: number) => {
    setDraft((prev) => {
      if (prev.departures.length <= 1) return prev;
      return { ...prev, departures: prev.departures.filter((_, idx) => idx !== index) };
    });
  };

  const updateHotel = (index: number, update: Partial<ProductHotel>) => {
    setDraft((prev) => {
      const hotels = [...prev.hotels];
      hotels[index] = { ...hotels[index], ...update };
      return { ...prev, hotels };
    });
  };

  const updateHotelRate = (hotelIndex: number, rateIndex: number, update: Partial<ProductHotelRate>) => {
    setDraft((prev) => {
      const hotels = [...prev.hotels];
      const rates = [...hotels[hotelIndex].rates];
      rates[rateIndex] = { ...rates[rateIndex], ...update };
      hotels[hotelIndex] = { ...hotels[hotelIndex], rates };
      return { ...prev, hotels };
    });
  };

  const addHotel = () => {
    setDraft((prev) => ({
      ...prev,
      hotels: [
        ...prev.hotels,
        {
          id: crypto.randomUUID(),
          city: "",
          name: "",
          mapLink: "",
          stars: undefined,
          pension: "RO",
          contractUrl: "",
          rates: [
            createRate("single"),
            createRate("double"),
            createRate("triple"),
            createRate("baby"),
            createRate("child1", 2, 5, true),
            createRate("child2", 6, 11, false),
          ],
        },
      ],
    }));
  };

  const duplicateHotel = () => {
    setDraft((prev) => {
      const last = prev.hotels[prev.hotels.length - 1];
      if (!last) return prev;
      return {
        ...prev,
        hotels: [
          ...prev.hotels,
          {
            ...last,
            id: crypto.randomUUID(),
            rates: last.rates.map((rate) => ({ ...rate, id: crypto.randomUUID() })),
          },
        ],
      };
    });
  };

  const removeHotel = (index: number) => {
    setDraft((prev) => {
      if (prev.hotels.length <= 1) return prev;
      return { ...prev, hotels: prev.hotels.filter((_, idx) => idx !== index) };
    });
  };

  const addService = () => {
    setDraft((prev) => ({
      ...prev,
      servicesDetails: [
        ...prev.servicesDetails,
        {
          id: crypto.randomUUID(),
          name: "",
          purchasePrice: 0,
          currency: "DZD",
          exchangeRate: 1,
        },
      ],
    }));
  };

  const updateService = (index: number, update: Partial<ProductService>) => {
    setDraft((prev) => {
      const services = [...prev.servicesDetails];
      services[index] = { ...services[index], ...update };
      return { ...prev, servicesDetails: services };
    });
  };

  const removeService = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      servicesDetails: prev.servicesDetails.filter((_, idx) => idx !== index),
    }));
  };

  const parseBulletList = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const buildPayload = () => {
    const nextDraft: DraftProduct = {
      ...draft,
      servicesPackage: {
        ...draft.servicesPackage,
        includes: parseBulletList(servicesIncludesText),
      },
      servicesOtherIncludes: parseBulletList(servicesOtherText),
      excursionsExtra: parseBulletList(excursionsText),
      programDays: parseBulletList(programText),
    };
    return stripDraft(nextDraft);
  };

  const handleBulletKey = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    value: string,
    setter: (next: string) => void
  ) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const start = event.currentTarget.selectionStart ?? value.length;
    const end = event.currentTarget.selectionEnd ?? value.length;
    const insert = "\n• ";
    const next = value.slice(0, start) + insert + value.slice(end);
    setter(next);
    const target = event.currentTarget;
    requestAnimationFrame(() => {
      if (!target) return;
      target.selectionStart = target.selectionEnd = start + insert.length;
    });
  };

  const ensureBulletPrefix = (value: string) => {
    const trimmed = value.trimStart();
    if (!trimmed) return "• ";
    const firstLine = trimmed.split("\n")[0] ?? "";
    return firstLine.startsWith("•") ? value : `• ${value}`;
  };

  const handleFileUpload = (file: File | undefined, cb: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result));
    reader.readAsDataURL(file);
    // TODO: replace data URL storage with real upload storage.
  };

  const saveDraft = async () => {
    setSaving(true);
    setActionError(null);
    try {
      if (!draftId) {
        const created = await createDraft(buildPayload());
        setDraftId(created.id);
        router.replace(`/packages/${created.id}`);
      } else {
        await updateDraft(draftId, buildPayload());
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de sauvegarder.";
      setActionError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (errors.length) return;
    setSaving(true);
    setActionError(null);
    try {
      let id = draftId;
      if (id) {
        await updateDraft(id, buildPayload());
      } else {
        const created = await createDraft(buildPayload());
        id = created.id;
        setDraftId(created.id);
        router.replace(`/packages/${created.id}`);
      }
      if (id) {
        await publishProduct(id);
        router.replace(`/packages/${id}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de publier. Verifie les champs puis reessaie.";
      setActionError(message);
    } finally {
      setSaving(false);
    }
  };

  const stepDisabled = draft.productType !== "maison";

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
              {formatTwo(index)}
            </span>
            <span className="font-semibold">{label}</span>
          </button>
        ))}
      </aside>

      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Scenario 1</p>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Creation package produit maison</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)]"
              disabled={saving}
            >
              Sauver brouillon
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="rounded-full bg-[var(--token-text)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)]"
              disabled={saving || errors.length > 0}
            >
              Publier
            </button>
          </div>
        </header>

        {errors.length ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text)]">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Blocages publication
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {warnings.length ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text)]">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Avertissements
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
              {warnings.map((warn) => (
                <li key={warn}>{warn}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {step === 0 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Type de produit</h2>
            <select
              value={draft.productType}
              onChange={(event) => setDraft((prev) => ({ ...prev, productType: event.target.value as ProductType }))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="maison">Produit Maison (Flynbeds 100%)</option>
              <option value="tiers">Produit Tiers</option>
              <option value="autre">Autre</option>
            </select>
            {draft.productType !== "maison" ? (
              <p className="text-sm text-[var(--muted)]">
                Cette version ne prend en charge que Produit Maison.
              </p>
            ) : null}
          </div>
        ) : null}
        {actionError ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text)]">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Action impossible
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">{actionError}</p>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="section-shell space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Duree</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <CounterField label="Nuitees (N)" value={draft.nights} onChange={setNights} />
              <CounterField label="Jours (D)" value={draft.days} onChange={setDays} />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Nom produit</h2>
            <input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              placeholder="Nom produit"
            />
            {draft.productId ? (
              <p className="text-xs text-[var(--muted)]">ID produit: {draft.productId}</p>
            ) : (
              <p className="text-xs text-[var(--muted)]">ID genere lors de la publication.</p>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="section-shell space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Vols / departs</h2>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Pax global</p>
              <CounterField
                label="Pax"
                value={draft.paxCount}
                onChange={(value) => setDraft((prev) => ({ ...prev, paxCount: value }))}
              />
              <p className="text-xs text-[var(--muted)]">Affichage: {formatTwo(draft.paxCount)}</p>
            </div>

            {draft.departures.map((departure, index) => (
              <div key={departure.id} className="rounded-2xl border border-[var(--border)] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Depart {formatTwo(index + 1)}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Compagnie aerienne
                    <select
                      value={departure.airline}
                      onChange={(event) => updateDeparture(index, { airline: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="">Selectionner</option>
                      <option value="Air Algerie">Air Algerie</option>
                      <option value="Turkish Airlines">Turkish Airlines</option>
                      <option value="Emirates">Emirates</option>
                      <option value="Qatar Airways">Qatar Airways</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </label>
                  {departure.airline === "Autre" ? (
                    <label className="text-sm font-semibold">
                      Autre compagnie
                      <input
                        value={departure.airlineOther ?? ""}
                        onChange={(event) => updateDeparture(index, { airlineOther: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                      />
                    </label>
                  ) : null}
                  <label className="text-sm font-semibold">
                    Prix achat DZD
                    <input
                      type="number"
                      value={departure.purchasePriceDzd}
                      onChange={(event) => updateDeparture(index, { purchasePriceDzd: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    PNR
                    <input
                      value={departure.pnr ?? ""}
                      onChange={(event) => updateDeparture(index, { pnr: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Upload contrat / PNR
                    <div className="mt-1 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                      <Upload className="h-4 w-4 text-[var(--muted)]" />
                      <input
                        type="file"
                        onChange={(event) =>
                          handleFileUpload(event.target.files?.[0], (url) =>
                            updateDeparture(index, { documentUrl: url })
                          )
                        }
                        className="w-full text-xs"
                      />
                    </div>
                  </label>
                  <label className="text-sm font-semibold">
                    Periode du (JJ/MM/AAAA)
                    <input
                      value={formatDateInput(departure.periodStart)}
                      onChange={(event) => updateDeparture(index, { periodStart: parseDateInput(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={departure.periodStart ?? ""}
                      onChange={(event) => updateDeparture(index, { periodStart: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Periode au (JJ/MM/AAAA)
                    <input
                      value={formatDateInput(departure.periodEnd)}
                      onChange={(event) => updateDeparture(index, { periodEnd: parseDateInput(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={departure.periodEnd ?? ""}
                      onChange={(event) => updateDeparture(index, { periodEnd: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold md:col-span-2">
                    Plan de vol
                    <input
                      value={departure.flightPlan ?? ""}
                      onChange={(event) => updateDeparture(index, { flightPlan: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm font-semibold">
                    Gratuite
                    <select
                      value={departure.freePaxEnabled ? "yes" : "no"}
                      onChange={(event) =>
                        updateDeparture(index, { freePaxEnabled: event.target.value === "yes" })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="no">Non</option>
                      <option value="yes">Oui</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Pax gratuits
                    <input
                      type="number"
                      value={departure.freePaxCount}
                      onChange={(event) => updateDeparture(index, { freePaxCount: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Taxes gratuites DZD
                    <input
                      type="number"
                      value={departure.freePaxTaxesDzd}
                      onChange={(event) => updateDeparture(index, { freePaxTaxesDzd: Number(event.target.value) })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addDeparture}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Ajouter depart
              </button>
              <button
                type="button"
                onClick={duplicateDeparture}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                <Copy className="h-4 w-4" />
                Dupliquer precedent
              </button>
              <button
                type="button"
                onClick={() => {
                  if (draft.departures.length <= 1) return;
                  if (window.confirm("Supprimer ce depart ?")) {
                    removeDeparture(draft.departures.length - 1);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                disabled={draft.departures.length <= 1}
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : null}
        {step === 4 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Stops</h2>
            <select
              value={draft.stopMode}
              onChange={(event) => setDraft((prev) => ({ ...prev, stopMode: event.target.value as StopMode }))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <option value="one_stop">One stop</option>
              <option value="multi_stops">Multi-stops (stub)</option>
            </select>
            {draft.stopMode === "multi_stops" ? (
              <p className="text-sm text-[var(--muted)]">Multi-stops a venir.</p>
            ) : null}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="section-shell space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Hebergement</h2>
            {draft.hotels.map((hotel, index) => (
              <div key={hotel.id} className="rounded-2xl border border-[var(--border)] p-4 space-y-4">
                <p className="text-sm font-semibold">Hotel {formatTwo(index + 1)}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Ville destination
                    <input
                      value={hotel.city}
                      onChange={(event) => updateHotel(index, { city: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Nom hotel
                    <input
                      value={hotel.name}
                      onChange={(event) => updateHotel(index, { name: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Lien Google maps
                    <input
                      value={hotel.mapLink ?? ""}
                      onChange={(event) => updateHotel(index, { mapLink: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Etoiles
                    <select
                      value={hotel.stars ? String(hotel.stars) : ""}
                      onChange={(event) =>
                        updateHotel(index, { stars: event.target.value ? Number(event.target.value) : undefined })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="">Optionnel</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Pension
                    <select
                      value={hotel.pension}
                      onChange={(event) => updateHotel(index, { pension: event.target.value as PensionType })}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      <option value="RO">RO</option>
                      <option value="BB">BB</option>
                      <option value="HB">HB</option>
                      <option value="FB">FB</option>
                      <option value="AI">AI</option>
                      <option value="UAI">UAI</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Upload contrat hotel
                    <div className="mt-1 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                      <Upload className="h-4 w-4 text-[var(--muted)]" />
                      <input
                        type="file"
                        onChange={(event) =>
                          handleFileUpload(event.target.files?.[0], (url) => updateHotel(index, { contractUrl: url }))
                        }
                        className="w-full text-xs"
                      />
                    </div>
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold">Tarification</p>
                  {/* TODO: A enrichir dans une prochaine version avec CombPack / patterns de prix repetitifs. */}
                  {hotel.rates.map((rate, rateIndex) => (
                    <div key={rate.id} className="rounded-xl border border-[var(--border)] p-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                          {rate.category}
                        </label>
                        <label className="text-sm font-semibold">
                          Prix achat
                          <input
                            type="number"
                            value={rate.purchasePrice}
                            onChange={(event) =>
                              updateHotelRate(index, rateIndex, {
                                purchasePrice: Number(event.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm font-semibold">
                          Devise
                          <select
                            value={rate.currency}
                            onChange={(event) => updateHotelRate(index, rateIndex, { currency: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          >
                            {CURRENCY_OPTIONS.map((code) => (
                              <option key={code} value={code}>
                                {code}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm font-semibold">
                          Taux change
                          <input
                            type="number"
                            value={rate.exchangeRate}
                            onChange={(event) =>
                              updateHotelRate(index, rateIndex, {
                                exchangeRate: Number(event.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm font-semibold">
                          Prix vente
                          <input
                            type="number"
                            value={rate.salePrice}
                            onChange={(event) =>
                              updateHotelRate(index, rateIndex, {
                                salePrice: Number(event.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm font-semibold md:col-span-2">
                          Combinaisons
                          <input
                            value={rate.comboLabel}
                            onChange={(event) => updateHotelRate(index, rateIndex, { comboLabel: event.target.value })}
                            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          />
                        </label>
                        {rate.category.startsWith("child") ? (
                          <div className="grid gap-2 md:col-span-3 md:grid-cols-3">
                            <label className="text-sm font-semibold">
                              Age min
                              <input
                                type="number"
                                value={rate.childAgeMin ?? 0}
                                onChange={(event) =>
                                  updateHotelRate(index, rateIndex, { childAgeMin: Number(event.target.value) })
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                              />
                            </label>
                            <label className="text-sm font-semibold">
                              Age max
                              <input
                                type="number"
                                value={rate.childAgeMax ?? 0}
                                onChange={(event) =>
                                  updateHotelRate(index, rateIndex, { childAgeMax: Number(event.target.value) })
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                              />
                            </label>
                            <label className="text-sm font-semibold">
                              Avec lit
                              <select
                                value={rate.withBed ? "yes" : "no"}
                                onChange={(event) =>
                                  updateHotelRate(index, rateIndex, { withBed: event.target.value === "yes" })
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                              >
                                <option value="yes">Oui</option>
                                <option value="no">Non</option>
                              </select>
                            </label>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addHotel}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Ajouter hotel
              </button>
              <button
                type="button"
                onClick={duplicateHotel}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
              >
                <Copy className="h-4 w-4" />
                Dupliquer precedent
              </button>
              <button
                type="button"
                onClick={() => {
                  if (draft.hotels.length <= 1) return;
                  if (window.confirm("Supprimer cet hotel ?")) {
                    removeHotel(draft.hotels.length - 1);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                disabled={draft.hotels.length <= 1}
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Commission B2B</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm font-semibold">
                Adulte DZD
                <input
                  type="number"
                  value={draft.commission.adultDzd}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      commission: { ...prev.commission, adultDzd: Number(event.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold">
                Enfant DZD
                <input
                  type="number"
                  value={draft.commission.childDzd}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      commission: { ...prev.commission, childDzd: Number(event.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold">
                Bebe DZD
                <input
                  type="number"
                  value={draft.commission.infantDzd}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      commission: { ...prev.commission, infantDzd: Number(event.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 7 ? (
          <div className="section-shell space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Services inclus</h2>
            <label className="text-sm font-semibold">
              Mode
              <select
                value={draft.servicesMode}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, servicesMode: event.target.value as ServiceMode }))
                }
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              >
                <option value="package">En package</option>
                <option value="details">Detailles</option>
              </select>
            </label>

            {draft.servicesMode === "package" ? (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm font-semibold">
                    Prix achat
                    <input
                      type="number"
                      value={draft.servicesPackage.purchasePrice}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          servicesPackage: {
                            ...prev.servicesPackage,
                            purchasePrice: Number(event.target.value),
                          },
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Devise
                    <select
                      value={draft.servicesPackage.currency}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          servicesPackage: { ...prev.servicesPackage, currency: event.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    >
                      {CURRENCY_OPTIONS.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Taux change
                    <input
                      type="number"
                      value={draft.servicesPackage.exchangeRate}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          servicesPackage: { ...prev.servicesPackage, exchangeRate: Number(event.target.value) },
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <label className="text-sm font-semibold">
                  Ce qui est inclus (liste)
                  <textarea
                    value={servicesIncludesText}
                    onChange={(event) => setServicesIncludesText(ensureBulletPrefix(event.target.value))}
                    onKeyDown={(event) => handleBulletKey(event, servicesIncludesText, setServicesIncludesText)}
                    className="mt-1 min-h-[120px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    placeholder="• Un element par ligne"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                {draft.servicesDetails.map((service, index) => (
                  <div key={service.id} className="rounded-xl border border-[var(--border)] p-3">
                    <div className="grid gap-3 md:grid-cols-4">
                      <label className="text-sm font-semibold">
                        Nom
                        <input
                          value={service.name}
                          onChange={(event) => updateService(index, { name: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm font-semibold">
                        Prix achat
                        <input
                          type="number"
                          value={service.purchasePrice}
                          onChange={(event) => updateService(index, { purchasePrice: Number(event.target.value) })}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm font-semibold">
                        Devise
                        <select
                          value={service.currency}
                          onChange={(event) => updateService(index, { currency: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        >
                          {CURRENCY_OPTIONS.map((code) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm font-semibold">
                        Taux change
                        <input
                          type="number"
                          value={service.exchangeRate}
                          onChange={(event) => updateService(index, { exchangeRate: Number(event.target.value) })}
                          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addService}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (draft.servicesDetails.length <= 0) return;
                    if (window.confirm("Supprimer ce service ?")) {
                      removeService(draft.servicesDetails.length - 1);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                  disabled={draft.servicesDetails.length === 0}
                >
                  Supprimer
                </button>
              </div>
            )}

            <label className="text-sm font-semibold">
              Autres services inclus
              <textarea
                value={servicesOtherText}
                onChange={(event) => setServicesOtherText(ensureBulletPrefix(event.target.value))}
                onKeyDown={(event) => handleBulletKey(event, servicesOtherText, setServicesOtherText)}
                className="mt-1 min-h-[120px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                placeholder="• Un element par ligne"
              />
            </label>
          </div>
        ) : null}

        {step === 8 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Excursions en extra</h2>
            <textarea
              value={excursionsText}
              onChange={(event) => setExcursionsText(ensureBulletPrefix(event.target.value))}
              onKeyDown={(event) => handleBulletKey(event, excursionsText, setExcursionsText)}
              className="min-h-[140px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              placeholder="• Un element par ligne"
            />
          </div>
        ) : null}

        {step === 9 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Programme jour par jour</h2>
            <textarea
              value={programText}
              onChange={(event) => setProgramText(ensureBulletPrefix(event.target.value))}
              onKeyDown={(event) => handleBulletKey(event, programText, setProgramText)}
              className="min-h-[160px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              placeholder="• Un element par ligne"
            />
          </div>
        ) : null}

        {step === 10 ? (
          <div className="section-shell space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text)]">Partenaire local</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm font-semibold">
                Nom
                <input
                  value={draft.partner.name}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      partner: { ...prev.partner, name: event.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold">
                Telephone
                <input
                  value={draft.partner.phone}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      partner: { ...prev.partner, phone: event.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold">
                Whatsapp
                <input
                  value={draft.partner.whatsapp ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      partner: { ...prev.partner, whatsapp: event.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        ) : null}

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
            Etape {formatTwo(step)} / {formatTwo(STEP_LABELS.length - 1)}
          </div>
          <button
            type="button"
            onClick={() =>
              step === STEP_LABELS.length - 1
                ? handlePublish()
                : setStep((prev) => Math.min(STEP_LABELS.length - 1, prev + 1))
            }
            className="rounded-full bg-[var(--token-text)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)]"
            disabled={
              step === STEP_LABELS.length - 1
                ? saving || errors.length > 0 || stepDisabled
                : stepDisabled
            }
          >
            {step === STEP_LABELS.length - 1 ? "Publier" : "Suivant"}
          </button>
        </footer>
      </section>
    </div>
  );
}

const stripDraft = (draft: DraftProduct) => {
  const { productId: _, createdAt: __, updatedAt: ___, ...payload } = draft as DraftProduct &
    Partial<Pick<Product, "createdAt" | "updatedAt">>;
  return payload;
};

type CounterProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

const CounterField = ({ label, value, onChange }: CounterProps) => (
  <label className="text-sm font-semibold">
    {label}
    <div className="mt-1 flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-center text-sm"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)]"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </label>
);
