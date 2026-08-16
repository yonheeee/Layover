export interface ChatRoom {
  id: string;
  otherUserId: string;
  otherUsername: string;
  otherProfileImage?: string | null;
  lastMessage?: string | null;
  lastMessageType?: "TEXT" | "IMAGE" | "COURSE" | string | null;
  lastMessageSenderId?: string | null;
  unreadCount: number;
  updatedAt?: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  type: "TEXT" | "IMAGE" | "COURSE" | string;
  content: string;
  createdAt: string;
}

export interface ChatEvent {
  roomId: string;
  message: ChatMessage;
}

export interface ReportItem {
  id: string;
  reportedUserId: string;
  reportedUsername: string;
  content: string;
  status: "RECEIVED" | "REVIEWING" | "COMPLETED" | string;
  createdAt: string;
}
