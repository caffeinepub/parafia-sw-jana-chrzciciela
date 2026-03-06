import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AppUserRole,
  Event,
  GalleryAlbum,
  GalleryPhoto,
  HomeSection,
  NewsArticle,
  SiteSettings,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (article: NewsArticle) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createNewsArticle(article);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicNews"] });
      queryClient.invalidateQueries({ queryKey: ["allNews"] });
    },
  });
}

export function useUpdateNews() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      article,
    }: { id: string; article: NewsArticle }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateNewsArticle(id, article);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicNews"] });
      queryClient.invalidateQueries({ queryKey: ["allNews"] });
    },
  });
}

export function useDeleteNews() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteNewsArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicNews"] });
      queryClient.invalidateQueries({ queryKey: ["allNews"] });
    },
  });
}

// ============================================================
// EVENTS
// ============================================================

export function usePublicEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["publicEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["allEvents"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllEvents();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: Event) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicEvents"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
    },
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, event }: { id: string; event: Event }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateEvent(id, event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicEvents"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteEvent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicEvents"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (album: GalleryAlbum) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createGalleryAlbum(album);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

export function useUpdateAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, album }: { id: string; album: GalleryAlbum }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateGalleryAlbum(id, album);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

export function useDeleteAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteGalleryAlbum(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

export function useAddPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      albumId,
      photo,
    }: { albumId: string; photo: GalleryPhoto }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addPhoto(albumId, photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryAlbums"] });
    },
  });
}

export function useRemovePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      albumId,
      photoId,
    }: { albumId: string; photoId: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.removePhoto(albumId, photoId);
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sections: HomeSection[]) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateHomeSections(sections);
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateSiteSettings(settings);
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: { user: Principal; role: AppUserRole }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.assignAppRole(user, role);
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
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, content }: { key: string; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateContentBlock(key, content);
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
      const [homeSections, siteSettings, latestNews, upcomingEvents] =
        await Promise.all([
          actor.getHomeSections(),
          actor.getSiteSettings(),
          actor.getPublicNews(),
          actor.getPublicEvents(),
        ]);
      return { homeSections, siteSettings, latestNews, upcomingEvents };
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
    queryKey: ["publicNewsPaginated"],
    queryFn: async () => {
      if (!actor) return { items: [] as NewsArticle[], total: 0 };
      const items = await actor.getPublicNews();
      return { items, total: items.length };
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    select: (data) => {
      const start = page * pageSize;
      return {
        items: data.items.slice(start, start + pageSize),
        total: data.total,
      };
    },
  });
}

// ============================================================
// PAGINATED EVENTS – client-side pagination over full list
// ============================================================

export function usePublicEventsPaginated(page: number, pageSize: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["publicEventsPaginated"],
    queryFn: async () => {
      if (!actor) return { items: [] as Event[], total: 0 };
      const items = await actor.getPublicEvents();
      return { items, total: items.length };
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    select: (data) => {
      const start = page * pageSize;
      return {
        items: data.items.slice(start, start + pageSize),
        total: data.total,
      };
    },
  });
}
