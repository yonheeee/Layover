import { computed, ref, watch, type Ref } from 'vue'
import { useStampStore } from '@/stores/stamp'
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

export function useXp(courseCount: Ref<number>, postCount: Ref<number>) {
  const stampStore = useStampStore()
  const bookmarkStore = useBookmarkStore()

  const levelUpModal = ref<{ level: number; name: string; emoji: string } | null>(null)

  const totalXp = computed(
    () =>
      stampStore.photos.length * XP_PER_STAMP +
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
