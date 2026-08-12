# Responsive Progress

## 2026-08-12

- Created `schema_2026_0812.sql` from `schema_20260811.sql` with `posts.course_id` and `inquiries.attachment_urls`.
- Started responsive web cleanup phase.
- Phase 1 updated shared/mobile-critical screens:
  - `AppHeader.vue`: desktop top navigation remains, mobile navigation moved to fixed bottom bar.
  - `App.vue`: mobile bottom padding added so content is not hidden behind bottom navigation.
  - Home components: existing media queries replaced with 1024/767/640/420 breakpoints.
  - `MapView.vue` and `CourseResultView.vue`: fixed side-panel layout switches to vertical mobile layout.
  - `StampTourView.vue`: full-screen height calculation adjusted for mobile bottom navigation.
- Color tokens and existing brand colors were not changed.
- Verification:
  - `node node_modules\vite\bin\vite.js build --emptyOutDir false` succeeded.
  - Default `npm.cmd run build` still exits during Vite's `emptyOutDir` phase without an error message; bundling succeeds when `dist` cleanup is skipped.

## Phase 2

- Updated secondary responsive screens:
  - `MypageView.vue` / `mypage.css`: sidebar switches to a mobile horizontal tab layout, fixed grids and modal widths now adapt on mobile.
  - `CommunityView.vue` / `community.css`: mobile horizontal category navigation added for notices, FAQ/inquiries, and community categories.
  - `PlaceDetailView.vue` / `place.css`: toolbar, filter menu, hero height, card grid, and detail modal now use mobile-safe sizing.
  - `BookmarkView.vue` / `bookmark.css`: bookmark grid collapses cleanly to one column on small screens.
  - Auth and find pages: root layouts now account for the mobile bottom navigation height.
- Verification:
  - `node node_modules\vite\bin\vite.js build --emptyOutDir false` succeeded.
