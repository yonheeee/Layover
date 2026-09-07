import { useCourseStore } from "@/stores/course";
import { useAuthStore } from "@/stores/auth";
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
      beforeEnter: () => {
        const courseStore = useCourseStore()
        if (courseStore.generatedCourses.length === 0) {
          return { path: '/' }
        }
      }
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

router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem("accessToken");

  if (to.meta.requiresAuth && !token) {
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }

  if (token && to.path !== "/kakao-profile" && to.path !== "/login") {
    const auth = useAuthStore();
    await auth.ensureProfileState();
    if (auth.profileComplete === false) {
      next("/kakao-profile");
      return;
    }
  }

  if (token && to.path === "/kakao-profile") {
    const auth = useAuthStore();
    await auth.ensureProfileState();
    if (auth.profileComplete === true) {
      next("/");
      return;
    }
  }

  next();
});

export default router;
