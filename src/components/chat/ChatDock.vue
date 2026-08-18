<script setup lang="ts">
import { toast } from "@/composables/useToast";
import {
  createChatRoom,
  getChatMessages,
  getChatRooms,
  markChatRoomAsRead,
  sendChatMessage,
} from "@/api/chat";
import { uploadPostImage } from "@/api/community";
import { getMyCourses, type SavedCourseResponse } from "@/api/courses";
import { createReport } from "@/api/reports";
import { useAuthStore } from "@/stores/auth";
import type { ChatEvent, ChatMessage, ChatRoom } from "@/types/chat";
import { resolveMediaUrl } from "@/utils/media";
import { ChevronLeft, Download, Flag, ImagePlus, Info, MessageCircle, Route, Send, X } from "lucide-vue-next";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

type UserTarget = {
  userId: string;
  username: string;
  profileImage?: string | null;
};

type SharedCoursePayload = {
  id: string;
  subTitle: string;
  travelMode: string;
  durationMinutes: number;
  places: { id?: string; name: string; category?: string }[];
};

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const isOpen = ref(false);
const rooms = ref<ChatRoom[]>([]);
const selectedRoom = ref<ChatRoom | null>(null);
const messages = ref<ChatMessage[]>([]);
const draft = ref("");
const firstUnreadMessageId = ref<string | null>(null);
const expandedCourseMessageIds = ref<Set<string>>(new Set());
const isLoadingRooms = ref(false);
const isLoadingMessages = ref(false);
const isSending = ref(false);
const isCoursePickerOpen = ref(false);
const isLoadingCourses = ref(false);
const isSendingCourse = ref(false);
const myCourses = ref<SavedCourseResponse[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const messageInputRef = ref<HTMLInputElement | null>(null);
const messageListRef = ref<HTMLDivElement | null>(null);
const eventSource = ref<EventSource | null>(null);
let eventReconnectTimer: number | null = null;

const reportTarget = ref<UserTarget | null>(null);
const reportContent = ref("");
const isReporting = ref(false);
const previewImageUrl = ref<string | null>(null);
const isDownloadingImage = ref(false);

const TOUR_STORAGE_BY_KEY: Record<string, string> = {
  home: "layover-tour-home-v1",
  community: "layover-tour-community-v1",
  course: "layover-tour-course-v1",
  stamp: "layover-tour-stamp-v1",
};

const isLoggedIn = computed(() => auth.isLoggedIn);
const totalUnreadCount = computed(() =>
  rooms.value.reduce((sum, room) => sum + Math.max(room.unreadCount ?? 0, 0), 0),
);
const shouldPulseDockButton = computed(() => !isOpen.value && totalUnreadCount.value > 0);
const currentTourKey = computed(() => {
  if (route.path === "/") return "home";
  if (route.path.startsWith("/community")) return "community";
  if (route.path === "/map" || route.path === "/courses/result") return "course";
  if (route.path === "/stamp-tour") return "stamp";
  return null;
});
const hasCurrentPageTour = computed(() => currentTourKey.value !== null);

async function openDock() {
  if (!isLoggedIn.value) {
    toast.info("로그인이 필요합니다.");
    return;
  }
  selectedRoom.value = null;
  messages.value = [];
  firstUnreadMessageId.value = null;
  isOpen.value = true;
  await fetchRooms();
  markVisibleRoomAsRead();
}

function runCurrentPageTour() {
  const tour = currentTourKey.value;
  if (!tour) return;
  localStorage.removeItem(TOUR_STORAGE_BY_KEY[tour]);
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      tour,
      run: Date.now().toString(),
    },
  });
}

async function fetchRooms() {
  if (!isLoggedIn.value || isLoadingRooms.value) return;
  isLoadingRooms.value = true;
  try {
    rooms.value = await getChatRooms();
    if (selectedRoom.value) {
      selectedRoom.value =
        rooms.value.find((room) => room.id === selectedRoom.value?.id) ?? selectedRoom.value;
    }
  } catch {
    rooms.value = [];
  } finally {
    isLoadingRooms.value = false;
  }
}

async function selectRoom(room: ChatRoom) {
  const unreadCount = Math.max(room.unreadCount ?? 0, 0);
  selectedRoom.value = room;
  isLoadingMessages.value = true;
  try {
    messages.value = await getChatMessages(room.id);
    firstUnreadMessageId.value = findFirstUnreadMessageId(unreadCount);
    isLoadingMessages.value = false;
    if (firstUnreadMessageId.value) {
      await scrollToFirstUnread();
    } else {
      await scrollToBottom();
    }
    await markRoomAsRead(room.id);
    messageInputRef.value?.focus();
  } catch {
    messages.value = [];
    firstUnreadMessageId.value = null;
    isLoadingMessages.value = false;
  }
}

async function openChat(target: UserTarget) {
  if (!isLoggedIn.value) {
    toast.info("로그인이 필요합니다.");
    return;
  }
  try {
    const room = await createChatRoom(target.userId);
    isOpen.value = true;
    await fetchRooms();
    await selectRoom(rooms.value.find((item) => item.id === room.id) ?? room);
  } catch (error: any) {
    toast.error(error?.message ?? "채팅을 시작할 수 없습니다.");
  }
}

async function sendText() {
  const text = draft.value.trim();
  if (!selectedRoom.value || !text || isSending.value) return;
  isSending.value = true;
  try {
    const message = await sendChatMessage(selectedRoom.value.id, "TEXT", text);
    appendMessage(message);
    draft.value = "";
    await fetchRooms();
    await scrollToBottom();
  } catch {
    toast.error("메시지 전송에 실패했습니다.");
  } finally {
    isSending.value = false;
    await nextTick();
    messageInputRef.value?.focus();
  }
}

function triggerImageUpload() {
  fileInput.value?.click();
}

async function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = "";
  if (!file || !selectedRoom.value || isSending.value) return;
  isSending.value = true;
  try {
    const imageUrl = await uploadPostImage(file);
    const message = await sendChatMessage(selectedRoom.value.id, "IMAGE", imageUrl);
    appendMessage(message);
    await fetchRooms();
    await scrollToBottom();
  } catch {
    toast.error("사진 전송에 실패했습니다.");
  } finally {
    isSending.value = false;
  }
}

async function openCoursePicker() {
  if (!selectedRoom.value || isLoadingCourses.value) return;
  isCoursePickerOpen.value = true;
  if (myCourses.value.length > 0) return;
  isLoadingCourses.value = true;
  try {
    myCourses.value = await getMyCourses();
  } catch {
    myCourses.value = [];
  } finally {
    isLoadingCourses.value = false;
  }
}

async function sendCourse(course: SavedCourseResponse) {
  if (!selectedRoom.value || isSendingCourse.value) return;
  isSendingCourse.value = true;
  try {
    const message = await sendChatMessage(
      selectedRoom.value.id,
      "COURSE",
      JSON.stringify(toSharedCoursePayload(course)),
    );
    appendMessage(message);
    isCoursePickerOpen.value = false;
    await fetchRooms();
    await scrollToBottom();
  } catch {
    toast.error("코스 공유에 실패했습니다.");
  } finally {
    isSendingCourse.value = false;
    await nextTick();
    messageInputRef.value?.focus();
  }
}

function appendMessage(message: ChatMessage) {
  if (!messages.value.some((item) => item.id === message.id)) {
    messages.value.push(message);
  }
}

function findFirstUnreadMessageId(unreadCount: number) {
  if (unreadCount <= 0 || messages.value.length === 0) return null;
  const unreadStartIndex = Math.max(messages.value.length - unreadCount, 0);
  return messages.value[unreadStartIndex]?.id ?? null;
}

function clearRoomUnread(roomId: string) {
  rooms.value = rooms.value.map((room) =>
    room.id === roomId ? { ...room, unreadCount: 0 } : room,
  );
  if (selectedRoom.value?.id === roomId) {
    selectedRoom.value = { ...selectedRoom.value, unreadCount: 0 };
  }
}

async function markRoomAsRead(roomId: string) {
  clearRoomUnread(roomId);
  try {
    await markChatRoomAsRead(roomId);
  } catch {
    // 읽음 처리 실패는 채팅 사용을 막지 않습니다. 다음 메시지 조회 때 다시 갱신됩니다.
  }
}

function markVisibleRoomAsRead() {
  if (isOpen.value && selectedRoom.value) {
    void markRoomAsRead(selectedRoom.value.id);
  }
}

async function scrollToBottom() {
  await waitForMessageListPaint();
  const el = messageListRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
  window.setTimeout(() => {
    el.scrollTop = el.scrollHeight;
  }, 80);
}

async function scrollToFirstUnread() {
  await waitForMessageListPaint();
  const list = messageListRef.value;
  const targetId = firstUnreadMessageId.value;
  if (!list || !targetId) return;
  const target = list.querySelector<HTMLElement>(`[data-message-id="${targetId}"]`);
  if (!target) {
    list.scrollTop = list.scrollHeight;
    return;
  }
  list.scrollTop = Math.max(0, target.offsetTop - 12);
  window.setTimeout(() => {
    list.scrollTop = Math.max(0, target.offsetTop - 12);
  }, 80);
}

async function waitForMessageListPaint() {
  await nextTick();
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function openReport(target: UserTarget) {
  if (!isLoggedIn.value) {
    toast.info("로그인이 필요합니다.");
    return;
  }
  reportTarget.value = target;
  reportContent.value = "";
}

async function submitReport() {
  if (!reportTarget.value || !reportContent.value.trim() || isReporting.value) return;
  isReporting.value = true;
  try {
    await createReport(reportTarget.value.userId, reportContent.value.trim());
    reportTarget.value = null;
    reportContent.value = "";
    window.dispatchEvent(new CustomEvent("layover:reports-updated"));
    toast.success("신고가 접수되었습니다.");
  } catch (error: any) {
    toast.error(error?.message ?? "신고 접수에 실패했습니다.");
  } finally {
    isReporting.value = false;
  }
}

function connectEvents() {
  if (!isLoggedIn.value || eventSource.value) return;
  const token = localStorage.getItem("accessToken");
  if (!token) return;
  clearEventReconnectTimer();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const source = new EventSource(`${baseUrl}/api/chats/events?token=${encodeURIComponent(token)}`);
  source.addEventListener("message", (event) => {
    void handleChatEvent(event);
  });
  source.onerror = () => {
    source.close();
    eventSource.value = null;
    scheduleEventReconnect();
  };
  eventSource.value = source;
}

function scheduleEventReconnect() {
  if (!isLoggedIn.value || eventReconnectTimer !== null) return;
  eventReconnectTimer = window.setTimeout(() => {
    eventReconnectTimer = null;
    connectEvents();
  }, 2500);
}

async function handleChatEvent(event: MessageEvent) {
  const payload = JSON.parse(event.data) as ChatEvent;
  const isVisibleRoom = isOpen.value && selectedRoom.value?.id === payload.roomId;

  if (isVisibleRoom) {
    appendMessage(payload.message);
    await scrollToBottom();
    await markRoomAsRead(payload.roomId);
    await fetchRooms();
    clearRoomUnread(payload.roomId);
    return;
  }

  await fetchRooms();
}

function closeEvents() {
  clearEventReconnectTimer();
  eventSource.value?.close();
  eventSource.value = null;
}

function clearEventReconnectTimer() {
  if (eventReconnectTimer === null) return;
  window.clearTimeout(eventReconnectTimer);
  eventReconnectTimer = null;
}

function reconnectEventsIfNeeded() {
  if (isLoggedIn.value && !eventSource.value) {
    connectEvents();
  }
}

function onVisibilityChange() {
  if (document.visibilityState === "visible") {
    reconnectEventsIfNeeded();
  }
}

function onOpenChat(event: Event) {
  const detail = (event as CustomEvent<UserTarget>).detail;
  if (detail?.userId) openChat(detail);
}

function onOpenReport(event: Event) {
  const detail = (event as CustomEvent<UserTarget>).detail;
  if (detail?.userId) openReport(detail);
}

function formatTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMessageDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function messageDateKey(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function shouldShowDateDivider(message: ChatMessage, index: number) {
  if (index === 0) return true;
  return messageDateKey(message.createdAt) !== messageDateKey(messages.value[index - 1]?.createdAt);
}

function formatRoomTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "");
}

function formatTravelMode(mode?: string | null) {
  return mode === "WALK" ? "도보" : "택시";
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "시간 정보 없음";
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  if (hour > 0 && minute > 0) return `${hour}시간 ${minute}분`;
  if (hour > 0) return `${hour}시간`;
  return `${minute}분`;
}

function toSharedCoursePayload(course: SavedCourseResponse): SharedCoursePayload {
  return {
    id: course.id,
    subTitle: course.subTitle || "나의 대전 코스",
    travelMode: course.travelMode,
    durationMinutes: course.durationMinutes,
    places: course.places.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
    })),
  };
}

function parseSharedCourse(content: string): SharedCoursePayload | null {
  try {
    const parsed = JSON.parse(content) as Partial<SharedCoursePayload>;
    if (!parsed || typeof parsed !== "object") return null;
    const hasCourseShape =
      "subTitle" in parsed ||
      "travelMode" in parsed ||
      "durationMinutes" in parsed ||
      "places" in parsed;
    if (!hasCourseShape) return null;
    return {
      id: String(parsed.id ?? ""),
      subTitle: String(parsed.subTitle ?? "공유한 대전 코스"),
      travelMode: String(parsed.travelMode ?? "TAXI"),
      durationMinutes: Number(parsed.durationMinutes ?? 0),
      places: Array.isArray(parsed.places) ? parsed.places
        .filter((place) => place?.name)
        .map((place) => ({
          id: place.id ? String(place.id) : undefined,
          name: String(place.name),
          category: place.category ? String(place.category) : undefined,
        })) : [],
    };
  } catch {
    return null;
  }
}

function isCourseMessage(message: ChatMessage) {
  return message.type === "COURSE" || parseSharedCourse(message.content) !== null;
}

function sharedCourseTitle(content: string) {
  return parseSharedCourse(content)?.subTitle || "공유한 대전 코스";
}

function sharedCourseMeta(content: string) {
  const course = parseSharedCourse(content);
  if (!course) return "코스 정보";
  return `${formatTravelMode(course.travelMode)} · ${formatDuration(course.durationMinutes)}`;
}

function sharedCoursePlaces(content: string) {
  return parseSharedCourse(content)?.places ?? [];
}

function formatRoomLastMessage(room: ChatRoom) {
  if (room.lastMessageType === "IMAGE") return "사진을 보냈습니다.";
  if (room.lastMessageType === "COURSE") return "코스를 공유했습니다.";
  if (room.lastMessage && parseSharedCourse(room.lastMessage)) return "코스를 공유했습니다.";
  return room.lastMessage || "대화를 시작해보세요.";
}

function sharedCoursePreview(content: string) {
  const places = sharedCoursePlaces(content);
  if (places.length === 0) return "장소 정보가 없는 코스";
  return places.slice(0, 3).map((place) => place.name).join(" · ");
}

function isCourseExpanded(messageId: string) {
  return expandedCourseMessageIds.value.has(messageId);
}

function toggleCourseDetail(messageId: string) {
  const next = new Set(expandedCourseMessageIds.value);
  if (next.has(messageId)) {
    next.delete(messageId);
  } else {
    next.add(messageId);
  }
  expandedCourseMessageIds.value = next;
}

function openImagePreview(url: string) {
  previewImageUrl.value = resolveMediaUrl(url);
}

function imageDownloadName(url: string) {
  const path = url.split("?")[0] ?? "";
  const filename = path.split("/").filter(Boolean).pop();
  return filename || "layover-chat-image";
}

async function downloadPreviewImage() {
  if (!previewImageUrl.value || isDownloadingImage.value) return;
  isDownloadingImage.value = true;
  try {
    const response = await fetch(previewImageUrl.value);
    if (!response.ok) throw new Error("download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = imageDownloadName(previewImageUrl.value);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(previewImageUrl.value, "_blank", "noopener,noreferrer");
  } finally {
    isDownloadingImage.value = false;
  }
}

watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      fetchRooms();
      connectEvents();
    } else {
      rooms.value = [];
      selectedRoom.value = null;
      messages.value = [];
      closeEvents();
    }
  },
);

watch(isOpen, (open) => {
  if (open) markVisibleRoomAsRead();
});

watch(
  () => route.fullPath,
  () => {
    if (isOpen.value) {
      isOpen.value = false;
    }
  },
);

onMounted(() => {
  window.addEventListener("layover:open-chat", onOpenChat);
  window.addEventListener("layover:open-report", onOpenReport);
  window.addEventListener("online", reconnectEventsIfNeeded);
  document.addEventListener("visibilitychange", onVisibilityChange);
  if (isLoggedIn.value) {
    fetchRooms();
    connectEvents();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("layover:open-chat", onOpenChat);
  window.removeEventListener("layover:open-report", onOpenReport);
  window.removeEventListener("online", reconnectEventsIfNeeded);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  closeEvents();
});
</script>

<template>
  <Teleport to="body">
    <button
      v-if="hasCurrentPageTour && !isOpen"
      class="chat-dock-button chat-dock-button--info"
      type="button"
      aria-label="현재 페이지 튜토리얼"
      title="현재 페이지 튜토리얼"
      @click="runCurrentPageTour"
    >
      <Info :size="21" />
    </button>

    <button
      v-if="!isOpen"
      class="chat-dock-button"
      :class="{
        'chat-dock-button--pulse': shouldPulseDockButton,
        'chat-dock-button--locked': !isLoggedIn,
      }"
      type="button"
      aria-label="채팅"
      :title="isLoggedIn ? '채팅' : '로그인 후 채팅을 사용할 수 있습니다'"
      @click="openDock"
    >
      <MessageCircle :size="22" />
      <span v-if="totalUnreadCount > 0" class="chat-dock-dot">
        {{ totalUnreadCount > 9 ? "9+" : totalUnreadCount }}
      </span>
    </button>

    <div v-if="isOpen" class="chat-dock-backdrop" @click.self="isOpen = false">
      <section class="chat-dock-panel" aria-label="채팅" @click="markVisibleRoomAsRead">
        <div v-if="!selectedRoom" class="chat-dock-sidebar">
          <div class="chat-dock-header">
            <div>
              <p class="chat-dock-kicker">Messages</p>
              <h2>채팅</h2>
            </div>
            <button type="button" class="chat-icon-button" @click="isOpen = false">
              <X :size="18" />
            </button>
          </div>

          <div v-if="isLoadingRooms" class="chat-empty">불러오는 중...</div>
          <div v-else-if="rooms.length === 0" class="chat-empty">대화가 없습니다.</div>
          <template v-else>
            <button
              v-for="room in rooms"
              :key="room.id"
              type="button"
              class="chat-room-row"
              :class="{ 'chat-room-row--active': selectedRoom?.id === room.id }"
              @click="selectRoom(room)"
            >
              <div class="chat-avatar">
                <img v-if="room.otherProfileImage" :src="room.otherProfileImage" alt="" />
                <span v-else>{{ room.otherUsername.charAt(0) }}</span>
              </div>
              <div class="chat-room-meta">
                <div class="chat-room-line">
                  <strong>{{ room.otherUsername }}</strong>
                  <small>{{ formatRoomTime(room.updatedAt) }}</small>
                </div>
                <p>{{ formatRoomLastMessage(room) }}</p>
              </div>
              <span v-if="room.unreadCount > 0" class="chat-unread">{{ room.unreadCount }}</span>
            </button>
          </template>
        </div>

        <div v-else class="chat-dock-thread">
          <div class="chat-thread-header">
            <button type="button" class="chat-back-button" aria-label="대화 목록으로 돌아가기" @click="selectedRoom = null">
              <ChevronLeft :size="20" />
            </button>
            <div class="chat-avatar">
              <img v-if="selectedRoom?.otherProfileImage" :src="selectedRoom.otherProfileImage" alt="" />
              <span v-else>{{ selectedRoom?.otherUsername.charAt(0) }}</span>
            </div>
            <strong>{{ selectedRoom?.otherUsername }}</strong>
            <button type="button" class="chat-icon-button chat-thread-close-button" @click="isOpen = false">
              <X :size="18" />
            </button>
          </div>

          <div ref="messageListRef" class="chat-message-list">
            <div v-if="isLoadingMessages" class="chat-empty">불러오는 중...</div>
            <template v-else>
                <div
                  v-for="(message, messageIndex) in messages"
                  :key="message.id"
                  class="chat-message"
                  :class="{ 'chat-message--mine': message.senderId === auth.userId }"
                  :data-message-id="message.id"
                >
                  <div
                    v-if="shouldShowDateDivider(message, messageIndex)"
                    class="chat-date-divider"
                  >
                    <span>{{ formatMessageDate(message.createdAt) }}</span>
                  </div>
                  <div v-if="message.id === firstUnreadMessageId" class="chat-unread-divider">
                    <span>읽지 않은 메시지</span>
                  </div>
                  <div class="chat-message-row">
                    <small
                      v-if="message.senderId === auth.userId"
                      class="chat-message-time"
                    >
                      {{ formatTime(message.createdAt) }}
                    </small>
                    <div
                      class="chat-bubble"
                      :class="{
                        'chat-bubble--image': message.type === 'IMAGE',
                        'chat-bubble--course': isCourseMessage(message),
                      }"
                    >
                      <button
                        v-if="message.type === 'IMAGE'"
                        type="button"
                        class="chat-image-thumb"
                        @click="openImagePreview(message.content)"
                      >
                        <img
                          :src="resolveMediaUrl(message.content)"
                          alt="채팅 이미지"
                          class="chat-message-image"
                        />
                      </button>
                      <button
                        v-else-if="isCourseMessage(message)"
                        type="button"
                        class="chat-course-card"
                        @click="toggleCourseDetail(message.id)"
                      >
                        <p>공유한 코스</p>
                        <strong>{{ sharedCourseTitle(message.content) }}</strong>
                        <span>{{ sharedCourseMeta(message.content) }}</span>
                        <em>{{ sharedCoursePreview(message.content) }}</em>
                        <div
                          v-if="isCourseExpanded(message.id)"
                          class="chat-course-places chat-course-places--detail"
                        >
                          <template
                            v-for="(place, placeIndex) in sharedCoursePlaces(message.content)"
                            :key="`${message.id}-${placeIndex}`"
                          >
                            <span>
                              <b>{{ placeIndex + 1 }}</b>
                              {{ place.name }}
                            </span>
                          </template>
                        </div>
                        <small>
                          {{ isCourseExpanded(message.id) ? "접기" : "자세히 보기" }}
                        </small>
                      </button>
                      <span v-else>{{ message.content }}</span>
                    </div>
                    <small
                      v-if="message.senderId !== auth.userId"
                      class="chat-message-time"
                    >
                      {{ formatTime(message.createdAt) }}
                    </small>
                  </div>
                </div>
            </template>
          </div>

          <div v-if="isCoursePickerOpen" class="chat-course-picker">
            <div class="chat-course-picker-header">
              <strong>공유할 코스 선택</strong>
              <button type="button" class="chat-course-close" @click="isCoursePickerOpen = false">
                <X :size="15" />
              </button>
            </div>
            <div v-if="isLoadingCourses" class="chat-course-empty">코스를 불러오는 중...</div>
            <div v-else-if="myCourses.length === 0" class="chat-course-empty">저장된 코스가 없습니다.</div>
            <template v-else>
              <button
                v-for="course in myCourses"
                :key="course.id"
                type="button"
                class="chat-course-option"
                :disabled="isSendingCourse"
                @click="sendCourse(course)"
              >
                <strong>{{ course.subTitle || "나의 대전 코스" }}</strong>
                <span>{{ formatTravelMode(course.travelMode) }} · {{ formatDuration(course.durationMinutes) }}</span>
                <em>{{ course.places.map((place) => place.name).join(" · ") }}</em>
              </button>
            </template>
          </div>

          <div class="chat-composer">
            <button type="button" class="chat-icon-button" :disabled="isSending || isSendingCourse" @click="openCoursePicker">
              <Route :size="18" />
            </button>
            <button type="button" class="chat-icon-button" :disabled="isSending || isSendingCourse" @click="triggerImageUpload">
              <ImagePlus :size="18" />
            </button>
              <input
                ref="messageInputRef"
                v-model="draft"
                :disabled="isSending || isSendingCourse"
                placeholder="메시지 입력..."
              @keydown.enter="sendText"
            />
            <button type="button" class="chat-send-button" :disabled="isSending || !draft.trim()" @click="sendText">
              <Send :size="17" />
            </button>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
          </div>
        </div>
      </section>
    </div>

    <div v-if="reportTarget" class="report-modal-backdrop" @click.self="reportTarget = null">
      <section class="report-modal">
        <div class="report-modal-header">
          <div>
            <p class="chat-dock-kicker">Report</p>
            <h2>{{ reportTarget.username }} 신고</h2>
          </div>
          <button type="button" class="chat-icon-button" @click="reportTarget = null">
            <X :size="18" />
          </button>
        </div>
        <textarea
          v-model="reportContent"
          rows="5"
          placeholder="신고 내용을 입력해주세요."
        />
        <button
          type="button"
          class="report-submit-button"
          :disabled="isReporting || !reportContent.trim()"
          @click="submitReport"
        >
          <Flag :size="15" /> 신고 접수
        </button>
      </section>
    </div>

    <div
      v-if="previewImageUrl"
      class="chat-image-preview-backdrop"
      @click.self="previewImageUrl = null"
    >
      <section class="chat-image-preview" aria-label="채팅 이미지 원본 보기">
        <div class="chat-image-preview-header">
          <strong>사진 보기</strong>
          <div>
            <button
              class="chat-image-download"
              type="button"
              :disabled="isDownloadingImage"
              @click="downloadPreviewImage"
            >
              <Download :size="17" />
              {{ isDownloadingImage ? "저장 중" : "저장" }}
            </button>
            <button type="button" class="chat-icon-button" @click="previewImageUrl = null">
              <X :size="18" />
            </button>
          </div>
        </div>
        <div class="chat-image-preview-body">
          <img :src="previewImageUrl" alt="채팅 이미지 원본" />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.chat-dock-button {
  position: fixed;
  right: var(--floating-content-right);
  bottom: 22px;
  z-index: 80;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(135deg, #3db89e, #2d9a85);
  box-shadow: 0 14px 28px rgba(26, 46, 43, 0.22);
}

.chat-dock-button--info {
  bottom: 86px;
  color: #2d9a85;
  background: #ffffff;
  border: 1px solid rgba(178, 228, 220, 0.72);
  box-shadow: 0 12px 24px rgba(26, 46, 43, 0.16);
}

.chat-dock-button--pulse {
  animation: chat-dock-pulse 1.2s ease-in-out infinite;
}

.chat-dock-button--locked {
  opacity: 0.92;
}

.chat-dock-dot {
  position: absolute;
  top: 6px;
  right: 5px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 50%;
  background: #ff6b6b;
  border: 2px solid #fff;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 900;
  line-height: 1;
}

.chat-dock-backdrop,
.report-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding:
    22px var(--floating-content-right)
    22px 22px;
  overflow: hidden;
  background: rgba(18, 35, 32, 0.26);
}

.chat-dock-panel {
  width: min(380px, 100%);
  height: min(620px, 100%);
  max-width: 100%;
  max-height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(178, 228, 220, 0.7);
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(26, 46, 43, 0.18);
}

.chat-dock-sidebar {
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: #f8fbfa;
  overflow-y: auto;
}

.chat-dock-header,
.chat-thread-header,
.report-modal-header {
  flex-shrink: 0;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(178, 228, 220, 0.45);
}

.chat-dock-kicker {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 900;
  color: #3db89e;
  text-transform: uppercase;
}

.chat-dock-header h2,
.report-modal h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 900;
  color: #123d35;
}

.chat-icon-button,
.chat-send-button {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #3db89e;
  background: #e8f8f5;
  flex-shrink: 0;
}

.chat-send-button {
  color: #fff;
  background: #3db89e;
}

.chat-icon-button:disabled,
.chat-send-button:disabled,
.report-submit-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.chat-room-row {
  width: 100%;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 0;
  border-bottom: 1px solid rgba(178, 228, 220, 0.24);
  background: transparent;
  text-align: left;
}

.chat-room-row--active {
  background: #e8f8f5;
}

.chat-avatar {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 900;
  background: linear-gradient(135deg, #b2e4dc, #3db89e);
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-room-meta {
  min-width: 0;
}

.chat-room-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.chat-room-line strong {
  overflow: hidden;
  color: #123d35;
  font-size: 0.88rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-room-line small,
.chat-message-time {
  color: #9ca3af;
  font-size: 0.68rem;
}

.chat-room-meta p {
  margin: 2px 0 0;
  overflow: hidden;
  color: #7a8f8b;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-unread {
  min-width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 999px;
  color: #fff;
  background: #3db89e;
  font-size: 0.68rem;
  font-weight: 900;
}

.chat-dock-thread {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-thread-header {
  justify-content: flex-start;
}

.chat-back-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #3db89e;
  background: #e8f8f5;
}

.chat-thread-header strong {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #123d35;
  font-size: 0.94rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-thread-close-button {
  margin-left: auto;
}

.chat-message-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding: 18px;
  background: #fcfffe;
}

.chat-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.chat-message--mine {
  align-items: flex-end;
}

.chat-date-divider {
  align-self: stretch;
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 8px 0 6px;
}

.chat-date-divider span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 11px;
  border-radius: 999px;
  color: #5f7772;
  background: #e8f3f0;
  font-size: 0.72rem;
  font-weight: 900;
  line-height: 1;
}

.chat-message-row {
  max-width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.chat-message--mine .chat-message-row {
  justify-content: flex-end;
}

.chat-message-time {
  flex: 0 0 auto;
  margin-bottom: 2px;
  line-height: 1;
  white-space: nowrap;
}

.chat-unread-divider {
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 4px 0 8px;
  color: #2d9a85;
  font-size: 0.68rem;
  font-weight: 900;
}

.chat-unread-divider::before,
.chat-unread-divider::after {
  flex: 1;
  height: 1px;
  background: rgba(61, 184, 158, 0.32);
  content: "";
}

.chat-unread-divider span {
  flex: 0 0 auto;
}

.chat-bubble {
  max-width: min(68%, 360px);
  padding: 10px 13px;
  border-radius: 18px;
  border-bottom-left-radius: 5px;
  color: #1f342f;
  background: #eef5f3;
  font-size: 0.88rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.chat-message--mine .chat-bubble {
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 18px;
  color: #fff;
  background: #3db89e;
}

.chat-bubble--image {
  max-width: none;
  padding: 5px;
  overflow: hidden;
  background: #3db89e;
}

.chat-message:not(.chat-message--mine) .chat-bubble--image {
  background: #eef5f3;
}

.chat-bubble--course {
  width: min(230px, 68vw);
  max-width: min(68%, 360px);
  padding: 0;
  overflow: hidden;
  color: #123d35;
  background: #ffffff;
  border: 1px solid rgba(178, 228, 220, 0.8);
  box-shadow: 0 10px 24px rgba(26, 46, 43, 0.08);
}

.chat-message--mine .chat-bubble--course {
  color: #123d35;
  background: #ffffff;
}

.chat-course-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 13px;
  border: 0;
  background: transparent;
  text-align: left;
}

.chat-course-card p {
  margin: 0;
  color: #3db89e;
  font-size: 0.68rem;
  font-weight: 900;
}

.chat-course-card strong {
  color: #123d35;
  font-size: 0.92rem;
  font-weight: 900;
  line-height: 1.35;
}

.chat-course-card > span {
  color: #6f8580;
  font-size: 0.72rem;
  font-weight: 800;
}

.chat-course-card em {
  overflow: hidden;
  color: #294a43;
  font-size: 0.78rem;
  font-style: normal;
  font-weight: 900;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-course-card small {
  align-self: flex-start;
  color: #3db89e;
  font-size: 0.7rem;
  font-weight: 900;
}

.chat-course-places {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  color: #294a43;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.4;
}

.chat-course-places i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #b2e4dc;
}

.chat-course-more {
  color: #3db89e;
}

.chat-course-places--detail {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  margin-top: 3px;
}

.chat-course-places--detail span {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.chat-course-places--detail b {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background: #3db89e;
  font-size: 0.62rem;
}

.chat-message-image {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
}

.chat-image-thumb {
  width: 180px;
  height: 180px;
  display: block;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: #fff;
}

.chat-image-preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(18, 35, 32, 0.72);
}

.chat-image-preview {
  width: min(920px, 100%);
  max-height: min(760px, 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
}

.chat-image-preview-header {
  flex-shrink: 0;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(178, 228, 220, 0.55);
}

.chat-image-preview-header strong {
  color: #123d35;
  font-size: 0.92rem;
  font-weight: 900;
}

.chat-image-preview-header > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-image-download {
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: #3db89e;
  font-size: 0.82rem;
  font-weight: 900;
  text-decoration: none;
}

.chat-image-download:disabled {
  opacity: 0.6;
  cursor: wait;
}

.chat-image-preview-body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 18px;
  background: #f8fbfa;
}

.chat-image-preview-body img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 140px);
  width: auto;
  height: auto;
  object-fit: contain;
}

.chat-course-picker {
  flex-shrink: 0;
  max-height: 230px;
  overflow-y: auto;
  padding: 12px 14px;
  border-top: 1px solid rgba(178, 228, 220, 0.45);
  background: #f8fbfa;
}

.chat-course-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  color: #123d35;
  font-size: 0.84rem;
  font-weight: 900;
}

.chat-course-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #3db89e;
  background: #e8f8f5;
}

.chat-course-empty {
  padding: 18px 0;
  color: #8aa09b;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 800;
}

.chat-course-option {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid rgba(178, 228, 220, 0.7);
  border-radius: 8px;
  background: #fff;
  text-align: left;
}

.chat-course-option + .chat-course-option {
  margin-top: 8px;
}

.chat-course-option strong {
  color: #123d35;
  font-size: 0.84rem;
  font-weight: 900;
}

.chat-course-option span {
  color: #3db89e;
  font-size: 0.72rem;
  font-weight: 900;
}

.chat-course-option em {
  overflow: hidden;
  color: #6f8580;
  font-size: 0.72rem;
  font-style: normal;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-composer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid rgba(178, 228, 220, 0.45);
  background: #fff;
}

.chat-composer input:not(.hidden) {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 13px;
  border: 1px solid rgba(178, 228, 220, 0.65);
  border-radius: 999px;
  background: #f8fbfa;
  color: #123d35;
  font-size: 0.88rem;
  outline: none;
}

.chat-empty,
.chat-thread-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #8aa09b;
  font-size: 0.84rem;
  font-weight: 700;
}

.chat-thread-empty {
  flex: 1;
  flex-direction: column;
  gap: 10px;
}

.report-modal-backdrop {
  align-items: center;
  justify-content: center;
  padding: 22px;
}

.report-modal {
  width: min(420px, 100%);
  max-height: 100%;
  overflow: hidden;
  border: 1px solid rgba(178, 228, 220, 0.7);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(26, 46, 43, 0.18);
}

.report-modal textarea {
  width: calc(100% - 32px);
  margin: 16px;
  padding: 12px;
  border: 1px solid rgba(178, 228, 220, 0.65);
  border-radius: 8px;
  color: #123d35;
  font-size: 0.88rem;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.report-submit-button {
  width: calc(100% - 32px);
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 0 16px 16px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  background: #3db89e;
  font-size: 0.86rem;
  font-weight: 900;
}

.hidden {
  display: none;
}

@keyframes chat-dock-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 14px 28px rgba(26, 46, 43, 0.22);
  }

  50% {
    transform: scale(1.08);
    box-shadow: 0 16px 34px rgba(61, 184, 158, 0.42);
  }
}

@media (max-width: 900px) and (min-width: 641px) {
  .chat-dock-panel {
    width: min(380px, 100%);
  }

  .chat-dock-backdrop {
    padding:
      18px var(--floating-content-right)
      18px 18px;
  }

  .chat-image-thumb {
    width: 172px;
    height: 172px;
  }
}

@media (max-width: 640px) {
  .chat-dock-button {
    right: var(--floating-content-right);
    bottom: var(--mobile-floating-bottom);
  }

  .chat-dock-button--info {
    bottom: var(--mobile-floating-info-bottom);
  }

  .chat-dock-backdrop {
    inset: 0 0 var(--mobile-bottom-nav-height) 0;
    z-index: 45;
    padding: 0;
  }

  .chat-dock-panel {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .chat-image-thumb {
    width: min(176px, 48vw);
    height: min(176px, 48vw);
  }

  .chat-image-preview-backdrop {
    padding: 0;
  }

  .chat-image-preview {
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
}
</style>
