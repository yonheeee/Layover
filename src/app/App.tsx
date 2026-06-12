import { useState } from "react";
import { MapPin, Clock, Train, ChevronRight, Star, Navigation, Users, Heart, Menu, X } from "lucide-react";
// Clock은 카드 섹션 거리/소요시간 표시에 사용
import { AuthModal } from "./components/AuthModal";

/* MARKER-MAKE-KIT-INVOKED */

const MOCK_TRAINS: Record<string, { id: string; name: string; depart: string; arrive: string; seats: number }[]> = {
  daejeon: [
    { id: "ktx-101", name: "KTX 101", depart: "10:32", arrive: "12:18", seats: 24 },
    { id: "ktx-103", name: "KTX 103", depart: "12:05", arrive: "13:51", seats: 7 },
    { id: "ktx-107", name: "KTX 107", depart: "14:20", arrive: "16:06", seats: 31 },
    { id: "sts-201", name: "SRT 201", depart: "15:48", arrive: "17:34", seats: 3 },
  ],
  "seo-daejeon": [
    { id: "ktx-201", name: "KTX 201", depart: "09:15", arrive: "11:02", seats: 18 },
    { id: "ktx-205", name: "KTX 205", depart: "11:40", arrive: "13:28", seats: 12 },
    { id: "sts-301", name: "SRT 301", depart: "13:55", arrive: "15:43", seats: 5 },
  ],
};

const CATEGORY_FILTERS = [
  { key: "bread", label: "빵·베이커리", emoji: "🍞" },
  { key: "nature", label: "자연·공원", emoji: "🌿" },
  { key: "tour", label: "관광지", emoji: "🏛" },
  { key: "food", label: "음식·맛집", emoji: "🍜" },
];

const NAV_LINKS = [
  { label: "홈", href: "#", active: true },
  { label: "지도", href: "#", active: false },
  { label: "커뮤니티", href: "#", active: false },
  { label: "마이페이지", href: "#", active: false },
];

const STATION_OPTIONS = [
  { value: "daejeon", label: "대전역" },
  { value: "seo-daejeon", label: "서대전역" },
];

const SPOTS = [
  {
    id: 1,
    name: "성심당",
    category: "맛집 · 베이커리",
    description: "1956년부터 이어온 대전의 대표 빵집. 튀김소보로와 부추빵으로 유명한 전국구 명소.",
    distance: "대전역에서 도보 10분",
    duration: "30~60분",
    rating: 4.9,
    reviews: 3240,
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnklMjBicmVhZCUyMHBhc3RyeSUyMHNob3B8ZW58MXx8fHwxNzgxMjM5Mjk2fDA&ixlib=rb-4.1.0&q=80&w=800",
    tag: "🍞 베이커리",
  },
  {
    id: 2,
    name: "한밭수목원",
    category: "자연 · 공원",
    description: "도심 속 녹색 쉼터. 국내 최대 규모의 도시 수목원으로 사계절 다양한 꽃과 나무를 만날 수 있습니다.",
    distance: "대전역에서 버스 20분",
    duration: "60~120분",
    rating: 4.7,
    reviews: 1850,
    isOpen: true,
    image:
      "https://images.unsplash.com/photo-1651422933132-d3e8822d8b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3RhbmljYWwlMjBnYXJkZW4lMjBuYXR1cmUlMjBwYXJrfGVufDF8fHx8MTc4MTIzOTI5N3ww&ixlib=rb-4.1.0&q=80&w=800",
    tag: "🌿 자연",
  },
  {
    id: 3,
    name: "테미오래",
    category: "문화 · 역사",
    description: "일제강점기 관사촌을 문화공간으로 재생한 곳. 갤러리, 카페, 공방이 어우러진 복합 문화 공간.",
    distance: "대전역에서 버스 15분",
    duration: "60~90분",
    rating: 4.6,
    reviews: 920,
    isOpen: false,
    image:
      "https://images.unsplash.com/photo-1734287096542-daa9300f1484?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjB0cmFkaXRpb25hbCUyMGFyY2hpdGVjdHVyZSUyMGdhcmRlbnxlbnwxfHx8fDE3ODEyMzkyOTV8MA&ixlib=rb-4.1.0&q=80&w=800",
    tag: "🏛 문화",
  },
];

export default function App() {
  const [selectedStation, setSelectedStation] = useState("daejeon");
  const [selectedTrain, setSelectedTrain] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (key: string) => {
    setSelectedFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [likedSpots, setLikedSpots] = useState<number[]>([]);
  const [authOpen, setAuthOpen] = useState(false);

  const toggleLike = (id: number) => {
    setLikedSpots((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Noto Sans KR', 'Nunito', sans-serif" }}
    >
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {/* ── Navigation ── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(178,228,220,0.35)",
          boxShadow: "0 1px 20px rgba(178,228,220,0.15)",
        }}
      >
        <div
          className="mx-auto px-8 h-16 flex items-center justify-between"
          style={{ maxWidth: "1440px" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #B2E4DC, #3db89e)" }}
            >
              <Train size={15} color="#fff" />
            </div>
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: "1.2rem",
                color: "#1a2e2b",
                letterSpacing: "-0.02em",
              }}
            >
              대전{" "}
              <span style={{ color: "#3db89e" }}>레이오버</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  color: link.active ? "#3db89e" : "#6b8c87",
                  fontWeight: link.active ? 600 : 400,
                  background: link.active ? "#E8F8F5" : "transparent",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-xl text-sm transition-colors"
              style={{ color: "#6b8c87", fontWeight: 500 }}
              onClick={() => setAuthOpen(true)}
            >
              로그인
            </button>
            <button
              className="px-5 py-2.5 rounded-xl text-sm text-white transition-all duration-200 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #B2E4DC, #3db89e)",
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(61,184,158,0.3)",
              }}
              onClick={() => setAuthOpen(true)}
            >
              무료 시작
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={22} color="#3db89e" />
            ) : (
              <Menu size={22} color="#3db89e" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden px-6 py-4 flex flex-col gap-2"
            style={{ borderTop: "1px solid rgba(178,228,220,0.3)", background: "#fff" }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="py-3 px-4 rounded-xl"
                style={{
                  color: link.active ? "#3db89e" : "#6b8c87",
                  background: link.active ? "#E8F8F5" : "transparent",
                  fontWeight: link.active ? 600 : 400,
                  textDecoration: "none",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(155deg, #E8F8F5 0%, #ffffff 45%, #f0faf8 100%)",
          minHeight: "600px",
        }}
      >
        {/* decorative blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-100px",
            right: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(178,228,220,0.35), transparent 70%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-80px",
            left: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(61,184,158,0.15), transparent 70%)",
          }}
        />

        <div
          className="mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          style={{ maxWidth: "1440px" }}
        >
          {/* Text */}
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ background: "#E8F8F5", color: "#3db89e", fontWeight: 600 }}
            >
              <Train size={14} />
              KTX 환승 여행 가이드
            </div>

            <h1
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 3.2rem)",
                color: "#1a2e2b",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              대기 시간을
              <br />
              <span style={{ color: "#3db89e" }}>여행으로</span> 채우세요
            </h1>

            <p
              style={{
                fontSize: "1.05rem",
                color: "#6b8c87",
                lineHeight: 1.8,
                maxWidth: "480px",
              }}
            >
              KTX 환승 대기 시간, 그냥 역에서 기다리지 마세요.
              <br />
              대전의 숨은 명소를 시간에 맞게 똑똑하게 즐겨보세요.
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-2">
              {[
                { icon: <MapPin size={15} />, value: "50+", label: "대전 관광지" },
                { icon: <Users size={15} />, value: "12,000+", label: "여행자 후기" },
                { icon: <Navigation size={15} />, value: "3분", label: "코스 생성" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#3db89e" }}>{stat.icon}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        color: "#1a2e2b",
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "#6b8c87" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Search card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "#ffffff",
              boxShadow:
                "0 8px 48px rgba(178,228,220,0.4), 0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid rgba(178,228,220,0.5)",
            }}
          >
            <h2
              style={{
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "#1a2e2b",
                marginBottom: "1.5rem",
              }}
            >
              맞춤 코스 찾기
            </h2>

            {/* ① 출발역 선택 */}
            <div className="mb-5">
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6b8c87", letterSpacing: "0.04em", marginBottom: "10px" }}>
                출발역 선택
              </p>
              <div className="grid grid-cols-2 gap-3">
                {STATION_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setSelectedStation(s.value); setSelectedTrain(""); }}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all duration-200"
                    style={{
                      border: `2px solid ${selectedStation === s.value ? "#3db89e" : "rgba(178,228,220,0.4)"}`,
                      background: selectedStation === s.value ? "#E8F8F5" : "#ffffff",
                      color: selectedStation === s.value ? "#3db89e" : "#6b8c87",
                      fontWeight: selectedStation === s.value ? 600 : 400,
                      fontSize: "0.95rem",
                    }}
                  >
                    <Train size={15} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ② 기차표 선택 (API 연동 예정) */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6b8c87", letterSpacing: "0.04em" }}>
                  기차표 선택
                </p>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs"
                  style={{ background: "#E8F8F5", color: "#3db89e", fontWeight: 600 }}
                >
                  API 연동 예정
                </span>
              </div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1.5px solid rgba(178,228,220,0.45)" }}
              >
                {/* 헤더 */}
                <div
                  className="grid px-4 py-2.5 text-xs"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1fr 80px",
                    background: "#f0faf8",
                    color: "#6b8c87",
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                  }}
                >
                  <span>열차</span>
                  <span>출발</span>
                  <span>도착</span>
                  <span className="text-right">잔여석</span>
                </div>
                {/* 샘플 열차 목록 */}
                {MOCK_TRAINS[selectedStation].map((train) => (
                  <button
                    key={train.id}
                    onClick={() => setSelectedTrain(train.id)}
                    className="w-full grid px-4 py-3 text-sm transition-all duration-150"
                    style={{
                      gridTemplateColumns: "1fr 1fr 1fr 80px",
                      background: selectedTrain === train.id ? "#E8F8F5" : "#ffffff",
                      borderTop: "1px solid rgba(178,228,220,0.3)",
                      color: "#1a2e2b",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: selectedTrain === train.id ? "#3db89e" : "#1a2e2b" }}>
                      {train.name}
                    </span>
                    <span style={{ color: "#1a2e2b" }}>{train.depart}</span>
                    <span style={{ color: "#6b8c87" }}>{train.arrive}</span>
                    <span
                      className="text-right"
                      style={{
                        fontWeight: 600,
                        color: train.seats > 10 ? "#3db89e" : "#e05555",
                      }}
                    >
                      {train.seats}석
                    </span>
                  </button>
                ))}
              </div>
              {selectedTrain && (
                <p className="mt-2 text-xs" style={{ color: "#3db89e", fontWeight: 500 }}>
                  ✓ {MOCK_TRAINS[selectedStation].find((t) => t.id === selectedTrain)?.name} 선택됨 — 환승 대기 시간에 맞는 코스를 추천합니다
                </p>
              )}
            </div>

            {/* ③ 카테고리 필터 (중복 선택) */}
            <div className="mb-7">
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6b8c87", letterSpacing: "0.04em", marginBottom: "10px" }}>
                관심 카테고리{" "}
                <span style={{ fontWeight: 400, color: "#B2E4DC" }}>(중복 선택 가능)</span>
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                {CATEGORY_FILTERS.map((cat) => {
                  const active = selectedFilters.includes(cat.key);
                  return (
                    <button
                      key={cat.key}
                      onClick={() => toggleFilter(cat.key)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200"
                      style={{
                        border: `2px solid ${active ? "#3db89e" : "rgba(178,228,220,0.4)"}`,
                        background: active ? "#E8F8F5" : "#ffffff",
                        color: active ? "#3db89e" : "#6b8c87",
                        fontWeight: active ? 600 : 400,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {active && (
                        <span
                          className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                          style={{ background: "#3db89e", fontSize: "0.6rem", color: "#fff", lineHeight: 1 }}
                        >
                          ✓
                        </span>
                      )}
                      <span style={{ fontSize: "1.3rem" }}>{cat.emoji}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              {selectedFilters.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {selectedFilters.map((key) => {
                    const cat = CATEGORY_FILTERS.find((c) => c.key === key)!;
                    return (
                      <span
                        key={key}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                        style={{ background: "#E8F8F5", color: "#3db89e", fontWeight: 600 }}
                      >
                        {cat.emoji} {cat.label}
                        <button
                          onClick={() => toggleFilter(key)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#3db89e", lineHeight: 1, padding: 0 }}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #B2E4DC 0%, #3db89e 100%)",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "0 6px 20px rgba(61,184,158,0.35)",
                opacity: selectedTrain ? 1 : 0.7,
              }}
            >
              <Navigation size={17} />
              코스 추천받기
              <ChevronRight size={17} />
            </button>

            <p
              className="text-center mt-3"
              style={{ fontSize: "0.78rem", color: "#6b8c87" }}
            >
              ✨ AI가 환승 대기 시간에 맞는 최적 코스를 추천합니다
            </p>
          </div>
        </div>
      </section>

      {/* ── Spots Section ── */}
      <section className="py-20" style={{ maxWidth: "1440px", margin: "0 auto", padding: "5rem 2rem" }}>
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm"
              style={{ background: "#E8F8F5", color: "#3db89e", fontWeight: 600 }}
            >
              <MapPin size={13} />
              대전 인기 명소
            </div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                color: "#1a2e2b",
                letterSpacing: "-0.02em",
              }}
            >
              환승 시간에 딱 맞는 코스
            </h2>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-1 text-sm transition-all duration-200 hover:gap-2"
            style={{ color: "#3db89e", fontWeight: 600, textDecoration: "none" }}
          >
            전체 보기 <ChevronRight size={16} />
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPOTS.map((spot) => (
            <div
              key={spot.id}
              className="group rounded-3xl overflow-hidden transition-all duration-300"
              style={{
                background: "#ffffff",
                boxShadow:
                  "0 4px 24px rgba(178,228,220,0.2), 0 1px 4px rgba(0,0,0,0.04)",
                border: "1px solid rgba(178,228,220,0.35)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 16px 48px rgba(178,228,220,0.45), 0 4px 12px rgba(0,0,0,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 24px rgba(178,228,220,0.2), 0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              {/* Image */}
              <div
                className="relative overflow-hidden"
                style={{ height: "210px", background: "#f0faf8" }}
              >
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Category tag */}
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: "rgba(255,255,255,0.93)",
                      color: "#1a2e2b",
                      fontWeight: 600,
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {spot.tag}
                  </span>
                </div>

                {/* Open badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className="px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: spot.isOpen
                        ? "rgba(61,184,158,0.92)"
                        : "rgba(150,150,150,0.85)",
                      color: "#ffffff",
                      fontWeight: 600,
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {spot.isOpen ? "● 영업중" : "○ 영업종료"}
                  </span>
                </div>

                {/* Like */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(spot.id);
                  }}
                  className="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)" }}
                >
                  <Heart
                    size={15}
                    fill={likedSpots.includes(spot.id) ? "#f87171" : "none"}
                    color={likedSpots.includes(spot.id) ? "#f87171" : "#9ca3af"}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "#1a2e2b",
                        lineHeight: 1.3,
                      }}
                    >
                      {spot.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <Star size={13} fill="#fbbf24" color="#fbbf24" />
                      <span
                        style={{
                          fontSize: "0.83rem",
                          fontWeight: 600,
                          color: "#1a2e2b",
                        }}
                      >
                        {spot.rating}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "#6b8c87" }}>
                        ({spot.reviews.toLocaleString()})
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#3db89e",
                      fontWeight: 500,
                      marginTop: "3px",
                    }}
                  >
                    {spot.category}
                  </p>
                </div>

                <p style={{ fontSize: "0.875rem", color: "#6b8c87", lineHeight: 1.7 }}>
                  {spot.description}
                </p>

                {/* Info row */}
                <div
                  className="rounded-2xl p-3.5 flex items-center justify-between"
                  style={{ background: "#f0faf8" }}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} color="#3db89e" />
                    <span style={{ fontSize: "0.78rem", color: "#6b8c87" }}>
                      {spot.distance}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} color="#3db89e" />
                    <span style={{ fontSize: "0.78rem", color: "#6b8c87" }}>
                      {spot.duration}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #E8F8F5, #B2E4DC)",
                    color: "#1a2e2b",
                    fontWeight: 600,
                  }}
                >
                  코스에 추가하기
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "0 2rem 5rem", maxWidth: "1440px", margin: "0 auto" }}>
        <div
          className="relative rounded-3xl overflow-hidden px-12 py-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: "linear-gradient(135deg, #B2E4DC 0%, #3db89e 55%, #2aa88e 100%)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.12), transparent 60%)",
            }}
          />
          <div className="space-y-3 relative z-10">
            <h2
              style={{
                fontWeight: 700,
                fontSize: "clamp(1.35rem, 2.5vw, 1.75rem)",
                color: "#ffffff",
                lineHeight: 1.35,
                letterSpacing: "-0.02em",
              }}
            >
              지금 바로 나만의 대전
              <br />
              환승 코스를 만들어보세요!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem" }}>
              무료로 시작하고, 수천 명의 여행자와 후기를 나눠보세요.
            </p>
          </div>
          <button
            className="relative z-10 shrink-0 px-8 py-4 rounded-2xl flex items-center gap-2 transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5"
            style={{
              background: "#ffffff",
              color: "#3db89e",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            }}
          >
            <Train size={17} />
            무료로 코스 만들기
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(178,228,220,0.3)",
          background: "#f0faf8",
        }}
      >
        <div
          className="mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ maxWidth: "1440px" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #B2E4DC, #3db89e)" }}
            >
              <Train size={12} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, color: "#1a2e2b", fontSize: "0.9rem" }}>
              대전 레이오버
            </span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#6b8c87" }}>
            © 2026 대전 레이오버. 환승 여행을 더 스마트하게.
          </p>
          <div className="flex gap-5">
            {["이용약관", "개인정보처리방침", "문의하기"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: "0.78rem",
                  color: "#6b8c87",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#3db89e")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "#6b8c87")
                }
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
