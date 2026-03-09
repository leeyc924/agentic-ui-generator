import json
from dataclasses import dataclass
from typing import AsyncIterator

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    TextBlock,
)

COMPONENT_CATALOG = [
    "card",
    "text",
    "button",
    "text-field",
    "select",
    "checkbox",
    "image",
    "icon",
    "divider",
    "container",
    "grid",
    "stack",
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


@dataclass(frozen=True)
class GenerateRequest:
    prompt: str
    selected_widget_id: str | None = None
    current_document: dict | None = None


def _find_widget(document: dict, widget_id: str) -> dict | None:
    """Find a widget by ID in the document's components list."""
    return next(
        (
            c
            for c in document.get("components", [])
            if c.get("id") == widget_id
        ),
        None,
    )


def _build_edit_content(
    req_prompt: str,
    widget_id: str,
    document: dict,
    widget: dict | None,
) -> str:
    """Build the user message content for an edit request."""
    context = json.dumps(document, ensure_ascii=False, indent=2)
    widget_json = (
        json.dumps(widget, ensure_ascii=False, indent=2)
        if widget
        else "not found"
    )
    return (
        f"Current document:\n```json\n{context}\n```\n\n"
        f"Selected widget (id={widget_id}):\n```json\n{widget_json}\n```\n\n"
        f"User request: {req_prompt}\n\n"
        f"Return the FULL updated document JSON."
    )


def _build_system_prompt() -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        catalog=", ".join(COMPONENT_CATALOG)
    )


def _build_user_prompt(req: GenerateRequest) -> str:
    if req.selected_widget_id and req.current_document:
        widget = _find_widget(
            req.current_document, req.selected_widget_id
        )
        return _build_edit_content(
            req.prompt,
            req.selected_widget_id,
            req.current_document,
            widget,
        )
    return req.prompt


class LLMService:
    def __init__(self, oauth_token: str) -> None:
        self._oauth_token = oauth_token

    async def generate_stream(
        self, req: GenerateRequest
    ) -> AsyncIterator[str]:
        user_prompt = _build_user_prompt(req)
        options = ClaudeAgentOptions(
            system_prompt=_build_system_prompt(),
            model="claude-sonnet-4-6",
            max_turns=1,
            env={"CLAUDE_CODE_OAUTH_TOKEN": self._oauth_token},
        )

        async with ClaudeSDKClient(options=options) as client:
            await client.query(user_prompt)
            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            yield block.text
