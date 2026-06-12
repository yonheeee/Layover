<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Heart, MessageCircle, MapPin, Clock, Footprints, Car, Send, Image as ImageIcon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const post = ref({
  id: Number(route.params.id),
  author: '홍길동',
  initials: '홍',
  date: '2025.06.02',
  title: '대전 환승 3시간 30분 완벽 코스 후기',
  content: `성심당에서 맛있는 빵을 먹고 테미오래에서 감성 사진도 찍고, 한밭수목원에서 산책까지! 3시간이 정말 알차게 느껴졌어요.

대전 환승하시는 분들 꼭 이 코스 추천드려요 :)

성심당은 오픈 직후에 가는 게 줄이 짧아요. 튀김소보로는 무조건 사야 하는 필수 아이템이고, 판타롱슈크림빵도 정말 맛있었어요. 빵을 산 후 테미오래로 이동했는데 택시로 10분 정도 걸렸어요.

테미오래는 생각보다 규모가 크고 포토존이 많아서 사진 찍기 좋았어요. 낡은 건물들이 예술 공간으로 재탄생해서 독특한 분위기였습니다.

마지막으로 한밭수목원은 무료입장이고 넓어서 산책하기 딱 좋았어요. 봄에는 꽃도 많이 피어서 더 아름다울 것 같아요.`,
  station: '대전역',
  duration: '3시간 30분',
  course: [
    { name: '성심당', category: '음식', transport: '도보', time: '5분' },
    { name: '테미오래', category: '문화', transport: '택시', time: '10분' },
    { name: '한밭수목원', category: '자연', transport: '도보', time: '15분' },
  ],
  images: ['', '', ''],
  likes: 24,
  liked: false,
  comments: [
    { id: 1, author: '여행러버', initials: '여', date: '2025.06.02', text: '저도 이 코스 가봤는데 정말 좋았어요! 성심당 빵은 언제 먹어도 맛있죠 ㅎㅎ' },
    { id: 2, author: '대전탐험가', initials: '대', date: '2025.06.03', text: '테미오래 포토존 어디가 제일 예뻤나요? 다음에 가려고요!' },
    { id: 3, author: '솔로여행자', initials: '솔', date: '2025.06.04', text: '한밭수목원 입장료 없는 거 맞나요? 몰랐어요!' },
  ],
})

const commentText = ref('')

function toggleLike() {
  post.value.liked = !post.value.liked
  post.value.likes += post.value.liked ? 1 : -1
}

function addComment() {
  if (!commentText.value.trim()) return
  post.value.comments.push({
    id: post.value.comments.length + 1,
    author: '나',
    initials: '나',
    date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', ''),
    text: commentText.value.trim(),
  })
  commentText.value = ''
}

const categoryColor: Record<string, string> = {
  '음식': 'background:#FEF3C7;color:#92400E',
  '카페': 'background:#E0E7FF;color:#3730A3',
  '자연': 'background:#D1FAE5;color:#065F46',
  '문화': 'background:#FCE7F3;color:#9D174D',
  '투어': 'background:#DBEAFE;color:#1E40AF',
}
</script>

<template>
  <div style="background: linear-gradient(155deg, #E8F8F5 0%, #ffffff 50%, #f0faf8 100%); min-height: calc(100vh - 64px)">
    <div class="max-w-2xl mx-auto px-4 py-6">

      <!-- 뒤로가기 -->
      <button @click="router.back()" class="flex items-center gap-2 mb-5 transition-opacity hover:opacity-70" style="color:#6b8c87;font-size:0.88rem;font-weight:600">
        <ArrowLeft :size="17" />
        목록으로
      </button>

      <!-- 본문 카드 -->
      <div class="rounded-2xl overflow-hidden mb-4" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 4px 24px rgba(26,46,43,0.08)">
        <!-- 작성자 정보 -->
        <div class="flex items-center gap-3 px-6 pt-5 pb-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold" style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff">
            {{ post.initials }}
          </div>
          <div>
            <p style="font-weight:700;font-size:0.92rem;color:#1a2e2b">{{ post.author }}</p>
            <p style="font-size:0.75rem;color:#9ca3af">{{ post.date }}</p>
          </div>
        </div>

        <!-- 제목 -->
        <h1 class="px-6 pb-4" style="font-weight:800;font-size:1.15rem;color:#1a2e2b;line-height:1.4">{{ post.title }}</h1>

        <!-- 코스 요약 -->
        <div class="mx-6 mb-4 p-4 rounded-xl" style="background:#f0faf8;border:1.5px solid rgba(178,228,220,0.4)">
          <div class="flex items-center gap-2 mb-3">
            <MapPin :size="13" color="#3db89e" />
            <span style="font-size:0.82rem;font-weight:600;color:#3db89e">{{ post.station }}</span>
            <span style="color:#B2E4DC;font-size:0.78rem">·</span>
            <Clock :size="13" color="#6b8c87" />
            <span style="font-size:0.82rem;color:#6b8c87">{{ post.duration }}</span>
          </div>
          <div v-for="(place, i) in post.course" :key="i">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff">
                {{ i + 1 }}
              </div>
              <span style="font-weight:600;font-size:0.88rem;color:#1a2e2b">{{ place.name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold" :style="categoryColor[place.category] || 'background:#f3f4f6;color:#374151'">{{ place.category }}</span>
            </div>
            <div v-if="i < post.course.length - 1" class="flex items-center gap-2 ml-3 my-1" style="padding-left:9px;border-left:1.5px dashed rgba(178,228,220,0.6)">
              <component :is="place.transport === '도보' ? Footprints : Car" :size="12" color="#9ca3af" />
              <span style="font-size:0.75rem;color:#9ca3af">{{ place.transport }} · {{ place.time }}</span>
            </div>
          </div>
        </div>

        <!-- 이미지 그리드 -->
        <div v-if="post.images.length > 0" class="grid gap-2 px-6 mb-4" :style="`grid-template-columns: repeat(${Math.min(post.images.length, 3)}, 1fr)`">
          <div
            v-for="(img, i) in post.images"
            :key="i"
            class="rounded-xl overflow-hidden flex items-center justify-center"
            style="aspect-ratio:1;background:#f0faf8;border:1.5px solid rgba(178,228,220,0.35)"
          >
            <img v-if="img" :src="img" class="w-full h-full object-cover" />
            <ImageIcon v-else :size="28" color="#B2E4DC" />
          </div>
        </div>

        <!-- 본문 -->
        <p class="px-6 pb-5" style="font-size:0.92rem;color:#374151;line-height:1.75;white-space:pre-line">{{ post.content }}</p>

        <!-- 액션 바 -->
        <div class="px-6 pb-5 flex items-center gap-4 border-t" style="border-color:rgba(178,228,220,0.3);padding-top:16px">
          <button @click="toggleLike" class="flex items-center gap-2 transition-colors" :style="post.liked ? 'color:#3db89e' : 'color:#9ca3af'">
            <Heart :size="16" :fill="post.liked ? '#3db89e' : 'none'" />
            <span style="font-size:0.85rem;font-weight:600">{{ post.likes }}</span>
          </button>
          <div class="flex items-center gap-2" style="color:#9ca3af">
            <MessageCircle :size="16" />
            <span style="font-size:0.85rem;font-weight:600">{{ post.comments.length }}</span>
          </div>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div class="rounded-2xl overflow-hidden" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
        <div class="px-6 py-4" style="border-bottom:1px solid rgba(178,228,220,0.3)">
          <span style="font-weight:700;font-size:0.95rem;color:#1a2e2b">댓글 {{ post.comments.length }}개</span>
        </div>

        <!-- 댓글 입력 -->
        <div class="px-6 py-4 flex gap-3 items-start" style="border-bottom:1px solid rgba(178,228,220,0.25)">
          <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff">나</div>
          <div class="flex-1 flex gap-2">
            <input
              v-model="commentText"
              placeholder="댓글을 입력해주세요..."
              @keydown.enter="addComment"
              style="flex:1;padding:10px 14px;border-radius:12px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.88rem;outline:none"
            />
            <button
              @click="addComment"
              :disabled="!commentText.trim()"
              class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity"
              :style="`background:linear-gradient(135deg,#B2E4DC,#3db89e);opacity:${commentText.trim() ? 1 : 0.5}`"
            >
              <Send :size="14" color="#fff" />
            </button>
          </div>
        </div>

        <!-- 댓글 목록 -->
        <div class="divide-y" style="border-color:rgba(178,228,220,0.2)">
          <div v-for="comment in post.comments" :key="comment.id" class="px-6 py-4 flex gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style="background: linear-gradient(135deg, #E8F8F5, #B2E4DC); color:#3db89e">
              {{ comment.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span style="font-weight:700;font-size:0.85rem;color:#1a2e2b">{{ comment.author }}</span>
                <span style="font-size:0.75rem;color:#9ca3af">{{ comment.date }}</span>
              </div>
              <p style="font-size:0.88rem;color:#374151;line-height:1.6">{{ comment.text }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
