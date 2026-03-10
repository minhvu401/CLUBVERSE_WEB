import { AUTH_BASE_URL } from "./auth";

export type PostSort = "newest" | "oldest" | "popular";

export type PostCoreFields = {
  title: string;
  tags?: string[];
  content: string;
  images?: string[];
};

export type PostItem = PostCoreFields & {
  _id: string;
  clubId: {
    _id: string;
    fullName: string;
    category?: string;
    rating?: number;
  } | string;
  like?: number;
  likedBy?: Array<{
    userId: string;
    likedAt: string;
    _id: string;
  }>;
  isLiked?: boolean;
  isActive?: boolean;
  likeCount?: number;
  likes?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PostsQuery = {
  clubId?: string;
  sortBy?: PostSort;
  limit?: number;
  skip?: number;
};

type ListResponse = {
  total?: number;
  posts?: PostItem[];
  data?: PostItem[];
};

const POSTS_URL = `${AUTH_BASE_URL}/posts`;

function withQuery(path: string, params?: PostsQuery) {
  if (!params) return path;
  const query = new URLSearchParams();
  if (params.clubId) query.set("clubId", params.clubId);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (typeof params.limit === "number")
    query.set("limit", String(params.limit));
  if (typeof params.skip === "number") query.set("skip", String(params.skip));
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

function extractPosts(payload?: ListResponse | PostItem[]): PostItem[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.posts)) return payload.posts;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export async function createPost(
  token: string,
  body: PostCoreFields
): Promise<PostItem> {
  return request<PostItem>(token, POSTS_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getAllPosts(
  token: string,
  params?: PostsQuery
): Promise<PostItem[]> {
  const payload = await request<ListResponse | PostItem[]>(
    token,
    withQuery(POSTS_URL, params)
  );
  return extractPosts(payload);
}

export async function getClubPosts(
  token: string,
  clubId: string,
  params?: Omit<PostsQuery, "clubId">
): Promise<PostItem[]> {
  const path = withQuery(`${POSTS_URL}/club/${clubId}`, params);
  const payload = await request<ListResponse | PostItem[]>(token, path);
  return extractPosts(payload);
}

export async function getDeletedPosts(token: string): Promise<PostItem[]> {
  const payload = await request<ListResponse | PostItem[]>(
    token,
    `${POSTS_URL}/deleted`,
    {
      method: "GET",
    }
  );
  return extractPosts(payload);
}

export async function getPostById(
  token: string,
  id: string
): Promise<PostItem> {
  return request<PostItem>(token, `${POSTS_URL}/${id}`);
}

export async function updatePost(
  token: string,
  id: string,
  body: PostCoreFields
): Promise<PostItem> {
  return request<PostItem>(token, `${POSTS_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deletePost(
  token: string,
  id: string
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${POSTS_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function restorePost(
  token: string,
  id: string
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${POSTS_URL}/${id}/restore`, {
    method: "PATCH",
  });
}

export async function deletePostPermanently(
  token: string,
  id: string
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${POSTS_URL}/${id}/permanent`, {
    method: "DELETE",
  });
}

export async function likePost(
  token: string,
  id: string
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${POSTS_URL}/${id}/like`, {
    method: "POST",
  });
}

export async function unlikePost(
  token: string,
  id: string
): Promise<{ message?: string }> {
  return request<{ message?: string }>(token, `${POSTS_URL}/${id}/unlike`, {
    method: "DELETE",
  });
}
