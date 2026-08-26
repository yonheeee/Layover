# 스탬프 위치 검증 개선 설계

> 대상: `Layover`(FE) / `Layover_Backend`(BE) · 2026-08-26
> 상태: **설계만. 구현 전.**

## 확인 사항

`stamp.verification.enabled` / `stamp.verification.radius-meters`는 **기존 코드입니다.**
커밋 `20e0f20`(2026-08-19, seonmin96)에서 추가되었고, 이번 캐릭터 도감 작업보다 앞섭니다.
이 문서는 그 위에 무엇을 더할지에 대한 것입니다.

---

## 1. 현재 검증 경로

```
[촬영 전] startVerify(idx)
   navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
      → haversine(내 좌표, 장소 좌표) <= 100        ← 프론트 하드코딩
      → 통과하면 verifiedCoords 에 좌표 보관
      → 가이드 2초 → 카메라

[저장]   confirmResult()
   saveStamp(placeId, verifiedCoords, ...)
      → 서버 verifyLocation(): 같은 계산을 radius-meters(기본 100m)로 다시 확인
```

프론트에서만 막으면 API를 직접 호출해 우회할 수 있으므로 서버가 다시 확인하는 구조 자체는 맞습니다.

---

## 2. 문제

### 2-1. `accuracy`를 버리고 있습니다 (가장 큼)

```ts
navigator.geolocation.getCurrentPosition(({ coords }) => {
  const dist = haversine(coords.latitude, coords.longitude, place.lat, place.lng)
  if (dist <= 100 || allowDevStampVerification) { ... }
```

`coords.accuracy`는 그 좌표의 **오차 반경(m, 68% 신뢰구간)** 입니다. 지금은 읽지도 않습니다.

| 측위 방식 | 일반적인 accuracy |
|---|---|
| 실외 GPS | 5 ~ 20 m |
| 실내 WiFi | 20 ~ 100 m |
| 기지국 | 500 ~ 3000 m |

**오차가 1km인 좌표로 100m 반경을 판정하는 건 동전 던지기입니다.** 실제로는 두 방향 모두로 틀립니다.

- 박물관·아쿠아리움 실내에서 진짜 그 자리에 있는데 거부당함 (거짓 거부)
- 오차가 커서 우연히 반경 안으로 계산되어 통과 (거짓 승인)

관광지 상당수가 실내라 첫 번째가 특히 아픕니다.

### 2-2. 판정 규칙이 두 곳에 있습니다

| | 값 |
|---|---|
| FE `StampTourView.startVerify` | `dist <= 100` **하드코딩** |
| BE `StampService.verifyLocation` | `stamp.verification.radius-meters` (기본 100) |

한쪽만 바꾸면 조용히 어긋납니다. 서버 설정을 50m로 낮춰도 프론트는 100m로 통과시켜서, 사용자는 촬영을 다 마친 뒤에야 400을 받습니다.

### 2-3. 개발 모드 우회가 프론트에만 있습니다

```ts
const allowDevStampVerification = import.meta.env.DEV
if (dist <= 100 || allowDevStampVerification) { ... }
```

프론트는 `npm run dev`에서 무조건 통과시키는데 서버는 그렇지 않습니다. 그래서 로컬 테스트가 "인증 통과 → 촬영 → 저장 실패"로 끝납니다. 프로덕션 빌드에서는 `DEV`가 false라 보안 위험은 아니지만, 우회 스위치가 프론트 코드에 박혀 있는 것 자체가 좋지 않습니다.

---

## 3. 이번 범위에서 뺀 것

논의 끝에 제외하기로 한 항목과 이유를 남깁니다.

| 항목 | 결정 | 이유 |
|---|---|---|
| `stamps`에 좌표 저장 | **안 함** | 위치는 민감 정보다. 검증에 쓰고 버린다. |
| 저장 시점 좌표 재측정 | **안 함** | 인증은 사진 찍는 순간에만 하면 된다. |
| 순간이동(이동 속도) 검사 | **안 함** | 좌표를 저장하지 않으므로 성립하지 않고, 얻는 것에 비해 복잡하다. |

좌표는 **검증 요청에 실려 오고, 판정이 끝나면 버려집니다.** 어떤 테이블에도 남지 않습니다.

---

## 4. 설계

### 4-1. accuracy를 반영한 판정

두 단계로 나눕니다.

**1단계 — 쓸 수 있는 좌표인지**

```
accuracy > ACCURACY_LIMIT (기본 200m)  →  거부
   "GPS 신호가 약해요. 실외로 나가서 다시 시도해주세요."
```

거절이 아니라 **재시도 안내**입니다. 기지국 측위로 떨어진 좌표를 믿고 판정하느니, 사용자에게 다시 잡게 하는 편이 정확합니다.

**2단계 — 오차를 감안한 거리 판정**

```
dist <= RADIUS + min(accuracy, ACCURACY_ALLOWANCE)
        (기본 100m)      (상한 100m)
```

오차만큼 반경을 넓혀주되, 상한을 둬서 무한정 관대해지지 않게 합니다.

| 상황 | accuracy | 실제 거리 | 실질 반경 | 결과 |
|---|---|---|---|---|
| 실외 GPS, 입구 앞 | 15 m | 90 m | 115 m | 통과 |
| 실외 GPS, 두 블록 밖 | 15 m | 200 m | 115 m | 거부 |
| 실내 WiFi | 80 m | 150 m | 180 m | 통과 |
| 기지국 | 1500 m | — | — | 1단계에서 거부 + 안내 |

지금보다 정상 사용자는 덜 막히고, 신뢰할 수 없는 좌표는 아예 안 씁니다.

```properties
stamp.verification.enabled=${STAMP_VERIFICATION_ENABLED:true}
stamp.verification.radius-meters=${STAMP_VERIFICATION_RADIUS_METERS:100}
stamp.verification.accuracy-limit-meters=${STAMP_VERIFICATION_ACCURACY_LIMIT:200}
stamp.verification.accuracy-allowance-meters=${STAMP_VERIFICATION_ACCURACY_ALLOWANCE:100}
```

### 4-2. 판정을 서버 한 곳으로

프론트가 거리 계산을 하지 않고 **서버에 물어봅니다.** 규칙이 한 곳에만 존재하게 됩니다.

```
POST /api/stamps/verify-location
  { placeId, latitude, longitude, accuracy }

200 { verified: true }
400 { message: "장소에서 너무 멀리 있습니다. (약 320m 떨어져 있어요)" }
400 { message: "GPS 신호가 약해요. 실외로 나가서 다시 시도해주세요." }
```

호출 시점은 지금과 같습니다 — **촬영 시작 전 `startVerify` 한 번.** 통과하면 좌표를 들고 있다가 저장 요청에 실어 보내고, 서버는 저장할 때 같은 판정을 한 번 더 합니다(API 직접 호출 우회 방지). 판정 로직은 `StampService`의 private 메서드 하나를 두 진입점이 공유합니다.

프론트에서 사라지는 것: `haversine()` 함수, `dist <= 100` 하드코딩, `R = 6371e3` 상수.

### 4-3. 개발 모드 우회 제거

`allowDevStampVerification`을 지웁니다. 로컬에서 위치를 무시하고 싶으면 **서버 설정 하나로** 제어합니다.

```properties
# application-local.properties (gitignore 대상)
stamp.verification.enabled=false
```

이러면 `verify-location`이 항상 200을 돌려주므로 프론트는 아무것도 몰라도 됩니다. 우회 스위치가 프론트 코드에서 사라지고, 서버는 이미 요청마다 경고 로그를 남깁니다.

```java
log.warn("[Stamp] 위치 검증이 꺼져 있습니다. 배포 환경에서는 stamp.verification.enabled=true 여야 합니다.");
```

---

## 5. 변경 파일

**백엔드**

| 파일 | 변경 |
|---|---|
| `stamp/StampService.java` | `verifyLocation`을 accuracy 반영 판정으로 교체, 검증 전용 메서드 분리 |
| `stamp/StampController.java` | `POST /verify-location` 추가 |
| `stamp/VerifyLocationRequest.java` | 신규 (placeId, latitude, longitude, accuracy) |
| `stamp/SaveStampRequest.java` | `accuracy` 필드 추가 |
| `resources/application.properties` | 설정 2개 추가 |

**프론트엔드**

| 파일 | 변경 |
|---|---|
| `api/stamps.ts` | `verifyLocation()` 추가, `saveStamp`에 accuracy 전달 |
| `views/stamp/StampTourView.vue` | `haversine`·`allowDevStampVerification` 제거, `startVerify`가 서버 호출로 전환, 재시도 안내 UI |

DB 변경 없음. 마이그레이션 없음.

---

## 6. 한계 — 발표 때 이렇게 말하는 게 낫습니다

**브라우저가 주는 위치는 원리적으로 신뢰할 수 없습니다.** `navigator.geolocation`의 값은 브라우저가 만들어 주는 것이고, DevTools의 Sensors 패널이나 위치 조작 앱으로 얼마든지 바꿉니다. 서버가 좌표를 전달받는 구조인 이상 완전 차단은 불가능합니다.

그래서 이 설계의 목표는 위조 차단이 아니라 두 가지입니다.

1. **정상 사용자를 정확하게 판정한다** — accuracy를 반영해 실내에서 억울하게 막히지 않게
2. **믿을 수 없는 입력을 걸러낸다** — 오차가 큰 좌표는 판정에 쓰지 않는다

완전한 위치 인증이 필요하다면 네이티브 앱 + 서버 사이드 어테스테이션(Play Integrity / App Attest) 영역이고, 웹에서는 도달할 수 없습니다. 과장하지 않고 이렇게 설명하는 편이 심사에서 오히려 신뢰를 얻습니다.

---

## 7. 검증 체크리스트

- [ ] DevTools Sensors로 장소 좌표를 넣고 인증 → 통과
- [ ] 좌표를 300m 밖으로 옮기고 인증 → "약 300m 떨어져 있어요"
- [ ] accuracy가 큰 상황 재현(WiFi만 켜고 실내) → 재시도 안내가 뜨는지
- [ ] `verify-location`을 건너뛰고 `POST /api/stamps`를 직접 호출 → 서버가 거부
- [ ] `stamp.verification.enabled=false` → 어디서든 통과, 경고 로그 출력
- [ ] `radius-meters`를 50으로 낮추고 재시도 → 프론트도 같은 기준으로 동작 (규칙 단일화 확인)
- [ ] DB `stamps` 테이블에 좌표 컬럼이 없는지 (저장하지 않음 확인)
