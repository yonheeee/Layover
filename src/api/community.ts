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
import { httpGet, httpPost, httpPut, httpDelete } from "./http";

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
  return res.data;
}

export async function getPost(id: string) {
  const res = await httpGet<PostDetail>(`/api/posts/${id}`);
  return res.data;
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
  return res.data;
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
  return res.data;
}

export async function deletePost(id: string) {
  await httpDelete(`/api/posts/${id}`);
}

// ─── 댓글 ───
export async function createComment(postId: string, content: string) {
  const res = await httpPost<PostComment>(`/api/posts/${postId}/comments`, {
    content,
  });
  return res.data;
}

export async function deleteComment(postId: string, commentId: string) {
  await httpDelete(`/api/posts/${postId}/comments/${commentId}`);
}

// ─── 좋아요 ───
export async function toggleLike(postId: string) {
  await httpPost(`/api/posts/${postId}/likes`);
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
export async function createInquiry(title: string, content: string) {
  const res = await httpPost<InquiryItem>("/api/inquiries", { title, content });
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
