import Map "mo:core/Map";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
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

  // Authorization System
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to check if user has editor or admin role
  func canEditContent(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (appRoles.get(caller)) {
      case (?#editor) { true };
      case (?#admin) { true };
      case (_) { false };
    };
  };

  // Helper function to check if user can manage gallery
  func canManageGallery(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (appRoles.get(caller)) {
      case (?#editor) { true };
      case (?#photographer) { true };
      case (?#admin) { true };
      case (_) { false };
    };
  };

  // Helper function to check if user is moderator or admin
  func canModerate(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (appRoles.get(caller)) {
      case (?#moderator) { true };
      case (?#admin) { true };
      case (_) { false };
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Site Settings
  public shared ({ caller }) func updateSiteSettings(settings : SiteSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update site settings");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can update content blocks");
    };
    let block : ContentBlock = {
      id = key;
      content = content;
    };
    contentBlocks.add(key, block);
  };

  // News CRUD
  public shared ({ caller }) func createNewsArticle(article : NewsArticle) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can create news articles");
    };
    newsArticles.add(article.id, article);
  };

  public shared ({ caller }) func updateNewsArticle(id : Text, article : NewsArticle) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can update news articles");
    };
    switch (newsArticles.get(id)) {
      case (null) { Runtime.trap("News article not found") };
      case (?_) { newsArticles.add(id, article) };
    };
  };

  public shared ({ caller }) func deleteNewsArticle(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can delete news articles");
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
    // Authenticated users with editor/admin role can see all news (including unpublished)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can view all news");
    };
    let all = newsArticles.values().toArray();
    all.sort();
  };

  // Event CRUD
  public shared ({ caller }) func createEvent(event : Event) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can create events");
    };
    events.add(event.id, event);
  };

  public shared ({ caller }) func updateEvent(id : Text, event : Event) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can update events");
    };
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?_) { events.add(id, event) };
    };
  };

  public shared ({ caller }) func deleteEvent(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can delete events");
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
    // Authenticated users with editor/admin role can see all events (including unpublished)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canEditContent(caller)) {
      Runtime.trap("Unauthorized: Only editors and admins can view all events");
    };
    events.values().toArray();
  };

  // Gallery Albums
  public shared ({ caller }) func createGalleryAlbum(album : GalleryAlbum) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canManageGallery(caller)) {
      Runtime.trap("Unauthorized: Only editors, photographers, and admins can create albums");
    };
    galleryAlbums.add(album.id, album);
  };

  public shared ({ caller }) func updateGalleryAlbum(id : Text, album : GalleryAlbum) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canManageGallery(caller)) {
      Runtime.trap("Unauthorized: Only editors, photographers, and admins can update albums");
    };
    switch (galleryAlbums.get(id)) {
      case (null) { Runtime.trap("Album not found") };
      case (?_) { galleryAlbums.add(id, album) };
    };
  };

  public shared ({ caller }) func deleteGalleryAlbum(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canManageGallery(caller)) {
      Runtime.trap("Unauthorized: Only editors, photographers, and admins can delete albums");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canManageGallery(caller)) {
      Runtime.trap("Unauthorized: Only editors, photographers, and admins can add photos");
    };

    switch (galleryAlbums.get(albumId)) {
      case (null) { Runtime.trap("Album not found") };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not canManageGallery(caller)) {
      Runtime.trap("Unauthorized: Only editors, photographers, and admins can remove photos");
    };

    switch (galleryAlbums.get(albumId)) {
      case (null) { Runtime.trap("Album not found") };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update home sections");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };
    
    // Ensure the user is at least a registered user in the access control system
    if (not (AccessControl.hasPermission(accessControlState, user, #user))) {
      Runtime.trap("User must be registered before assigning application role");
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
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own role");
    };
    appRoles.get(user);
  };

  public query ({ caller }) func listAllRoles() : async [(Principal, AppUserRole)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all roles");
    };
    appRoles.entries().toArray();
  };
};
