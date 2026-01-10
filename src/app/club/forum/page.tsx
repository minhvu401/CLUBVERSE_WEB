/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders/page";

// ✅ APIs
import { getClubPosts, createPost } from "@/app/services/api/post";

import {
  getClubPosts,
  type PostItem,
  type PostSort,
} from "@/app/services/api/post";

import {
  Search,
  Plus,
  Flame,
  Pin,
  MessageSquare,
  Eye,
  Heart,
  Filter,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Sparkles,
  Hash,
  Users,
  ShieldCheck,
  X,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type Category = "all" | "announcement" | "qa" | "sharing";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  author: { name: string; role?: string; avatar?: string };
  createdAt: string;
  category: Exclude<Category, "all">;
  tags: string[];
  pinned?: boolean;
  hot?: boolean;
  stats: { likes: number; comments: number; views: number };
};

<<<<<<< HEAD
/* =========================
   ✅ SIMPLE TOAST SYSTEM
========================= */
type ToastType = "success" | "error" | "info";
type ToastItem = { id: string; type: ToastType; message: string };

function ToastHost({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-[999] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl",
            t.type === "success"
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
              : t.type === "error"
              ? "border-red-400/25 bg-red-400/10 text-red-100"
              : "border-white/10 bg-white/[0.08] text-white"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm leading-relaxed">{t.message}</div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
              title="Đóng"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  const pushToast = (type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [{ id, type, message }, ...prev].slice(0, 4));
    window.setTimeout(() => removeToast(id), 2800);
  };

  return { toasts, pushToast, removeToast };
}

/* ========================= */
=======
type ApiPost = PostItem & {
  postId?: string; // ✅ thêm để fallback id khi API không trả _id

  author?: any;
  createdBy?: any;
  user?: any;
  owner?: any;

  commentCount?: number;
  commentsCount?: number;
  totalComments?: number;
  comments?: any[];

  viewCount?: number;
  views?: number;

  pinned?: boolean;
  isPinned?: boolean;
  hot?: boolean;
  isHot?: boolean;

  category?: string;
  type?: string;
};

>>>>>>> origin/develop

function CategoryPill({
  value,
  active,
  onClick,
}: {
  value: { key: Category; label: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-[0.78rem] font-semibold transition",
        "border border-white/10",
        active
          ? "bg-white/[0.10] text-white"
          : "bg-white/[0.05] text-white/70 hover:bg-white/[0.08] hover:text-white/90"
      )}
    >
      {value.label}
    </button>
  );
}

function Tag({
  text,
  tone = "violet",
}: {
  text: string;
  tone?: "violet" | "sky" | "fuchsia" | "emerald" | "amber";
}) {
  const map: Record<string, string> = {
    violet: "bg-violet-400/12 text-violet-200 border-violet-400/25",
    sky: "bg-sky-400/12 text-sky-200 border-sky-400/25",
    fuchsia: "bg-fuchsia-400/12 text-fuchsia-200 border-fuchsia-400/25",
    emerald: "bg-emerald-400/12 text-emerald-200 border-emerald-400/25",
    amber: "bg-amber-400/12 text-amber-200 border-amber-400/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[0.7rem] font-semibold",
        map[tone]
      )}
    >
      <Hash className="h-3.5 w-3.5 opacity-80" />
      {text}
    </span>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-white/55">
      {icon}
      {value}
    </span>
  );
}

<<<<<<< HEAD
// ✅ mapper: PostItem (backend) -> Post (UI)
function toForumPost(item: any): Post {
  const created =
    item?.createdAt || item?.created_at || item?.createdDate || item?.time;

  const categoryRaw = String(item?.category || item?.type || "sharing").toLowerCase();
  const category: Exclude<Category, "all"> =
    categoryRaw === "announcement"
      ? "announcement"
      : categoryRaw === "qa"
      ? "qa"
      : "sharing";

  return {
    id: String(item?.id ?? item?._id ?? item?.postId ?? ""),
    title: item?.title ?? item?.name ?? "(No title)",
    excerpt: item?.excerpt ?? item?.content ?? item?.description ?? "",
    author: {
      name: item?.author?.name ?? item?.user?.name ?? item?.createdBy?.name ?? "Unknown",
      role: item?.author?.role ?? item?.user?.role ?? item?.createdBy?.role,
      avatar:
        item?.author?.avatar ??
        item?.user?.avatar ??
        item?.createdBy?.avatar ??
        "/default-avatar.png",
    },
    createdAt: created ? new Date(created).toLocaleString("vi-VN") : "",
    category,
    tags: Array.isArray(item?.tags)
      ? item.tags
      : typeof item?.tags === "string"
      ? item.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    pinned: Boolean(item?.pinned ?? item?.isPinned ?? false),
    hot: Boolean(item?.hot ?? item?.isHot ?? false),
    stats: {
      likes: Number(item?.stats?.likes ?? item?.likeCount ?? item?.likes ?? 0),
      comments: Number(item?.stats?.comments ?? item?.commentCount ?? item?.comments ?? 0),
      views: Number(item?.stats?.views ?? item?.viewCount ?? item?.views ?? 0),
=======
// ===== helpers =====
function toExcerpt(content?: string, max = 160) {
  const s = (content || "").replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return iso;

  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "vừa xong";
  if (sec < 60) return `${sec} giây trước`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return d.toLocaleDateString("vi-VN");
}

function normalizeCategory(raw?: string, tags?: string[]) {
  const r = String(raw || "").toLowerCase();
  const set = new Set((tags || []).map((t) => String(t).toLowerCase()));

  const isAnnouncement =
    r.includes("announcement") ||
    r.includes("thongbao") ||
    r.includes("thông báo") ||
    set.has("announcement") ||
    set.has("thongbao") ||
    set.has("thông báo");

  const isQa =
    r.includes("qa") ||
    r.includes("question") ||
    r.includes("hoidap") ||
    r.includes("hỏi đáp") ||
    set.has("qa") ||
    set.has("hoidap") ||
    set.has("hỏi đáp");

  if (isAnnouncement) return "announcement";
  if (isQa) return "qa";
  return "sharing";
}

function pickAuthor(p: ApiPost) {
  const a =
    p.author ||
    p.createdBy ||
    p.user ||
    (p as any).postedBy ||
    (p as any).createdUser ||
    p.owner;

  const name =
    a?.name ||
    a?.fullName ||
    a?.fullname ||
    a?.username ||
    a?.email ||
    "Ẩn danh";

  const role = a?.role || a?.position || a?.title;

  const avatar =
    a?.avatar ||
    a?.avatarUrl ||
    a?.photo ||
    a?.image ||
    a?.profilePicture ||
    a?.picture;

  return { name, role, avatar };
}

function pickCommentCount(p: ApiPost) {
  const direct =
    (p as any).commentCount ??
    (p as any).commentsCount ??
    (p as any).totalComments ??
    (p as any).totalComment ??
    (p as any).comments_total;

  if (typeof direct === "number") return direct;

  const arr = (p as any).comments;
  if (Array.isArray(arr)) return arr.length;

  return 0;
}

function pickViewCount(p: ApiPost) {
  const direct =
    (p as any).viewCount ?? (p as any).views ?? (p as any).totalViews;
  return typeof direct === "number" ? direct : 0;
}

function pickPinned(p: ApiPost) {
  return Boolean((p as any).pinned ?? (p as any).isPinned ?? (p as any).pin);
}

function pickHot(p: ApiPost) {
  return Boolean((p as any).hot ?? (p as any).isHot);
}

// ✅ FIX: truyền clubName để fallback author hiển thị đúng "TEST CLUB"
function mapApiToUi(p: ApiPost, clubName?: string): Post {
  const anyP = p as any;

  // ✅ FIX: id/key fallback để không bị mất bài
  const rawId = anyP?._id ?? anyP?.postId ?? anyP?.id;
  const id = rawId
    ? String(rawId)
    : `${anyP?.title || "post"}-${anyP?.createdAt || Date.now()}`;

  const authorFromPost = pickAuthor(p);
  const likes = p.likeCount ?? p.likes?.length ?? 0;

  const author = {
    name:
      authorFromPost?.name && authorFromPost.name !== "Ẩn danh"
        ? authorFromPost.name
        : clubName || "CLB",
    role: authorFromPost?.role || "Club",
    avatar: authorFromPost?.avatar,
  };

  return {
    id, // ✅ dùng id mới
    title: anyP?.title || "(Không có tiêu đề)",
    excerpt: toExcerpt(anyP?.content),
    author,
    createdAt: timeAgo(anyP?.createdAt),
    category: normalizeCategory(anyP?.category ?? anyP?.type, anyP?.tags),
    tags: anyP?.tags || [],
    pinned: pickPinned(p),
    hot: pickHot(p),
    stats: {
      likes,
      comments: pickCommentCount(p),
      views: pickViewCount(p),
>>>>>>> origin/develop
    },
  };
}

<<<<<<< HEAD
/* =========================
   ✅ CREATE POST MODAL
   - validate title >= 5
   - validate content >= 20
   - DO NOT send category (backend reject)
   - toast + inline errors
========================= */
function CreatePostModal({
  open,
  onClose,
  onCreated,
  toast,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  toast: (type: ToastType, msg: string) => void;
}) {
  const { token } = useAuth() as any;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setContent("");
    setTags("");
    setError(null);
    setLoading(false);
    window.setTimeout(() => titleRef.current?.focus(), 50);
  }, [open]);

  if (!open) return null;

  const validate = (): string | null => {
    const t = title.trim();
    const c = content.trim();

    if (t.length < 5) return "Tiêu đề phải có ít nhất 5 ký tự";
    if (c.length < 20) return "Nội dung phải có ít nhất 20 ký tự";
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      toast("error", v);
      return;
    }

    if (!token) {
      const msg = "Bạn chưa đăng nhập.";
      setError(msg);
      toast("error", msg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ DO NOT send category (backend reject)
      await createPost(token, {
        title: title.trim(),
        content: content.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      } as any);

      toast("success", "Tạo bài viết thành công!");
      onClose();
      onCreated();
    } catch (e: any) {
      // backend hay trả message dạng string (đúng cái bạn paste)
      const msg =
        e?.message ||
        e?.response?.data?.message ||
        "Tạo bài viết thất bại.";
      setError(String(msg));
      toast("error", String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Tạo bài viết mới</h2>
            <div className="mt-1 text-xs text-white/55">
              Tiêu đề ≥ 5 ký tự · Nội dung ≥ 20 ký tự
            </div>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
            onClick={onClose}
            title="Đóng"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <div className="mb-1 text-xs font-semibold text-white/70">Tiêu đề</div>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm outline-none placeholder:text-white/45"
            />
            <div className="mt-1 text-[0.72rem] text-white/45">
              {title.trim().length}/5
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-white/70">Tags</div>
            <input
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                if (error) setError(null);
              }}
              placeholder="vd: nextjs, auth, ui"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm outline-none placeholder:text-white/45"
            />
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-white/70">Nội dung</div>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Viết nội dung bài viết..."
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm outline-none placeholder:text-white/45"
            />
            <div className="mt-1 text-[0.72rem] text-white/45">
              {content.trim().length}/20
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/85 hover:bg-white/[0.10]"
          >
            Huỷ
          </button>

          <button
            onClick={submit}
            type="button"
            disabled={loading}
            className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-60"
          >
            {loading ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================= */
=======
>>>>>>> origin/develop

export default function ForumPage() {
  const router = useRouter();
  const params = useParams() as { clubId?: string };
  const clubId = params?.clubId || "";

  const { user, token, loading } = useAuth() as any;

<<<<<<< HEAD
  const { toasts, pushToast, removeToast } = useToasts();

=======
>>>>>>> origin/develop
  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    // if (!isClubRole) return router.replace("/");
  }, [loading, token, isClubRole, router]);

  const categories = [
    { key: "all" as const, label: "Tất cả" },
    { key: "announcement" as const, label: "Thông báo" },
    { key: "qa" as const, label: "Hỏi đáp" },
    { key: "sharing" as const, label: "Chia sẻ" },
  ];

  const [cat, setCat] = useState<Category>("all");
  const [q, setQ] = useState("");

<<<<<<< HEAD
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [openCreate, setOpenCreate] = useState(false);

  const fetchPosts = async () => {
    if (!token || !clubId) return;
    try {
      setLoadingPosts(true);
      setErrorPosts(null);

      const apiPosts = await getClubPosts(token, clubId, {
        page,
        limit,
      } as any);

      setPosts((apiPosts || []).map(toForumPost));
    } catch (e: any) {
      setErrorPosts(e?.message ?? "Không tải được bài viết.");
      pushToast("error", e?.message ?? "Không tải được bài viết.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, clubId, page]);

  const filtered = useMemo(() => {
    const byCat = cat === "all" ? posts : posts.filter((p) => p.category === cat);

=======
  const [sortBy, setSortBy] = useState<PostSort>("newest");
  const [page, setPage] = useState(1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const [apiPosts, setApiPosts] = useState<ApiPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string>("");

  // ✅ FIX: clubId đúng theo response CLB của bạn
  const clubId = user?._id; // <-- QUAN TRỌNG
  const clubName = user?.fullName || user?.name || "CLB";

  useEffect(() => {
    if (loading) return;
    if (!token) return;
    if (!clubId) return;

    (async () => {
      try {
        setError("");
        setLoadingPosts(true);

        const data = (await getClubPosts(token, String(clubId), {
          sortBy,
          limit,
          skip,
        })) as unknown as ApiPost[];

        setApiPosts(Array.isArray(data) ? data : []);
        setHasMore(Array.isArray(data) && data.length === limit);
      } catch (e: any) {
        console.error("Fetch club posts failed:", e);
        setApiPosts([]);
        setHasMore(false);
        setError(e?.message || "Không tải được bài viết.");
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, [loading, token, clubId, sortBy, limit, skip]);

  // ✅ FIX: map có clubName để author hiển thị "TEST CLUB"
  const posts: Post[] = useMemo(
    () => apiPosts.map((p) => mapApiToUi(p, clubName)),
    [apiPosts, clubName]
  );

  const filtered = useMemo(() => {
    const byCat = cat === "all" ? posts : posts.filter((p) => p.category === cat);
>>>>>>> origin/develop
    const query = q.trim().toLowerCase();
    if (!query) return byCat;

    return byCat.filter((p) => {
      return (
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.author.name.toLowerCase().includes(query) ||
        p.tags.join(" ").toLowerCase().includes(query)
      );
    });
  }, [cat, q, posts]);

  const tagStats = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1)));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [posts]);

  const onlineMembers = [
    {
      name: "Nguyễn Văn A",
      avatar:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Trần Thị B",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    },
    {
      name: "Phạm Thị D",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
    },
  ];

  const canPrev = page > 1 && !loadingPosts;
  const canNext = hasMore && !loadingPosts;

  const pageButtons = useMemo(() => {
    const arr = [page - 1, page, page + 1].filter((n) => n >= 1);
    return Array.from(new Set(arr));
  }, [page]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
<<<<<<< HEAD
      <ToastHost toasts={toasts} removeToast={removeToast} />

=======
>>>>>>> origin/develop
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        {/* Title */}
        <div className="mb-6">
          <div className="text-sm text-white/60">Forum</div>
          <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Diễn đàn</h1>
              <p className="mt-1 text-sm text-white/60">
                Nơi trao đổi thông báo, hỏi đáp và chia sẻ kiến thức trong cộng đồng.
              </p>
              {!clubId ? (
                <p className="mt-1 text-xs text-amber-200/80">
                  (Chưa thấy clubId trong user — CLB login phải có user._id)
                </p>
              ) : null}
            </div>

            <button
              type="button"
<<<<<<< HEAD
              onClick={() => setOpenCreate(true)}
=======
              onClick={() => router.push("/club/forum/create")}
>>>>>>> origin/develop
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-[0.78rem] font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition"
            >
              <Plus className="h-4 w-4" />
              Tạo bài viết
            </button>
          </div>
        </div>

        {/* Top controls */}
        <div className={cn("rounded-3xl p-4 md:p-5", glass)}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <CategoryPill
                  key={c.key}
                  value={c}
                  active={cat === c.key}
                  onClick={() => setCat(c.key)}
                />
              ))}
            </div>

<<<<<<< HEAD
=======
            {/* Search + sort */}
>>>>>>> origin/develop
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm bài viết, tag, tác giả..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 sm:w-[260px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.10]"
                  title="Bộ lọc"
                >
                  <Filter className="h-4 w-4" />
                  Lọc
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => {
                    setPage(1);
                    setSortBy(e.target.value as PostSort);
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/85 outline-none"
                >
                  <option className="text-black" value="newest">
                    Mới nhất
                  </option>
                  <option className="text-black" value="oldest">
                    Cũ nhất
                  </option>
                  <option className="text-black" value="popular">
                    Phổ biến
                  </option>
                </select>
              </div>
            </div>
          </div>

          {error ? <div className="mt-3 text-sm text-rose-200/90">{error}</div> : null}
        </div>

        {/* Content grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Posts list */}
          <section className="lg:col-span-2 space-y-3">
            {loadingPosts ? (
<<<<<<< HEAD
              <div className={cn("rounded-3xl p-5", glass)}>Đang tải bài viết...</div>
            ) : errorPosts ? (
              <div className={cn("rounded-3xl p-5", glass)}>
                <div className="text-sm text-red-200">{errorPosts}</div>
              </div>
            ) : null}

            {!loadingPosts && !errorPosts && filtered.length === 0 ? (
              <div className={cn("rounded-3xl p-5", glass)}>
                <div className="text-sm text-white/70">Chưa có bài viết nào.</div>
=======
              <div className={cn("rounded-3xl p-5", glass)}>
                <div className="text-sm text-white/70">Đang tải bài viết…</div>
              </div>
            ) : null}

            {!loadingPosts && filtered.length === 0 ? (
              <div className={cn("rounded-3xl p-5", glass)}>
                <div className="text-sm text-white/70">Không có bài viết nào.</div>
>>>>>>> origin/develop
              </div>
            ) : null}

            {filtered.map((p) => (
              <article
                key={p.id}
                className={cn("relative overflow-hidden rounded-3xl p-5", glass)}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(168,85,247,0.12),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_10%,rgba(59,130,246,0.10),transparent_60%)]" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {p.pinned ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/12 px-3 py-1 text-[0.7rem] font-semibold text-violet-200">
                            <Pin className="h-3.5 w-3.5" />
                            Pinned
                          </span>
                        ) : null}

                        {p.hot ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/12 px-3 py-1 text-[0.7rem] font-semibold text-amber-200">
                            <Flame className="h-3.5 w-3.5" />
                            Hot
                          </span>
                        ) : null}

                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.7rem] font-semibold text-white/75">
                          <Sparkles className="h-3.5 w-3.5 text-white/70" />
                          {p.category === "announcement"
                            ? "Thông báo"
                            : p.category === "qa"
                            ? "Hỏi đáp"
                            : "Chia sẻ"}
                        </span>
                      </div>

                      <h3 className="mt-3 truncate text-base font-semibold text-white">
                        {p.title}
                      </h3>

                      <p className="mt-2 text-sm text-white/65 leading-relaxed line-clamp-2">
                        {p.excerpt}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.tags.slice(0, 3).map((t, i) => (
                          <Tag
                            key={`${p.id}-${t}`}
                            text={t}
                            tone={i === 0 ? "violet" : i === 1 ? "sky" : "fuchsia"}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                      title="Khác"
                    >
                      <span className="text-lg leading-none">⋯</span>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                        <img
                          src={p.author.avatar || "/default-avatar.png"}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-white">
                            {p.author.name}
                          </span>
                          {p.author.role ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-200">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              {p.author.role}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 text-[0.72rem] text-white/55">
                          {p.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Stat icon={<Heart className="h-4 w-4" />} value={p.stats.likes} />
                      <Stat
                        icon={<MessageSquare className="h-4 w-4" />}
                        value={p.stats.comments}
                      />
                      <Stat icon={<Eye className="h-4 w-4" />} value={p.stats.views} />

                      <button
                        type="button"
                        onClick={() => router.push(`/club/forum/post/${p.id}`)}
                        className="rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 px-4 py-2 text-[0.72rem] font-semibold text-white/85 transition"
                      >
                        Xem bài →
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {/* Pagination (basic) */}
            <div className={cn("rounded-3xl p-4", glass)}>
              <div className="flex items-center justify-between">
<<<<<<< HEAD
                <div className="text-xs text-white/55">Trang {page}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                    title="Trang trước"
=======
                <div className="text-xs text-white/55">
                  Trang {page}
                  {loadingPosts ? " • đang tải…" : ""}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!canPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]",
                      !canPrev && "opacity-40 cursor-not-allowed"
                    )}
>>>>>>> origin/develop
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

<<<<<<< HEAD
                  {[page, page + 1, page + 2].map((pnum, idx) => (
                    <button
                      key={`${pnum}-${idx}`}
=======
                  {pageButtons.map((pnum) => (
                    <button
                      key={pnum}
>>>>>>> origin/develop
                      onClick={() => setPage(pnum)}
                      className={cn(
                        "h-9 w-9 rounded-xl border text-xs font-semibold transition",
                        pnum === page
                          ? "border-white/15 bg-white/[0.10] text-white"
                          : "border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/[0.10]"
                      )}
                    >
                      {pnum}
                    </button>
                  ))}

                  <button
<<<<<<< HEAD
                    onClick={() => setPage((p) => p + 1)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                    title="Trang sau"
=======
                    disabled={!canNext}
                    onClick={() => setPage((p) => p + 1)}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]",
                      !canNext && "opacity-40 cursor-not-allowed"
                    )}
>>>>>>> origin/develop
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className={cn("rounded-3xl p-5", glass)}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Plus className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Tạo nhanh</div>
                  <div className="mt-0.5 text-[0.72rem] text-white/55">
                    Đăng bài, thông báo, hỏi đáp
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenCreate(true)}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-[0.78rem] font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition"
              >
                Tạo bài viết
              </button>

              <button
                type="button"
                onClick={() => setOpenCreate(true)}
                className="mt-2 w-full rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[0.78rem] font-semibold text-white/85 hover:bg-white/[0.10] transition"
              >
                Tạo thông báo
              </button>
            </div>

            <div className={cn("rounded-3xl p-5", glass)}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Hash className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Top Tags</div>
                  <div className="mt-0.5 text-[0.72rem] text-white/55">
                    Những chủ đề nổi bật
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tagStats.length === 0 ? (
                  <div className="text-sm text-white/60">Chưa có tag</div>
                ) : (
                  tagStats.map(([t, count], i) => (
                    <span
                      key={t}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.72rem] font-semibold",
                        i % 3 === 0
                          ? "border-violet-400/25 bg-violet-400/12 text-violet-200"
                          : i % 3 === 1
                          ? "border-sky-400/25 bg-sky-400/12 text-sky-200"
                          : "border-fuchsia-400/25 bg-fuchsia-400/12 text-fuchsia-200"
                      )}
                    >
                      #{t}
                      <span className="text-white/55 font-semibold">({count})</span>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className={cn("rounded-3xl p-5", glass)}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <ShieldCheck className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Quy tắc diễn đàn</div>
                  <div className="mt-0.5 text-[0.72rem] text-white/55">
                    Giữ môi trường thảo luận tích cực
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-white/65 leading-relaxed">
                <li>• Tôn trọng mọi người, không công kích cá nhân.</li>
                <li>• Không spam, không đăng nội dung không liên quan.</li>
                <li>• Khi hỏi đáp: cung cấp log/ảnh lỗi rõ ràng.</li>
              </ul>
            </div>

            <div className={cn("rounded-3xl p-5", glass)}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Users className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Online</div>
                  <div className="mt-0.5 text-[0.72rem] text-white/55">
                    Thành viên đang hoạt động
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {onlineMembers.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                        <img
                          src={m.avatar}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="truncate text-sm font-semibold text-white">
                        {m.name}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[0.72rem] font-semibold text-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Online
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <CreatePostModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        toast={pushToast}
        onCreated={async () => {
          setOpenCreate(false);
          setPage(1);
          await fetchPosts();
          router.refresh?.();
        }}
      />
    </div>
  );
}
