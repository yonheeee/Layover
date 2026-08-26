<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, MapPin, Star, X } from "lucide-vue-next";
import { getMyCharacters, type OwnedCharacter } from "@/api/characters";
import {
  CHAR_META,
  TOTAL_CHARACTER_COUNT,
  catalogGroups,
  characterCatalog,
  type CatalogCharacter,
} from "@/data/characterCatalog";

const router = useRouter();

/** code → 보유 횟수 */
const owned = ref<Map<string, OwnedCharacter>>(new Map());
const isLoading = ref(true);
const loadFailed = ref(false);

const activeTab = ref<string>("all");
const selected = ref<CatalogCharacter | null>(null);

const obtainedCount = computed(
  () => characterCatalog.filter((c) => owned.value.has(c.code)).length,
);
const totalDrawCount = computed(() =>
  [...owned.value.values()].reduce((sum, o) => sum + o.count, 0),
);
const progressRatio = computed(() =>
  TOTAL_CHARACTER_COUNT ? obtainedCount.value / TOTAL_CHARACTER_COUNT : 0,
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

const visibleCharacters = computed(() => {
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
  // duo는 앞쪽 캐릭터 소개를 쓴다
  return CHAR_META[character.baseChar.split("+")[0]] ?? null;
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
</script>

<template>
  <div class="dex">
    <div class="dex__inner">
      <button type="button" class="dex__back" @click="router.back()">
        <ArrowLeft :size="17" />
        마이페이지
      </button>

      <header class="dex__title">
        <h1>꿈씨 도감</h1>
        <p>대전 곳곳에서 사진을 찍으며 만난 캐릭터를 모아보세요.</p>
      </header>

      <!-- 진행 요약 -->
      <section class="dex-summary">
        <div class="dex-summary__icon">
          <Star :size="20" fill="#fff" color="#fff" />
        </div>
        <div class="dex-summary__body">
          <div class="dex-summary__row">
            <span>수집 현황</span>
            <strong>{{ obtainedCount }} / {{ TOTAL_CHARACTER_COUNT }}종</strong>
          </div>
          <div class="dex-summary__bar">
            <span :style="`width:${Math.round(progressRatio * 100)}%`" />
          </div>
          <p>
            {{ Math.round(progressRatio * 100) }}% 달성
            <template v-if="totalDrawCount">
              · 중복 포함 {{ totalDrawCount }}장
            </template>
          </p>
        </div>
      </section>

      <p v-if="loadFailed" class="dex__notice">
        도감 정보를 불러오지 못했어요. 실루엣만 표시됩니다.
      </p>

      <!-- 캐릭터 탭 -->
      <nav class="dex-tabs" aria-label="캐릭터 분류">
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

      <div v-if="isLoading" class="dex__placeholder">불러오는 중...</div>

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
            <img
              :src="character.imageUrl"
              :alt="isObtained(character.code) ? character.name : '미획득 캐릭터'"
              loading="lazy"
              decoding="async"
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
            <img :src="selected.imageUrl" :alt="selected.name" />
          </div>

          <div class="dex-modal__body">
            <div class="dex-modal__head">
              <h3>{{ isObtained(selected.code) ? selected.name : "???" }}</h3>
              <span :class="{ 'is-obtained': isObtained(selected.code) }">
                {{ isObtained(selected.code) ? "획득" : "미획득" }}
              </span>
            </div>

            <p v-if="metaOf(selected)?.role" class="dex-modal__role">
              {{ metaOf(selected)!.role }}
            </p>

            <template v-if="isObtained(selected.code)">
              <p class="dex-modal__desc">{{ metaOf(selected)?.description }}</p>
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
.dex {
  min-height: calc(100vh - 64px);
  background: linear-gradient(155deg, #e8f8f5 0%, #ffffff 50%, #f0faf8 100%);
}

.dex__inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

.dex__back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  background: transparent;
  color: #6b8c87;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.dex__title h1 {
  margin: 0;
  color: #1a2e2b;
  font-size: 1.3rem;
  font-weight: 900;
}

.dex__title p {
  margin: 0.3rem 0 1.5rem;
  color: #6b8c87;
  font-size: 0.86rem;
  font-weight: 700;
}

/* ── 진행 요약 ─────────────────────────────── */
.dex-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
  border: 1px solid rgba(178, 228, 220, 0.4);
  border-radius: 12px;
  background: linear-gradient(135deg, #e8f8f5, #f0faf8);
  box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
  margin-bottom: 1.25rem;
  padding: 1.2rem;
}

.dex-summary__icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #b2e4dc, #3db89e);
}

.dex-summary__body {
  flex: 1;
  min-width: 0;
}

.dex-summary__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: #1a2e2b;
  font-size: 0.95rem;
  font-weight: 800;
}

.dex-summary__row strong {
  color: #3db89e;
}

.dex-summary__bar {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(178, 228, 220, 0.35);
  margin-top: 0.5rem;
}

.dex-summary__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #b2e4dc, #3db89e);
  transition: width 0.3s ease;
}

.dex-summary p {
  margin: 0.35rem 0 0;
  color: #6b8c87;
  font-size: 0.76rem;
  font-weight: 700;
}

.dex__notice {
  border: 1px dashed #f0c9c9;
  border-radius: 10px;
  background: #fff6f6;
  color: #b45252;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding: 0.7rem 0.9rem;
}

/* ── 탭 ────────────────────────────────────── */
.dex-tabs {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  margin-bottom: 1rem;
  padding-bottom: 0.35rem;
  scrollbar-width: none;
}

.dex-tabs::-webkit-scrollbar {
  display: none;
}

.dex-tabs__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
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
.dex-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6%;
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

.dex__placeholder {
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

.dex-modal__panel {
  position: relative;
  width: min(100%, 340px);
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(26, 46, 43, 0.18);
}

.dex-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
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
  min-height: 210px;
  place-items: center;
  background: linear-gradient(135deg, #e8f8f5, #f0faf8);
  padding: 1.5rem;
}

.dex-modal__thumb img {
  width: min(100%, 200px);
  height: 175px;
  object-fit: contain;
}

.dex-modal__thumb.is-locked img {
  filter: brightness(0);
  opacity: 0.72;
}

.dex-modal__body {
  padding: 1.35rem 1.5rem 1.5rem;
}

.dex-modal__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dex-modal__head h3 {
  margin: 0;
  color: #1a2e2b;
  font-size: 1.05rem;
  font-weight: 900;
}

.dex-modal__head span {
  border-radius: 999px;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.18rem 0.55rem;
}

.dex-modal__head span.is-obtained {
  background: #d1fae5;
  color: #065f46;
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

@media (max-width: 560px) {
  .dex-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
