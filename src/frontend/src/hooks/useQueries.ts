import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import type {
  AppUserRole,
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
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

export function useSiteSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteSettings | null>({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSiteSettings();
    },
    enabled: !!actor && !isFetching,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
    },
  });
}

// ============================================================
// ROLES
// ============================================================

export function useListAllRoles() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, AppUserRole]>>({
    queryKey: ["allRoles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listAllRoles();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
  });
}

export function useAssignRole() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: { user: Principal; role: AppUserRole }) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.assignAppRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRoles"] });
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
// HOME PAGE DATA – single parallel fetch for all sections
// ============================================================

export function useHomePageData() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["homePageData"],
    queryFn: async () => {
      if (!actor) return null;
      const [homeSections, siteSettings, latestNews] = await Promise.all([
        actor.getHomeSections(),
        actor.getSiteSettings(),
        actor.getPublicNews(),
      ]);
      return { homeSections, siteSettings, latestNews };
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000, // 30s client-side cache
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
    // staleTime: 0 ensures the query re-fetches whenever it becomes enabled
    staleTime: 0,
    select: (data) => {
      const start = page * pageSize;
      return {
        items: data.items.slice(start, start + pageSize),
        total: data.total,
      };
    },
  });
}
