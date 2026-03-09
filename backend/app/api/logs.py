import asyncio
import json
import logging
from collections import deque
from typing import AsyncIterator

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/api/logs", tags=["logs"])

MAX_BUFFER = 200

_log_queue: asyncio.Queue[str] = asyncio.Queue(maxsize=1000)
_log_buffer: deque[str] = deque(maxlen=MAX_BUFFER)


class QueueLogHandler(logging.Handler):
    """Send log records to an asyncio queue for SSE streaming."""

    def emit(self, record: logging.LogRecord) -> None:
        entry = json.dumps(
            {
                "timestamp": record.created,
                "level": record.levelname,
                "logger": record.name,
                "message": self.format(record),
            }
        )
        _log_buffer.append(entry)
        try:
            _log_queue.put_nowait(entry)
        except asyncio.QueueFull:
            pass


def setup_log_streaming() -> None:
    handler = QueueLogHandler()
    handler.setFormatter(logging.Formatter("%(message)s"))
    handler.setLevel(logging.INFO)

    root = logging.getLogger()
    root.addHandler(handler)

    for name in ("uvicorn", "uvicorn.access", "uvicorn.error", "app"):
        logger = logging.getLogger(name)
        logger.addHandler(handler)


async def _stream_logs() -> AsyncIterator[dict]:
    # Send buffered logs first
    for entry in list(_log_buffer):
        yield {"event": "log", "data": entry}

    while True:
        try:
            entry = await asyncio.wait_for(_log_queue.get(), timeout=30.0)
            yield {"event": "log", "data": entry}
        except asyncio.TimeoutError:
            yield {"event": "ping", "data": "{}"}


@router.get("/stream")
async def stream_logs():
    return EventSourceResponse(_stream_logs())
