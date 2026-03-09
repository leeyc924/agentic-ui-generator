import json
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from bot.client import AGUIClient


@pytest.fixture
def client():
    return AGUIClient(base_url="http://test:8000")


def _make_mock_http():
    """Create a mock httpx.AsyncClient that works as async context manager."""
    mock_http = AsyncMock()
    return mock_http


@pytest.mark.asyncio
async def test_create_project_sends_correct_request(client):
    mock_response = MagicMock()
    mock_response.json.return_value = {"id": "abc123", "name": "test"}
    mock_response.raise_for_status = MagicMock()

    mock_http = _make_mock_http()
    mock_http.post = AsyncMock(return_value=mock_response)

    with patch("bot.client.httpx.AsyncClient") as mock_cls:
        instance = MagicMock()
        instance.__aenter__ = AsyncMock(return_value=mock_http)
        instance.__aexit__ = AsyncMock(return_value=False)
        mock_cls.return_value = instance

        result = await client.create_project(
            name="test", document={"type": "div"}
        )

        mock_http.post.assert_called_once_with(
            "/api/projects",
            json={"name": "test", "document": {"type": "div"}},
        )
        assert result == {"id": "abc123", "name": "test"}


@pytest.mark.asyncio
async def test_list_projects_returns_list(client):
    mock_response = MagicMock()
    mock_response.json.return_value = [
        {"id": "p1", "name": "project1"},
        {"id": "p2", "name": "project2"},
    ]
    mock_response.raise_for_status = MagicMock()

    mock_http = _make_mock_http()
    mock_http.get = AsyncMock(return_value=mock_response)

    with patch("bot.client.httpx.AsyncClient") as mock_cls:
        instance = MagicMock()
        instance.__aenter__ = AsyncMock(return_value=mock_http)
        instance.__aexit__ = AsyncMock(return_value=False)
        mock_cls.return_value = instance

        result = await client.list_projects()

        mock_http.get.assert_called_once_with("/api/projects")
        assert len(result) == 2
        assert result[0]["name"] == "project1"


@pytest.mark.asyncio
async def test_generate_collects_sse_chunks(client):
    sse_lines = [
        'data:{"text":"{\\"type\\": "}',
        'data:{"text":"\\"div\\"}"}',
        'data:{"full_text":"{\\"type\\": \\"div\\"}"}',
    ]

    mock_stream_response = MagicMock()
    mock_stream_response.aiter_lines = lambda: _async_iter(sse_lines)

    # stream() returns a context manager
    stream_cm = MagicMock()
    stream_cm.__aenter__ = AsyncMock(return_value=mock_stream_response)
    stream_cm.__aexit__ = AsyncMock(return_value=False)

    mock_http = MagicMock()
    mock_http.stream = MagicMock(return_value=stream_cm)

    with patch("bot.client.httpx.AsyncClient") as mock_cls:
        instance = MagicMock()
        instance.__aenter__ = AsyncMock(return_value=mock_http)
        instance.__aexit__ = AsyncMock(return_value=False)
        mock_cls.return_value = instance

        result = await client.generate("build a button")

        assert result == {"type": "div"}


@pytest.mark.asyncio
async def test_generate_returns_empty_dict_on_no_data(client):
    mock_stream_response = MagicMock()
    mock_stream_response.aiter_lines = lambda: _async_iter([])

    stream_cm = MagicMock()
    stream_cm.__aenter__ = AsyncMock(return_value=mock_stream_response)
    stream_cm.__aexit__ = AsyncMock(return_value=False)

    mock_http = MagicMock()
    mock_http.stream = MagicMock(return_value=stream_cm)

    with patch("bot.client.httpx.AsyncClient") as mock_cls:
        instance = MagicMock()
        instance.__aenter__ = AsyncMock(return_value=mock_http)
        instance.__aexit__ = AsyncMock(return_value=False)
        mock_cls.return_value = instance

        result = await client.generate("empty")
        assert result == {}


async def _async_iter(items):
    for item in items:
        yield item
