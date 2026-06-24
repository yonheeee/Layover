import type {
  Post,
  PostDetail,
  PostComment,
  PagedResponse,
  Notice,
  FaqItem,
  InquiryItem,
  InquiryDetail,
  MyPost,
} from "@/types/community";
import axios from "axios";
import { http, httpGet, httpPost, httpPut, httpDelete } from "./http";
import type { ApiResponse } from "./http";

function unwrapCommunityResponse<T>(
  res: ApiResponse<T>,
  fallbackMessage: string,
): T {
  if (!res.success) {
    throw new Error(res.message || fallbackMessage);
  }
  return res.data;
}

export function getCommunityErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (status === 401 || status === 403) {
      return "로그인이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.";
    }
    if (status === 413) {
      return "이미지 용량이 너무 큽니다. 더 작은 사진으로 다시 시도해주세요.";
    }
    if (status && status >= 500) {
      return "서버 처리 중 오류가 발생했습니다. 백엔드 로그를 확인해주세요.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallbackMessage;
}

async function uploadToServer(file: File, endpoint: string, errorLabel: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("accessToken");
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";
  const res = await axios.post<ApiResponse<string>>(
    `${baseURL}${endpoint}`,
    formData,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  return unwrapCommunityResponse(res.data, errorLabel);
}

export async function uploadPostImage(file: File): Promise<string> {
  return uploadToServer(file, "/api/upload/image", "이미지 업로드에 실패했습니다.");
}

export async function uploadFile(file: File): Promise<string> {
  return uploadToServer(file, "/api/upload/file", "파일 업로드에 실패했습니다.");
}

export const CATEGORY_TO_CODE: Record<string, string> = {
  공유해요: "SHARE",
  궁금해요: "QUESTION",
  함께해요: "TOGETHER",
  자유: "FREE",
};

export const CODE_TO_CATEGORY: Record<string, string> = {
  SHARE: "공유해요",
  QUESTION: "궁금해요",
  TOGETHER: "함께해요",
  FREE: "자유",
};

// ─── 게시글 ───
export async function getPosts(category?: string, page = 0, size = 20) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (category) params.set("category", category);
  const res = await httpGet<PagedResponse<Post>>(`/api/posts?${params}`);
  return unwrapCommunityResponse(res, "게시글 목록을 불러올 수 없습니다.");
}

export async function getPost(id: string) {
  const res = await httpGet<PostDetail>(`/api/posts/${id}`);
  return unwrapCommunityResponse(res, "게시글을 불러올 수 없습니다.");
}

export async function createPost(
  category: string,
  title: string,
  content: string,
) {
  const res = await httpPost<PostDetail>("/api/posts", {
    category,
    title,
    content,
  });
  return unwrapCommunityResponse(res, "게시글 등록에 실패했습니다.");
}

export async function updatePost(
  id: string,
  title: string,
  content: string,
  category: string,
) {
  const res = await httpPut<PostDetail>(`/api/posts/${id}`, {
    title,
    content,
    category,
  });
  return unwrapCommunityResponse(res, "게시글 수정에 실패했습니다.");
}

export async function deletePost(id: string) {
  const res = await httpDelete(`/api/posts/${id}`);
  unwrapCommunityResponse(res, "게시글 삭제에 실패했습니다.");
}

// ─── 댓글 ───
export async function createComment(postId: string, content: string) {
  const res = await httpPost<PostComment>(`/api/posts/${postId}/comments`, {
    content,
  });
  return unwrapCommunityResponse(res, "댓글 등록에 실패했습니다.");
}

export async function deleteComment(postId: string, commentId: string) {
  const res = await httpDelete(`/api/posts/${postId}/comments/${commentId}`);
  unwrapCommunityResponse(res, "댓글 삭제에 실패했습니다.");
}

// ─── 좋아요 ───
export async function toggleLike(postId: string) {
  const res = await httpPost(`/api/posts/${postId}/likes`);
  return unwrapCommunityResponse(res, "좋아요 처리에 실패했습니다.");
}

export async function getLikeStatus(postId: string) {
  const res = await httpGet<{ liked: boolean }>(
    `/api/posts/${postId}/likes/status`,
  );
  return res.data;
}

// ─── 내가 쓴 글 ───
export async function getMyPosts() {
  const res = await httpGet<MyPost[]>("/api/posts/my");
  return res.data;
}

// ─── 공지사항 ───
export async function getNotices() {
  const res = await httpGet<Notice[]>("/api/notices");
  return res.data;
}

export async function getNotice(id: string) {
  const res = await httpGet<Notice>(`/api/notices/${id}`);
  return res.data;
}

// ─── FAQ ───
export async function getFaqs() {
  const res = await httpGet<FaqItem[]>("/api/faq");
  return res.data;
}

// ─── 1:1 문의 ───
export async function createInquiry(title: string, content: string, attachmentUrls?: string[]) {
  const res = await httpPost<InquiryItem>("/api/inquiries", { title, content, attachmentUrls: attachmentUrls ?? [] });
  return res.data;
}

export async function getMyInquiries() {
  const res = await httpGet<InquiryItem[]>("/api/inquiries/my");
  return res.data;
}

export async function getInquiry(id: string) {
  const res = await httpGet<InquiryDetail>(`/api/inquiries/${id}`);
  return res.data;
}
