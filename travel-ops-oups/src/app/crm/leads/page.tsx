'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import RowActionsMenu from "../../../components/RowActionsMenu";
import { Button, buttonClassName } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
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

type LeadModalProps = {
  open: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSave: (payload: LeadFormState) => void;
};

function LeadModal({ open, lead, onClose, onSave }: LeadModalProps) {
  const [form, setForm] = useState<LeadFormState>(defaultFormState);

  useEffect(() => {
    if (lead) {
      const { id, createdAt, updatedAt, ...rest } = lead;
      setForm({ ...rest });
    } else {
      setForm({ ...defaultFormState });
    }
  }, [lead, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.name.trim() || !form.company.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200/60 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {lead ? "Modifier un lead" : "Ajouter un lead"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Fermer
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Nom
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Entreprise
            <input
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Téléphone
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Responsable
            <input
              value={form.owner}
              onChange={(event) => setForm({ ...form, owner: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Prochaine relance
            <input
              type="date"
              value={form.nextContact ?? ""}
              onChange={(event) => setForm({ ...form, nextContact: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Stage
            <select
              value={form.stage}
              onChange={(event) => setForm({ ...form, stage: event.target.value as LeadStage })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {leadStages.map((stageOption) => (
                <option key={stageOption.value} value={stageOption.value}>
                  {stageOption.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Source
            <select
              value={form.source}
              onChange={(event) => setForm({ ...form, source: event.target.value as LeadSource })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {leadSources.map((sourceOption) => (
                <option key={sourceOption.value} value={sourceOption.value}>
                  {sourceOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="mt-1 h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Enregistrer
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
        subtitle="Suivi des opportunités et relations commerciales."
        actions={
          <Button variant="primary" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            Ajouter un lead
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <label className="text-sm font-semibold text-slate-700">
            Recherche
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Nom, société, responsable..."
              />
            </div>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Stage
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value as LeadStage | "")}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {leadStages.map((stageOption) => (
                <option key={stageOption.value} value={stageOption.value}>
                  {stageOption.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Source
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as LeadSource | "")}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Toutes</option>
              {leadSources.map((sourceOption) => (
                <option key={sourceOption.value} value={sourceOption.value}>
                  {sourceOption.label}
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredLeads.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">Aucun lead correspondant.</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Nom</TH>
                  <TH>Entreprise</TH>
                  <TH>Stage</TH>
                  <TH>Source</TH>
                  <TH>Responsable</TH>
                  <TH>Prochaine relance</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filteredLeads.map((lead) => (
                  <TR key={lead.id}>
                    <TD>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{lead.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">{lead.email ?? lead.phone ?? "—"}</p>
                    </TD>
                    <TD>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{lead.company}</p>
                    </TD>
                    <TD>
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-800">
                        {leadStages.find((item) => item.value === lead.stage)?.label ?? lead.stage}
                      </span>
                    </TD>
                    <TD>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {leadSources.find((item) => item.value === lead.source)?.label ?? lead.source}
                      </p>
                    </TD>
                    <TD>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{lead.owner ?? "—"}</p>
                    </TD>
                    <TD>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {lead.nextContact ? new Date(lead.nextContact).toLocaleDateString() : "—"}
                      </p>
                    </TD>
                    <TD className="text-right">
                      <RowActionsMenu
                        actions={[
                          {
                            label: "Modifier",
                            onClick: () => openModal(lead),
                          },
                          {
                            label: "Supprimer",
                            tone: "danger",
                            onClick: () => {
                              if (!window.confirm("Supprimer ce lead ?")) return;
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

      <LeadModal open={modalOpen} lead={modalLead} onClose={closeModal} onSave={handleSave} />
    </div>
  );
}
