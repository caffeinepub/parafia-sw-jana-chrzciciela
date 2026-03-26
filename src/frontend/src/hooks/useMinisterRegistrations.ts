// Shared types and helpers for Lektor/Psalmista (minister) registrations.
// Used by both LiturgiaPage.tsx and AdminPage.tsx.

import type { backendInterface } from "../backend";

export interface MinisterRegistration {
  id: string;
  name: string;
  role: "lektor" | "psalmista";
  weekId: string;
  dayIndex: number;
  entryId: string;
  massTime: string;
  massDate: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export function parseMinistersFromDescription(description: string): {
  lectors: string[];
  psalmists: string[];
} {
  try {
    if (description?.trim().startsWith("{")) {
      const parsed = JSON.parse(description);
      return {
        lectors: parsed.lectors || [],
        psalmists: parsed.psalmists || [],
      };
    }
  } catch {
    // ignore
  }
  return { lectors: [], psalmists: [] };
}

export function serializeMinistersToDescription(
  lectors: string[],
  psalmists: string[],
): string {
  return JSON.stringify({ lectors, psalmists });
}

const MINISTERS_KEY = "parish_minister_registrations";
const BACKEND_MINISTERS_KEY = "minister_registrations";

export function getRegistrations(): MinisterRegistration[] {
  try {
    return JSON.parse(localStorage.getItem(MINISTERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRegistrations(regs: MinisterRegistration[]): void {
  localStorage.setItem(MINISTERS_KEY, JSON.stringify(regs));
}

/**
 * Sync the registrations array to the backend as a content block.
 * Silently fails if actor is unavailable.
 */
export async function syncRegistrationsToBackend(
  actor: backendInterface | null,
  regs: MinisterRegistration[],
): Promise<void> {
  if (!actor) return;
  try {
    await actor.updateContentBlock(BACKEND_MINISTERS_KEY, JSON.stringify(regs));
  } catch {
    // ignore – localStorage copy is already up to date
  }
}

/**
 * Load registrations from backend and merge into localStorage.
 * Backend is authoritative; returns merged result or null if backend unavailable.
 */
export async function loadRegistrationsFromBackend(
  actor: backendInterface | null,
): Promise<MinisterRegistration[] | null> {
  if (!actor) return null;
  try {
    const block = await actor.getContentBlock(BACKEND_MINISTERS_KEY);
    const content = block?.content;
    if (!content) return null;
    const backendRegs = JSON.parse(content) as MinisterRegistration[];
    // Merge: backend is authoritative for known IDs; keep local-only pending
    const localRegs = getRegistrations();
    const backendIds = new Set(backendRegs.map((r) => r.id));
    const localOnly = localRegs.filter((r) => !backendIds.has(r.id));
    const merged = [...backendRegs, ...localOnly];
    saveRegistrations(merged);
    return merged;
  } catch {
    return null;
  }
}
