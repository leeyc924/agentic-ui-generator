from unittest.mock import AsyncMock, patch

import pytest

from bot.handlers import register_handlers


PREVIEW_BASE_URL = "http://localhost:5173"


@pytest.fixture
def mock_client():
    client = AsyncMock()
    client.list_projects = AsyncMock(return_value=[])
    client.generate = AsyncMock(return_value={"type": "div"})
    client.create_project = AsyncMock(
        return_value={"id": "abc12345-full-id", "name": "test"}
    )
    return client


@pytest.fixture
def handler_registry(mock_client):
    """Capture registered handlers without needing a real Slack app."""
    handlers = {}

    class FakeApp:
        def command(self, name):
            def decorator(fn):
                handlers[name] = fn
                return fn
            return decorator

    app = FakeApp()
    register_handlers(app, mock_client, PREVIEW_BASE_URL)
    return handlers


@pytest.mark.asyncio
async def test_agui_list_command_no_projects(handler_registry, mock_client):
    handler = handler_registry["/agui"]
    ack = AsyncMock()
    say = AsyncMock()
    command = {"text": "list"}

    await handler(ack=ack, command=command, say=say)

    ack.assert_awaited_once()
    say.assert_awaited_once_with("프로젝트가 없습니다.")


@pytest.mark.asyncio
async def test_agui_list_command_with_projects(handler_registry, mock_client):
    mock_client.list_projects.return_value = [
        {"id": "abc12345-full-id", "name": "My Project"},
        {"id": "def67890-full-id", "name": "Other"},
    ]
    handler = handler_registry["/agui"]
    ack = AsyncMock()
    say = AsyncMock()
    command = {"text": "list"}

    await handler(ack=ack, command=command, say=say)

    ack.assert_awaited_once()
    msg = say.call_args[0][0]
    assert "My Project" in msg
    assert "Other" in msg
    assert "미리보기" in msg


@pytest.mark.asyncio
async def test_agui_preview_command(handler_registry, mock_client):
    handler = handler_registry["/agui"]
    ack = AsyncMock()
    say = AsyncMock()
    command = {"text": "preview abc123"}

    await handler(ack=ack, command=command, say=say)

    ack.assert_awaited_once()
    say.assert_awaited_once_with(
        f"미리보기: {PREVIEW_BASE_URL}/preview/abc123"
    )


@pytest.mark.asyncio
async def test_agui_generate_command(handler_registry, mock_client):
    handler = handler_registry["/agui"]
    ack = AsyncMock()
    say = AsyncMock()
    command = {"text": "login form with email and password"}

    await handler(ack=ack, command=command, say=say)

    ack.assert_awaited_once()
    mock_client.generate.assert_awaited_once_with(
        "login form with email and password"
    )
    mock_client.create_project.assert_awaited_once()

    # First call: progress message, second call: result
    assert say.await_count == 2
    result_msg = say.call_args_list[1][0][0]
    assert "열기" in result_msg


@pytest.mark.asyncio
async def test_agui_generate_error_handling(handler_registry, mock_client):
    mock_client.generate.side_effect = RuntimeError("connection failed")
    handler = handler_registry["/agui"]
    ack = AsyncMock()
    say = AsyncMock()
    command = {"text": "build a button"}

    await handler(ack=ack, command=command, say=say)

    ack.assert_awaited_once()
    assert say.await_count == 2
    error_msg = say.call_args_list[1][0][0]
    assert "오류" in error_msg
    assert "connection failed" in error_msg
