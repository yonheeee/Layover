import { readonly, ref } from "vue";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const DEFAULT_DURATION_MS = 3000;

/**
 * 앱 전체가 공유하는 토스트 큐.
 *
 * <p>컴포넌트 바깥(모듈 스코프)에 두어 어디서든 `toast.error(...)` 한 줄로 쓸 수 있게 했다.
 * 컴포넌트마다 setup에서 주입받게 하면 기존 alert() 호출 지점을 바꾸는 비용이 커진다.
 * 화면 출력은 App.vue에 한 번 올라가는 ToastHost가 담당한다.
 */
const items = ref<ToastItem[]>([]);
let nextId = 0;
const timers = new Map<number, number>();

function push(type: ToastType, message: string, durationMs = DEFAULT_DURATION_MS) {
  if (!message) return;

  const id = ++nextId;
  items.value.push({ id, type, message });

  const timer = window.setTimeout(() => dismiss(id), durationMs);
  timers.set(id, timer);
}

function dismiss(id: number) {
  const timer = timers.get(id);
  if (timer !== undefined) {
    window.clearTimeout(timer);
    timers.delete(id);
  }
  items.value = items.value.filter((item) => item.id !== id);
}

export const toast = {
  success: (message: string, durationMs?: number) => push("success", message, durationMs),
  error: (message: string, durationMs?: number) => push("error", message, durationMs),
  info: (message: string, durationMs?: number) => push("info", message, durationMs),
  dismiss,
};

export function useToast() {
  return {
    toasts: readonly(items),
    toast,
    dismiss,
  };
}
