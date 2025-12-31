export const AUTH_BASE_URL = "https://clubverse.onrender.com";

export type SortBy = "newest" | "oldest" | "popular";

export type GetPostsParams = {
  /** dùng cho cả /posts?clubId=... và /posts/club/:clubId */
  clubId?: string;
  sortBy?: SortBy;
  limit?: number;
  skip?: number;
};

export type PostAuthor =
  | { _id?: string; id?: string; fullName?: string; name?: string; email?: string; avatarUrl?: string; avatar?: string ;  role?: string; }
  | string;

export type PostClub =
  | { _id?: string; id?: string; name?: string; fullName?: string; avatarUrl?: string; avatar?: string }
  | string;

export type PostItem = {
  _id: string;
  id?: string;

  title?: string;

  // tùy backend field nào có
  content?: string;
  description?: string;
  text?: string;

  images?: string[];

  createdAt?: string;
  updatedAt?: string;

  author?: PostAuthor;
  club?: PostClub;

  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;

  pinned?: boolean;
  isPinned?: boolean;
  hot?: boolean;
  isHot?: boolean;

  tags?: string[];
  category?: string;
};

type GetPostsResponse =
  | { total?: number; posts?: PostItem[]; data?: PostItem[]; items?: PostItem[]; count?: number; message?: string }
  | PostItem[];

function isFormData(x: any) {
  return typeof FormData !== "undefined" && x instanceof FormData;
}

// ✅ request chung (không phá Content-Type khi là FormData)
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    accept: "application/json",
    ...(options.headers as any),
  };

  // chỉ set JSON content-type khi body KHÔNG phải FormData và user chưa set sẵn
  if (!isFormData(options.body) && !("Content-Type" in headers) && options.method && options.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const text = await res.text().catch(() => "");
    const msg = (data as any)?.message || text || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

function buildQuery(params: Omit<GetPostsParams, "clubId">) {
  const q = new URLSearchParams();
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (typeof params.limit === "number") q.set("limit", String(params.limit));
  if (typeof params.skip === "number") q.set("skip", String(params.skip));
  const s = q.toString();
  return s ? `?${s}` : "";
}

function normalizeList(data: GetPostsResponse): { total: number; posts: PostItem[] } {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.posts)
    ? data.posts
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : [];

  const totalRaw = Array.isArray(data)
    ? data.length
    : Number((data as any)?.total ?? (data as any)?.count ?? list.length);

  return {
    total: Number.isFinite(totalRaw) ? totalRaw : list.length,
    posts: list,
  };
}

/**
 * ✅ GET POSTS (CHUNG)
 * - Nếu có clubId => ưu tiên gọi /posts/club/:clubId (đúng swagger)
 * - Nếu không có clubId => gọi /posts?sortBy&limit&skip (nếu backend có)
 * - Nếu backend của m dùng /posts?clubId=... thì bật `USE_QUERY_CLUBID = true`
 */
const USE_QUERY_CLUBID = false;

export async function getPosts(accessToken: string, params: GetPostsParams = {}) {
  const { clubId, sortBy, limit, skip } = params;

  // --- CASE: có clubId ---
  if (clubId) {
    if (USE_QUERY_CLUBID) {
      // /posts?clubId=...
      const q = new URLSearchParams();
      q.set("clubId", clubId);
      if (sortBy) q.set("sortBy", sortBy);
      if (typeof limit === "number") q.set("limit", String(limit));
      if (typeof skip === "number") q.set("skip", String(skip));
      const query = q.toString() ? `?${q.toString()}` : "";

      const data = await request<GetPostsResponse>(`/posts${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return normalizeList(data);
    }

    // /posts/club/:clubId?sortBy&limit&skip  ✅ swagger
    const query = buildQuery({ sortBy, limit, skip });
    const data = await request<GetPostsResponse>(`/posts/club/${encodeURIComponent(clubId)}${query}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return normalizeList(data);
  }

  // --- CASE: không có clubId ---
  const query = buildQuery({ sortBy, limit, skip });
  const data = await request<GetPostsResponse>(`/posts${query}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return normalizeList(data);
}

export async function getPostById(accessToken: string, id: string): Promise<PostItem> {
  return request<PostItem>(`/posts/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
// ===== CREATE POST =====
export type CreatePostBody = {
  title: string;
  tags: string[];
  content: string;
  images?: string[];
};

export async function createPost(accessToken: string, body: CreatePostBody): Promise<PostItem> {
  return request<PostItem>(`/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
}
