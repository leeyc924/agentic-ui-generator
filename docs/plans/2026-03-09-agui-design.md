# AGUI - Agent-Generated UI 설계 문서

> 자연어 기반으로 A2UI JSON을 생성하고, 런타임 React 렌더링 + Visual Editor를 제공하는 서비스

## 1. 개요

### 목적

A2UI 개념을 기반으로 자연어 입력 -> UI JSON 생성 -> 런타임 렌더링하는 웹 애플리케이션.
Slack bot과 웹 Visual Editor를 동시 진입점으로 제공한다.

### 핵심 기능

1. **자연어 -> UI 생성:** Claude SDK로 자연어를 A2UI 확장 JSON으로 변환
2. **Visual Editor:** Cursor Visual Editor 스타일의 위젯 트리 + 속성 패널 + 캔버스
3. **위젯 클릭 + 자연어 수정:** 위젯 선택 후 자연어로 수정 요청 (agentation.dev 방식)
4. **자산 관리:** 위젯 템플릿, 디자인 토큰, 이미지, 아이콘 SVG CRUD
5. **Sync Agent:** 외부 디자인 도구(Figma, Pencil) 연동 UI (기능 미구현)
6. **Slack Bot:** 자연어 입력 -> Claude SDK -> 미리보기 URL 전송
7. **LLM 로그:** 브라우저에서 실시간 LLM 동작 로그 확인

### 제약 조건

- 싱글 유저, 로컬 우선
- React 코드 export는 부가 기능 (런타임 렌더링 중심)
- Agent orchestration은 미도입 (Claude SDK 직접 사용, 추후 LangGraph 등 마이그레이션 가능하도록 설계)

## 2. 아키텍처

### 모놀리식 (방식 A)

```
agui/
├── frontend/     # Vite + React 19 (Visual Editor, 미리보기, LLM 로그)
├── backend/      # FastAPI (Claude SDK, UI JSON CRUD, SSE 스트리밍)
├── slack-bot/    # Python (Slack Bolt + 백엔드 API 호출)
└── shared/       # 공유 JSON Schema
```

백엔드 API를 웹/Slack이 공유하며, SQLite로 단순하게 시작한다.

### 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Vite, React 19, TypeScript, Zustand, TailwindCSS, dnd-kit |
| 백엔드 | FastAPI, SQLAlchemy, SQLite, Claude SDK (anthropic) |
| Slack | slack-bolt (Python) |
| 통신 | REST API + SSE (LLM 스트리밍) |
| 아이콘 | Lucide React |
| 폰트 | Plus Jakarta Sans (UI), JetBrains Mono (코드/JSON) |
| 스키마 공유 | JSON Schema -> TypeScript 타입 자동 생성 |

## 3. A2UI 확장 JSON 스키마

A2UI 기본 구조를 유지하면서 디자인 토큰과 스타일 속성을 확장한다.

```json
{
  "version": "0.1.0",
  "designTokens": {
    "colors": { "primary": "#3B82F6", "bg": "#FFFFFF" },
    "spacing": { "sm": "8px", "md": "16px", "lg": "24px" },
    "typography": { "heading": { "fontFamily": "Inter", "fontSize": "24px" } },
    "borderRadius": { "sm": "4px", "md": "8px" }
  },
  "components": [
    {
      "id": "card-1",
      "type": "card",
      "children": ["title-1", "input-1", "btn-1"],
      "style": {
        "padding": "$spacing.md",
        "borderRadius": "$borderRadius.md",
        "background": "$colors.bg"
      }
    },
    {
      "id": "title-1",
      "type": "text",
      "props": { "content": "예약 폼", "variant": "heading" },
      "style": { "color": "$colors.primary" }
    },
    {
      "id": "input-1",
      "type": "text-field",
      "props": { "label": "이름", "placeholder": "이름을 입력하세요", "required": true }
    },
    {
      "id": "btn-1",
      "type": "button",
      "props": { "label": "제출", "action": "submit" },
      "style": { "background": "$colors.primary" }
    }
  ]
}
```

### A2UI 원본 대비 확장

| 항목 | A2UI 원본 | AGUI 확장 |
|------|-----------|-----------|
| 디자인 토큰 | 없음 | `designTokens` 필드로 색상/간격/타이포 등 정의 |
| 스타일 | 없음 | `style` 필드 + `$token.path` 참조 문법 |
| props | 타입별 암묵적 | `props` 필드로 명시적 분리 |
| 버전 관리 | 없음 | `version` 필드 |

### 컴포넌트 카탈로그 (초기)

`card`, `text`, `button`, `text-field`, `select`, `checkbox`, `image`, `icon`, `divider`, `container`, `grid`, `stack`

## 4. 핵심 기능 아키텍처

### 4-1. 자연어 -> UI JSON 생성

```
[사용자 자연어 입력]
       |
[FastAPI /api/generate]  POST { prompt, context? }
       |
[Claude SDK]
  - system prompt: A2UI 확장 스키마 + 디자인토큰 + 컴포넌트 카탈로그
  - streaming: SSE로 토큰 단위 전송
       |
[프론트엔드]
  - SSE 수신 -> JSON 파싱 -> 런타임 렌더링
  - LLM 로그 패널에 실시간 표시
```

### 4-2. Visual Editor 레이아웃

```
+----------------------------------------------------------+
|  Top Bar (h-12, bg-slate-900, border-b)                  |
+--------+---------------------------+---------------------+
| Left   |  Center                   | Right               |
| Panel  |  Canvas/Preview           | Panel               |
| w-64   |  flex-1                   | w-72                |
|        |                           |                     |
| Widget |  런타임 렌더링 영역         | 속성 패널            |
| Tree   |                           | Position/Layout/    |
|        |                           | Appearance/Text     |
+--------+---------------------------+---------------------+
|  Bottom Panel (h-64, resizable)                          |
|  [Chat Tab] [LLM Log Tab]                                |
+----------------------------------------------------------+
```

- 패널 리사이즈 가능 (드래그 핸들)
- 위젯 트리: 컴포넌트 계층 구조, 드래그앤드롭 재정렬
- 캔버스: A2UI JSON -> React 런타임 렌더링, 위젯 클릭 선택, 드래그 이동
- 속성 패널: 선택 위젯의 style/props 직접 수정

### 4-3. 위젯 클릭 + 자연어 수정

1. 캔버스에서 위젯 클릭 -> 선택 상태
2. 채팅에 "이 버튼 색상을 빨간색으로, 둥글게" 입력
3. API 호출: `{ prompt, selectedWidgetId: "btn-1", currentJson }`
4. Claude가 해당 위젯만 수정한 JSON diff 반환
5. 프론트에서 불변적으로 병합 -> 리렌더링

### 4-4. 드래그앤드롭

| 동작 | 트리 패널 | 캔버스 |
|------|-----------|--------|
| 순서 변경 | children 배열 순서 변경 | 시각적 위치 이동 |
| 부모 변경 | 노드를 다른 노드 위에 드롭 | 컨테이너 위에 드롭 |
| 피드백 | 드롭 위치 인디케이터 (선) | 드롭 영역 하이라이트 |
| 취소 | ESC 키 | ESC 키 |

라이브러리: dnd-kit (React 19 호환, 경량, 접근성 지원)

### 4-5. Slack Bot

```
[Slack 메시지/슬래시 커맨드]
       |
[slack-bot] -> POST /api/generate (백엔드 API 호출)
       |
[백엔드] -> Claude SDK -> A2UI JSON 생성 + 저장
       |
[slack-bot] <- JSON + 미리보기 URL
       |
[Slack에 미리보기 링크 전송]
  -> 클릭 시 프론트엔드 /preview/:id 페이지로 이동
```

커맨드:
- `/agui <자연어>` - UI 생성 -> 미리보기 URL 반환
- `/agui list` - 프로젝트 목록
- `/agui preview <id>` - 미리보기 URL

### 4-6. 자산 관리

- 위젯 템플릿: 재사용 가능한 A2UI JSON 조각 저장
- 디자인 토큰: 색상, 간격, 타이포 세트 관리
- 이미지/아이콘 SVG: 파일시스템 저장 + 메타데이터 DB
- Sync Agent: UI만 구현 (Figma/Pencil MCP 연동은 미구현)

### 4-7. LLM 로그 패널

- 요청 prompt
- 스트리밍 응답 (토큰 단위)
- tool use 호출 내역
- 소요 시간, 토큰 사용량
- 에러 발생 시 상세 메시지

## 5. 상태 관리

### Zustand 스토어 구조

```
EditorStore
  |- document          // A2UI JSON 전체
  |- selectedWidgetId  // 현재 선택된 위젯
  |- history[]         // undo/redo 스택
  +- actions
       |- updateWidget(id, patch)   // 불변 업데이트
       |- moveWidget(id, newParent, index)
       |- addWidget(widget, parent)
       |- removeWidget(id)
       |- undo() / redo()
       +- applyLLMDiff(diff)        // LLM 응답 병합

ChatStore
  |- messages[]        // 대화 기록
  |- isStreaming       // SSE 수신 중
  +- logs[]            // LLM 로그

AssetStore
  |- designTokens      // 디자인 토큰 세트
  |- templates[]       // 위젯 템플릿
  |- icons[]           // SVG 아이콘
  +- images[]          // 이미지 에셋
```

### 핵심 원칙

- **불변성:** 모든 위젯 업데이트는 새 객체 생성 (immer 활용)
- **Undo/Redo:** 매 변경마다 history 스택에 스냅샷 push
- **LLM 병합:** Claude 응답의 JSON diff를 기존 document에 불변적으로 병합
- **낙관적 업데이트:** 드래그앤드롭/속성 변경은 즉시 반영, 백엔드 저장은 디바운스

## 6. API 설계

```
# LLM 생성
POST   /api/generate              # 자연어 -> A2UI JSON (SSE 스트리밍)
POST   /api/generate/edit         # 위젯 선택 + 자연어 수정 (SSE)

# 프로젝트
GET    /api/projects              # 프로젝트 목록
POST   /api/projects              # 프로젝트 생성
GET    /api/projects/:id          # 프로젝트 상세 (A2UI JSON 포함)
PUT    /api/projects/:id          # 프로젝트 저장
DELETE /api/projects/:id          # 프로젝트 삭제

# 디자인 토큰
GET    /api/tokens                # 토큰 세트 목록
POST   /api/tokens                # 토큰 세트 생성
PUT    /api/tokens/:id            # 토큰 수정
DELETE /api/tokens/:id            # 토큰 삭제

# 에셋
GET    /api/assets                # 에셋 목록
POST   /api/assets                # 에셋 업로드
DELETE /api/assets/:id            # 에셋 삭제

# 위젯 템플릿
GET    /api/templates             # 템플릿 목록
POST   /api/templates             # 템플릿 저장
DELETE /api/templates/:id         # 템플릿 삭제

# 미리보기
GET    /api/preview/:id           # 프로젝트 미리보기 페이지
```

## 7. 데이터 모델 (SQLite)

```sql
-- 프로젝트
projects
  id          TEXT PRIMARY KEY
  name        TEXT NOT NULL
  document    JSON NOT NULL       -- A2UI 확장 JSON 전체
  created_at  DATETIME
  updated_at  DATETIME

-- 디자인 토큰 세트
design_tokens
  id          TEXT PRIMARY KEY
  name        TEXT NOT NULL
  tokens      JSON NOT NULL       -- { colors, spacing, typography, ... }
  created_at  DATETIME

-- 에셋
assets
  id          TEXT PRIMARY KEY
  name        TEXT NOT NULL
  type        TEXT NOT NULL       -- 'image' | 'icon'
  file_path   TEXT NOT NULL
  metadata    JSON
  created_at  DATETIME

-- 위젯 템플릿
widget_templates
  id          TEXT PRIMARY KEY
  name        TEXT NOT NULL
  category    TEXT                -- 'form' | 'layout' | 'display' | ...
  template    JSON NOT NULL       -- A2UI 컴포넌트 배열
  created_at  DATETIME
```

## 8. 디자인 시스템

### 컬러 팔레트 (Dark Mode 기반)

| 용도 | 색상 | Tailwind |
|------|------|----------|
| Background | `#0F172A` | slate-900 |
| Surface | `#1E293B` | slate-800 |
| Surface Elevated | `#334155` | slate-700 |
| CTA / Accent | `#22C55E` | green-500 |
| Text Primary | `#F8FAFC` | slate-50 |
| Text Muted | `#94A3B8` | slate-400 |
| Border | `#475569` | slate-600 |
| Error | `#EF4444` | red-500 |
| Warning | `#F59E0B` | amber-500 |

### 타이포그래피

- UI: Plus Jakarta Sans (heading + body)
- 코드/JSON: JetBrains Mono
- 사이즈: 14px(속성패널), 15px(본문), 18px(섹션제목), 24px(페이지제목)

### 레이아웃 규칙

- 패널 리사이즈 가능 (드래그 핸들)
- z-index 체계: 패널(10), 모달(30), 토스트(50)
- 포커스 링 visible for 키보드 내비게이션
- 클릭 가능 요소에 `cursor-pointer`
- 호버 트랜지션 150-300ms
- `prefers-reduced-motion` 존중

### 아이콘

- Lucide React (일관된 24x24 SVG)
- 이모지 아이콘 사용 금지

### Pre-Delivery Checklist

- [ ] SVG 아이콘만 사용 (이모지 금지)
- [ ] cursor-pointer on 모든 클릭 요소
- [ ] 호버 트랜지션 150-300ms
- [ ] 텍스트 대비 4.5:1 이상
- [ ] 키보드 포커스 상태 visible
- [ ] prefers-reduced-motion 존중
- [ ] 반응형: 1024px, 1440px (데스크탑 우선)
