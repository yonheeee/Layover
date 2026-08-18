import { httpGet } from "./http";
import type { Place } from "@/types/place";

export interface PlacePage {
  content: Place[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
}

interface PlaceListDto {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  operatingHours: string;
  restDate?: string;
  infoCenter?: string;
  parking?: string;
  useFee?: string;
  reservation?: string;
  kakaoPlaceUrl?: string;
  kakaoPhone?: string;
  roadAddress?: string;
  active: boolean;
  /** 백엔드가 운영시간/휴무일을 해석한 결과 */
  openStatus?: "OPEN" | "CLOSED" | "UNKNOWN";
}

interface PlaceDetailDto extends PlaceListDto {
  description: string;
  tourApiId: string;
  contentTypeId: string;
  syncedAt: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  TOUR: "관광명소",
  CULTURE: "문화/예술",
  FESTIVAL: "축제/행사",
  LEPORTS: "레포츠",
  STAY: "숙박",
  SHOPPING: "쇼핑",
  FOOD: "음식",
};

function mapList(dto: PlaceListDto): Place {
  return {
    id: dto.id,
    name: dto.name,
    category: CATEGORY_LABELS[dto.category] ?? dto.category,
    address: dto.address,
    lat: dto.latitude,
    lng: dto.longitude,
    image: dto.imageUrl,
    // isOpen은 예전에 is_active(노출 여부)를 그대로 썼다. 항상 1이라 늘 "영업중"으로 보였다.
    isOpen: dto.openStatus !== "CLOSED",
    openStatus: dto.openStatus,
    hours: dto.operatingHours,
    restDate: dto.restDate,
    infoCenter: dto.infoCenter,
    parking: dto.parking,
    useFee: dto.useFee,
    reservation: dto.reservation,
    roadAddress: dto.roadAddress,
    phone: dto.kakaoPhone,
    kakaoPlaceUrl: dto.kakaoPlaceUrl,
    kakaoPhone: dto.kakaoPhone,
  };
}

function mapDetail(dto: PlaceDetailDto): Place {
  return {
    id: dto.id,
    name: dto.name,
    category: CATEGORY_LABELS[dto.category] ?? dto.category,
    address: dto.address,
    lat: dto.latitude,
    lng: dto.longitude,
    image: dto.imageUrl,
    // isOpen은 예전에 is_active(노출 여부)를 그대로 썼다. 항상 1이라 늘 "영업중"으로 보였다.
    isOpen: dto.openStatus !== "CLOSED",
    openStatus: dto.openStatus,
    hours: dto.operatingHours,
    restDate: dto.restDate,
    infoCenter: dto.infoCenter,
    parking: dto.parking,
    useFee: dto.useFee,
    reservation: dto.reservation,
    roadAddress: dto.roadAddress,
    phone: dto.kakaoPhone,
    kakaoPlaceUrl: dto.kakaoPlaceUrl,
    kakaoPhone: dto.kakaoPhone,
    description: dto.description,
  };
}

export async function getPlaces(
  category?: string,
  keyword?: string,
  district?: string,
  page = 0,
): Promise<PlacePage> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (keyword) params.set("keyword", keyword);
  if (district) params.set("district", district);
  params.set("page", String(page));
  params.set("size", "32");
  const query = params.toString();
  const res = await httpGet<{
    content: PlaceListDto[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
    hasNext: boolean;
  }>(`/api/places${query ? `?${query}` : ""}`);
  return {
    content: res.data.content.map(mapList),
    totalElements: res.data.totalElements,
    totalPages: res.data.totalPages,
    currentPage: res.data.currentPage,
    size: res.data.size,
    hasNext: res.data.hasNext,
  };
}

export async function getPlaceById(id: string): Promise<Place> {
  const res = await httpGet<PlaceDetailDto>(`/api/places/${id}`);
  return mapDetail(res.data);
}
