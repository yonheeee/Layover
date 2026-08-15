<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronRight,
  Clock,
  Heart,
  Loader2,
  MessageCircle,
  Route,
} from "lucide-vue-next";
import { getPopularCourseShares } from "@/api/community";
import type { Post } from "@/types/community";

const router = useRouter();
const posts = ref<Post[]>([]);
const isLoading = ref(false);

const hasPosts = computed(() => posts.value.length > 0);

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return "소요시간 미정";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

function formatTravelMode(mode?: string) {
  if (mode === "WALK") return "도보";
  if (mode === "TAXI") return "택시";
  return "이동";
}

function getCoursePlaces(post: Post) {
  return (post.courseSubTitle ?? "")
    .split(" → ")
    .map((place) => place.trim())
    .filter(Boolean);
}

function getSnippet(content?: string) {
  if (!content) return "";
  try {
    const blocks = JSON.parse(content);
    if (Array.isArray(blocks)) {
      return blocks
        .filter((block) => block?.type === "text" && block?.value)
        .map((block) => String(block.value).trim())
        .filter(Boolean)
        .join(" ")
        .slice(0, 90);
    }
  } catch {
    // Fall through to plain text cleanup.
  }
  return content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 90);
}

function openPost(id: string) {
  router.push(`/community/${id}`);
}

onMounted(async () => {
  isLoading.value = true;
  try {
    posts.value = await getPopularCourseShares(2);
  } catch {
    posts.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section v-if="isLoading || hasPosts" class="popular-courses">
    <div class="popular-courses__header">
      <div>
        <p class="popular-courses__eyebrow">인기 공유 코스</p>
        <h2>좋아요를 많이 받은 공유 코스</h2>
      </div>
      <RouterLink to="/community?category=공유해요" class="popular-courses__link">
        더보기
        <ChevronRight :size="16" />
      </RouterLink>
    </div>

    <div v-if="isLoading" class="popular-courses__loading">
      <Loader2 :size="20" class="popular-courses__spinner" />
    </div>

    <div v-else class="popular-courses__grid">
      <article
        v-for="post in posts"
        :key="post.id"
        class="popular-course-card"
        @click="openPost(post.id)"
      >
        <div class="popular-course-card__top">
          <div>
            <p class="popular-course-card__author">{{ post.username }}</p>
            <h3>{{ post.title }}</h3>
          </div>
          <div class="popular-course-card__likes">
            <Heart :size="14" fill="currentColor" />
            {{ post.likeCount }}
          </div>
        </div>

        <p v-if="getSnippet(post.content)" class="popular-course-card__snippet">
          {{ getSnippet(post.content) }}
        </p>

        <div class="popular-course-card__route">
          <Route :size="15" class="popular-course-card__route-icon" />
          <div class="popular-course-card__places">
            <template v-if="getCoursePlaces(post).length">
              <span v-for="place in getCoursePlaces(post)" :key="place">
                {{ place }}
              </span>
            </template>
            <span v-else>연결된 코스</span>
          </div>
        </div>

        <div class="popular-course-card__meta">
          <span>
            <Clock :size="14" />
            {{ formatDuration(post.courseDurationMinutes) }}
          </span>
          <span>{{ formatTravelMode(post.courseTravelMode) }}</span>
          <span>
            <MessageCircle :size="14" />
            {{ post.commentCount }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.popular-courses {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
}

.popular-courses__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.popular-courses__eyebrow {
  margin: 0 0 0.35rem;
  color: #16836f;
  font-size: 0.88rem;
  font-weight: 800;
}

.popular-courses h2 {
  margin: 0;
  color: #1b2b29;
  font-size: clamp(1.45rem, 2.4vw, 2rem);
  font-weight: 800;
}

.popular-courses__link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #16836f;
  font-size: 0.9rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.popular-courses__loading {
  display: grid;
  min-height: 180px;
  place-items: center;
  color: #16836f;
}

.popular-courses__spinner {
  animation: spin 0.8s linear infinite;
}

.popular-courses__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.popular-course-card {
  display: flex;
  min-height: 248px;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #d5e8e3;
  border-radius: 8px;
  background: #ffffff;
  padding: 1.25rem;
  box-shadow: 0 10px 28px rgba(27, 43, 41, 0.07);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.popular-course-card:hover {
  border-color: #79cbbb;
  box-shadow: 0 14px 34px rgba(27, 43, 41, 0.11);
  transform: translateY(-2px);
}

.popular-course-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.popular-course-card__author {
  margin: 0 0 0.35rem;
  color: #6b7f7a;
  font-size: 0.78rem;
  font-weight: 700;
}

.popular-course-card h3 {
  margin: 0;
  color: #1b2b29;
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.popular-course-card__likes {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.3rem;
  border-radius: 999px;
  background: #fff1f3;
  color: #d83f5b;
  font-size: 0.84rem;
  font-weight: 800;
  padding: 0.35rem 0.55rem;
}

.popular-course-card__snippet {
  margin: 0;
  color: #52645f;
  font-size: 0.92rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.popular-course-card__route {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  border-left: 2px solid #79cbbb;
  padding-left: 0.75rem;
}

.popular-course-card__route-icon {
  flex-shrink: 0;
  color: #16836f;
  margin-top: 0.12rem;
}

.popular-course-card__places {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.popular-course-card__places span {
  border-radius: 6px;
  background: #eef8f5;
  color: #265b51;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.28rem 0.48rem;
  overflow-wrap: anywhere;
}

.popular-course-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  color: #6b7f7a;
  font-size: 0.82rem;
  font-weight: 800;
}

.popular-course-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .popular-courses {
    padding: 0 1rem;
  }

  .popular-courses__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .popular-courses__grid {
    grid-template-columns: 1fr;
  }

  .popular-course-card {
    min-height: 0;
  }
}
</style>
