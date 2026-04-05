import { parseApiError } from "@/utils/apiError";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const AUTH_BASE_URL = "https://clubverse.onrender.com";

/* ================= TYPES ================= */

export type PendingActionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PendingAction = {
  id: string;
  status: PendingActionStatus;
  reason?: string;
  createdAt?: string;

  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  };

  club?: {
    id?: string;
    name?: string;
  };
};

/* ================= HELPER ================= */

async function request<T>(
  url: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let message = "Có lỗi xảy ra";
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return res.json();
}

/* ================= APIs ================= */

/**
 * GET
 * /club-members/club/{clubId}/pending-actions
 * Lấy danh sách yêu cầu chờ xác nhận (Club owner / Admin)
 */
export async function getPendingActions(params: {
  accessToken: string;
  clubId: string;
}): Promise<PendingAction[]> {
  const { accessToken, clubId } = params;

  return request<PendingAction[]>(
    `${AUTH_BASE_URL}/club-members/club/${clubId}/pending-actions`,
    accessToken,
    { method: "GET" }
  );
}

/**
 * POST
 * /club-members/pending-actions/{id}/approve
 * Xác nhận yêu cầu (Admin member only)
 */
export async function approvePendingAction(params: {
  accessToken: string;
  id: string;
}): Promise<{ message: string }> {
  const { accessToken, id } = params;

  return request<{ message: string }>(
    `${AUTH_BASE_URL}/club-members/pending-actions/${id}/approve`,
    accessToken,
    { method: "POST" }
  );
}

/**
 * POST
 * /club-members/pending-actions/{id}/reject
 * Từ chối yêu cầu (Admin member only)
 */
export async function rejectPendingAction(params: {
  accessToken: string;
  id: string;
}): Promise<{ message: string }> {
  const { accessToken, id } = params;

  return request<{ message: string }>(
    `${AUTH_BASE_URL}/club-members/pending-actions/${id}/reject`,
    accessToken,
    { method: "POST" }
  );
}
