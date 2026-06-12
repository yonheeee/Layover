<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Camera, User, Activity, Award, ChevronRight, Star, Heart,
  MapPin, Clock, Coffee, Trees, Utensils, Eye, EyeOff,
  LogOut, AlertTriangle, Save, Lock
} from 'lucide-vue-next'

const router = useRouter()

type Tab = 'activity' | 'info' | 'gamification'
const activeTab = ref<Tab>('activity')

const user = ref({
  nickname: '홍길동',
  email: 'hong@example.com',
  level: 13,
  xp: 750,
  xpForNext: 1000,
  stampCount: 7,
})

const xpPercent = computed(() => Math.round((user.value.xp / user.value.xpForNext) * 100))

// --- 내 정보 탭 ---
const editName = ref(user.value.nickname)
const currentPw = ref('')
const newPw = ref('')
const newPwConfirm = ref('')
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const showNewPwC = ref(false)
const pwMatch = computed(() => newPw.value && newPwConfirm.value && newPw.value === newPwConfirm.value)
const pwMismatch = computed(() => newPwConfirm.value && newPw.value !== newPwConfirm.value)
const savingInfo = ref(false)
const savingPw = ref(false)
const showDeleteDialog = ref(false)

async function saveInfo() {
  savingInfo.value = true
  await new Promise(r => setTimeout(r, 800))
  user.value.nickname = editName.value
  savingInfo.value = false
}

async function changePw() {
  if (!pwMatch.value) return
  savingPw.value = true
  await new Promise(r => setTimeout(r, 800))
  currentPw.value = ''
  newPw.value = ''
  newPwConfirm.value = ''
  savingPw.value = false
}

// --- 활동 탭 ---
const journals = [
  { date: '12월 03일', icon: Coffee, title: '성심당 투어', count: 3, bg: '#FEF3C7', iconColor: '#D97706' },
  { date: '1월 21일', icon: Trees, title: '산책 코스', count: 2, bg: '#D1FAE5', iconColor: '#059669' },
  { date: '1월 08일', icon: Utensils, title: '시장 맛집', count: 4, bg: '#FCE7F3', iconColor: '#DB2777' },
]

const myCourses = [
  { id: 1, title: '성심당 → 한밭수목원', rating: 4.5, badge: '방문완료', badgeStyle: 'background:#D1FAE5;color:#065F46', placeCount: 2, duration: '3시간' },
  { id: 2, title: '중앙시장 → 지림미술관', rating: 4.0, badge: '분류미정', badgeStyle: 'background:#F3F4F6;color:#6B7280', placeCount: 2, duration: '2시간 30분' },
]

const likedPlaces = [
  { id: 1, name: '성심당', emoji: '🍞', category: '음식' },
  { id: 2, name: '한밭수목원', emoji: '🌿', category: '자연' },
  { id: 3, name: '중앙시장', emoji: '🏪', category: '음식' },
]

// --- 게이미피케이션 탭 ---
const characters = [
  { id: 1, name: '꿈돌이 베이직', emoji: '🌟', unlocked: true },
  { id: 2, name: '꿈돌이 탐험가', emoji: '🗺️', unlocked: true },
  { id: 3, name: '꿈돌이 미식가', emoji: '🍞', unlocked: true },
  { id: 4, name: '꿈돌이 문화인', emoji: '🎭', unlocked: false },
  { id: 5, name: '꿈돌이 자연인', emoji: '🌿', unlocked: false },
  { id: 6, name: '꿈돌이 대전왕', emoji: '👑', unlocked: false },
]

const showLogout = ref(false)

const sidebarTabs = [
  { key: 'activity', label: '활동', icon: Activity },
  { key: 'info', label: '기본정보', icon: User },
  { key: 'gamification', label: '게이미피케이션', icon: Award },
]

const inputBase = 'width:100%;padding:11px 14px;border-radius:12px;border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#1a2e2b;font-size:0.9rem;outline:none'
const labelBase = 'font-size:0.78rem;font-weight:700;color:#6b8c87;letter-spacing:0.03em'
</script>

<template>
  <div style="background: linear-gradient(155deg, #E8F8F5 0%, #ffffff 50%, #f0faf8 100%); min-height: calc(100vh - 64px)">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="flex gap-6 items-start">

        <!-- ===== 왼쪽 사이드바 (25%) ===== -->
        <aside class="w-64 flex-shrink-0 flex flex-col gap-4 sticky top-6">

          <!-- 프로필 카드 -->
          <div class="rounded-2xl overflow-hidden" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 4px 24px rgba(26,46,43,0.08)">
            <!-- 배경 그라디언트 -->
            <div class="h-14" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)" />

            <div class="px-5 pb-5">
              <!-- 아바타 -->
              <div class="relative -mt-8 mb-3 inline-block">
                <div class="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl" style="background:#fff;border:3px solid #fff;box-shadow:0 4px 16px rgba(26,46,43,0.15);color:#3db89e">
                  {{ user.nickname[0] }}
                </div>
                <button class="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
                  <Camera :size="9" color="#fff" />
                </button>
              </div>

              <p style="font-weight:800;font-size:1rem;color:#1a2e2b">{{ user.nickname }}</p>
              <p style="font-size:0.78rem;color:#9ca3af;margin-bottom:12px">{{ user.email }}</p>

              <!-- 레벨 배지 + XP -->
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full" style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff">
                  Lv.{{ user.level }}
                </span>
                <span style="font-size:0.78rem;color:#6b8c87;font-weight:600">{{ xpPercent }}%</span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden" style="background:rgba(178,228,220,0.3)">
                <div class="h-full rounded-full transition-all" :style="`width:${xpPercent}%;background: linear-gradient(90deg, #B2E4DC, #3db89e)`" />
              </div>
              <p style="font-size:0.72rem;color:#9ca3af;margin-top:4px">다음 레벨까지 {{ user.xpForNext - user.xp }} 포인트</p>
            </div>
          </div>

          <!-- 탭 메뉴 -->
          <div class="rounded-2xl overflow-hidden" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
            <button
              v-for="tab in sidebarTabs"
              :key="tab.key"
              @click="activeTab = tab.key as Tab"
              class="w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left"
              :style="activeTab === tab.key
                ? 'background: linear-gradient(90deg, #E8F8F5, #f0faf8); border-left:3px solid #3db89e'
                : 'border-left:3px solid transparent'"
              style="border-bottom:1px solid rgba(178,228,220,0.2)"
            >
              <component
                :is="tab.icon"
                :size="16"
                :color="activeTab === tab.key ? '#3db89e' : '#9ca3af'"
              />
              <span :style="`font-size:0.88rem;font-weight:${activeTab === tab.key ? 700 : 500};color:${activeTab === tab.key ? '#1a2e2b' : '#6b8c87'}`">
                {{ tab.label }}
              </span>
            </button>
          </div>

          <!-- 로그아웃 -->
          <button
            @click="showLogout = true"
            class="w-full flex items-center gap-2 px-4 py-3 rounded-2xl transition-opacity hover:opacity-70"
            style="background:#fff;border:1.5px solid rgba(220,180,180,0.4);color:#c0726b;font-size:0.85rem;font-weight:600"
          >
            <LogOut :size="15" />
            로그아웃
          </button>
        </aside>

        <!-- ===== 오른쪽 콘텐츠 (75%) ===== -->
        <main class="flex-1 min-w-0 flex flex-col gap-5">

          <!-- ── 활동 탭 ── -->
          <template v-if="activeTab === 'activity'">

            <!-- 여행 일지 -->
            <section class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
              <div class="flex items-center justify-between mb-4">
                <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b">내 여행 일지</h2>
                <button style="font-size:0.78rem;color:#3db89e;font-weight:600">자세히보기</button>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="j in journals"
                  :key="j.title"
                  class="rounded-2xl p-4 flex flex-col gap-2"
                  :style="`background:${j.bg};border:1.5px solid rgba(0,0,0,0.04)`"
                >
                  <p style="font-size:0.72rem;font-weight:600;color:#6b7280">{{ j.date }}</p>
                  <component :is="j.icon" :size="22" :color="j.iconColor" />
                  <p style="font-weight:700;font-size:0.88rem;color:#1a2e2b">{{ j.title }}</p>
                  <p style="font-size:0.75rem;color:#6b7280">{{ j.count }}코스 방문</p>
                </div>
              </div>
            </section>

            <!-- 내 코스 -->
            <section class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
              <div class="flex items-center justify-between mb-4">
                <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b">내 코스</h2>
                <button @click="router.push('/courses/result')" style="font-size:0.78rem;color:#3db89e;font-weight:600">더보기</button>
              </div>
              <div class="flex flex-col gap-2.5">
                <button
                  v-for="course in myCourses"
                  :key="course.id"
                  @click="router.push('/courses/result')"
                  class="flex items-center gap-3 p-4 rounded-xl text-left transition-colors hover:bg-gray-50"
                  style="border:1.5px solid rgba(178,228,220,0.35)"
                >
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#E8F8F5">
                    <MapPin :size="16" color="#3db89e" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p style="font-weight:700;font-size:0.9rem;color:#1a2e2b">{{ course.title }}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <div class="flex items-center gap-0.5">
                        <Star :size="12" fill="#fbbf24" color="#fbbf24" />
                        <span style="font-size:0.75rem;color:#6b7280">{{ course.rating }}</span>
                      </div>
                      <span class="text-xs px-2 py-0.5 rounded-full font-semibold" :style="course.badgeStyle">{{ course.badge }}</span>
                      <div class="flex items-center gap-1">
                        <Clock :size="12" color="#9ca3af" />
                        <span style="font-size:0.75rem;color:#9ca3af">{{ course.duration }}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight :size="15" color="#9ca3af" />
                </button>
              </div>
            </section>

            <!-- 찜한 장소 -->
            <section class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
              <div class="flex items-center justify-between mb-4">
                <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b">찜한 장소</h2>
                <button @click="router.push('/bookmarks')" style="font-size:0.78rem;color:#3db89e;font-weight:600">더보기</button>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="place in likedPlaces"
                  :key="place.id"
                  @click="router.push(`/places/${place.id}`)"
                  class="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md"
                  style="background:#f0faf8;border:1.5px solid rgba(178,228,220,0.4)"
                >
                  <span class="text-3xl">{{ place.emoji }}</span>
                  <p style="font-weight:600;font-size:0.82rem;color:#1a2e2b">{{ place.name }}</p>
                  <span class="text-xs px-2 py-0.5 rounded-full" style="background:#E8F8F5;color:#3db89e;font-weight:600">{{ place.category }}</span>
                </button>
              </div>
            </section>
          </template>

          <!-- ── 기본정보 탭 ── -->
          <template v-else-if="activeTab === 'info'">

            <!-- 내 정보 -->
            <section class="rounded-2xl p-6" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
              <div class="flex items-center gap-2 mb-5">
                <User :size="16" color="#3db89e" />
                <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b">내 정보</h2>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1.5">
                  <label :style="labelBase">이름</label>
                  <input v-model="editName" :style="inputBase" placeholder="이름을 입력해주세요" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label :style="labelBase">이메일 <span style="font-size:0.72rem;color:#9ca3af;font-weight:400">(수정 불가)</span></label>
                  <input :value="user.email" :style="`${inputBase};background:#f5f5f5;color:#9ca3af;cursor:not-allowed`" readonly />
                </div>
                <div class="flex justify-end">
                  <button
                    @click="saveInfo"
                    :disabled="savingInfo"
                    class="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
                    style="background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff; box-shadow:0 3px 10px rgba(61,184,158,0.25)"
                  >
                    <Save :size="14" />
                    {{ savingInfo ? '저장 중...' : '저장하기' }}
                  </button>
                </div>
              </div>
            </section>

            <!-- 비밀번호 변경 -->
            <section class="rounded-2xl p-6" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
              <div class="flex items-center gap-2 mb-5">
                <Lock :size="16" color="#3db89e" />
                <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b">비밀번호 변경</h2>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1.5">
                  <label :style="labelBase">현재 비밀번호</label>
                  <div class="relative">
                    <input v-model="currentPw" :type="showCurrentPw ? 'text' : 'password'" :style="`${inputBase};padding-right:42px`" placeholder="현재 비밀번호 입력" />
                    <button @click="showCurrentPw = !showCurrentPw" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9ca3af;display:flex">
                      <EyeOff v-if="showCurrentPw" :size="15" /><Eye v-else :size="15" />
                    </button>
                  </div>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label :style="labelBase">새 비밀번호</label>
                  <div class="relative">
                    <input v-model="newPw" :type="showNewPw ? 'text' : 'password'" :style="`${inputBase};padding-right:42px`" placeholder="영문+숫자 8자 이상" />
                    <button @click="showNewPw = !showNewPw" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9ca3af;display:flex">
                      <EyeOff v-if="showNewPw" :size="15" /><Eye v-else :size="15" />
                    </button>
                  </div>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label :style="labelBase">새 비밀번호 확인</label>
                  <div class="relative">
                    <input
                      v-model="newPwConfirm"
                      :type="showNewPwC ? 'text' : 'password'"
                      :style="`${inputBase};padding-right:42px;border-color:${pwMismatch ? 'rgba(224,112,112,0.5)' : pwMatch ? 'rgba(61,184,158,0.6)' : 'rgba(178,228,220,0.5)'}`"
                      placeholder="새 비밀번호 재입력"
                    />
                    <button @click="showNewPwC = !showNewPwC" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9ca3af;display:flex">
                      <EyeOff v-if="showNewPwC" :size="15" /><Eye v-else :size="15" />
                    </button>
                  </div>
                  <p v-if="pwMismatch" style="font-size:0.75rem;color:#e07070">비밀번호가 일치하지 않습니다.</p>
                  <p v-if="pwMatch" style="font-size:0.75rem;color:#3db89e">비밀번호가 일치합니다.</p>
                </div>
                <div class="flex justify-end">
                  <button
                    @click="changePw"
                    :disabled="!pwMatch || savingPw"
                    class="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity"
                    :style="`background: linear-gradient(135deg, #B2E4DC, #3db89e); color:#fff; box-shadow:0 3px 10px rgba(61,184,158,0.25); opacity:${pwMatch && !savingPw ? 1 : 0.5}`"
                  >
                    <Lock :size="14" />
                    {{ savingPw ? '변경 중...' : '변경하기' }}
                  </button>
                </div>
              </div>
            </section>

            <!-- 회원 탈퇴 -->
            <section class="rounded-2xl p-6" style="background:#fff;border:1.5px solid rgba(220,220,220,0.4);box-shadow:0 2px 12px rgba(26,46,43,0.04)">
              <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b;margin-bottom:8px">회원 탈퇴</h2>
              <p style="font-size:0.85rem;color:#9ca3af;line-height:1.65;margin-bottom:12px">
                탈퇴 시 모든 여행 기록과 코스 데이터가 삭제되며 복구할 수 없습니다.
              </p>
              <button
                @click="showDeleteDialog = true"
                style="font-size:0.82rem;color:#9ca3af;font-weight:600;background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:2px"
              >
                회원 탈퇴
              </button>
            </section>
          </template>

          <!-- ── 게이미피케이션 탭 ── -->
          <template v-else>
            <!-- 스탬프 현황 -->
            <section class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
              <div class="flex items-center gap-2 mb-4">
                <Award :size="16" color="#3db89e" />
                <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b">스탬프 현황</h2>
              </div>
              <div class="flex items-center gap-4 p-4 rounded-xl" style="background:#f0faf8;border:1.5px solid rgba(178,228,220,0.4)">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl" style="background: linear-gradient(135deg, #B2E4DC, #3db89e)">
                  🌟
                </div>
                <div class="flex-1">
                  <div class="flex justify-between mb-1.5">
                    <span style="font-weight:700;font-size:0.9rem;color:#1a2e2b">누적 스탬프 {{ user.stampCount }}개</span>
                    <span style="font-size:0.78rem;color:#6b8c87">다음 꿈돌이까지 {{ 10 - user.stampCount }}개</span>
                  </div>
                  <div class="w-full h-2.5 rounded-full overflow-hidden" style="background:rgba(178,228,220,0.3)">
                    <div class="h-full rounded-full" :style="`width:${(user.stampCount / 10) * 100}%;background: linear-gradient(90deg, #B2E4DC, #3db89e)`" />
                  </div>
                </div>
              </div>
            </section>

            <!-- 꿈돌이 컬렉션 미리보기 -->
            <section class="rounded-2xl p-5" style="background:#fff;border:1.5px solid rgba(178,228,220,0.35);box-shadow:0 2px 12px rgba(26,46,43,0.05)">
              <div class="flex items-center justify-between mb-4">
                <h2 style="font-weight:700;font-size:0.95rem;color:#1a2e2b">꿈돌이 컬렉션</h2>
                <button @click="router.push('/mypage/characters')" style="font-size:0.78rem;color:#3db89e;font-weight:600">전체보기</button>
              </div>
              <div class="grid grid-cols-3 gap-2.5">
                <div
                  v-for="char in characters"
                  :key="char.id"
                  class="rounded-2xl p-3 flex flex-col items-center gap-1.5"
                  :style="char.unlocked
                    ? 'background: linear-gradient(135deg, #E8F8F5, #f0faf8);border:1.5px solid rgba(178,228,220,0.5)'
                    : 'background:#f5f5f5;border:1.5px solid rgba(220,220,220,0.5)'"
                >
                  <span class="text-2xl" :style="char.unlocked ? '' : 'filter:grayscale(1);opacity:0.4'">{{ char.emoji }}</span>
                  <p :style="`font-size:0.72rem;font-weight:600;${char.unlocked ? 'color:#1a2e2b' : 'color:#9ca3af'};text-align:center`">{{ char.name }}</p>
                  <span v-if="char.unlocked" class="text-xs px-1.5 py-0.5 rounded-full" style="background:#d1fae5;color:#065f46;font-weight:600;font-size:0.65rem">획득</span>
                  <span v-else class="text-xs px-1.5 py-0.5 rounded-full" style="background:#f3f4f6;color:#9ca3af;font-size:0.65rem">잠김</span>
                </div>
              </div>
            </section>
          </template>

        </main>
      </div>
    </div>

    <!-- 로그아웃 다이얼로그 -->
    <Teleport to="body">
      <div v-if="showLogout" class="fixed inset-0 flex items-center justify-center z-50 px-4" style="background:rgba(0,0,0,0.45)" @click.self="showLogout = false">
        <div class="rounded-2xl p-6 flex flex-col gap-4 w-full" style="max-width:320px;background:#fff;box-shadow:0 24px 80px rgba(26,46,43,0.15)">
          <p style="font-weight:700;font-size:1rem;color:#1a2e2b">로그아웃 하시겠어요?</p>
          <div class="flex gap-3">
            <button @click="showLogout = false" class="flex-1 py-3 rounded-xl font-semibold text-sm" style="border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#6b8c87">취소</button>
            <button @click="router.push('/login'); showLogout = false" class="flex-1 py-3 rounded-xl font-bold text-sm" style="background:#e07070;color:#fff">로그아웃</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 회원 탈퇴 확인 -->
    <Teleport to="body">
      <div v-if="showDeleteDialog" class="fixed inset-0 flex items-center justify-center z-50 px-4" style="background:rgba(0,0,0,0.45)" @click.self="showDeleteDialog = false">
        <div class="rounded-2xl p-6 flex flex-col gap-4 w-full" style="max-width:360px;background:#fff;box-shadow:0 24px 80px rgba(26,46,43,0.15)">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#fee2e2">
              <AlertTriangle :size="16" color="#e07070" />
            </div>
            <p style="font-weight:700;font-size:1rem;color:#1a2e2b">정말 탈퇴하시겠어요?</p>
          </div>
          <p style="font-size:0.88rem;color:#6b8c87;line-height:1.65">모든 여행 기록, 코스, 꿈돌이 컬렉션 데이터가 영구 삭제됩니다.</p>
          <div class="flex gap-3">
            <button @click="showDeleteDialog = false" class="flex-1 py-3 rounded-xl font-semibold text-sm" style="border:1.5px solid rgba(178,228,220,0.5);background:#f0faf8;color:#6b8c87">취소</button>
            <button @click="router.push('/login'); showDeleteDialog = false" class="flex-1 py-3 rounded-xl font-bold text-sm" style="background:#9ca3af;color:#fff">탈퇴하기</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
