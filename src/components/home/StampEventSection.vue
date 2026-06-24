<script setup lang="ts">
import { ChevronRight, Gift, Sparkles } from "lucide-vue-next";
import { useRouter } from "vue-router";
import dreamCharacterImage from "@/assets/characters/dream/character_dream.png";

const router = useRouter();

const text = {
  title: "\uc624\ub298\uc758 \ud658\uc2b9 \ud018\uc2a4\ud2b8",
  description:
    "\ub300\uc804 \uacf3\uacf3\uc744 \ub530\ub77c\uac00\uba70 \uc2a4\ud0ec\ud504\ub97c \ubaa8\uc73c\uace0, \uafc8\ub3cc\uc774 \uce90\ub9ad\ud130 \ubcf4\uc0c1\uc744 \ud574\uae08\ud574\ubcf4\uc138\uc694.",
  cta: "\uc2a4\ud0ec\ud504 \ud22c\uc5b4 \uc2dc\uc791\ud558\uae30",
};

const questCards = [
  {
    className: "quest-card--station",
    title: "\ub300\uc804\uc5ed \ub3c4\ucc29",
    body: "\uccab \uc2a4\ud0ec\ud504 \ud68d\ub4dd",
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
    className: "quest-card--reward",
    title: "\uafc8\ub3cc\uc774 \ubcf4\uc0c1",
    body: "\ub79c\ub364 \uc5fd\uc11c \uc624\ud508",
  },
];

function handleStartStampTour() {
  router.push("/stamp-tour");
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
            class="route-path"
            d="M36 158 C160 236 235 94 352 132 S514 250 628 156 S804 42 944 132"
          />
        </svg>

        <span
          v-for="index in 6"
          :key="index"
          class="route-dot"
          :class="[`route-dot--${index}`, { 'route-dot--locked': index > 4 }]"
        >
          {{ index }}
        </span>
      </div>

      <article
        v-for="card in questCards"
        :key="card.title"
        class="quest-card"
        :class="card.className"
      >
        <strong>{{ card.title }}</strong>
        <span>{{ card.body }}</span>
      </article>

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
  min-height: 470px;
  margin: 0 auto;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
  padding: 28px 44px 34px;
}

.stamp-game-board::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 78% 24%, rgba(61, 184, 158, 0.1), transparent 32%),
    radial-gradient(circle at 88% 88%, rgba(178, 228, 220, 0.22), transparent 28%);
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
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.25;
}

.stamp-game-board__header p {
  max-width: 720px;
  margin: 12px 0 0;
  color: #55716d;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.7;
}

.stamp-route {
  position: absolute;
  left: 78px;
  right: 310px;
  top: 156px;
  z-index: 1;
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

.route-dot--1 {
  left: 0;
  top: 140px;
}

.route-dot--2 {
  left: 16%;
  top: 168px;
}

.route-dot--3 {
  left: 32%;
  top: 82px;
}

.route-dot--4 {
  left: 48%;
  top: 130px;
}

.route-dot--5 {
  left: 67%;
  top: 190px;
}

.route-dot--6 {
  left: 89%;
  top: 106px;
}

.quest-card {
  position: absolute;
  z-index: 2;
  width: 205px;
  border: 1px solid #d9efec;
  border-radius: 15px;
  padding: 14px 18px;
  box-shadow: 0 10px 24px rgba(26, 46, 43, 0.07);
}

.quest-card strong,
.quest-card span {
  display: block;
}

.quest-card strong {
  color: #173430;
  font-size: 0.94rem;
  font-weight: 900;
}

.quest-card span {
  margin-top: 6px;
  color: #64817c;
  font-size: 0.78rem;
  font-weight: 800;
}

.quest-card--station {
  left: 82px;
  top: 170px;
  background: #e8f8f5;
}

.quest-card--bakery {
  left: 326px;
  top: 206px;
  background: #fff7dd;
}

.quest-card--market {
  left: 160px;
  bottom: 98px;
  background: #f0fbf8;
}

.quest-card--reward {
  left: 560px;
  bottom: 95px;
  background: #f4efff;
}

.dream-reward {
  position: absolute;
  right: 66px;
  bottom: 28px;
  z-index: 2;
  width: 365px;
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

@media (max-width: 1120px) {
  .stamp-game-board {
    min-height: 650px;
  }

  .stamp-route {
    right: 120px;
  }

  .dream-reward {
    right: 44px;
    bottom: 108px;
    width: 310px;
  }

}

@media (max-width: 820px) {
  .stamp-game-section {
    padding: 0 1rem 4rem;
  }

  .stamp-game-board {
    min-height: auto;
    padding: 28px 20px;
  }

  .stamp-game-board__header {
    flex-direction: column;
  }

  .stamp-route,
  .quest-card,
  .dream-reward,
  .stamp-game-board__footer {
    position: relative;
    inset: auto;
  }

  .stamp-route {
    left: auto;
    right: auto;
    top: auto;
    height: 190px;
    margin: 18px 0;
  }

  .quest-card {
    width: auto;
    margin-top: 10px;
  }

  .dream-reward {
    width: min(100%, 360px);
    margin: 22px auto 0;
  }

  .stamp-game-board__footer {
    flex-direction: column;
    align-items: stretch;
    margin-top: 20px;
  }
}
</style>
