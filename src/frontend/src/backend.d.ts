import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ContentBlock {
    id: string;
    content: string;
}
export interface GalleryPhoto {
    id: string;
    order: bigint;
    blob: ExternalBlob;
    date: string;
    caption: string;
}
export interface LiturgyWeek {
    id: string;
    weekEnd: string;
    heroDescription: string;
    days: Array<LiturgyDay>;
    heroSubtitle: string;
    heroTitle: string;
    weekStart: string;
}
export interface Event {
    id: string;
    title: string;
    featured: boolean;
    date: string;
    published: boolean;
    description: string;
    pinned: boolean;
    liturgicalColor: string;
    image: ExternalBlob;
}
export interface SiteSettings {
    contactData: string;
    navigation: string;
    aestheticMode: string;
    typography: string;
}
export interface GalleryAlbum {
    id: string;
    date: string;
    name: string;
    layout: string;
    description: string;
    coverImage: ExternalBlob;
    photos: Array<GalleryPhoto>;
}
export interface LiturgyEntry {
    id: string;
    serviceType: string;
    entryType: string;
    order: bigint;
    time: string;
    description: string;
    intention: string;
}
export interface NewsArticle {
    id: string;
    title: string;
    content: string;
    order: bigint;
    date: string;
    published: boolean;
    image: ExternalBlob;
}
export interface LiturgyDay {
    entries: Array<LiturgyEntry>;
    dayIndex: bigint;
}
export interface HomeSection {
    id: string;
    order: bigint;
    sectionType: string;
    enabled: boolean;
    customTitle: string;
    customContent: string;
}
export interface UserProfile {
    name: string;
    role?: AppUserRole;
}
export interface PrayerIntention {
    id: string;
    name: string;
    title: string;
    content: string;
    email: string;
    visibility: string;
    status: string;
    date: string;
    prayerCount: bigint;
    featured: boolean;
}
export enum AppUserRole {
    admin = "admin",
    moderator = "moderator",
    editor = "editor",
    photographer = "photographer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPhoto(albumId: string, photo: GalleryPhoto): Promise<void>;
    assignAppRole(user: Principal, role: AppUserRole): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    copyPreviousWeek(fromWeekId: string, toWeekId: string, newWeekStart: string, newWeekEnd: string): Promise<void>;
    createEvent(event: Event): Promise<void>;
    createGalleryAlbum(album: GalleryAlbum): Promise<void>;
    createNewsArticle(article: NewsArticle): Promise<void>;
    deleteEvent(id: string): Promise<void>;
    deleteGalleryAlbum(id: string): Promise<void>;
    deleteLiturgyWeek(weekId: string): Promise<void>;
    deleteNewsArticle(id: string): Promise<void>;
    getAllContentBlocks(): Promise<Array<ContentBlock>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllNews(): Promise<Array<NewsArticle>>;
    getAppRole(user: Principal): Promise<AppUserRole | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContentBlock(key: string): Promise<ContentBlock | null>;
    getCurrentLiturgyWeek(): Promise<LiturgyWeek | null>;
    getEvent(id: string): Promise<Event | null>;
    getGalleryAlbum(id: string): Promise<GalleryAlbum | null>;
    getGalleryAlbums(): Promise<Array<GalleryAlbum>>;
    getHomeSections(): Promise<Array<HomeSection>>;
    getLiturgyWeek(weekId: string): Promise<LiturgyWeek | null>;
    getNewsArticle(id: string): Promise<NewsArticle | null>;
    getPhotosByAlbum(albumId: string): Promise<Array<GalleryPhoto>>;
    getPublicEvents(): Promise<Array<Event>>;
    getPublicNews(): Promise<Array<NewsArticle>>;
    getSiteSettings(): Promise<SiteSettings | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllRoles(): Promise<Array<[Principal, AppUserRole]>>;
    listLiturgyWeeks(): Promise<Array<LiturgyWeek>>;
    removePhoto(albumId: string, photoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveLiturgyWeek(week: LiturgyWeek): Promise<void>;
    updateContentBlock(key: string, content: string): Promise<void>;
    updateEvent(id: string, event: Event): Promise<void>;
    updateGalleryAlbum(id: string, album: GalleryAlbum): Promise<void>;
    updateHomeSections(sections: Array<HomeSection>): Promise<void>;
    updateNewsArticle(id: string, article: NewsArticle): Promise<void>;
    updateSiteSettings(settings: SiteSettings): Promise<void>;
    // Prayer Intentions (Kaplica)
    submitPrayerIntention(intention: PrayerIntention): Promise<void>;
    getAllPrayerIntentions(): Promise<Array<PrayerIntention>>;
    getPublicPrayerIntentions(): Promise<Array<PrayerIntention>>;
    updatePrayerIntentionStatus(id: string, status: string): Promise<void>;
    updatePrayerIntention(id: string, intention: PrayerIntention): Promise<void>;
    deletePrayerIntention(id: string): Promise<void>;
    incrementPrayerCount(id: string): Promise<void>;
    setFeaturedPrayerIntention(id: string, featured: boolean): Promise<void>;
}
