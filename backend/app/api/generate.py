import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.services.llm import GenerateRequest, LLMService

router = APIRouter(prefix="/api/generate", tags=["generate"])


def get_llm_service() -> LLMService:
    return LLMService(oauth_token=settings.anthropic_auth_token)


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
async def generate(
    body: GenerateBody,
    service: LLMService = Depends(get_llm_service),
):
    req = GenerateRequest(
        prompt=body.prompt,
        selected_widget_id=body.selected_widget_id,
        current_document=body.current_document,
    )
    return EventSourceResponse(_stream_events(service, req))


@router.post("/edit")
async def generate_edit(
    body: GenerateBody,
    service: LLMService = Depends(get_llm_service),
):
    req = GenerateRequest(
        prompt=body.prompt,
        selected_widget_id=body.selected_widget_id,
        current_document=body.current_document,
    )
    return EventSourceResponse(_stream_events(service, req))
