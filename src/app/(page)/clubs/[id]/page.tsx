/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/layout/header/page";
import Footer from "@/app/layout/footer/page";
import { useAuth } from "@/app/providers/AuthProviders";
import { AUTH_BASE_URL } from "@/app/services/api/auth";
import { createApplication, getMyApplications } from "@/app/services/api/applications";
import { sendMessageToClub } from "@/app/services/api/messages";

import {
  Mail,
  Phone,
  School,
  GraduationCap,
  Star,
  FileText,
  ChevronLeft,
  BadgeCheck,
  Activity,
  Clock,
  Sparkles,
  X,
  Check,
} from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const glass =
  "border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

type ClubDetail = {
  _id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  school?: string;
  major?: string;
  year?: number;
  rating?: number;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  posts?: {
    postId: string;
    title: string;
    createdAt: string;
  }[];
};

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clubId = params?.id;

  const { token, loading } = useAuth() as any;

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState("");
  
  // Application status
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Message state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  /* ================= FETCH CLUB DETAIL ================= */
  useEffect(() => {
    if (!clubId || !token || loading) return;

    (async () => {
      try {
        setLoadingPage(true);
        const res = await fetch(`${AUTH_BASE_URL}/users/${clubId}`, {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Không tải được CLB");

        setClub(data?.user ?? data);
      } catch (e: any) {
        setError(e.message || "Lỗi tải CLB");
      } finally {
        setLoadingPage(false);
      }
    })();
  }, [clubId, token, loading]);

  /* ================= CHECK APPLICATION STATUS ================= */
  useEffect(() => {
    if (!clubId || !token || loading) return;

    (async () => {
      try {
        setCheckingStatus(true);
        const applications = await getMyApplications({
          accessToken: token,
        });

        // Tìm đơn đăng ký cho câu lạc bộ này
        const clubApplication = applications.find((app: any) => {
          const appClubId = typeof app.clubId === "string" ? app.clubId : app.clubId?._id;
          return appClubId === clubId;
        });

        if (clubApplication) {
          setApplicationStatus(clubApplication.status);
        } else {
          setApplicationStatus(null);
        }
      } catch (e: any) {
        console.error("Lỗi kiểm tra trạng thái đơn:", e.message);
        setApplicationStatus(null);
      } finally {
        setCheckingStatus(false);
      }
    })();
  }, [clubId, token, loading]);

  /* ================= GROUP 2 DATA ================= */
  const timeline = useMemo(() => {
    if (!club) return [];
    const items: { label: string; time: string }[] = [];

    if (club.createdAt) {
      items.push({ label: "Thành lập CLB", time: club.createdAt });
    }

    if (club.posts?.length) {
      const sorted = [...club.posts].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      items.push({
        label: "Bài viết đầu tiên",
        time: sorted[0].createdAt,
      });

      items.push({
        label: "Hoạt động gần nhất",
        time: sorted[sorted.length - 1].createdAt,
      });
    }

    return items;
  }, [club]);

  const highlightPost = useMemo(() => {
    if (!club?.posts?.length) return null;
    return [...club.posts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [club]);

  /* ================= GET BUTTON STATE ================= */
  const getButtonState = () => {
    if (checkingStatus) {
      return {
        text: "Đang kiểm tra...",
        disabled: true,
        variant: "default",
        show: true,
      };
    }

    // Chưa đăng ký
    if (!applicationStatus) {
      return {
        text: "Đăng kí tham gia",
        disabled: false,
        variant: "primary",
        show: true,
      };
    }

    // Đã gửi đơn
    if (applicationStatus === "PENDING") {
      return {
        text: "Đã gửi đơn đăng kí",
        disabled: true,
        variant: "pending",
        show: true,
      };
    }

    // Đã tham gia
    if (applicationStatus === "APPROVED" || applicationStatus === "ACCEPTED") {
      return {
        text: "Đã tham gia",
        disabled: true,
        variant: "success",
        show: true,
      };
    }

    // Đơn bị từ chối
    if (applicationStatus === "REJECTED" || applicationStatus === "DECLINED") {
      return {
        text: "Đơn bị từ chối",
        disabled: true,
        variant: "danger",
        show: true,
      };
    }

    // Mặc định
    return {
      text: "Đã gửi đơn đăng kí",
      disabled: true,
      variant: "pending",
      show: true,
    };
  };

  const buttonState = getButtonState();

  /* ================= HANDLE JOIN ================= */
  const handleJoinClick = () => {
    setIsModalOpen(true);
    setSubmitMessage("");
    setSubmitError("");
    setReason("");
  };

  const handleSubmitApplication = async () => {
    if (!reason.trim()) {
      setSubmitError("Vui lòng nhập lý do muốn tham gia CLB");
      return;
    }

    if (!clubId || !token) {
      setSubmitError("Thông tin không đủ để gửi đơn đăng ký");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await createApplication({
        accessToken: token,
        clubId: clubId,
        reason: reason.trim(),
      });

      setSubmitMessage("Đơn đăng ký của bạn đã được gửi thành công!");
      setReason("");
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitMessage("");
        setApplicationStatus("PENDING");
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || "Lỗi khi gửi đơn đăng ký");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setReason("");
      setSubmitMessage("");
      setSubmitError("");
    }
  };

  /* ================= HANDLE MESSAGE ================= */
  const handleMessageClick = () => {
    setIsMessageModalOpen(true);
    setMessageContent("");
    setMessageError("");
    setMessageSent(false);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setMessageError("Vui lòng nhập nội dung tin nhắn");
      return;
    }

    if (!clubId || !token) {
      setMessageError("Thông tin không đủ để gửi tin nhắn");
      return;
    }

    try {
      setIsSendingMessage(true);
      setMessageError("");

      // ✅ Sử dụng hàm sendMessageToClub từ API
      // Hàm này sẽ gọi POST /messages với recipientId
      await sendMessageToClub(token, {
        clubId: clubId,
        content: messageContent.trim(),
      });

      setMessageSent(true);
      setMessageContent("");

      setTimeout(() => {
        setIsMessageModalOpen(false);
        setMessageSent(false);
      }, 2000);
    } catch (err: any) {
      setMessageError(err.message || "Lỗi khi gửi tin nhắn");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCloseMessageModal = () => {
    if (!isSendingMessage) {
      setIsMessageModalOpen(false);
      setMessageContent("");
      setMessageError("");
      setMessageSent(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950" />

      <Header />

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </button>

        {loadingPage && (
          <div className={cn("rounded-2xl p-6 font-semibold", glass)}>
            Đang tải câu lạc bộ…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/15 p-4 text-sm font-semibold text-rose-200">
            {error}
          </div>
        )}

        {!loadingPage && club && (
          <section className="space-y-6">
            {/* HEADER */}
            <div className={cn("rounded-3xl p-6 flex gap-5 flex-col sm:flex-row justify-between sm:items-start", glass)}>
              <div className="flex gap-5">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-semibold flex-shrink-0">
                  {club.fullName.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold">{club.fullName}</h1>
                    {club.isVerified && (
                      <BadgeCheck className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-xs font-semibold">
                    <span className="text-violet-300">CÂU LẠC BỘ</span>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                        club.isActive
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-300"
                      )}
                    >
                      <Activity className="h-3 w-3" />
                      {club.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                    <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5">
                      <FileText className="h-4 w-4" />
                      {club.posts?.length || 0} bài viết
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5">
                      <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                      {club.rating ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA BUTTON */}
              <div className="flex gap-3 mt-4 sm:mt-0">
                {buttonState.show && (
                  <button
                    onClick={handleJoinClick}
                    disabled={buttonState.disabled}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2",
                      buttonState.variant === "primary" &&
                        "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-violet-500/30",
                      buttonState.variant === "pending" &&
                        "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                      buttonState.variant === "success" &&
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                      buttonState.variant === "danger" &&
                        "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                      buttonState.variant === "default" && "bg-white/10 text-white/70",
                      buttonState.disabled && "cursor-not-allowed"
                    )}
                  >
                    {(buttonState.variant === "success" ||
                      buttonState.variant === "pending") && (
                      <Check className="h-4 w-4" />
                    )}
                    {buttonState.text}
                  </button>
                )}

                {/* MESSAGE BUTTON - Show when user has sent application or is approved/accepted */}
                {applicationStatus === "PENDING" || applicationStatus === "APPROVED" || applicationStatus === "ACCEPTED" ? (
                  <button
                    onClick={handleMessageClick}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-500/50"
                  >
                    <Mail className="h-4 w-4" />
                    Nhắn tin
                  </button>
                ) : null}
              </div>
            </div>

            {/* HIGHLIGHT POST */}
            {highlightPost && (
              <div className={cn("rounded-2xl p-5", glass)}>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                  Bài viết nổi bật
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">
                      {highlightPost.title}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {new Date(
                        highlightPost.createdAt
                      ).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  <Link
                    href={`/forum/post/${highlightPost.postId}`}
                    className="rounded-full bg-white/[0.08] px-4 py-1.5 text-xs font-semibold hover:bg-white/[0.12]"
                  >
                    Xem →
                  </Link>
                </div>
              </div>
            )}

            {/* GIỚI THIỆU DÀI */}
            <div className="space-y-6">
              <div className={cn("rounded-2xl p-5", glass)}>
                <h2 className="mb-3 text-sm font-semibold text-white/90">
                  Giới thiệu về {club.fullName}
                </h2>

                <p className="text-sm font-semibold leading-relaxed text-white/75">
                  {club.fullName} là câu lạc bộ trực thuộc{" "}
                  <span className="text-white/90">
                    {club.school || "nhà trường"}
                  </span>
                  , được thành lập nhằm tạo ra một môi trường học tập và giao
                  lưu lành mạnh cho sinh viên có cùng đam mê trong lĩnh vực{" "}
                  <span className="text-white/90">
                    {club.major || "hoạt động CLB"}
                  </span>
                  .
                </p>

                <p className="mt-3 text-sm font-semibold leading-relaxed text-white/75">
                  Thông qua các buổi sinh hoạt, chia sẻ kinh nghiệm và hoạt
                  động thực tế, CLB hướng tới việc giúp các thành viên phát
                  triển kiến thức chuyên môn, kỹ năng mềm cũng như mở rộng
                  mối quan hệ trong cộng đồng sinh viên.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className={cn("rounded-2xl p-5", glass)}>
                  <div className="mb-2 text-sm font-semibold text-white/90">
                    🎯 Sứ mệnh
                  </div>
                  <p className="text-sm font-semibold text-white/70">
                    Xây dựng môi trường học hỏi tích cực, hỗ trợ sinh viên
                    phát triển toàn diện về kiến thức và kỹ năng.
                  </p>
                </div>

                <div className={cn("rounded-2xl p-5", glass)}>
                  <div className="mb-2 text-sm font-semibold text-white/90">
                    🚀 Tầm nhìn
                  </div>
                  <p className="text-sm font-semibold text-white/70">
                    Trở thành câu lạc bộ uy tín, năng động và có ảnh hưởng
                    tích cực trong cộng đồng sinh viên.
                  </p>
                </div>

                <div className={cn("rounded-2xl p-5", glass)}>
                  <div className="mb-2 text-sm font-semibold text-white/90">
                    💎 Giá trị cốt lõi
                  </div>
                  <ul className="space-y-1 text-sm font-semibold text-white/70">
                    <li>• Chủ động học hỏi</li>
                    <li>• Kết nối & chia sẻ</li>
                    <li>• Thực hành gắn liền thực tế</li>
                    <li>• Phát triển bền vững</li>
                  </ul>
                </div>
              </div>

              <div className={cn("rounded-2xl p-5", glass)}>
                <h3 className="mb-3 text-sm font-semibold text-white/90">
                  CLB phù hợp với ai?
                </h3>

                <ul className="space-y-2 text-sm font-semibold text-white/75">
                  <li>✔️ Sinh viên theo học ngành {club.major || "liên quan"}</li>
                  <li>✔️ Sinh viên mong muốn học hỏi qua hoạt động thực tế</li>
                  <li>✔️ Những bạn muốn mở rộng mối quan hệ và kỹ năng mềm</li>
                  <li>✔️ Các bạn có tinh thần chủ động và trách nhiệm</li>
                </ul>
              </div>

              <div className={cn("rounded-2xl p-5", glass)}>
                <h3 className="mb-3 text-sm font-semibold text-white/90">
                  Timeline hoạt động
                </h3>

                <div className="space-y-3">
                  {timeline.map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-violet-400" />
                      <div className="text-sm font-semibold">
                        {t.label}
                      </div>
                      <div className="ml-auto text-xs text-white/60">
                        {new Date(t.time).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={cn("rounded-2xl w-full max-w-md p-6", glass)}>
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Đăng kí tham gia {club?.fullName}</h3>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CONTENT */}
            {!submitMessage && (
              <>
                <p className="text-sm text-white/70 mb-4">
                  Hãy chia sẻ lý do bạn muốn tham gia câu lạc bộ này. Điều này sẽ giúp ban quản lý hiểu rõ hơn về bạn.
                </p>

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do của bạn..."
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none h-32 disabled:opacity-50"
                />

                {submitError && (
                  <p className="mt-3 text-xs text-rose-300 bg-rose-500/15 px-3 py-2 rounded-lg">
                    {submitError}
                  </p>
                )}

                {/* BUTTONS */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi đơn"}
                  </button>
                </div>
              </>
            )}

            {/* SUCCESS MESSAGE */}
            {submitMessage && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                  <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm font-semibold text-emerald-300 text-center">
                  {submitMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={cn("rounded-2xl w-full max-w-md p-6", glass)}>
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nhắn tin tới {club?.fullName}</h3>
              <button
                onClick={handleCloseMessageModal}
                disabled={isSendingMessage}
                className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CONTENT */}
            {!messageSent && (
              <>
                <p className="text-sm text-white/70 mb-4">
                  Gửi tin nhắn đến câu lạc bộ này
                </p>

                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Nhập nội dung tin nhắn..."
                  disabled={isSendingMessage}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-32 disabled:opacity-50"
                />

                {messageError && (
                  <p className="mt-3 text-xs text-rose-300 bg-rose-500/15 px-3 py-2 rounded-lg">
                    {messageError}
                  </p>
                )}

                {/* BUTTONS */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCloseMessageModal}
                    disabled={isSendingMessage}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={isSendingMessage}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {isSendingMessage ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
              </>
            )}

            {/* SUCCESS MESSAGE */}
            {messageSent && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                  <div className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm font-semibold text-emerald-300 text-center">
                  Tin nhắn đã được gửi thành công!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}