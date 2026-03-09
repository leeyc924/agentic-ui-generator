from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.generate import get_llm_service
from app.main import app

client = TestClient(app)


def _make_mock_service(chunks: list[str]):
    """Create a mock LLM service that yields the given chunks."""

    async def mock_stream(req):
        for chunk in chunks:
            yield chunk

    mock_service = MagicMock()
    mock_service.generate_stream = mock_stream
    return mock_service


def _override_llm_service(chunks: list[str]):
    """Return a dependency override function for get_llm_service."""
    service = _make_mock_service(chunks)

    def override():
        return service

    return override


def test_generate_endpoint_exists():
    """POST /api/generate should exist and not return 405."""
    app.dependency_overrides[get_llm_service] = _override_llm_service(
        ['{"version": "0.1.0"}']
    )
    try:
        res = client.post(
            "/api/generate",
            json={"prompt": "버튼 만들어줘"},
        )
        assert res.status_code == 200
    finally:
        app.dependency_overrides.clear()


def test_generate_returns_sse_content_type():
    app.dependency_overrides[get_llm_service] = _override_llm_service(
        ['{"test": true}']
    )
    try:
        res = client.post(
            "/api/generate",
            json={"prompt": "test"},
        )
        assert "text/event-stream" in res.headers.get("content-type", "")
    finally:
        app.dependency_overrides.clear()


def test_generate_streams_chunks():
    app.dependency_overrides[get_llm_service] = _override_llm_service(
        ['{"ver', 'sion":', '"0.1.0"}']
    )
    try:
        res = client.post(
            "/api/generate",
            json={"prompt": "test"},
        )
        assert res.status_code == 200
        body = res.text
        assert "event: chunk" in body or "data:" in body
    finally:
        app.dependency_overrides.clear()


def test_generate_edit_endpoint_exists():
    app.dependency_overrides[get_llm_service] = _override_llm_service(
        ['{"version": "0.1.0"}']
    )
    try:
        res = client.post(
            "/api/generate/edit",
            json={
                "prompt": "버튼 빨간색으로",
                "selected_widget_id": "btn-1",
                "current_document": {
                    "version": "0.1.0",
                    "components": [],
                },
            },
        )
        assert res.status_code == 200
    finally:
        app.dependency_overrides.clear()


def test_generate_requires_prompt():
    res = client.post("/api/generate", json={})
    assert res.status_code == 422
