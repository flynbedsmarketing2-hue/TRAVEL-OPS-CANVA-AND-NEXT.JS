'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Lead, LeadSource, LeadStage } from "../types";
import { generateId, makePersistStorage } from "./storeUtils";

const LEADS_ENDPOINT = "/api/shared/leads";

export const leadStages: { value: LeadStage; label: string }[] = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "proposal", label: "Proposition" },
  { value: "won", label: "Gagné" },
  { value: "lost", label: "Perdu" },
];

export const leadSources: { value: LeadSource; label: string }[] = [
  { value: "website", label: "Site web" },
  { value: "referral", label: "Parrainage" },
  { value: "email", label: "Email" },
  { value: "event", label: "Événement" },
  { value: "partner", label: "Partenaire" },
  { value: "phone", label: "Téléphone" },
  { value: "other", label: "Autre" },
];

const persistLeadsToServer = (leads: Lead[]) => {
  if (typeof window === "undefined") return;
  void fetch(LEADS_ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leads }),
  }).catch((error) => {
    console.error("Unable to sync CRM leads", error);
  });
};

const loadLeadsFromServer = async (): Promise<Lead[] | null> => {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch(LEADS_ENDPOINT);
    if (!response.ok) {
      console.error("CRM backend unavailable", response.statusText);
      return null;
    }
    return (await response.json()) as Lead[];
  } catch (error) {
    console.error("Failed to load CRM leads", error);
    return null;
  }
};

type CrmStore = {
  leads: Lead[];
  addLead: (payload: Omit<Lead, "id" | "createdAt" | "updatedAt">) => Lead;
  updateLead: (id: string, updates: Partial<Omit<Lead, "id" | "createdAt">>) => Lead | null;
  deleteLead: (id: string) => void;
  setLeadStage: (id: string, stage: LeadStage) => void;
  setLeadSource: (id: string, source: LeadSource) => void;
  loadFromServer: () => Promise<void>;
};

const storage = makePersistStorage();

export const useCrmStore = create<CrmStore>()(
  persist(
    (set, get) => {
      const sync = () => persistLeadsToServer(get().leads);

      return {
        leads: [],
        addLead: (payload) => {
          const now = new Date().toISOString();
          const lead: Lead = {
            id: generateId(),
            createdAt: now,
            updatedAt: now,
            ...payload,
          };
          set({ leads: [lead, ...get().leads] });
          sync();
          return lead;
        },
        updateLead: (id, updates) => {
          let result: Lead | null = null;
          set({
            leads: get().leads.map((lead) => {
              if (lead.id !== id) return lead;
              result = { ...lead, ...updates, updatedAt: new Date().toISOString() };
              return result;
            }),
          });
          if (result) sync();
          return result;
        },
        deleteLead: (id) => {
          set({ leads: get().leads.filter((lead) => lead.id !== id) });
          sync();
        },
        setLeadStage: (id, stage) => {
          set({
            leads: get().leads.map((lead) =>
              lead.id === id ? { ...lead, stage, updatedAt: new Date().toISOString() } : lead
            ),
          });
          sync();
        },
        setLeadSource: (id, source) => {
          set({
            leads: get().leads.map((lead) =>
              lead.id === id ? { ...lead, source, updatedAt: new Date().toISOString() } : lead
            ),
          });
          sync();
        },
        loadFromServer: async () => {
          const leads = await loadLeadsFromServer();
          if (leads) {
            set({ leads });
          }
        },
      };
    },
    {
      name: "travelops-crm-store",
      storage,
    }
  )
);
