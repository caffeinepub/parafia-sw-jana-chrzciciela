import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useActor } from "./useActor";

// Keys used by KancelariaPage
const KANCELARIA_META_KEY = "kancelaria_meta";
const KANCELARIA_HOURS_KEY = "kancelaria_hours";
const KANCELARIA_MATTERS_KEY = "kancelaria_matters";
const WSPOLNOTY_META_KEY = "wspolnotyMeta";
const WSPOLNOTY_CONTENT_KEY = "communities";
const WSPOLNOTY_CONTENT_BLOCK_KEY = "communities_data";

export function useAppPreload() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const preloaded = React.useRef(false);

  React.useEffect(() => {
    if (!actor || isFetching || preloaded.current) return;
    preloaded.current = true;

    // Fire and forget -- populate cache for all tabs in background
    Promise.all([
      // ── Strona główna ──────────────────────────────────────
      actor
        .getPublicNews()
        .then((data) => {
          queryClient.setQueryData(["publicNews"], data);
          const sorted = [...data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
          queryClient.setQueryData(["publicNewsPaginated", 0, 10], {
            items: sorted,
            total: sorted.length,
          });
        })
        .catch(() => {}),

      actor
        .getGalleryAlbums()
        .then((data) => {
          queryClient.setQueryData(["galleryAlbums"], data);
        })
        .catch(() => {}),

      actor
        .getHomeSections()
        .then((data) => {
          queryClient.setQueryData(["homeSections"], data);
        })
        .catch(() => {}),

      actor
        .getSiteSettings()
        .then((data) => {
          queryClient.setQueryData(["siteSettings"], data);
          if (data) {
            try {
              localStorage.setItem(
                "parish_site_settings_cache",
                JSON.stringify(data),
              );
            } catch {}
          }
        })
        .catch(() => {}),

      actor
        .getAllContentBlocks()
        .then((data) => {
          queryClient.setQueryData(["contentBlocks"], data);
        })
        .catch(() => {}),

      // ── Wspólnoty ─────────────────────────────────────────
      actor
        .getContentBlock(WSPOLNOTY_META_KEY)
        .then((block) => {
          if (block?.content) {
            try {
              queryClient.setQueryData(
                ["wspolnotyMeta"],
                JSON.parse(block.content),
              );
            } catch {}
          }
        })
        .catch(() => {}),

      actor
        .getContentBlock(WSPOLNOTY_CONTENT_BLOCK_KEY)
        .then((block) => {
          if (block?.content) {
            try {
              queryClient.setQueryData(
                [WSPOLNOTY_CONTENT_KEY],
                JSON.parse(block.content),
              );
            } catch {}
          }
        })
        .catch(() => {}),

      // ── Kancelaria ────────────────────────────────────────
      actor
        .getContentBlock(KANCELARIA_META_KEY)
        .then((block) => {
          if (block?.content) {
            try {
              queryClient.setQueryData(
                [KANCELARIA_META_KEY],
                JSON.parse(block.content),
              );
              localStorage.setItem(
                "parish_kancelaria_meta_cache",
                block.content,
              );
            } catch {}
          }
        })
        .catch(() => {}),

      actor
        .getContentBlock(KANCELARIA_HOURS_KEY)
        .then((block) => {
          if (block?.content) {
            try {
              queryClient.setQueryData(
                [KANCELARIA_HOURS_KEY],
                JSON.parse(block.content),
              );
              localStorage.setItem(
                "parish_kancelaria_hours_cache",
                block.content,
              );
            } catch {}
          }
        })
        .catch(() => {}),

      actor
        .getContentBlock(KANCELARIA_MATTERS_KEY)
        .then((block) => {
          if (block?.content) {
            try {
              queryClient.setQueryData(
                [KANCELARIA_MATTERS_KEY],
                JSON.parse(block.content),
              );
              localStorage.setItem(
                "parish_kancelaria_matters_cache",
                block.content,
              );
            } catch {}
          }
        })
        .catch(() => {}),

      // ── Życie ─────────────────────────────────────────────
      actor
        .getContentBlock("zycie_data")
        .then((block) => {
          if (block?.content) {
            try {
              queryClient.setQueryData(
                ["zycieData"],
                JSON.parse(block.content),
              );
              localStorage.setItem("zycie_data", block.content);
            } catch {}
          }
        })
        .catch(() => {}),

      // ── Sklep ─────────────────────────────────────────────
      actor
        .getContentBlock("sklep_products")
        .then((block) => {
          if (block?.content) {
            try {
              queryClient.setQueryData(
                ["sklepProducts"],
                JSON.parse(block.content),
              );
              localStorage.setItem("sklep_products_cache", block.content);
            } catch {}
          }
        })
        .catch(() => {}),

      actor
        .getContentBlock("sklep_config")
        .then((block) => {
          if (block?.content) {
            try {
              queryClient.setQueryData(
                ["sklepConfig"],
                JSON.parse(block.content),
              );
              localStorage.setItem("sklep_config_cache", block.content);
            } catch {}
          }
        })
        .catch(() => {}),
    ]);
  }, [actor, isFetching, queryClient]);
}
