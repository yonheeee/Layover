import type { ReportItem } from "@/types/chat";
import { httpGet, httpPost } from "./http";

function unwrap<T>(res: { success: boolean; message: string; data: T }, fallback: string): T {
  if (!res.success) throw new Error(res.message || fallback);
  return res.data;
}

export async function createReport(reportedUserId: string, content: string): Promise<void> {
  const res = await httpPost<void>("/api/reports", { reportedUserId, content });
  unwrap(res, "신고를 접수할 수 없습니다.");
}

export async function getMyReports(): Promise<ReportItem[]> {
  const res = await httpGet<ReportItem[]>("/api/reports/my");
  return unwrap(res, "신고 목록을 불러올 수 없습니다.");
}
