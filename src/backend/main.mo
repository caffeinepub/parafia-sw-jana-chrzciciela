import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type GalleryPhoto = {
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

  type GalleryAlbum = {
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

  type NewsArticle = {
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

  let newsArticles = Map.empty<Text, NewsArticle>();

  type Event = {
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

  let events = Map.empty<Text, Event>();
  let galleryAlbums = Map.empty<Text, GalleryAlbum>();

  type HomeSection = {
    id : Text;
    sectionType : Text;
    enabled : Bool;
    order : Nat;
    customTitle : Text;
    customContent : Text;
  };

  type SiteSettings = {
    aestheticMode : Text;
    contactData : Text;
    typography : Text;
    navigation : Text;
  };

  type ContentBlock = {
    id : Text;
    content : Text;
  };

  type AppUserRole = {
    #admin;
    #editor;
    #moderator;
    #photographer;
  };

  type UserProfile = {
    name : Text;
    role : ?AppUserRole;
  };

  var homeSections : List.List<HomeSection> = List.empty<HomeSection>();

  let appRoles = Map.empty<Principal, AppUserRole>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let contentBlocks = Map.empty<Text, ContentBlock>();
  var siteSettings : ?SiteSettings = null;

  include MixinStorage();

  // Authorization System - kept for platform compatibility
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Check if caller is authenticated (not anonymous principal)
  // This is the ONLY authorization check used for content operations
  func isAuthenticated(caller : Principal) : Bool {
    not caller.isAnonymous();
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) { return null };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Return null for anonymous callers
    if (caller.isAnonymous()) { return null };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    userProfiles.add(caller, profile);
  };

  // Site Settings
  public shared ({ caller }) func updateSiteSettings(settings : SiteSettings) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    siteSettings := ?settings;
  };

  public query func getSiteSettings() : async ?SiteSettings {
    // Public read access
    siteSettings;
  };

  // Content Blocks
  public query func getContentBlock(key : Text) : async ?ContentBlock {
    // Public read access
    contentBlocks.get(key);
  };

  public query func getAllContentBlocks() : async [ContentBlock] {
    // Public read access
    contentBlocks.values().toArray();
  };

  public shared ({ caller }) func updateContentBlock(key : Text, content : Text) : async () {
    // Must be authenticated user
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    let block : ContentBlock = {
      id = key;
      content = content;
    };
    contentBlocks.add(key, block);
  };

  // News CRUD
  public shared ({ caller }) func createNewsArticle(article : NewsArticle) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    newsArticles.add(article.id, article);
  };

  public shared ({ caller }) func updateNewsArticle(id : Text, article : NewsArticle) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    switch (newsArticles.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?_) { newsArticles.add(id, article) };
    };
  };

  public shared ({ caller }) func deleteNewsArticle(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    newsArticles.remove(id);
  };

  public query func getNewsArticle(id : Text) : async ?NewsArticle {
    // Public read access for individual articles
    newsArticles.get(id);
  };

  public query func getPublicNews() : async [NewsArticle] {
    // Public read access for published content
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

  // Event CRUD
  public shared ({ caller }) func createEvent(event : Event) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    events.add(event.id, event);
  };

  public shared ({ caller }) func updateEvent(id : Text, event : Event) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    switch (events.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?_) { events.add(id, event) };
    };
  };

  public shared ({ caller }) func deleteEvent(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    events.remove(id);
  };

  public query func getEvent(id : Text) : async ?Event {
    // Public read access for individual events
    events.get(id);
  };

  public query func getPublicEvents() : async [Event] {
    // Public read access for published content
    events.values().toArray().filter(func(event : Event) : Bool { event.published });
  };

  public query ({ caller }) func getAllEvents() : async [Event] {
    if (not isAuthenticated(caller)) {
      return events.values().toArray().filter(func(event : Event) : Bool { event.published });
    };
    events.values().toArray();
  };

  // Gallery Albums
  public shared ({ caller }) func createGalleryAlbum(album : GalleryAlbum) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    galleryAlbums.add(album.id, album);
  };

  public shared ({ caller }) func updateGalleryAlbum(id : Text, album : GalleryAlbum) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    switch (galleryAlbums.get(id)) {
      case (null) { Runtime.trap("Not found") };
      case (?_) { galleryAlbums.add(id, album) };
    };
  };

  public shared ({ caller }) func deleteGalleryAlbum(id : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    galleryAlbums.remove(id);
  };

  public query func getGalleryAlbum(id : Text) : async ?GalleryAlbum {
    // Public read access
    galleryAlbums.get(id);
  };

  public query func getGalleryAlbums() : async [GalleryAlbum] {
    // Public read access
    let albums = galleryAlbums.values().toArray();
    albums.sort();
  };

  // Gallery Photos
  public shared ({ caller }) func addPhoto(albumId : Text, photo : GalleryPhoto) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
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
      Runtime.trap("Authentication required");
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
    // Public read access
    switch (galleryAlbums.get(albumId)) {
      case (null) { [] };
      case (?album) { album.photos };
    };
  };

  // Home Page Sections
  public shared ({ caller }) func updateHomeSections(sections : [HomeSection]) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    homeSections := List.fromArray(sections);
  };

  public query func getHomeSections() : async [HomeSection] {
    // Public read access
    let sectionsArray = homeSections.toArray();
    sectionsArray.sort(func(a : HomeSection, b : HomeSection) : Order.Order {
      Nat.compare(a.order, b.order);
    });
  };

  // Role Management
  public shared ({ caller }) func assignAppRole(user : Principal, role : AppUserRole) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    appRoles.add(user, role);
    // Update user profile with role
    switch (userProfiles.get(user)) {
      case (?profile) {
        let updatedProfile = {
          profile with
          role = ?role;
        };
        userProfiles.add(user, updatedProfile);
      };
      case (null) {
        // Create basic profile with role
        let newProfile : UserProfile = {
          name = "";
          role = ?role;
        };
        userProfiles.add(user, newProfile);
      };
    };
  };

  public query ({ caller }) func getAppRole(user : Principal) : async ?AppUserRole {
    if (caller.isAnonymous()) { return null };
    appRoles.get(user);
  };

  public query ({ caller }) func listAllRoles() : async [(Principal, AppUserRole)] {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Authentication required");
    };
    appRoles.entries().toArray();
  };
};
