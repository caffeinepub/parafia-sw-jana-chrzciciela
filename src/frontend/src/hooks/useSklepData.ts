import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { ShopConfig, ShopProduct } from "../pages/SklepPage";
import { useActor } from "./useActor";

const PRODUCTS_KEY = "sklep_products";
const CONFIG_KEY = "sklep_config";
const ORDERS_KEY = "sklep_orders";
const LS_PRODUCTS = "sklep_products_cache";
const LS_CONFIG = "sklep_config_cache";
const LS_ORDERS = "sklep_orders_cache";

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
      try {
        const block = await actor.getContentBlock(ORDERS_KEY);
        if (block?.content) {
          const data = parseOrders(block.content);
          localStorage.setItem(LS_ORDERS, block.content);
          return data;
        }
      } catch (e) {
        console.warn("Failed to load sklep_orders from backend:", e);
      }
      return getLocalOrders();
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
    placeholderData: getLocalOrders,
  });

  const persistOrders = useCallback(
    async (orders: ShopOrder[]) => {
      if (!actor) throw new Error("Actor not available");
      const json = JSON.stringify(orders);
      queryClient.setQueryData(["shopOrders"], orders);
      localStorage.setItem(LS_ORDERS, json);
      await actor.updateContentBlock(ORDERS_KEY, json);
    },
    [actor, queryClient],
  );

  const saveOrder = useCallback(
    async (order: ShopOrder) => {
      if (!actor) {
        throw new Error(
          "Aplikacja nie jest jeszcze gotowa. Odczekaj chwilę i spróbuj ponownie.",
        );
      }
      const current = getLocalOrders();
      const updated = [order, ...current];
      queryClient.setQueryData(["shopOrders"], updated);
      localStorage.setItem(LS_ORDERS, JSON.stringify(updated));
      await actor.updateContentBlock(ORDERS_KEY, JSON.stringify(updated));
    },
    [actor, queryClient],
  );

  const updateOrder = useCallback(
    async (id: string, order: ShopOrder) => {
      const current = query.data ?? getLocalOrders();
      const updated = current.map((o) => (o.id === id ? order : o));
      await persistOrders(updated);
    },
    [query.data, persistOrders],
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      const current = query.data ?? getLocalOrders();
      const updated = current.filter((o) => o.id !== id);
      await persistOrders(updated);
    },
    [query.data, persistOrders],
  );

  return {
    orders: query.data ?? getLocalOrders(),
    isLoading: isFetching || (query.isLoading && !query.data),
    saveOrder,
    updateOrder,
    deleteOrder,
  };
}
