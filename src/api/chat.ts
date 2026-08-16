import type { ChatMessage, ChatRoom } from "@/types/chat";
import { httpGet, httpPost } from "./http";

function unwrap<T>(res: { success: boolean; message: string; data: T }, fallback: string): T {
  if (!res.success) throw new Error(res.message || fallback);
  return res.data;
}

export async function createChatRoom(userId: string): Promise<ChatRoom> {
  const res = await httpPost<ChatRoom>("/api/chats/rooms", { userId });
  return unwrap(res, "채팅방을 만들 수 없습니다.");
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const res = await httpGet<ChatRoom[]>("/api/chats/rooms");
  return unwrap(res, "채팅 목록을 불러올 수 없습니다.");
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  const res = await httpGet<ChatMessage[]>(`/api/chats/rooms/${roomId}/messages`);
  return unwrap(res, "메시지를 불러올 수 없습니다.");
}

export async function markChatRoomAsRead(roomId: string): Promise<void> {
  const res = await httpPost<null>(`/api/chats/rooms/${roomId}/read`);
  unwrap(res, "읽음 처리에 실패했습니다.");
}

export async function sendChatMessage(
  roomId: string,
  type: "TEXT" | "IMAGE" | "COURSE",
  content: string,
): Promise<ChatMessage> {
  const res = await httpPost<ChatMessage>(`/api/chats/rooms/${roomId}/messages`, {
    type,
    content,
  });
  return unwrap(res, "메시지를 보낼 수 없습니다.");
}
