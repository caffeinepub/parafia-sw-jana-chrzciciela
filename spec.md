# Parafia sw Jana Chrzciciela

## Current State

Aplikacja strony parafialnej z pełnym panelem administracyjnym, galerią, aktualnościami, zakładką Liturgia z grafikiem mszalnym, generowaniem PDF, trybami estetycznymi i systemem ról.

**Krytyczny błąd:** Funkcja `getUserRole` w `access-control.mo` wywołuje `Runtime.trap("User is not registered")` gdy użytkownik nie ma przypisanej roli w mapie. To powoduje crash backendu przy każdej operacji wymagającej uprawnień (zapis liturgii, kopiowanie tygodnia, czyszczenie, aktualizacja treści). Użytkownik widzi "błąd zapisu", "błąd kopiowania", "błąd czyszczenia".

## Requested Changes (Diff)

### Add
- Brak nowych funkcji

### Modify
- `access-control.mo` / `getUserRole`: zmień tak, żeby brak roli w mapie zwracał `#user` zamiast `Runtime.trap`. Zalogowany przez Internet Identity użytkownik = `#user` domyślnie.
- Funkcje liturgii (`saveLiturgyWeek`, `copyPreviousWeek`, `deleteLiturgyWeek`): zmień warunek z `AccessControl.hasPermission(#admin)` na `isAuthenticated(caller)` -- każdy zalogowany użytkownik może zarządzać grafikiem liturgicznym.
- Funkcje zarządzania treścią (`updateSiteSettings`, `updateContentBlock`, `updateHomeSections`): zmień warunek z `AccessControl.hasPermission(#admin)` na `isAuthenticated(caller)`.

### Remove
- Brak

## Implementation Plan

1. Regeneruj backend Motoko z poprawioną logiką autoryzacji:
   - `getUserRole` zwraca `#user` gdy brak w mapie (nie trap)
   - Funkcje liturgii, treści, sekcji wymagają tylko `isAuthenticated`, nie roli admin
   - Zachować istniejące typy danych, struktury, storage
2. Frontend bez zmian (błędy są w backendzie)
