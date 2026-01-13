/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  getAllPosts,
  likePost,
  unlikePost,
  deletePost,
  type PostItem,
  type PostSort,
} from "@/app/services/api/post";
import CreatePostModal from "./components/CreatePostModal";

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
  Trash2,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type Category = "all" | "announcement" | "qa" | "sharing";

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

export default function ForumPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as any;

  // nếu bạn muốn forum chỉ cho club => bật guard này
  // nếu forum dùng chung user/club => bạn có thể bỏ đoạn isClubRole check
  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role]
  );

  useEffect(() => {
    if (loading) return;
    if (!token) return router.replace("/login");
    // nếu forum chỉ dành cho club:
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
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [sortBy, setSortBy] = useState<PostSort>("newest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch posts from API
  useEffect(() => {
    if (!token) return;

    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const data = await getAllPosts(token, { sortBy });
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [token, sortBy]);

  // Handler để like/unlike post
  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!token) return;

    try {
      if (isLiked) {
        await unlikePost(token, postId);
      } else {
        await likePost(token, postId);
      }

      // Cập nhật state local
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: isLiked
                  ? p.likes?.filter((id) => id !== user?._id)
                  : [...(p.likes || []), user?._id],
                likeCount: (p.likeCount || 0) + (isLiked ? -1 : 1),
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handler để xóa post
  const handleDelete = async (postId: string) => {
    if (!token) return;

    const confirm = window.confirm(
      "Bạn có chắc chắn muốn xóa bài viết này không?"
    );
    if (!confirm) return;

    try {
      await deletePost(token, postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error: any) {
      alert(error.message || "Không thể xóa bài viết");
    }
  };

  // Handler khi tạo post thành công
  const handlePostCreated = () => {
    // Refresh posts list
    if (token) {
      getAllPosts(token, { sortBy }).then(setPosts).catch(console.error);
    }
  };

  // Mock posts removed - using API data
  const mockPosts: PostItem[] = [];

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return posts.filter((p) => {
      // Filter by search query
      if (!query) return true;

      return (
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        (p.tags || []).join(" ").toLowerCase().includes(query)
      );
    });
  }, [posts, cat, q]);

  const tagStats = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((p) =>
      (p.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    );
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [posts]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không rõ";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

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

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* ✅ BG giống /club/home */}
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
                Nơi trao đổi thông báo, hỏi đáp và chia sẻ kiến thức trong cộng
                đồng.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
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
            {/* Categories */}
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

            {/* Search + filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm bài viết, tag, tác giả..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 sm:w-[280px]"
                />
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.10]"
                title="Bộ lọc"
              >
                <Filter className="h-4 w-4" />
                Lọc
              </button>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Posts list */}
          <section className="lg:col-span-2 space-y-3">
            {isLoadingPosts && (
              <div className={cn("rounded-3xl p-8 text-center", glass)}>
                <div className="text-white/60">Đang tải bài viết...</div>
              </div>
            )}

            {!isLoadingPosts && filtered.length === 0 && (
              <div className={cn("rounded-3xl p-8 text-center", glass)}>
                <div className="text-white/60">Không có bài viết nào</div>
              </div>
            )}

            {!isLoadingPosts &&
              filtered.map((p) => {
                const isLiked = p.likes?.includes(user?._id);

                return (
                  <article
                    key={p._id}
                    className={cn(
                      "relative overflow-hidden rounded-3xl p-5",
                      glass
                    )}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(168,85,247,0.12),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_10%,rgba(59,130,246,0.10),transparent_60%)]" />

                    <div className="relative">
                      {/* header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {(p.likeCount || 0) > 50 && (
                              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/12 px-3 py-1 text-[0.7rem] font-semibold text-amber-200">
                                <Flame className="h-3.5 w-3.5" />
                                Hot
                              </span>
                            )}

                            {(p.tags || []).length > 0 && (
                              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.7rem] font-semibold text-white/75">
                                <Sparkles className="h-3.5 w-3.5 text-white/70" />
                                {p.tags?.[0]}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 truncate text-base font-semibold text-white">
                            {p.title}
                          </h3>

                          <p className="mt-2 text-sm text-white/65 leading-relaxed line-clamp-2">
                            {p.content}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {(p.tags || []).slice(0, 3).map((t, i) => (
                              <Tag
                                key={t}
                                text={t}
                                tone={
                                  i === 0
                                    ? "violet"
                                    : i === 1
                                    ? "sky"
                                    : "fuchsia"
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(p._id)}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* footer row */}
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                            <img
                              src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=96&q=80"
                              alt="avatar"
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-white">
                                Club Member
                              </span>
                            </div>
                            <div className="mt-0.5 text-[0.72rem] text-white/55">
                              {formatDate(p.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(p._id, isLiked || false)}
                            className="inline-flex items-center gap-1.5 text-[0.72rem] text-white/55 hover:text-white transition cursor-pointer"
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4",
                                isLiked && "fill-red-500 text-red-500"
                              )}
                            />
                            {p.likeCount || 0}
                          </button>

                          <Stat
                            icon={<MessageSquare className="h-4 w-4" />}
                            value={0}
                          />
                          <Stat icon={<Eye className="h-4 w-4" />} value={0} />

                          <button
                            type="button"
                            onClick={() => router.push(`/club/forum/${p._id}`)}
                            className="rounded-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 px-4 py-2 text-[0.72rem] font-semibold text-white/85 transition"
                          >
                            Xem bài →
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

            {/* Pagination */}
            <div className={cn("rounded-3xl p-4", glass)}>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/55">Trang 1 / 3</div>
                <div className="flex items-center gap-2">
                  <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      className={cn(
                        "h-9 w-9 rounded-xl border text-xs font-semibold transition",
                        p === 1
                          ? "border-white/15 bg-white/[0.10] text-white"
                          : "border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/[0.10]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Quick actions */}
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
                onClick={() => alert("Demo: tạo bài viết")}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-[0.78rem] font-bold text-slate-900 shadow-lg shadow-cyan-500/35 hover:shadow-cyan-500/55 hover:brightness-110 active:scale-95 transition"
              >
                Tạo bài viết
              </button>

              <button
                type="button"
                onClick={() => alert("Demo: tạo thông báo")}
                className="mt-2 w-full rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[0.78rem] font-semibold text-white/85 hover:bg-white/[0.10] transition"
              >
                Tạo thông báo
              </button>
            </div>

            {/* Top tags */}
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
                {tagStats.map(([t, count], i) => (
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
                    <span className="text-white/55 font-semibold">
                      ({count})
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Rules */}
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

            {/* Online members */}
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

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePostCreated}
        token={token || ""}
      />
    </div>
  );
}
