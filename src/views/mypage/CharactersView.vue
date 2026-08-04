<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Lock, Star } from "lucide-vue-next";
import { getCharacters, type CharacterResponse } from "@/api/characters";
import { fetchUser } from "@/api/user";
import ImageWithFallback from "@/components/ImageWithFallback.vue";
import dreamCharacterImage from "@/assets/characters/dream/character_dream.png";

const router = useRouter();

const characters = ref<CharacterResponse[]>([]);
const selectedChar = ref<CharacterResponse | null>(null);
const myStamps = ref(0);
const isLoading = ref(false);

const obtainedCount = computed(
  () => characters.value.filter((character) => character.obtained).length,
);

const maxRequiredStamps = computed(() =>
  Math.max(...characters.value.map((character) => character.requiredStamps), 1),
);

const nextCharacter = computed(() =>
  characters.value.find((character) => !character.obtained),
);

const remainingStamps = computed(() => {
  if (!nextCharacter.value) return 0;
  return Math.max(nextCharacter.value.requiredStamps - myStamps.value, 0);
});

function characterImageUrl(character: CharacterResponse | null) {
  return character?.imageUrl || dreamCharacterImage;
}

async function loadCharacters() {
  isLoading.value = true;
  try {
    const [user, characterList] = await Promise.all([
      fetchUser(),
      getCharacters(),
    ]);
    myStamps.value = user.stampCount ?? 0;
    characters.value = characterList;
  } catch (error) {
    console.error("캐릭터 정보를 불러오지 못했습니다.", error);
    characters.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadCharacters);
</script>

<template>
  <div class="characters-page">
    <div class="characters-page__inner">
      <button type="button" class="characters-page__back" @click="router.back()">
        <ArrowLeft :size="17" />
        마이페이지
      </button>

      <div class="characters-page__title">
        <div class="characters-page__title-icon">
          <img :src="dreamCharacterImage" alt="" />
        </div>
        <div>
          <h1>꿈돌이 컬렉션</h1>
          <p>대전 곳곳에서 모은 스탬프로 해금한 캐릭터를 확인해보세요.</p>
        </div>
      </div>

      <section class="stamp-summary">
        <div class="stamp-summary__icon">
          <Star :size="20" fill="#fff" color="#fff" />
        </div>
        <div class="stamp-summary__body">
          <div class="stamp-summary__row">
            <span>누적 스탬프</span>
            <strong>{{ myStamps }}개</strong>
          </div>
          <div class="stamp-summary__bar">
            <span
              :style="`width:${Math.min((myStamps / maxRequiredStamps) * 100, 100)}%`"
            />
          </div>
          <p v-if="nextCharacter">
            다음 꿈돌이까지 {{ remainingStamps }}개
          </p>
          <p v-else>모든 꿈돌이를 획득했어요.</p>
        </div>
      </section>

      <div class="characters-page__count">
        획득한 꿈돌이
        <span>{{ obtainedCount }}</span>
        / {{ characters.length }}
      </div>

      <div v-if="isLoading" class="characters-page__loading">
        불러오는 중...
      </div>

      <div v-else-if="characters.length === 0" class="characters-page__empty">
        표시할 캐릭터가 없습니다.
      </div>

      <div v-else class="characters-grid">
        <button
          v-for="character in characters"
          :key="character.id"
          type="button"
          class="character-card"
          :class="{ 'character-card--locked': !character.obtained }"
          @click="selectedChar = character"
        >
          <div class="character-card__image">
            <ImageWithFallback
              :src="characterImageUrl(character)"
              :alt="character.name"
              class="character-card__img"
            />
            <div v-if="!character.obtained" class="character-card__lock">
              <Lock :size="18" color="#fff" />
            </div>
          </div>
          <div class="character-card__text">
            <p>{{ character.name }}</p>
            <span v-if="character.obtained">획득 완료</span>
            <span v-else>스탬프 {{ character.requiredStamps }}개 필요</span>
          </div>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="selectedChar"
        class="character-modal"
        @click.self="selectedChar = null"
      >
        <div class="character-modal__panel">
          <div
            class="character-modal__image"
            :class="{ 'character-modal__image--locked': !selectedChar.obtained }"
          >
            <ImageWithFallback
              :src="characterImageUrl(selectedChar)"
              :alt="selectedChar.name"
              class="character-modal__img"
            />
          </div>
          <div class="character-modal__body">
            <div class="character-modal__title">
              <h3>{{ selectedChar.name }}</h3>
              <span :class="{ 'is-obtained': selectedChar.obtained }">
                {{ selectedChar.obtained ? "획득 완료" : "미획득" }}
              </span>
            </div>
            <p>{{ selectedChar.description }}</p>
            <div class="character-modal__requirement">
              <Star :size="14" color="#3db89e" />
              <span>필요 스탬프</span>
              <strong>{{ selectedChar.requiredStamps }}개</strong>
            </div>
            <button type="button" @click="selectedChar = null">닫기</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.characters-page {
  min-height: calc(100vh - 64px);
  background: linear-gradient(155deg, #e8f8f5 0%, #ffffff 50%, #f0faf8 100%);
}

.characters-page__inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

.characters-page__back {
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

.characters-page__title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.characters-page__title-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  overflow: hidden;
  border-radius: 14px;
  background: #dff6f1;
}

.characters-page__title-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.characters-page__title h1 {
  margin: 0;
  color: #1a2e2b;
  font-size: 1.25rem;
  font-weight: 900;
}

.characters-page__title p {
  margin: 0.25rem 0 0;
  color: #6b8c87;
  font-size: 0.86rem;
  font-weight: 700;
}

.stamp-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
  border: 1px solid rgba(178, 228, 220, 0.4);
  border-radius: 8px;
  background: linear-gradient(135deg, #e8f8f5, #f0faf8);
  box-shadow: 0 2px 12px rgba(26, 46, 43, 0.05);
  margin-bottom: 1.5rem;
  padding: 1.2rem;
}

.stamp-summary__icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #b2e4dc, #3db89e);
}

.stamp-summary__body {
  flex: 1;
}

.stamp-summary__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: #1a2e2b;
  font-size: 0.95rem;
  font-weight: 800;
}

.stamp-summary__row strong {
  color: #3db89e;
}

.stamp-summary__bar {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(178, 228, 220, 0.3);
  margin-top: 0.5rem;
}

.stamp-summary__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #b2e4dc, #3db89e);
  transition: width 0.25s ease;
}

.stamp-summary p {
  margin: 0.35rem 0 0;
  color: #6b8c87;
  font-size: 0.76rem;
  font-weight: 700;
}

.characters-page__count {
  color: #1a2e2b;
  font-size: 0.92rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.characters-page__count span {
  color: #3db89e;
}

.characters-page__loading,
.characters-page__empty {
  border: 1px dashed #d6e7e3;
  border-radius: 8px;
  background: #ffffff;
  color: #6b8c87;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 2rem;
  text-align: center;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.character-card {
  display: flex;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid rgba(178, 228, 220, 0.5);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(26, 46, 43, 0.06);
  padding: 1rem;
  text-align: center;
}

.character-card--locked {
  border-color: rgba(220, 220, 220, 0.8);
  background: #f8f8f8;
}

.character-card__image {
  position: relative;
  display: grid;
  width: 80px;
  height: 80px;
  place-items: center;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg, #e8f8f5, #f0faf8);
}

.character-card--locked .character-card__image {
  filter: grayscale(1);
}

.character-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.character-card__lock {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.25);
}

.character-card__text p {
  margin: 0;
  color: #1a2e2b;
  font-size: 0.84rem;
  font-weight: 800;
}

.character-card__text span {
  display: block;
  color: #3db89e;
  font-size: 0.72rem;
  font-weight: 800;
  margin-top: 0.2rem;
}

.character-card--locked .character-card__text p,
.character-card--locked .character-card__text span {
  color: #9ca3af;
}

.character-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  padding: 1rem;
}

.character-modal__panel {
  width: min(100%, 340px);
  overflow: hidden;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(26, 46, 43, 0.15);
}

.character-modal__image {
  display: grid;
  min-height: 210px;
  place-items: center;
  background: linear-gradient(135deg, #e8f8f5, #f0faf8);
  padding: 1.5rem;
}

.character-modal__image--locked {
  filter: grayscale(1);
}

.character-modal__img {
  width: min(100%, 210px);
  height: 180px;
  object-fit: contain;
}

.character-modal__body {
  padding: 1.5rem;
}

.character-modal__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
}

.character-modal__title h3 {
  margin: 0;
  color: #1a2e2b;
  font-size: 1.05rem;
  font-weight: 900;
}

.character-modal__title span {
  border-radius: 999px;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.18rem 0.55rem;
}

.character-modal__title span.is-obtained {
  background: #d1fae5;
  color: #065f46;
}

.character-modal__body p {
  color: #6b8c87;
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.65;
  margin: 0 0 1rem;
}

.character-modal__requirement {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 8px;
  background: #f0faf8;
  color: #1a2e2b;
  font-size: 0.82rem;
  font-weight: 800;
  margin-bottom: 1rem;
  padding: 0.8rem;
}

.character-modal__requirement strong {
  color: #3db89e;
  margin-left: auto;
}

.character-modal button {
  width: 100%;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #b2e4dc, #3db89e);
  color: #ffffff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 0.85rem 1rem;
}

@media (max-width: 520px) {
  .characters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stamp-summary {
    align-items: flex-start;
  }
}
</style>
