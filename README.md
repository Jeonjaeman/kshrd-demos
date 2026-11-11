# 한국산업교육학회 리뉴얼 — 메인 데모 3종

- 작성일: 2026-11-11
- 열기: `index.html`(허브) → 각 데모. 로컬에서는 `python -m http.server 8791` 후 `http://127.0.0.1:8791/`
- 범위: 메인 페이지만. 네비는 메뉴명과 호버 효과만 있고 링크 없음. 관리자 없음.
- 내용: 현행 사이트(e-kshrd.or.kr)에서 확인한 실제 내용 — `_lib/data.js` 한 파일에 모아 세 데모가 함께 쓴다(연혁 4시대, 학술대회 주제 30건, 현장포럼 22건, 행사 6건, 공지 6건, 사무국 정보).
- 소재: 이미지 33장 · 영상 3편 모두 힉스필드 생성(`_assets/`). 로고는 현 사이트 파일이 276×53px뿐이라 임시 휘장(`_assets/brand/emblem.svg`)을 그려 썼다.
- 공통 기술: GSAP 3.12 + ScrollTrigger, Lenis, three.js r128, Pretendard. `_lib/`에 로컬 복사.

## 데모

| 데모 | 레퍼런스 | 구성 |
|---|---|---|
| **DEMO 1 37년 아카이브** `demo1-archive/` | 산업연구원 50주년 디지털역사관 (kiet.re.kr/50th) | 휘장 stroke 드로잉 인트로 → 1989 ↔ 2026 엠블럼 히어로 → 4개 시대(배경 고정, **three.js 셰이더 노이즈 디졸브**, 중앙 나침반 원과 진행 링, 좌우 교대 제목, 떠오르는 기록 사진 12장) → 학술대회 주제 30건 **곡면 3D 마퀴** → 카드 4장 → "학회가 던져온 질문들" 세로 마퀴 → 푸터. `?nointro`로 인트로 생략 |
| **DEMO 2 타이포 중심** `demo2-typo/` | UCLAB + The Design Society + Frontier Dialogues | 격자 종이 위 초대형 KSHRD + **three.js 다면체 로고**(드래그 회전) + 드래그 스티커 → 코발트 전면에서 소개 문장이 **단어 단위로 모이는 pin 구간** → 숫자 4칸 → 현장포럼 22장(章): 고정 목차 CH.01~22 + 연도별 원색 배너 + 행 호버 미리보기 → 주제 30년 마퀴 3줄 → 모노 라벨 타일 → CTA → 줄무늬 워드마크 푸터 |
| **DEMO 3 사진 중심** `demo3-photo/` | OFFF Forum + The Design Conference + The Land Institute + NAVER DAN25 + Obama Oral History | 강연장 영상 히어로 + 행사 정보 띠 → **영상 프레임 스크롤**(복도→세미나홀 145프레임, 캡션 3단) → 컬러 면/사진 분할 소개 + 숫자 → 사진 위 패널 속 현장포럼 22회 가로 드래그 카드 → 행사 카드(필터) → 괄호 도형 안 영상 + 인용 → 학술지 표지 3D 틸트 + 소식 → 함께하는 기관 타일 → 입회 CTA + 푸터 |

## 레퍼런스 소스 분석

자세한 내용은 `_analysis/레퍼런스_소스분석.md`(저장소에는 올리지 않음). 요점:

| 레퍼런스 | 실제 소스에서 확인한 것 | 데모에 옮긴 것 |
|---|---|---|
| KIET 50주년 | jQuery + GSAP 3.11 ScrollTrigger 27개 + Lenis + jquery.marquee. 인트로 `strokeDashoffset` 2.5s → 32rem 엠블럼. 4,832px 동안 배경 pin, 진행률로 배경 4장 토글, 나침반 `rotation = progress×360`, 원 stroke 923.6. 사진 `scale .9→1, y 60→0`. CSS mask 마퀴 42px/s. 제목 88.8px/500/−0.04em, 주색 `#00109E` | DEMO 1 전체 구조와 수치. 배경 전환만 class 토글 대신 three.js 셰이더로 올림 |
| The Design Society | Webflow + GSAP 3.15(SplitText·ScrambleText·Draggable·Inertia) + Lenis + Barba. `.mwg005` 3,828px pin+scrub 단어 정렬. `#350AFF` + `#BCF015` | DEMO 2 선언문 구간, 드래그 스티커, 스크램블 호버, 라임 포인트, 줄무늬 푸터 (유료 플러그인은 직접 구현) |
| UCLAB | 라이브러리 없음. 2D 캔버스 로고, 격자 배경, 모노 라벨 타일, 2색 | DEMO 2 격자 종이, 타일, 로고 오브젝트(three.js로 입체화) |
| Frontier Dialogues | Astro. 606px 초압축 타이포, 고정 목차 CH.00~07, 장마다 원색 배너 | DEMO 2 현장포럼 22장 |
| OFFF Forum | Nuxt + Lenis. 강연장 사진 전면 + 정보 띠 + 초대형 로고 | DEMO 3 히어로·푸터 |
| The Design Conference | Next.js. 풀블리드 사진 위 `#222` 패널 층 구조, 흑백 카드 가로 스크롤, 모노 칩 | DEMO 3 현장포럼 패널, 행사 카드, 기관 타일 |
| The Land Institute | 컬러 면 + 사진 분할, Purpose/Vision 2단, 숫자 카운터 | DEMO 3 학회 소개 |
| NAVER DAN25 | GSAP 3.10 ScrollTrigger, 히어로 957px pin 후 scrub 전환, 2560×1440 영상 | DEMO 3 히어로 전환 |
| Obama Oral History | 베이지 + 세리프, 괄호 도형 안 영상 | DEMO 3 인용 구간 |

레퍼런스 9곳 가운데 **three.js와 영상 프레임 시퀀스를 실제로 쓰는 곳은 없었다.** 요청 사항이라 DEMO 1(시대 배경 전환)·DEMO 2(히어로 로고)에 three.js를, DEMO 3에 프레임 스크롤을 넣었다.

## 폴더

```
demos/
  index.html            허브
  demo1-archive/        37년 아카이브 (KIET 50주년 레퍼런스)
  demo2-typo/           타이포 중심
  demo3-photo/          사진 중심
  _assets/img/          1920px JPEG 33장 (sm/ 960px)
  _assets/video/        h264 mp4 3편(+세로 540×960) · 포스터 · frames_corridor/ 145프레임 · frames_corridor_m/ 73프레임
  _assets/brand/        임시 휘장 emblem.svg
  _assets/thumbs/       허브 썸네일
  _lib/                 gsap, ScrollTrigger, lenis, three r128, swiper 11, mobile.js·css, data.js
  _analysis/            레퍼런스 DOM·스크립트·스크롤 캡처 (저장소 제외)
  _qa/                  데모 검증 캡처 (저장소 제외)
```

## 힉스필드 사용 내역

- 이미지 33장: `gpt_image_2_6`, quality high. 배경·대형 사진 16:9 2k(2688×1520), 기록 사진 3:2 1k, 세로 4:5·정사각 1k
- 영상 3편: `seedance_2_5` t2v 6초 1080p 무음 — 강연장 청중 / 복도→세미나홀 전진 숏 / 워크숍 손 클로즈업
- 모두 "no text, no logos" 조건으로 생성. **실제 행사·인물·장소가 아니다.** 연혁의 흑백·옛 컬러 사진도 생성 이미지이므로, 실사이트에서는 학회가 가진 사진으로 바꿔야 한다. 사진 속 인물에 실명 캡션은 달지 않았다.

## 검증 (2026-11-11)

- Chromium 1705×957 데스크톱 14컷씩, 390×844(DPR 2) 모바일 10컷씩 전체 스크롤 캡처(`_qa/verify/`)
- 세 데모 모두: `a[href]` 0개(링크 없음), 깨진 이미지 0, 가로 넘침 없음, 영상 재생 확인(DEMO 3)

## 알려진 한계

- 실기기(iOS Safari, 삼성 인터넷), Firefox·Safari 데스크톱, 태블릿 폭(768~1100px)은 확인하지 않았다.
- DEMO 3 데스크톱 프레임 시퀀스(6.6MB)는 페이지 로드 직후 전부 받는다. 실서비스에서는 WebP/AVIF + 지연 로드가 필요하다.
- WebGL이 안 되는 환경의 대체 화면(CSS 페이드)과 `prefers-reduced-motion` 경로는 DEMO 2만 실제 화면으로 확인했다.
- 수치·목록·일정은 전부 현행 사이트 내용이지만, 섹션 헤드라인("산업계와 학계가 한 테이블에 앉는 학회입니다" 등)과 시대 제목은 데모용으로 쓴 문구다.
- 현행 사이트의 불일치(회장 대수 표기, 회원 수 "1,000명 이상"의 현재 값, KCI 등재 상태)는 그대로 두었다. 실제 제작 전에 학회 확인이 필요하다.
