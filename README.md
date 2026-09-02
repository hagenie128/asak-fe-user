<div align="center">

# 🥗 ASAK Kiosk

**메뉴 선택부터 주문 완료까지 이어지는 고객용 셀프 주문 키오스크**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111827)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-433E38?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Status](https://img.shields.io/badge/Status-In_Development-F59E0B?style=flat-square)

[빠른 시작](#-빠른-시작) · [주문 흐름](#-주문-흐름과-구현-상태) · [PWA](#-pwa--키오스크-전체화면) · [이미지](#️-메뉴-이미지--cloudinary) · [폴더 구조](#-폴더-구조도) · [문서](#-관련-문서)

</div>

---

> **Personal Extension (Hajin)** — 팀 프로젝트 종료 이후 개인 포트폴리오 확장 저장소
> Team Development: 2026.07 ~ 2026.09 · Freeze tag: `team-original-2026-09-02`
> upstream: [hagenie128/ASAK-Kiosk](https://github.com/hagenie128/ASAK-Kiosk) (팀 원본, push 금지)

| 버전 | 배포 |
| --- | --- |
| Team Original | https://kiosk.asak.stackroom.cloud |
| Personal Extension (이 repo) | https://kiosk.hajin-asak.stackroom.cloud |

## Project Origin

**Original ASAK Team Project** — 고객용 키오스크 (팀 시 기여: 김나연 주도)

| 영역 | 팀 시 담당 |
| --- | --- |
| 프론트 | 주문 세션, 옵션, 토스페이먼츠, 타임아웃 |

## Personal Extension

팀 종료(`team-original-2026-09-02`) 이후 개인적으로 추가·개선한 기능을 여기에 기록한다.

## Original Repository

- https://github.com/hagenie128/ASAK-Kiosk

---

## 0. 프로젝트 한눈에 보기

ASAK 주문 키오스크 전용 **React + Vite** 애플리케이션입니다. 1080×1920 세로형 키오스크 화면을 기준으로 만들며, 관리자 운영 화면은 별도 `ASAK-Admin` 저장소에서 개발합니다.

```text
URL → Page → Components → Store / Utils → api/* → ASAK-back
```

- Page는 화면 흐름과 API 결과 반영을 담당합니다.
- 장바구니와 주문 세션은 Zustand store에 보관합니다.
- 가격 계산은 `priceCalculation.js`, 수량 제한은 `quantityLimits.js`만 사용합니다.
- 메뉴 이미지는 API의 Cloudinary `imageUrl`을 표시합니다.
- 브랜드 로고·결제 일러스트 같은 UI 자산은 `src/assets`에 둡니다.

> 이 프로젝트는 독립 Git 저장소입니다. 변경사항은 반드시 `ASAK-Kiosk` 폴더에서 커밋·push합니다. 상위 구조는 [워크스페이스 안내](../README.md)를 참고합니다.
>
> **작업 시작점:** [ASAK 프로젝트 작업 허브](../ASAK/PROJECT_HUB.md) → 기능 한 개 선택 → 코드 수정 → 워크로그 기록

---

## 🚀 빠른 시작

### 1단계: 환경 변수 준비

```powershell
cd C:\ASAK-workspace\ASAK-Kiosk
copy .env.example .env
```

현재 필요한 프론트 환경 변수는 백엔드 주소입니다.

```properties
VITE_API_BASE_URL=http://localhost:8080
```

Cloudinary API key나 secret은 프론트에 넣지 않습니다. 메뉴 공개 URL은 백엔드 API의 `imageUrl`로 받습니다.

### 2단계: 설치와 실행

```powershell
npm install
npm run dev
```

### 3단계: 접속 확인

| 항목 | 값 |
| --- | --- |
| 개발 서버 | `http://localhost:5173` (`host: 0.0.0.0`) |
| API 프록시 | `/api` → `http://localhost:8080` |
| 디자인 기준 | 1080×1920 portrait |
| PWA | `display: fullscreen` · `orientation: portrait` |

메뉴·장바구니 검증·주문 생성 화면은 실제 API를 호출하므로 `ASAK-back`이 8080에서 실행 중이어야 합니다.

Android 태블릿 설치·전체화면 절차는 [Android PWA 전체화면](../ASAK/docs/operations/setup/android-pwa-fullscreen.md)을 따릅니다.

### 자주 쓰는 명령어

| 명령어 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run lint` | ESLint 정적 검사 |
| `npm run build` | 배포용 `dist/` 생성 |
| `npm run preview` | 빌드 결과 미리보기 |

---

## 🛒 주문 흐름과 구현 상태

```text
Home
  → Menu List
  → Menu Detail
  → Cart
  → Payment
  → Payment Processing
  → Complete
```

| 단계 | 경로 | API | 데이터·동작 | 상태 |
| --- | --- | --- | --- | --- |
| 홈 | `/` | — | 매장/포장 선택을 store에 저장 | ✅ 동작 |
| 메뉴 목록 | `/menu` | API-001 / 002 | 카테고리·메뉴 목록 | ✅ 실API |
| 메뉴 상세 | `/menu/:menuId` | API-003 | 재료·알레르기·옵션·품절 | ✅ 실API |
| 장바구니 | `/cart` | API-004 | 수량·삭제·가격 계산 + 서버 재검증 | ✅ store + 실API |
| 결제 선택 | `/payment` | API-005 · API-014 | 로컬 결제수단 + 주문 생성 | 🟡 주문 생성만 실API |
| 결제 진행 | `/paymentProcessing` | API-006 | 타이머 기반 성공·실패 테스트 | 🟡 결제 승인 API 미연결 |
| 주문 완료 | `/complete` | — | 완료 화면 이동 | 🟡 결제 결과 연결 보강 필요 |
| 접근성 | `/accessibility` | — | 접근성 화면 | 🟡 라우트는 있으나 운영 흐름 미연결 |
| 결제 오류 | — | — | 별도 라우트 없음 | ⛔ 미연결 |
| 시간 초과 | — | — | Hook stub만 존재 | ⛔ 미연결 |
| 영수증 | — | — | `ReceiptPage` 파일은 있으나 라우트 주석 처리 | ⛔ 미연결 |

### 실제 API 연결 범위

| API | Method | 경로 | 프론트 파일 | 상태 |
| --- | --- | --- | --- | --- |
| API-001 | GET | `/api/kiosk/categories` | `api/category.js` | ✅ 연결 |
| API-002 | GET | `/api/kiosk/menuList` | `api/menu.js` | ✅ 연결 |
| API-003 | GET | `/api/kiosk/menuDetail/{menuId}` | `api/menu.js` | ✅ 연결 |
| API-004 | POST | `/api/kiosk/cart/validate` | `api/cart.js` | ✅ 연결 |
| API-005 | POST | `/api/kiosk/orders` | `api/order.js` | ✅ 연결 |
| API-014 | GET | `/api/kiosk/payment-methods` | — | 🟡 로컬 상수 사용 (API 미연결) |
| API-006 | POST | `/api/kiosk/payments` | `api/payment.js` | 🟡 파일은 있으나 화면 미연결 |

API 번호 정본은 [`../ASAK-back/IMPLEMENTATION_PLAN.md`](../ASAK-back/IMPLEMENTATION_PLAN.md) §4입니다. `constants/api.js`가 `/api/kiosk` 경로 정본이며, Page에서 axios를 직접 쓰지 않고 `api/*` 함수를 호출합니다.

---

## 📱 PWA · 키오스크 전체화면

키오스크는 `vite-plugin-pwa`로 설치형 앱처럼 실행합니다. 대상은 **세로형 Android 태블릿 + Chrome**입니다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 플러그인 | `vite-plugin-pwa` · `registerType: "autoUpdate"` | `vite.config.js` |
| 앱 이름 | `ASAK Kiosk` | manifest `name` / `short_name` |
| 표시 모드 | `fullscreen` 우선, `standalone` 대체 | `display` / `display_override` |
| 화면 방향 | `portrait` | manifest `orientation` |
| 시작 URL | `/` · scope `/` · id `/asak-kiosk` | manifest |
| 아이콘 | `public/pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png` | `public/` |

### 전체화면 진입 흐름

```text
entries/kiosk.jsx
  → 설치된 PWA인지 확인 (display-mode: standalone)
  → 첫 pointerdown/keydown에서 requestFullscreen + portrait lock
  → Fullscreen API가 막혀도 주문 흐름은 계속
```

- Android 정책상 웹페이지가 사용자 입력 없이 Fullscreen API를 호출할 수는 없습니다.
- manifest `display: fullscreen`이 기기에서 충분히 적용되면 추가 API 호출이 필요 없을 수 있습니다.
- 설치·갱신·플래그 설정 절차는 [Android PWA 전체화면](../ASAK/docs/operations/setup/android-pwa-fullscreen.md)을 따릅니다.

### 한계

PWA만으로는 전원 부팅 후 자동 실행, 사용자의 앱 이탈 차단, 시스템 UI 영구 숨김을 보장하지 못합니다. 완전한 무인 키오스크는 Device Owner / Lock Task 등을 별도로 검토합니다.

---

## 🖼️ 메뉴 이미지 · Cloudinary

메뉴 이미지는 프론트 저장소의 로컬 메뉴 파일을 정본으로 쓰지 않고, **백엔드 API의 `imageUrl`**을 표시합니다.

```text
Cloudinary 이미지 업로드
  → DB media_asset.url
  → menu.image_asset_id
  → UserMenuMapper가 media_asset.url JOIN
  → 메뉴 목록·상세 API의 imageUrl
  → Kiosk <img src={imageUrl}>
```

### 실제 사용 위치

| 파일 | 이미지 처리 |
| --- | --- |
| `MenuCard.jsx` | 메뉴 목록 카드의 `imageUrl` 표시 |
| `MenuDetailSummary.jsx` | 메뉴 상세 대표 이미지 표시 |
| `MenuDetailPage.jsx` | 장바구니 item에 API `imageUrl` 보존 |
| `CartItem.jsx` | 장바구니에 저장한 `imageUrl` 표시 |
| `OrderListItem.jsx` | 주문 항목 이미지 표시 |

### 메뉴 이미지와 UI 자산의 차이

| 종류 | 위치·책임 |
| --- | --- |
| 메뉴·재료 사진 | Cloudinary → `media_asset.url` → API `imageUrl` |
| 브랜드 로고 | `src/assets` |
| 결제 일러스트·모달 아이콘 | `src/assets` |
| PWA 아이콘 | `public/` |

### 알아둘 점

- 프론트에는 Cloudinary API key/secret이 필요하지 않습니다.
- `@cloudinary/react`, `@cloudinary/url-gen`, `cloudinary` 의존성은 설치되어 있지만 현재 화면 코드는 SDK를 직접 호출하지 않습니다.
- 키오스크는 업로드하지 않고 공개 URL을 표시만 합니다.
- `image_asset_id`가 없거나 자산이 비활성·삭제 상태면 `imageUrl`이 비어 이미지가 표시되지 않을 수 있습니다.
- 자세한 DB 전환 흐름은 [`ASAK-back/docs/MENU_IMAGE_ASSET_FLOW.md`](../ASAK-back/docs/MENU_IMAGE_ASSET_FLOW.md)를 봅니다.

---

## 📁 폴더 구조도

```text
src/
│
├── main.jsx                         # [진입점] 앱 시작
├── entries/
│   └── kiosk.jsx                    # - BrowserRouter와 React root 연결
│
├── apps/kiosk/
│   └── KioskApp.jsx                # [라우트] URL별 Page 조립 + 1080×1920 scale
│
├── pages/kiosk/                    # [URL 화면] 사용자 주문 흐름
│   ├── HomePage.jsx                # - 매장/포장 선택
│   ├── MenuListPage.jsx            # - 카테고리·메뉴 API 조회
│   ├── MenuDetailPage.jsx          # - 옵션·재료 제외·수량 선택 후 담기
│   ├── CartPage.jsx                # - 장바구니 편집 + API-004 서버 검증
│   ├── PaymentPage.jsx             # - 결제수단 선택 + API-005 주문 생성
│   ├── PaymentProcessingPage.jsx   # - 결제 진행 테스트 흐름
│   ├── OrderCompletePage.jsx       # - 주문 완료 화면
│   ├── AccessibilityPage.jsx       # - 접근성 화면
│   ├── ReceiptPage.jsx             # - 영수증 화면 후보 (라우트 미연결)
│   └── UiStatePreviewPage.jsx      # - UI 상태 개발 참고 (운영 라우트 아님)
│
├── components/
│   ├── common/                     # [공통 UI]
│   │   ├── Header.jsx              # - 키오스크 상단 로고·헤더
│   │   ├── Footer.jsx              # - 공통 하단 영역
│   │   ├── Button.jsx              # - 공통 버튼
│   │   ├── Modal.jsx               # - 결제 진행·결과 모달
│   │   ├── ConfirmDialog.jsx       # - 확인 다이얼로그
│   │   ├── LoadingSpinner.jsx      # - 로딩 상태
│   │   ├── EmptyState.jsx          # - 빈 목록 상태
│   │   └── ErrorMessage.jsx        # - 오류 상태
│   │
│   └── kiosk/                      # [키오스크 전용 UI]
│       ├── CategoryTabs.jsx        # - 메뉴 카테고리 탭
│       ├── MenuCard.jsx            # - 메뉴 카드 + Cloudinary imageUrl
│       ├── MenuDetailSummary.jsx   # - 상세 대표 이미지·설명·가격
│       ├── OptionGroup.jsx         # - 옵션 그룹
│       ├── OptionItem.jsx          # - 옵션 한 항목
│       ├── AllergenAccordion.jsx   # - 알레르기 정보
│       ├── QuantityStepper.jsx     # - 수량 증감
│       ├── CartItem.jsx            # - 장바구니 한 줄
│       ├── PaymentMethodList.jsx   # - 결제수단 목록 후보
│       ├── KioskConfirmDialog.jsx  # - 장바구니 비우기 등 확인
│       └── KioskToast.jsx          # - 수량 한도 등 4초 알림
│
├── store/                          # [Zustand 전역 상태]
│   ├── cartStore.js                # - 주문 유형·장바구니·검증 결과·주문 결과
│   ├── orderSessionStore.js        # - 주문·결제 세션
│   └── orderStore.js               # - 주문 상태 보조 store
│
├── api/                            # [HTTP 요청]
│   ├── client.js                   # - axios 인스턴스 + 공통 envelope unwrap
│   ├── category.js                 # - 카테고리 조회
│   ├── menu.js                     # - 메뉴 목록·상세
│   ├── cart.js                     # - 장바구니 서버 검증
│   ├── order.js                    # - 주문 생성
│   └── payment.js                  # - 결제 승인 (화면 미연결)
│
├── hooks/                          # [반복 흐름] 일부는 차기 연결용 stub
├── features/                       # [도메인 정책] 주문 전이·품절 정책
├── constants/                      # [정본 상수] API 경로·주문·상태
├── utils/
│   ├── priceCalculation.js         # - 가격 계산 단일 기준 (복제 금지)
│   ├── quantityLimits.js           # - 동일 메뉴 9개·전체 30개 단일 기준
│   ├── paymentModalConfig.js       # - 결제 진행 모달 문구
│   ├── currency.js                 # - 금액 표시
│   └── apiError.js                 # - API 오류 정규화
│
└── assets/                         # [로컬 UI 자산] 로고·아이콘·일러스트

public/
├── mocks/payment-scenarios.sample.json # 결제·완료·오류 참고용 축약 fixture
└── pwa-*.png                       # PWA 앱 아이콘
```

---

## 🧮 가격과 수량의 단일 기준

### 가격: `utils/priceCalculation.js`

메뉴 기본가 + 옵션 추가금 × 수량 계산은 이 파일만 사용합니다. Page나 Component에 별도 계산식을 복사하면 장바구니·결제 금액이 달라질 수 있습니다.

### 수량: `utils/quantityLimits.js`

| 제한 | 값 |
| --- | --- |
| 동일 메뉴 최대 수량 | 9개 |
| 장바구니 전체 최대 수량 | 30개 |

증가 가능 여부와 초과 메시지는 이 파일의 함수·상수를 사용합니다.

---

## 🛠️ 기술 구성과 역할

### React 19 + React Router 7

화면과 URL 흐름을 구성합니다. `entries/kiosk.jsx`가 Router를 시작하고 `KioskApp.jsx`가 Page를 연결합니다.

### Vite 8

5173 개발 서버와 빌드를 담당합니다. `/api` 요청은 8080 백엔드로 프록시합니다.

### Zustand 5

장바구니·주문 유형·검증 금액·주문 결과를 화면 이동 후에도 유지합니다.

### Axios

`api/client.js`가 백엔드의 `{ success, status, code, message, data }` 응답을 풀어 `data`만 Page에 전달합니다.

### Cloudinary SDK

외부 이미지 제공자 연동 준비를 위해 설치되어 있습니다. 현재 메뉴 화면은 SDK를 직접 호출하지 않고 백엔드가 준 Cloudinary 공개 `imageUrl`을 일반 `<img>`에 사용합니다.

### vite-plugin-pwa

키오스크를 세로형 태블릿에 설치형 앱처럼 실행할 수 있도록 manifest와 service worker를 생성합니다. `display: fullscreen`, `orientation: portrait`, `registerType: "autoUpdate"`이며, 첫 입력 시 전체화면 폴백은 `src/entries/kiosk.jsx`가 담당합니다. 설치 절차는 [Android PWA 전체화면](../ASAK/docs/operations/setup/android-pwa-fullscreen.md)을 따릅니다.

### ESLint 9

미사용 변수와 React Hook 규칙 위반 등을 검사합니다.

---

## 🎨 Figma · 화면 기준

- Figma **0718** (`yHhvn5RKjBd91U8BJUQz7F`)이 현재 화면 기준입니다. 0715 키는 신규 작업에 사용하지 않습니다.
- 화면 구현 범위와 CSS 분리 기준: [`docs/figma-mcp-implementation-guide-2026-07-14.md`](docs/figma-mcp-implementation-guide-2026-07-14.md)
- 화면 넘김 기록: [`docs/figma-ui-handoff-2026-07-18.md`](docs/figma-ui-handoff-2026-07-18.md)
- Figma↔코드 화면 표: [`../ui-index.md`](../ui-index.md)

---

## 📚 관련 문서

| 문서 | 읽는 시점 |
| --- | --- |
| [`src/STRUCTURE_GUIDE.md`](src/STRUCTURE_GUIDE.md) | 파일 위치·현재 연결을 빠르게 찾을 때 |
| [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) | 키오스크 구현 순서와 계약 확인 |
| [`public/mocks/README.md`](public/mocks/README.md) | 결제·완료·오류 fixture 필드 확인 |
| [Android PWA 전체화면](../ASAK/docs/operations/setup/android-pwa-fullscreen.md) | 태블릿 설치·fullscreen·갱신 절차 |
| [ASAK 문서 허브](../ASAK/docs/README.md) | 중앙 문서 전체 입구 |
| [Frontend Implementation](../ASAK/docs/product_bible/12_Frontend_Implementation/README.md) | 프론트 구현 기준 |
| [Backend Implementation](../ASAK/docs/product_bible/11_Backend_Implementation/README.md) | 서버 구현 기준 |
| [키오스크 구현 가이드](../ASAK/docs/implementation_guide/02-kiosk-implementation.md) | 화면별 작업 카드 |
| [API·DB 구현 가이드](../ASAK/docs/implementation_guide/04-api-db-implementation.md) | request/response/error 규칙 |
| [메뉴 이미지 자산 흐름](../ASAK-back/docs/MENU_IMAGE_ASSET_FLOW.md) | Cloudinary·`media_asset` 전환 상세 |
