import { AUTH_BASE_URL } from "@/app/services/api/auth";

export type EventFilter = "all" | "upcoming" | "past" | "ongoing";

export type ClubLite = {
  _id: string;
  fullName?: string;
};

export type EventItem = {
  _id: string;

  // tên sự kiện (backend có thể khác key)
  title?: string;
  name?: string;

  description?: string;
  location?: string;

  // thời gian (backend có thể khác key)
  startAt?: string;
  endAt?: string;
  startDate?: string;
  endDate?: string;

  bannerUrl?: string;
  images?: string[];

  // club (backend có thể populate hoặc chỉ id)
  club?: ClubLite;
  clubId?: ClubLite | string;

  createdAt?: string;
  updatedAt?: string;
};

export type GetEventsParams = {
  accessToken: string;
  filter?: EventFilter; // swagger: all/upcoming/past/ongoing
  clubId?: string;
  limit?: number;
  skip?: number;
};

export type GetEventsResponse = {
  total: number;
  events: EventItem[];
};

function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function getEvents({
  accessToken,
  filter = "all",
  clubId,
  limit = 20,
  skip = 0,
}: GetEventsParams): Promise<GetEventsResponse> {
  const qs = buildQuery({ filter, clubId, limit, skip });

  const res = await fetch(`${AUTH_BASE_URL}/events${qs}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Không lấy được sự kiện (HTTP ${res.status})`);
  }

  // backend có thể trả:
  // 1) []  2) { events: [], total }  3) { data: [], total }  4) { items: [], total }
  const list: EventItem[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.events)
    ? data.events
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : [];

  const total =
    typeof data?.total === "number"
      ? data.total
      : typeof data?.count === "number"
      ? data.count
      : list.length;

  return { total, events: list };
}
