import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { ShopConfig, ShopProduct } from "../pages/SklepPage";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

const PRODUCTS_KEY = "sklep_products";
const CONFIG_KEY = "sklep_config";
const ORDERS_KEY = "sklep_orders";
const LS_PRODUCTS = "sklep_products_cache";
const LS_CONFIG = "sklep_config_cache";
const LS_ORDERS = "sklep_orders_cache";
const LS_ORDERS_MIGRATED = "sklep_orders_migrated";

export const DEFAULT_CONFIG: ShopConfig = {
  heroTitle: "Sklep parafialny",
  heroSubtitle: "Dzieła naszej wspólnoty",
  heroDescription:
    "Kupując nasze produkty wspierasz rozwój parafii oraz dzieła duszpasterskie i charytatywne.",
  heroImageUrl: "",
  blikPhone: "",
  qrImageUrl: "",
  thankYouTitle: "Dziękujemy za wsparcie",
  thankYouText:
    "Każdy zakup wspiera życie naszej parafii oraz dzieła charytatywne.",
  categories: [],
};

export interface ShopOrder {
  id: string;
  productId: string;
  productName: string;
  productPrice: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  notes: string;
  deliveryType: "pickup" | "shipping";
  paymentConfirmed: boolean;
  status: "new" | "awaiting" | "paid" | "shipped";
  trackingNumber: string;
  adminNotes: string;
  createdAt: string;
}

function parseProducts(raw: string): ShopProduct[] {
  try {
    return JSON.parse(raw) as ShopProduct[];
  } catch {
    return [];
  }
}

function parseConfig(raw: string): ShopConfig {
  try {
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<ShopConfig>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function parseOrders(raw: string): ShopOrder[] {
  try {
    return JSON.parse(raw) as ShopOrder[];
  } catch {
    return [];
  }
}

function getLocalProducts(): ShopProduct[] {
  try {
    const raw = localStorage.getItem(LS_PRODUCTS);
    if (raw) return parseProducts(raw);
  } catch {
    // ignore
  }
  return [];
}

function getLocalConfig(): ShopConfig {
  try {
    const raw = localStorage.getItem(LS_CONFIG);
    if (raw) return parseConfig(raw);
  } catch {
    // ignore
  }
  return DEFAULT_CONFIG;
}

function getLocalOrders(): ShopOrder[] {
  try {
    const raw = localStorage.getItem(LS_ORDERS);
    if (raw) return parseOrders(raw);
  } catch {
    // ignore
  }
  return [];
}

export function useSklepProducts() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<ShopProduct[]>({
    queryKey: ["sklepProducts"],
    queryFn: async () => {
      if (!actor) return getLocalProducts();
      try {
        const block = await actor.getContentBlock(PRODUCTS_KEY);
        if (block?.content) {
          const data = parseProducts(block.content);
          localStorage.setItem(LS_PRODUCTS, block.content);
          return data;
        }
      } catch (e) {
        console.warn("Failed to load sklep_products from backend:", e);
      }
      return getLocalProducts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
    placeholderData: getLocalProducts,
  });

  const saveProducts = useCallback(
    async (products: ShopProduct[]) => {
      if (!actor) throw new Error("Actor not available");
      const json = JSON.stringify(products);
      queryClient.setQueryData(["sklepProducts"], products);
      localStorage.setItem(LS_PRODUCTS, json);
      await actor.updateContentBlock(PRODUCTS_KEY, json);
    },
    [actor, queryClient],
  );

  return {
    products: query.data ?? getLocalProducts(),
    isLoading: isFetching || (query.isLoading && !query.data),
    saveProducts,
  };
}

export function useSklepConfig() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<ShopConfig>({
    queryKey: ["sklepConfig"],
    queryFn: async () => {
      if (!actor) return getLocalConfig();
      try {
        const block = await actor.getContentBlock(CONFIG_KEY);
        if (block?.content) {
          const data = parseConfig(block.content);
          localStorage.setItem(LS_CONFIG, block.content);
          return data;
        }
      } catch (e) {
        console.warn("Failed to load sklep_config from backend:", e);
      }
      return getLocalConfig();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
    placeholderData: getLocalConfig,
  });

  const saveConfig = useCallback(
    async (config: ShopConfig) => {
      if (!actor) throw new Error("Actor not available");
      const json = JSON.stringify(config);
      queryClient.setQueryData(["sklepConfig"], config);
      localStorage.setItem(LS_CONFIG, json);
      await actor.updateContentBlock(CONFIG_KEY, json);
    },
    [actor, queryClient],
  );

  return {
    config: query.data ?? getLocalConfig(),
    isLoading: isFetching || (query.isLoading && !query.data),
    saveConfig,
  };
}

export function useShopOrders() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<ShopOrder[]>({
    queryKey: ["shopOrders"],
    queryFn: async () => {
      if (!actor) return getLocalOrders();

      // One-time migration: if old contentBlock data exists and backend is empty
      const alreadyMigrated = localStorage.getItem(LS_ORDERS_MIGRATED);
      if (!alreadyMigrated) {
        try {
          const backendOrders = await actor.getShopOrders();
          if (backendOrders.length === 0) {
            // Check if there are legacy orders in the old contentBlock
            const legacyBlock = await actor.getContentBlock(ORDERS_KEY);
            if (legacyBlock?.content) {
              const legacyOrders = parseOrders(legacyBlock.content);
              for (const order of legacyOrders) {
                try {
                  await actor.saveShopOrder(order);
                } catch {
                  // ignore per-order errors during migration
                }
              }
            }
          }
          localStorage.setItem(LS_ORDERS_MIGRATED, "1");
          // Re-fetch after migration
          const freshOrders = await actor.getShopOrders();
          const normalized = freshOrders as ShopOrder[];
          localStorage.setItem(LS_ORDERS, JSON.stringify(normalized));
          return normalized;
        } catch (e) {
          console.warn("Migration failed, falling back:", e);
        }
      }

      try {
        const result = await actor.getShopOrders();
        const normalized = result as ShopOrder[];
        localStorage.setItem(LS_ORDERS, JSON.stringify(normalized));
        return normalized;
      } catch (e) {
        console.warn("Failed to load shop orders from backend:", e);
      }
      return getLocalOrders();
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
    placeholderData: getLocalOrders,
  });

  const saveOrder = useCallback(
    async (order: ShopOrder) => {
      if (!actor) {
        throw new Error(
          "Aplikacja nie jest jeszcze gotowa. Odczekaj chwilę i spróbuj ponownie.",
        );
      }
      // Optimistic update in localStorage for immediate UX
      const current = getLocalOrders();
      const optimistic = [order, ...current];
      localStorage.setItem(LS_ORDERS, JSON.stringify(optimistic));
      // Save to backend (dedicated method — no JSON blob)
      await actor.saveShopOrder(order);
      // Invalidate so next read reflects server state
      await queryClient.invalidateQueries({ queryKey: ["shopOrders"] });
    },
    [actor, queryClient],
  );

  const updateOrder = useCallback(
    async (id: string, order: ShopOrder) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateShopOrder(id, order);
      await queryClient.invalidateQueries({ queryKey: ["shopOrders"] });
    },
    [actor, queryClient],
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteShopOrder(id);
      await queryClient.invalidateQueries({ queryKey: ["shopOrders"] });
    },
    [actor, queryClient],
  );

  return {
    orders: query.data ?? getLocalOrders(),
    isLoading: isFetching || (query.isLoading && !query.data),
    saveOrder,
    updateOrder,
    deleteOrder,
  };
}

export function useNewOrdersCount() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<number>({
    queryKey: ["newOrdersCount"],
    queryFn: async () => {
      if (!actor) return 0;
      try {
        const count = await actor.getNewOrdersCount();
        return Number(count);
      } catch {
        return 0;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 60_000,
  });
}
