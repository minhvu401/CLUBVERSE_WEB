import { AUTH_BASE_URL } from "./auth";

export type ApiStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACCEPTED"
  | "DECLINED"
  | string;

export type Club = {
  _id: string;
  fullName: string;
  shortName?: string;
  tagline?: string;
  avatarUrl?: string;
  coverUrl?: string;
  email?: string;
  phoneNumber?: string;
  category?: string;
  description?: string;
  campus?: string;
  members?: number;
};

export type ApplicantProfile = {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  school?: string;
  major?: string;
  year?: number;
  avatarUrl?: string;
};

export type MyApplication = {
  _id: string;
  userId?: ApplicantProfile | string;
  clubId: Club | string; // backend có thể populate hoặc chỉ id
  reason?: string;
  status: ApiStatus;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  respondedAt?: string;

  // approve có thể trả thêm
  interviewDate?: string;
  interviewLocation?: string;
  interviewNote?: string;

  // reject có thể trả thêm
  rejectionReason?: string;
};

export type FilterStatus =
  | "all"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACCEPTED"
  | "DECLINED";

export const demoClubs: Club[] = [
  {
    _id: "club-tech-001",
    fullName: "Tech Innovators Club",
    shortName: "TIC",
    tagline: "Build. Break. Innovate.",
    email: "hello@ticampus.dev",
    phoneNumber: "0938 111 888",
    category: "Công nghệ",
    description:
      "Cộng đồng sinh viên đam mê công nghệ, tổ chức hackathon và mentoring mỗi tháng.",
    campus: "ĐHQG TP.HCM",
    members: 128,
  },
  {
    _id: "club-biz-002",
    fullName: "Future Business Leaders",
    shortName: "FBL",
    tagline: "Lead with impact",
    email: "contact@fbl.vn",
    phoneNumber: "0972 555 002",
    category: "Kinh doanh",
    description:
      "CLB kết nối sinh viên yêu thích kinh doanh và khởi nghiệp với mentor từ doanh nghiệp.",
    campus: "UEH",
    members: 94,
  },
  {
    _id: "club-media-003",
    fullName: "Campus Media House",
    shortName: "CMH",
    tagline: "Tell better stories",
    email: "mediahouse@campus.vn",
    phoneNumber: "0966 909 123",
    category: "Truyền thông",
    description:
      "Nhà của những content creator trẻ, sản xuất podcast, video phóng sự và social campaign.",
    campus: "FTU2",
    members: 76,
  },
  {
    _id: "club-art-004",
    fullName: "Urban Arts Collective",
    shortName: "UAC",
    tagline: "Lights. Canvas. Motion.",
    email: "urbanarts@creative.vn",
    phoneNumber: "0903 447 909",
    category: "Nghệ thuật",
    description:
      "CLB nghệ thuật đa ngành với studio riêng cho vẽ, nhạc cụ và nghệ thuật biểu diễn.",
    campus: "HUFLIT",
    members: 52,
  },
];

const demoClubMap = new Map(demoClubs.map((club) => [club._id, club]));

/**
 * GET /applications/my-applications?status=...
 * Lấy danh sách đơn đăng ký của user hiện tại
 */
export async function getMyApplications(params: {
  accessToken: string;
  status?: Exclude<FilterStatus, "all">;
}): Promise<MyApplication[]> {
  const { accessToken, status } = params;

  const url =
    `${AUTH_BASE_URL}/applications/my-applications` +
    (status ? `?status=${encodeURIComponent(status)}` : "");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message || `Không lấy được danh sách đơn (HTTP ${res.status})`;
    throw new Error(msg);
  }

  // backend có thể trả [] hoặc { applications: [] } hoặc { data: [] }
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.applications)
    ? data.applications
    : Array.isArray(data?.data)
    ? data.data
    : [];

  return list as MyApplication[];
}

/**
 * POST /applications
 * Sinh viên đăng ký vào câu lạc bộ (for member)
 */
export async function createApplication(params: {
  accessToken: string;
  clubId: string;
  reason: string;
}): Promise<{ message: string }> {
  const { accessToken, clubId, reason } = params;

  const res = await fetch(`${AUTH_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ clubId, reason }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Không thể đăng ký (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/**
 * GET /applications/club/{clubId}
 * Câu lạc bộ xem danh sách đơn đăng ký
 */
export async function getClubApplications(params: {
  accessToken: string;
  clubId: string;
  status?: Exclude<FilterStatus, "all">;
}): Promise<MyApplication[]> {
  const { accessToken, clubId, status } = params;

  const url =
    `${AUTH_BASE_URL}/applications/club/${clubId}` +
    (status ? `?status=${encodeURIComponent(status)}` : "");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message || `Không lấy được danh sách đơn (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.applications)
    ? data.applications
    : Array.isArray(data?.data)
    ? data.data
    : [];

  return list as MyApplication[];
}

/**
 * GET /applications/{id}
 * Xem chi tiết đơn đăng ký
 */
export async function getApplicationById(params: {
  accessToken: string;
  id: string;
}): Promise<MyApplication> {
  const { accessToken, id } = params;

  const res = await fetch(`${AUTH_BASE_URL}/applications/${id}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message || `Không lấy được thông tin đơn (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data as MyApplication;
}

/**
 * PATCH /applications/{id}/approve
 * Duyệt đơn và gửi lịch phỏng vấn
 */
export async function approveApplication(params: {
  accessToken: string;
  id: string;
  interviewDate: string;
  interviewLocation: string;
  interviewNote?: string;
}): Promise<{ message: string }> {
  const { accessToken, id, interviewDate, interviewLocation, interviewNote } =
    params;

  const res = await fetch(`${AUTH_BASE_URL}/applications/${id}/approve`, {
    method: "PATCH",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ interviewDate, interviewLocation, interviewNote }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Không thể duyệt đơn (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/**
 * PATCH /applications/{id}/reject
 * Từ chối đơn đăng ký
 */
export async function rejectApplication(params: {
  accessToken: string;
  id: string;
  rejectionReason: string;
}): Promise<{ message: string }> {
  const { accessToken, id, rejectionReason } = params;

  const res = await fetch(`${AUTH_BASE_URL}/applications/${id}/reject`, {
    method: "PATCH",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ rejectionReason }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Không thể từ chối đơn (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/**
 * PATCH /applications/{id}/final-decision
 * Quyết định cuối cùng sau phỏng vấn
 */
export async function finalDecision(params: {
  accessToken: string;
  id: string;
  decision: "accepted" | "declined";
  rejectionReason?: string;
}): Promise<{ message: string }> {
  const { accessToken, id, decision, rejectionReason } = params;

  const res = await fetch(
    `${AUTH_BASE_URL}/applications/${id}/final-decision`,
    {
      method: "PATCH",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ decision, rejectionReason }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message || `Không thể thực hiện quyết định (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/**
 * DELETE /applications/{id}/cancel
 * Hủy đơn đăng ký (chỉ khi chưa duyệt)
 */
export async function cancelApplication(params: {
  accessToken: string;
  id: string;
}): Promise<{ message: string }> {
  const { accessToken, id } = params;

  const res = await fetch(`${AUTH_BASE_URL}/applications/${id}/cancel`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `Không thể hủy đơn (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/**
 * Helper function to extract club info from clubId field
 * Ưu tiên dữ liệu thực từ API, fallback sang mock data để demo UI.
 */
export function getClub(source?: unknown): Club {
  if (!source) return { _id: "", fullName: "CLB chưa cập nhật" };

  if (typeof source === "string") {
    return (
      demoClubMap.get(source) ?? {
        _id: source,
        fullName: "CLB chưa cập nhật",
      }
    );
  }

  const candidate = source as Club;
  if (candidate?._id) {
    const fallback = demoClubMap.get(candidate._id);
    if (fallback) {
      return {
        ...fallback,
        ...candidate,
        fullName: candidate.fullName || fallback.fullName,
        email: candidate.email || fallback.email,
        phoneNumber: candidate.phoneNumber || fallback.phoneNumber,
        category: candidate.category || fallback.category,
        description: candidate.description || fallback.description,
      };
    }
  }

  const normalized = {
    ...(candidate ?? {}),
  } as Club;

  return {
    ...normalized,
    _id: normalized._id ?? "",
    fullName: normalized.fullName || "CLB chưa cập nhật",
  };
}
