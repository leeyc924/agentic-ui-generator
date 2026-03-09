import json
import logging
import re

import httpx

logger = logging.getLogger("agui.slack.client")


def _strip_codeblock(text: str) -> str:
    """Remove markdown code block fences (```json ... ```)."""
    stripped = re.sub(r"^```\w*\n?", "", text.strip())
    stripped = re.sub(r"\n?```$", "", stripped.strip())
    return stripped.strip()


class AGUIClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url

    async def generate(self, prompt: str) -> dict:
        """Call generate API and collect full SSE response."""
        async with httpx.AsyncClient(base_url=self.base_url) as http:
            async with http.stream(
                "POST",
                "/api/generate",
                json={"prompt": prompt},
                timeout=120.0,
            ) as response:
                full_text = ""
                async for line in response.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = json.loads(line[5:].strip())
                    if "full_text" in data:
                        full_text = data["full_text"]
                    elif "text" in data:
                        full_text += data["text"]

                if not full_text:
                    logger.warning("백엔드에서 빈 응답을 받았습니다")
                    return {}

                clean = _strip_codeblock(full_text)
                logger.debug("파싱할 텍스트: %s...", clean[:100])
                return json.loads(clean)

    async def create_project(self, name: str, document: dict) -> dict:
        async with httpx.AsyncClient(base_url=self.base_url) as http:
            res = await http.post(
                "/api/projects",
                json={"name": name, "document": document},
            )
            res.raise_for_status()
            return res.json()

    async def list_projects(self) -> list[dict]:
        async with httpx.AsyncClient(base_url=self.base_url) as http:
            res = await http.get("/api/projects")
            res.raise_for_status()
            return res.json()
