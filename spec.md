# Parafia sw Jana Chrzciciela

## Current State

Audyt diagnostyczny v77 ujawnił 10 problemów: 2 krytyczne, 3 poważne, 5 mniejszych. Backend zawiera 3 funkcje które zawsze trapują (AccessControl). Frontend ma lektorów/psalmistów wyłącznie w localStorage, grafik liturgii localStorage-primary, zamówienia sklepu z ryzykiem cichej utraty, AdminModlitwaTab czytający liturgię z localStorage zamiast backendu.

## Requested Changes (Diff)

### Add
- Sync lektorów/psalmistów do backendu przez content block `minister_registrations`
- Migracja lektorów z localStorage → backend przy pierwszym załadowaniu
- Toast błędu gdy backend save grafiku Liturgii się nie powiedzie
- Blokada zamówienia Sklepu jeśli aktor nie jest gotowy (toast z komunikatem)
- Ładowanie tygodni liturgicznych z backendu w AdminModlitwaTab

### Modify
- `main.mo`: `deletePrayerStar`, `deleteMassIntention`, `saveModlitwaConfig` — zamień `AccessControl.hasPermission(...)` na `isAuthenticated(caller)`
- `useMinisterRegistrations.ts`: dodaj async backend sync (content block)
- `useLiturgy.ts`: `saveWeek` pokazuje toast gdy backend save failure (nie milczy)
- `useSklepData.ts`: `saveOrder` rzuca jeśli aktor nie jest dostępny
- `AdminModlitwaTab.tsx`: `loadAllLiturgyWeeks` → pobierz z backendu przez `actor.listLiturgyWeeks()`
- `Navigation.tsx`: linia 75 `bg-card/90` → `bg-background` (pasek nav przy scrollu)
- `KancelariaPage.tsx`: staleTime `60_000` → `300_000`
- `WspolnotyPage.tsx`: staleTime `30_000` → `300_000`

### Remove
- Martwy hook `useIsCallerAdmin` z `useQueries.ts` (nikt go nie używa)

## Implementation Plan

1. Fix backend main.mo: replace AccessControl.hasPermission → isAuthenticated (3 miejsca)
2. useMinisterRegistrations.ts: dodaj `syncRegistrationsToBackend(actor, regs)` i `loadRegistrationsFromBackend(actor)` helper functions
3. AdminLiturgiaTab.tsx: po saveRegistrations call syncRegistrationsToBackend; na mount load from backend
4. LiturgiaPage.tsx: na mount load registrations from backend i merge z localStorage
5. useLiturgy.ts: w saveWeek await backend save, on failure toast "Błąd zapisu grafiku do backendu" ale zachowaj dane w localStorage
6. useSklepData.ts saveOrder: if (!actor) throw Error z polskim komunikatem; await backend przed update localStorage
7. AdminModlitwaTab.tsx: na mount load `actor.listLiturgyWeeks()`, convert to Record<string, LiturgyWeek>, use as state
8. Navigation.tsx: bg-background fix
9. KancelariaPage/WspolnotyPage: staleTime 300_000
10. useQueries.ts: usuń useIsCallerAdmin
