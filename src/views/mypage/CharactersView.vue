<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Lock, Star } from 'lucide-vue-next'

const router = useRouter()

const characters = ref([
  { id: 1, name: '꿈돌이 베이직', emoji: '🌟', description: '대전의 마스코트 꿈돌이! 첫 번째 코스 완료로 획득했어요.', requiredStamps: 1, unlocked: true, acquiredDate: '2025.03.15' },
  { id: 2, name: '꿈돌이 탐험가', emoji: '🗺️', description: '3개 코스를 완료한 탐험가! 대전 구석구석을 누볐어요.', requiredStamps: 3, unlocked: true, acquiredDate: '2025.04.20' },
  { id: 3, name: '꿈돌이 미식가', emoji: '🍞', description: '음식 카테고리 장소를 5곳 이상 방문한 미식가!', requiredStamps: 5, unlocked: true, acquiredDate: '2025.05.10' },
  { id: 4, name: '꿈돌이 문화인', emoji: '🎭', description: '문화·역사 장소를 3곳 이상 방문한 문화인이 되세요.', requiredStamps: 8, unlocked: false, acquiredDate: null },
  { id: 5, name: '꿈돌이 자연인', emoji: '🌿', description: '자연 카테고리 장소를 3곳 이상 방문해 보세요.', requiredStamps: 10, unlocked: false, acquiredDate: null },
  { id: 6, name: '꿈돌이 대전왕', emoji: '👑', description: '10개 코스를 완료한 진정한 대전의 왕!', requiredStamps: 20, unlocked: false, acquiredDate: null },
])

const selectedChar = ref<typeof characters.value[0] | null>(null)
const myStamps = ref(7)
</script>

<template>
  <div style="background: linear-gradient(155deg, #E8F8F5 0%, #ffffff 50%, #f0faf8 100%); min-height: calc(100vh - 64px)">
    <div class="max-w-2xl mx-auto px-4 py-6">

      <!-- 헤더 -->
      <button @click="router.back()" class="flex items-center gap-2 mb-5 transition-opacity hover:opacity-70" style="color:#6b8c87;font-size:0.88rem;font-weight:600">
        <ArrowLeft :size="17" />
        마이페이지
      </button>

      <div class="flex items-center gap-3 mb-2">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
          <span style="font-size:0.85rem">🌟</span>
        </div>
        <h1 style="font-weight:800;font-size:1.2rem;color:#1a2e2b">꿈돌이 컬렉션</h1>
      </div>
      <p style="font-size:0.85rem;color:#6b8c87;margin-bottom:24px">대전을 탐험하며 꿈돌이 캐릭터를 수집해 보세요!</p>

      <!-- 스탬프 현황 -->
      <div class="rounded-2xl p-5 mb-6 flex items-center gap-4" style="background: linear-gradient(135deg, #E8F8F5, #f0faf8); border:1.5px solid rgba(178,228,220,0.4); box-shadow:0 2px 12px rgba(26,46,43,0.05)">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
          <Star :size="20" fill="#fff" color="#fff" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1.5">
            <span style="font-weight:700;font-size:0.95rem;color:#1a2e2b">누적 스탬프</span>
            <span style="font-weight:800;font-size:1rem;color:#3db89e">{{ myStamps }}개</span>
          </div>
          <div class="w-full h-2.5 rounded-full overflow-hidden" style="background:rgba(178,228,220,0.3)">
            <div
              class="h-full rounded-full transition-all"
              :style="`width:${Math.min((myStamps / 20) * 100, 100)}%;background: linear-gradient(90deg, #B2E4DC, #3db89e)`"
            />
          </div>
          <p style="font-size:0.75rem;color:#6b8c87;margin-top:4px">다음 꿈돌이까지 {{ 8 - myStamps > 0 ? 8 - myStamps : 0 }}개</p>
        </div>
      </div>

      <!-- 획득 현황 -->
      <div class="flex items-center justify-between mb-4">
        <span style="font-weight:700;font-size:0.9rem;color:#1a2e2b">
          획득한 꿈돌이 <span style="color:#3db89e">{{ characters.filter(c => c.unlocked).length }}</span> / {{ characters.length }}
        </span>
      </div>

      <!-- 캐릭터 그리드 -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          v-for="char in characters"
          :key="char.id"
          @click="selectedChar = char"
          class="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all text-center"
          :style="char.unlocked
            ? 'background:#fff;border:1.5px solid rgba(178,228,220,0.5);box-shadow:0 2px 12px rgba(26,46,43,0.06);'
            : 'background:#f8f8f8;border:1.5px solid rgba(220,220,220,0.5);'"
        >
          <!-- 이모지 / 잠금 -->
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl relative"
            :style="char.unlocked ? 'background: linear-gradient(135deg, #E8F8F5, #f0faf8)' : 'background:#f0f0f0;filter:grayscale(1)'"
          >
            {{ char.emoji }}
            <div v-if="!char.unlocked" class="absolute inset-0 flex items-center justify-center rounded-2xl" style="background:rgba(0,0,0,0.25)">
              <Lock :size="18" color="#fff" />
            </div>
          </div>
          <div class="w-full">
            <p :style="`font-weight:700;font-size:0.82rem;${char.unlocked ? 'color:#1a2e2b' : 'color:#9ca3af'}`">{{ char.name }}</p>
            <p v-if="char.unlocked" style="font-size:0.7rem;color:#3db89e;font-weight:600;margin-top:2px">획득 완료!</p>
            <p v-else style="font-size:0.7rem;color:#9ca3af;margin-top:2px">스탬프 {{ char.requiredStamps }}개 필요</p>
          </div>
        </button>
      </div>

    </div>

    <!-- 캐릭터 상세 모달 -->
    <Teleport to="body">
      <div
        v-if="selectedChar"
        class="fixed inset-0 flex items-center justify-center z-50 px-4"
        style="background:rgba(0,0,0,0.45)"
        @click.self="selectedChar = null"
      >
        <div class="rounded-3xl overflow-hidden w-full" style="max-width:340px;background:#fff;box-shadow:0 24px 80px rgba(26,46,43,0.15)">
          <!-- 이모지 배경 -->
          <div class="flex items-center justify-center py-8" :style="selectedChar.unlocked ? 'background: linear-gradient(135deg, #E8F8F5, #f0faf8)' : 'background:#f0f0f0'">
            <span class="text-7xl" :style="selectedChar.unlocked ? '' : 'filter:grayscale(1)'">{{ selectedChar.emoji }}</span>
          </div>
          <div class="p-6">
            <div class="flex items-center gap-2 mb-1">
              <h3 style="font-weight:800;font-size:1.05rem;color:#1a2e2b">{{ selectedChar.name }}</h3>
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                :style="selectedChar.unlocked ? 'background:#d1fae5;color:#065f46' : 'background:#f3f4f6;color:#9ca3af'"
              >{{ selectedChar.unlocked ? '획득 완료' : '미획득' }}</span>
            </div>
            <p style="font-size:0.88rem;color:#6b8c87;line-height:1.65;margin-bottom:16px">{{ selectedChar.description }}</p>
            <div class="flex items-center gap-2 mb-4 p-3 rounded-xl" style="background:#f0faf8">
              <Star :size="14" color="#3db89e" />
              <span style="font-size:0.82rem;font-weight:600;color:#1a2e2b">필요 스탬프</span>
              <span style="font-size:0.82rem;color:#3db89e;font-weight:700;margin-left:auto">{{ selectedChar.requiredStamps }}개</span>
            </div>
            <p v-if="selectedChar.acquiredDate" style="font-size:0.78rem;color:#9ca3af;text-align:center;margin-bottom:12px">{{ selectedChar.acquiredDate }} 획득</p>
            <button @click="selectedChar = null" class="w-full py-3 rounded-xl font-semibold text-sm" style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff">
              닫기
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
