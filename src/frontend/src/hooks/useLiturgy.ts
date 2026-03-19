import React from "react";
import type { LiturgyWeek } from "../backend";
import { useActor } from "./useActor";

// ============================================================
// WEEK ID HELPERS
// ============================================================

/**
 * Returns ISO week number for a given date (Monday-based).
 * Format: "YYYY-Wnn"
 */
export function getWeekId(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1)
  const dayNum = d.getUTCDay() || 7; // convert Sunday from 0 to 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Returns Monday and Sunday dates for a given "YYYY-Wnn" week ID.
 */
export function getWeekDates(weekId: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = weekId.split("-W");
  const year = Number.parseInt(yearStr, 10);
  const week = Number.parseInt(weekStr, 10);

  // Jan 4 is always in week 1 (ISO 8601)
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // Mon=1 … Sun=7
  // Monday of week 1
  const monday1 = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  // Monday of requested week
  const start = new Date(monday1.getTime() + (week - 1) * 7 * 86400000);
  const end = new Date(start.getTime() + 6 * 86400000);
  return { start, end };
}

/**
 * Format a Date as "dd.mm.yyyy"
 */
export function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/**
 * Format a Date as "YYYY-MM-DD"
 */
export function toIsoDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Navigate to the previous or next week from a given weekId.
 */
export function adjacentWeekId(weekId: string, delta: -1 | 1): string {
  const { start } = getWeekDates(weekId);
  const adj = new Date(start.getTime() + delta * 7 * 86400000);
  return getWeekId(adj);
}

// ============================================================
// EMPTY WEEK FACTORY
// ============================================================

export function buildEmptyWeek(weekId: string): LiturgyWeek {
  const { start, end } = getWeekDates(weekId);
  return {
    id: weekId,
    weekStart: toIsoDate(start),
    weekEnd: toIsoDate(end),
    heroTitle: "Liturgia",
    heroSubtitle:
      "Tu Kościół modli się za świat,\na Bóg spotyka człowieka w słowie i Eucharystii.",
    heroDescription: "",
    days: Array.from({ length: 7 }, (_, i) => ({
      dayIndex: BigInt(i),
      entries: [],
    })),
  };
}

/**
 * Ensure the week object always has all 7 days (indices 0-6).
 * Missing days are added as empty.
 */
export function ensureAllDays(week: LiturgyWeek): LiturgyWeek {
  const dayMap = new Map<number, (typeof week.days)[0]>();
  for (const d of week.days) {
    dayMap.set(Number(d.dayIndex), d);
  }
  const days = Array.from({ length: 7 }, (_, i) => {
    return dayMap.get(i) ?? { dayIndex: BigInt(i), entries: [] };
  });
  return { ...week, days };
}

// ============================================================
// LOCALSTORAGE HELPERS
// ============================================================

const LS_KEY = "liturgy_weeks";

/**
 * Serializable version of LiturgyWeek — BigInt fields converted to number.
 */
interface SerializableEntry {
  id: string;
  serviceType: string;
  entryType: string;
  order: number;
  time: string;
  intention: string;
  description: string;
}

interface SerializableDay {
  dayIndex: number;
  entries: SerializableEntry[];
}

interface SerializableWeek {
  id: string;
  weekStart: string;
  weekEnd: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  days: SerializableDay[];
}

function serializeWeek(week: LiturgyWeek): SerializableWeek {
  return {
    ...week,
    days: week.days.map((d) => ({
      dayIndex: Number(d.dayIndex),
      entries: d.entries.map((e) => ({
        id: e.id,
        serviceType: e.serviceType,
        entryType: e.entryType,
        order: Number(e.order),
        time: e.time,
        intention: e.intention,
        description: e.description,
      })),
    })),
  };
}

function deserializeWeek(raw: SerializableWeek): LiturgyWeek {
  return {
    ...raw,
    days: raw.days.map((d) => ({
      dayIndex: BigInt(d.dayIndex),
      entries: d.entries.map((e) => ({
        id: e.id,
        serviceType: e.serviceType,
        entryType: e.entryType,
        order: BigInt(e.order),
        time: e.time,
        intention: e.intention,
        description: e.description,
      })),
    })),
  };
}

export function lsLoadAll(): Record<string, SerializableWeek> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SerializableWeek>;
  } catch {
    return {};
  }
}

function lsGetWeek(weekId: string): LiturgyWeek | null {
  try {
    const all = lsLoadAll();
    const raw = all[weekId];
    if (!raw) return null;
    return deserializeWeek(raw);
  } catch {
    return null;
  }
}

export function lsSaveWeek(week: LiturgyWeek): void {
  try {
    const all = lsLoadAll();
    all[week.id] = serializeWeek(week);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

function lsDeleteWeek(weekId: string): void {
  try {
    const all = lsLoadAll();
    delete all[weekId];
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    // Silently ignore
  }
}

// ============================================================
// HOOK
// ============================================================

export interface LiturgyState {
  week: LiturgyWeek | null;
  weekId: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadWeek: (id: string) => Promise<void>;
  saveWeek: (week: LiturgyWeek) => Promise<void>;
  clearWeek: () => Promise<void>;
  deleteWeek: () => Promise<void>;
}

export function useLiturgy(): LiturgyState {
  const { actor, isFetching } = useActor();
  const actorRef = React.useRef(actor);
  React.useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  const currentWeekId = getWeekId(new Date());
  const [weekId, setWeekId] = React.useState(currentWeekId);
  const [week, setWeek] = React.useState<LiturgyWeek | null>(null);

  // Ref to always hold the latest weekId — used in async effects to
  // guard against applying stale backend responses to the wrong week.
  const weekIdRef = React.useRef(weekId);
  React.useEffect(() => {
    weekIdRef.current = weekId;
  }, [weekId]);

  // Initialize isLoading based on whether localStorage already has data.
  // If cache exists, show it immediately (no skeleton).
  const [isLoading, setIsLoading] = React.useState(
    () => lsGetWeek(getWeekId(new Date())) === null,
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Silently try to get actor — never throws.
   */
  const tryGetActor = React.useCallback(async () => {
    if (actorRef.current) return actorRef.current;
    for (let i = 0; i < 20; i++) {
      await new Promise<void>((r) => setTimeout(r, 150));
      if (actorRef.current) return actorRef.current;
    }
    return null;
  }, []);

  const loadWeek = React.useCallback(
    async (id: string) => {
      setError(null);
      setWeekId(id);
      weekIdRef.current = id;

      // 1. Clear stale data immediately so the previous week's entries
      //    don't flash while the new week is loading.
      const local = lsGetWeek(id);
      if (local) {
        setWeek(ensureAllDays(local));
        setIsLoading(false);
      } else {
        setWeek(buildEmptyWeek(id)); // clear stale previous-week data
        setIsLoading(true); // show skeleton only if nothing in cache
      }

      // 2. Refresh from backend silently in background
      void (async () => {
        try {
          const a = await tryGetActor();
          if (a) {
            const fetched =
              id === currentWeekId
                ? await a.getCurrentLiturgyWeek()
                : await a.getLiturgyWeek(id);
            // Only apply result if the user hasn't navigated away
            if (fetched && weekIdRef.current === id) {
              const backendResult = ensureAllDays(fetched);
              lsSaveWeek(backendResult);
              setWeek(backendResult);
            }
          }
        } catch {
          // Backend unavailable — localStorage data is already shown
        } finally {
          if (weekIdRef.current === id) setIsLoading(false);
        }
      })();
    },
    [tryGetActor, currentWeekId],
  );

  const saveWeek = React.useCallback(
    async (w: LiturgyWeek) => {
      setIsSaving(true);
      setError(null);

      const full = ensureAllDays(w);

      // 1. Save to localStorage immediately — this always succeeds
      lsSaveWeek(full);
      setWeek(full);

      // 2. Try to sync to backend silently in the background
      void (async () => {
        try {
          const a = await tryGetActor();
          if (a) {
            await a.saveLiturgyWeek(full);
          }
        } catch {
          // Backend save failed — data is safe in localStorage
        }
      })();

      setIsSaving(false);
    },
    [tryGetActor],
  );

  const clearWeek = React.useCallback(async () => {
    if (!week) return;

    // Explicitly use the current weekId to prevent cross-week contamination
    const cleared: LiturgyWeek = {
      ...week,
      id: weekId,
      days: Array.from({ length: 7 }, (_, i) => ({
        dayIndex: BigInt(i),
        entries: [],
      })),
    };

    await saveWeek(cleared);
  }, [week, weekId, saveWeek]);

  const deleteWeek = React.useCallback(async () => {
    setIsSaving(true);
    setError(null);

    // 1. Remove from localStorage immediately
    lsDeleteWeek(weekId);
    setWeek(buildEmptyWeek(weekId));

    // 2. Try to remove from backend silently
    void (async () => {
      try {
        const a = await tryGetActor();
        if (a) {
          await a.deleteLiturgyWeek(weekId);
        }
      } catch {
        // Backend delete failed — localStorage already cleared
      }
    })();

    setIsSaving(false);
  }, [tryGetActor, weekId]);

  // FAST PATH: Load from localStorage immediately on mount (no actor needed).
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  React.useEffect(() => {
    const local = lsGetWeek(currentWeekId);
    if (local) {
      setWeek(ensureAllDays(local));
      setIsLoading(false);
    }
    // If no local data, keep isLoading=true until background refresh completes
  }, []);

  // BACKGROUND REFRESH: When actor becomes ready, silently refresh from
  // backend for the currently-displayed week (not always currentWeekId).
  // Guard: only apply result if the user hasn't navigated to a different week
  // while the fetch was in-flight.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only watch isFetching
  React.useEffect(() => {
    if (!isFetching) {
      void (async () => {
        const idAtStart = weekIdRef.current;
        try {
          const a = await tryGetActor();
          if (a) {
            const fetched =
              idAtStart === currentWeekId
                ? await a.getCurrentLiturgyWeek()
                : await a.getLiturgyWeek(idAtStart);
            // Only update state if the user is still on the same week
            if (fetched && weekIdRef.current === idAtStart) {
              const result = ensureAllDays(fetched);
              lsSaveWeek(result);
              setWeek(result);
            }
          }
        } catch {
          // Backend unavailable — cached data remains visible
        } finally {
          if (weekIdRef.current === idAtStart) setIsLoading(false);
        }
      })();
    }
  }, [isFetching]);

  return {
    week,
    weekId,
    isLoading,
    isSaving,
    error,
    loadWeek,
    saveWeek,
    clearWeek,
    deleteWeek,
  };
}
