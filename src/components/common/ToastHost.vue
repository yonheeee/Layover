<script setup lang="ts">
import { CheckCircle2, Info, X, XCircle } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";

const { toasts, dismiss } = useToast();

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;
</script>

<template>
  <div class="toast-host" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="item in toasts"
        :key="item.id"
        class="toast"
        :class="`toast--${item.type}`"
      >
        <component :is="ICONS[item.type]" :size="18" stroke-width="2.2" />
        <p class="toast__message">{{ item.message }}</p>
        <button
          type="button"
          class="toast__close"
          aria-label="알림 닫기"
          @click="dismiss(item.id)"
        >
          <X :size="14" stroke-width="2.4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 24px;
  left: 50%;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  transform: translateX(-50%);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 260px;
  max-width: min(92vw, 420px);
  padding: 12px 14px;
  border: 1px solid #dcece9;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(20, 60, 55, 0.16);
  pointer-events: auto;
}

.toast--success {
  border-color: #b9e4d9;
  color: #1c6b5f;
}

.toast--error {
  border-color: #f3c8c8;
  color: #a33a3a;
}

.toast--info {
  border-color: #cfe0f5;
  color: #2b5b8f;
}

.toast__message {
  flex: 1;
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.45;
  color: #24403c;
  word-break: keep-all;
}

.toast__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #8aa3a0;
  cursor: pointer;
}

.toast__close:hover {
  background: #f1f7f6;
  color: #4a6a66;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 640px) {
  .toast-host {
    top: 12px;
    width: 100%;
    padding: 0 12px;
  }

  .toast {
    min-width: 0;
    width: 100%;
  }
}
</style>
