---
# 📄 Project Specification: UIUC KSA Community Renewal
---

## 1. Project Overview

- **Project Name:** UIUC KSA (IllinoisKSA) Renewal
- **Goal:** UIUC 한인 커뮤니티의 현대화 및 실시간 소통 최적화
- **Key Strategy:** - **TypeScript & React Query** 기반의 완전 비동기 UI/UX
- **Clerk** 기반 구글 단일 인증 및 계층형 권한(RBAC) 관리
- **댓글 없는 실시간 채팅 중심 커뮤니티** (모든 문의는 채팅으로 진행)

---

## 2. Tech Stack

- **Frontend:** **TypeScript**, React (Vite), Tailwind CSS, Shadcn UI, **React Query**, Axios
- **Backend:** Spring Boot 3.x, Spring Data JPA, Querydsl, **WebSocket (STOMP)**
- **Auth:** **Clerk (Google OAuth 2.0)** - _Metadata 기반 권한 및 소유권 검증_
- **Database:** - **PostgreSQL:** 유저, 게시글, 물품, 채팅 기록, 알림 기록 (Hard Delete 적용)
- **Redis:** 실시간 메시지 브로커(Pub/Sub), 최근 채팅 메시지 캐싱, 실시간 알림 전송

---

## 3. Real-time Notification Center (Redis Pub/Sub)

### 3.1 알림 트리거 (Notification Triggers)

- **채팅 알림:** 나에게 새로운 채팅 메시지가 도착한 경우 (가장 핵심적인 소통 알림).
- **기타 알림:** 관리자에 의한 전체 공지, 내 계정의 권한 변경(ADMIN 승인 등) 알림.
- **_참고:_** _본 프로젝트는 댓글 기능을 포함하지 않으므로 댓글 알림은 제외됨._

### 3.2 구현 방식

- **실시간성:** Redis Pub/Sub을 STOMP와 연동하여 유저가 로그인 중일 때 상단 네비게이션 바에 실시간 **Toast** 알림 및 **종 아이콘 배지** 업데이트.
- **알림 센터:** 종 아이콘 클릭 시 최근 알림 리스트를 비동기로 로딩하며, 클릭 시 해당 채팅방이나 공지사항으로 즉시 이동.

---

## 4. Feature Details: Update & Delete Flow

- **작성자 전용 액션:** 상세 페이지 및 마이페이지에서 작성자 본인 확인 후 수정/삭제 가능.
- **Hard Delete 정책:** 유저가 삭제 시 DB에서 물리적으로 즉시 삭제하며, 연관된 물품, 이미지, 채팅방, 알림 내역을 모두 **Cascade 삭제**함.

---

## 5. Main Categories & Boards (All Chat-based)

| 카테고리            | 채팅/알림 | 소통 방식                                                    |
| ------------------- | --------- | ------------------------------------------------------------ |
| **자유 / 정보**     | 알림      | 게시글 기반 정보 공유 (문의 필요 시 작성자 프로필 통해 채팅) |
| **중고장터**        | 채팅/알림 | **물품별 독립 채팅** (구매 문의, 가격 제안 등)               |
| **하우징 / 자동차** | 채팅/알림 | 매물 기반 1:1 실시간 상담 채팅                               |
| **구인구직**        | 채팅/알림 | 지원자-담당자 간 실시간 매칭 채팅                            |
| **KSA 뉴스**        | 알림      | 공지사항 및 뉴스 공유 (관리자 전용)                          |

---

## 6. Page Features & UI/UX (Async & Type-Safe)

### 6.1 마이페이지 (`/mypage`)

- **내 프로필:** 닉네임 수정 및 프로필 이미지 확인. 중복 닉네임 체크 기능 포함.
- **내 활동 (Posts):** 내가 쓴 글을 카테고리/상태별로 확인하고 리스트에서 즉시 수정/삭제 가능. (Pagination 지원)
- **내 채팅 (Chats):** 진행 중인 모든 채팅방 목록 확인, 상대방 닉네임 및 마지막 메시지 요약 표시.

### 6.2 실시간 알림 UI

- **Notification Dropdown:** Shadcn UI의 `Popover`를 활용하여 최근 알림 목록을 깔끔하게 표시.
- **Status Indicator:** 읽지 않은 알림이 있을 경우 종 아이콘에 포인트 컬러(UIUC Orange) 배지 표시.

### 6.3 채팅방 UI (Chat Room UI)

- **Read Receipt (Seen):** 채팅방에서 상대방이 메시지를 확인하면, 해당 메시지 하단에 **'읽음'** 표시가 실시간으로 나타남.
- **Real-time Synchronization:** STOMP를 통해 메시지 송수신 및 읽음 상태가 즉각 반영됨.

### 6.4 어드민 관리 기능 (`/admin`)

- **User Management:** 모든 가입 유저 리스트 조회 및 검색(이메일, 닉네임).
- **User Detail:** 특정 유저의 상세 정보, 작성 게시글 히스토리 확인 및 **유저 차단(Ban)** 기능.
- **Popup Management:** 홈페이지 메인에 노출될 팝업 공지 생성, 수정, 삭제 및 활성화 상태 관리.
- **Banned User Handling:** 차단된 유저가 접속 시 전용 안내 페이지(`BannedPage`)로 강제 이동.

---

## 7. Vibe Coding Implementation Guide

1. **Notification Schema:** `Notification` 엔티티는 `chat_room_id` 또는 `notice_id`를 링크로 가질 것.
2. **Chat-Centric Logic:** 모든 게시글의 '문의하기' 버튼은 해당 작성자와의 채팅 세션으로 연결되도록 설계.
3. **Strict TypeScript:** 모든 비동기 API 응답값에 대한 Interface 정의 및 에러 바운더리 설정.
4. **Hard Delete Logic:** 게시글 삭제 시 해당 글에서 파생된 모든 채팅방과 메시지도 함께 삭제하여 데이터 무결성 유지.

---

## 8. Board Specifications & Features (Implementation Details)

실제 코드베이스에 구현된 각 게시판별 상세 기능 명세입니다.
모든 상세설명은 quill rich text editor를 사용하여 작성됩니다.

### 8.1 중고마켓 (Flea Market)

- **Feature:** 하나의 게시글에 **여러 개의 물품**을 등록하여 일괄 판매/관리 가능.
- **Input Fields (Post):**
  - **게시글 제목:** 전체 게시글을 대표하는 제목.
  - **거래 유형:** 판매(SELL) / 구매(BUY).
  - **거래 희망 장소:** 텍스트 입력.
  - **상세 설명 (Rich Text):** 게시글 전반에 대한 설명.
- **Input Fields (Item - Multiple):**
  - **물품명:** 필수.
  - **가격 ($):** 필수 (숫자).
  - **물품 설명:** 선택 (상태, 색상 등).
  - **기존 상품 링크:** 선택 (외부 링크).
  - **사진:** **물품당 최대 3장**.
- **Constraints:** 최소 1개의 물품 등록 필수.

### 8.2 자동차 (Cars)

- **Feature:** 차량 판매 전용 게시판, 단일 차량 등록.
- **Input Fields:**
  - **제목:** 필수 (예: 2018 Honda Civic).
  - **가격 ($):** 필수.
  - **모델명:** 필수.
  - **연식 (Year):** 필수.
  - **주행거리 (Mileage):** 필수 (단위: mile).
  - **차량 상세 설명 (Rich Text):** 필수.
  - **사진:** **게시글당 최대 5장**.

### 8.3 하우징 (Housing)

- **Feature:** 주거 관련 거래(서브리스, 룸메이트, 양도).
- **Input Fields:**
  - **제목:** 필수.
  - **유형 (Type):** 서브리스(Sublease), 룸메이트(Roommate), 양도(Takeover) 중 선택.
  - **가격 ($/월):** 필수.
  - **위치:** 필수 (예: 309 Green St).
  - **상세 설명 (Rich Text):** 필수.
  - **사진:** **게시글당 최대 5장**.

### 8.4 구인구직 (Jobs)

- **Feature:** 채용 및 구직 정보 공유.
- **Input Fields:**
  - **제목:** 필수.
  - **급여:** 필수 (텍스트, 예: $15/hr).
  - **위치:** 필수.
  - **연락처:** 필수.
  - **상세 내용 (Rich Text):** 필수.
- **Constraints:** **이미지 업로드 기능 없음**.

### 8.5 자유 / 정보 (Free / Info)

- **Feature:** 일반적인 커뮤니티 게시판.
- **Free Board:** 모든 유저가 자유롭게 텍스트와 이미지를 활용하여 게시글 작성.
- **News Board:** 관리자가 작성하는 공식 공지 및 뉴스.
- **Capabilities:**
  - **Rich Text Support:** 게시글 본문 내 다양한 서식 및 이미지 삽입.
  - **View Count:** 게시글 조회수 실시간 카운트 및 중복 방지 로직.
  - **Direct Chat:** 작성자 닉네임 클릭 또는 버튼을 통해 즉시 1:1 채팅 연결.

### 8.6 Contact Us (Email Inquiry)

- **Feature:** 관리자에게 직접 이메일 문의 전송 (Google SMTP 활용).
- **Input Fields:**
  - **제목 (Subject):** 필수.
  - **이메일 (Sender Email):** 필수 (답변 받을 이메일).
  - **내용 (Rich Text):** 필수 (에디터 활용).
- **Backend Logic:** 사용자가 'Submit' 클릭 시 **Google SMTP Server**를 통해 사전에 설정된 관리자 이메일로 내용 전송.

---

## 9. UI/UX Components & Structure

### 9.1 Global Navigation Bar (Common)

- **Logo:** 'KSA IL' (Home 이동).
- **Desktop Menu:**
  - **KSA 소개:** 인사말, 임원진, 역대 임원진 (Dropdown).
  - **취업정보:** 취업정보(Board), 채용설명회/상담.
  - **중고마켓:** 중고물품, 구인구직, 자동차, 하우징.
  - **커뮤니티:** KSA 소식, 자유게시판, 정보게시판.
  - **Contact Us:** 별도 링크.
- **User Actions:**
  - **Logged Out:** '로그인' (Google OAuth) / '관리자 로그인'.
  - **Logged In:** 유저 이름 + 프로필 이미지 (Dropdown: 마이페이지, 로그아웃).
- **Mobile Menu:** Hamburger 버튼을 통한 Slide-out Sheet 메뉴 제공.

### 9.2 Interactive UI Elements

- **Image Lightbox:**
  - 상세 페이지(Flea, Cars 등)에서 이미지 클릭 시 **검은 배경의 전체 화면 모달**로 확대.
  - 원본 비율 유지 (`object-contain`) 및 닫기 버튼 제공.
- **Rich Text Editor:**
  - 모든 게시판의 본문 작성에 사용.
  - 굵게, 기울임, 밑줄, 리스트 등 기본 서식 지원 및 HTML 저장.

### 9.3 Typography & Design System

- **Global Font:** 맥북 시스템 폰트 (-apple-system, BlinkMacSystemFont)를 프로젝트 기본 폰트로 적용.
- **Rich Text Content Strategy:**
  - **Editor Font Priority:** 텍스트 에디터로 작성한 글(게시글 본문 등)은 에디터에서 사용자가 지정한 폰트와 스타일을 그대로 유지.
  - **CSS Isolation:** 본문 렌더링 영역에는 글로벌 폰트 스타일의 간섭을 최소화하여 사용자의 의도대로 텍스트가 표시되도록 구현.

---

## 10. Environment & Deployment Setup

### 10.1 Environment Strategy (Profile-Based)

본 프로젝트는 설정 파일의 **Profile** 변경만으로 개발(local)과 배포(service) 환경을 즉시 전환할 수 있도록 구성한다.

- **Variable:** `APP_PROFILE` (Frontend: `VITE_APP_PROFILE`, Backend: `spring.profiles.active`)
- **Modes:**
  - **`local`**: 로컬 개발 환경. (Localhost DB, Local Redis, Debug Logging)
  - **`service`**: 실제 라이브 서비스 환경. (Production DB, Remote Redis, Info Logging)

### 10.2 Configuration Details

#### Frontend (`.env` & Config)

`VITE_APP_PROFILE` 변수에 따라 API 엔드포인트와 로깅 레벨이 자동 조정된다.

| Variable              | `local` Mode                | `service` Mode                           |
| :-------------------- | :-------------------------- | :--------------------------------------- |
| **VITE_APP_PROFILE**  | `local`                     | `service`                                |
| **VITE_API_BASE_URL** | `http://localhost:8080/api` | `https://api.illinoisksa.org/api` (예시) |
| **Console Logs**      | Enabled                     | Disabled / Error Only                    |

#### Backend (`application.yaml` Profiles)

`spring.profiles.active` 값에 따라 로드되는 설정 파일이 달라지며, 인프라 연결 정보가 변경된다.

- **Common:** `application.yaml` (기본 설정)
- **Local:** `application-local.yaml`
  - DB: `jdbc:postgresql://localhost:5432/ksadb`
  - Redis: `localhost:6379`
  - CORS: Allow `localhost:5173`
- **Service:** `application-service.yaml`
  - DB: Enivornment Variables (`SPRING_DATASOURCE_URL`, etc.)
  - Redis: Environment Variables (`SPRING_REDIS_HOST`, etc.)
  - CORS: Allow Production Domain Only

### 10.3 Required Secret Keys (Reference)

#### Frontend (.env)

- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk 퍼블리셔블 키.
- `VITE_APP_PROFILE`: `local` 또는 `service`.

#### Backend (Environment Variables / .env)

- `CLERK_SECRET_KEY`: Clerk 시크릿 키.
- `SPRING_PROFILES_ACTIVE`: `local` 또는 `service` (실행 시 주입).
- **Service Mode Only (Deploy):**
  - `SPRING_DATASOURCE_URL`: Production DB URL.
  - `SPRING_DATASOURCE_USERNAME` / `PASSWORD`: DB Credentials.
  - `SPRING_REDIS_HOST` / `PORT`: Redis Connection Info.
