import { create } from "zustand";
import type { Product, HotelRateCategory, ProductStatus, ProductType, ServiceMode, StopMode } from "../types/product";

const PRODUCTS_ENDPOINT = "/api/products";

type ProductStore = {
  products: Product[];
  loadFromServer: () => Promise<void>;
  createDraft: (draft: Omit<Product, "id" | "productId" | "createdAt" | "updatedAt">) => Promise<Product>;
  updateDraft: (id: string, draft: Omit<Product, "id" | "productId" | "createdAt" | "updatedAt">) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateDraft: (id: string) => Promise<Product | null>;
  publishProduct: (id: string) => Promise<Product | null>;
  addLocalDrafts: (drafts: Array<Omit<Product, "id" | "productId" | "createdAt" | "updatedAt">>) => void;
};

const getErrorMessage = async (response: Response, fallback: string) => {
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      return parsed?.message ?? text;
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
};

const normalizeStatus = (value?: string): ProductStatus => {
  switch (value?.toLowerCase()) {
    case "published":
      return "published";
    case "draft":
    default:
      return "draft";
  }
};

const normalizeProductType = (value?: string): ProductType => {
  switch (value?.toLowerCase()) {
    case "tiers":
      return "tiers";
    case "autre":
      return "autre";
    case "maison":
    default:
      return "maison";
  }
};

const normalizeStopMode = (value?: string): StopMode => {
  switch (value?.toLowerCase()) {
    case "multi_stops":
      return "multi_stops";
    case "one_stop":
    default:
      return "one_stop";
  }
};

const normalizeServiceMode = (value?: string): ServiceMode => {
  switch (value?.toLowerCase()) {
    case "details":
      return "details";
    case "package":
    default:
      return "package";
  }
};

const normalizeRateCategory = (value?: string): HotelRateCategory => {
  switch (value?.toLowerCase()) {
    case "double":
      return "double";
    case "triple":
      return "triple";
    case "baby":
      return "baby";
    case "child1":
      return "child1";
    case "child2":
      return "child2";
    case "single":
    default:
      return "single";
  }
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  status: normalizeStatus(product.status as unknown as string),
  productType: normalizeProductType(product.productType as unknown as string),
  stopMode: normalizeStopMode(product.stopMode as unknown as string),
  servicesMode: normalizeServiceMode(product.servicesMode as unknown as string),
  hotels: product.hotels.map((hotel) => ({
    ...hotel,
    rates: hotel.rates.map((rate) => ({
      ...rate,
      category: normalizeRateCategory(rate.category as unknown as string),
    })),
  })),
});

const toLocalProduct = (
  draft: Omit<Product, "id" | "productId" | "createdAt" | "updatedAt">
): Product => {
  const now = new Date().toISOString();
  return normalizeProduct({
    ...draft,
    id: crypto.randomUUID(),
    productId: undefined,
    createdAt: now,
    updatedAt: now,
  });
};

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loadFromServer: async () => {
    const response = await fetch(PRODUCTS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as Product[];
    set({ products: data.map(normalizeProduct) });
  },
  createDraft: async (draft) => {
    const response = await fetch(PRODUCTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Unable to create draft"));
    }
    const created = normalizeProduct((await response.json()) as Product);
    set({ products: [created, ...get().products] });
    return created;
  },
  updateDraft: async (id, draft) => {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Unable to update draft"));
    }
    const updated = normalizeProduct((await response.json()) as Product);
    set({
      products: get().products.map((product) => (product.id === updated.id ? updated : product)),
    });
    return updated;
  },
  deleteProduct: async (id) => {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Unable to delete product"));
    }
    set({ products: get().products.filter((product) => product.id !== id) });
  },
  duplicateDraft: async (id) => {
    const existing = get().products.find((product) => product.id === id);
    if (!existing) return null;
    const draft = {
      ...existing,
      status: "draft",
      productId: undefined,
      name: `${existing.name} (Copy)`,
    };
    const { id: _, createdAt: __, updatedAt: ___, ...payload } = draft;
    return get().createDraft(payload);
  },
  publishProduct: async (id) => {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${id}/publish`, { method: "POST" });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Unable to publish product"));
    }
    const updated = normalizeProduct((await response.json()) as Product);
    set({
      products: get().products.map((product) => (product.id === updated.id ? updated : product)),
    });
    return updated;
  },
  addLocalDrafts: (drafts) => {
    const local = drafts.map(toLocalProduct);
    set({ products: [...local, ...get().products] });
  },
}));
