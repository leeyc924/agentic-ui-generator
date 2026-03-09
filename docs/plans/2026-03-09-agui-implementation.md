# AGUI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A2UI 기반 자연어 -> UI JSON 생성 + 런타임 렌더링 + Visual Editor 웹 서비스 구축

**Architecture:** 모놀리식 3-모듈 구조 (frontend: Vite+React19, backend: FastAPI, slack-bot: Slack Bolt). 백엔드 API를 웹/Slack이 공유하며 SQLite로 데이터 저장.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, TailwindCSS, dnd-kit, Lucide React, FastAPI, SQLAlchemy, SQLite, Claude SDK (anthropic), slack-bolt

**Design Doc:** `docs/plans/2026-03-09-agui-design.md`

---

## Phase 1: 프로젝트 스캐폴딩 & 공유 스키마

### Task 1: 공유 JSON Schema 정의

**Files:**
- Create: `shared/schemas/a2ui-extended.schema.json`
- Create: `shared/schemas/package.json`

**Step 1: A2UI 확장 JSON Schema 작성**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://agui.dev/schemas/a2ui-extended.json",
  "title": "AGUI A2UI Extended Schema",
  "type": "object",
  "required": ["version", "components"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "designTokens": {
      "type": "object",
      "properties": {
        "colors": { "type": "object", "additionalProperties": { "type": "string" } },
        "spacing": { "type": "object", "additionalProperties": { "type": "string" } },
        "typography": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "fontFamily": { "type": "string" },
              "fontSize": { "type": "string" },
              "fontWeight": { "type": ["string", "number"] },
              "lineHeight": { "type": "string" }
            }
          }
        },
        "borderRadius": { "type": "object", "additionalProperties": { "type": "string" } }
      }
    },
    "components": {
      "type": "array",
      "items": { "$ref": "#/definitions/Component" }
    }
  },
  "definitions": {
    "Component": {
      "type": "object",
      "required": ["id", "type"],
      "properties": {
        "id": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["card", "text", "button", "text-field", "select", "checkbox", "image", "icon", "divider", "container", "grid", "stack"]
        },
        "children": {
          "type": "array",
          "items": { "type": "string" }
        },
        "props": { "type": "object" },
        "style": { "type": "object" }
      }
    }
  }
}
```

**Step 2: package.json for shared schema tooling**

```json
{
  "name": "@agui/shared",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "generate:types": "json2ts shared/schemas/a2ui-extended.schema.json > shared/types/a2ui.d.ts"
  },
  "devDependencies": {
    "json-schema-to-typescript": "^15.0.0"
  }
}
```

**Step 3: Commit**

```bash
git add shared/
git commit -m "feat: A2UI 확장 JSON Schema 정의"
```

---

### Task 2: Backend 프로젝트 초기화

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `backend/app/database.py`

**Step 1: pyproject.toml 작성**

```toml
[project]
name = "agui-backend"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.34.0",
    "sqlalchemy>=2.0.0",
    "anthropic>=0.52.0",
    "pydantic>=2.0.0",
    "python-multipart>=0.0.18",
    "sse-starlette>=2.2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.25.0",
    "httpx>=0.28.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

**Step 2: config.py - 환경설정**

```python
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./agui.db"
    anthropic_api_key: str = ""
    assets_dir: Path = Path("./assets")
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = {"env_prefix": "AGUI_", "env_file": ".env"}


settings = Settings()
```

**Step 3: database.py - SQLAlchemy 설정**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Step 4: main.py - FastAPI 앱**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AGUI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
```

**Step 5: 테스트로 서버 기동 확인**

```bash
cd backend
pip install -e ".[dev]"
pytest tests/ -v
```

**Step 6: Commit**

```bash
git add backend/
git commit -m "feat: FastAPI 백엔드 프로젝트 초기화"
```

---

### Task 3: Frontend 프로젝트 초기화

**Files:**
- Create: `frontend/` (Vite scaffold)
- Modify: `frontend/package.json` (의존성 추가)
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/src/App.tsx`

**Step 1: Vite + React 19 + TypeScript 프로젝트 생성**

```bash
cd /Users/leeyc/workspace/leeyc924/agui
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

**Step 2: 핵심 의존성 설치**

```bash
npm install zustand immer lucide-react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D tailwindcss @tailwindcss/vite
```

**Step 3: TailwindCSS 설정 (Vite 플러그인 방식)**

`frontend/vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
```

`frontend/src/index.css`:
```css
@import "tailwindcss";

@theme {
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-surface-elevated: #334155;
  --color-accent: #22C55E;
  --color-text-primary: #F8FAFC;
  --color-text-muted: #94A3B8;
  --color-border: #475569;
  --color-error: #EF4444;
  --color-warning: #F59E0B;

  --font-sans: "Plus Jakarta Sans", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

**Step 4: 기본 App.tsx 세팅**

```tsx
function App() {
  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans">
      <header className="h-12 bg-surface border-b border-border flex items-center px-4">
        <h1 className="text-lg font-semibold">AGUI</h1>
      </header>
      <main className="p-4">
        <p className="text-text-muted">Visual Editor will be here.</p>
      </main>
    </div>
  );
}

export default App;
```

**Step 5: dev 서버 실행 확인**

```bash
npm run dev
# http://localhost:5173 에서 AGUI 헤더 + 다크 배경 확인
```

**Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: Vite + React 19 프론트엔드 초기화 (TailwindCSS, Zustand)"
```

---

## Phase 2: 백엔드 코어 (모델 + CRUD API)

### Task 4: SQLAlchemy 모델 정의

**Files:**
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/project.py`
- Create: `backend/app/models/design_token.py`
- Create: `backend/app/models/asset.py`
- Create: `backend/app/models/widget_template.py`

**Step 1: 테스트 작성**

`backend/tests/test_models.py`:
```python
from app.models.project import Project
from app.models.design_token import DesignToken
from app.models.asset import Asset
from app.models.widget_template import WidgetTemplate


def test_project_model_has_required_columns():
    columns = {c.name for c in Project.__table__.columns}
    assert columns == {"id", "name", "document", "created_at", "updated_at"}


def test_design_token_model_has_required_columns():
    columns = {c.name for c in DesignToken.__table__.columns}
    assert columns == {"id", "name", "tokens", "created_at"}


def test_asset_model_has_required_columns():
    columns = {c.name for c in Asset.__table__.columns}
    assert columns == {"id", "name", "type", "file_path", "metadata", "created_at"}


def test_widget_template_model_has_required_columns():
    columns = {c.name for c in WidgetTemplate.__table__.columns}
    assert columns == {"id", "name", "category", "template", "created_at"}
```

**Step 2: 테스트 실행 - FAIL 확인**

```bash
cd backend && pytest tests/test_models.py -v
# Expected: FAIL (모듈 없음)
```

**Step 3: 모델 구현**

`backend/app/models/project.py`:
```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    document: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
```

`backend/app/models/design_token.py`:
```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DesignToken(Base):
    __tablename__ = "design_tokens"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    tokens: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
```

`backend/app/models/asset.py`:
```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    file_path: Mapped[str] = mapped_column(String, nullable=False)
    metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
```

`backend/app/models/widget_template.py`:
```python
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WidgetTemplate(Base):
    __tablename__ = "widget_templates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    template: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
```

`backend/app/models/__init__.py`:
```python
from app.models.asset import Asset
from app.models.design_token import DesignToken
from app.models.project import Project
from app.models.widget_template import WidgetTemplate

__all__ = ["Asset", "DesignToken", "Project", "WidgetTemplate"]
```

**Step 4: 테스트 실행 - PASS 확인**

```bash
pytest tests/test_models.py -v
# Expected: 4 passed
```

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat: SQLAlchemy 모델 정의 (Project, DesignToken, Asset, WidgetTemplate)"
```

---

### Task 5: Project CRUD API

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/projects.py`
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/project.py`
- Create: `backend/tests/test_api_projects.py`
- Modify: `backend/app/main.py` (라우터 등록)

**Step 1: 테스트 작성**

`backend/tests/test_api_projects.py`:
```python
import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine, get_db
from app.main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DB = "sqlite:///./test.db"
test_engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


client = TestClient(app)

SAMPLE_DOC = {
    "version": "0.1.0",
    "components": [
        {"id": "btn-1", "type": "button", "props": {"label": "Click"}}
    ],
}


def test_create_project():
    res = client.post("/api/projects", json={"name": "Test", "document": SAMPLE_DOC})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Test"
    assert data["id"] is not None


def test_list_projects():
    client.post("/api/projects", json={"name": "P1", "document": SAMPLE_DOC})
    client.post("/api/projects", json={"name": "P2", "document": SAMPLE_DOC})
    res = client.get("/api/projects")
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_get_project():
    create_res = client.post("/api/projects", json={"name": "P1", "document": SAMPLE_DOC})
    pid = create_res.json()["id"]
    res = client.get(f"/api/projects/{pid}")
    assert res.status_code == 200
    assert res.json()["document"]["version"] == "0.1.0"


def test_update_project():
    create_res = client.post("/api/projects", json={"name": "P1", "document": SAMPLE_DOC})
    pid = create_res.json()["id"]
    res = client.put(f"/api/projects/{pid}", json={"name": "Updated"})
    assert res.status_code == 200
    assert res.json()["name"] == "Updated"


def test_delete_project():
    create_res = client.post("/api/projects", json={"name": "P1", "document": SAMPLE_DOC})
    pid = create_res.json()["id"]
    res = client.delete(f"/api/projects/{pid}")
    assert res.status_code == 204
    res = client.get(f"/api/projects/{pid}")
    assert res.status_code == 404
```

**Step 2: 테스트 실행 - FAIL 확인**

```bash
pytest tests/test_api_projects.py -v
# Expected: FAIL
```

**Step 3: Pydantic 스키마 구현**

`backend/app/schemas/project.py`:
```python
from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    document: dict


class ProjectUpdate(BaseModel):
    name: str | None = None
    document: dict | None = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    document: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
```

**Step 4: API 라우터 구현**

`backend/app/api/projects.py`:
```python
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.updated_at.desc()).all()


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(body: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(name=body.name, document=body.document)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, body: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return Response(status_code=204)
```

**Step 5: main.py에 라우터 등록**

`backend/app/main.py`에 추가:
```python
from app.api.projects import router as projects_router
app.include_router(projects_router)
```

**Step 6: 테스트 실행 - PASS 확인**

```bash
pytest tests/test_api_projects.py -v
# Expected: 5 passed
```

**Step 7: Commit**

```bash
git add backend/
git commit -m "feat: Project CRUD API 구현 (FastAPI + SQLAlchemy)"
```

---

### Task 6: DesignToken, Asset, WidgetTemplate CRUD API

동일한 TDD 패턴으로 나머지 3개 리소스의 CRUD API를 구현한다.

**Files:**
- Create: `backend/app/schemas/design_token.py`
- Create: `backend/app/schemas/asset.py`
- Create: `backend/app/schemas/widget_template.py`
- Create: `backend/app/api/tokens.py`
- Create: `backend/app/api/assets.py`
- Create: `backend/app/api/templates.py`
- Create: `backend/tests/test_api_tokens.py`
- Create: `backend/tests/test_api_assets.py`
- Create: `backend/tests/test_api_templates.py`
- Modify: `backend/app/main.py` (라우터 등록)

각 리소스별로 Task 5와 동일한 패턴 적용:
1. 테스트 작성 (CRUD 5개 테스트케이스)
2. FAIL 확인
3. Pydantic 스키마 작성
4. API 라우터 구현
5. PASS 확인
6. Commit (리소스별 개별 커밋)

```bash
git commit -m "feat: DesignToken CRUD API"
git commit -m "feat: Asset CRUD API (파일 업로드 포함)"
git commit -m "feat: WidgetTemplate CRUD API"
```

---

## Phase 3: LLM 서비스 (Claude SDK + SSE 스트리밍)

### Task 7: Claude SDK 서비스 레이어

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/llm.py`
- Create: `backend/tests/test_llm_service.py`

**Step 1: 테스트 작성 (mock 사용)**

`backend/tests/test_llm_service.py`:
```python
from unittest.mock import AsyncMock, patch

import pytest

from app.services.llm import LLMService, GenerateRequest


@pytest.mark.asyncio
async def test_build_system_prompt_includes_schema():
    service = LLMService(api_key="test-key")
    prompt = service.build_system_prompt()
    assert "A2UI" in prompt
    assert "components" in prompt
    assert "designTokens" in prompt


@pytest.mark.asyncio
async def test_build_messages_for_generate():
    service = LLMService(api_key="test-key")
    req = GenerateRequest(prompt="로그인 폼 만들어줘")
    messages = service.build_messages(req)
    assert messages[0]["role"] == "user"
    assert "로그인 폼" in messages[0]["content"]


@pytest.mark.asyncio
async def test_build_messages_for_edit_includes_widget_context():
    service = LLMService(api_key="test-key")
    req = GenerateRequest(
        prompt="버튼 색상을 빨간색으로",
        selected_widget_id="btn-1",
        current_document={"version": "0.1.0", "components": [{"id": "btn-1", "type": "button"}]},
    )
    messages = service.build_messages(req)
    assert "btn-1" in messages[0]["content"]
```

**Step 2: FAIL 확인**

```bash
pytest tests/test_llm_service.py -v
```

**Step 3: LLM 서비스 구현**

`backend/app/services/llm.py`:
```python
import json
from dataclasses import dataclass
from typing import AsyncIterator

import anthropic

COMPONENT_CATALOG = [
    "card", "text", "button", "text-field", "select", "checkbox",
    "image", "icon", "divider", "container", "grid", "stack",
]

SYSTEM_PROMPT_TEMPLATE = """You are an AI that generates A2UI Extended JSON.

## A2UI Extended Schema
- Root: {{ "version": "0.1.0", "designTokens": {{...}}, "components": [...] }}
- Each component: {{ "id": string, "type": string, "children"?: string[], "props"?: object, "style"?: object }}
- Style values can reference tokens: "$colors.primary", "$spacing.md"
- Available types: {catalog}

## Rules
- Generate ONLY valid JSON. No markdown, no explanation.
- Use meaningful IDs (e.g., "login-form", "submit-btn").
- Include designTokens with colors, spacing, typography, borderRadius.
- Keep components flat (children reference by ID).
"""


@dataclass
class GenerateRequest:
    prompt: str
    selected_widget_id: str | None = None
    current_document: dict | None = None


class LLMService:
    def __init__(self, api_key: str):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)

    def build_system_prompt(self) -> str:
        return SYSTEM_PROMPT_TEMPLATE.format(catalog=", ".join(COMPONENT_CATALOG))

    def build_messages(self, req: GenerateRequest) -> list[dict]:
        content = req.prompt
        if req.selected_widget_id and req.current_document:
            widget = next(
                (c for c in req.current_document.get("components", []) if c["id"] == req.selected_widget_id),
                None,
            )
            context = json.dumps(req.current_document, ensure_ascii=False, indent=2)
            widget_json = json.dumps(widget, ensure_ascii=False, indent=2) if widget else "not found"
            content = (
                f"Current document:\n```json\n{context}\n```\n\n"
                f"Selected widget (id={req.selected_widget_id}):\n```json\n{widget_json}\n```\n\n"
                f"User request: {req.prompt}\n\n"
                f"Return the FULL updated document JSON."
            )
        return [{"role": "user", "content": content}]

    async def generate_stream(self, req: GenerateRequest) -> AsyncIterator[str]:
        messages = self.build_messages(req)
        async with self.client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=self.build_system_prompt(),
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
```

**Step 4: PASS 확인**

```bash
pytest tests/test_llm_service.py -v
# Expected: 3 passed
```

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat: Claude SDK LLM 서비스 레이어 구현"
```

---

### Task 8: SSE 스트리밍 API 엔드포인트

**Files:**
- Create: `backend/app/api/generate.py`
- Create: `backend/tests/test_api_generate.py`
- Modify: `backend/app/main.py` (라우터 등록)

**Step 1: 테스트 작성 (mock LLM)**

`backend/tests/test_api_generate.py`:
```python
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_generate_endpoint_returns_sse():
    async def mock_stream(req):
        for chunk in ['{"ver', 'sion":', '"0.1.0"}']:
            yield chunk

    with patch("app.api.generate.get_llm_service") as mock:
        mock.return_value.generate_stream = mock_stream
        res = client.post(
            "/api/generate",
            json={"prompt": "버튼 만들어줘"},
            headers={"Accept": "text/event-stream"},
        )
        assert res.status_code == 200
        assert "text/event-stream" in res.headers["content-type"]
```

**Step 2: FAIL 확인**

**Step 3: SSE 엔드포인트 구현**

`backend/app/api/generate.py`:
```python
import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.services.llm import GenerateRequest, LLMService

router = APIRouter(prefix="/api/generate", tags=["generate"])


def get_llm_service() -> LLMService:
    return LLMService(api_key=settings.anthropic_api_key)


class GenerateBody(BaseModel):
    prompt: str
    selected_widget_id: str | None = None
    current_document: dict | None = None


async def _stream_events(service: LLMService, req: GenerateRequest):
    collected = ""
    async for chunk in service.generate_stream(req):
        collected += chunk
        yield {"event": "chunk", "data": json.dumps({"text": chunk})}
    yield {"event": "done", "data": json.dumps({"full_text": collected})}


@router.post("")
async def generate(body: GenerateBody, service: LLMService = Depends(get_llm_service)):
    req = GenerateRequest(
        prompt=body.prompt,
        selected_widget_id=body.selected_widget_id,
        current_document=body.current_document,
    )
    return EventSourceResponse(_stream_events(service, req))


@router.post("/edit")
async def generate_edit(body: GenerateBody, service: LLMService = Depends(get_llm_service)):
    req = GenerateRequest(
        prompt=body.prompt,
        selected_widget_id=body.selected_widget_id,
        current_document=body.current_document,
    )
    return EventSourceResponse(_stream_events(service, req))
```

**Step 4: PASS 확인**

```bash
pytest tests/test_api_generate.py -v
```

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat: SSE 스트리밍 생성 API 엔드포인트 (/api/generate)"
```

---

## Phase 4: 프론트엔드 코어

### Task 9: 타입 정의 & API 클라이언트

**Files:**
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/lib/api.ts`

**Step 1: A2UI 확장 타입 정의**

`frontend/src/lib/types.ts`:
```typescript
export type ComponentType =
  | "card" | "text" | "button" | "text-field" | "select"
  | "checkbox" | "image" | "icon" | "divider"
  | "container" | "grid" | "stack";

export interface A2UIComponent {
  readonly id: string;
  readonly type: ComponentType;
  readonly children?: readonly string[];
  readonly props?: Readonly<Record<string, unknown>>;
  readonly style?: Readonly<Record<string, string>>;
}

export interface DesignTokens {
  readonly colors?: Readonly<Record<string, string>>;
  readonly spacing?: Readonly<Record<string, string>>;
  readonly typography?: Readonly<Record<string, {
    readonly fontFamily?: string;
    readonly fontSize?: string;
    readonly fontWeight?: string | number;
    readonly lineHeight?: string;
  }>>;
  readonly borderRadius?: Readonly<Record<string, string>>;
}

export interface A2UIDocument {
  readonly version: string;
  readonly designTokens?: DesignTokens;
  readonly components: readonly A2UIComponent[];
}

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly document: A2UIDocument;
  readonly created_at: string;
  readonly updated_at: string;
}
```

**Step 2: API 클라이언트**

`frontend/src/lib/api.ts`:
```typescript
import type { A2UIDocument, Project } from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  projects: {
    list: () => request<Project[]>("/projects"),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (name: string, document: A2UIDocument) =>
      request<Project>("/projects", {
        method: "POST",
        body: JSON.stringify({ name, document }),
      }),
    update: (id: string, data: { name?: string; document?: A2UIDocument }) =>
      request<Project>(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/projects/${id}`, { method: "DELETE" }),
  },

  generate: (prompt: string, selectedWidgetId?: string, currentDocument?: A2UIDocument) => {
    return fetch(`${BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        selected_widget_id: selectedWidgetId,
        current_document: currentDocument,
      }),
    });
  },
} as const;
```

**Step 3: Commit**

```bash
git add frontend/src/lib/
git commit -m "feat: A2UI 타입 정의 & API 클라이언트"
```

---

### Task 10: Zustand 스토어 (EditorStore)

**Files:**
- Create: `frontend/src/stores/editor-store.ts`
- Create: `frontend/src/stores/__tests__/editor-store.test.ts`

**Step 1: 테스트 작성**

`frontend/src/stores/__tests__/editor-store.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editor-store";

const SAMPLE_DOC = {
  version: "0.1.0",
  components: [
    { id: "btn-1", type: "button" as const, props: { label: "Click" } },
    { id: "card-1", type: "card" as const, children: ["btn-1"] },
  ],
};

describe("EditorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it("loads a document", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    expect(useEditorStore.getState().document).toEqual(SAMPLE_DOC);
  });

  it("selects a widget", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().selectWidget("btn-1");
    expect(useEditorStore.getState().selectedWidgetId).toBe("btn-1");
  });

  it("updates a widget immutably", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    const before = useEditorStore.getState().document;
    useEditorStore.getState().updateWidget("btn-1", { props: { label: "New" } });
    const after = useEditorStore.getState().document;
    expect(before).not.toBe(after);
    expect(after?.components.find((c) => c.id === "btn-1")?.props?.label).toBe("New");
  });

  it("supports undo/redo", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().updateWidget("btn-1", { props: { label: "Changed" } });
    useEditorStore.getState().undo();
    expect(
      useEditorStore.getState().document?.components.find((c) => c.id === "btn-1")?.props?.label,
    ).toBe("Click");
    useEditorStore.getState().redo();
    expect(
      useEditorStore.getState().document?.components.find((c) => c.id === "btn-1")?.props?.label,
    ).toBe("Changed");
  });
});
```

**Step 2: FAIL 확인**

```bash
cd frontend && npx vitest run src/stores/__tests__/editor-store.test.ts
```

**Step 3: EditorStore 구현**

`frontend/src/stores/editor-store.ts`:
```typescript
import { create } from "zustand";
import { produce } from "immer";
import type { A2UIComponent, A2UIDocument } from "../lib/types";

interface EditorState {
  document: A2UIDocument | null;
  selectedWidgetId: string | null;
  history: A2UIDocument[];
  historyIndex: number;

  loadDocument: (doc: A2UIDocument) => void;
  selectWidget: (id: string | null) => void;
  updateWidget: (id: string, patch: Partial<A2UIComponent>) => void;
  moveWidget: (id: string, newParentId: string, index: number) => void;
  addWidget: (widget: A2UIComponent, parentId?: string) => void;
  removeWidget: (id: string) => void;
  applyLLMDocument: (doc: A2UIDocument) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

function pushHistory(state: EditorState, doc: A2UIDocument): Partial<EditorState> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(doc);
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  document: null,
  selectedWidgetId: null,
  history: [],
  historyIndex: -1,

  loadDocument: (doc) =>
    set({ document: doc, history: [doc], historyIndex: 0, selectedWidgetId: null }),

  selectWidget: (id) => set({ selectedWidgetId: id }),

  updateWidget: (id, patch) => {
    const { document } = get();
    if (!document) return;
    const newDoc = produce(document, (draft) => {
      const comp = draft.components.find((c) => c.id === id);
      if (comp) Object.assign(comp, patch);
    });
    set((state) => ({ document: newDoc, ...pushHistory(state, newDoc) }));
  },

  moveWidget: (id, newParentId, index) => {
    const { document } = get();
    if (!document) return;
    const newDoc = produce(document, (draft) => {
      for (const comp of draft.components) {
        if (comp.children) {
          const idx = comp.children.indexOf(id);
          if (idx !== -1) comp.children.splice(idx, 1);
        }
      }
      const parent = draft.components.find((c) => c.id === newParentId);
      if (parent) {
        if (!parent.children) (parent as any).children = [];
        parent.children!.splice(index, 0, id);
      }
    });
    set((state) => ({ document: newDoc, ...pushHistory(state, newDoc) }));
  },

  addWidget: (widget, parentId) => {
    const { document } = get();
    if (!document) return;
    const newDoc = produce(document, (draft) => {
      draft.components.push(widget as any);
      if (parentId) {
        const parent = draft.components.find((c) => c.id === parentId);
        if (parent) {
          if (!parent.children) (parent as any).children = [];
          parent.children!.push(widget.id);
        }
      }
    });
    set((state) => ({ document: newDoc, ...pushHistory(state, newDoc) }));
  },

  removeWidget: (id) => {
    const { document } = get();
    if (!document) return;
    const newDoc = produce(document, (draft) => {
      draft.components = draft.components.filter((c) => c.id !== id) as any;
      for (const comp of draft.components) {
        if (comp.children) {
          (comp as any).children = comp.children.filter((cid) => cid !== id);
        }
      }
    });
    set((state) => ({
      document: newDoc,
      selectedWidgetId: get().selectedWidgetId === id ? null : get().selectedWidgetId,
      ...pushHistory(state, newDoc),
    }));
  },

  applyLLMDocument: (doc) =>
    set((state) => ({ document: doc, ...pushHistory(state, doc) })),

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ document: history[newIndex], historyIndex: newIndex });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ document: history[newIndex], historyIndex: newIndex });
  },

  reset: () =>
    set({ document: null, selectedWidgetId: null, history: [], historyIndex: -1 }),
}));
```

**Step 4: PASS 확인**

```bash
npx vitest run src/stores/__tests__/editor-store.test.ts
# Expected: 4 passed
```

**Step 5: Commit**

```bash
git add frontend/src/stores/
git commit -m "feat: EditorStore (Zustand + Immer) - 위젯 CRUD, undo/redo"
```

---

### Task 11: ChatStore & SSE 훅

**Files:**
- Create: `frontend/src/stores/chat-store.ts`
- Create: `frontend/src/hooks/use-sse-generate.ts`

Task 10과 동일한 TDD 패턴. ChatStore는 messages[], isStreaming, logs[] 관리.
useSSEGenerate 훅은 EventSource로 /api/generate SSE 수신하여 ChatStore + EditorStore 업데이트.

```bash
git commit -m "feat: ChatStore & useSSEGenerate 훅 (SSE 스트리밍)"
```

---

## Phase 5: Visual Editor UI

### Task 12: 에디터 레이아웃 쉘

**Files:**
- Create: `frontend/src/features/editor/EditorLayout.tsx`
- Create: `frontend/src/features/editor/TopBar.tsx`
- Create: `frontend/src/features/editor/LeftPanel.tsx`
- Create: `frontend/src/features/editor/RightPanel.tsx`
- Create: `frontend/src/features/editor/BottomPanel.tsx`
- Create: `frontend/src/features/editor/Canvas.tsx`

리사이즈 가능한 3-column + bottom 패널 레이아웃 구현.
디자인 시스템 참고: bg-bg, bg-surface, border-border, text-text-primary.

```bash
git commit -m "feat: Visual Editor 레이아웃 쉘 (리사이즈 패널)"
```

---

### Task 13: A2UI 런타임 렌더러

**Files:**
- Create: `frontend/src/features/preview/A2UIRenderer.tsx`
- Create: `frontend/src/features/preview/components/index.ts`
- Create: `frontend/src/features/preview/components/CardWidget.tsx`
- Create: `frontend/src/features/preview/components/TextWidget.tsx`
- Create: `frontend/src/features/preview/components/ButtonWidget.tsx`
- Create: `frontend/src/features/preview/components/TextFieldWidget.tsx`
- (나머지 카탈로그 컴포넌트들)
- Create: `frontend/src/features/preview/token-resolver.ts`

A2UIRenderer: components 배열을 순회하며 type별 React 컴포넌트로 매핑.
token-resolver: `$colors.primary` 같은 토큰 참조를 실제 값으로 해석.

```bash
git commit -m "feat: A2UI 런타임 렌더러 + 토큰 리졸버"
```

---

### Task 14: 위젯 트리 패널 (LeftPanel)

**Files:**
- Modify: `frontend/src/features/editor/LeftPanel.tsx`
- Create: `frontend/src/features/editor/WidgetTreeNode.tsx`

위젯 트리를 재귀적으로 렌더링. 클릭 시 selectWidget 호출.
dnd-kit으로 드래그앤드롭 순서 변경 & 부모 변경.

```bash
git commit -m "feat: 위젯 트리 패널 + 드래그앤드롭 (dnd-kit)"
```

---

### Task 15: 속성 패널 (RightPanel)

**Files:**
- Modify: `frontend/src/features/editor/RightPanel.tsx`
- Create: `frontend/src/features/editor/panels/StylePanel.tsx`
- Create: `frontend/src/features/editor/panels/PropsPanel.tsx`

선택된 위젯의 style/props를 편집하는 폼. Cursor Visual Editor 스크린샷 참고:
Position, Layout (Flow, Dimensions, Padding, Margin), Appearance (Opacity, Corner Radius), Text (Font).

```bash
git commit -m "feat: 속성 패널 (Position, Layout, Appearance, Text)"
```

---

### Task 16: 캔버스 위젯 선택 & 하이라이트

**Files:**
- Modify: `frontend/src/features/editor/Canvas.tsx`

캔버스 내 렌더링된 위젯 클릭 시 선택 상태 표시 (파란색 아웃라인).
선택된 위젯 ID를 EditorStore에 반영.

```bash
git commit -m "feat: 캔버스 위젯 선택 하이라이트"
```

---

## Phase 6: 채팅 & LLM 로그

### Task 17: 채팅 패널 + 자연어 수정

**Files:**
- Create: `frontend/src/features/chat/ChatPanel.tsx`
- Create: `frontend/src/features/chat/MessageList.tsx`
- Create: `frontend/src/features/chat/ChatInput.tsx`

채팅 입력 -> useSSEGenerate 호출 -> 스트리밍 응답 표시.
위젯 선택 상태에서 채팅하면 selectedWidgetId + currentDocument 포함하여 API 호출.

```bash
git commit -m "feat: 채팅 패널 + 위젯 선택 자연어 수정"
```

---

### Task 18: LLM 로그 패널

**Files:**
- Create: `frontend/src/features/chat/LogPanel.tsx`

ChatStore.logs[] 표시: prompt, 스트리밍 청크, 토큰 사용량, 소요 시간, 에러.
JetBrains Mono 폰트, 코드 스타일 표시.

```bash
git commit -m "feat: LLM 로그 패널"
```

---

## Phase 7: 자산 관리

### Task 19: 자산 관리 UI (껍데기)

**Files:**
- Create: `frontend/src/features/assets/AssetsPage.tsx`
- Create: `frontend/src/features/assets/DesignTokenEditor.tsx`
- Create: `frontend/src/features/assets/IconGallery.tsx`
- Create: `frontend/src/features/assets/ImageGallery.tsx`
- Create: `frontend/src/features/assets/WidgetTemplateList.tsx`
- Create: `frontend/src/features/assets/SyncAgentPanel.tsx`
- Create: `frontend/src/stores/asset-store.ts`

디자인 토큰 편집, 아이콘/이미지 갤러리, 위젯 템플릿 목록.
SyncAgentPanel: UI만 구현 (Figma/Pencil import 버튼, 기능 미구현 표시).

```bash
git commit -m "feat: 자산 관리 UI (디자인토큰, 아이콘, 이미지, 템플릿, Sync Agent 껍데기)"
```

---

## Phase 8: Slack Bot

### Task 20: Slack Bot 초기화

**Files:**
- Create: `slack-bot/pyproject.toml`
- Create: `slack-bot/bot/__init__.py`
- Create: `slack-bot/bot/main.py`
- Create: `slack-bot/bot/client.py`
- Create: `slack-bot/bot/handlers.py`

**Step 1: pyproject.toml**

```toml
[project]
name = "agui-slack-bot"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "slack-bolt>=1.21.0",
    "httpx>=0.28.0",
]
```

**Step 2: client.py - 백엔드 API 호출**

```python
import httpx

class AGUIClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.http = httpx.AsyncClient(base_url=base_url)

    async def generate(self, prompt: str) -> dict:
        """Non-streaming generate for Slack (waits for full response)."""
        res = await self.http.post("/api/generate", json={"prompt": prompt}, timeout=60.0)
        # SSE 응답을 읽어서 전체 텍스트 수집
        full_text = ""
        async with self.http.stream("POST", "/api/generate", json={"prompt": prompt}) as response:
            async for line in response.aiter_lines():
                if line.startswith("data:"):
                    import json
                    data = json.loads(line[5:])
                    if "text" in data:
                        full_text += data["text"]
        return json.loads(full_text)

    async def create_project(self, name: str, document: dict) -> dict:
        res = await self.http.post("/api/projects", json={"name": name, "document": document})
        return res.json()

    async def list_projects(self) -> list[dict]:
        res = await self.http.get("/api/projects")
        return res.json()
```

**Step 3: handlers.py - Slack 커맨드 핸들러**

```python
from slack_bolt.async_app import AsyncApp
from bot.client import AGUIClient

def register_handlers(app: AsyncApp, client: AGUIClient, preview_base_url: str):
    @app.command("/agui")
    async def handle_agui(ack, command, say):
        await ack()
        text = command["text"].strip()

        if text == "list":
            projects = await client.list_projects()
            if not projects:
                await say("프로젝트가 없습니다.")
                return
            lines = [f"- *{p['name']}* (`{p['id'][:8]}...`)  {preview_base_url}/preview/{p['id']}" for p in projects]
            await say("\n".join(lines))
            return

        if text.startswith("preview "):
            pid = text[8:].strip()
            await say(f"미리보기: {preview_base_url}/preview/{pid}")
            return

        # Default: generate UI
        await say(f"UI 생성 중... `{text}`")
        document = await client.generate(text)
        project = await client.create_project(name=text[:50], document=document)
        await say(f"UI가 생성됐습니다!\n미리보기: {preview_base_url}/preview/{project['id']}")
```

**Step 4: Commit**

```bash
git add slack-bot/
git commit -m "feat: Slack Bot 초기화 (slack-bolt + 백엔드 API 연동)"
```

---

## Phase 9: 통합 & 마무리

### Task 21: 프론트엔드 라우팅

**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/pages/EditorPage.tsx`
- Create: `frontend/src/pages/PreviewPage.tsx`
- Create: `frontend/src/pages/AssetsPage.tsx`

react-router-dom으로 라우팅:
- `/` -> EditorPage (Visual Editor)
- `/preview/:id` -> PreviewPage (Slack 공유용 미리보기)
- `/assets` -> AssetsPage (자산 관리)

```bash
npm install react-router-dom
git commit -m "feat: 프론트엔드 라우팅 (Editor, Preview, Assets)"
```

---

### Task 22: 미리보기 페이지

**Files:**
- Create: `frontend/src/pages/PreviewPage.tsx`

URL 파라미터의 project ID로 API 조회 -> A2UIRenderer로 렌더링.
Slack에서 공유된 링크로 접근 시 사용.

```bash
git commit -m "feat: 프로젝트 미리보기 페이지 (/preview/:id)"
```

---

### Task 23: E2E 통합 테스트

**Files:**
- Create: `frontend/e2e/editor.spec.ts`

Playwright로 핵심 플로우 테스트:
1. 에디터 페이지 로드
2. 채팅에 자연어 입력 -> UI 생성 확인
3. 위젯 클릭 -> 속성 패널 표시 확인
4. 속성 수정 -> 캔버스 반영 확인

```bash
git commit -m "test: E2E 통합 테스트 (에디터 핵심 플로우)"
```

---

## 실행 순서 요약

| Phase | Tasks | 의존성 |
|-------|-------|--------|
| 1. 스캐폴딩 | Task 1-3 | 없음 (병렬 가능) |
| 2. 백엔드 코어 | Task 4-6 | Phase 1 |
| 3. LLM 서비스 | Task 7-8 | Task 4 |
| 4. 프론트 코어 | Task 9-11 | Task 3 |
| 5. Visual Editor | Task 12-16 | Task 9-10 |
| 6. 채팅/로그 | Task 17-18 | Task 11, 12 |
| 7. 자산 관리 | Task 19 | Task 6, 9 |
| 8. Slack Bot | Task 20 | Task 8 |
| 9. 통합 | Task 21-23 | 모든 Phase |
