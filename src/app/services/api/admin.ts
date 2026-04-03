import axiosInstance from "@/lib/axios";
import { ProfileResponse } from "./auth";

// --- Types ---

export interface AdminStats {
  totalClubs: number;
  activeClubs: number;
  newRequests: number;
  totalUsers: number;
  onlineUsers: number;
  pendingSync: number;
}

export interface ClubMember {
  userId: string;
  fullName: string;
  role: "PRESIDENT" | "MEMBER";
  joinedAt: string;
}

export interface ClubApplication {
  _id: string;
  userId: ProfileResponse;
  clubId: any;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACCEPTED" | "DECLINED" | string;
  interviewDate?: string;
  interviewLocation?: string;
  interviewNote?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEvent {
  _id: string;
  title: string;
  clubId: {
    _id: string;
    fullName: string;
  };
  startTime: string;
  location: string;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
  participantCount: number;
}

// --- API Functions ---

export const adminApi = {
  // Stats (Assuming /admin/stats still exists for dashboard, or use individual counts)
  getDashboardStats: async () => {
    // If no /admin/stats, we might need to fetch counts from multiple endpoints
    // For now keeping it if it exists, otherwise will need to adjust.
    const res = await axiosInstance.get("/admin/stats");
    return res.data;
  },

  // Users (Admin Only)
  getUsers: async (page = 1, limit = 10, search = "", role = "") => {
    // Spec shows GET /users fits Admin Only for "see all users"
    const res = await axiosInstance.get("/users", {
      params: { page, limit, search, role },
    });
    return res.data;
  },

  deactivateUser: async (userId: string) => {
    // Spec shows DELETE /users/{id}/deactivate (Admin only)
    const res = await axiosInstance.delete(`/users/${userId}/deactivate`);
    return res.data;
  },

  reactivateUser: async (userId: string) => {
    // Spec shows PATCH /users/{id}/reactivate (Admin only)
    const res = await axiosInstance.patch(`/users/${userId}/reactivate`);
    return res.data;
  },

  // User Profile
  getUserProfile: async (userId: string) => {
    // Spec shows GET /users/{id}
    const res = await axiosInstance.get(`/users/${userId}`);
    return res.data;
  },

  // Club Applications
  // Admin can view all or specific club's applications
  getApplicationsByClub: async (clubId: string) => {
    // Spec: GET /applications/club/{clubId}
    const res = await axiosInstance.get(`/applications/club/${clubId}`);
    return res.data;
  },

  getApplicationDetail: async (appId: string) => {
    // Spec: GET /applications/{id}
    const res = await axiosInstance.get(`/applications/${appId}`);
    return res.data;
  },

  approveApplication: async (appId: string, interviewData: { interviewDate: string; interviewLocation: string; interviewNote?: string; }) => {
    // Spec: PATCH /applications/{id}/approve
    const res = await axiosInstance.patch(`/applications/${appId}/approve`, interviewData);
    return res.data;
  },

  rejectApplication: async (appId: string, rejectData: { rejectionReason: string; }) => {
    // Spec: PATCH /applications/{id}/reject
    const res = await axiosInstance.patch(`/applications/${appId}/reject`, rejectData);
    return res.data;
  },

  finalDecision: async (appId: string, decision: "accepted" | "declined", rejectionReason?: string) => {
    // Spec: PATCH /applications/{id}/final-decision
    const res = await axiosInstance.patch(`/applications/${appId}/final-decision`, {
      decision,
      rejectionReason
    });
    return res.data;
  },

  // Clubs
  getClubs: async () => {
    // Spec: GET /users/clubs
    const res = await axiosInstance.get("/users/clubs");
    return res.data;
  },

  // Club Members
  getClubMembers: async (clubId: string) => {
    // Spec: GET /club-members/club/{clubId}
    const res = await axiosInstance.get(`/club-members/club/${clubId}`);
    return res.data;
  },

  // Events
  getAllEvents: async () => {
    // Spec: GET /events
    const res = await axiosInstance.get("/events");
    return res.data;
  },

  getClubEvents: async (clubId: string) => {
    // Spec: GET /events/club/{clubId}
    const res = await axiosInstance.get(`/events/club/${clubId}`);
    return res.data;
  },

  restoreEvent: async (eventId: string) => {
    // Spec: PATCH /events/{id}/restore
    const res = await axiosInstance.patch(`/events/${eventId}/restore`);
    return res.data;
  },

  getEventDetail: async (eventId: string) => {
    // Spec: GET /events/{id}
    const res = await axiosInstance.get(`/events/${eventId}`);
    return res.data;
  },

  getEventParticipants: async (eventId: string) => {
    // Spec: GET /events/{id}/participants
    const res = await axiosInstance.get(`/events/${eventId}/participants`);
    return res.data;
  },

  softDeleteEvent: async (eventId: string) => {
    // Spec: DELETE /events/{id}/soft
    const res = await axiosInstance.delete(`/events/${eventId}/soft`);
    return res.data;
  },

  hardDeleteEvent: async (eventId: string) => {
    // Spec: DELETE /events/{id}/hard
    const res = await axiosInstance.delete(`/events/${eventId}/hard`);
    return res.data;
  },

  // Posts
  getAllPosts: async () => {
    // Spec: GET /posts
    const res = await axiosInstance.get("/posts");
    return res.data;
  },

  getClubPosts: async (clubId: string) => {
    // Spec: GET /posts/club/{clubId}
    const res = await axiosInstance.get(`/posts/club/${clubId}`);
    return res.data;
  },

  getPostDetail: async (postId: string) => {
    // Spec: GET /posts/{id}
    const res = await axiosInstance.get(`/posts/${postId}`);
    return res.data;
  },
};
