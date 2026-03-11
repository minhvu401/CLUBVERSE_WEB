"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  Activity,
  ArrowRight,
  Building2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Users2,
  MessageSquare,
  Eye,
  Search,
  Heart,
  Calendar,
  Loader2,
  UserCheck,
  Crown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { ProfileResponse } from "../services/api/auth";
import {
  getAllPosts,
  type PostItem,
  type PostSort,
} from "../services/api/post";
import { getAllClubs, type ClubItem } from "../services/api/auth";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type AdminAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  badge?: string;
};

const actions: AdminAction[] = [
  {
    title: "Đơn ứng tuyển",
    description: "Theo dõi, lên lịch và phản hồi cho từng ứng viên.",
    href: "/admin/applications",
    icon: FileText,
    accent: "from-rose-500/40 to-orange-500/40",
    badge: "Ưu tiên",
  },
  {
    title: "Quản lý câu lạc bộ",
    description: "Kích hoạt, khóa hoặc xác thực thông tin CLB.",
    href: "/admin/clubs",
    icon: Building2,
    accent: "from-indigo-500/40 to-cyan-500/40",
  },
  {
    title: "Diễn đàn & cộng đồng",
    description: "Giám sát các cuộc thảo luận và báo cáo vi phạm.",
    href: "/club/forum",
    icon: Users2,
    accent: "from-emerald-500/40 to-lime-500/40",
  },
  {
    title: "Bảng điều phối",
    description: "Tổng quan nhanh trạng thái hoạt động của hệ thống.",
    href: "/club/dashboard",
    icon: Activity,
    accent: "from-violet-500/40 to-fuchsia-500/40",
  },
];

const checklist = [
  {
    title: "Đảm bảo quyền truy cập",
    detail:
      "Xác minh rằng mỗi quản trị viên được gán CLB cụ thể để thao tác dữ liệu.",
  },
  {
    title: "Thông báo kịp thời",
    detail: "Kích hoạt email hoặc SMS khi đơn cần quyết định cuối cùng.",
  },
  {
    title: "Luồng phê duyệt 2 bước",
    detail: "Kiểm tra log trước khi chấp nhận hoặc từ chối thành viên mới.",
  },
];

function ActionCard({ action }: { action: AdminAction }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-5 text-white",
        "transition hover:scale-[1.01] hover:border-white/30",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-white/70">
          <ShieldCheck className="h-4 w-4 text-white/60" />
          Admin Toolkit
        </div>
        {action.badge ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] text-white/80">
            {action.badge}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div
          className={cn(
            "rounded-2xl p-3 text-white",
            "bg-gradient-to-br",
            action.accent,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{action.title}</h3>
          <p className="mt-1 text-sm text-white/70">{action.description}</p>
        </div>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
        Đi tới trang
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function AdminLandingPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth() as {
    user: ProfileResponse;
    token: string;
    loading: boolean;
  };

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<PostSort>("newest");
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);

  const isAdmin = useMemo(
    () => String(user?.role || "").toLowerCase() === "admin",
    [user?.role],
  );

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [loading, token, isAdmin, router]);

  // Fetch clubs
  const fetchClubs = useCallback(async () => {
    if (!token) return;

    setIsLoadingClubs(true);
    try {
      const allClubs = await getAllClubs(token);
      setClubs(allClubs);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
    } finally {
      setIsLoadingClubs(false);
    }
  }, [token]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!token) return;

    setIsLoadingPosts(true);
    try {
      const allPosts = await getAllPosts(token, { sortBy, limit: 50 });
      setPosts(allPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [token, sortBy]);

  useEffect(() => {
    if (token && isAdmin) {
      fetchPosts();
      fetchClubs();
    }
  }, [token, isAdmin, fetchPosts, fetchClubs]);

  // Filter posts by search query
  const displayedPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;

    const query = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [posts, searchQuery]);

  if (loading) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden text-white">
        <BackgroundGlow />
        <Header />
        <main className="mx-auto max-w-5xl px-4 pt-16">
          <div className={cn("rounded-3xl p-6 text-sm text-white/70", glass)}>
            Đang tải trung tâm quản trị...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!token || !isAdmin) {
    return null;
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <BackgroundGlow />
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <section className={cn("rounded-[32px] p-8", glass)}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/70">
                Xin chào, {user?.fullName || "Admin"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-white">
                Trung tâm điều phối Clubverse
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70">
                Tổng hợp nhanh các khu vực quan trọng để bạn giám sát hoạt động
                hệ thống, duy trì trải nghiệm minh bạch cho các câu lạc bộ và
                ứng viên.
              </p>
            </div>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-white/60" />
                {new Date().toLocaleDateString("vi-VN")}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white/60" />
                Quyền: Toàn hệ thống
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatPill
              label="CLB đang hoạt động"
              value={(user as any)?.activeClubs ?? "—"}
            />
            <StatPill
              label="Đơn chờ duyệt"
              value={(user as any)?.pendingApplications ?? "—"}
            />
            <StatPill label="Báo cáo mới" value={(user as any)?.reports ?? 0} />
            <StatPill
              label="Lần đăng nhập"
              value={(user as any)?.lastLogin || "Hôm nay"}
            />
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {actions.map((action) => (
            <ActionCard key={action.href} action={action} />
          ))}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className={cn("rounded-3xl p-6", glass)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">
                  Hướng dẫn tác vụ tuần này
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Checklist nhanh
                </h2>
              </div>
              <Users2 className="h-6 w-6 text-white/60" />
            </div>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-2xl border border-white/10 p-4"
                >
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-white/65">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={cn("rounded-3xl p-6", glass)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Báo cáo trạng thái</p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Tín hiệu hệ thống
                </h2>
              </div>
              <Activity className="h-6 w-6 text-white/60" />
            </div>
            <div className="mt-5 space-y-4 text-sm text-white/70">
              <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                Nền tảng đang ổn định. Không có cảnh báo hiệu năng hoặc dịch vụ
                thất bại trong 24h qua.
              </p>
              <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                02 câu lạc bộ đang chờ xác thực giấy tờ. Ưu tiên xử lý trong hôm
                nay để không làm trì hoãn đợt tuyển thành viên của họ.
              </p>
              <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                Có 01 báo cáo nội dung cần xem lại tại khu vực diễn đàn. Kiểm
                tra mục Diễn đàn & cộng đồng để phản hồi.
              </p>
            </div>
          </div>
        </section>

        {/* Posts Statistics Section */}
        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              Thống kê bài viết
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Tổng quan về nội dung diễn đàn và bài viết
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className={cn("rounded-2xl p-5", glass)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-white/60">Tổng bài viết</div>
                  <div className="text-2xl font-semibold text-white">
                    {posts.length}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl grid place-items-center border border-purple-400/25 bg-purple-400/15 text-purple-200">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className={cn("rounded-2xl p-5", glass)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-white/60">Bài có hình ảnh</div>
                  <div className="text-2xl font-semibold text-white">
                    {
                      posts.filter((p) => p.images && p.images.length > 0)
                        .length
                    }
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl grid place-items-center border border-blue-400/25 bg-blue-400/15 text-blue-200">
                  <Eye className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Club Members Management Section */}
        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users2 className="h-5 w-5 text-emerald-400" />
              Quản lý thành viên CLB
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Tổng quan về thành viên các câu lạc bộ trong hệ thống
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className={cn("rounded-2xl p-5", glass)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-white/60">Tổng CLB</div>
                  <div className="text-2xl font-semibold text-white">
                    {clubs.length}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl grid place-items-center border border-emerald-400/25 bg-emerald-400/15 text-emerald-200">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className={cn("rounded-2xl p-5", glass)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-white/60">Tổng thành viên</div>
                  <div className="text-2xl font-semibold text-white">
                    {clubs.reduce(
                      (sum, club) =>
                        sum +
                        (Array.isArray(club.clubJoined)
                          ? club.clubJoined.length
                          : 0),
                      0,
                    )}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl grid place-items-center border border-blue-400/25 bg-blue-400/15 text-blue-200">
                  <UserCheck className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className={cn("rounded-2xl p-5", glass)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-white/60">CLB hoạt động</div>
                  <div className="text-2xl font-semibold text-white">
                    {clubs.filter((c) => c.rating && c.rating > 3).length}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl grid place-items-center border border-amber-400/25 bg-amber-400/15 text-amber-200">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className={cn("rounded-2xl p-5", glass)}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-white/60">Trung bình TV/CLB</div>
                  <div className="text-2xl font-semibold text-white">
                    {clubs.length > 0
                      ? Math.round(
                          clubs.reduce(
                            (sum, club) =>
                              sum +
                              (Array.isArray(club.clubJoined)
                                ? club.clubJoined.length
                                : 0),
                            0,
                          ) / clubs.length,
                        )
                      : 0}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl grid place-items-center border border-cyan-400/25 bg-cyan-400/15 text-cyan-200">
                  <Users2 className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Clubs List with Member Info */}
          <div className={cn("rounded-3xl p-6", glass)}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Danh sách câu lạc bộ
                </h3>
                <p className="mt-1 text-sm text-white/60">
                  Xem chi tiết thành viên của từng CLB
                </p>
              </div>
              <Link
                href="/admin/clubs"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/15 transition"
              >
                Quản lý CLB
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoadingClubs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : clubs.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-white/30" />
                <p className="mt-4 text-white/60">Chưa có câu lạc bộ nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clubs.slice(0, 6).map((club) => (
                  <div
                    key={club._id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white line-clamp-1">
                          {club.fullName || "Unnamed Club"}
                        </h4>
                        <p className="mt-1 text-sm text-white/70 line-clamp-1">
                          {club.category || "Chưa phân loại"}
                        </p>

                        <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5" />
                            {Array.isArray(club.clubJoined)
                              ? club.clubJoined.length
                              : 0}{" "}
                            thành viên
                          </div>
                          {club.rating && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5 text-rose-400" />
                              {club.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                          <Crown className="h-3 w-3" />
                          CLB
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {clubs.length > 6 && (
              <div className="mt-4 text-center">
                <Link
                  href="/admin/clubs"
                  className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Xem tất cả {clubs.length} câu lạc bộ
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Posts Management Section */}
        <section className="mt-6">
          <div className={cn("rounded-3xl p-6", glass)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Quản lý nội dung</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  Bài viết & Diễn đàn
                </h2>
              </div>
              <MessageSquare className="h-6 w-6 text-white/60" />
            </div>

            {/* Filters and Search */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300/70" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-purple-400/30 bg-purple-400/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-purple-200/50 hover:bg-purple-400/15 focus:border-purple-400/50 focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as PostSort)}
                  className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-2.5 text-sm font-medium text-purple-200 hover:bg-purple-400/15 focus:border-purple-400/50 focus:outline-none transition"
                >
                  <option value="newest" className="bg-slate-800">
                    📅 Mới nhất
                  </option>
                  <option value="oldest" className="bg-slate-800">
                    ⏰ Cũ nhất
                  </option>
                  <option value="popular" className="bg-slate-800">
                    🔥 Phổ biến
                  </option>
                </select>
              </div>
            </div>

            {/* Posts List */}
            <div className="mt-6">
              {isLoadingPosts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : displayedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-white/30" />
                  <p className="mt-4 text-white/60">
                    {searchQuery
                      ? "Không tìm thấy bài viết nào"
                      : "Chưa có bài viết nào"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}

              {/* Stats */}
              {!isLoadingPosts && displayedPosts.length > 0 && (
                <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                  <div>
                    Hiển thị {displayedPosts.length} bài viết
                    {searchQuery && ` (đã lọc)`}
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Tổng bài viết: {posts.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function PostCard({ post }: { post: PostItem }) {
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-1 h-5 w-5 text-white/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white line-clamp-1">
                {post.title || "Untitled"}
              </h3>
              <p className="mt-1 text-sm text-white/70 line-clamp-2">
                {post.content}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-blue-400/10 px-2.5 py-0.5 text-xs text-blue-200 border border-blue-400/20"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-xs text-white/50">
                      +{post.tags.length - 3} thêm
                    </span>
                  )}
                </div>
              )}

              {/* Meta info */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/50">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </div>
                {post.likeCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {post.likeCount} lượt thích
                  </div>
                )}
                {post.images && post.images.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {post.images.length} hình ảnh
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/forum/post/${post._id}`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white border border-white/10 transition"
            title="Xem chi tiết"
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Xem
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="text-xs uppercase tracking-wide text-white/60">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white/90">{value}</div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="pointer-events-none absolute -top-44 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 left-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />
    </>
  );
}
