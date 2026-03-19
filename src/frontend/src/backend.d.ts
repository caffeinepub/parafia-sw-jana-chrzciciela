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
export interface Community {
    id: string;
    meetingDay: string;
    meetingPlace: string;
    caretaker: string;
    order: bigint;
    name: string;
    meetingTime: string;
    heroImage: ExternalBlob;
    shortDescription: string;
    contactEmail: string;
    fullDescription: string;
    photos: Array<ExternalBlob>;
    contactPhone: string;
}
export interface PrayerStar {
    id: string;
    isApproved: boolean;
    city?: string;
    name?: string;
    color: string;
    joinedAt: string;
    isHidden: boolean;
    isPublic: boolean;
    prayCount: bigint;
    intention?: string;
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
export interface ModlitwaConfig {
    heroDescription: string;
    thankYouTitle: string;
    heroSubtitle: string;
    accountNumber: string;
    heroTitle: string;
    bankOwner: string;
    thankYouText: string;
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
export interface LiturgyEntry {
    id: string;
    serviceType: string;
    entryType: string;
    order: bigint;
    time: string;
    description: string;
    intention: string;
}
export interface MassIntention {
    id: string;
    status: string;
    assignedDayIndex?: bigint;
    name: string;
    createdAt: string;
    color: string;
    email?: string;
    assignedWeekId?: string;
    assignedEntryId?: string;
    phone?: string;
    assignedMassDate?: string;
    assignedMassTime?: string;
    offeringStatus: string;
    intention: string;
}
export interface UserProfile {
    name: string;
    role?: AppUserRole;
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
    addCommunityPhoto(communityId: string, photo: ExternalBlob): Promise<void>;
    addPhoto(albumId: string, photo: GalleryPhoto): Promise<void>;
    assignAppRole(user: Principal, role: AppUserRole): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    copyPreviousWeek(fromWeekId: string, toWeekId: string, newWeekStart: string, newWeekEnd: string): Promise<void>;
    createCommunity(community: Community): Promise<void>;
    createEvent(event: Event): Promise<void>;
    createGalleryAlbum(album: GalleryAlbum): Promise<void>;
    createNewsArticle(article: NewsArticle): Promise<void>;
    deleteCommunity(id: string): Promise<void>;
    deleteEvent(id: string): Promise<void>;
    deleteGalleryAlbum(id: string): Promise<void>;
    deleteLiturgyWeek(weekId: string): Promise<void>;
    deleteMassIntention(id: string): Promise<void>;
    deleteNewsArticle(id: string): Promise<void>;
    deletePrayerStar(id: string): Promise<void>;
    getAllCommunities(): Promise<Array<Community>>;
    getAllContentBlocks(): Promise<Array<ContentBlock>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllNews(): Promise<Array<NewsArticle>>;
    getAppRole(user: Principal): Promise<AppUserRole | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommunity(id: string): Promise<Community | null>;
    getContentBlock(key: string): Promise<ContentBlock | null>;
    getCurrentLiturgyWeek(): Promise<LiturgyWeek | null>;
    getEvent(id: string): Promise<Event | null>;
    getGalleryAlbum(id: string): Promise<GalleryAlbum | null>;
    getGalleryAlbums(): Promise<Array<GalleryAlbum>>;
    getHomeSections(): Promise<Array<HomeSection>>;
    getLiturgyWeek(weekId: string): Promise<LiturgyWeek | null>;
    getMassIntentions(): Promise<Array<MassIntention>>;
    getModlitwaConfig(): Promise<ModlitwaConfig | null>;
    getNewsArticle(id: string): Promise<NewsArticle | null>;
    getPhotosByAlbum(albumId: string): Promise<Array<GalleryPhoto>>;
    getPrayerStars(): Promise<Array<PrayerStar>>;
    getPublicEvents(): Promise<Array<Event>>;
    getPublicNews(): Promise<Array<NewsArticle>>;
    getSiteSettings(): Promise<SiteSettings | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllRoles(): Promise<Array<[Principal, AppUserRole]>>;
    listLiturgyWeeks(): Promise<Array<LiturgyWeek>>;
    removeCommunityPhoto(communityId: string, photoIndex: bigint): Promise<void>;
    removePhoto(albumId: string, photoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveLiturgyWeek(week: LiturgyWeek): Promise<void>;
    saveMassIntention(intention: MassIntention): Promise<void>;
    saveModlitwaConfig(config: ModlitwaConfig): Promise<void>;
    savePrayerStar(star: PrayerStar): Promise<void>;
    updateCommunity(id: string, community: Community): Promise<void>;
    updateContentBlock(key: string, content: string): Promise<void>;
    updateEvent(id: string, event: Event): Promise<void>;
    updateGalleryAlbum(id: string, album: GalleryAlbum): Promise<void>;
    updateHomeSections(sections: Array<HomeSection>): Promise<void>;
    updateNewsArticle(id: string, article: NewsArticle): Promise<void>;
    updateSiteSettings(settings: SiteSettings): Promise<void>;
}
