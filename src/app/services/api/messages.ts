export const AUTH_BASE_URL = "https://clubverse.onrender.com";

/* =======================
   TYPES
======================= */

export type ConversationData = {
  _id: string;
  participantId: string;
  participantInfo?: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    isActive?: boolean;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
};

export type MessageData = {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
};

/* =======================
   RESPONSES
======================= */

export type GetConversationsResponse = {
  data?: ConversationData[];
  total?: number;
  page?: number;
  limit?: number;
};

export type GetMessagesResponse = {
  data?: MessageData[];
};

export type SendMessageResponse = {
  data?: MessageData;
};

/* =======================
   BASE REQUEST
======================= */

const jsonHeaders = {
  "Content-Type": "application/json",
  accept: "application/json",
};

function withBase(path: string) {
  return `${AUTH_BASE_URL}${path}`;
}

async function requestJson<T>(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(withBase(path), {
    ...init,
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");
  const data = text ? (JSON.parse(text) as T) : (undefined as T);

  if (!res.ok) {
    const message = (data as { message?: string } | undefined)?.message;
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return data;
}

/* =======================
   API FUNCTIONS (USER)
======================= */

/** 📌 Get all conversations for current user */
export function getConversations(
  token: string
): Promise<ConversationData[]> {
  return requestJson<GetConversationsResponse>(
    token,
    "/messages/conversations",
    { method: "GET" }
  ).then((res) => res.data ?? []);
}

/** 📩 Get messages in a conversation */
export function getMessages(
  token: string,
  conversationId: string
): Promise<MessageData[]> {
  return requestJson<GetMessagesResponse>(
    token,
    `/messages/conversations/${conversationId}/messages`,
    { method: "GET" }
  ).then((res) => res.data ?? []);
}

/** ✉️ Send a message */
export function sendMessage(
  token: string,
  payload: {
    recipientId: string;
    content: string;
  }
): Promise<MessageData | undefined> {
  return requestJson<SendMessageResponse>(
    token,
    "/messages",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  ).then((res) => res.data);
}

/** 🔔 Get unread message count */
export function getUnreadMessageCount(
  token: string
): Promise<number> {
  return requestJson<{ unreadCount?: number }>(
    token,
    "/messages/unread-count",
    { method: "GET" }
  ).then((res) => res.unreadCount ?? 0);
}

/** ✅ Mark all messages in a conversation as read */
export function markConversationAsRead(
  token: string,
  conversationId: string
): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(
    token,
    `/messages/conversations/${conversationId}/read`,
    { method: "PATCH" }
  );
}

/** 🗑️ Delete a conversation */
export function deleteConversation(
  token: string,
  conversationId: string
): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(
    token,
    `/messages/conversations/${conversationId}`,
    { method: "DELETE" }
  );
}
