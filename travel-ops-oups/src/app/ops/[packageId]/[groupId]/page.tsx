'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  PlaneTakeoff,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useProductStore } from "../../../../stores/useProductStore";
import { useOpsStatusStore } from "../../../../stores/useOpsStatusStore";
import type { OpsGroup, OpsPaymentStep, OpsStatus, OpsTimelineItem, Supplier, TravelPackage } from "../../../../types";
import { daysUntil, groupAlerts, paymentStepStatus, supplierDeadlineStatus } from "../../../../lib/ops";
import { mapProductToTravelPackage } from "../../../../lib/productAdapter";

type TabKey = "overview" | "air" | "land" | "team";

const tabStorageKey = (packageId: string, groupId: string) =>
  `travelops:ops-tab:${packageId}:${groupId}`;

const applyOpsOverrides = (pkg: TravelPackage, overrides: Record<string, OpsStatus>): TravelPackage => {
  if (!pkg.opsProject) return pkg;
  const groups = pkg.opsProject.groups.map((group) => ({
    ...group,
    status: overrides[`${pkg.id}:${group.id}`] ?? group.status,
  }));
  return { ...pkg, opsProject: { ...pkg.opsProject, groups } };
};

export default function OpsGroupPage() {
  const params = useParams<{ packageId: string; groupId: string }>();
  const packageId = params.packageId;
  const groupId = params.groupId;

  const canValidate = true;

  const products = useProductStore((state) => state.products);
  const statusByKey = useOpsStatusStore((state) => state.statusByKey);
  const updateOpsGroupStatus = useOpsStatusStore((state) => state.setStatus);
  const packages = useMemo(
    () => products.map(mapProductToTravelPackage).map((pkg) => applyOpsOverrides(pkg, statusByKey)),
    [products, statusByKey]
  );

  const pkg = packages.find((p) => p.id === packageId);
  const groupFromPackages = pkg?.opsProject?.groups.find((g) => g.id === groupId) as OpsGroup | undefined;
  const [groupState, setGroupState] = useState<OpsGroup | null>(groupFromPackages ?? null);

  useEffect(() => {
    setGroupState(groupFromPackages ?? null);
  }, [groupFromPackages]);

  const activeGroup = groupState ?? groupFromPackages;

  const updateGroupState = (updater: (current: OpsGroup) => OpsGroup) => {
    setGroupState((prev) => (prev ? updater(prev) : prev));
  };

  const handleStatusChange = (next: OpsStatus) => {
    if (!pkg || !activeGroup) return;
    updateOpsGroupStatus(pkg.id, activeGroup.id, next);
    updateGroupState((current) => ({ ...current, status: next }));
  };

  const addSupplier = (supplier: Supplier) =>
    updateGroupState((current) => ({ ...current, suppliers: [...current.suppliers, supplier] }));
  const removeSupplier = (idx: number) =>
    updateGroupState((current) => ({
      ...current,
      suppliers: current.suppliers.filter((_, index) => index !== idx),
    }));
  const addCostStep = (step: OpsPaymentStep) =>
    updateGroupState((current) => ({ ...current, costs: [...current.costs, step] }));
  const updateCostStep = (idx: number, update: Partial<OpsPaymentStep>) =>
    updateGroupState((current) => ({
      ...current,
      costs: current.costs.map((cost, index) => (index === idx ? { ...cost, ...update } : cost)),
    }));
  const removeCostStep = (idx: number) =>
    updateGroupState((current) => ({ ...current, costs: current.costs.filter((_, index) => index !== idx) }));
  const addTimelineItem = (item: OpsTimelineItem) =>
    updateGroupState((current) => ({ ...current, timeline: [...current.timeline, item] }));
  const updateTimelineItem = (idx: number, update: Partial<OpsTimelineItem>) =>
    updateGroupState((current) => ({
      ...current,
      timeline: current.timeline.map((entry, index) => (index === idx ? { ...entry, ...update } : entry)),
    }));
  const removeTimelineItem = (idx: number) =>
    updateGroupState((current) => ({
      ...current,
      timeline: current.timeline.filter((_, index) => index !== idx),
    }));

  const localKey = tabStorageKey(packageId, groupId);
  const [tab, setTab] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "overview";
    const stored = window.localStorage.getItem(localKey) as TabKey | null;
    return stored ?? "overview";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(localKey, tab);
  }, [localKey, tab]);

  const dday = daysUntil(activeGroup?.departureDate);
  const alerts = activeGroup ? groupAlerts(activeGroup) : { overdueCosts: 0, overdueSuppliers: 0 };
  const title = pkg && activeGroup ? `${pkg.general.productName} ${activeGroup.flightLabel}` : "Ops group";

  if (!pkg || !activeGroup) {
    return (
      <div className="section-shell space-y-3">
        <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">Groupe Ops introuvable.</p>
        <Link
          href="/ops"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] dark:border-[var(--border)] dark:text-[var(--token-inverse)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour Ops
        </Link>
      </div>
    );
  }

  const group = activeGroup;

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.08em] text-primary">Ops Manager</p>
            <h1 className="font-heading text-2xl font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{title}</h1>
            <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">
              Départ: {group.departureDate || "—"}
              {dday !== null ? ` • J-${dday >= 0 ? dday : 0}` : ""} • Statut:{" "}
              <span className="font-semibold">{group.status}</span>
              {group.validationDate ? (
                <span className="text-[var(--muted)] dark:text-[var(--muted)]">
                  {" "}
                  • validé le {group.validationDate.slice(0, 10)}
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/ops"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] dark:border-[var(--border)] dark:text-[var(--token-inverse)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour Ops
            </Link>

            {canValidate ? (
              group.status === "validated" ? (
                <button
                  onClick={() => handleStatusChange("pending_validation")}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] dark:border-[var(--border)] dark:text-[var(--token-inverse)]"
                  type="button"
                >
                  <Clock className="h-4 w-4 text-[var(--token-accent)]" />
                  Rouvrir
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange("validated")}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--token-accent)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)] shadow-sm"
                  type="button"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Valider
                </button>
              )
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr,340px]">
          <div className="space-y-4">
            <TabList tab={tab} setTab={setTab} />
            {tab === "overview" ? <OverviewTab group={group} alerts={alerts} /> : null}
            {tab === "air" ? <AirTab group={group} /> : null}
            {tab === "land" ? (
              <LandTab
                group={group}
                onAddSupplier={addSupplier}
                onRemoveSupplier={removeSupplier}
                onAddCost={addCostStep}
                onUpdateCost={updateCostStep}
                onRemoveCost={removeCostStep}
              />
            ) : null}
            {tab === "team" ? (
              <TeamTab
                group={group}
                onAddTimeline={addTimelineItem}
                onUpdateTimeline={updateTimelineItem}
                onRemoveTimeline={removeTimelineItem}
              />
            ) : null}
          </div>

          <aside className="space-y-3">
            <div className="card space-y-2 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Alertes
              </div>
              <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">
                Retards paiements: <span className="font-semibold">{alerts.overdueCosts}</span>
              </p>
              <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">
                Deadlines fournisseurs: <span className="font-semibold">{alerts.overdueSuppliers}</span>
              </p>
            </div>
            <div className="card p-4 text-xs text-[var(--muted)] dark:text-[var(--muted)]">
              Tab persistant: <span className="font-semibold">{tab}</span>
            </div>
          </aside>
        </div>
    </div>
  );
}

function TabList({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <ShieldCheck className="h-4 w-4" /> },
    { key: "air", label: "Air", icon: <PlaneTakeoff className="h-4 w-4" /> },
    { key: "land", label: "Land", icon: <WalletCards className="h-4 w-4" /> },
    { key: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            tab === t.key ? "border border-[var(--token-accent)]/30 bg-[var(--token-accent)]/10 text-[var(--token-accent)]" : "bg-[var(--token-surface-2)] text-[var(--text)] dark:bg-[var(--token-text)]/60 dark:text-[var(--muted)]"
          }`}
          type="button"
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function OverviewTab({
  group,
  alerts,
}: {
  group: OpsGroup;
  alerts: { overdueCosts: number; overdueSuppliers: number };
}) {
  const dday = daysUntil(group.departureDate);
  return (
    <div className="section-shell space-y-3">
      <h2 className="font-heading text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">Résumé</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Départ" value={group.departureDate || "—"} />
        <Info label="J-x" value={dday !== null ? `${dday}` : "—"} />
        <Info label="Statut" value={group.status} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Info label="Fournisseurs" value={`${group.suppliers.length}`} />
        <Info label="Étapes paiement" value={`${group.costs.length}`} />
      </div>
      {alerts.overdueCosts || alerts.overdueSuppliers ? (
        <div className="rounded-lg border border-[var(--token-accent)]/30 bg-[var(--token-accent)]/10 px-4 py-3 text-sm text-[var(--token-accent)]">
          Alertes: {alerts.overdueCosts} paiement(s) en retard, {alerts.overdueSuppliers} deadline(s) fournisseur(s)
          dépassée(s).
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--token-surface-2)] px-4 py-3 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--muted)]">
          Aucun retard détecté.
        </div>
      )}
    </div>
  );
}

function AirTab({ group }: { group: OpsGroup }) {
  return (
    <div className="section-shell space-y-2">
      <h2 className="font-heading text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">Air</h2>
      <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">
        {group.flightLabel}. Cette section est prête à être enrichie (PNR, billets, manifest, contraintes bagages,
        etc.).
      </p>
    </div>
  );
}

function LandTab({
  group,
  onAddSupplier,
  onRemoveSupplier,
  onAddCost,
  onUpdateCost,
  onRemoveCost,
}: {
  group: OpsGroup;
  onAddSupplier: (s: Supplier) => void;
  onRemoveSupplier: (idx: number) => void;
  onAddCost: (c: OpsPaymentStep) => void;
  onUpdateCost: (idx: number, u: Partial<OpsPaymentStep>) => void;
  onRemoveCost: (idx: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="section-shell space-y-3">
        <h2 className="font-heading text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">Land</h2>
        <SupplierEditor suppliers={group.suppliers} onAdd={onAddSupplier} onRemove={onRemoveSupplier} />
      </div>
      <div className="section-shell space-y-3">
        <h3 className="font-heading text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">Dépôts / Soldes</h3>
        <CostEditor costs={group.costs} onAdd={onAddCost} onUpdate={onUpdateCost} onRemove={onRemoveCost} />
      </div>
    </div>
  );
}

function TeamTab({
  group,
  onAddTimeline,
  onUpdateTimeline,
  onRemoveTimeline,
}: {
  group: OpsGroup;
  onAddTimeline: (t: OpsTimelineItem) => void;
  onUpdateTimeline: (idx: number, u: Partial<OpsTimelineItem>) => void;
  onRemoveTimeline: (idx: number) => void;
}) {
  return (
    <div className="section-shell space-y-3">
      <h2 className="font-heading text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">Timeline</h2>
      <TimelineEditor items={group.timeline} onAdd={onAddTimeline} onUpdate={onUpdateTimeline} onRemove={onRemoveTimeline} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] px-3 py-2 dark:border-[var(--border)]">
      <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{value}</p>
    </div>
  );
}

function SupplierEditor({
  suppliers,
  onAdd,
  onRemove,
}: {
  suppliers: Supplier[];
  onAdd: (s: Supplier) => void;
  onRemove: (idx: number) => void;
}) {
  const [draft, setDraft] = useState<Supplier>({ name: "", contact: "", cost: 0, deadline: "" });
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Nom fournisseur"
          className="min-w-[180px] flex-1 rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
        />
        <input
          value={draft.deadline ?? ""}
          onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
          type="date"
          className="rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
        />
        <input
          value={draft.cost ?? 0}
          onChange={(e) => setDraft({ ...draft, cost: Number(e.target.value) || 0 })}
          type="number"
          className="w-28 rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
          placeholder="Coût"
        />
        <button
          onClick={() => {
            if (!draft.name.trim()) return;
            onAdd(draft);
            setDraft({ name: "", contact: "", cost: 0, deadline: "" });
          }}
          className="rounded-md bg-[var(--token-accent)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)]"
          type="button"
        >
          Ajouter
        </button>
      </div>

      {suppliers.length ? (
        <div className="space-y-2">
          {suppliers.map((s, idx) => {
            const status = supplierDeadlineStatus(s);
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm dark:border-[var(--border)]"
              >
                <div>
                  <p className="font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{s.name}</p>
                  <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">
                    {s.deadline ? `Deadline ${s.deadline}` : "—"} • {s.cost ? `${s.cost} DZD` : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {status === "overdue" ? (
                    <span className="rounded-full bg-[var(--token-danger)]/10 px-3 py-1 text-xs font-semibold text-[var(--token-danger)]">
                      En retard
                    </span>
                  ) : null}
                  <button onClick={() => onRemove(idx)} className="text-xs font-semibold text-[var(--token-danger)]" type="button">
                    Suppr.
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">Aucun fournisseur.</p>
      )}
    </div>
  );
}

function CostEditor({
  costs,
  onAdd,
  onUpdate,
  onRemove,
}: {
  costs: OpsPaymentStep[];
  onAdd: (c: OpsPaymentStep) => void;
  onUpdate: (idx: number, u: Partial<OpsPaymentStep>) => void;
  onRemove: (idx: number) => void;
}) {
  const [draft, setDraft] = useState<OpsPaymentStep>({ label: "Dépôt", amount: 0, dueDate: "", paid: false });
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className="min-w-[180px] flex-1 rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
          placeholder="Label"
        />
        <input
          type="number"
          value={draft.amount}
          onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) || 0 })}
          className="w-28 rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
          placeholder="Montant"
        />
        <input
          type="date"
          value={draft.dueDate ?? ""}
          onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
          className="rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
        />
        <label className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--muted)]">
          <input
            type="checkbox"
            checked={draft.paid ?? false}
            onChange={(e) => setDraft({ ...draft, paid: e.target.checked })}
          />
          Payé
        </label>
        <button
          onClick={() => {
            if (!draft.label.trim()) return;
            onAdd(draft);
            setDraft({ label: "Dépôt", amount: 0, dueDate: "", paid: false });
          }}
          className="rounded-md bg-[var(--token-accent)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)]"
          type="button"
        >
          Ajouter
        </button>
      </div>

      {costs.length ? (
        <div className="space-y-2">
          {costs.map((c, idx) => {
            const status = paymentStepStatus(c);
            return (
              <div
                key={idx}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm dark:border-[var(--border)]"
              >
                <div>
                  <p className="font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">
                    {c.label} • {c.amount} DZD
                  </p>
                  <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">
                    {c.dueDate ? `Échéance ${c.dueDate}` : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      status === "paid"
                        ? "bg-[var(--token-primary)]/10 text-[var(--token-primary)]"
                        : status === "overdue"
                          ? "bg-[var(--token-danger)]/10 text-[var(--token-danger)]"
                          : "bg-[var(--token-accent)]/10 text-[var(--token-accent)]"
                    }`}
                  >
                    {status === "paid" ? "Payé" : status === "overdue" ? "En retard" : "À payer"}
                  </span>
                  <button
                    onClick={() => onUpdate(idx, { paid: !c.paid })}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text)] dark:border-[var(--border)] dark:text-[var(--muted)]"
                    type="button"
                  >
                    Toggle payé
                  </button>
                  <button onClick={() => onRemove(idx)} className="text-xs font-semibold text-[var(--token-danger)]" type="button">
                    Suppr.
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">Aucun paiement planifié.</p>
      )}
    </div>
  );
}

function TimelineEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: OpsTimelineItem[];
  onAdd: (t: OpsTimelineItem) => void;
  onUpdate: (idx: number, u: Partial<OpsTimelineItem>) => void;
  onRemove: (idx: number) => void;
}) {
  const [draft, setDraft] = useState<OpsTimelineItem>({
    title: "Étape",
    date: "",
    note: "",
    kind: "info",
  });

  const sorted = useMemo(() => {
    return items
      .map((item, index) => ({ item, index }))
      .sort((a, b) => (a.item.date || "").localeCompare(b.item.date || ""));
  }, [items]);

  const kindValue = (draft.kind ?? "info") as NonNullable<OpsTimelineItem["kind"]>;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={kindValue}
          onChange={(e) =>
            setDraft({ ...draft, kind: e.target.value as NonNullable<OpsTimelineItem["kind"]> })
          }
          className="rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
        >
          <option value="info">Info</option>
          <option value="deadline">Deadline</option>
          <option value="risk">Risque</option>
          <option value="done">Terminé</option>
        </select>
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Titre"
          className="min-w-[180px] flex-1 rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
        />
        <input
          type="date"
          value={draft.date ?? ""}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          className="rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
        />
        <input
          value={draft.note ?? ""}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          placeholder="Note"
          className="min-w-[180px] flex-1 rounded-md border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-sm text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--token-surface)]/30 dark:text-[var(--token-inverse)]"
        />
        <button
          onClick={() => {
            if (!draft.title.trim()) return;
            onAdd(draft);
            setDraft({ title: "Étape", date: "", note: "", kind: "info" });
          }}
          className="rounded-md bg-[var(--token-accent)] px-4 py-2 text-sm font-semibold text-[var(--token-inverse)]"
          type="button"
        >
          Ajouter
        </button>
      </div>

      {sorted.length ? (
        <div className="space-y-2">
          {sorted.map(({ item, index }) => {
            const kind = item.kind ?? "info";
            const pill =
              kind === "done"
                ? "bg-[var(--token-primary)]/10 text-[var(--token-primary)]"
                : kind === "deadline"
                  ? "bg-[var(--token-accent)]/10 text-[var(--token-accent)]"
                  : kind === "risk"
                    ? "bg-[var(--token-danger)]/10 text-[var(--token-danger)]"
                    : "bg-[var(--token-surface-2)] text-[var(--text)]";

            return (
              <div
                key={`${index}-${item.title}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm dark:border-[var(--border)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pill}`}>{kind}</span>
                    <p className="font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{item.title}</p>
                    <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">{item.date || ""}</p>
                  </div>
                  {item.note ? <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">{item.note}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdate(index, { kind: kind === "done" ? "info" : "done" })}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text)] dark:border-[var(--border)] dark:text-[var(--muted)]"
                    type="button"
                  >
                    Toggle done
                  </button>
                  <button onClick={() => onRemove(index)} className="text-xs font-semibold text-[var(--token-danger)]" type="button">
                    Suppr.
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">Aucun élément timeline.</p>
      )}
    </div>
  );
}




