'use client';

import { useMemo, useState } from "react";
import { Inbox, Plus } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import RowActionsMenu from "../../../components/RowActionsMenu";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { FilterBar } from "../../../components/ui/FilterBar";
import { Table, TBody, TD, THead, TH, TR } from "../../../components/ui/table";
import { useCrmStore, leadSources, leadStages } from "../../../stores/useCrmStore";
import type { Lead, LeadSource, LeadStage } from "../../../types";

type LeadFormState = Omit<Lead, "id" | "createdAt" | "updatedAt">;

const defaultFormState: LeadFormState = {
  name: "",
  company: "",
  stage: "new",
  source: "website",
  owner: "",
  email: "",
  phone: "",
  nextContact: "",
  lastContact: "",
  notes: "",
};

const omitLeadMetadata = (lead: Lead): LeadFormState => {
  const { id, createdAt, updatedAt, ...rest } = lead;
  void id;
  void createdAt;
  void updatedAt;
  return rest;
};

type LeadModalProps = {
  open: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSave: (payload: LeadFormState) => void;
};

function LeadModal({ open, lead, onClose, onSave }: LeadModalProps) {
  const initialForm = lead ? omitLeadMetadata(lead) : { ...defaultFormState };
  const [form, setForm] = useState<LeadFormState>(initialForm);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.name.trim() || !form.company.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--token-text)]/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border)]/60 bg-[var(--token-surface)]/95 p-6 shadow-md dark:border-[var(--border)] dark:bg-[var(--token-surface)]/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">
            {lead ? "Edit lead" : "Add lead"}
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
            Company
            <input
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Owner
            <input
              value={form.owner}
              onChange={(event) => setForm({ ...form, owner: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Next contact
            <input
              type="date"
              value={form.nextContact ?? ""}
              onChange={(event) => setForm({ ...form, nextContact: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Stage
            <select
              value={form.stage}
              onChange={(event) => setForm({ ...form, stage: event.target.value as LeadStage })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              {leadStages.map((stageOption) => (
                <option key={stageOption.value} value={stageOption.value}>
                  {stageOption.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
            Source
            <select
              value={form.source}
              onChange={(event) => setForm({ ...form, source: event.target.value as LeadSource })}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              {leadSources.map((sourceOption) => (
                <option key={sourceOption.value} value={sourceOption.value}>
                  {sourceOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-[var(--text)] dark:text-[var(--muted)]">
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="mt-1 h-24 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save lead
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead } = useCrmStore();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStage | "">("");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "">("");
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads
      .filter((lead) => (stageFilter ? lead.stage === stageFilter : true))
      .filter((lead) => (sourceFilter ? lead.source === sourceFilter : true))
      .filter((lead) => {
        if (!q) return true;
        return `${lead.name} ${lead.company} ${lead.owner ?? ""}`.toLowerCase().includes(q);
      });
  }, [leads, search, stageFilter, sourceFilter]);

  const openModal = (lead?: Lead) => {
    setModalLead(lead ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalLead(null);
  };

  const handleSave = (payload: LeadFormState) => {
    if (modalLead) {
      updateLead(modalLead.id, payload);
    } else {
      addLead(payload);
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Leads"
        subtitle="Manage company relationships and pipeline."
        actions={
          <Button variant="primary" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            Add lead
          </Button>
        }
      />

      <FilterBar
        value={search}
        onChange={setSearch}
        searchPlaceholder="Search leads..."
        filters={
          <>
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value as LeadStage | "")}
              className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--token-surface)] px-3 text-sm text-[var(--text)] shadow-sm"
            >
              <option value="">All stages</option>
              {leadStages.map((stageOption) => (
                <option key={stageOption.value} value={stageOption.value}>
                  {stageOption.label}
                </option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as LeadSource | "")}
              className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--token-surface)] px-3 text-sm text-[var(--text)] shadow-sm"
            >
              <option value="">All sources</option>
              {leadSources.map((sourceOption) => (
                <option key={sourceOption.value} value={sourceOption.value}>
                  {sourceOption.label}
                </option>
              ))}
            </select>
          </>
        }
        actions={
          <Button variant="primary" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            Add lead
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredLeads.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-8 w-8" />}
              title="No leads yet"
              description="Start building your pipeline by adding your first lead or importing a CSV."
              primaryAction={{ label: "Add lead", onClick: () => openModal() }}
              secondaryAction={{ label: "Import", onClick: () => window.alert("Import flow coming soon") }}
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Company</TH>
                  <TH>Stage</TH>
                  <TH>Source</TH>
                  <TH>Owner</TH>
                  <TH>Updated</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filteredLeads.map((lead) => (
                  <TR key={lead.id}>
                    <TD>
                      <p className="font-semibold text-[var(--text)] dark:text-[var(--token-inverse)]">{lead.name}</p>
                      <p className="text-xs text-[var(--muted)] dark:text-[var(--muted)]">{lead.email ?? lead.phone ?? "-"}</p>
                    </TD>
                    <TD>
                      <p className="text-sm text-[var(--text)] dark:text-[var(--muted)]">{lead.company}</p>
                    </TD>
                    <TD>
                      <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-semibold text-[var(--text)] dark:border-[var(--border)]">
                        {leadStages.find((item) => item.value === lead.stage)?.label ?? lead.stage}
                      </span>
                    </TD>
                    <TD>
                      <p className="text-sm text-[var(--muted)] dark:text-[var(--muted)]">
                        {leadSources.find((item) => item.value === lead.source)?.label ?? lead.source}
                      </p>
                    </TD>
                    <TD>
                      <p className="text-sm text-[var(--text)] dark:text-[var(--muted)]">{lead.owner ?? "-"}</p>
                    </TD>
                    <TD>
                      <p className="text-sm text-[var(--text)] dark:text-[var(--muted)]">
                        {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : "—"}
                      </p>
                    </TD>
                    <TD className="text-right">
                      <RowActionsMenu
                        actions={[
                          {
                            label: "Create task",
                            href: `/tasks?linkType=lead&linkId=${lead.id}`,
                          },
                          {
                            label: "Edit",
                            onClick: () => openModal(lead),
                          },
                          {
                            label: "Delete",
                            tone: "danger",
                            onClick: () => {
                              if (!window.confirm("Delete this lead?")) return;
                              deleteLead(lead.id);
                            },
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

      <LeadModal
        key={modalLead?.id ?? "lead-modal"}
        open={modalOpen}
        lead={modalLead}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}

