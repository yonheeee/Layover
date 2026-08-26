import { httpGet, httpPost } from "./http";

/**
 * 서버가 내려주는 캐릭터 정보.
 *
 * 이미지 경로는 담지 않는다. 프론트가 `code`로 번들된 이미지를 찾는다
 * (`data/characterImages.ts` 참고).
 */
export interface CharacterResponse {
  id: string;
  code: string;
  name: string;
  kind: "SOLO" | "DUO" | "THEME";
  theme: "BIRTHDAY" | "EXPO" | null;
  baseChar: string;
  description: string;
}

/** 도감에서 내가 보유한 캐릭터 한 종 */
export interface OwnedCharacter {
  code: string;
  /** 중복 포함 획득 횟수 */
  count: number;
  firstObtainedAt: string;
}

/**
 * 내가 모은 캐릭터 목록.
 *
 * 전체 147종 목록은 프론트가 `characterCatalog`로 갖고 있으므로 서버는
 * 보유분만 내려주면 된다.
 */
export async function getMyCharacters(): Promise<OwnedCharacter[]> {
  const res = await httpGet<OwnedCharacter[]>("/api/characters/my");
  return res.data ?? [];
}

/**
 * 캐릭터 한 장 뽑기.
 *
 * 서버에 저장하지 않는다. 사진을 다시 찍을 때마다 호출해도 도감은 변하지 않고,
 * 실제 획득은 `POST /api/stamps`에 이 캐릭터 id를 실어 보낼 때 확정된다.
 */
export async function drawCharacter(placeId: string): Promise<CharacterResponse> {
  const res = await httpPost<CharacterResponse>("/api/characters/draw", { placeId });
  return res.data;
}
