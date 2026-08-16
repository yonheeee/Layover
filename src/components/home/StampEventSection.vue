<script setup lang="ts">
import { ChevronRight, Gift, Sparkles } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import dreamCharacterImage from "@/assets/characters/dream/character_dream.png";
import { useCourseStore } from "@/stores/course";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const courseStore = useCourseStore();
const authStore = useAuthStore();

const pathRef = ref<SVGPathElement | null>(null);
const dotPositions = ref<Array<{ x: number; y: number }>>([]);

const DOT_COUNT = 6;

onMounted(() => {
  if (!pathRef.value) return;
  const totalLength = pathRef.value.getTotalLength();
  dotPositions.value = Array.from({ length: DOT_COUNT }, (_, i) => {
    const t = i / (DOT_COUNT - 1);
    const pt = pathRef.value!.getPointAtLength(t * totalLength);
    return { x: pt.x, y: pt.y };
  });
});

function dotStyle(pos: { x: number; y: number }) {
  return {
    left: `calc(${(pos.x / 980) * 100}% - 18px)`,
    top: `${pos.y - 18}px`,
  };
}

function cardStyle(dotIndex: number) {
  const pos = dotPositions.value[dotIndex];
  if (!pos) return {};
  const offsets = [
    { x: -14, y: -86 },
    { x: -54, y: 42 },
    { x: 34, y: -70 },
    { x: -28, y: 42 },
    { x: -78, y: -76 },
    { x: -86, y: 42 },
  ];
  const offset = offsets[dotIndex] ?? { x: -64, y: 36 };
  return {
    left: `calc(${(pos.x / 980) * 100}% + ${offset.x}px)`,
    top: `${pos.y + offset.y}px`,
  };
}

const text = {
  title: "\uc624\ub298\uc758 \ud658\uc2b9 \ud018\uc2a4\ud2b8",
  description:
    "\ub300\uc804 \uacf3\uacf3\uc744 \ub530\ub77c\uac00\uba70 \uc2a4\ud0ec\ud504\ub97c \ubaa8\uc73c\uace0, \uafc8\ub3cc\uc774 \uce90\ub9ad\ud130 \ubcf4\uc0c1\uc744 \ud574\uae08\ud574\ubcf4\uc138\uc694.",
  cta: "\uc2a4\ud0ec\ud504 \ud22c\uc5b4 \uc2dc\uc791\ud558\uae30",
};

const questCards = [
  {
    className: "quest-card--course",
    title: "AI\uc640 \ud568\uaed8 \uc5ec\ud589 \ucf54\uc2a4 \uad6c\uc131\ud558\uae30",
    body: "\ub9de\ucda4 \ucf54\uc2a4 \uc0dd\uc131",
  },
  {
    className: "quest-card--start",
    title: "\uc5ec\ud589 \uc2dc\uc791",
    body: "\ub300\uc804\uc5ed \ub3c4\ucc29",
  },
  {
    className: "quest-card--bakery",
    title: "\uc131\uc2ec\ub2f9 \ubc29\ubb38",
    body: "\uafc8\ub3cc\uc774 \ud3ec\uc778\ud2b8 +20",
  },
  {
    className: "quest-card--market",
    title: "\uc911\uc559\uc2dc\uc7a5 \uc0b0\ucc45",
    body: "\uc0ac\uc9c4 \uc778\uc99d \uc644\ub8cc",
  },
  {
    className: "quest-card--community",
    title: "\ucee4\ubba4\ub2c8\ud2f0\ub85c \ub300\uc804 \uafc0\ud301 \uacf5\uc720\ud558\uae30",
    body: "\uc5ec\ud589 \ud301 \uc791\uc131",
  },
  {
    className: "quest-card--postcard",
    title: "\uafc8\ub3cc\uc774 \uc5fd\uc11c \uc624\ud508",
    body: "\ub79c\ub364 \ubcf4\uc0c1 \ud68d\ub4dd",
  },
];

async function handleStartStampTour() {
  if (authStore.isLoggedIn) {
    await courseStore.checkConfirmedCourse();
  }

  if (courseStore.hasConfirmedCourse) {
    router.push("/stamp-tour");
  } else {
    router.push("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
</script>

<template>
  <section class="stamp-game-section">
    <div class="stamp-game-board">
      <div class="stamp-game-board__header">
        <div>
          <h2>{{ text.title }}</h2>
          <p>{{ text.description }}</p>
        </div>
      </div>

      <div class="stamp-route" aria-hidden="true">
        <svg viewBox="0 0 980 250" preserveAspectRatio="none">
          <path
            ref="pathRef"
            class="route-path"
            d="M36 158 C160 236 235 94 352 132 S514 250 628 156 S804 42 944 132"
          />
        </svg>

        <span
          v-for="(pos, i) in dotPositions"
          :key="i"
          class="route-dot"
          :class="{ 'route-dot--locked': i + 1 > 4 }"
          :style="dotStyle(pos)"
        >
          {{ i + 1 }}
        </span>

        <article
          v-for="(card, i) in questCards"
          :key="card.title"
          class="quest-card"
          :class="card.className"
          :style="cardStyle(i)"
        >
          <span class="quest-card__number">{{ i + 1 }}</span>
          <strong>{{ card.title }}</strong>
          <span>{{ card.body }}</span>
        </article>
      </div>

      <div class="dream-reward">
        <img :src="dreamCharacterImage" alt="꿈돌이 캐릭터" />
      </div>

      <div class="stamp-game-board__footer">
        <button type="button" class="stamp-tour-button" @click="handleStartStampTour">
          <Sparkles :size="17" />
          {{ text.cta }}
          <ChevronRight :size="17" />
        </button>
      </div>

      <Gift class="stamp-game-board__gift" :size="28" aria-hidden="true" />
    </div>
  </section>
</template>

<style scoped>
.stamp-game-section {
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem 6rem;
  background: #ffffff;
}

.stamp-game-board {
  position: relative;
  width: min(100%, 1440px);
  min-height: 590px;
  margin: 0 auto;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
  padding: 28px 44px 100px;
}


.stamp-game-board__header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.stamp-game-board__header h2 {
  margin: 0;
  color: #112725;
  font-size: clamp(1.65rem, 2.5vw, 2.1rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.25;
}

.stamp-game-board__header p {
  max-width: 720px;
  margin: 12px 0 0;
  color: #55716d;
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.7;
}

.stamp-route {
  position: absolute;
  left: 78px;
  right: 410px;
  top: 156px;
  z-index: 3;
  height: 250px;
}

.stamp-route svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.route-path {
  fill: none;
  stroke: #45bfb0;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 10 16;
}

.route-dot {
  position: absolute;
  z-index: 5;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 5px solid #ffffff;
  border-radius: 50%;
  background: #23887d;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 900;
  box-shadow: 0 7px 18px rgba(35, 136, 125, 0.18);
}

.route-dot--locked {
  background: #d9efec;
  color: #7aa59f;
}

.quest-card {
  position: absolute;
  z-index: 4;
  display: grid;
  width: 188px;
  grid-template-columns: minmax(0, 1fr);
  gap: 4px;
  align-items: start;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.quest-card strong,
.quest-card span {
  display: block;
}

.quest-card strong {
  display: -webkit-box;
  overflow: hidden;
  color: #173430;
  font-size: 0.78rem;
  font-weight: 900;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.quest-card span {
  margin-top: 0;
  color: #64817c;
  font-size: 0.64rem;
  font-weight: 800;
}

.quest-card__number {
  display: none !important;
  color: #23887d;
  font-size: 0.8rem;
  font-weight: 900;
  line-height: 1.25;
}

.quest-card span:not(.quest-card__number) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dream-reward {
  position: absolute;
  right: 66px;
  bottom: 42px;
  z-index: 1;
  width: min(38vw, 470px);
}

.dream-reward img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.stamp-game-board__footer {
  position: absolute;
  left: 44px;
  bottom: 34px;
  z-index: 3;
  display: flex;
  align-items: center;
}

.stamp-tour-button {
  display: inline-flex;
  min-height: 56px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 18px;
  background: #23887d;
  color: #ffffff;
  cursor: pointer;
  padding: 0 24px;
  font-size: 0.95rem;
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(35, 136, 125, 0.22);
  transition:
    transform 0.18s ease,
    background 0.18s ease;
}

.stamp-tour-button:hover {
  transform: translateY(-2px);
  background: #176f66;
}

.stamp-game-board__gift {
  position: absolute;
  right: 34px;
  top: 32px;
  color: #23887d;
  opacity: 0.22;
}

@media (max-width: 1024px) {
  .stamp-game-board {
    min-height: 620px;
    padding-bottom: 104px;
  }

  .stamp-route {
    left: 48px;
    right: 54px;
    top: 166px;
    height: 240px;
  }

  .quest-card strong {
    font-size: 0.74rem;
  }

  .quest-card span:not(.quest-card__number) {
    font-size: 0.62rem;
  }

  .dream-reward {
    right: 24px;
    bottom: 84px;
    z-index: 0;
    width: min(78vw, 520px);
    opacity: 0.18;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .stamp-game-section {
    padding: 0 1.75rem 5rem;
  }

  .stamp-game-board {
    padding: 34px 40px 104px;
  }

  .stamp-game-board__header p {
    max-width: 620px;
  }

  .stamp-game-board__footer {
    bottom: 38px;
    left: 40px;
  }
}

@media (max-width: 767px) {
  .stamp-game-section {
    padding: 0 1rem 4rem;
  }

  .stamp-game-board {
    min-height: auto;
    padding: 28px 20px 30px;
  }

  .stamp-game-board__header {
    flex-direction: column;
  }

  .stamp-route,
  .quest-card,
  .stamp-game-board__footer {
    position: relative;
    inset: auto;
  }

  .stamp-route {
    display: flex;
    width: 100%;
    height: auto;
    flex-direction: column;
    gap: 12px;
    margin: 26px 0 18px;
    overflow: visible;
  }

  .stamp-route svg,
  .route-dot {
    display: none;
  }

  .quest-card {
    box-sizing: border-box;
    width: 100%;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 4px 8px;
    align-items: center;
    padding: 6px 0;
    transform: none !important;
  }

  .quest-card__number {
    grid-row: span 2;
    display: block !important;
    color: #23887d;
    font-weight: 900;
    line-height: 1.35;
  }

  .quest-card__number {
    font-size: 0.76rem;
  }

  .quest-card strong {
    font-size: 0.88rem;
  }

  .quest-card span:not(.quest-card__number) {
    margin-top: 0;
    font-size: 0.76rem;
  }

  .dream-reward {
    position: absolute;
    right: 0;
    bottom: 96px;
    width: min(96%, 420px);
    opacity: 0.14;
  }

  .stamp-game-board__footer {
    flex-direction: column;
    align-items: stretch;
    margin-top: 20px;
  }
}

@media (max-width: 640px) {
  .stamp-game-board {
    padding: 24px 16px;
  }

  .stamp-route {
    height: auto;
  }

  .stamp-tour-button {
    width: 100%;
    min-height: 52px;
  }
}

@media (max-width: 420px) {
  .stamp-game-section {
    padding: 0 0.75rem 3.5rem;
  }

  .stamp-game-board {
    padding: 22px 14px;
  }

  .stamp-route {
    height: auto;
    margin-right: 4px;
    margin-left: 4px;
  }

  .dream-reward {
    width: min(96%, 360px);
  }
}
</style>
