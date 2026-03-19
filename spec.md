# Parafia sw Jana Chrzciciela

## Current State
Stopka ma trzy kolumny: lewa (hardcoded: "Parafia św. Jana Chrzciciela" + "Strona parafialna"), środkowa (hardcoded lista linków nawigacji), prawa (Kontakt z danych admina). Nawigacja główna wyświetla hardcoded logo "PJ" + tekst. Panel admina → Ustawienia: tylko kontakt, konto bankowe, social media, tryb estetyczny. Brak edycji lewej kolumny stopki, nawigacji stopki i logo.

## Requested Changes (Diff)

### Add
- Sekcja "Logo parafii" w panelu Ustawienia: upload zdjęcia logo (base64 w contactData.navLogoUrl)
- Sekcja "Informacje w stopce" w panelu Ustawienia: nazwa parafii, motto/opis, mały obraz/ikona (contactData.parishName, parishMotto, parishIconUrl)
- Sekcja "Nawigacja w stopce" w panelu Ustawienia: niezależna lista linków (contactData.footerNavLinks jako JSON array {name, path}[])

### Modify
- Navigation.tsx: jeśli navLogoUrl istnieje → wyświetl img obok tekstu; jeśli nie → sama nazwa tekstowa (jak teraz)
- Footer.tsx lewa kolumna: czyta parishName/parishMotto/parishIconUrl z settings; wyświetla pionowo
- Footer.tsx środkowa kolumna: czyta footerNavLinks z settings zamiast hardcoded listy; wyświetla pionowo
- AdminPage SettingsTab: dodaje trzy nowe sekcje edycji

### Remove
- Hardcoded statyczne dane w lewej i środkowej kolumnie stopki

## Implementation Plan
1. Rozszerzyć contactData JSON o pola: navLogoUrl, parishName, parishMotto, parishIconUrl, footerNavLinks
2. AdminPage SettingsTab: dodać 3 nowe sekcje (logo nav, info parafia w stopce, nawigacja stopki)
3. Footer.tsx: lewa kolumna czyta z settings, środkowa kolumna z footerNavLinks z settings
4. Navigation.tsx: logo warunkowe (img + tekst jeśli navLogoUrl, sam tekst jeśli nie)
