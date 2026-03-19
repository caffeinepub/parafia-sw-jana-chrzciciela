import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useActor } from "./useActor";

export function useAppPreload() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const preloaded = React.useRef(false);

  React.useEffect(() => {
    if (!actor || isFetching || preloaded.current) return;
    preloaded.current = true;

    // Fire and forget -- populate cache in background
    Promise.all([
      actor
        .getPublicNews()
        .then((data) => {
          queryClient.setQueryData(["publicNews"], data);
          queryClient.setQueryData(["publicNewsPaginated", 0, 10], {
            items: [...data].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
            total: data.length,
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
    ]);
  }, [actor, isFetching, queryClient]);
}
