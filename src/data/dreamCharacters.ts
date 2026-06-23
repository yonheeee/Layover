import dreamFamilyImage from '../assets/characters/dream/character_dream.png'
import dreamFamily01Image from '../assets/characters/dream/dream_family_01.png'
import dreamFamily02Image from '../assets/characters/dream/dream_family_02.png'
import dreamFamily03Image from '../assets/characters/dream/dream_family_03.png'
import dreamFamily04Image from '../assets/characters/dream/dream_family_04.png'
import dreamFamily05Image from '../assets/characters/dream/dream_family_05.png'
import dreamFamily06Image from '../assets/characters/dream/dream_family_06.png'
import dreamFamily07Image from '../assets/characters/dream/dream_family_07.png'
import dreamFamily08Image from '../assets/characters/dream/dream_family_08.png'
import dreamFamily09Image from '../assets/characters/dream/dream_family_09.png'
import dreamFamily10Image from '../assets/characters/dream/dream_family_10.png'
import dreamFamily11Image from '../assets/characters/dream/dream_family_11.png'

export interface DreamCharacter {
  id: string
  name: string
  role: string
  description: string
  imageUrl: string
  imageAlt: string
  sourceUrl: string
}

export const DREAM_CHARACTER_SOURCE_URL =
  'https://www.daejeon.go.kr/drh/DrhContentsHtmlView.do?menuSeq=7425'

export const dreamCharacters: DreamCharacter[] = [
  {
    id: 'dream-family',
    name: '꿈씨패밀리',
    role: '대전광역시 꿈씨패밀리',
    description: '대전광역시 공식 캐릭터 꿈씨패밀리 대표 이미지입니다.',
    imageUrl: dreamFamilyImage,
    imageAlt: '꿈씨패밀리',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'kkumdori-kkumsooni',
    name: '꿈돌이·꿈순이',
    role: '부부',
    description:
      '과학과 평화의 도시 대전을 누구보다 사랑하는 부부. 요즘 가장 큰 관심사는 대전의 발전과 가족의 안녕이다.',
    imageUrl: dreamFamily01Image,
    imageAlt: '꿈돌이와 꿈순이',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'geumdori',
    name: '금돌이',
    role: '꿈돌이의 아버지',
    description:
      '특유의 재치와 여유로 감필라고 사람들을 굽어 살피는 왕이자 살기 좋은 도시를 만든 지혜로운 왕입니다.',
    imageUrl: dreamFamily09Image,
    imageAlt: '꿈돌이의 아버지 금돌이',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'eunsooni',
    name: '은순이',
    role: '꿈돌이의 어머니',
    description:
      '사람들의 꿈과 웃음을 제일로 여기는 감필라고의 왕비입니다. 마음 편히 쉴 수 있는 도시를 만들기 위해 노력하고 있습니다.',
    imageUrl: dreamFamily10Image,
    imageAlt: '꿈돌이의 어머니 은순이',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'kkumbichi',
    name: '꿈빛이',
    role: '첫째',
    description: '과학을 정말 좋아해, 폭탄 질문으로 꿈부부를 언제나 당황하게 한다.',
    imageUrl: dreamFamily02Image,
    imageAlt: '첫째 꿈빛이',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'kkumgyeori',
    name: '꿈결이',
    role: '둘째',
    description: '가만히 앉아 골똘히 생각하는 것이 취미다.',
    imageUrl: dreamFamily03Image,
    imageAlt: '둘째 꿈결이',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'kkumnuri',
    name: '꿈누리',
    role: '셋째',
    description:
      '사람과 여행을 사랑하여 장기간 여행을 떠났다 다시 대전으로 돌아왔습니다. 친화력이 뛰어나고 다양한 문화와 언어도 공부 중입니다.',
    imageUrl: dreamFamily11Image,
    imageAlt: '셋째 꿈누리',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'kkumbyeori-kkumdari',
    name: '꿈별이·꿈달이',
    role: '막내',
    description: '잠을 잘 때도, 사고를 칠 때도 언제나 함께한다.',
    imageUrl: dreamFamily04Image,
    imageAlt: '막내 꿈별이와 꿈달이',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'kkumdongi',
    name: '꿈동이',
    role: '꿈돌이의 동생',
    description: "최근에는 '좋은 꿈'이라는 주제로 우주 논문을 작성하고 있다.",
    imageUrl: dreamFamily05Image,
    imageAlt: '꿈돌이의 동생 꿈동이',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'mongmong',
    name: '몽몽',
    role: '꿈씨 가족의 반려견',
    description:
      '원래는 긴 꼬리가 멋진 혜성 늑대였지만 지구에 오면서 작은 강아지가 되었다.',
    imageUrl: dreamFamily06Image,
    imageAlt: '반려견 몽몽',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'neve',
    name: '네브',
    role: '외계 행성 대표',
    description: '데네브 별에서 온 대표자. 꿈돌이의 고향별과 활발히 교류하고 있다.',
    imageUrl: dreamFamily07Image,
    imageAlt: '외계 행성 대표 네브',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
  {
    id: 'dor',
    name: '도르',
    role: '소꿉친구',
    description:
      '사드르 별에서 온 꿈부부의 오랜 소꿉친구. 꿈부부와는 어릴 적부터 알고 지낸 막역한 사이다.',
    imageUrl: dreamFamily08Image,
    imageAlt: '소꿉친구 도르',
    sourceUrl: DREAM_CHARACTER_SOURCE_URL,
  },
]
