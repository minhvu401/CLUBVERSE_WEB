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

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  // Some endpoints might return empty body
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

