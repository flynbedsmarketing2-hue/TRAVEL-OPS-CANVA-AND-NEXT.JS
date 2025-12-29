'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, Plus, Send, Trash2, Wand2 } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import { buttonClassName } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import TableToolbar from "../../components/tables/TableToolbar";
import { Table, TBody, TD, THead, TH, TR } from "../../components/ui/table";
import { useProductStore } from "../../stores/useProductStore";
import type { Product } from "../../types/product";
import { EmptyState } from "../../components/ui/EmptyState";
import { cn } from "../../components/ui/cn";

export default function PackagesPage() {
  const { products, duplicateDraft, publishProduct, deleteProduct, addLocalDrafts } = useProductStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter !== "all" && product.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = `${product.name} ${product.productId ?? ""} ${product.partner.name ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, search, statusFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.status === "published").length;
    const draft = products.filter((p) => p.status === "draft").length;
    return { total, published, draft };
  }, [products]);

  const statusChips = [
    { label: "Tous", active: statusFilter === "all", onClick: () => setStatusFilter("all") },
    { label: "Publies", active: statusFilter === "published", onClick: () => setStatusFilter("published") },
    { label: "Brouillons", active: statusFilter === "draft", onClick: () => setStatusFilter("draft") },
  ];

  const buildMockDraft = (index: number): Omit<Product, "id" | "productId" | "createdAt" | "updatedAt"> => ({
    status: "draft",
    productType: "maison",
    nights: 7,
    days: 8,
    name: `Mock Produit Maison ${index + 1}`,
    paxCount: 12,
    stopMode: "one_stop",
    departures: [
      {
        id: crypto.randomUUID(),
        airline: "Air Algerie",
        airlineOther: "",
        purchasePriceDzd: 120000,
        pnr: `PNR-MOCK-${index + 1}`,
        documentUrl: "",
        periodStart: "2025-06-15",
        periodEnd: "2025-06-22",
        flightPlan: "ALG - IST - ALG",
        freePaxEnabled: false,
        freePaxCount: 0,
        freePaxTaxesDzd: 0,
      },
    ],
    hotels: [
      {
        id: crypto.randomUUID(),
        city: "Istanbul",
        name: `Hotel Mock ${index + 1}`,
        mapLink: "https://maps.google.com",
        stars: 4,
        pension: "BB",
        contractUrl: "",
        rates: [
          {
            id: crypto.randomUUID(),
            category: "single",
            purchasePrice: 450,
            currency: "EUR",
            exchangeRate: 1,
            salePrice: 520,
            comboLabel: "1A",
          },
          {
            id: crypto.randomUUID(),
            category: "double",
            purchasePrice: 380,
            currency: "EUR",
            exchangeRate: 1,
            salePrice: 440,
            comboLabel: "2A",
          },
          {
            id: crypto.randomUUID(),
            category: "child1",
            purchasePrice: 220,
            currency: "EUR",
            exchangeRate: 1,
            salePrice: 260,
            comboLabel: "2A+1CH",
            childAgeMin: 2,
            childAgeMax: 5,
            withBed: true,
          },
          {
            id: crypto.randomUUID(),
            category: "child2",
            purchasePrice: 180,
            currency: "EUR",
            exchangeRate: 1,
            salePrice: 210,
            comboLabel: "2A+1CH",
            childAgeMin: 6,
            childAgeMax: 11,
            withBed: false,
          },
        ],
      },
    ],
    commission: {
      adultDzd: 6000,
      childDzd: 4000,
      infantDzd: 0,
    },
    servicesMode: "package",
    servicesPackage: {
      purchasePrice: 0,
      currency: "DZD",
      exchangeRate: 1,
      includes: ["Vols A/R", "Transferts", "Hotel"],
    },
    servicesDetails: [],
    servicesOtherIncludes: ["Assistance"],
    excursionsExtra: ["Excursion optionnelle"],
    programDays: ["Jour 1: Arrivee", "Jour 2: Libre", "Jour 3: Depart"],
    partner: {
      name: "Partner Mock",
      phone: "+213 555 000 000",
      whatsapp: "+213 555 000 000",
    },
  });

  const generateMockProducts = async () => {
    if (!window.confirm("Generer 3 produits mock pour test ?")) return;
    const payloads = [0, 1, 2].map(buildMockDraft);
    addLocalDrafts(payloads);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Produits"
        title="Packages produit maison"
        subtitle="Gestion des produits (brouillons et publies)."
        actions={
          <>
            <button
              type="button"
              onClick={() => void generateMockProducts()}
              className={buttonClassName({ variant: "outline" })}
            >
              <Wand2 className="h-4 w-4" />
              Generer mocks (test)
            </button>
            <Link href="/packages/new" className={buttonClassName({ variant: "primary" })}>
              <Plus className="h-4 w-4" />
              Creer
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Total</p>
            <p className="text-2xl font-semibold text-[var(--text)]">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Publies</p>
            <p className="text-2xl font-semibold text-[var(--text)]">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Brouillons</p>
            <p className="text-2xl font-semibold text-[var(--text)]">{stats.draft}</p>
          </CardContent>
        </Card>
      </div>

      <TableToolbar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Rechercher un produit",
          ariaLabel: "Rechercher un produit",
        }}
        chips={statusChips}
        rightActions={
          <span className="text-xs text-[var(--muted)]">{filtered.length} resultats</span>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title="Aucun produit"
          description="Commence par creer un produit maison."
          actionLabel="Creer un produit"
          onAction={() => (window.location.href = "/packages/new")}
        />
      ) : null}

      {products.length > 0 && filtered.length === 0 ? (
        <EmptyState title="Aucun resultat" description="Aucun produit ne correspond a ces filtres." />
      ) : null}

      {filtered.length ? (
        <Table>
          <THead>
            <TR>
              <TH>Nom</TH>
              <TH>ID produit</TH>
              <TH>Statut</TH>
              <TH>Pax</TH>
              <TH>Mis a jour</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((product) => (
              <TR key={product.id}>
                <TD>
                  <div className="space-y-1">
                    <Link href={`/packages/${product.id}`} className="font-semibold hover:underline">
                      {product.name || "Produit sans nom"}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">{product.productType}</div>
                  </div>
                </TD>
                <TD className="font-mono text-xs">
                  {product.productId || "Brouillon"}
                </TD>
                <TD>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      product.status === "published"
                        ? "border-[var(--token-primary)]/20 bg-[var(--token-surface-2)] text-[var(--token-primary)]"
                        : "border-[var(--token-accent)]/30 bg-[var(--token-surface-2)] text-[var(--token-accent)]"
                    )}
                  >
                    {product.status === "published" ? "Publie" : "Brouillon"}
                  </span>
                </TD>
                <TD>{product.paxCount}</TD>
                <TD>{new Date(product.updatedAt).toLocaleDateString()}</TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/packages/${product.id}`}
                      className={buttonClassName({ variant: "outline", size: "sm" })}
                    >
                      Editer
                    </Link>
                    <button
                      type="button"
                      onClick={() => void duplicateDraft(product.id)}
                      className={buttonClassName({ variant: "outline", size: "sm" })}
                    >
                      <Copy className="h-4 w-4" />
                      Dupliquer
                    </button>
                    {product.status === "draft" ? (
                      <button
                        type="button"
                        onClick={() => void publishProduct(product.id)}
                        className={buttonClassName({ variant: "primary", size: "sm" })}
                      >
                        <Send className="h-4 w-4" />
                        Publier
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Supprimer ce produit ?")) {
                          void deleteProduct(product.id);
                        }
                      }}
                      className={buttonClassName({ variant: "outline", size: "sm" })}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : null}
    </div>
  );
}
