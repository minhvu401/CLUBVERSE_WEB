import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/app/services/api/admin";
import { toast } from "sonner";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getDashboardStats,
  });
};

export const useAdminUsers = (page = 1, limit = 10, search = "", role = "") => {
  return useQuery({
    queryKey: ["admin", "users", { page, limit, search, role }],
    queryFn: () => adminApi.getUsers(page, limit, search, role),
  });
};

export const useAdminUserDetail = (userId?: string) => {
  return useQuery({
    queryKey: ["admin", "user-detail", userId],
    queryFn: () => adminApi.getUserProfile(userId!),
    enabled: !!userId,
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deactivateUser,
    onSuccess: () => {
      toast.success("Đã vô hiệu hóa tài khoản");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể vô hiệu hóa người dùng");
    },
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.reactivateUser,
    onSuccess: () => {
      toast.success("Đã kích hoạt lại tài khoản");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể kích hoạt lại tài khoản");
    },
  });
};

export const useAdminApplications = (clubId?: string) => {
  return useQuery({
    queryKey: ["admin", "applications", { clubId }],
    queryFn: async () => {
      if (!clubId) return [];
      const data = await adminApi.getApplicationsByClub(clubId);
      return Array.isArray(data) ? data : (data as any)?.applications || [];
    },
    enabled: !!clubId,
  });
};

export const useApproveApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, ...data }: { appId: string; interviewDate: string; interviewLocation: string; interviewNote?: string; }) => 
      adminApi.approveApplication(appId, data),
    onSuccess: () => {
      toast.success("Đã duyệt đơn đăng ký");
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể duyệt đơn đăng ký");
    },
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, rejectionReason }: { appId: string; rejectionReason: string; }) => 
      adminApi.rejectApplication(appId, { rejectionReason }),
    onSuccess: () => {
      toast.success("Đã từ chối đơn đăng ký");
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể từ chối đơn đăng ký");
    },
  });
};

export const useAdminClubs = () => {
  return useQuery({
    queryKey: ["admin", "clubs"],
    queryFn: async () => {
      const data = await adminApi.getClubs();
      return Array.isArray(data) ? data : (data as any)?.clubs || [];
    },
  });
};

export const useAdminEvents = (clubId?: string) => {
  return useQuery({
    queryKey: ["admin", "events", { clubId }],
    queryFn: async () => {
      const data = clubId ? await adminApi.getClubEvents(clubId) : await adminApi.getAllEvents();
      return Array.isArray(data) ? data : (data as any)?.events || [];
    },
  });
};

export const useAdminPosts = (clubId?: string) => {
  return useQuery({
    queryKey: ["admin", "posts", { clubId }],
    queryFn: async () => {
      const data = clubId ? await adminApi.getClubPosts(clubId) : await adminApi.getAllPosts();
      return Array.isArray(data) ? data : (data as any)?.posts || [];
    },
  });
};

export const useAdminEventDetail = (eventId?: string) => {
  return useQuery({
    queryKey: ["admin", "event-detail", eventId],
    queryFn: () => adminApi.getEventDetail(eventId!),
    enabled: !!eventId,
  });
};

export const useAdminEventParticipants = (eventId?: string) => {
  return useQuery({
    queryKey: ["admin", "event-participants", eventId],
    queryFn: () => adminApi.getEventParticipants(eventId!),
    enabled: !!eventId,
  });
};

export const useSoftDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.softDeleteEvent,
    onSuccess: () => {
      toast.success("Đã hủy sự kiện (Soft delete)");
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể hủy sự kiện");
    },
  });
};

export const useHardDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.hardDeleteEvent,
    onSuccess: () => {
      toast.success("Đã xóa vĩnh viễn sự kiện");
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa vĩnh viễn sự kiện");
    },
  });
};

export const useRestoreEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.restoreEvent,
    onSuccess: () => {
      toast.success("Đã khôi phục sự kiện");
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể khôi phục sự kiện");
    },
  });
};

export const useAdminPostDetail = (postId?: string) => {
  return useQuery({
    queryKey: ["admin", "post-detail", postId],
    queryFn: () => adminApi.getPostDetail(postId!),
    enabled: !!postId,
  });
};

export const useAdminRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.registerUser,
    onSuccess: () => {
      toast.success("Đăng ký tài khoản thành công");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Không thể đăng ký tài khoản");
    },
  });
};

export const useAdminVerifyOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.verifyOtp,
    onSuccess: (_, variables) => {
      toast.success(`Xác thực tài khoản ${variables.email} thành công`);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user-detail"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Xác thực OTP thất bại");
    },
  });
};

export const useAdminResendOtp = () => {
  return useMutation({
    mutationFn: adminApi.resendOtp,
    onSuccess: (_, email) => {
      toast.success(`Đã gửi lại mã OTP tới ${email}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Gửi lại OTP thất bại");
    },
  });
};
