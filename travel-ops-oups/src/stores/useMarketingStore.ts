'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Campaign, ContentItem } from "../types";
import { generateId, makePersistStorage } from "./storeUtils";

const CAMPAIGN_ENDPOINT = "/api/shared/campaigns";
const CONTENT_ENDPOINT = "/api/shared/content";

const persistToServer = async (endpoint: string, payload: unknown) => {
  if (typeof window === "undefined") return;
  await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((error) => {
    console.error("Marketing sync failed", error);
  });
};

const requestFromServer = async <T>(endpoint: string): Promise<T[] | null> => {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      console.error("Marketing backend unavailable", response.statusText);
      return null;
    }
    return (await response.json()) as T[];
  } catch (error) {
    console.error("Failed to load marketing data", error);
    return null;
  }
};

type MarketingStore = {
  campaigns: Campaign[];
  content: ContentItem[];
  addCampaign: (campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt">) => Campaign;
  updateCampaign: (id: string, updates: Partial<Omit<Campaign, "id" | "createdAt">>) => Campaign | null;
  deleteCampaign: (id: string) => void;
  addContent: (content: Omit<ContentItem, "id" | "createdAt" | "updatedAt">) => ContentItem;
  updateContent: (id: string, updates: Partial<Omit<ContentItem, "id" | "createdAt">>) => ContentItem | null;
  deleteContent: (id: string) => void;
  loadFromServer: () => Promise<void>;
};

const storage = makePersistStorage();

export const useMarketingStore = create<MarketingStore>()(
  persist(
    (set, get) => {
      const syncCampaigns = () => persistToServer(CAMPAIGN_ENDPOINT, { campaigns: get().campaigns });
      const syncContent = () => persistToServer(CONTENT_ENDPOINT, { content: get().content });

      return {
        campaigns: [],
        content: [],
        addCampaign: (campaign) => {
          const now = new Date().toISOString();
          const record: Campaign = { id: generateId(), createdAt: now, updatedAt: now, ...campaign };
          set({ campaigns: [record, ...get().campaigns] });
          syncCampaigns();
          return record;
        },
        updateCampaign: (id, updates) => {
          let result: Campaign | null = null;
          set({
            campaigns: get().campaigns.map((campaign) => {
              if (campaign.id !== id) return campaign;
              result = { ...campaign, ...updates, updatedAt: new Date().toISOString() };
              return result;
            }),
          });
          if (result) syncCampaigns();
          return result;
        },
        deleteCampaign: (id) => {
          set({ campaigns: get().campaigns.filter((campaign) => campaign.id !== id) });
          syncCampaigns();
        },
        addContent: (content) => {
          const now = new Date().toISOString();
          const record: ContentItem = { id: generateId(), createdAt: now, updatedAt: now, ...content };
          set({ content: [record, ...get().content] });
          syncContent();
          return record;
        },
        updateContent: (id, updates) => {
          let result: ContentItem | null = null;
          set({
            content: get().content.map((item) => {
              if (item.id !== id) return item;
              result = { ...item, ...updates, updatedAt: new Date().toISOString() };
              return result;
            }),
          });
          if (result) syncContent();
          return result;
        },
        deleteContent: (id) => {
          set({ content: get().content.filter((item) => item.id !== id) });
          syncContent();
        },
        loadFromServer: async () => {
          const [campaigns, content] = await Promise.all([
            requestFromServer<Campaign>(CAMPAIGN_ENDPOINT),
            requestFromServer<ContentItem>(CONTENT_ENDPOINT),
          ]);
          if (campaigns) set({ campaigns });
          if (content) set({ content });
        },
      };
    },
    {
      name: "travelops-marketing-store",
      storage,
    }
  )
);
