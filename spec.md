# Parafia sw Jana Chrzciciela

## Current State

Aplikacja ma wdrożone zakładki: Strona Główna, Aktualności, Liturgia, Wspólnoty, Kancelaria, Galeria, Kontakt, Panel Admina.

Backend korzysta z `contentBlocks` (klucz-wartość) do przechowywania tekstów edytowalnych. Autentykacja: zalogowany przez Internet Identity = admin. Nie ma zakładki "Kaplica" -- ani w nawigacji, ani w stopce, ani w routerze.

## Requested Changes (Diff)

### Add
- Typ `PrayerIntention` w backendzie z polami: id, name, title, content, email, visibility, status, date, prayerCount, featured
- Backend funkcje: `submitPrayerIntention` (publiczna), `updatePrayerIntentionStatus`, `updatePrayerIntention`, `deletePrayerIntention`, `getPrayerIntentions` (admin), `getPublicPrayerIntentions` (publiczna), `incrementPrayerCount` (publiczna)
- Strona `KaplicaPage.tsx` z: hero, formularz intencji, wizualizacja świec, lista publicznych intencji, sekcja "Dar serca"
- Panel admina `AdminKaplicaTab.tsx`: lista wszystkich intencji, moderacja (statusy, edycja, przypisanie do Mszy, wyróżnienie, archiwizacja)
- Route `/kaplica` w App.tsx
- Wpis "Kaplica" w nawigacji (Navigation.tsx DEFAULT_NAV) i stopce (Footer.tsx)
- Zakładka "Kaplica" w AdminPage.tsx

### Modify
- `src/backend/main.mo` -- dodanie PrayerIntention type i funkcji CRUD
- `src/frontend/src/App.tsx` -- nowy import i Route dla KaplicaPage
- `src/frontend/src/components/parish/Navigation.tsx` -- dodanie "Kaplica" do DEFAULT_NAV
- `src/frontend/src/components/parish/Footer.tsx` -- dodanie "Kaplica" do linków
- `src/frontend/src/pages/AdminPage.tsx` -- dodanie zakładki Kaplica

### Remove
- Nic

## Implementation Plan

1. **Backend (main.mo)**: Dodaj `PrayerIntention` record type i Map. Dodaj 7 funkcji (submit publiczna, get publiczne, get wszystkich dla admina, update status, update intention, delete, increment prayer count).

2. **KaplicaPage.tsx**: 
   - Hero: ciemne gradientowe tło, edytowalny nagłówek/podtytuł/opis przez contentBlock, obraz tła
   - Wizualizacja świec: canvas lub CSS-based, centralna świeca Mszy (złota, pulsująca, auto-aktywna gdy trwa Msza wg grafiku liturgicznego z localStorage), świece indywidualne dla zatwierdzonych intencji
   - Formularz intencji: imię (opcjonalne), tytuł, treść, email (opcjonalne), widoczność (public/private), limit 1 dziennie przez localStorage
   - Lista publicznych intencji z licznikiem "Modlę się"
   - Sekcja "Dar serca": numer konta (edytowalny contentBlock), przycisk kopiowania

3. **AdminKaplicaTab.tsx**: Tabela intencji ze statusami, filtrowanie, akcje (zatwierdź, edytuj, odrzuć, przypisz do Mszy, wyróżnij, archiwizuj)

4. **Routing i nawigacja**: Zintegruj nową stronę z istniejącą infrastrukturą.
