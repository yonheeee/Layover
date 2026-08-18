import { onBeforeUnmount, ref, shallowRef } from "vue";
import { loadKakaoMaps } from "@/utils/kakaoMaps";

/**
 * 카카오 지도 SDK는 타입 정의를 제공하지 않는다.
 * any를 뷰 전체에 퍼뜨리는 대신 이 파일 안에 가둬 둔다.
 */
type KakaoNamespace = any;
type KakaoMap = any;
type KakaoOverlay = { setMap: (map: KakaoMap | null) => void };

export interface LatLngLike {
  lat: number;
  lng: number;
}

export interface CreateMapOptions {
  center?: LatLngLike;
  level?: number;
  /** 컨테이너 크기가 바뀔 때 자동으로 relayout 할지 여부 */
  observeResize?: boolean;
}

/** 대전역. 지도 기본 중심으로 사용한다. */
const DEFAULT_CENTER: LatLngLike = { lat: 36.3325, lng: 127.4348 };

/**
 * 카카오 지도 생성·오버레이 관리·정리를 한곳에서 담당한다.
 *
 * <p>기존에는 MapView, CourseResultView, StampTourView, PlaceDetailContents,
 * MypageView 다섯 곳이 지도 초기화, 마커/폴리라인 생성, setMap(null) 정리,
 * relayout 처리를 각자 복사해서 갖고 있었다. 오버레이 정리를 빠뜨리면 지도를
 * 다시 그릴 때 이전 마커가 남는데, 그 버그가 파일마다 따로 존재할 수 있었다.
 *
 * <p>컴포넌트가 사라질 때 오버레이와 이벤트 리스너를 자동으로 정리한다.
 */
export function useKakaoMap() {
  const kakao = shallowRef<KakaoNamespace | null>(null);
  const map = shallowRef<KakaoMap | null>(null);
  const isReady = ref(false);
  const error = ref<string | null>(null);

  let overlays: KakaoOverlay[] = [];
  let resizeObserver: ResizeObserver | null = null;
  let boundContainer: HTMLElement | null = null;

  async function createMap(
    container: HTMLElement | null,
    options: CreateMapOptions = {},
  ): Promise<KakaoMap | null> {
    if (!container) return null;

    try {
      const sdk = await loadKakaoMaps();
      kakao.value = sdk;

      const center = options.center ?? DEFAULT_CENTER;
      map.value = new sdk.maps.Map(container, {
        center: new sdk.maps.LatLng(center.lat, center.lng),
        level: options.level ?? 5,
      });

      if (options.observeResize !== false) {
        observeContainer(container);
      }

      isReady.value = true;
      error.value = null;
      return map.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "지도를 불러오지 못했습니다.";
      isReady.value = false;
      return null;
    }
  }

  /**
   * 오버레이를 추적 목록에 등록한다. clearOverlays()가 한 번에 정리한다.
   * 등록하지 않으면 지도를 다시 그릴 때 이전 마커가 남는다.
   */
  function track<T extends KakaoOverlay>(overlay: T): T {
    overlays.push(overlay);
    return overlay;
  }

  function addMarker(position: LatLngLike, options: Record<string, unknown> = {}) {
    if (!kakao.value || !map.value) return null;
    const marker = new kakao.value.maps.Marker({
      position: new kakao.value.maps.LatLng(position.lat, position.lng),
      map: map.value,
      ...options,
    });
    return track(marker);
  }

  function addCustomOverlay(position: LatLngLike, options: Record<string, unknown> = {}) {
    if (!kakao.value || !map.value) return null;
    const overlay = new kakao.value.maps.CustomOverlay({
      position: new kakao.value.maps.LatLng(position.lat, position.lng),
      map: map.value,
      ...options,
    });
    return track(overlay);
  }

  function addPolyline(path: LatLngLike[], options: Record<string, unknown> = {}) {
    if (!kakao.value || !map.value || path.length < 2) return null;
    const polyline = new kakao.value.maps.Polyline({
      path: path.map((point) => new kakao.value.maps.LatLng(point.lat, point.lng)),
      map: map.value,
      ...options,
    });
    return track(polyline);
  }

  function clearOverlays() {
    overlays.forEach((overlay) => {
      try {
        overlay.setMap(null);
      } catch {
        // 이미 제거된 오버레이는 무시한다.
      }
    });
    overlays = [];
  }

  /** 주어진 좌표가 모두 보이도록 지도 범위를 맞춘다. */
  function fitBounds(points: LatLngLike[], padding = 40) {
    if (!kakao.value || !map.value || points.length === 0) return;

    const bounds = new kakao.value.maps.LatLngBounds();
    points.forEach((point) => {
      bounds.extend(new kakao.value.maps.LatLng(point.lat, point.lng));
    });
    map.value.setBounds(bounds, padding, padding, padding, padding);
  }

  function panTo(position: LatLngLike) {
    if (!kakao.value || !map.value) return;
    map.value.panTo(new kakao.value.maps.LatLng(position.lat, position.lng));
  }

  function relayout() {
    map.value?.relayout();
  }

  /**
   * 탭 전환이나 모달 열림처럼 컨테이너가 뒤늦게 보이는 경우,
   * 다음 프레임에 relayout 해야 지도가 회색으로 남지 않는다.
   */
  function relayoutSoon() {
    requestAnimationFrame(() => {
      relayout();
      requestAnimationFrame(relayout);
    });
  }

  function observeContainer(container: HTMLElement) {
    boundContainer = container;
    resizeObserver = new ResizeObserver(relayout);
    resizeObserver.observe(container);
    window.addEventListener("resize", relayout);
    relayoutSoon();
  }

  function destroy() {
    clearOverlays();
    if (resizeObserver && boundContainer) {
      resizeObserver.unobserve(boundContainer);
      resizeObserver.disconnect();
    }
    resizeObserver = null;
    boundContainer = null;
    window.removeEventListener("resize", relayout);
    map.value = null;
    isReady.value = false;
  }

  onBeforeUnmount(destroy);

  return {
    kakao,
    map,
    isReady,
    error,
    createMap,
    track,
    addMarker,
    addCustomOverlay,
    addPolyline,
    clearOverlays,
    fitBounds,
    panTo,
    relayout,
    relayoutSoon,
    destroy,
  };
}
