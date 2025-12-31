import { MyApplication } from "./applications";
import { PostItem } from "./post";

export const AUTH_BASE_URL = "https://clubverse.onrender.com";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserInfo;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  school: string;
  major: string;
  year: number;
  category: string;
  description: string;
}

export interface MessageResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

// ✅ FIX: không bị mất Content-Type khi có Authorization
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    ...options, // ✅ spread trước
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...(options.headers || {}), // ✅ merge Authorization vào đây
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}

export const login = (body: LoginRequest): Promise<LoginResponse> => {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const register = (body: RegisterRequest): Promise<MessageResponse> => {
  return request<MessageResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const verifyOtp = (body: VerifyOtpRequest): Promise<MessageResponse> => {
  return request<MessageResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const resendOtp = (body: ResendOtpRequest): Promise<MessageResponse> => {
  return request<MessageResponse>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// ===== PROFILE =====
export interface ProfileResponse {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  school?: string;
  major?: string;
  year?: number;
  skills?: string[];
  interests?: string[];
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  category?: string;
  description?: string;
  socialLink?: string[];
  rating?: number;
  clubJoined?: Array<{ _id?: string } | string>;
  posts?: PostItem[];
}

export const getProfile = (accessToken: string): Promise<ProfileResponse> => {
  return request<ProfileResponse>("/users/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

// ===== UPDATE STUDENT PROFILE =====
export interface UpdateStudentProfileRequest {
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  school: string;
  major: string;
  year: number;
  skills?: string[];
  interests?: string[];
}

// ✅ FIX: backend trả { message, user }
export interface UpdateStudentProfileResponse {
  message: string;
  user: ProfileResponse;
}

export const updateStudentProfile = (
  accessToken: string,
  body: UpdateStudentProfileRequest
): Promise<UpdateStudentProfileResponse> => {
  return request<UpdateStudentProfileResponse>("/users/profile/student", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
};

async function uploadAvatar(token: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload-avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // nếu bạn muốn check token ở route
    },
    body: fd,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Upload avatar thất bại");

  return data.url as string;
}

export type ClubItem = {
  _id: string;
  fullName?: string;
  category?: string;
  description?: string;
  clubJoined?: Array<{ _id?: string } | string>;
  rating?: number;
};

export type GetAllClubsResponse = {
  total: number;
  clubs: ClubItem[];
};

export const getAllClubs = async (accessToken: string): Promise<ClubItem[]> => {
  const data = await request<GetAllClubsResponse>("/users/clubs", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return Array.isArray(data?.clubs) ? data.clubs : [];
};

export type ApplyToClubBody = {
  clubId: string;
  reason: string;
};

export type ApplyToClubResponse = {
  message?: string;
  application?: MyApplication;
};

export const applyToClub = async (
  accessToken: string,
  body: ApplyToClubBody
): Promise<ApplyToClubResponse> => {
  const res = await fetch(`${AUTH_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // cố lấy message backend trả về
    const msg =
      data?.message ||
      (res.status === 400
        ? "Đã đăng ký hoặc đã là thành viên"
        : `Gửi đơn thất bại (HTTP ${res.status})`);
    throw new Error(msg);
  }

  return data;
};
