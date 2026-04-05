import { parseApiError } from "@/utils/apiError";
import { AUTH_BASE_URL } from "./auth";

// ===== CLUB MEMBERS INTERFACES =====

// Base member interface
export interface ClubMember {
  _id: string;
  userId: string;
  role: "admin" | "moderator" | "member";
  email: string;
  fullName: string;
  phoneNumber?: string;
  school?: string;
  major?: string;
  year?: number;
  skills?: string[];
  interests?: string[];
  joinedAt: string;
  isActive: boolean;
  avatarUrl?: string;
}

// Get club members response
export interface GetClubMembersResponse {
  members: ClubMember[];
  total: number;
  page?: number;
  limit?: number;
}

// Get member details response
export interface GetMemberDetailsResponse {
  member: ClubMember;
}

// Remove member request
export interface RemoveMemberRequest {
  userId: string;
  reason: string;
}

// Update role request
export interface UpdateRoleRequest {
  userId: string;
  newRole: "admin" | "moderator" | "member";
}

// Member statistics response
export interface MemberStatisticsResponse {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  admins: number;
  moderators: number;
  members: number;
}

// My clubs response
export interface MyClubsResponse {
  clubs: Array<{
    _id: string;
    name: string;
    role: "admin" | "moderator" | "member";
    status: "active" | "inactive";
    joinedAt: string;
    club?: {
      _id: string;
      fullName: string;
      category: string;
      description: string;
    };
  }>;
  total: number;
}

// Pending actions response
export interface PendingActionsResponse {
  actions: Array<{
    _id: string;
    type: string;
    userId: string;
    clubId: string;
    data: Record<string, unknown>;
    status: "pending";
    createdAt: string;
    user?: {
      _id: string;
      email: string;
      fullName: string;
    };
  }>;
  total: number;
}

// Generic message response
export interface MessageResponse {
  message: string;
}

// ===== CLUB MEMBERS API FUNCTIONS =====

// Helper function for requests (reuse from auth.ts pattern)
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseApiError(text, `Request failed with status ${res.status}`));
  }

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}

// GET /club-members/club/{clubId} - Get club members list
export const getClubMembers = async (
  accessToken: string,
  clubId: string,
  params?: {
    status?: "active" | "inactive" | "all";
    role?: "admin" | "moderator" | "member";
    search?: string;
    sortBy?: "newest" | "oldest" | "name";
  },
): Promise<GetClubMembersResponse> => {
  const queryParams = new URLSearchParams();

  // Only add params if they are provided
  if (params?.status) {
    queryParams.append("status", params.status);
  }
  if (params?.role) {
    queryParams.append("role", params.role);
  }
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

  const queryString = queryParams.toString();
  const url = `/club-members/club/${clubId}${queryString ? `?${queryString}` : ""}`;

  return request<GetClubMembersResponse>(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

// GET /club-members/club/{clubId}/member/{memberId} - Get member details
export const getMemberDetails = async (
  accessToken: string,
  clubId: string,
  memberId: string,
): Promise<GetMemberDetailsResponse> => {
  return request<GetMemberDetailsResponse>(
    `/club-members/club/${clubId}/member/${memberId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
};

// DELETE /club-members/club/{clubId}/remove - Remove member from club
export const removeMember = async (
  accessToken: string,
  clubId: string,
  body: RemoveMemberRequest,
): Promise<MessageResponse> => {
  return request<MessageResponse>(`/club-members/club/${clubId}/remove`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
};

// PUT /club-members/club/{clubId}/update-role - Update member role
export const updateMemberRole = async (
  accessToken: string,
  clubId: string,
  body: UpdateRoleRequest,
): Promise<MessageResponse> => {
  return request<MessageResponse>(`/club-members/club/${clubId}/update-role`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
};

// GET /club-members/club/{clubId}/statistics - Get member statistics
export const getMemberStatistics = async (
  accessToken: string,
  clubId: string,
): Promise<MemberStatisticsResponse> => {
  return request<MemberStatisticsResponse>(
    `/club-members/club/${clubId}/statistics`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
};

// GET /club-members/club/{clubId}/export - Export member list
export const exportMemberList = async (
  accessToken: string,
  clubId: string,
  status?: "active" | "inactive" | "all",
): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);

  const queryString = queryParams.toString();
  const url = `/club-members/club/${clubId}/export${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(`${AUTH_BASE_URL}${url}`, {
    method: "GET",
    headers: {
      accept: "application/octet-stream",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseApiError(text, `Export failed with status ${res.status}`));
  }

  return res.blob();
};

// GET /club-members/my-clubs - Get my clubs (Student only)
export const getMyClubs = async (
  accessToken: string,
  status?: "active" | "all",
): Promise<MyClubsResponse> => {
  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);

  const queryString = queryParams.toString();
  const url = `/club-members/my-clubs${queryString ? `?${queryString}` : ""}`;

  return request<MyClubsResponse>(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

// GET /club-members/club/{clubId}/pending-actions - Get pending actions
export const getPendingActions = async (
  accessToken: string,
  clubId: string,
): Promise<PendingActionsResponse> => {
  return request<PendingActionsResponse>(
    `/club-members/club/${clubId}/pending-actions`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
};

// POST /club-members/pending-actions/{id}/approve - Approve pending action
export const approvePendingAction = async (
  accessToken: string,
  actionId: string,
): Promise<MessageResponse> => {
  return request<MessageResponse>(
    `/club-members/pending-actions/${actionId}/approve`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
};

// POST /club-members/pending-actions/{id}/reject - Reject pending action
export const rejectPendingAction = async (
  accessToken: string,
  actionId: string,
): Promise<MessageResponse> => {
  return request<MessageResponse>(
    `/club-members/pending-actions/${actionId}/reject`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
};
