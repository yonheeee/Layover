<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import CharacterDex from "@/components/mypage/CharacterDex.vue";

/**
 * 도감 전용 화면.
 *
 * 실제 도감은 `CharacterDex` 가 전부 그린다. 마이페이지 스탬프 탭도 같은
 * 컴포넌트를 쓰므로 두 화면의 내용이 어긋나지 않는다.
 */

const router = useRouter();

/** 수집 현황. 별도 카드 대신 제목 옆에 붙인다. */
const progress = ref({ obtained: 0, total: 0 });
</script>

<template>
  <div class="dex">
    <div class="dex__inner">
      <button type="button" class="dex__back" @click="router.back()">
        <ArrowLeft :size="17" />
        마이페이지
      </button>

      <header class="dex__title">
        <h1>
          꿈씨 도감
          <span class="dex__count">{{ progress.obtained }}/{{ progress.total }}</span>
        </h1>
        <p>대전 곳곳에서 사진을 찍으며 만난 캐릭터를 모아보세요.</p>
      </header>

      <CharacterDex @progress="progress = $event" />
    </div>
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
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0;
  color: #1a2e2b;
  font-size: 1.3rem;
  font-weight: 900;
}

.dex__count {
  color: #3db89e;
  font-size: 0.95rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.dex__title p {
  margin: 0.3rem 0 1.5rem;
  color: #6b8c87;
  font-size: 0.86rem;
  font-weight: 700;
}
</style>
