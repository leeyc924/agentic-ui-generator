import json

import httpx


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
                timeout=60.0,
            ) as response:
                full_text = ""
                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        data = json.loads(line[5:].strip())
                        if "full_text" in data:
                            full_text = data["full_text"]
                        elif "text" in data:
                            full_text += data["text"]
                return json.loads(full_text) if full_text else {}

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
