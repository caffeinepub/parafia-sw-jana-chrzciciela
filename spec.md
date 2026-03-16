# Parafia sw Jana Chrzciciela

## Current State
Aplikacja parafialna z zakładkami: Aktualności, Liturgia, Wspólnoty, Galeria, Kancelaria, Kontakt, Modlitwa. Brak zakładki "Życie".

## Requested Changes (Diff)

### Add
- Nowa zakładka "Życie" pod adresem `/zycie` z interaktywną SVG Rozetą Liturgiczną
- ZyciePage.tsx -- strona publiczna z Rozetą
- AdminZycieTab.tsx -- panel admina do zarządzania danymi
- 6 kategorii życia parafii: Chrzty, I Komunia, Bierzmowanie, Małżeństwa, Pogrzeby ("Odeszli do Domu Ojca"), Wydarzenia
- Dane demonstracyjne dla lat 2024-2026
- Dropdown wyboru roku
- Panel detalu po kliknięciu sektora rozety
- Statystyki roczne pod rozetą
- Hero z edytowalnymi tekstami
- "Życie" w DEFAULT_NAV i menu nawigacyjnym

### Modify
- App.tsx -- dodać Route path="/zycie"
- AdminPage.tsx -- dodać zakładkę Życie i DEFAULT_NAV entry
- Footer.tsx -- dodać link do /zycie

### Remove
- Nic

## Implementation Plan
1. ZyciePage.tsx:
   - Hero z gradientem i edytowalnymi tekstami (tło ciemne, sakralne)
   - Interaktywna SVG Rozeta -- koło podzielone na 6 sektorów kolorowych jak witraż kościelny
   - Centrum rozety: wybrany rok + statystyki sumaryczne, powolna pulsacja złotego blasku
   - 6 sektorów z ikonami i etykietami: Chrzty (błękit), I Komunia (złoto), Bierzmowanie (czerwień), Małżeństwa (róż), Odeszli do Domu Ojca (fiolet), Wydarzenia (zieleń)
   - Animacja: cząsteczki światła unoszące się wokół rozety, sektory rozświetlają się przy hover/klik
   - Kliknięcie sektora otwiera panel boczny slide-in z listą wpisów danej kategorii i roku
   - Dropdown wyboru roku (2024, 2025, 2026)
   - Statystyki roczne pod rozetą (6 liczb w kartach)
   - Dane z localStorage (zycieData) z fallback na dane demo
2. AdminZycieTab.tsx:
   - 6 podzakładek per kategoria
   - CRUD dla każdej kategorii (dodaj, edytuj, usuń)
   - Pola zależne od kategorii (imię, data, rok, opis, hasło bierzmowania itp.)
   - Zapis do localStorage pod kluczem zycieData
3. App.tsx -- Route /zycie
4. AdminPage.tsx -- zakładka Życie + DEFAULT_NAV entry
5. Footer.tsx -- link Życie
