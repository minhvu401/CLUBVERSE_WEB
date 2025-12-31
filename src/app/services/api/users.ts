import {
  AUTH_BASE_URL,
  type ProfileResponse,
  type UpdateStudentProfileRequest,
  type UpdateStudentProfileResponse,
  type ClubItem,
} from "./auth";

export type UserSummary = {
  _id: string;
  email?: string;
  fullName?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UsersListResponse = {
  total?: number;
  users?: UserSummary[];
  data?: UserSummary[];
};

export type ClubDirectoryResponse = {
  total?: number;
  clubs?: ClubItem[];
};

export type ClubProfileUpdateRequest = {
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  category: string;
  description: string;
  socialLink?: string[];
};

export type ClubProfileUpdateResponse = {
  message?: string;
  club?: ProfileResponse;
};

export type MessageResponse = {
  message?: string;
};

const jsonHeaders = {
  "Content-Type": "application/json",
  accept: "application/json",
};

function withBase(path: string) {
  return `${AUTH_BASE_URL}${path}`;
}

async function requestJson<T>(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(withBase(path), {
    ...init,
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");
  const data = text ? (JSON.parse(text) as T) : (undefined as T);

  if (!res.ok) {
    const message = (data as { message?: string } | undefined)?.message;
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return data;
}

async function requestForm<T>(
  token: string,
  path: string,
  body: FormData
): Promise<T> {
  const res = await fetch(withBase(path), {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const text = await res.text().catch(() => "");
  const data = text ? (JSON.parse(text) as T) : (undefined as T);

  if (!res.ok) {
    const message = (data as { message?: string } | undefined)?.message;
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return data;
}

export function getCurrentProfile(token: string): Promise<ProfileResponse> {
  return requestJson<ProfileResponse>(token, "/users/profile", {
    method: "GET",
  });
}

export function getUserById(
  token: string,
  id: string
): Promise<ProfileResponse> {
  return requestJson<ProfileResponse>(token, `/users/${id}`, {
    method: "GET",
  });
}

export function getAllClubsDirectory(token: string): Promise<ClubItem[]> {
  return requestJson<ClubDirectoryResponse>(token, "/users/clubs", {
    method: "GET",
  }).then((payload) => payload.clubs ?? []);
}

export function getAllUsers(token: string): Promise<UserSummary[]> {
  return requestJson<UsersListResponse | UserSummary[]>(token, "/users", {
    method: "GET",
  }).then((payload) => {
    if (Array.isArray(payload)) return payload;
    return payload.users ?? payload.data ?? [];
  });
}

export function updateStudentProfileInfo(
  token: string,
  body: UpdateStudentProfileRequest
): Promise<UpdateStudentProfileResponse> {
  return requestJson<UpdateStudentProfileResponse>(
    token,
    "/users/profile/student",
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

export function updateClubProfileInfo(
  token: string,
  body: ClubProfileUpdateRequest
): Promise<ClubProfileUpdateResponse> {
  return requestJson<ClubProfileUpdateResponse>(token, "/users/profile/club", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deactivateUser(
  token: string,
  userId: string
): Promise<MessageResponse> {
  return requestJson<MessageResponse>(token, `/users/${userId}/deactivate`, {
    method: "DELETE",
  });
}

export function reactivateUser(
  token: string,
  userId: string
): Promise<MessageResponse> {
  return requestJson<MessageResponse>(token, `/users/${userId}/reactivate`, {
    method: "PATCH",
  });
}

export function uploadUserAvatar(
  token: string,
  file: File
): Promise<{ message?: string; url?: string }> {
  const form = new FormData();
  form.append("file", file);
  return requestForm<{ message?: string; url?: string }>(
    token,
    "/users/avatar",
    form
  );
}

export function deleteUserAvatar(token: string): Promise<MessageResponse> {
  return requestJson<MessageResponse>(token, "/users/avatar", {
    method: "DELETE",
  });
}
