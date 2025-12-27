'use client';

import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import RowActionsMenu from "../../../components/RowActionsMenu";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "../../../components/ui/table";
import { useMarketingStore } from "../../../stores/useMarketingStore";
import type { Campaign, CampaignChannel } from "../../../types";

const channelLabels: Record<CampaignChannel, string> = {
  email: "Email",
  events: "Events",
  social: "Social",
  organic: "Organic",
  partner: "Partners",
};

type CampaignForm = Omit<Campaign, "id" | "createdAt" | "updatedAt">;

const defaultCampaignForm: CampaignForm = {
  name: "",
  channel: "email",
  budgetPlanned: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  linkedPackageIds: [],
  notes: "",
};

const omitCampaignMetadata = (campaign: Campaign): CampaignForm => {
  const { id, createdAt, updatedAt, ...rest } = campaign;
  void id;
  void createdAt;
  void updatedAt;
  return rest;
};

type CampaignModalProps = {
  open: boolean;
  initial?: Campaign | null;
  onClose: () => void;
  onSave: (payload: CampaignForm) => void;
};

function CampaignModal({ open, initial, onClose, onSave }: CampaignModalProps) {
  const initialForm = initial ? omitCampaignMetadata(initial) : { ...defaultCampaignForm };
  const [form, setForm] = useState<CampaignForm>(initialForm);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--token-text)]/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)]/60 bg-[var(--token-surface)]/95 p-6 shadow-md dark:border-[var(--border)] dark:bg-[var(--token-surface)]/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">
            {initial ? "Edit campaign" : "Add campaign"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/60"
          >
            Close
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Channel
            <select
              value={form.channel}
              onChange={(event) => setForm({ ...form, channel: event.target.value as CampaignChannel })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              {Object.entries(channelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Planned budget
            <input
              type="number"
              min={0}
              value={form.budgetPlanned}
              onChange={(event) => setForm({ ...form, budgetPlanned: Number(event.target.value) })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Start
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            End
            <input
              type="date"
              value={form.endDate ?? ""}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="mt-4 text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
          Notes
          <textarea
            value={form.notes ?? ""}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="mt-1 h-24 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>
        <label className="mt-4 text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
          Linked packages (IDs separated by commas)
          <input
            value={form.linkedPackageIds.join(",")}
            onChange={(event) =>
              setForm({
                ...form,
                linkedPackageIds: event.target.value
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
              })
            }
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save campaign
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useMarketingStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCampaign, setModalCampaign] = useState<Campaign | null>(null);

  const openModal = (campaign?: Campaign) => {
    setModalCampaign(campaign ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalCampaign(null);
  };

  const handleSave = (payload: CampaignForm) => {
    if (modalCampaign) {
      updateCampaign(modalCampaign.id, payload);
    } else {
      addCampaign(payload);
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketing"
        title="Campaigns"
        subtitle="Plan the next push across channels."
        actions={
          <Button variant="primary" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            New campaign
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {campaigns.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted)]">No campaigns saved.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Channel</TH>
                  <TH>Budget</TH>
                  <TH>Period</TH>
                  <TH>Packages</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {campaigns.map((campaign) => (
                  <TR key={campaign.id}>
                    <TD>
                      <p className="font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{campaign.name}</p>
                      <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">{campaign.notes ?? "-"}</p>
                    </TD>
                    <TD>{channelLabels[campaign.channel] ?? campaign.channel}</TD>
                    <TD>{campaign.budgetPlanned} DZD</TD>
                    <TD>
                      {campaign.startDate} - {campaign.endDate ?? "Ongoing"}
                    </TD>
                    <TD>{campaign.linkedPackageIds.length}</TD>
                    <TD className="text-right">
                      <RowActionsMenu
                        actions={[
                          {
                            label: "Edit",
                            onClick: () => openModal(campaign),
                          },
                          {
                            label: "Delete",
                            tone: "danger",
                            onClick: () => deleteCampaign(campaign.id),
                          },
                        ]}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CampaignModal
        key={modalCampaign?.id ?? "campaign-modal"}
        open={modalOpen}
        initial={modalCampaign}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}

