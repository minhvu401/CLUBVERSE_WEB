import { AUTH_BASE_URL } from "./auth";

export type EventFilter = "all" | "upcoming" | "ongoing" | "past";

export type EventItem = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  clubId?: string;
  club?: {
    _id: string;
    name: string;
  };
  cover?: string;
  image?: string;
  participants?: number;
  joinedCount?: number;
  pinned?: boolean;
  hot?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EventsQuery = {
  filter?: EventFilter;
  clubId?: string;
  limit?: number;
  skip?: number;
};

type ListResponse = {
  total?: number;
  events?: EventItem[];
  data?: EventItem[];
};

/* ========================= */

const EVENTS_URL = `${AUTH_BASE_URL}/events`;

/* =========================
   HELPERS
========================= */

function withQuery(path: string, params?: EventsQuery) {
  if (!params) return path;

  const query = new URLSearchParams();

  if (params.filter) query.set("filter", params.filter);
  if (params.clubId) query.set("clubId", params.clubId);
  if (typeof params.limit === "number")
    query.set("limit", String(params.limit));
  if (typeof params.skip === "number")
    query.set("skip", String(params.skip));

  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(
  token: string,
  path: string,
  init: RequestInit = {}
) {
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


function extractEvents(
  payload?: ListResponse | EventItem[]
): EventItem[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.events)) return payload.events;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

/* =========================
   API
========================= */

export async function getEvents(
  token: string,
  params?: EventsQuery
): Promise<EventItem[]> {
  const payload = await request<ListResponse | EventItem[]>(
    token,
    withQuery(EVENTS_URL, params)
  );
  return extractEvents(payload);
}

export async function getEventById(
  token: string,
  id: string
): Promise<EventItem> {
  return request<EventItem>(token, `${EVENTS_URL}/${id}`);
}

export async function registerEvent(
  token: string,
  id: string
): Promise<{ message?: string }> {
  return request<{ message?: string }>(
    token,
    `${EVENTS_URL}/${id}/register`,
    {
      method: "POST",
    }
  );
}

export async function cancelEventRegistration(
  token: string,
  id: string,
  reason: string
): Promise<{ message?: string }> {
  return request<{ message?: string }>(
    token,
    `${EVENTS_URL}/${id}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
}

export interface MyEvent {
  _id: string;
  title: string;
  clubName: string;
  startTime: string;
  endTime?: string;
  location?: string;
  description?: string;
}

export async function getMyEvents(params: {
  accessToken: string;
  filter?: EventFilter;
}): Promise<MyEvent[]> {
  const { accessToken, filter = "all" } = params;

  const query = filter ? `?filter=${filter}` : "";

  const res = await fetch(`${AUTH_BASE_URL}/events/my-events${query}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data?.message || `Không lấy được danh sách sự kiện (HTTP ${res.status})`
    );
  }

  return data as MyEvent[];
}