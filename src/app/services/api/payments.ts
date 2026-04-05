import { parseApiError } from "@/utils/apiError";
export const AUTH_BASE_URL = "https://clubverse.onrender.com";

export type CreatePaymentResponse = {
  _id: string;
  orderCode: number;
  amount: number;
  description: string;
  checkoutUrl: string;
  transactionRef?: string;
  paymentInfo?: {
    accountNumber: string;
    bankName: string;
    instructions: string;
  };
};

export type PaymentStatusResponse = {
  status: "pending" | "completed" | "failed";
  orderCode?: string;
};

export type PaymentDetailResponse = {
  _id: string;
  userId: string;
  amount: number;
  description: string;
  packageType: string;
  status: "pending" | "completed" | "failed";
  transactionRef: string;
  orderCode?: string;
  createdAt: string;
  updatedAt: string;
  paymentUrl?: string;
};

export type RecommendationClubItem = {
  clubName: string;
  reason: string;
  matchScore: number;
  relevantSkills: string[];
  relevantInterests: string[];
  _id?: string;
};

export type RecommendClubsRequest = {
  skills?: string[];
  interests?: string[];
  limit?: number;
  additionalInfo?: string;
};

export type CheckPaidResponse = {
  hasPaid: boolean;
  plan?: "PREMIUM";
  expiredAt?: string;
};

export type PaymentHistoryItem = {
  _id: string;
  userId: string;
  amount: number;
  description: string;
  packageType: string;
  status: "pending" | "completed" | "failed";
  transactionRef: string;
  orderCode?: string;
  createdAt: string;
  updatedAt: string;
  paymentUrl?: string;
};


export async function createPayment(
  token: string,
  data?: {
    amount?: number;
    description?: string;
    packageType?: string;
  }
): Promise<CreatePaymentResponse> {
  const res = await fetch(`${AUTH_BASE_URL}/payments/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: data?.amount ?? 50000,
      description: data?.description ?? "Thanh toán gói AI Premium",
      packageType: data?.packageType ?? "ai-premium-monthly",
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Không thể tạo yêu cầu thanh toán");
  }

  return res.json();
}

export async function checkPaymentStatus(
  token: string,
  orderCode: string
): Promise<PaymentStatusResponse> {
  const res = await fetch(
    `${AUTH_BASE_URL}/payments/status/${orderCode}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseApiError(text, "Không kiểm tra được trạng thái thanh toán"));
  }

  return res.json();
}

export async function getPaymentHistory(
  token: string
): Promise<PaymentHistoryItem[]> {
  const res = await fetch(`${AUTH_BASE_URL}/payments/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseApiError(text, "Không tải được lịch sử thanh toán"));
  }

  const data = await res.json();

  // 🔒 đảm bảo luôn là array
  return Array.isArray(data) ? data : [];
}

export async function getPaymentDetail(
  token: string,
  transactionRef: string
): Promise<PaymentDetailResponse> {
  const res = await fetch(
    `${AUTH_BASE_URL}/payments/detail/${transactionRef}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseApiError(text, "Không tải được chi tiết thanh toán"));
  }

  return res.json();
}

export async function recommendClubs(
  token: string,
  body: RecommendClubsRequest
): Promise<RecommendationClubItem[]> {
  const res = await fetch(`${AUTH_BASE_URL}/recommendations/clubs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseApiError(text, "Không lấy được đề xuất câu lạc bộ"));
  }

  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any)?.clubs)) return (data as any).clubs;
  return [];
}

export async function checkPaid(
  token: string
): Promise<CheckPaidResponse> {
  const res = await fetch(`${AUTH_BASE_URL}/payments/check-paid`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseApiError(text, "Không kiểm tra được trạng thái thanh toán"));
  }

  return res.json();
}