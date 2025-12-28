'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList, Columns, Filter, PlusCircle } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import TableToolbar from "../../components/tables/TableToolbar";
import BookingWizardModal, { type BookingDraft } from "../../components/BookingWizardModal";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../components/ui/cn";
import { Table, TBody, TD, THead, TH, TR } from "../../components/ui/table";
import { useBookingStore } from "../../stores/useBookingStore";
import { usePackageStore } from "../../stores/usePackageStore";
import type { Booking, TravelPackage } from "../../types";
import { computeTotals, formatMoney, paymentStatus } from "../../lib/booking";
import RowActionsMenu from "../../components/RowActionsMenu";
import { EmptyState } from "../../components/ui/EmptyState";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { RightDrawer } from "../../components/ui/RightDrawer";
import { useToast } from "../../components/ui/toast";

type JsPdfLike = {
  internal: {
    getNumberOfPages: () => number;
    pageSize: { getWidth: () => number; getHeight: () => number };
  };
  setPage: (n: number) => void;
  setFontSize: (n: number) => void;
  setTextColor: (n: number) => void;
  text: (text: string, x: number, y: number, options?: { align?: "left" | "center" | "right" }) => void;
};

type Html2PdfWorker = {
  set: (options: unknown) => Html2PdfWorker;
  from: (element: HTMLElement) => Html2PdfWorker;
  toPdf: () => Html2PdfWorker;
  get: (key: "pdf") => Promise<JsPdfLike>;
  save: () => void;
};

type Html2PdfFactory = () => Html2PdfWorker;

type StatusFilter = "all" | "published" | "draft";
type SortKey = "recent" | "priceAsc" | "priceDesc" | "stockDesc";
type ColumnKey = "package" | "type" | "pax" | "payment" | "status" | "hold" | "actions";
type TableDensity = "comfortable" | "compact";

const tablePrefsKey = "travelops-sales-table-prefs";
const defaultColumns: Record<ColumnKey, boolean> = {
  package: true,
  type: true,
  pax: true,
  payment: true,
  status: true,
  hold: true,
  actions: true,
};

const defaultBooking = (packageId: string | undefined): BookingDraft => ({
  packageId: packageId ?? "",
  bookingType: "En option",
  reservedUntil: "",
  rooms: [
    {
      roomType: "Double",
      occupants: [{ type: "ADL", name: "" }],
    },
  ],
  paxTotal: 1,
  uploads: { passportScans: [], requiredDocuments: [], paymentProofUrl: "" },
  payment: {
    paymentMethod: "Carte",
    totalPrice: 0,
    paidAmount: 0,
    isFullyPaid: false,
  },
});

export default function SalesPage() {
  const { bookings, addBooking, updateBooking, deleteBooking } = useBookingStore();
  const { packages } = usePackageStore();
  const { toast } = useToast();
  const [drawerBooking, setDrawerBooking] = useState<Booking | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const publishedPackages = packages.filter((p) => p.status === "published");

  const [draft, setDraft] = useState<BookingDraft>(defaultBooking(publishedPackages[0]?.id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(defaultColumns);
  const [density, setDensity] = useState<TableDensity>("comfortable");
  const isLoading = false; // TODO: wire loading state from bookings store

  const packageMap = useMemo(() => Object.fromEntries(packages.map((p) => [p.id, p])), [packages]);

  const totalBookedPax = (pkgId: string, ignoreBookingId?: string) =>
    bookings
      .filter((b) => b.packageId === pkgId && b.id !== ignoreBookingId)
      .reduce((sum, b) => sum + b.paxTotal, 0);

  const currentPackage: TravelPackage | null = draft.packageId ? packageMap[draft.packageId] ?? null : null;

  const remainingStock =
    (currentPackage?.general.stock ?? 0) -
    (draft.packageId ? totalBookedPax(draft.packageId, editingId ?? undefined) : 0);

  const computeReservedUntil = () => {
    if (!currentPackage) return "";
    const departures = currentPackage.flights.flights
      .map((f) => f.departureDate)
      .filter(Boolean)
      .sort();
    const baseDate = departures.length ? new Date(departures[0]) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const holdDays = remainingStock <= 5 ? 2 : 5;
    baseDate.setDate(baseDate.getDate() - holdDays);
    const now = new Date();
    if (baseDate < now) baseDate.setDate(now.getDate() + 1);
    return baseDate.toISOString().slice(0, 10);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(defaultBooking(publishedPackages[0]?.id));
    setOpen(true);
  };

  const openEdit = (booking: Booking) => {
    setEditingId(booking.id);
    const { id: _id, createdAt: _createdAt, ...rest } = booking;
    void _id;
    void _createdAt;
    setDraft(rest);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditingId(null);
  };

  const openDrawer = (booking: Booking) => setDrawerBooking(booking);
  const closeDrawer = () => setDrawerBooking(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(tablePrefsKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { columns?: Record<ColumnKey, boolean>; density?: TableDensity };
      if (parsed.columns) {
        setVisibleColumns((prev) => ({ ...prev, ...parsed.columns }));
      }
      if (parsed.density === "compact" || parsed.density === "comfortable") {
        setDensity(parsed.density);
      }
    } catch {
      // Ignore invalid stored prefs.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = { columns: visibleColumns, density };
    window.localStorage.setItem(tablePrefsKey, JSON.stringify(payload));
  }, [visibleColumns, density]);

  const onSubmit = () => {
    if (!draft.packageId) return;
    if (!currentPackage) return;

    const totals = computeTotals(currentPackage, draft.rooms);
    if (draft.paxTotal > remainingStock) return;

    const reservedUntil = draft.bookingType === "En option" ? computeReservedUntil() : undefined;

    const payment = {
      ...draft.payment,
      totalPrice: draft.payment.totalPrice > 0 ? draft.payment.totalPrice : totals.total,
      isFullyPaid: draft.payment.paidAmount >= (draft.payment.totalPrice > 0 ? draft.payment.totalPrice : totals.total),
    };

    const payload: BookingDraft = {
      ...draft,
      reservedUntil,
      payment,
    };

    if (editingId) {
      updateBooking(editingId, payload as Booking);
    } else {
      addBooking(payload);
    }
    close();
    toast({
      title: editingId ? "Réservation mise à jour" : "Nouvelle réservation",
      variant: "success",
    });
  };

  const deleteOne = (bookingId: string) => {
    const ok = window.confirm("Delete this booking?");
    if (!ok) return;
    deleteBooking(bookingId);
    toast({ title: "Réservation supprimée", variant: "info" });
  };

  const exportBookingPdf = async (booking: Booking, kind: "confirmation" | "invoice") => {
    const pkg = packageMap[booking.packageId];
    if (!pkg) return;

    const totals = computeTotals(pkg, booking.rooms);
    const status = paymentStatus(booking.payment);

    const root = document.createElement("div");
    root.style.width = "794px";
    root.style.padding = "20px";
    root.style.fontFamily = "Arial";
    root.style.color = "var(--token-text, #0B1220)";
    root.innerHTML = `
      <div style="border:2px solid var(--token-accent, #F28C28);border-radius:14px;padding:14px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <div style="color:var(--token-accent, #F28C28);font-weight:800;font-size:12px;">Nouba Plus</div>
            <div style="font-size:20px;font-weight:800;margin-top:4px;">${kind === "invoice" ? "Invoice" : "Confirmation"} - Booking ${booking.id.slice(0, 6)}</div>
            <div style="font-size:12px;color:var(--token-muted, #5B6474);margin-top:4px;">
                  #${pkg?.general.productCode ?? "-"}
            </div>
          </div>
          <div style="text-align:right;font-size:12px;color:var(--token-muted, #5B6474);">
            <div>Type: <strong style="color:var(--token-text, #0B1220);">${booking.bookingType}</strong></div>
            <div>Pax: <strong style="color:var(--token-text, #0B1220);">${booking.paxTotal}</strong></div>
            <div>Payment: <strong style="color:var(--token-text, #0B1220);">${status.text}</strong></div>
              ${booking.reservedUntil ? `<div>Hold until <strong style="color:var(--token-text, #0B1220);">${booking.reservedUntil}</strong></div>` : ""}
          </div>
        </div>
      </div>
        ${
          kind === "invoice"
            ? `<div style="margin-top:10px;font-size:12px;color:var(--token-muted, #5B6474);">
                 <strong>Invoice</strong> - detailed invoice lines.
               </div>`
            : `<div style="margin-top:10px;font-size:12px;color:var(--token-muted, #5B6474);">
                 <strong>Confirmation</strong> - booking recap.
               </div>`
        }
      <div style="margin-top:14px;">
        <h3 style="margin:0 0 6px 0;font-size:14px;font-weight:800;">Rooming</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #D9DEE7);background:var(--token-surface-2, #F1F3F6);">Chambre</th>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #D9DEE7);background:var(--token-surface-2, #F1F3F6);">Occupants</th>
            </tr>
          </thead>
          <tbody>
            ${booking.rooms
              .map((room) => {
                const occ = room.occupants.map((o) => `${o.type}${o.name ? ` - ${o.name}` : ""}`).join(", ");
                return `<tr>
                  <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);">${room.roomType}</td>
                  <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);">${occ}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <div style="margin-top:14px;page-break-inside:avoid;">
        <h3 style="margin:0 0 6px 0;font-size:14px;font-weight:800;">Pricing</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid var(--token-border, #D9DEE7);background:var(--token-surface-2, #F1F3F6);">Type</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:1px solid var(--token-border, #D9DEE7);background:var(--token-surface-2, #F1F3F6);">Qté</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:1px solid var(--token-border, #D9DEE7);background:var(--token-surface-2, #F1F3F6);">PU</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:1px solid var(--token-border, #D9DEE7);background:var(--token-surface-2, #F1F3F6);">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);">ADL</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${totals.pax.ADL}</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${formatMoney(totals.pricing.adultUnit)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${formatMoney(totals.pax.ADL * totals.pricing.adultUnit)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);">CHD</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${totals.pax.CHD}</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${formatMoney(totals.pricing.childUnit)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${formatMoney(totals.pax.CHD * totals.pricing.childUnit)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);">INF</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${totals.pax.INF}</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${formatMoney(totals.pricing.infantUnit)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--token-surface-2, #F1F3F6);text-align:right;">${formatMoney(totals.pax.INF * totals.pricing.infantUnit)}</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-top:10px;">
          <div style="width:320px;border:1px solid var(--token-border, #D9DEE7);border-radius:12px;padding:10px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--token-muted, #5B6474);">
              <span>Commission agence</span>
              <span>${formatMoney(totals.commissionTotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:14px;font-weight:800;">
              <span>Total</span>
              <span>${formatMoney(booking.payment.totalPrice)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:var(--token-muted, #5B6474);">
              <span>Payé</span>
              <span>${formatMoney(booking.payment.paidAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const html2pdf = (await import("html2pdf.js")).default as unknown as Html2PdfFactory;
    const filename = `booking-${booking.id.slice(0, 6)}-${kind}.pdf`;
    const generatedAt = new Date().toLocaleString("fr-FR");

    const worker = html2pdf()
      .set({
        margin: [10, 10, 14, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { format: "a4", orientation: "portrait" },
      })
      .from(root)
      .toPdf();

    const pdf = await worker.get("pdf");
    const total = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`Nouba Plus`, 12, h - 10);
      pdf.text(`${generatedAt}`, w / 2, h - 10, { align: "center" });
      pdf.text(`Page ${i}/${total}`, w - 12, h - 10, { align: "right" });
    }
    worker.save();
  };

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const matching = bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && booking.bookingType === "Confirmée") ||
        (statusFilter === "draft" && booking.bookingType === "En option");
      if (!matchesStatus) return false;

      if (!normalizedSearch) return true;
      const pkg = packageMap[booking.packageId];
      const haystack = `${booking.id} ${booking.bookingType} ${pkg?.general.productName ?? ""} ${pkg?.general.productCode ?? ""} ${pkg?.flights.destination ?? ""}`;
      return haystack.toLowerCase().includes(normalizedSearch);
    });

    return [...matching].sort((a, b) => {
      if (sort === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === "priceAsc") {
        return a.payment.totalPrice - b.payment.totalPrice;
      }
      if (sort === "priceDesc") {
        return b.payment.totalPrice - a.payment.totalPrice;
      }
      if (sort === "stockDesc") {
        return b.paxTotal - a.paxTotal;
      }
      return 0;
    });
  }, [bookings, packageMap, search, sort, statusFilter]);

  const bookingStatusChips = [
    { label: "Tous", active: statusFilter === "all", onClick: () => setStatusFilter("all") },
    { label: "Publies", active: statusFilter === "published", onClick: () => setStatusFilter("published") },
    { label: "Brouillons", active: statusFilter === "draft", onClick: () => setStatusFilter("draft") },
  ];
  const compactHeader = density === "compact" ? "py-2 text-[10px]" : "";
  const compactCell = density === "compact" ? "py-2 text-xs" : "";
  const columnOptions: { key: ColumnKey; label: string }[] = [
    { key: "package", label: "Package" },
    { key: "type", label: "Type" },
    { key: "pax", label: "Pax" },
    { key: "payment", label: "Payment" },
    { key: "status", label: "Status" },
    { key: "hold", label: "Hold" },
    { key: "actions", label: "Actions" },
  ];

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSort("recent");
  };

  const hasNoBookings = !isLoading && bookings.length === 0;
  const hasNoResults = !isLoading && filtered.length === 0 && bookings.length > 0;
  const drawerStatus = drawerBooking ? paymentStatus(drawerBooking.payment) : null;

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
        eyebrow="Sales"
        title="Bookings & payments"
        description="Quick creation, stock control, and exports."
      />

      <Card>
        <CardContent className="space-y-4">
          <TableToolbar
            search={{
              value: search,
              onChange: (value) => setSearch(value),
              placeholder: "Search bookings",
              ariaLabel: "Search bookings",
              inputRef: searchInputRef,
            }}
            leftActions={
              <>
                <label htmlFor="booking-sort" className="sr-only">
                  Sort bookings
                </label>
                <select
                  id="booking-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--token-surface)] px-3 text-sm font-semibold text-[var(--text)] shadow-sm outline-none transition focus:border-[var(--token-accent, #F28C28)] focus-visible:ring-2 focus-visible:ring-[var(--token-accent, #F28C28)]/20"
                >
                  <option value="recent">Recents</option>
                  <option value="priceAsc">Prix min +</option>
                  <option value="priceDesc">Prix min -</option>
                  <option value="stockDesc">Stock -</option>
                </select>
                <Button variant="ghost" size="sm" className="whitespace-nowrap" aria-label="Open filters">
                  <Filter className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    Filters
                  </span>
                </Button>
                <details className="relative">
                  <summary className="list-none [&::-webkit-details-marker]:hidden">
                    <Button variant="ghost" size="sm" className="whitespace-nowrap" aria-label="Customize columns">
                      <Columns className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        Columns
                      </span>
                    </Button>
                  </summary>
                  <div className="absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-[var(--border)] bg-[var(--token-surface)] p-3 shadow-md">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                      Column visibility
                    </p>
                    <div className="mt-2 space-y-2">
                      {columnOptions.map((col) => (
                        <label key={col.key} className="flex items-center gap-2 text-sm text-[var(--text)]">
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={(event) =>
                              setVisibleColumns((prev) => ({ ...prev, [col.key]: event.target.checked }))
                            }
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-[var(--border)] pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        Density
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-sm text-[var(--text)]">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="table-density"
                            checked={density === "comfortable"}
                            onChange={() => setDensity("comfortable")}
                          />
                          <span>Comfortable</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="table-density"
                            checked={density === "compact"}
                            onChange={() => setDensity("compact")}
                          />
                          <span>Compact</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </details>
              </>
            }
            chips={bookingStatusChips}
            rightActions={
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {filtered.length} bookings
              </span>
            }
            primaryAction={
              <Button variant="primary" size="sm" onClick={openCreate} className="whitespace-nowrap">
                <PlusCircle className="h-4 w-4" />
                New booking
              </Button>
            }
          />

          {isLoading ? (
            <TableSkeleton hasToolbar rows={6} columns={7} />
          ) : hasNoBookings ? (
            <EmptyState
              icon={<ClipboardList className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" />}
              title="Aucune réservation"
              description="Créez une réservation pour suivre les paiements et les engagements."
              primaryAction={
                <Button variant="primary" size="sm" onClick={openCreate}>
                  <PlusCircle className="h-4 w-4" />
                  Créer une réservation
                </Button>
              }
              className="mt-3"
              variant="section"
            />
          ) : hasNoResults ? (
            <EmptyState
              icon={<ClipboardList className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" />}
              title="Aucun résultat"
              description="Aucun booking ne correspond à ces filtres."
              primaryAction={
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              }
              secondaryAction={
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Effacer la recherche
                </Button>
              }
              className="mt-3"
              variant="inline"
            />
          ) : (
            <Table className="min-w-[720px]">
              <THead className="sticky top-0 z-10 bg-[var(--token-surface-2, #F1F3F6)]/90 backdrop-blur">
                <TR>
                  {visibleColumns.package ? (
                    <TH className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]", compactHeader)}>
                      Package
                    </TH>
                  ) : null}
                  {visibleColumns.type ? (
                    <TH className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]", compactHeader)}>
                      Type
                    </TH>
                  ) : null}
                  {visibleColumns.pax ? (
                    <TH className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]", compactHeader)}>
                      Pax
                    </TH>
                  ) : null}
                  {visibleColumns.payment ? (
                    <TH className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]", compactHeader)}>
                      Payment
                    </TH>
                  ) : null}
                  {visibleColumns.status ? (
                    <TH className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]", compactHeader)}>
                      Statut
                    </TH>
                  ) : null}
                  {visibleColumns.hold ? (
                    <TH className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]", compactHeader)}>
                      Hold
                    </TH>
                  ) : null}
                  {visibleColumns.actions ? (
                    <TH
                      className={cn(
                        "text-right text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]",
                        compactHeader
                      )}
                    >
                      Actions
                    </TH>
                  ) : null}
                </TR>
              </THead>
              <TBody>
                {filtered.map((booking) => {
                  const pkg = packageMap[booking.packageId];
                  const status = paymentStatus(booking.payment);
                  const statusClass =
                    status.label === "paid"
                      ? "border-[var(--token-primary)]/30 bg-[var(--token-surface-2, #F1F3F6)] text-[var(--token-primary)]"
                      : status.label === "partial"
                        ? "border-[var(--token-accent, #F28C28)]/30 bg-[var(--token-surface-2, #F1F3F6)] text-[var(--token-accent, #F28C28)]"
                        : status.label === "overpaid"
                          ? "border-[var(--token-primary)]/30 bg-[var(--token-surface-2, #F1F3F6)] text-[var(--token-primary)]"
                          : "border-[var(--border)] bg-[var(--token-surface-2, #F1F3F6)] text-[var(--text)]";

                  return (
                    <TR key={booking.id} className="transition-colors duration-150 hover:bg-[var(--token-surface-2, #F1F3F6)]">
                      {visibleColumns.package ? (
                        <TD className={cn("min-w-[220px]", compactCell)}>
                          <div
                            className="min-w-0 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            aria-label={`View booking ${booking.id.slice(0, 6)}`}
                            onClick={() => openDrawer(booking)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openDrawer(booking);
                              }
                            }}
                          >
                            <p className={cn("truncate font-semibold text-[var(--text)]", density === "compact" && "text-sm")}>
                              {pkg?.general.productName ?? "Package inconnu"}
                            </p>
                            <p className={cn("truncate text-xs text-[var(--muted)]", density === "compact" && "text-[11px]")}>
                              {pkg?.general.productCode ?? "-"} - {pkg?.flights.destination ?? "-"}
                            </p>
                          </div>
                        </TD>
                      ) : null}
                      {visibleColumns.type ? (
                        <TD className={compactCell}>
                          <span className="text-sm font-semibold text-[var(--text)]">{booking.bookingType}</span>
                        </TD>
                      ) : null}
                      {visibleColumns.pax ? (
                        <TD className={compactCell}>
                          <span className="text-sm font-semibold text-[var(--text)]">{booking.paxTotal}</span>
                        </TD>
                      ) : null}
                      {visibleColumns.payment ? (
                        <TD className={compactCell}>
                          <span className="text-sm text-[var(--text)]">
                            {formatMoney(booking.payment.paidAmount)}/{formatMoney(booking.payment.totalPrice)}
                          </span>
                        </TD>
                      ) : null}
                      {visibleColumns.status ? (
                        <TD className={compactCell}>
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                              statusClass
                            )}
                          >
                            {status.text}
                          </span>
                        </TD>
                      ) : null}
                      {visibleColumns.hold ? (
                        <TD className={compactCell}>
                          <span className="text-sm text-[var(--muted)]">{booking.reservedUntil || "-"}</span>
                        </TD>
                      ) : null}
                      {visibleColumns.actions ? (
                        <TD className={cn("text-right pr-4", compactCell)}>
                          <div className="flex items-center justify-end">
                            <RowActionsMenu
                              actions={[
                                {
                                  label: "View details",
                                  onClick: () => openDrawer(booking),
                                },
                                {
                                  label: "Create task",
                                  href: `/tasks?linkType=booking&linkId=${booking.id}`,
                                },
                                { label: "Edit", onClick: () => openEdit(booking) },
                                {
                                  label: "Print confirmation",
                                  onClick: () => exportBookingPdf(booking, "confirmation"),
                                },
                                { label: "Invoice", onClick: () => exportBookingPdf(booking, "invoice") },
                                { label: "Delete", tone: "danger", onClick: () => deleteOne(booking.id) },
                              ]}
                              ariaLabel={`Actions for booking ${booking.id.slice(0, 6)}`}
                            />
                          </div>
                        </TD>
                      ) : null}
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RightDrawer
        isOpen={Boolean(drawerBooking)}
        onClose={closeDrawer}
        title={drawerBooking ? `Booking ${drawerBooking.id.slice(0, 6)}` : "Booking details"}
        description={
          drawerBooking
            ? packageMap[drawerBooking.packageId]?.general.productName ?? "Booking en cours"
            : undefined
        }
        statusLabel={drawerStatus?.text}
        statusTone={
          drawerStatus?.label === "paid" ? "success" : drawerStatus?.label === "partial" ? "warning" : "info"
        }
      >
        {drawerBooking ? (
          <div className="space-y-4 py-2 text-sm text-[var(--text)]">
            <section className="space-y-2 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Package
              </p>
              <div className="space-y-1">
                <p className="text-base font-semibold text-[var(--text)]">
                  {packageMap[drawerBooking.packageId]?.general.productName ?? "Package inconnu"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  #{packageMap[drawerBooking.packageId]?.general.productCode ?? "-"}
                </p>
              </div>
            </section>

            <section className="grid gap-3 py-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Type
                </p>
                <p className="text-base text-[var(--text)]">{drawerBooking.bookingType}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Pax
                </p>
                <p className="text-base text-[var(--text)]">{drawerBooking.paxTotal}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Payment
                </p>
                <p className="text-base text-[var(--text)]">
                  {formatMoney(drawerBooking.payment.paidAmount)}/{formatMoney(drawerBooking.payment.totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Hold until
                </p>
                <p className="text-base text-[var(--text)]">{drawerBooking.reservedUntil || "-"}</p>
              </div>
            </section>

            <section className="space-y-3 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Actions
              </p>
              <RowActionsMenu
                actions={[
                  {
                    label: "Create task",
                    href: `/tasks?linkType=booking&linkId=${drawerBooking.id}`,
                  },
                  {
                    label: "Edit",
                    onClick: () => {
                      openEdit(drawerBooking);
                      closeDrawer();
                    },
                  },
                  {
                    label: "Print confirmation",
                    onClick: () => exportBookingPdf(drawerBooking, "confirmation"),
                  },
                  {
                    label: "Invoice",
                    onClick: () => exportBookingPdf(drawerBooking, "invoice"),
                  },
                  {
                    label: "Delete",
                    tone: "danger",
                    onClick: () => {
                      deleteOne(drawerBooking.id);
                      closeDrawer();
                    },
                  },
                ]}
              />
            </section>
          </div>
        ) : null}
      </RightDrawer>

      <BookingWizardModal
        open={open}
        packages={publishedPackages}
        draft={draft}
        setDraft={setDraft}
        editing={Boolean(editingId)}
        remainingStock={remainingStock}
        computeReservedUntil={computeReservedUntil}
        onClose={close}
        onSubmit={onSubmit}
      />
    </div>
  );
}
