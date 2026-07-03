# LandScout (랜드스카우트)

> 토지 매입부터 개발 시뮬레이션까지 한 번에 — 시행사, 건축사, 임야 투자자를 위한 Proptech SaaS

국토정보플랫폼 DEM·정사영상과 브이월드 3D 지도를 융합하여, 토지의 경사도·도로 조건·주변 인프라를 3D로 시뮬레이션하고 개발 타당성 보고서를 자동 생성합니다.

## 기술 스택

- **Frontend:** Next.js 16 (App Router), Tailwind CSS 4, TypeScript
- **3D:** Three.js, React Three Fiber, Drei
- **Backend (예정):** Supabase (DB, Auth, API Key 관리)

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 환경 변수

`.env.example`을 참고하여 `.env.local` 파일을 생성하세요.

```bash
cp .env.example .env.local
```

API 키는 환경변수로만 관리하며, 코드에 하드코딩하지 않습니다.

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 (기능 소개, 요금제) |
| `/login` | 카카오/네이버 소셜 로그인 (UI) |
| `/dashboard` | 주소 검색, 사용량, 최근 분석 |
| `/analyze` | 2분할 분석 화면 (좌: 3D 지형, 우: 분석 결과) |
| `/api/analyze` | 토지 분석 API (현재 목업 데이터) |

## 수익 모델

- **Free:** 월 3회 무료 토지 분석
- **Pro:** 월 ₩99,000 — 무제한 3D 시뮬레이션, T맵 진입로 분석
- **PDF 리포트:** 건당 ₩33,000

## API 연동 로드맵

1. 도로명주소 API — 주소 검색 및 좌표 변환
2. 카카오/네이버 — 지적편집도, 장소 검색
3. 국토정보플랫폼 — DEM, 정사영상
4. 브이월드 — 3D 공간정보
5. T맵 — 화물차 경로 분석
6. Supabase — 사용자 인증, 구독, 리포트 이력

## 현재 상태 (MVP)

- ✅ PRD 기반 UI/UX (2분할 레이아웃)
- ✅ DEM 시뮬레이션 3D 지형 (Three.js)
- ✅ 경사도·진입로·POI 목업 분석
- ✅ Freemium 요금제 UI
- ⏳ 실제 공공/민간 API 연동
- ⏳ OAuth 로그인
- ⏳ PDF 리포트 생성 및 결제
