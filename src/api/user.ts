import type { User, MyCourse } from "@/types/user";
import axios from "axios";
import { httpGet, httpPut } from "./http";
import type { ApiResponse } from "./http";

export async function fetchUser(): Promise<User> {
  const res = await httpGet<User>("/api/user/me");
  return res.data;
}

export async function fetchUserActivity(): Promise<{
  myCourses: MyCourse[];
}> {
  const res = await httpGet<MyCourse[]>("/api/courses/my");
  return { myCourses: res.data ?? [] };
}

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("accessToken");
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";
  const res = await axios.post<ApiResponse<string>>(
    `${baseURL}/api/upload/profile-image`,
    formData,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "프로필 사진 업로드에 실패했습니다.");
  }

  return res.data.data;
}

export async function updateProfileImage(profileImage: string | null): Promise<void> {
  const res = await httpPut<null>("/api/user/me/profile-image", { profileImage });
  if (!res.success) {
    throw new Error(res.message || "프로필 사진 저장에 실패했습니다.");
  }
}

