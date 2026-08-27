import { computed, ref, watch, type Ref } from 'vue'
import { useBookmarkStore } from '@/stores/bookmark'

export const XP_PER_STAMP = 100
export const XP_PER_COURSE = 200
export const XP_PER_POST = 50
export const XP_PER_BOOKMARK = 10

export const XP_LEVELS = [
  { level: 1, name: '대전 입문자', emoji: '🌱', minXp: 0 },
  { level: 2, name: '대전 나그네', emoji: '👟', minXp: 300 },
  { level: 3, name: '대전 탐험가', emoji: '🗺️', minXp: 700 },
  { level: 4, name: '대전 마스터', emoji: '🏆', minXp: 1500 },
  { level: 5, name: '꿈씨 컬렉터', emoji: '👑', minXp: 3000 },
]

const STORAGE_KEY = 'layover_celebrated_levels'

function getCelebratedLevels(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

function markLevelCelebrated(level: number) {
  const set = getCelebratedLevels()
  set.add(level)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

/**
 * 경험치와 레벨.
 *
 * 세 수치는 모두 서버 값이어야 한다. 예전에는 stampCount 가 선택 인자여서
 * 넘기지 않은 화면이 localStorage 의 엽서 개수로 폴백했고, 그래서 같은 계정인데
 * 스탬프 투어 헤더와 마이페이지의 레벨이 서로 달랐다. 다시 그러지 않도록
 * 필수 인자로 둔다. 화면에 수치가 없다면 `useXpSources()` 로 받아 오면 된다.
 *
 * @param stampCount 서버 기준 누적 인증 횟수 (`user.stampCount`)
 */
export function useXp(courseCount: Ref<number>, postCount: Ref<number>, stampCount: Ref<number>) {
  const bookmarkStore = useBookmarkStore()

  const levelUpModal = ref<{ level: number; name: string; emoji: string } | null>(null)

  const totalXp = computed(
    () =>
      stampCount.value * XP_PER_STAMP +
      courseCount.value * XP_PER_COURSE +
      postCount.value * XP_PER_POST +
      bookmarkStore.bookmarkedPlaces.length * XP_PER_BOOKMARK,
  )

  const currentLevel = computed(() => {
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
      if (totalXp.value >= XP_LEVELS[i].minXp) return XP_LEVELS[i]
    }
    return XP_LEVELS[0]
  })

  const nextLevel = computed(() => XP_LEVELS.find((l) => l.minXp > totalXp.value) ?? null)

  const xpProgress = computed(() => {
    if (!nextLevel.value) return 100
    const cur = currentLevel.value.minXp
    const nxt = nextLevel.value.minXp
    return Math.round(((totalXp.value - cur) / (nxt - cur)) * 100)
  })

  // Lv.1은 기본 레벨이라 축하 안 함
  watch(currentLevel, (newLv, oldLv) => {
    if (!oldLv || newLv.level <= 1 || newLv.level <= oldLv.level) return
    const celebrated = getCelebratedLevels()
    if (!celebrated.has(newLv.level)) {
      markLevelCelebrated(newLv.level)
      levelUpModal.value = { ...newLv }
    }
  })

  return { totalXp, currentLevel, nextLevel, xpProgress, levelUpModal }
}
