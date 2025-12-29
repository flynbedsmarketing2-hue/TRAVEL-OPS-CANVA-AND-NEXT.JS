'use client';

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Megaphone,
  Package2,
  PlaneTakeoff,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { cn } from "../../components/ui/cn";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { StatCard } from "../../components/ui/StatCard";
import { buttonClassName } from "../../components/ui/button";
import { useBookingStore } from "../../stores/useBookingStore";
import { useCrmStore, leadStages } from "../../stores/useCrmStore";
import { useMarketingStore } from "../../stores/useMarketingStore";
import { useProductStore } from "../../stores/useProductStore";
import { useTaskStore } from "../../stores/useTaskStore";
import type { ContentStatus, LeadStage } from "../../types";
import { mapProductToTravelPackage } from "../../lib/productAdapter";

const contentStatusLabels: Record<ContentStatus, string> = {
  idea: "Idea",
  in_production: "In production",
  scheduled: "Scheduled",
  posted: "Posted",
};

const isSoon = (iso: string | undefined, days = 7) => {
  if (!iso) return false;
  const now = new Date();
  const d = new Date(iso);
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
};

export default function DashboardPage() {
  const products = useProductStore((state) => state.products);
  const packages = useMemo(() => products.map(mapProductToTravelPackage), [products]);
  const { bookings } = useBookingStore();
  const tasks = useTaskStore((state) => state.tasks);
  const campaigns = useMarketingStore((state) => state.campaigns);
  const content = useMarketingStore((state) => state.content);

  const publishedPkgs = packages.filter((pkg) => pkg.status === "published");
  const draftPkgs = packages.filter((pkg) => pkg.status === "draft");
  const published = publishedPkgs.length;
  const draft = draftPkgs.length;
  const lowStock = packages.filter((pkg) => pkg.general.stock <= 5);

  const pendingOps = packages.flatMap((pkg) =>
    pkg.opsProject ? pkg.opsProject.groups.filter((g) => g.status === "pending_validation") : []
  );

  const unpaidBookings = bookings.filter((b) => !b.payment.isFullyPaid && b.payment.totalPrice > 0);
  const optionExpiring = bookings.filter((b) => b.bookingType === "En option" && isSoon(b.reservedUntil ?? "", 3));

  const upcomingDepartures = packages
    .map((pkg) => {
      const dates = pkg.flights.flights.map((f) => f.departureDate).filter(Boolean).sort();
      return dates.length ? { pkg, nextDate: dates[0] } : null;
    })
    .filter(Boolean)
    .slice(0, 5) as { pkg: (typeof packages)[number]; nextDate: string }[];

  const totalStock = packages.reduce((sum, pkg) => sum + (pkg.general.stock || 0), 0);
  const bookedPaxPerPackage = (pkgId: string) =>
    bookings.filter((b) => b.packageId === pkgId).reduce((sum, b) => sum + b.paxTotal, 0);

  const alerts: { label: string; level: "info" | "warn" }[] = [];
  lowStock.forEach((pkg) =>
    alerts.push({
      label: `Low stock: ${pkg.general.productName} (${pkg.general.stock} pax)`,
      level: "warn",
    })
  );
  optionExpiring.forEach((b) =>
    alerts.push({
      label: `Option to confirm: booking ${b.id.slice(0, 6)} (package ${b.packageId})`,
      level: "warn",
    })
  );
  pendingOps.forEach((g) =>
    alerts.push({
      label: `Ops awaiting validation: ${g.flightLabel}`,
      level: "info",
    })
  );

  const todos: string[] = [];
  if (pendingOps.length) todos.push(`${pendingOps.length} ops groups need validation`);
  if (unpaidBookings.length) todos.push(`${unpaidBookings.length} incomplete payment(s)`);
  if (optionExpiring.length) todos.push(`${optionExpiring.length} options expiring soon`);
  if (!todos.length) todos.push("Nothing pending right now.");

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const leads = useCrmStore((state) => state.leads);
  const stageTotals = leadStages.reduce<Record<LeadStage, number>>((acc, stage) => {
    acc[stage.value] = 0;
    return acc;
  }, {} as Record<LeadStage, number>);
  leads.forEach((lead) => {
    stageTotals[lead.stage] = (stageTotals[lead.stage] ?? 0) + 1;
  });
  const today = new Date();
  const referenceTime = today.getTime();
  const debugStamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")} ${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;
  const overdueFollowups = leads.filter(
    (lead) => lead.nextContact && new Date(lead.nextContact).getTime() < referenceTime
  ).length;
  const newLeads = stageTotals["new"] ?? 0;

  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = startOfDay + 86_399_999;

  const tasksDueToday = tasks
    .filter((task) => task.dueDate)
    .filter((task) => {
      const dueTime = new Date(task.dueDate!).getTime();
      return dueTime >= startOfDay && dueTime <= endOfDay;
    })
    .sort((a, b) => new Date(a.dueDate ?? "").getTime() - new Date(b.dueDate ?? "").getTime());
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate).getTime() < startOfDay
  );
  const tasksTodayPreview = tasksDueToday.slice(0, 3);

  const activeCampaigns = campaigns.filter((campaign) => {
    const start = new Date(campaign.startDate);
    const end = campaign.endDate ? new Date(campaign.endDate) : null;
    return start <= today && (!end || end >= today);
  });

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const contentThisWeek = content
    .filter((item) => {
      if (!item.publishDate) return false;
      const publishDate = new Date(item.publishDate);
      return publishDate >= weekStart && publishDate <= weekEnd;
    })
    .sort((a, b) => new Date(a.publishDate ?? "").getTime() - new Date(b.publishDate ?? "").getTime());

  const contentThisWeekPreview = contentThisWeek.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--token-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
          UI Debug Build: {debugStamp}
        </span>
      </div>
      <PageHeader
        eyebrow="Dashboard"
        title="Today overview"
        subtitle="Compact snapshot of sales, ops, and marketing."
        actions={
          <>
            <Link href="/packages/new" className={buttonClassName({ variant: "primary" })}>
              New package
            </Link>
            <Link href="/sales" className={buttonClassName({ variant: "outline" })}>
              Sales
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Published packages"
          value={published}
          sublabel="Live offers"
          icon={<PlaneTakeoff className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard label="Draft packages" value={draft} icon={<Package2 className="h-5 w-5" />} />
        <StatCard label="Bookings" value={bookings.length} icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard label="Total stock (pax)" value={totalStock} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </span>
              CRM snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--token-surface-2)] p-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">New leads</p>
                <p className="text-2xl font-semibold text-[var(--text)]">{newLeads}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--token-surface-2)] p-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Total CRM</p>
                <p className="text-2xl font-semibold text-[var(--text)]">{leads.length}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--token-surface-2)] p-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Overdue follow-ups</p>
                <p className="text-2xl font-semibold text-[var(--text)]">{overdueFollowups}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {leadStages.map((stage) => (
                <span
                  key={stage.value}
                  className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text)]"
                >
                  {stage.label}: {stageTotals[stage.value]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardList className="h-4 w-4" />
                </span>
                Tasks due today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--token-surface-2)] p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Due today</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text)]">{tasksDueToday.length}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--token-surface)] p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Overdue</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--token-danger)]">{overdueTasks.length}</p>
                </div>
              </div>
              {tasksTodayPreview.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No tasks are due today.</p>
              ) : (
                <ul className="space-y-2 text-sm text-[var(--text)]">
                  {tasksTodayPreview.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text)]">{task.title}</p>
                        <p className="text-xs text-[var(--muted)]">{task.owner}</p>
                      </div>
                      <span className="text-xs text-[var(--muted)]">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end">
                <Link href="/tasks" className={buttonClassName({ variant: "ghost" })}>
                  View tasks
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="h-4 w-4" />
                </span>
                Marketing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--token-surface-2)] p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Active campaigns</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text)]">{activeCampaigns.length}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--token-surface)] p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Content this week</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text)]">{contentThisWeek.length}</p>
                </div>
              </div>
              {contentThisWeekPreview.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No content scheduled this week.</p>
              ) : (
                <div className="space-y-2">
                  {contentThisWeekPreview.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text)]">{item.title}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {item.platform} - {new Date(item.publishDate ?? "").toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        {contentStatusLabels[item.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Week of {weekStart.toLocaleDateString()}</span>
                <Link href="/marketing/campaigns" className={buttonClassName({ variant: "ghost" })}>
                  Manage campaigns
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">Today</p>
            <p className="text-sm text-[var(--muted)]">To do, alerts, and departures at a glance.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </span>
                To do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[var(--text)]">
                {todos.map((todo, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--token-accent)]" />
                    <span>{todo}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bell className="h-4 w-4" />
                </span>
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No alerts.</p>
              ) : (
                alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
                      alert.level === "warn"
                        ? "border-[var(--token-accent)]/30 bg-[var(--token-accent)]/10 text-[var(--token-accent)]"
                        : "border-[var(--border)] bg-[var(--token-surface-2)] text-[var(--text)]"
                    )}
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{alert.label}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock3 className="h-4 w-4" />
              </span>
                Upcoming departures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingDepartures.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No departures scheduled.</p>
              ) : (
                upcomingDepartures.map(({ pkg, nextDate }) => (
                  <div
                    key={pkg.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--text)]">{pkg.general.productName}</p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {pkg.flights.destination} - {nextDate}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-primary">
                      Stock {pkg.general.stock} | Reserve {bookedPaxPerPackage(pkg.id)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No bookings yet.</p>
              ) : (
                recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--text)]">
                        Booking <span className="font-mono">{b.id.slice(0, 6)}</span> - {b.bookingType}
                      </p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        Pax {b.paxTotal} | Paiement {b.payment.paidAmount}/{b.payment.totalPrice}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--muted)] font-mono">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

