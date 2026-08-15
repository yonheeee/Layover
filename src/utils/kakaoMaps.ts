const KAKAO_MAP_SCRIPT_ID = "kakao-map-script";

let kakaoMapsPromise: Promise<any> | null = null;

export function getKakaoMapsKey(): string {
  return import.meta.env.VITE_KAKAO_JS_KEY || import.meta.env.VITE_KAKAO_KEY || "";
}

export function loadKakaoMaps(): Promise<any> {
  if (kakaoMapsPromise) return kakaoMapsPromise;

  kakaoMapsPromise = new Promise((resolve, reject) => {
    const win = window as any;
    const loadMaps = () => {
      if (!win.kakao?.maps) {
        reject(new Error("Kakao Maps SDK is not available."));
        return;
      }
      win.kakao.maps.load(() => resolve(win.kakao));
    };

    if (win.kakao?.maps) {
      loadMaps();
      return;
    }

    const existingScript = document.getElementById(
      KAKAO_MAP_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", loadMaps, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Kakao Maps SDK failed to load.")),
        { once: true },
      );
      return;
    }

    const appKey = getKakaoMapsKey();
    if (!appKey) {
      reject(new Error("Kakao Maps key is not configured."));
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.onload = loadMaps;
    script.onerror = () => reject(new Error("Kakao Maps SDK failed to load."));
    document.head.appendChild(script);
  });

  return kakaoMapsPromise;
}
