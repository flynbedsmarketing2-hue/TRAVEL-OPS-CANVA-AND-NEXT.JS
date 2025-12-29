'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, Plus, Send, Trash2 } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import { buttonClassName } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import TableToolbar from "../../components/tables/TableToolbar";
import { Table, TBody, TD, THead, TH, TR } from "../../components/ui/table";
import { useProductStore } from "../../stores/useProductStore";
import { EmptyState } from "../../components/ui/EmptyState";
import { cn } from "../../components/ui/cn";

export default function PackagesPage() {
  const { products, duplicateDraft, publishProduct, deleteProduct } = useProductStore();
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Produits"
        title="Packages produit maison"
        subtitle="Gestion des produits (brouillons et publies)."
        actions={
          <Link href="/packages/new" className={buttonClassName({ variant: "primary" })}>
            <Plus className="h-4 w-4" />
            Creer
          </Link>
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
