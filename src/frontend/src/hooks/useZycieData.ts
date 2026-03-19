import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { ZycieData } from "../pages/ZyciePage";
import { useActor } from "./useActor";

const ZYCIE_KEY = "zycie_data";
const LS_KEY = "zycie_data";
const DEFAULT_YEARS = ["2024", "2025", "2026"];

const DEFAULT_DATA: ZycieData = {
  heroTexts: {
    title: "Życie",
    subtitle: "Życie naszej wspólnoty w świetle wiary",
    description:
      "Każdy rok przynosi nowe wydarzenia, nowe historie i nowe świadectwa życia naszej parafii.",
  },
  years: {
    "2024": { heroImage: "", heroDescription: "", tiles: [] },
    "2025": { heroImage: "", heroDescription: "", tiles: [] },
    "2026": { heroImage: "", heroDescription: "", tiles: [] },
  },
};

function ensureDefaultYears(data: ZycieData): ZycieData {
  const years = { ...data.years };
  for (const y of DEFAULT_YEARS) {
    if (!years[y]) {
      years[y] = { heroImage: "", heroDescription: "", tiles: [] };
    }
  }
  return { ...data, years };
}

function parseZycieData(raw: string): ZycieData {
  try {
    return ensureDefaultYears(JSON.parse(raw) as ZycieData);
  } catch {
    return DEFAULT_DATA;
  }
}

function getLocalData(): ZycieData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return parseZycieData(raw);
  } catch {
    // ignore
  }
  return DEFAULT_DATA;
}

export function useZycieData() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<ZycieData>({
    queryKey: ["zycieData"],
    queryFn: async () => {
      if (!actor) return getLocalData();
      try {
        const block = await actor.getContentBlock(ZYCIE_KEY);
        if (block?.content) {
          const data = parseZycieData(block.content);
          // Cache in localStorage for instant subsequent loads
          localStorage.setItem(LS_KEY, block.content);
          return data;
        }
      } catch (e) {
        console.warn("Failed to load zycie_data from backend:", e);
      }
      // Fall back to localStorage (migration / offline)
      return getLocalData();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
    // Show localStorage data instantly while backend loads
    placeholderData: getLocalData,
  });

  const saveData = useCallback(
    async (data: ZycieData) => {
      if (!actor) throw new Error("Actor not available");
      const json = JSON.stringify(data);
      // Optimistic update
      queryClient.setQueryData(["zycieData"], data);
      localStorage.setItem(LS_KEY, json);
      window.dispatchEvent(new Event("storage"));
      // Persist to backend
      await actor.updateContentBlock(ZYCIE_KEY, json);
    },
    [actor, queryClient],
  );

  return {
    data: query.data ?? DEFAULT_DATA,
    isLoading: isFetching || (query.isLoading && !query.data),
    saveData,
  };
}
