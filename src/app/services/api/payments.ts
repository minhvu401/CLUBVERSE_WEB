export const AUTH_BASE_URL = "https://clubverse.onrender.com";

export type CreatePaymentResponse = {
  _id: string;
  transactionRef: string;
  amount: number;
  description: string;
  paymentInfo: {
    accountNumber: string;
    bankName: string;
    instructions: string;
  };
};

export type CheckPaymentStatusResponse = {
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
  status: "pending" | "completed";
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
  paymentUrl?: string;
};


export async function createPayment(
  token: string
): Promise<CreatePaymentResponse> {
  const res = await fetch(`${AUTH_BASE_URL}/payments/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: 50000,
      description: "Thanh toán gói AI Premium",
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
  transactionRef: string
): Promise<CheckPaymentStatusResponse> {
  const res = await fetch(
    `${AUTH_BASE_URL}/payments/check-status?transactionRef=${transactionRef}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Không kiểm tra được trạng thái thanh toán");
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
    const text = await res.text();
    throw new Error(text || "Không tải được lịch sử thanh toán");
  }

  const data = await res.json();

  // 🔒 đảm bảo luôn là array
  return Array.isArray(data) ? data : [];
}