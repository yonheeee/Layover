import type { User, MyCourse } from "@/types/user";
import { httpGet, httpPut } from "./http";

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

