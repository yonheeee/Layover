import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("@/views/home/HomeView.vue") },
    { path: "/login", component: () => import("@/views/auth/LoginView.vue") },
    { path: "/signup", component: () => import("@/views/auth/SignupView.vue") },
    {
      path: "/find-id",
      component: () => import("@/views/find/FindIdView.vue"),
    },
    {
      path: "/find-password",
      component: () => import("@/views/find/FindPasswordView.vue"),
    },
    {
      path: "/map",
      component: () => import("@/views/map/MapView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/courses/result",
      component: () => import("@/views/course/CourseResultView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/community",
      component: () => import("@/views/community/CommunityView.vue"),
    },
    {
      path: "/community/write",
      component: () => import("@/views/community/CommunityWriteView.vue"),
      meta: { requiresAuth: true }, // ← 팀원 방식으로 통일
    },
    {
      path: "/community/:id/edit", // ← 우리가 추가한 라우트 유지
      component: () => import("@/views/community/CommunityWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/community/:id",
      component: () => import("@/views/community/CommunityDetailView.vue"),
    },
    {
      path: "/place",
      component: () => import("@/views/place/PlaceDetailView.vue"),
    },
    {
      path: "/bookmarks",
      component: () => import("@/views/bookmark/BookmarkView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/mypage",
      component: () => import("@/views/mypage/MypageView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/mypage/characters",
      component: () => import("@/views/mypage/CharactersView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/stamp-tour",
      component: () => import("@/views/stamp/StampTourView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/kakao-profile",
      component: () => import("@/views/auth/KakaoProfileView.vue"),
    },
  ],
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem("accessToken")) {
    next({ path: "/login", query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
