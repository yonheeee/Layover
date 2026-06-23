import type {
  User,
  MyCourse,
  Character,
  MapPin,
  UserPhoto,
} from "@/types/user";
import { httpGet, httpPut } from "./http";
import { mockCharacters, mockMapPins, mockUserPhotos } from "@/mocks/user";

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

export async function fetchCharacters(): Promise<Character[]> {
  return Promise.resolve(mockCharacters);
}

export async function fetchPostcardData(): Promise<{
  mapPins: MapPin[];
  userPhotos: UserPhoto[];
}> {
  return Promise.resolve({ mapPins: mockMapPins, userPhotos: mockUserPhotos });
}
