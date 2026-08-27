import type { User, MyCourse } from "@/types/user";
import { httpGet, httpPut } from "./http";
import { uploadProfileImage as uploadProfileImageFile } from "./upload";

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

/**
 * 프로필 사진 업로드.
 *
 * 업로드는 api/upload.ts 한 곳으로 모았다. 여기서 axios 를 직접 부르면
 * http 인스턴스의 401 리프레시 인터셉터를 타지 않아, 토큰이 만료된 채로
 * 사진을 바꾸면 재발급 없이 그냥 실패한다.
 */
export async function uploadProfileImage(file: File): Promise<string> {
  return uploadProfileImageFile(file);
}

export async function updateProfileImage(profileImage: string | null): Promise<void> {
  const res = await httpPut<null>("/api/user/me/profile-image", { profileImage });
  if (!res.success) {
    throw new Error(res.message || "프로필 사진 저장에 실패했습니다.");
  }
}

