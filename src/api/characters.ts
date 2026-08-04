import { httpGet } from "./http";

export interface CharacterResponse {
  id: string;
  name: string;
  imageUrl: string;
  requiredStamps: number;
  description: string;
  obtained: boolean;
}

export async function getCharacters(): Promise<CharacterResponse[]> {
  const res = await httpGet<CharacterResponse[]>("/api/characters");
  return res.data ?? [];
}
