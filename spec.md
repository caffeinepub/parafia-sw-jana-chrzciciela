# Parafia sw Jana Chrzciciela

## Current State

Parish website with backend using Caffeine's AccessControl mixin for authorization. The problem is that `_initializeAccessControlWithSecret("")` is called with an empty token, so the AccessControl system treats authenticated users as guests. All write operations and authenticated reads fail with "Unauthorized" because the backend checks `AccessControl.hasPermission(accessControlState, caller, #user)` and `AccessControl.hasPermission(accessControlState, caller, #admin)` which both fail without a valid token.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend authorization logic: replace all AccessControl permission checks with simple `Principal.isAnonymous(caller)` checks. Any non-anonymous Principal = full access. Anonymous = read-only public access.
- All write operations check: if caller is anonymous → trap. If authenticated → allow.
- `getAllEvents`, `getAllNews` for anonymous callers should return only published items (not trap).
- `getCallerUserProfile`, `getUserProfile`, `getAppRole` for anonymous callers should return null (not trap).

### Remove
- AccessControl-based permission checks from all content operations

## Implementation Plan

1. Regenerate backend with simplified auth: `isAuthenticated(caller) = not Principal.isAnonymous(caller)`
2. All CRUD operations (news, events, gallery, content blocks, home sections, site settings): require isAuthenticated
3. Public read operations (getPublicNews, getPublicEvents, getSiteSettings, getHomeSections, getGalleryAlbums, etc.): no auth required
4. getAllNews / getAllEvents: if authenticated return all, if anonymous return only published
5. Profile and role queries: return null for anonymous instead of trapping
6. Keep blob-storage and authorization mixins included (required by platform)
