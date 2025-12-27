'use client';

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, Plus, Upload } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import { Button, buttonClassName } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../components/ui/cn";
import TableToolbar from "../../components/tables/TableToolbar";
import { usePackageStore } from "../../stores/usePackageStore";
import type { TravelPackage } from "../../types";
import RowActionsMenu from "../../components/RowActionsMenu";
import { EmptyState } from "../../components/ui/EmptyState";
import CardSkeleton from "../../components/ui/CardSkeleton";
import { useToast } from "../../components/ui/toast";

type StatusFilter = "all" | "published" | "draft";
type SortKey = "recent" | "priceAsc" | "priceDesc" | "stockDesc";

function minPrice(pkg: TravelPackage): number {
  return pkg.pricing.reduce((acc, p) => (p.unitPrice > 0 ? Math.min(acc, p.unitPrice) : acc), Infinity);
}

function avgCommission(pkg: TravelPackage): number {
  if (!pkg.pricing.length) return 0;
  return pkg.pricing.reduce((sum, p) => sum + (p.commission ?? 0), 0) / pkg.pricing.length;
}

function formatMoney(n: number): string {
  if (!Number.isFinite(n) || n === Infinity) return "-";
  return `${Math.round(n)} DZD`;
}

function asPackageArray(value: unknown): TravelPackage[] | null {
  if (!Array.isArray(value)) return null;
  return value as TravelPackage[];
}

function StatusPill({ status }: { status: TravelPackage["status"] }) {
  const styles =
    status === "published"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-200"
      : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", styles)}>
      {status === "published" ? "Publie" : "Brouillon"}
    </span>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="space-y-1 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
        <p className="font-heading text-2xl font-semibold text-[var(--text)]">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function PackagesPage() {
  const { packages, duplicatePackage, deletePackage, importPackages, exportPackages } = usePackageStore();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const isLoading = false; // TODO: feed the real loading state from packages store

  const stats = useMemo(() => {
    const total = packages.length;
    const published = packages.filter((p) => p.status === "published").length;
    const draft = packages.filter((p) => p.status === "draft").length;
    return { total, published, draft };
  }, [packages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return packages
      .filter((pkg) => (statusFilter === "all" ? true : pkg.status === statusFilter))
      .filter((pkg) => {
        if (!q) return true;
        const haystack = `${pkg.general.productName} ${pkg.general.productCode} ${pkg.flights.destination} ${pkg.general.responsible} ${pkg.flights.cities.join(" ")}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (sort === "recent") return new Date(b.general.creationDate).getTime() - new Date(a.general.creationDate).getTime();
        if (sort === "priceAsc") return minPrice(a) - minPrice(b);
        if (sort === "priceDesc") return minPrice(b) - minPrice(a);
        if (sort === "stockDesc") return b.general.stock - a.general.stock;
        return 0;
      });
  }, [packages, search, sort, statusFilter]);

  const resetPackageFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSort("recent");
  };

  const handleExport = () => {
    const data = exportPackages();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travelops-packages-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export terminé",
      description: `${data.length} package(s) téléchargé(s) en JSON.`,
      variant: "success",
    });
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed: unknown = JSON.parse(text);
      const imported = asPackageArray(parsed);
      if (!imported) {
        window.alert("JSON invalide: tableau attendu.");
        toast({
          title: "Import échoué",
          description: "JSON invalide: tableau attendu.",
          variant: "error",
        });
        return;
      }
      const mode = window.confirm("Replace existing packages? (OK = replace, Cancel = merge)")
        ? "replace"
        : "merge";
      const count = importPackages(imported, mode);
      window.alert(`Import termine : ${count} package(s).`);
      toast({
        title: "Import terminé",
        description: `${count} package(s) ${mode === "replace" ? "remplacé(s)" : "fusionné(s)"}.`,
        variant: "success",
      });
    } catch {
      window.alert("JSON invalide.");
      toast({ title: "Import échoué", description: "JSON invalide.", variant: "error" });
    } finally {
      e.currentTarget.value = "";
    }
  };

  const isEmpty = !isLoading && packages.length === 0;
  const hasNoResults = !isLoading && filtered.length === 0 && packages.length > 0;

  const packageStatusChips = [
    { label: "Tous", active: statusFilter === "all", onClick: () => setStatusFilter("all") },
    { label: "Publies", active: statusFilter === "published", onClick: () => setStatusFilter("published") },
    { label: "Brouillons", active: statusFilter === "draft", onClick: () => setStatusFilter("draft") },
  ];

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Packages"
        title="Gestion des offres"
        subtitle="Filtres rapides, import/export JSON, creation en local."
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export JSON
              </Button>

            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />

            <Link href="/packages/new" className={buttonClassName({ variant: "primary" })}>
              <Plus className="h-4 w-4" />
              Creer
            </Link>
          </>
        }
      />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi label="Total" value={stats.total} />
          <Kpi label="Publies" value={stats.published} />
          <Kpi label="Brouillons" value={stats.draft} />
        </div>

        <Card>
          <CardContent className="space-y-4 pt-5">
            <TableToolbar
              search={{
                value: search,
                onChange: (value) => setSearch(value),
                placeholder: "Rechercher un package",
                ariaLabel: "Rechercher un package",
                inputRef: searchInputRef,
              }}
              leftActions={
                <>
                  <label htmlFor="package-sort" className="sr-only">
                    Sort packages
                  </label>
                  <select
                    id="package-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--token-surface)] px-3 text-sm font-semibold text-[var(--text)] shadow-sm outline-none transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    <option value="recent">Recents</option>
                    <option value="priceAsc">Prix min +</option>
                    <option value="priceDesc">Prix min -</option>
                    <option value="stockDesc">Stock -</option>
                  </select>
                </>
              }
              chips={packageStatusChips}
              rightActions={
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {filtered.length} packages
                </span>
              }
            />
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="space-y-4">
              <CardSkeleton items={3} />
            </CardContent>
          </Card>
        ) : isEmpty ? (
          <EmptyState
            icon={<Download className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" />}
            title="Aucun package"
            description="Créez une offre pour suivre vos ventes et vos stocks."
            primaryAction={
              <Link href="/packages/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Créer une offre
                </Button>
              </Link>
            }
            secondaryAction={
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                Importer JSON
              </Button>
            }
            variant="section"
            className="mt-3"
          />
        ) : hasNoResults ? (
          <EmptyState
            icon={<Download className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" />}
            title="Aucun résultat"
            description="Aucun package ne correspond aux filtres sélectionnés."
            primaryAction={
              <Button variant="ghost" onClick={resetPackageFilters}>
                Réinitialiser les filtres
              </Button>
            }
            secondaryAction={
              <Button variant="outline" onClick={() => setSearch("")}>
                Effacer la recherche
              </Button>
            }
            variant="inline"
            className="mt-3"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((pkg) => {
              const price = minPrice(pkg);
              const commission = avgCommission(pkg);
              const image = pkg.general.imageUrl;
              return (
                <Card key={pkg.id} className="overflow-hidden">
                  <div className="relative h-36 bg-[var(--token-surface-2)]">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/15 via-[var(--token-surface-2)] to-[var(--token-border)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{pkg.general.productName || "Sans nom"}</p>
                        <p className="truncate text-xs text-white/80">
                          {pkg.general.productCode || "-"} - {pkg.flights.destination || "-"}
                        </p>
                      </div>
                      <StatusPill status={pkg.status} />
                    </div>
                  </div>

                  <CardContent className="space-y-4 pt-5">
                    <div className="grid gap-2 text-sm text-[var(--text)] sm:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                          Stock
                        </p>
                        <p className="font-semibold text-[var(--text)]">{pkg.general.stock} pax</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                          Prix min
                        </p>
                        <p className="font-semibold text-[var(--text)]">{formatMoney(price)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                          Commission
                        </p>
                        <p className="font-semibold text-[var(--text)]">{formatMoney(commission)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link href={`/packages/${pkg.id}`} className={buttonClassName({ variant: "outline", size: "sm" })}>
                        Open
                      </Link>
                      <RowActionsMenu
                        actions={[
                          { label: "Open", href: `/packages/${pkg.id}` },
                          {
                            label: "Duplicate",
                            onClick: () => {
                              const copyOps = window.confirm("Duplicate with existing ops? (OK = copy, Cancel = regenerate)");
                              duplicatePackage(pkg.id, { copyOps });
                            },
                          },
                          {
                            label: "Delete",
                            tone: "danger",
                            onClick: () => {
                              if (!window.confirm("Delete this package?")) return;
                              deletePackage(pkg.id);
                            },
                          },
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}
