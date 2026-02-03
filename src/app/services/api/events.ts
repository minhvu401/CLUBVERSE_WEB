import { AUTH_BASE_URL } from "./auth";

export type EventFilter = "all" | "upcoming" | "past" | "ongoing";
export type MyEventFilter = "all" | "upcoming" | "past";

export type EventCoreFields = {
  title: string;
  description: string;
  location: string;
  time: string;
  maxParticipants?: number;
  images?: string[];
};

export type JoinedUser = {
  _id: string;
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
};

export type CancelledUser = {
  _id: string;
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  reason: string;
  cancelledAt: string;
};

export type ClubInfo = {
  _id: string;
  fullName: string;
  rating?: number;
  category?: string;
};

export type EventItem = EventCoreFields & {
  _id: string;
  clubId: ClubInfo;
  joinedUsers?: JoinedUser[];
  cancelledUsers?: CancelledUser[];
  status: string;
  isActive: boolean;
  reminderSent: boolean;
  availableSlots: number;
  isFull: boolean;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type EventsQuery = {
  filter?: EventFilter;
  clubId?: string;
  limit?: number;
  skip?: number;
};

export type MyEventsQuery = {
  filter?: MyEventFilter;
};

type ListResponse = {
  total?: number;
  events?: EventItem[];
  data?: EventItem[];
};

type ParticipantsResponse = {
  participants?: Participant[];
  data?: Participant[];
};

const EVENTS_URL = `${AUTH_BASE_URL}/events`;

function withQuery(path: string, params?: Record<string, any>) {
  if (!params) return path;
  const query = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  });

  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
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

function extractEvents(payload?: ListResponse | EventItem[]): EventItem[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.events)) return payload.events;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function extractParticipants(
  payload?: ParticipantsResponse | Participant[],
): Participant[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.participants)) return payload.participants;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

// ============ CREATE ============
export async function createEvent(
  token: string,
  body: EventCoreFields,
): Promise<EventItem> {
  return request<EventItem>(token, EVENTS_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ============ READ ============
export async function getAllEvents(
  token: string,
  params?: EventsQuery,
): Promise<EventItem[]> {
  const payload = await request<ListResponse | EventItem[]>(
    token,
    withQuery(EVENTS_URL, params),
  );
  return extractEvents(payload);
}

export async function getMyEvents(
  token: string,
  params?: MyEventsQuery,
): Promise<EventItem[]> {
  const payload = await request<ListResponse | EventItem[]>(
    token,
    withQuery(`${EVENTS_URL}/my-events`, params),
  );
  return extractEvents(payload);
}

export async function getDeletedEvents(token: string): Promise<EventItem[]> {
  const payload = await request<ListResponse | EventItem[]>(
    token,
    `${EVENTS_URL}/deleted`,
  );
  return extractEvents(payload);
}

export async function getEventById(
  token: string,
  id: string,
): Promise<EventItem> {
  return request<EventItem>(token, `${EVENTS_URL}/${id}`);
}

export async function getEventParticipants(
  token: string,
  id: string,
): Promise<Participant[]> {
  const payload = await request<ParticipantsResponse | Participant[]>(
    token,
    `${EVENTS_URL}/${id}/participants`,
  );
  return extractParticipants(payload);
}

// ============ UPDATE ============
export async function updateEvent(
  token: string,
  id: string,
  body: Partial<EventCoreFields>,
): Promise<EventItem> {
  return request<EventItem>(token, `${EVENTS_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ============ DELETE ============
export async function softDeleteEvent(
  token: string,
  id: string,
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${EVENTS_URL}/${id}/soft`, {
    method: "DELETE",
  });
}

export async function hardDeleteEvent(
  token: string,
  id: string,
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${EVENTS_URL}/${id}/hard`, {
    method: "DELETE",
  });
}

export async function restoreEvent(
  token: string,
  id: string,
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${EVENTS_URL}/${id}/restore`, {
    method: "PATCH",
  });
}

// ============ REGISTER / CANCEL ============
export async function registerEvent(
  token: string,
  id: string,
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${EVENTS_URL}/${id}/register`, {
    method: "POST",
  });
}

export async function cancelEventRegistration(
  token: string,
  id: string,
  reason?: string,
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${EVENTS_URL}/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// ============ CHECK-IN ============
export async function checkInParticipant(
  token: string,
  eventId: string,
  userId: string,
): Promise<{ message?: string }> {
  return request<{ message?: string }>(
    token,
    `${EVENTS_URL}/${eventId}/check-in/${userId}`,
    {
      method: "POST",
    },
  );
}

export async function undoCheckIn(
  token: string,
  eventId: string,
  userId: string,
): Promise<{ message?: string }> {
  return request<{ message?: string }>(
    token,
    `${EVENTS_URL}/${eventId}/check-in/${userId}/undo`,
    {
      method: "DELETE",
    },
  );
}
