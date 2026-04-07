import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import type {
  GalleryAlbum,
  GalleryPhoto,
  HomeSection,
  NewsArticle,
  SiteSettings,
  UserProfile,
  backendInterface,
} from "../backend";
import { useActor } from "./useActor";

// ============================================================
// ACTOR REF PATTERN
// ============================================================
// useActor returns a reactive value; inside mutationFn (which runs outside
// the React render cycle) we cannot call hooks. We track the latest actor
// in a ref so mutations can wait for it to become available after login.

function useActorRef() {
  const { actor, isFetching } = useActor();
  const actorRef = React.useRef<backendInterface | null>(null);
  const fetchingRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    actorRef.current = actor;
    fetchingRef.current = isFetching;
  }, [actor, isFetching]);

  return { actorRef, fetchingRef, actor, isFetching };
}

/**
 * Wait up to 10 seconds for the actor to become available after login.
 * Polls the ref every 100 ms instead of failing immediately.
 */
async function waitForActor(
  actorRef: React.MutableRefObject<backendInterface | null>,
  fetchingRef: React.MutableRefObject<boolean>,
): Promise<backendInterface> {
  // Fast path: actor is already ready
  if (actorRef.current) return actorRef.current;

  for (let i = 0; i < 100; i++) {
    await new Promise<void>((r) => setTimeout(r, 100));
    if (actorRef.current) return actorRef.current;
    // If isFetching stopped being true AND actor is still null → give up
    if (!fetchingRef.current && !actorRef.current) {
      throw new Error("Actor not available");
    }
  }
  throw new Error("Actor timed out after 10 seconds");
}

// ============================================================
// USER PROFILE
// ============================================================

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 0,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ============================================================
// NEWS
// ============================================================

export function usePublicNews() {
  const { actor, isFetching } = useActor();
  return useQuery<NewsArticle[]>({
    queryKey: ["publicNews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicNews();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
  });
}

export function useAllNews() {
  const { actor, isFetching } = useActor();
  return useQuery<NewsArticle[]>({
    queryKey: ["allNews"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllNews();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    retry: 0,
  });
}

export function useCreateNews() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (article: NewsArticle) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.createNewsArticle(article);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicNews"] });
      queryClient.invalidateQueries({ queryKey: ["allNews"] });
    },
  });
}

export function useUpdateNews() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      article,
    }: { id: string; article: NewsArticle }) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.updateNewsArticle(id, article);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicNews"] });
      queryClient.invalidateQueries({ queryKey: ["allNews"] });
    },
  });
}

export function useDeleteNews() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.deleteNewsArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicNews"] });
      queryClient.invalidateQueries({ queryKey: ["allNews"] });
    },
  });
}

// ============================================================
// GALLERY
// ============================================================

export function useGalleryAlbums() {
  const { actor, isFetching } = useActor();
  return useQuery<GalleryAlbum[]>({
    queryKey: ["galleryAlbums"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGalleryAlbums();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
  });
}

export function useCreateAlbum() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (album: GalleryAlbum) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.createGalleryAlbum(album);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

export function useUpdateAlbum() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, album }: { id: string; album: GalleryAlbum }) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.updateGalleryAlbum(id, album);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

export function useDeleteAlbum() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.deleteGalleryAlbum(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

export function useAddPhoto() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      albumId,
      photo,
    }: { albumId: string; photo: GalleryPhoto }) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.addPhoto(albumId, photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

export function useRemovePhoto() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      albumId,
      photoId,
    }: { albumId: string; photoId: string }) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.removePhoto(albumId, photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

// ============================================================
// HOME SECTIONS
// ============================================================

export function useHomeSections() {
  const { actor, isFetching } = useActor();
  return useQuery<HomeSection[]>({
    queryKey: ["homeSections"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHomeSections();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
  });
}

export function useUpdateHomeSections() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sections: HomeSection[]) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.updateHomeSections(sections);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeSections"] });
    },
  });
}

// ============================================================
// SITE SETTINGS
// ============================================================

const LS_KEY_SITE_SETTINGS = "parish_site_settings_cache";

export function useSiteSettings() {
  const { actor, isFetching } = useActor();

  const getLocalData = () => {
    try {
      const raw = localStorage.getItem(LS_KEY_SITE_SETTINGS);
      return raw ? (JSON.parse(raw) as SiteSettings) : undefined;
    } catch {
      return undefined;
    }
  };

  return useQuery<SiteSettings | null>({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getSiteSettings();
      if (result) {
        try {
          localStorage.setItem(LS_KEY_SITE_SETTINGS, JSON.stringify(result));
        } catch {}
      }
      return result;
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
    placeholderData: getLocalData,
  });
}

export function useUpdateSiteSettings() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.updateSiteSettings(settings);
    },
    onSuccess: (_data, settingsArg) => {
      try {
        localStorage.setItem(LS_KEY_SITE_SETTINGS, JSON.stringify(settingsArg));
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
    },
  });
}

// ============================================================
// CONTENT BLOCKS
// ============================================================

export function useAllContentBlocks() {
  const { actor, isFetching } = useActor();
  return useQuery<import("../backend").ContentBlock[]>({
    queryKey: ["contentBlocks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContentBlocks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
  });
}

export function useUpdateContentBlock() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, content }: { key: string; content: string }) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.updateContentBlock(key, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentBlocks"] });
    },
  });
}

// ============================================================
// HOME PAGE DATA – composed from individual preloaded hooks
// ============================================================

/**
 * Composes data for the home page from the three individual hooks that are
 * already preloaded at app startup (homeSections, siteSettings, publicNews).
 * This avoids double-fetching: the preload fills cache under ["homeSections"],
 * ["siteSettings"] and ["publicNews"] – we just read from those same keys.
 */
export function useHomePageData() {
  const { data: homeSections, isLoading: sectionsLoading } = useHomeSections();
  const { data: siteSettings, isLoading: settingsLoading } = useSiteSettings();
  const { data: latestNews, isLoading: newsLoading } = usePublicNews();

  const isLoading = sectionsLoading || settingsLoading || newsLoading;
  const data = React.useMemo(() => {
    if (isLoading && !homeSections && !siteSettings && !latestNews) return null;
    return {
      homeSections: homeSections ?? [],
      siteSettings: siteSettings ?? null,
      latestNews: latestNews ?? [],
    };
  }, [homeSections, siteSettings, latestNews, isLoading]);

  return { data, isLoading };
}

// ============================================================
// SINGLE NEWS ARTICLE
// ============================================================

export function useNewsArticle(id: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<NewsArticle | null>({
    queryKey: ["newsArticle", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return (await actor.getNewsArticle(id)) ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
    staleTime: 300_000,
  });
}

// ============================================================
// PAGINATED NEWS – client-side pagination over full list
// ============================================================

export function usePublicNewsPaginated(page: number, pageSize: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["publicNewsPaginated", page, pageSize],
    queryFn: async () => {
      if (!actor) return { items: [] as NewsArticle[], total: 0 };
      const items = await actor.getPublicNews();
      // Sort by date descending (newest first)
      const sorted = [...items].sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return db - da;
      });
      return { items: sorted, total: sorted.length };
    },
    // Only run when actor is ready — prevents stale empty result caching
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
    select: (data) => {
      const start = page * pageSize;
      return {
        items: data.items.slice(start, start + pageSize),
        total: data.total,
      };
    },
  });
}
