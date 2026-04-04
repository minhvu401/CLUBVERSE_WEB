"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import {
  getClubMembers,
  getMemberStatistics,
  updateMemberRole,
  removeMember,
  exportMemberList,
  getPendingActions,
  approvePendingAction,
  rejectPendingAction,
  type ClubMember,
  type MemberStatisticsResponse,
  type UpdateRoleRequest,
  type RemoveMemberRequest,
  type PendingActionsResponse,
} from "@/app/services/api/clubMembers";

import {
  Users,
  Search,
  MoreHorizontal,
  UserCheck,
  Crown,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Edit,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";

import { motion, Variants } from "framer-motion";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

function StatCard({
  title,
  value,
  icon,
  tone = "blue",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "red" | "yellow" | "purple";
}) {
  const toneMap: Record<string, string> = {
    blue: "bg-blue-400/15 text-blue-200 border-blue-400/25",
    green: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
    red: "bg-rose-400/15 text-rose-200 border-rose-400/25",
    yellow: "bg-yellow-400/15 text-yellow-200 border-yellow-400/25",
    purple: "bg-purple-400/15 text-purple-200 border-purple-400/25",
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn("rounded-2xl px-5 py-4 cursor-pointer border border-white/5 shadow-lg transition-colors hover:border-white/20", glass)}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <div className="text-xs text-white/60">{title}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>

        <div
          className={cn(
            "h-9 w-9 rounded-xl grid place-items-center border",
            toneMap[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function RoleBadge({ role }: { role: "admin" | "moderator" | "member" }) {
  const roleMap = {
    admin: {
      text: "Admin",
      icon: Crown,
      cls: "bg-purple-400/15 text-purple-200 border-purple-400/25",
    },
    moderator: {
      text: "Moderator",
      icon: Shield,
      cls: "bg-blue-400/15 text-blue-200 border-blue-400/25",
    },
    member: {
      text: "Member",
      icon: User,
      cls: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
    },
  };

  const config = roleMap[role];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.cls,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </span>
  );
}

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  const statusMap: Record<string, { text: string; cls: string; dot: string }> =
    {
      active: {
        text: "Hoạt động",
        cls: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
        dot: "bg-emerald-300",
      },
      inactive: {
        text: "Không hoạt động",
        cls: "bg-gray-400/15 text-gray-200 border-gray-400/25",
        dot: "bg-gray-300",
      },
    };

  const config = statusMap[status] || {
    text: status || "Unknown",
    cls: "bg-gray-400/15 text-gray-200 border-gray-400/25",
    dot: "bg-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        config.cls,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.text}
    </span>
  );
}

export default function ClubMembersPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [members, setMembers] = useState<ClubMember[]>([]);
  const [statistics, setStatistics] = useState<MemberStatisticsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("all");
  const [roleFilter, setRoleFilter] = useState<
    "admin" | "moderator" | "member" | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "moderator" | "member">(
    "member",
  );
  const [removeReason, setRemoveReason] = useState("");
  const [pendingActions, setPendingActions] =
    useState<PendingActionsResponse | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const LIMIT = 10;

  const isClubRole = useMemo(
    () => String(user?.role || "").toLowerCase() === "club",
    [user?.role],
  );

  // Get club ID from user profile
  const clubId = useMemo(() => {
    if (!user) return null;

    // If user is a club account, use their ID as clubId
    if (user.role?.toLowerCase() === "club") {
      return user._id || user.id;
    }

    // If user is a student, get clubId from clubJoined
    if (!user?.clubJoined || !Array.isArray(user.clubJoined)) {
      return null;
    }

    const club = user.clubJoined[0];
    return typeof club === "string" ? club : club?._id;
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isClubRole) {
      router.replace("/");
      return;
    }
  }, [loading, token, isClubRole, router]);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    if (!token || !clubId) return;

    setIsLoading(true);
    try {
      const params = {
        status: statusFilter === "all" ? undefined : statusFilter,
        role: roleFilter === "all" ? undefined : roleFilter,
        search: searchQuery || undefined,
        sortBy,
      };

      const response = await getClubMembers(token, clubId, params);
      setMembers(response.members);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, clubId, statusFilter, roleFilter, searchQuery, sortBy]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!token || !clubId) return;

    const computeFallback = async () => {
      try {
        const allMembersRes = await getClubMembers(token, clubId);
        const allM = allMembersRes.members || [];
        setStatistics({
          totalMembers: allM.length,
          activeMembers: allM.filter((m) => m.isActive).length,
          inactiveMembers: allM.filter((m) => !m.isActive).length,
          admins: allM.filter((m) => m.role === "admin").length,
          moderators: allM.filter((m) => m.role === "moderator").length,
          members: allM.filter((m) => m.role === "member" || !m.role).length,
        });
      } catch (e) {
        console.error("Fallback stats failed", e);
      }
    };

    try {
      const stats = await getMemberStatistics(token, clubId);
      if (!stats || stats.totalMembers === 0) {
        await computeFallback();
      } else {
        setStatistics(stats);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      await computeFallback();
    }
  }, [token, clubId]);

  // Fetch pending actions
  const fetchPendingActions = useCallback(async () => {
    if (!token || !clubId) return;

    try {
      const actions = await getPendingActions(token, clubId);
      setPendingActions(actions);
    } catch (error) {
      // Silently ignore 403 errors - endpoint may not be available for all clubs
      if (error instanceof Error && error.message.includes("403")) {
        setPendingActions(null);
      } else {
        console.error("Failed to fetch pending actions:", error);
      }
    }
  }, [token, clubId]);

  useEffect(() => {
    if (token && clubId) {
      fetchMembers();
      fetchStatistics();
      fetchPendingActions();
    }
  }, [token, clubId, fetchMembers, fetchStatistics, fetchPendingActions]);

  // Handle role update
  const handleUpdateRole = async () => {
    if (!token || !clubId || !selectedMember) return;

    setActioningId(selectedMember._id);
    try {
      const request: UpdateRoleRequest = {
        userId: selectedMember.userId,
        newRole,
      };

      await updateMemberRole(token, clubId, request);
      setShowRoleModal(false);
      setSelectedMember(null);
      fetchMembers(); // Refresh list
      fetchStatistics(); // Refresh stats
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setActioningId(null);
    }
  };

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!token || !clubId || !selectedMember) return;

    setActioningId(selectedMember._id);
    try {
      const request: RemoveMemberRequest = {
        userId: selectedMember.userId,
        reason: removeReason,
      };

      await removeMember(token, clubId, request);
      setShowRemoveModal(false);
      setSelectedMember(null);
      setRemoveReason("");
      fetchMembers(); // Refresh list
      fetchStatistics(); // Refresh stats
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setActioningId(null);
    }
  };

  // Handle export members
  const handleExportMembers = async () => {
    if (!token || !clubId) return;

    setIsExporting(true);
    try {
      const blob = await exportMemberList(
        token,
        clubId,
        statusFilter === "all" ? undefined : statusFilter,
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `members-${clubId}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export members:", error);
      alert("Không thể xuất danh sách thành viên");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle approve pending action
  const handleApprovePendingAction = async (actionId: string) => {
    if (!token) return;

    try {
      await approvePendingAction(token, actionId);
      fetchPendingActions();
      fetchMembers();
      fetchStatistics();
    } catch (error) {
      console.error("Failed to approve action:", error);
    }
  };

  // Handle reject pending action
  const handleRejectPendingAction = async (actionId: string) => {
    if (!token) return;

    try {
      await rejectPendingAction(token, actionId);
      fetchPendingActions();
    } catch (error) {
      console.error("Failed to reject action:", error);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const statsToDisplay = useMemo(() => {
    if (statistics && statistics.totalMembers > 0) {
      return statistics;
    }
    return {
      totalMembers: total || members.length,
      activeMembers: members.filter((m) => m.isActive !== false).length,
      inactiveMembers: members.filter((m) => m.isActive === false).length,
      admins: members.filter((m) => m.role === "admin").length,
      moderators: members.filter((m) => m.role === "moderator").length,
      members: members.filter((m) => m.role === "member" || !m.role).length,
    };
  }, [statistics, members, total]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Quản lý thành viên
            </h1>
            <p className="mt-2 text-white/70">
              Quản lý và theo dõi thành viên của câu lạc bộ
            </p>
          </div>
          <button
            onClick={handleExportMembers}
            disabled={isExporting || members.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/15 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Xuất danh sách
              </>
            )}
          </button>
        </div>

        {/* Statistics */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng thành viên"
            value={statsToDisplay.totalMembers}
            icon={<Users className="h-5 w-5" />}
            tone="blue"
          />
          <StatCard
            title="Thành viên hoạt động"
            value={statsToDisplay.activeMembers}
            icon={<UserCheck className="h-5 w-5" />}
            tone="green"
          />
          <StatCard
            title="Admin"
            value={statsToDisplay.admins}
            icon={<Crown className="h-5 w-5" />}
            tone="purple"
          />
          <StatCard
            title="Moderator"
            value={statsToDisplay.moderators}
            icon={<Shield className="h-5 w-5" />}
            tone="yellow"
          />
        </motion.div>

        {/* Pending Actions */}
        {pendingActions && pendingActions.actions.length > 0 && (
          <motion.div variants={itemVariants} initial="hidden" animate="show" className={cn("mb-6 rounded-2xl p-6", glass)}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">
                  Yêu cầu chờ xử lý
                </h3>
                <span className="inline-flex items-center justify-center rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-200">
                  {pendingActions.actions.length}
                </span>
              </div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
              {pendingActions.actions.map((action) => (
                <motion.div
                  variants={itemVariants}
                  key={action._id}
                  className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 hover:bg-amber-400/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {action.user?.fullName || "Unknown User"}
                      </p>
                      <p className="text-xs text-white/60">
                        {action.type} -{" "}
                        {new Date(action.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprovePendingAction(action._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/15 transition"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRejectPendingAction(action._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-400/15 transition"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Từ chối
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className={cn("mb-6 rounded-2xl p-6", glass)}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "active" | "inactive" | "all",
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(
                    e.target.value as "admin" | "moderator" | "member" | "all",
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="member">Member</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "oldest" | "name")
                }
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name">Theo tên</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Members List */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className={cn("rounded-2xl", glass)}>
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Danh sách thành viên ({total})
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-white/30" />
                <p className="mt-4 text-white/60">Không có thành viên nào</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                  <motion.div
                    variants={itemVariants}
                    key={member._id}
                    className="flex flex-col relative rounded-2xl border border-white/5 bg-white/[0.03] p-5 shadow-lg shadow-black/20 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/10 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Top Row: Avatar & Roles */}
                    <div className="flex items-start justify-between relative z-10 w-full mb-5">
                      <div className="flex items-center gap-3">
                        <Image
                          src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.fullName || member._id)}`}
                          alt={member.fullName || "Avatar"}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-cyan-500/30 transition-all"
                        />
                        <div>
                          <div className="font-semibold text-white truncate max-w-[150px]" title={member.fullName}>
                            {member.fullName}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                             <StatusBadge status={member.isActive ? "active" : "inactive"} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Details */}
                    <div className="relative z-10 space-y-2 mb-5 flex-1">
                      <div className="text-sm text-white/60 truncate" title={member.email}>
                        <Clock className="w-3.5 h-3.5 inline-block mr-1.5 -translate-y-[1px]"/>
                        {member.email}
                      </div>
                      <div className="text-xs text-white/50">
                        Gia nhập: {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
                      <RoleBadge role={member.role} />

                      <div className="relative">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="rounded-lg p-2 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {selectedMember?._id === member._id && (
                          <div
                            className={cn(
                              "absolute right-0 bottom-full z-20 mb-2 w-48 rounded-xl border border-white/10 bg-slate-800 p-2 shadow-2xl",
                              glass,
                            )}
                          >
                            <button
                              onClick={() => {
                                setNewRole(member.role);
                                setShowRoleModal(true);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                            >
                              <Edit className="h-4 w-4" />
                              Thay đổi vai trò
                            </button>
                            <button
                              onClick={() => setShowRemoveModal(true)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa thành viên
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-sm text-white/60">
                  Trang {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Role Update Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={cn("w-full max-w-md rounded-2xl p-6", glass)}>
            <h3 className="text-lg font-semibold text-white">
              Thay đổi vai trò
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Thay đổi vai trò của {selectedMember.fullName}
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-white/90">
                Vai trò mới
              </label>
              <select
                value={newRole}
                onChange={(e) =>
                  setNewRole(e.target.value as "admin" | "moderator" | "member")
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value="member">Member</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={actioningId === selectedMember._id}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actioningId === selectedMember._id ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Cập nhật"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={cn("w-full max-w-md rounded-2xl p-6", glass)}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-semibold text-white">
                Xóa thành viên
              </h3>
            </div>
            <p className="mt-2 text-sm text-white/70">
              Bạn có chắc muốn xóa {selectedMember.fullName} khỏi câu lạc bộ?
              Hành động này không thể hoàn tác.
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-white/90">
                Lý do xóa (bắt buộc)
              </label>
              <textarea
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                placeholder="Nhập lý do xóa thành viên..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setSelectedMember(null);
                  setRemoveReason("");
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={
                  actioningId === selectedMember._id || !removeReason.trim()
                }
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actioningId === selectedMember._id ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
