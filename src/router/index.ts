import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

function requireAuth(_: any, __: any, next: Function) {
  const auth = useAuthStore();
  if (!auth.isLoggedIn) next("/login");
  else next();
}

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
    { path: "/map", component: () => import("@/views/map/MapView.vue") },
    {
      path: "/courses/result",
      component: () => import("@/views/course/CourseResultView.vue"),
    },
    {
      path: "/community",
      component: () => import("@/views/community/CommunityView.vue"),
    },
    {
      path: "/community/write",
      component: () => import("@/views/community/CommunityWriteView.vue"),
      beforeEnter: requireAuth,
    },
    {
      path: "/community/:id/edit",
      component: () => import("@/views/community/CommunityWriteView.vue"),
      beforeEnter: requireAuth,
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
    },
    {
      path: "/mypage",
      component: () => import("@/views/mypage/MypageView.vue"),
    },
    {
      path: "/mypage/characters",
      component: () => import("@/views/mypage/CharactersView.vue"),
    },
    {
      path: "/stamp-tour",
      component: () => import("@/views/stamp/StampTourView.vue"),
    },
    {
      path: "/kakao-profile",
      component: () => import("@/views/auth/KakaoProfileView.vue"),
    },
  ],
});

export default router;
