/**
 * 숫자만 남기고 11자리로 잘라 하이픈을 넣는다.
 * 011/016/017/018/019 는 10자리와 11자리 번호가 모두 존재하므로 최종 길이에
 * 맞춰 자리수를 나눈다. 8~9자리는 입력 도중의 상태이므로 하이픈 하나만 넣는다.
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const len = digits.length;

  if (len <= 3) return digits;
  if (len === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (len === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

/** 화면 표시(formatPhone 결과)에서 숫자만 남긴다. 서버 전송용. */
export function stripPhoneHyphen(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

/** 하이픈 없이 숫자만 뽑았을 때 01[016789]로 시작하는 10~11자리인지 확인한다. */
export function isValidPhoneDigits(digits: string): boolean {
  return /^01[016789]\d{7,8}$/.test(digits);
}

/**
 * 숫자만 남기고 8자리로 잘라 "1996년 03월 21일" 형태로 만든다.
 * 8자리를 채우기 전에는 입력 중인 만큼만 보여준다.
 */
export function formatBirthDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const len = digits.length;

  if (len === 0) return "";
  if (len <= 4) return `${digits}년`;
  if (len <= 6) return `${digits.slice(0, 4)}년 ${digits.slice(4)}월`;
  return `${digits.slice(0, 4)}년 ${digits.slice(4, 6)}월 ${digits.slice(6)}일`;
}

const MIN_YEAR = 1900;

/**
 * 숫자 8자리를 "YYYY-MM-DD" 로 변환한다. 실제로 존재하는 날짜인지 확인한다 —
 * `new Date('1996-02-30')` 은 3월 2일로 조용히 넘어가므로 Date 파싱 결과를
 * 그대로 믿지 않고 연/월/일을 각각 되짚어 비교한다.
 */
export function toIsoDate(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));

  if (year < MIN_YEAR) return null;

  const now = new Date();
  const isFuture =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1) ||
    (year === now.getFullYear() && month === now.getMonth() + 1 && day > now.getDate());
  if (isFuture) return null;

  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealDate) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 서버가 내려준 "1996-03-21" 을 "19960321" 로. 화면 초기값 채우기용. */
export function isoToDigits(iso: string | null): string {
  if (!iso) return "";
  return iso.replace(/-/g, "");
}
