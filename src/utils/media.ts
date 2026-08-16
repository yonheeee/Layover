export function resolveMediaUrl(url?: string | null) {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/+$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${path}`;
}
