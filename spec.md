# Parafia sw Jana Chrzciciela

## Current State

Aplikacja posiada mechanizm cache (localStorage) dla niektórych zakładek, ale większość stron czeka na inicjalizację aktora ICP przed załadowaniem jakichkolwiek danych. Powoduje to białe ekrany lub pulsujące spinnery przy pierwszym wejściu i przy nawigacji między zakładkami. Skeleton screens istnieją tylko w niektórych sekcjach strony głównej (Aktualności, Galeria, Wspólnoty), ale brak ich na stronach podrzędnych.

## Requested Changes (Diff)

### Add
- Skeleton screen components dla każdej głównej zakładki: Aktualności, Liturgia, Wspólnoty, Kancelaria, Kontakt, Modlitwa, Życie, Galeria
- Centralny hook `useAppPreload` w App.tsx który przy starcie aplikacji (gdy aktor jest gotowy) wykonuje jedno zbiorcze zapytanie do backendu pobierając dane dla wszystkich zakładek i zapisując je do React Query cache
- Skeleton screens muszą wizualnie odzwierciedlać kształt docelowej treści (hero placeholder, karty, siatki) -- nie mogą być prostymi szarymi blokami

### Modify
- Wszystkie strony (LiturgiaPage, AktualnosociPage, WspolnotyPage, KancelariaPage, KontaktPage, ModlitwaPage, ZyciePage, GaleriaPage) -- dodać skeleton loading state zamiast białego ekranu lub prostego spinnera
- useQueries.ts -- zwiększyć staleTime dla kluczowych zapytań do 5 minut (300_000ms) aby dane nie były odświeżane przy każdej nawigacji
- HomePage -- już ma skeleton screens w sekcjach, zachować bez zmian

### Remove
- Nic nie usuwać

## Implementation Plan

1. Stworzyć komponent `PageSkeleton` w `src/frontend/src/components/parish/PageSkeleton.tsx` z wariantami dla każdego typu strony (hero+cards, hero+grid, hero+list)
2. Stworzyć hook `useAppPreload` w `src/frontend/src/hooks/useAppPreload.ts` który przy gotowości aktora wywołuje wszystkie główne query równolegle przez Promise.all, populując React Query cache
3. Dodać wywołanie `useAppPreload` w App.tsx (lub w AppLayout) -- jeden raz przy starcie aplikacji
4. Dodać skeleton loading state do: AktualnosociPage, LiturgiaPage, WspolnotyPage, KancelariaPage, KontaktPage, ModlitwaPage, ZyciePage, GaleriaPage
5. Zwiększyć staleTime w useQueries.ts dla: publicNews, galleryAlbums, homeSections, siteSettings, contentBlocks
