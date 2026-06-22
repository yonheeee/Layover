import { http } from "./http";
import type { Train, StationOption } from "@/types/train";

export async function fetchTrains(
  station: string,
  date: string,
): Promise<Train[]> {
  const res = await http.get<Train[]>(
    `/api/trains?station=${station}&date=${date}`,
  );
  return res.data ?? [];
}

export const stationOptions: StationOption[] = [
  { value: "daejeon", label: "대전역" },
  { value: "seo-daejeon", label: "서대전역" },
];
