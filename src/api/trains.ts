import { http } from "./http";
import type { Train, StationOption } from "@/types/train";

export async function fetchTrains(
  station: string,
  date: string,
): Promise<Train[]> {
  const res = await http.get<Train[]>(
    `/api/trains?station=${station}&date=${date}`,
  );
  return (res.data ?? [])
    .map(normalizeTrain)
    .sort((a, b) => toTimeValue(a.departTime) - toTimeValue(b.departTime));
}

function normalizeTrain(train: Train): Train {
  const trainName =
    train.mrntNm ??
    train.trainName ??
    train.trainGrade ??
    train.trainKind ??
    train.kndNm ??
    "KTX";

  return {
    ...train,
    mrntNm: trainName,
  };
}

function toTimeValue(time: string) {
  const [hh = "0", mm = "0"] = time.split(":");
  return Number(hh) * 60 + Number(mm);
}

export const stationOptions: StationOption[] = [
  { value: "daejeon", label: "대전역" },
  { value: "seo-daejeon", label: "서대전역" },
];
