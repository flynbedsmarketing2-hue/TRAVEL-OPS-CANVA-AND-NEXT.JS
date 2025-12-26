'use client';

import { useMemo, useState } from "react";
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
import { Drawer } from "../../components/ui/Drawer";
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
  const toast = useToast();
  const [drawerBooking, setDrawerBooking] = useState<Booking | null>(null);

  const publishedPackages = packages.filter((p) => p.status === "published");

  const [draft, setDraft] = useState<BookingDraft>(defaultBooking(publishedPackages[0]?.id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
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
    root.style.color = "#0f172a";
    root.innerHTML = `
      <div style="border:2px solid #2b8cee;border-radius:14px;padding:14px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <div style="color:#2b8cee;font-weight:800;font-size:12px;">TravelOps Platform</div>
            <div style="font-size:20px;font-weight:800;margin-top:4px;">${kind === "invoice" ? "Invoice" : "Confirmation"} - Booking ${booking.id.slice(0, 6)}</div>
            <div style="font-size:12px;color:#475569;margin-top:4px;">
              Package: ${pkg.general.productName} (${pkg.general.productCode}) – Destination: ${pkg.flights.destination}
            </div>
          </div>
          <div style="text-align:right;font-size:12px;color:#475569;">
            <div>Type: <strong style="color:#0f172a;">${booking.bookingType}</strong></div>
            <div>Pax: <strong style="color:#0f172a;">${booking.paxTotal}</strong></div>
            <div>Payment: <strong style="color:#0f172a;">${status.text}</strong></div>
              ${booking.reservedUntil ? `<div>Hold until <strong style="color:#0f172a;">${booking.reservedUntil}</strong></div>` : ""}
          </div>
        </div>
      </div>
        ${
          kind === "invoice"
            ? `<div style="margin-top:10px;font-size:12px;color:#475569;">
                 <strong>Invoice</strong> - detailed invoice lines.
               </div>`
            : `<div style="margin-top:10px;font-size:12px;color:#475569;">
                 <strong>Confirmation</strong> - booking recap.
               </div>`
        }
      <div style="margin-top:14px;">
        <h3 style="margin:0 0 6px 0;font-size:14px;font-weight:800;">Rooming</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #e5e7eb;background:#f8fafc;">Chambre</th>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #e5e7eb;background:#f8fafc;">Occupants</th>
            </tr>
          </thead>
          <tbody>
            ${booking.rooms
              .map((room) => {
                const occ = room.occupants.map((o) => `${o.type}${o.name ? ` - ${o.name}` : ""}`).join(", ");
                return `<tr>
                  <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;">${room.roomType}</td>
                  <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;">${occ}</td>
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
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #e5e7eb;background:#f8fafc;">Type</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:1px solid #e5e7eb;background:#f8fafc;">Qté</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:1px solid #e5e7eb;background:#f8fafc;">PU</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:1px solid #e5e7eb;background:#f8fafc;">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;">ADL</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${totals.pax.ADL}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatMoney(totals.pricing.adultUnit)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatMoney(totals.pax.ADL * totals.pricing.adultUnit)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;">CHD</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${totals.pax.CHD}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatMoney(totals.pricing.childUnit)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatMoney(totals.pax.CHD * totals.pricing.childUnit)}</td>
            </tr>
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;">INF</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${totals.pax.INF}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatMoney(totals.pricing.infantUnit)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatMoney(totals.pax.INF * totals.pricing.infantUnit)}</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-top:10px;">
          <div style="width:320px;border:1px solid #e5e7eb;border-radius:12px;padding:10px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#475569;">
              <span>Commission agence</span>
              <span>${formatMoney(totals.commissionTotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:14px;font-weight:800;">
              <span>Total</span>
              <span>${formatMoney(booking.payment.totalPrice)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:#475569;">
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
      pdf.text(`TravelOps Platform`, 12, h - 10);
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
      const haystack = `${pkg?.general.productName ?? ""} ${pkg?.general.productCode ?? ""} ${booking.bookingType} ${booking.id}`;
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

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSort("recent");
  };

  const hasNoBookings = !isLoading && bookings.length === 0;
  const hasNoResults = !isLoading && filtered.length === 0 && bookings.length > 0;

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
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm shadow-black/5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                >
                  <option value="recent">Recents</option>
                  <option value="priceAsc">Prix min +</option>
                  <option value="priceDesc">Prix min -</option>
                  <option value="stockDesc">Stock -</option>
                </select>
                <Button variant="ghost" size="sm" className="whitespace-nowrap" aria-label="Open filters">
                  <Filter className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    Filters
                  </span>
                </Button>
                <Button variant="ghost" size="sm" className="whitespace-nowrap" aria-label="Customize columns">
                  <Columns className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    Columns
                  </span>
                </Button>
              </>
            }
            chips={bookingStatusChips}
            rightActions={
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
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
            <div className="rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="min-w-[720px]">
                    <THead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur dark:bg-slate-900/80">
                      <TR>
                        <TH className="font-semibold tracking-[0.2em] text-xs text-slate-500">Package</TH>
                        <TH className="font-semibold tracking-[0.2em] text-xs text-slate-500">Type</TH>
                        <TH className="font-semibold tracking-[0.2em] text-xs text-slate-500">Pax</TH>
                        <TH className="font-semibold tracking-[0.2em] text-xs text-slate-500">Payment</TH>
                        <TH className="font-semibold tracking-[0.2em] text-xs text-slate-500">Statut</TH>
                        <TH className="font-semibold tracking-[0.2em] text-xs text-slate-500">Hold</TH>
                        <TH className="text-right font-semibold tracking-[0.2em] text-xs text-slate-500">
                          Actions
                        </TH>
                      </TR>
                    </THead>
                    <TBody>
                      {filtered.map((booking) => {
                        const pkg = packageMap[booking.packageId];
                        const status = paymentStatus(booking.payment);
                        const statusClass =
                          status.label === "paid"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-200"
                            : status.label === "partial"
                              ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200"
                              : status.label === "overpaid"
                                ? "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-900/20 dark:text-indigo-200"
                                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200";

                        return (
                          <TR key={booking.id} className="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <TD className="min-w-[220px]">
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
                        <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                          {pkg?.general.productName ?? "Package inconnu"}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-300">
                          {pkg?.general.productCode ?? "-"} - {pkg?.flights.destination ?? "-"}
                        </p>
                      </div>
                            </TD>
                            <TD>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {booking.bookingType}
                              </span>
                            </TD>
                            <TD>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {booking.paxTotal}
                              </span>
                            </TD>
                            <TD>
                              <span className="text-sm text-slate-700 dark:text-slate-200">
                                {formatMoney(booking.payment.paidAmount)}/{formatMoney(booking.payment.totalPrice)}
                              </span>
                            </TD>
                            <TD>
                              <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", statusClass)}>
                                {status.text}
                              </span>
                            </TD>
                            <TD>
                              <span className="text-sm text-slate-600 dark:text-slate-300">{booking.reservedUntil || "-"}</span>
                            </TD>
                            <TD className="text-right pr-4">
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
                          </TR>
                        );
                      })}
                    </TBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Drawer
        isOpen={Boolean(drawerBooking)}
        onClose={closeDrawer}
        title={drawerBooking ? `Booking ${drawerBooking.id.slice(0, 6)}` : "Booking details"}
        description={
          drawerBooking
            ? packageMap[drawerBooking.packageId]?.general.productName ?? "Booking en cours"
            : undefined
        }
      >
        {drawerBooking ? (
          <div className="space-y-4 py-2 text-sm text-slate-700 dark:text-slate-200">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Package
              </p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {packageMap[drawerBooking.packageId]?.general.productName ?? "Package inconnu"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                #{packageMap[drawerBooking.packageId]?.general.productCode ?? "—"}
              </p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Type
                </p>
                <p className="text-base text-slate-900 dark:text-white">{drawerBooking.bookingType}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Pax
                </p>
                <p className="text-base text-slate-900 dark:text-white">{drawerBooking.paxTotal}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Payment
                </p>
                <p className="text-base text-slate-900 dark:text-white">
                  {formatMoney(drawerBooking.payment.paidAmount)}/{formatMoney(drawerBooking.payment.totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Hold until
                </p>
                <p className="text-base text-slate-900 dark:text-white">{drawerBooking.reservedUntil || "-"}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Status
              </p>
              <span className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700">
                {paymentStatus(drawerBooking.payment).text}
              </span>
            </div>
            <div className="pt-4">
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
            </div>
          </div>
        ) : null}
      </Drawer>

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
