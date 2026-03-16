// Shared types and helpers for Lektor/Psalmista (minister) registrations.
// Used by both LiturgiaPage.tsx and AdminPage.tsx.

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
