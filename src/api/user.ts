import type {
  User,
  MyCourse,
  Journal,
  Character,
  MapPin,
  UserPhoto,
} from "@/types/user";
import type { Place } from "@/types/place";
import type { BookmarkPlace } from "@/api/bookmarks";
import { httpGet, httpPut } from "./http";
import {
  mockJournals,
  mockCharacters,
  mockMapPins,
  mockUserPhotos,
} from "@/mocks/user";

export async function fetchUser(): Promise<User> {
  const res = await httpGet<User>("/api/user/me");
  return res.data;
}

export async function fetchUserActivity(): Promise<{
  myCourses: MyCourse[];
  likedPlaces: Place[];
}> {
  const [coursesRes, bookmarksRes] = await Promise.all([
    httpGet<MyCourse[]>("/api/courses/my"),
    httpGet<BookmarkPlace[]>("/api/bookmarks"),
  ]);
  const likedPlaces: Place[] = bookmarksRes.data.map((b) => ({
    id: b.placeId,
    name: b.name,
    category: b.category,
    address: b.address,
    image: b.imageUrl,
    isOpen: false,
  }));
  return { myCourses: coursesRes.data, likedPlaces };
}

export async function fetchJournals(): Promise<Journal[]> {
  return Promise.resolve(mockJournals);
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
