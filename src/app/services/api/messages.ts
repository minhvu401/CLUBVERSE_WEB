export const AUTH_BASE_URL = "https://clubverse.onrender.com";

/* =======================
   TYPES
======================= */

export type ConversationData = {
  _id: string;
  isGroup?: boolean;
  name?: string;
  description?: string;
  participantId?: string; // Legacy
  participants?: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    isActive?: boolean;
  }[];
  adminIds?: string[];
  avatarUrl?: string;
  participantInfo?: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    isActive?: boolean;
  };
  lastMessage?: string | MessageData;
  lastMessageTime?: string;
  unreadCount?: number;
  isMuted?: boolean;
};

export type MessageData = {
  _id: string;
  conversationId: string;
  senderId: string | { _id: string; fullName: string; avatarUrl?: string };
  content: string;
  isRead?: boolean;
  replyToId?: string;
  isPinned?: boolean;
  reactions?: { type: string; userId: string }[];
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
   API FUNCTIONS (CONVERSATIONS)
======================= */

/** 📌 Get all conversations for current user */
export function getConversations(token: string): Promise<ConversationData[]> {
  return requestJson<GetConversationsResponse>(token, "/messages/conversations", { method: "GET" }).then((res) => res.data ?? []);
}

/** ➕ Create a new conversation (direct or group) */
export function createConversation(
  token: string, 
  payload: { participantIds: string[]; name?: string; description?: string }
): Promise<ConversationData> {
  return requestJson<{ data?: ConversationData; conversation?: ConversationData }>(token, "/messages/conversations", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(res => (res.data || res.conversation || res) as ConversationData);
}

/** 🔍 Get a specific conversation */
export function getConversationById(token: string, conversationId: string): Promise<ConversationData> {
  return requestJson<{ data: ConversationData }>(token, `/messages/conversations/${conversationId}`, { method: "GET" }).then(res => res.data);
}

/** ✏️ Update conversation info (name, description) */
export function updateConversation(
  token: string, 
  conversationId: string, 
  payload: { name?: string; description?: string }
): Promise<ConversationData> {
  return requestJson<{ data: ConversationData }>(token, `/messages/conversations/${conversationId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then(res => res.data);
}

/** 👥 Add members to a group conversation */
export function addMembersToConversation(
  token: string, 
  conversationId: string, 
  payload: { participantIds: string[] }
): Promise<ConversationData> {
  return requestJson<{ data: ConversationData }>(token, `/messages/conversations/${conversationId}/members`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(res => res.data);
}

/** ❌ Remove a member from a group conversation */
export function removeMemberFromConversation(
  token: string, 
  conversationId: string, 
  memberId: string
): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/conversations/${conversationId}/members/${memberId}`, { method: "DELETE" });
}

/** 🔇 Mute a conversation */
export function muteConversation(token: string, conversationId: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/conversations/${conversationId}/mute`, { method: "POST" });
}

/** 🔊 Unmute a conversation */
export function unmuteConversation(token: string, conversationId: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/conversations/${conversationId}/unmute`, { method: "POST" });
}

/** ✉️ Send a message to a club (create/start conversation) 
 * 🔧 FIXED: Sử dụng POST /messages với recipientId thay vì /messages/club
 */
export function sendMessageToClub(
  token: string,
  payload: {
    clubId: string;
    content: string;
  }
): Promise<MessageData | undefined> {
  return requestJson<SendMessageResponse>(
    token,
    "/messages",
    {
      method: "POST",
      body: JSON.stringify({
        recipientId: payload.clubId,  // ✅ Dùng recipientId thay vì clubId
        content: payload.content,
      }),
    }
  ).then((res) => res.data);
}
/** ✅ Mark all messages in a conversation as read */
export function markConversationAsReadAll(token: string, conversationId: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/conversations/${conversationId}/read-all`, { method: "PATCH" });
}

/** 🔎 Search messages in a conversation */
export function searchMessages(
  token: string, 
  conversationId: string, 
  query: string
): Promise<MessageData[]> {
  return requestJson<{ data: MessageData[] }>(token, `/messages/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`, { method: "GET" }).then(res => res.data ?? []);
}

/** 📌 Get all pinned messages in a conversation */
export function getPinnedMessages(token: string, conversationId: string): Promise<MessageData[]> {
  return requestJson<{ data: MessageData[] }>(token, `/messages/conversations/${conversationId}/pinned`, { method: "GET" }).then(res => res.data ?? []);
}

/* =======================
   API FUNCTIONS (MESSAGES)
======================= */

/** 📩 Get messages in a conversation */
export function getMessages(token: string, conversationId: string): Promise<MessageData[]> {
  return requestJson<GetMessagesResponse>(token, `/messages/conversations/${conversationId}/messages`, { method: "GET" }).then((res) => res.data ?? []);
}

/** ✉️ Send a message (or reply) */
export function sendMessage(
  token: string,
  payload: {
    conversationId?: string; // New spec
    recipientId?: string;    // Legacy fallback
    content: string;
    replyToId?: string;
  }
): Promise<MessageData> {
  return requestJson<{ data: MessageData }>(token, "/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => res.data);
}

/** 🔍 Get a specific message */
export function getMessageById(token: string, messageId: string): Promise<MessageData> {
  return requestJson<{ data: MessageData }>(token, `/messages/${messageId}`, { method: "GET" }).then(res => res.data);
}

/** ✏️ Update/edit a message */
export function updateMessage(token: string, messageId: string, content: string): Promise<MessageData> {
  return requestJson<{ data: MessageData }>(token, `/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  }).then(res => res.data);
}

/** 🗑️ Delete a message */
export function deleteMessage(token: string, messageId: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/${messageId}`, { method: "DELETE" });
}

/** 💬 Get replies to a specific message */
export function getMessageReplies(token: string, messageId: string): Promise<MessageData[]> {
  return requestJson<{ data: MessageData[] }>(token, `/messages/${messageId}/replies`, { method: "GET" }).then(res => res.data ?? []);
}

/** ✅ Mark a message as read */
export function markMessageAsRead(token: string, messageId: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/${messageId}/read`, { method: "PATCH" });
}

/** 📌 Pin a message */
export function pinMessage(token: string, messageId: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/${messageId}/pin`, { method: "POST" });
}

/** 🎯 Unpin a message */
export function unpinMessage(token: string, messageId: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/${messageId}/unpin`, { method: "POST" });
}

/** ❤️ Add a reaction to a message */
export function addReaction(token: string, messageId: string, type: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/${messageId}/reactions`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}

/** 💔 Remove a reaction from a message */
export function removeReaction(token: string, messageId: string, type: string): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(token, `/messages/${messageId}/reactions`, {
    method: "DELETE",
    body: JSON.stringify({ type }),
  });
}

/** 🔔 Get unread message count */
export function getUnreadMessageCount(token: string): Promise<number> {
  return requestJson<{ unreadCount?: number }>(token, "/messages/unread-count", { method: "GET" }).then((res) => res.unreadCount ?? 0);
}
