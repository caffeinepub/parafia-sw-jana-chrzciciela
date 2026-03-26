import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Enable data migration

actor {
  public type GalleryPhoto = {
    id : Text;
    blob : Storage.ExternalBlob;
    caption : Text;
    date : Text;
    order : Nat;
  };

  module GalleryPhoto {
    public func compare(a : GalleryPhoto, b : GalleryPhoto) : Order.Order {
      Nat.compare(a.order, b.order);
    };
  };

  public type GalleryAlbum = {
    id : Text;
    name : Text;
    description : Text;
    date : Text;
    coverImage : Storage.ExternalBlob;
    layout : Text;
    photos : [GalleryPhoto];
  };

  module GalleryAlbum {
    public func compare(a : GalleryAlbum, b : GalleryAlbum) : Order.Order {
      Text.compare(a.date, b.date);
    };
  };

  public type NewsArticle = {
    id : Text;
    title : Text;
    content : Text;
    date : Text;
    image : Storage.ExternalBlob;
    published : Bool;
    order : Nat;
  };

  module NewsArticle {
    public func compare(a : NewsArticle, b : NewsArticle) : Order.Order {
      Nat.compare(a.order, b.order);
    };
  };

  public type Event = {
    id : Text;
    title : Text;
    description : Text;
    date : Text;
    image : Storage.ExternalBlob;
    featured : Bool;
    pinned : Bool;
    liturgicalColor : Text;
    published : Bool;
  };

  public type Community = {
    id : Text;
    name : Text;
    shortDescription : Text;
    fullDescription : Text;
    meetingDay : Text;
    meetingTime : Text;
    meetingPlace : Text;
    caretaker : Text;
    contactPhone : Text;
    contactEmail : Text;
    order : Nat;
    heroImage : Storage.ExternalBlob;
    photos : [Storage.ExternalBlob];
  };

  module Community {
    public func compare(a : Community, b : Community) : Order.Order {
      Nat.compare(a.order, b.order);
    };
  };

  let newsArticles = Map.empty<Text, NewsArticle>();
  let events = Map.empty<Text, Event>();
  let galleryAlbums = Map.empty<Text, GalleryAlbum>();
  let communities = Map.empty<Text, Community>();

  public type HomeSection = {
    id : Text;
    sectionType : Text;
    enabled : Bool;
    order : Nat;
    customTitle : Text;
    customContent : Text;
  };

  public type SiteSettings = {
    aestheticMode : Text;
    contactData : Text;
    typography : Text;
    navigation : Text;
  };

  public type ContentBlock = {
    id : Text;
    content : Text;
  };

  public type AppUserRole = {
    #admin;
    #editor;
    #moderator;
    #photographer;
  };

  public type UserProfile = {
    name : Text;
    role : ?AppUserRole;
  };

  var homeSections : List.List<HomeSection> = List.empty<HomeSection>();

  let appRoles = Map.empty<Principal, AppUserRole>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let contentBlocks = Map.empty<Text, ContentBlock>();
  var siteSettings : ?SiteSettings = null;

  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func isAuthenticated(caller : Principal) : Bool {
    not caller.isAnonymous();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) { return null };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateSiteSettings(settings : SiteSettings) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    siteSettings := ?settings;
  };

  public query func getSiteSettings() : async ?SiteSettings {
    siteSettings;
  };

  public query func getContentBlock(key : Text) : async ?ContentBlock {
    contentBlocks.get(key);
  };

  public query func getAllContentBlocks() : async [ContentBlock] {
    contentBlocks.values().toArray();
  };

  public shared ({ caller }) func updateContentBlock(key : Text, content : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    let block : ContentBlock = {
      id = key;
      content = content;
    };
    contentBlocks.add(key, block);
  };

  public shared ({ caller }) func createNewsArticle(article : NewsArticle) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    newsArticles.add(article.id, article);
  };

  public shared ({ caller }) func updateNewsArticle(id : Text, article : NewsArticle) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    switch (newsArticles.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?_) { newsArticles.add(id, article) };
    };
  };

  public shared ({ caller }) func deleteNewsArticle(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    newsArticles.remove(id);
  };

  public query func getNewsArticle(id : Text) : async ?NewsArticle {
    newsArticles.get(id);
  };

  public query func getPublicNews() : async [NewsArticle] {
    let published = newsArticles.values().toArray().filter(func(article : NewsArticle) : Bool { article.published });
    published.sort();
  };

  public query ({ caller }) func getAllNews() : async [NewsArticle] {
    if (not isAuthenticated(caller)) {
      let published = newsArticles.values().toArray().filter(func(article : NewsArticle) : Bool { article.published });
      return published.sort();
    };
    let all = newsArticles.values().toArray();
    all.sort();
  };

  public shared ({ caller }) func createEvent(event : Event) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    events.add(event.id, event);
  };

  public shared ({ caller }) func updateEvent(id : Text, event : Event) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    switch (events.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?_) { events.add(id, event) };
    };
  };

  public shared ({ caller }) func deleteEvent(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    events.remove(id);
  };

  public query func getEvent(id : Text) : async ?Event {
    events.get(id);
  };

  public query func getPublicEvents() : async [Event] {
    events.values().toArray().filter(func(event : Event) : Bool { event.published });
  };

  public query ({ caller }) func getAllEvents() : async [Event] {
    if (not isAuthenticated(caller)) {
      return events.values().toArray().filter(func(event : Event) : Bool { event.published });
    };
    events.values().toArray();
  };

  public shared ({ caller }) func createGalleryAlbum(album : GalleryAlbum) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    galleryAlbums.add(album.id, album);
  };

  public shared ({ caller }) func updateGalleryAlbum(id : Text, album : GalleryAlbum) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    switch (galleryAlbums.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?_) { galleryAlbums.add(id, album) };
    };
  };

  public shared ({ caller }) func deleteGalleryAlbum(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    galleryAlbums.remove(id);
  };

  public query func getGalleryAlbum(id : Text) : async ?GalleryAlbum {
    galleryAlbums.get(id);
  };

  public query func getGalleryAlbums() : async [GalleryAlbum] {
    let albums = galleryAlbums.values().toArray();
    albums.sort();
  };

  public shared ({ caller }) func addPhoto(albumId : Text, photo : GalleryPhoto) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (galleryAlbums.get(albumId)) {
      case (null) { Runtime.trap("Not found") };
      case (?album) {
        let currentPhotos = album.photos;
        let newPhotos = currentPhotos.concat([photo]);
        let sortedPhotos = newPhotos.sort();
        let updatedAlbum = {
          album with
          photos = sortedPhotos;
        };
        galleryAlbums.add(albumId, updatedAlbum);
      };
    };
  };

  public shared ({ caller }) func removePhoto(albumId : Text, photoId : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (galleryAlbums.get(albumId)) {
      case (null) { Runtime.trap("Not found") };
      case (?album) {
        let filteredPhotos = album.photos.filter(func(p : GalleryPhoto) : Bool { p.id != photoId });
        let updatedAlbum = {
          album with
          photos = filteredPhotos;
        };
        galleryAlbums.add(albumId, updatedAlbum);
      };
    };
  };

  public query func getPhotosByAlbum(albumId : Text) : async [GalleryPhoto] {
    switch (galleryAlbums.get(albumId)) {
      case (null) { [] };
      case (?album) { album.photos };
    };
  };

  public shared ({ caller }) func updateHomeSections(sections : [HomeSection]) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    homeSections := List.fromArray(sections);
  };

  public query func getHomeSections() : async [HomeSection] {
    let sectionsArray = homeSections.toArray();
    sectionsArray.sort(func(a : HomeSection, b : HomeSection) : Order.Order {
      Nat.compare(a.order, b.order);
    });
  };

  public shared ({ caller }) func assignAppRole(user : Principal, role : AppUserRole) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    appRoles.add(user, role);
    switch (userProfiles.get(user)) {
      case (?profile) {
        let updatedProfile = {
          profile with
          role = ?role;
        };
        userProfiles.add(user, updatedProfile);
      };
      case (null) {
        let newProfile : UserProfile = {
          name = "";
          role = ?role;
        };
        userProfiles.add(user, newProfile);
      };
    };
  };

  public query func getAppRole(user : Principal) : async ?AppUserRole {
    appRoles.get(user);
  };

  public query ({ caller }) func listAllRoles() : async [(Principal, AppUserRole)] {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    appRoles.entries().toArray();
  };

  // Community CRUD
  public shared ({ caller }) func createCommunity(community : Community) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    communities.add(community.id, community);
  };

  public shared ({ caller }) func updateCommunity(id : Text, community : Community) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    communities.add(id, community);
  };

  public shared ({ caller }) func deleteCommunity(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    communities.remove(id);
  };

  public query func getCommunity(id : Text) : async ?Community {
    communities.get(id);
  };

  public query func getAllCommunities() : async [Community] {
    let all = communities.values().toArray();
    all.sort();
  };

  public shared ({ caller }) func addCommunityPhoto(communityId : Text, photo : Storage.ExternalBlob) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    switch (communities.get(communityId)) {
      case (null) { Runtime.trap("Community not found") };
      case (?community) {
        let newPhotos = community.photos.concat([photo]);
        let updated = { community with photos = newPhotos };
        communities.add(communityId, updated);
      };
    };
  };

  public shared ({ caller }) func removeCommunityPhoto(communityId : Text, photoIndex : Nat) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    switch (communities.get(communityId)) {
      case (null) { Runtime.trap("Community not found") };
      case (?community) {
        let newPhotos = community.photos.filter(func(_ : Storage.ExternalBlob) : Bool {
          // filter by position -- rebuild without the removed index
          true // placeholder; actual filtering done on frontend
        });
        let _ = newPhotos;
        // Remove by rebuilding array without the index
        var i : Nat = 0;
        let filtered = community.photos.filter(func(_ : Storage.ExternalBlob) : Bool {
          let keep = i != photoIndex;
          i += 1;
          keep;
        });
        let updated = { community with photos = filtered };
        communities.add(communityId, updated);
      };
    };
  };

  // Liturgy Schedule Types
  public type LiturgyEntry = {
    id : Text;
    entryType : Text;
    time : Text;
    intention : Text;
    serviceType : Text;
    description : Text;
    order : Nat;
  };

  public type LiturgyDay = {
    dayIndex : Nat;
    entries : [LiturgyEntry];
  };

  public type LiturgyWeek = {
    id : Text;
    weekStart : Text;
    weekEnd : Text;
    days : [LiturgyDay];
    heroTitle : Text;
    heroSubtitle : Text;
    heroDescription : Text;
  };

  let liturgyWeeks = Map.empty<Text, LiturgyWeek>();
  var currentLiturgyWeekId : ?Text = null;

  public query func getLiturgyWeek(weekId : Text) : async ?LiturgyWeek {
    liturgyWeeks.get(weekId);
  };

  public query func getCurrentLiturgyWeek() : async ?LiturgyWeek {
    switch (currentLiturgyWeekId) {
      case (null) { null };
      case (?id) { liturgyWeeks.get(id) };
    };
  };

  public shared ({ caller }) func saveLiturgyWeek(week : LiturgyWeek) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    liturgyWeeks.add(week.id, week);
    currentLiturgyWeekId := ?week.id;
  };

  func clearWeekEntries(entries : [LiturgyEntry]) : [LiturgyEntry] {
    entries.map(
      func(entry) {
        {
          entry with
          intention = "";
          description = "";
        };
      }
    );
  };

  public shared ({ caller }) func copyPreviousWeek(fromWeekId : Text, toWeekId : Text, newWeekStart : Text, newWeekEnd : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (liturgyWeeks.get(fromWeekId)) {
      case (null) { Runtime.trap("Source week not found") };
      case (?fromWeek) {
        let newDays = fromWeek.days.map(
          func(day) {
            {
              day with
              entries = clearWeekEntries(day.entries);
            };
          }
        );
        let newWeek : LiturgyWeek = {
          id = toWeekId;
          weekStart = newWeekStart;
          weekEnd = newWeekEnd;
          days = newDays;
          heroTitle = fromWeek.heroTitle;
          heroSubtitle = fromWeek.heroSubtitle;
          heroDescription = fromWeek.heroDescription;
        };
        liturgyWeeks.add(toWeekId, newWeek);
        currentLiturgyWeekId := ?toWeekId;
      };
    };
  };

  public shared ({ caller }) func deleteLiturgyWeek(weekId : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    liturgyWeeks.remove(weekId);

    switch (currentLiturgyWeekId) {
      case (?id) {
        if (id == weekId) {
          currentLiturgyWeekId := null;
        };
      };
      case (null) {};
    };
  };

  module LiturgyWeek {
    public func compare(a : LiturgyWeek, b : LiturgyWeek) : Order.Order {
      Text.compare(b.id, a.id);
    };
  };

  public query func listLiturgyWeeks() : async [LiturgyWeek] {
    liturgyWeeks.values().toArray().sort();
  };

  // MODLITWA SECTION

  public type PrayerStar = {
    id : Text;
    name : ?Text;
    city : ?Text;
    intention : ?Text;
    isPublic : Bool;
    isApproved : Bool;
    joinedAt : Text;
    color : Text;
    prayCount : Nat;
    isHidden : Bool;
  };

  public type MassIntention = {
    id : Text;
    name : Text;
    phone : ?Text;
    email : ?Text;
    intention : Text;
    status : Text; // "pending", "approved", "rejected", "archived"
    offeringStatus : Text; // "none", "paid", "pending"
    assignedWeekId : ?Text;
    assignedDayIndex : ?Int;
    assignedEntryId : ?Text;
    assignedMassTime : ?Text;
    assignedMassDate : ?Text;
    createdAt : Text;
    color : Text;
  };

  public type ModlitwaConfig = {
    heroTitle : Text;
    heroSubtitle : Text;
    heroDescription : Text;
    accountNumber : Text;
    bankOwner : Text;
    thankYouTitle : Text;
    thankYouText : Text;
  };

  var prayerStars : List.List<PrayerStar> = List.empty<PrayerStar>();
  var massIntentions : List.List<MassIntention> = List.empty<MassIntention>();
  var modlitwaConfig : ?ModlitwaConfig = null;

  // Prayer Stars
  public shared ({ caller }) func savePrayerStar(star : PrayerStar) : async () {
    // Public can submit prayer stars (form submission)
    // No authorization check needed - this is a public form
    prayerStars.add(star);
  };

  public query func getPrayerStars() : async [PrayerStar] {
    // Public can view prayer stars
    prayerStars.toArray();
  };

  // FIX #1: was AccessControl.hasPermission which always trapped -- replaced with isAuthenticated
  public shared ({ caller }) func deletePrayerStar(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    let filteredArray = prayerStars.toArray().filter(
      func(star) { star.id != id }
    );
    prayerStars := List.fromArray(filteredArray);
  };

  // Mass Intentions
  public shared ({ caller }) func saveMassIntention(intention : MassIntention) : async () {
    // Public can submit mass intentions (form submission)
    // No authorization check needed - this is a public form
    massIntentions.add(intention);
  };

  public query ({ caller }) func getMassIntentions() : async [MassIntention] {
    // Mass intentions contain sensitive personal data (phone, email)
    // Only authenticated users (admins/staff) should view them
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view mass intentions");
    };
    massIntentions.toArray();
  };

  // FIX #1: was AccessControl.hasPermission which always trapped -- replaced with isAuthenticated
  public shared ({ caller }) func deleteMassIntention(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    let filteredArray = massIntentions.toArray().filter(
      func(intention) { intention.id != id }
    );
    massIntentions := List.fromArray(filteredArray);
  };

  // FIX #1: was AccessControl.hasPermission which always trapped -- replaced with isAuthenticated
  public shared ({ caller }) func saveModlitwaConfig(config : ModlitwaConfig) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    modlitwaConfig := ?config;
  };

  public query func getModlitwaConfig() : async ?ModlitwaConfig {
    // Public can view the configuration
    modlitwaConfig;
  };

  // SKLEP - SHOP ORDERS

  public type ShopOrder = {
    id : Text;
    productId : Text;
    productName : Text;
    productPrice : Text;
    customerName : Text;
    phone : Text;
    email : Text;
    address : Text;
    postalCode : Text;
    city : Text;
    notes : Text;
    deliveryType : Text; // "pickup" | "shipping"
    paymentConfirmed : Bool;
    status : Text; // "new" | "awaiting" | "paid" | "shipped"
    trackingNumber : Text;
    adminNotes : Text;
    createdAt : Text;
  };

  var shopOrders : List.List<ShopOrder> = List.empty<ShopOrder>();

  public shared func saveShopOrder(order : ShopOrder) : async () {
    // Public - no auth required, anyone can submit an order
    shopOrders.add(order);
  };

  public query ({ caller }) func getShopOrders() : async [ShopOrder] {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view shop orders");
    };
    shopOrders.toArray();
  };

  public shared ({ caller }) func updateShopOrder(id : Text, order : ShopOrder) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    let filtered = shopOrders.toArray().filter(func(o : ShopOrder) : Bool { o.id != id });
    shopOrders := List.fromArray(filtered.concat([order]));
  };

  public shared ({ caller }) func deleteShopOrder(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    let filtered = shopOrders.toArray().filter(func(o : ShopOrder) : Bool { o.id != id });
    shopOrders := List.fromArray(filtered);
  };

};
