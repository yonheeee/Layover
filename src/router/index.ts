import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/home/HomeView.vue') },
    { path: '/login', component: () => import('@/views/auth/LoginView.vue') },
    { path: '/signup', component: () => import('@/views/auth/SignupView.vue') },
    { path: '/find-id', component: () => import('@/views/find/FindIdView.vue') },
    { path: '/find-password', component: () => import('@/views/find/FindPasswordView.vue') },
    { path: '/map', component: () => import('@/views/map/MapView.vue') },
    { path: '/courses/result', component: () => import('@/views/course/CourseResultView.vue') },
    { path: '/community', component: () => import('@/views/community/CommunityView.vue') },
    { path: '/community/write', component: () => import('@/views/community/CommunityWriteView.vue') },
    { path: '/community/:id', component: () => import('@/views/community/CommunityDetailView.vue') },
    { path: '/places/:id', component: () => import('@/views/place/PlaceDetailView.vue') },
    { path: '/bookmarks', component: () => import('@/views/bookmark/BookmarkView.vue') },
    { path: '/mypage', component: () => import('@/views/mypage/MypageView.vue') },
    { path: '/mypage/characters', component: () => import('@/views/mypage/CharactersView.vue') },
  ],
})

export default router
