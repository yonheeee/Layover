<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { MapPin, X } from "lucide-vue-next";
import { getMyCharacters, type OwnedCharacter } from "@/api/characters";
import SilentImage from "@/components/common/SilentImage.vue";
import {
  TOTAL_CHARACTER_COUNT,
  catalogGroups,
  characterCatalog,
  isSceneArt,
  resolveCharMeta,
  type CatalogCharacter,
} from "@/data/characterCatalog";

/**
 * 꿈씨 도감.
 *
 * 전체 목록(147종)은 `collection/` 폴더에서 유도한 프론트 카탈로그가 갖고 있고,
 * 서버에는 "이 유저가 무엇을 몇 장 가졌는지"만 물어본다. 미획득은 검정 실루엣으로
 * 항상 자리를 차지한다.
 *
 * 도감 전용 화면(`/mypage/characters`)과 마이페이지 스탬프 탭이 같은 컴포넌트를
 * 쓴다. 마이페이지에서는 `preview` 로 몇 줄만 보여주고 전체는 전용 화면으로 넘긴다.
 */
const props = withDefaults(
  defineProps<{
    /** 마이페이지에 얹는 축약형. 탭을 숨기고 앞쪽 몇 칸만 보여준다. */
    preview?: boolean;
    previewCount?: number;
  }>(),
  { preview: false, previewCount: 12 },
);

/** 화면 제목 옆에 "N/147" 을 붙일 수 있도록 수집 현황을 올려 보낸다. */
const emit = defineEmits<{
  progress: [{ obtained: number; total: number }];
}>();

/** code → 보유 정보 */
const owned = ref<Map<string, OwnedCharacter>>(new Map());
const isLoading = ref(true);
const loadFailed = ref(false);

const activeTab = ref<string>("all");
const selected = ref<CatalogCharacter | null>(null);

/**
 * 이미지가 뜨거나 실패해서 더 기다릴 필요가 없어진 카드.
 *
 * 원본이 147장 17MB라 lazy 로딩이 걸려 있고 스크롤에 따라 뒤늦게 채워진다.
 * 그 사이 빈 칸만 보이면 고장처럼 보여서 '로딩중...'을 대신 띄운다.
 * 실패한 칸도 여기 들어가므로 문구가 계속 남지는 않는다.
 */
const settledCodes = ref(new Set<string>());
const modalImageSettled = ref(false);

const obtainedCount = computed(
  () => characterCatalog.filter((c) => owned.value.has(c.code)).length,
);

watch(
  obtainedCount,
  (obtained) => emit("progress", { obtained, total: TOTAL_CHARACTER_COUNT }),
  { immediate: true },
);

const tabs = computed(() => [
  {
    key: "all",
    label: "전체",
    total: TOTAL_CHARACTER_COUNT,
    got: obtainedCount.value,
  },
  ...catalogGroups.map((group) => ({
    key: group.key,
    label: group.label,
    total: group.items.length,
    got: group.items.filter((c) => owned.value.has(c.code)).length,
  })),
]);

/** 축약형은 획득한 것부터, 최근에 만난 순으로 보여주고 남는 칸을 실루엣으로 채운다. */
const previewCharacters = computed(() => {
  const obtainedFirst = characterCatalog
    .filter((c) => owned.value.has(c.code))
    .sort((a, b) =>
      String(owned.value.get(b.code)?.firstObtainedAt ?? "").localeCompare(
        String(owned.value.get(a.code)?.firstObtainedAt ?? ""),
      ),
    );
  const locked = characterCatalog.filter((c) => !owned.value.has(c.code));
  return [...obtainedFirst, ...locked].slice(0, props.previewCount);
});

const visibleCharacters = computed(() => {
  if (props.preview) return previewCharacters.value;
  if (activeTab.value === "all") return characterCatalog;
  return catalogGroups.find((g) => g.key === activeTab.value)?.items ?? [];
});

function ownedOf(code: string) {
  return owned.value.get(code) ?? null;
}

function isObtained(code: string) {
  return owned.value.has(code);
}

function metaOf(character: CatalogCharacter) {
  // code → baseChar → 듀오의 앞쪽 캐릭터 순으로 찾는다
  return resolveCharMeta(character);
}

function themeHint(character: CatalogCharacter) {
  if (character.theme === "BIRTHDAY") return "생일 당일에 사진을 찍으면 만날 수 있어요.";
  if (character.theme === "EXPO") return "엑스포과학공원 일대에서 사진을 찍으면 만날 수 있어요.";
  return null;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

// ── 탭 가로 스크롤 ────────────────────────────────
const tabsRef = ref<HTMLElement | null>(null);

/**
 * 데스크톱에서 세로 휠로도 탭을 넘길 수 있게 한다.
 *
 * 칩 줄은 스크롤바를 숨긴 가로 스크롤 영역이라, 마우스만 쓰는 환경에서는
 * shift+휠을 모르면 넘길 방법이 없었다. 트랙패드의 가로 스와이프는 브라우저
 * 기본 동작에 그대로 맡긴다.
 */
function onTabsWheel(event: WheelEvent) {
  const el = tabsRef.value;
  if (!el || el.scrollWidth <= el.clientWidth) return;
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  event.preventDefault();
  el.scrollLeft += event.deltaY;
}

watch(selected, () => (modalImageSettled.value = false));

async function loadOwned() {
  isLoading.value = true;
  loadFailed.value = false;
  try {
    const list = await getMyCharacters();
    owned.value = new Map(list.map((o) => [o.code, o]));
  } catch (error) {
    console.error("도감 정보를 불러오지 못했습니다.", error);
    loadFailed.value = true;
    owned.value = new Map();
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadOwned);

defineExpose({ reload: loadOwned });
</script>

<template>
  <div class="dex-body">
    <p v-if="loadFailed" class="dex-notice">
      도감 정보를 불러오지 못했어요. 실루엣만 표시됩니다.
    </p>

    <!-- 캐릭터 탭 (전체 화면에서만) -->
    <nav
      v-if="!preview"
      ref="tabsRef"
      class="dex-tabs"
      aria-label="캐릭터 분류"
      @wheel="onTabsWheel"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="dex-tabs__chip"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span>{{ tab.got }}/{{ tab.total }}</span>
      </button>
    </nav>

    <div v-if="isLoading" class="dex-placeholder">불러오는 중...</div>

    <div v-else class="dex-grid">
      <button
        v-for="character in visibleCharacters"
        :key="character.code"
        type="button"
        class="dex-card"
        :class="{ 'dex-card--locked': !isObtained(character.code) }"
        @click="selected = character"
      >
        <div class="dex-card__thumb">
          <span v-if="!settledCodes.has(character.code)" class="dex-card__loading">
            로딩중...
          </span>
          <!-- 이름은 카드 아래에 텍스트로 있으므로 alt 없이 둔다 -->
          <SilentImage
            :src="character.imageUrl"
            :class="{ 'is-scene': isSceneArt(character.code) }"
            @settled="settledCodes.add(character.code)"
          />
          <span
            v-if="(ownedOf(character.code)?.count ?? 0) > 1"
            class="dex-card__count"
          >
            ×{{ ownedOf(character.code)!.count }}
          </span>
        </div>
        <p class="dex-card__name">
          {{ isObtained(character.code) ? character.name : "???" }}
        </p>
      </button>
    </div>

    <!-- 상세 모달 -->
    <Teleport to="body">
      <div v-if="selected" class="dex-modal" @click.self="selected = null">
        <div class="dex-modal__panel">
          <button type="button" class="dex-modal__close" @click="selected = null">
            <X :size="18" />
          </button>

          <div
            class="dex-modal__thumb"
            :class="{ 'is-locked': !isObtained(selected.code) }"
          >
            <span v-if="!modalImageSettled" class="dex-modal__loading">로딩중...</span>
            <SilentImage
              :src="selected.imageUrl"
              :class="{ 'is-scene': isSceneArt(selected.code) }"
              @settled="modalImageSettled = true"
            />
          </div>

          <div class="dex-modal__body">
            <!-- 획득 여부는 실루엣과 ??? 로 이미 드러나므로 뱃지를 따로 두지 않는다 -->
            <h3 class="dex-modal__name">
              {{ isObtained(selected.code) ? selected.name : "???" }}
            </h3>

            <template v-if="isObtained(selected.code)">
              <!-- 역할은 이름을 그대로 알려주는 셈이라 획득한 뒤에만 보여준다 -->
              <p v-if="metaOf(selected)?.role" class="dex-modal__role">
                {{ metaOf(selected)!.role }}
              </p>
              <p v-if="metaOf(selected)?.description" class="dex-modal__desc">
                {{ metaOf(selected)!.description }}
              </p>
              <!-- 다음에 가볼 곳 귀띔. 잠긴 테마 카드의 themeHint 와는 다른 자리다 -->
              <p v-if="metaOf(selected)?.hint" class="dex-modal__hint">
                <MapPin :size="14" />
                {{ metaOf(selected)!.hint }}
              </p>
              <dl class="dex-modal__facts">
                <div>
                  <dt>획득 횟수</dt>
                  <dd>{{ ownedOf(selected.code)!.count }}장</dd>
                </div>
                <div>
                  <dt>처음 만난 날</dt>
                  <dd>{{ formatDate(ownedOf(selected.code)!.firstObtainedAt) }}</dd>
                </div>
              </dl>
            </template>

            <template v-else>
              <p class="dex-modal__desc dex-modal__desc--muted">
                아직 만나지 못한 캐릭터예요.
              </p>
              <p v-if="themeHint(selected)" class="dex-modal__hint">
                <MapPin :size="14" />
                {{ themeHint(selected) }}
              </p>
            </template>

            <button type="button" class="dex-modal__confirm" @click="selected = null">
              확인
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dex-body {
  width: 100%;
}

.dex-notice {
  border: 1px dashed #f0c9c9;
  border-radius: 10px;
  background: #fff6f6;
  color: #b45252;
  font-size: 0.8rem;
  font-weight: 700;
  margin: 0 0 1rem;
  padding: 0.7rem 0.9rem;
}

/* ── 탭 ────────────────────────────────────── */
.dex-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1rem;
  padding-bottom: 0.35rem;
  scrollbar-width: none;
}

.dex-tabs::-webkit-scrollbar {
  display: none;
}

/*
 * 마우스를 쓰는 환경에서는 스크롤바를 얇게 남겨 둔다. 완전히 숨기면
 * 넘길 수 있다는 사실 자체가 보이지 않는다. 세로 휠 대응은 onTabsWheel 에 있다.
 */
@media (hover: hover) and (pointer: fine) {
  .dex-tabs {
    scrollbar-width: thin;
    scrollbar-color: rgba(61, 184, 158, 0.45) transparent;
  }

  .dex-tabs::-webkit-scrollbar {
    display: block;
    height: 6px;
  }

  .dex-tabs::-webkit-scrollbar-track {
    background: transparent;
  }

  .dex-tabs::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(61, 184, 158, 0.45);
  }
}

.dex-tabs__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  white-space: nowrap;
  border: 1px solid rgba(178, 228, 220, 0.6);
  border-radius: 999px;
  background: #ffffff;
  color: #1a2e2b;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.45rem 0.85rem;
  transition: background 0.15s ease, color 0.15s ease;
}

.dex-tabs__chip span {
  color: #9bb5b0;
  font-size: 0.72rem;
  font-weight: 700;
}

.dex-tabs__chip.is-active {
  border-color: transparent;
  background: linear-gradient(135deg, #b2e4dc, #3db89e);
  color: #ffffff;
}

.dex-tabs__chip.is-active span {
  color: rgba(255, 255, 255, 0.85);
}

/* ── 그리드 ────────────────────────────────── */
/*
 * 도감 전용 화면과 마이페이지 본문은 폭이 다르다. 뷰포트 미디어 쿼리 대신
 * 칸 최소 너비로 잡아 컨테이너 폭에 맞춰 열 수가 알아서 변하게 한다.
 */
.dex-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 0.7rem;
}

.dex-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(178, 228, 220, 0.5);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(26, 46, 43, 0.05);
  cursor: pointer;
  padding: 0.7rem 0.5rem;
  text-align: center;
}

.dex-card--locked {
  border-color: rgba(214, 231, 227, 0.7);
  background: #f6f9f8;
}

.dex-card__thumb {
  position: relative;
  display: grid;
  width: 100%;
  aspect-ratio: 1;
  place-items: center;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, #eefaf7, #f7fcfb);
}

.dex-card__thumb img {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6%;
}

.dex-card__loading {
  grid-area: 1 / 1;
  color: #9bb5b0;
  font-size: 0.62rem;
  font-weight: 700;
}

/*
 * 미획득 캐릭터는 검정 실루엣으로 보여준다.
 * 147장 모두 배경이 투명한 PNG라 brightness(0)이 알파는 그대로 두고
 * 색만 검정으로 만든다. 별도의 실루엣 이미지가 필요 없다.
 */
.dex-card--locked .dex-card__thumb img {
  filter: brightness(0);
  opacity: 0.72;
}

/*
 * 배경까지 꽉 찬 '장면' 그림은 알파가 없어서 brightness(0) 을 걸면
 * 캐릭터 실루엣이 아니라 검은 네모가 된다. 흐림으로 가린다.
 */
.dex-card--locked .dex-card__thumb img.is-scene,
.dex-modal__thumb.is-locked img.is-scene {
  filter: blur(7px) brightness(0.55) saturate(0.35);
  opacity: 1;
}

.dex-card__count {
  position: absolute;
  right: 4px;
  bottom: 4px;
  border-radius: 999px;
  background: #3db89e;
  color: #ffffff;
  font-size: 0.66rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
}

.dex-card__name {
  margin: 0;
  color: #1a2e2b;
  font-size: 0.76rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.dex-card--locked .dex-card__name {
  color: #a8bcb8;
}

.dex-placeholder {
  border: 1px dashed #d6e7e3;
  border-radius: 12px;
  background: #ffffff;
  color: #6b8c87;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 2.5rem;
  text-align: center;
}

/* ── 모달 ──────────────────────────────────── */
.dex-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  padding: 1rem;
}

/*
 * 소개 길이가 캐릭터마다 크게 다르다. 엑스포 꿈돌이처럼 긴 설명이 붙으면
 * 패널이 화면 밖으로 밀려나는데 배경은 스크롤되지 않아 아래가 잘린 채 갇힌다.
 * 그림은 고정해 두고 본문만 스크롤되게 한다.
 */
.dex-modal__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, 340px);
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(26, 46, 43, 0.18);
}

.dex-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 1;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
  color: #6b8c87;
  cursor: pointer;
}

.dex-modal__thumb {
  display: grid;
  flex-shrink: 0;
  min-height: 210px;
  place-items: center;
  background: linear-gradient(135deg, #e8f8f5, #f0faf8);
  padding: 1.5rem;
}

.dex-modal__thumb img {
  grid-area: 1 / 1;
  width: min(100%, 200px);
  height: 175px;
  object-fit: contain;
}

.dex-modal__loading {
  grid-area: 1 / 1;
  color: #9bb5b0;
  font-size: 0.78rem;
  font-weight: 700;
}

.dex-modal__thumb.is-locked img {
  filter: brightness(0);
  opacity: 0.72;
}

.dex-modal__body {
  overflow-y: auto;
  padding: 1.35rem 1.5rem 1.5rem;
}

.dex-modal__name {
  margin: 0;
  color: #1a2e2b;
  font-size: 1.05rem;
  font-weight: 900;
}

.dex-modal__role {
  margin: 0.4rem 0 0;
  color: #3db89e;
  font-size: 0.74rem;
  font-weight: 800;
}

.dex-modal__desc {
  color: #6b8c87;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.65;
  margin: 0.7rem 0 1rem;
}

.dex-modal__desc--muted {
  color: #a8bcb8;
}

.dex-modal__hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 10px;
  background: #f0faf8;
  color: #3d8f7f;
  font-size: 0.76rem;
  font-weight: 800;
  line-height: 1.5;
  margin: 0 0 1rem;
  padding: 0.7rem 0.8rem;
}

.dex-modal__facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0 0 1rem;
}

.dex-modal__facts > div {
  border-radius: 10px;
  background: #f0faf8;
  padding: 0.65rem 0.7rem;
}

.dex-modal__facts dt {
  color: #6b8c87;
  font-size: 0.68rem;
  font-weight: 800;
}

.dex-modal__facts dd {
  margin: 0.2rem 0 0;
  color: #1a2e2b;
  font-size: 0.86rem;
  font-weight: 900;
}

.dex-modal__confirm {
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #b2e4dc, #3db89e);
  color: #ffffff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 0.85rem 1rem;
}
</style>
