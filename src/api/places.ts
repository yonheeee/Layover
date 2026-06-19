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
  active: boolean;
}

interface PlaceDetailDto extends PlaceListDto {
  description: string;
  tourApiId: string;
  contentTypeId: string;
  syncedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
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
    image: dto.imageUrl,
    isOpen: dto.active,
    hours: dto.operatingHours,
  };
}

function mapDetail(dto: PlaceDetailDto): Place {
  return {
    id: dto.id,
    name: dto.name,
    category: CATEGORY_LABELS[dto.category] ?? dto.category,
    address: dto.address,
    image: dto.imageUrl,
    isOpen: dto.active,
    hours: dto.operatingHours,
    description: dto.description,
  };
}

export async function getPlaces(
  category?: string,
  keyword?: string,
  page = 0,
): Promise<PlacePage> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (keyword) params.set("keyword", keyword);
  params.set("page", String(page));
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
