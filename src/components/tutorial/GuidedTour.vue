<script setup lang="ts">
import { Check, MousePointerClick, X } from "lucide-vue-next";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

interface TourStep {
  selector: string;
  title: string;
  description: string;
}

const props = withDefaults(
  defineProps<{
    storageKey: string;
    steps: TourStep[];
    force?: boolean | string | number;
  }>(),
  { force: false },
);

const emit = defineEmits<{ complete: [] }>();

const active = ref(false);
const stepIndex = ref(0);
const targetRect = ref({ top: 0, left: 0, width: 0, height: 0 });
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipTop = ref(0);
const tooltipLeft = ref(0);
let targetElement: HTMLElement | null = null;
let retryTimer: number | null = null;
let positionTimer: number | null = null;

const currentStep = computed(() => props.steps[stepIndex.value]);
const viewportWidth = () => document.documentElement.clientWidth;
const viewportHeight = () => window.innerHeight;
const padding = 8;

const panels = computed(() => {
  const rect = targetRect.value;
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  return {
    top: { top: "0px", left: "0px", right: "0px", height: `${Math.max(0, rect.top)}px` },
    left: { top: `${rect.top}px`, left: "0px", width: `${Math.max(0, rect.left)}px`, height: `${rect.height}px` },
    right: { top: `${rect.top}px`, left: `${right}px`, width: `${Math.max(0, viewportWidth() - right)}px`, height: `${rect.height}px` },
    bottom: { top: `${bottom}px`, left: "0px", right: "0px", height: `${Math.max(0, viewportHeight() - bottom)}px` },
  };
});

function clearTimers() {
  if (retryTimer !== null) window.clearTimeout(retryTimer);
  if (positionTimer !== null) window.clearTimeout(positionTimer);
  retryTimer = null;
  positionTimer = null;
}

function setTargetRect() {
  if (!targetElement) return;
  const rect = targetElement.getBoundingClientRect();
  const top = Math.max(0, rect.top - padding);
  const left = Math.max(0, rect.left - padding);
  targetRect.value = {
    top,
    left,
    width: Math.min(viewportWidth() - left, rect.width + padding * 2),
    height: Math.min(viewportHeight() - top, rect.height + padding * 2),
  };
  nextTick(positionTooltip);
}

function positionTooltip() {
  if (!tooltipRef.value) return;
  const rect = targetRect.value;
  const tooltip = tooltipRef.value.getBoundingClientRect();
  const safe = 12;
  const gap = 16;
  const below = rect.top + rect.height + gap;
  const above = rect.top - tooltip.height - gap;

  tooltipTop.value =
    below + tooltip.height <= viewportHeight() - safe
      ? below
      : Math.max(safe, above);
  tooltipLeft.value = Math.min(
    Math.max(safe, rect.left + rect.width / 2 - tooltip.width / 2),
    viewportWidth() - tooltip.width - safe,
  );
}

function findTarget(attempt = 0) {
  clearTimers();
  const selector = currentStep.value?.selector;
  if (!selector) return finish();

  targetElement = document.querySelector<HTMLElement>(selector);
  if (!targetElement) {
    if (attempt < 25) {
      retryTimer = window.setTimeout(() => findTarget(attempt + 1), 120);
      return;
    }
    advance();
    return;
  }

  const rect = targetElement.getBoundingClientRect();
  if (rect.top < 76 || rect.bottom > viewportHeight() - 20) {
    targetElement.scrollIntoView({ block: "center", behavior: "smooth" });
    positionTimer = window.setTimeout(setTargetRect, 320);
    return;
  }
  setTargetRect();
}

function start() {
  if (!props.steps.length) return;
  if (!props.force && localStorage.getItem(props.storageKey) === "done") return;
  stepIndex.value = 0;
  active.value = true;
  nextTick(() => findTarget());
}

function finish() {
  clearTimers();
  active.value = false;
  targetElement = null;
  localStorage.setItem(props.storageKey, "done");
  emit("complete");
}

function advance() {
  if (stepIndex.value >= props.steps.length - 1) {
    finish();
    return;
  }
  stepIndex.value += 1;
  nextTick(() => findTarget());
}

function handleViewportChange() {
  if (active.value) setTargetRect();
}

watch(
  () => props.force,
  (forced, previous) => {
    if (forced && (forced !== previous || !active.value)) start();
  },
);

onMounted(() => {
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("scroll", handleViewportChange, true);
  start();
});

onBeforeUnmount(() => {
  clearTimers();
  window.removeEventListener("resize", handleViewportChange);
  window.removeEventListener("scroll", handleViewportChange, true);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="active" class="guided-tour" aria-live="polite">
      <div class="shade" :style="panels.top" />
      <div class="shade" :style="panels.left" />
      <div class="shade" :style="panels.right" />
      <div class="shade" :style="panels.bottom" />

      <button
        type="button"
        class="focus-ring"
        :aria-label="`${currentStep.title} 체험`"
        :style="{
          top: `${targetRect.top}px`,
          left: `${targetRect.left}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
        }"
        @click="advance"
      />

      <section
        ref="tooltipRef"
        class="tour-tip"
        role="dialog"
        aria-modal="true"
        :style="{ top: `${tooltipTop}px`, left: `${tooltipLeft}px` }"
      >
        <div class="tour-tip__top">
          <span>{{ stepIndex + 1 }} / {{ steps.length }}</span>
          <button type="button" aria-label="튜토리얼 건너뛰기" @click="finish">
            <X :size="17" />
          </button>
        </div>
        <div class="tour-tip__icon"><MousePointerClick :size="20" /></div>
        <h2>{{ currentStep.title }}</h2>
        <p>{{ currentStep.description }}</p>
        <div class="tour-tip__action">
          <span class="pulse-dot" />
          밝게 표시된 부분을 클릭해 보세요
        </div>
        <div class="tour-tip__progress">
          <i
            v-for="(_, index) in steps"
            :key="index"
            :class="{ active: index <= stepIndex }"
          />
        </div>
        <button class="tour-tip__skip" type="button" @click="finish">
          <Check :size="13" /> 안내 그만 보기
        </button>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.guided-tour { position: fixed; inset: 0; z-index: 9990; pointer-events: none; font-family: "Noto Sans KR", sans-serif; }
.shade { position: fixed; z-index: 9990; pointer-events: auto; background: rgba(8, 20, 18, 0.76); backdrop-filter: blur(1.5px); }
.focus-ring { position: fixed; z-index: 9991; padding: 0; border: 3px solid #7ee3cf; border-radius: 15px; background: transparent; box-shadow: 0 0 0 4px rgba(126,227,207,.2), 0 0 28px rgba(84,220,193,.55); pointer-events: auto; cursor: pointer; transition: top .22s ease,left .22s ease,width .22s ease,height .22s ease; }
.focus-ring::after { position: absolute; inset: -7px; border: 1px dashed rgba(255,255,255,.8); border-radius: 18px; content: ""; animation: ring-pulse 1.5s ease-in-out infinite; }
.tour-tip { position: fixed; z-index: 9993; width: min(350px, calc(100vw - 24px)); padding: 18px 19px 15px; border: 1px solid rgba(126,227,207,.45); border-radius: 20px; pointer-events: auto; background: #fff; box-shadow: 0 24px 65px rgba(0,0,0,.34); color: #17332e; transition: top .22s ease,left .22s ease; }
.tour-tip__top { display: flex; align-items: center; justify-content: space-between; }
.tour-tip__top > span { padding: 4px 9px; border-radius: 999px; background: #e8f8f5; color: #278a78; font-size: .68rem; font-weight: 900; }
.tour-tip__top button { display: grid; width: 28px; height: 28px; place-items: center; border: 0; border-radius: 50%; background: #f3f7f6; color: #78908b; cursor: pointer; }
.tour-tip__icon { display: grid; width: 42px; height: 42px; place-items: center; margin: 13px 0 10px; border-radius: 13px; background: linear-gradient(135deg,#dff7f2,#b9eadf); color: #268a78; }
.tour-tip h2 { margin: 0 0 7px; font-size: 1.03rem; font-weight: 900; line-height: 1.4; }
.tour-tip p { margin: 0; color: #667e79; font-size: .78rem; font-weight: 600; line-height: 1.65; }
.tour-tip__action { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding: 10px 11px; border-radius: 10px; background: #f1faf8; color: #277e70; font-size: .72rem; font-weight: 900; }
.pulse-dot { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: #3db89e; box-shadow: 0 0 0 0 rgba(61,184,158,.5); animation: dot-pulse 1.35s infinite; }
.tour-tip__progress { display: flex; gap: 5px; margin-top: 13px; }
.tour-tip__progress i { flex: 1; height: 3px; border-radius: 999px; background: #e4efed; }
.tour-tip__progress i.active { background: #3db89e; }
.tour-tip__skip { display: inline-flex; align-items: center; gap: 4px; margin-top: 11px; padding: 0; border: 0; background: transparent; color: #93a5a2; cursor: pointer; font-size: .66rem; font-weight: 700; }
@keyframes ring-pulse { 0%,100% { opacity:.45; transform:scale(1); } 50% { opacity:1; transform:scale(1.012); } }
@keyframes dot-pulse { 70% { box-shadow:0 0 0 7px rgba(61,184,158,0); } 100% { box-shadow:0 0 0 0 rgba(61,184,158,0); } }
@media (max-width: 520px) {
  .tour-tip { padding: 15px 16px 13px; border-radius: 17px; }
  .tour-tip__icon { width: 36px; height: 36px; margin: 9px 0 8px; }
  .tour-tip h2 { font-size: .92rem; }
  .tour-tip p { font-size: .72rem; }
}
@media (prefers-reduced-motion: reduce) { .focus-ring,.focus-ring::after,.pulse-dot,.tour-tip { animation:none; transition:none; } }
</style>
