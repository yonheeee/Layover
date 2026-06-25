<script setup lang="ts">
import { ChevronRight, MapPinned, Sparkles, TrainFront } from "lucide-vue-next";
import heroPreview from "@/assets/images/home-hero-daejeon.png";

const text = {
  eyebrow: "AI\ub85c \uc644\uc131\ud558\ub294 \ub098\ub9cc\uc758 \ub300\uc804 \ud658\uc2b9\uc5ec\ud589",
  title:
    "\ub300\uae30 \uc2dc\uac04\uc774 \uc5ec\ud589 \uacc4\ud68d\uc73c\ub85c \ubc14\ub00c\ub294 \uc21c\uac04",
  description:
    "\uc5f4\ucc28 \ucd9c\ubc1c \uc2dc\uac04\uacfc \uad00\uc2ec \ud14c\ub9c8\ub9cc \uace0\ub974\uba74, Layover\uac00 \ud658\uc2b9 \uc2dc\uac04\uc5d0 \ub9de\ub294 \ub300\uc804 \ucf54\uc2a4\ub97c \ub611\ub611\ud558\uac8c \ucd94\ucc9c\ud574\uc694.",
  button: "\ub9de\ucda4 \ucf54\uc2a4 \ucc3e\uae30",
  previewLabel: "\ucf54\uc2a4 \ubbf8\ub9ac\ubcf4\uae30",
  previewTitle: "\ub300\uc804\uc5ed \ud658\uc2b9 2\uc2dc\uac04 \ucf54\uc2a4",
  previewMeta: "\uc74c\uc2dd · \ubb38\ud654 · \uc790\uc5f0",
};

const steps = [
  {
    label: "STEP 1",
    title: "\uc5f4\ucc28 \uc2dc\uac04\uc744 \uc120\ud0dd\ud574\uc694",
    body: "\ub300\uc804\uc5ed\uc774\ub098 \uc11c\ub300\uc804\uc5ed \ucd9c\ubc1c \uc5f4\ucc28\ub97c \uc120\ud0dd\ud558\uba74 \ub0a8\uc740 \uc2dc\uac04\uc744 \uc790\ub3d9\uc73c\ub85c \uacc4\uc0b0\ud574\uc694.",
  },
  {
    label: "STEP 2",
    title: "\uad00\uc2ec \ud14c\ub9c8\ub97c \uace0\ub974\uc138\uc694",
    body: "\uc74c\uc2dd, \ubb38\ud654, \uc790\uc5f0, \uc1fc\ud551 \uc911 \ucde8\ud5a5\uc5d0 \ub9de\ub294 \ud14c\ub9c8\ub97c \uc120\ud0dd\ud558\uc138\uc694.",
  },
  {
    label: "STEP 3",
    title: "AI\uac00 \ucf54\uc2a4\ub97c \uc644\uc131\ud574\uc694",
    body: "\ud658\uc2b9 \uc2dc\uac04 \uc548\uc5d0 \ub2e4\ub140\uc62c \uc218 \uc788\ub294 \ub3d9\uc120\uacfc \uc7a5\uc18c\ub97c \ud55c \ubc88\uc5d0 \ucd94\ucc9c\ud574\uc694.",
  },
];

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  document.documentElement.scrollTo?.({ top: 0, left: 0, behavior: "smooth" });
  document.body.scrollTo?.({ top: 0, left: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="smart-course-wrap">
  <section class="smart-course">
    <div class="smart-course__copy">
      <p class="smart-course__eyebrow">{{ text.eyebrow }}</p>
      <h2>{{ text.title }}</h2>
      <p class="smart-course__description">{{ text.description }}</p>

      <ol class="smart-course__steps">
        <li v-for="(step, index) in steps" :key="step.label">
          <span class="step-dot">{{ index + 1 }}</span>
          <div class="step-card">
            <span>{{ step.label }}</span>
            <strong>{{ step.title }}</strong>
            <p>{{ step.body }}</p>
          </div>
        </li>
      </ol>
    </div>

    <div class="smart-course__visual" aria-hidden="true">
      <div class="laptop">
        <div class="preview-card">
          <span>{{ text.previewLabel }}</span>
          <strong>{{ text.previewTitle }}</strong>
          <em>{{ text.previewMeta }}</em>
          <div class="preview-route">
            <i />
            <i />
            <i />
          </div>
        </div>

        <div class="laptop__screen">
          <img :src="heroPreview" alt="" />
          <div class="laptop__overlay">
            <MapPinned :size="20" />
            <strong>{{ text.previewTitle }}</strong>
            <span>{{ text.previewMeta }}</span>
          </div>
        </div>
        <div class="laptop__base" />
      </div>

      <button class="smart-course__button" type="button" @click="scrollToTop">
        <TrainFront :size="17" />
        {{ text.button }}
        <ChevronRight :size="17" />
      </button>
    </div>

    <Sparkles class="smart-course__sparkle" :size="22" aria-hidden="true" />
  </section>
  </div>
</template>

<style scoped>
.smart-course-wrap {
  width: 100%;
  background:
    linear-gradient(115deg, rgba(255, 255, 255, 0.96) 0%, rgba(243, 253, 250, 0.94) 48%, rgba(255, 255, 255, 0.98) 100%),
    radial-gradient(circle at 88% 20%, rgba(61, 184, 158, 0.16), transparent 34%);
}

.smart-course {
  position: relative;
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(420px, 1.08fr);
  gap: 42px;
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 54px 48px 44px;
}

.smart-course__eyebrow {
  margin: 0 0 10px;
  color: #237d72;
  font-size: 0.9rem;
  font-weight: 900;
}

.smart-course h2 {
  max-width: 560px;
  margin: 0;
  color: #102927;
  font-size: clamp(1.65rem, 3vw, 2.2rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.35;
}

.smart-course__description {
  max-width: 560px;
  margin: 22px 0 34px;
  color: #607673;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.8;
}

.smart-course__steps {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.smart-course__steps::before {
  content: "";
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 17px;
  width: 2px;
  background: linear-gradient(#2f877c, rgba(47, 135, 124, 0.18));
}

.smart-course__steps li {
  position: relative;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
}

.step-dot {
  position: relative;
  z-index: 1;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  background: #24887d;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 900;
  box-shadow: 0 0 0 8px #f4fcfa;
}

.step-card {
  position: relative;
  max-width: 360px;
  padding: 17px 20px 18px;
  border-radius: 8px;
  background: #23887d;
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(35, 136, 125, 0.18);
}

.step-card::before {
  content: "";
  position: absolute;
  top: 22px;
  left: -14px;
  width: 24px;
  height: 18px;
  border-radius: 999px 0 0 999px;
  background: #23887d;
}

.step-card span {
  display: block;
  margin-bottom: 6px;
  color: #c8f5ee;
  font-size: 0.73rem;
  font-weight: 900;
}

.step-card strong {
  display: block;
  margin-bottom: 6px;
  font-size: 0.94rem;
  font-weight: 900;
}

.step-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.55;
}

.smart-course__visual {
  position: relative;
  min-height: 420px;
}

.preview-card {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 3;
  width: 260px;
  padding: 18px 20px;
  border: 1px solid rgba(178, 228, 220, 0.6);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(8px);
  box-shadow: 0 18px 40px rgba(25, 58, 54, 0.1);
}

.preview-card span,
.preview-card em {
  display: block;
  color: #6e8581;
  font-size: 0.76rem;
  font-style: normal;
  font-weight: 800;
}

.preview-card strong {
  display: block;
  margin: 8px 0 8px;
  color: #102927;
  font-size: 1rem;
  font-weight: 900;
}

.preview-route {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.preview-route i {
  display: block;
  height: 7px;
  flex: 1;
  border-radius: 999px;
  background: #23887d;
}

.preview-route i:nth-child(2) {
  background: #83d7cc;
}

.preview-route i:nth-child(3) {
  background: #d9efec;
}

.laptop {
  position: absolute;
  right: -36px;
  bottom: 28px;
  width: min(94%, 610px);
}

.laptop__screen {
  position: relative;
  height: 320px;
  overflow: hidden;
  border: 12px solid #18201f;
  border-bottom-width: 20px;
  border-radius: 12px 12px 4px 4px;
  background: #101816;
  box-shadow: 0 24px 55px rgba(13, 31, 29, 0.2);
}

.laptop__screen::before {
  content: "";
  position: absolute;
  top: -8px;
  left: 50%;
  z-index: 2;
  width: 70px;
  height: 13px;
  transform: translateX(-50%);
  border-radius: 0 0 10px 10px;
  background: #18201f;
}

.laptop__screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.78;
}

.laptop__overlay {
  position: absolute;
  right: 26px;
  bottom: 28px;
  width: 270px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  color: #173430;
  backdrop-filter: blur(8px);
}

.laptop__overlay strong,
.laptop__overlay span {
  display: block;
}

.laptop__overlay strong {
  margin: 8px 0 5px;
  font-size: 0.94rem;
  font-weight: 900;
}

.laptop__overlay span {
  color: #59716d;
  font-size: 0.75rem;
  font-weight: 800;
}

.laptop__base {
  height: 16px;
  margin: 0 -26px;
  border-radius: 0 0 50% 50%;
  background: linear-gradient(180deg, #ded8cc, #9d978c);
}

.smart-course__button {
  position: absolute;
  right: 0;
  bottom: -36px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 46px;
  border: 0;
  border-radius: 999px;
  background: #23887d;
  color: #ffffff;
  cursor: pointer;
  padding: 0 18px 0 20px;
  font-size: 0.92rem;
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(35, 136, 125, 0.24);
  transition:
    transform 0.18s ease,
    background 0.18s ease;
}

.smart-course__button:hover {
  transform: translateY(-2px);
  background: #176f66;
}

.smart-course__sparkle {
  position: absolute;
  right: 32px;
  top: 28px;
  color: #2f877c;
  opacity: 0.35;
}

@media (max-width: 980px) {
  .smart-course {
    grid-template-columns: 1fr;
    padding: 40px 22px;
  }

  .smart-course__visual {
    min-height: 460px;
  }
}

@media (max-width: 640px) {
  .smart-course__visual {
    min-height: 390px;
  }

  .preview-card {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
  }

  .laptop {
    right: -60px;
    width: 120%;
  }

  .laptop__screen {
    height: 240px;
  }

  .laptop__overlay {
    left: 18px;
    right: auto;
    bottom: 18px;
    width: 220px;
  }

  .smart-course__button {
    left: 0;
    right: auto;
  }
}
</style>
