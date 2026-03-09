from slack_bolt.async_app import AsyncApp

from bot.client import AGUIClient


def register_handlers(
    app: AsyncApp, client: AGUIClient, preview_base_url: str
):
    @app.command("/agui")
    async def handle_agui(ack, command, say):
        await ack()
        text = command["text"].strip()

        if text == "list":
            projects = await client.list_projects()
            if not projects:
                await say("프로젝트가 없습니다.")
                return
            lines = [
                f"- *{p['name']}* (`{p['id'][:8]}...`) "
                f"<{preview_base_url}/preview/{p['id']}|미리보기>"
                for p in projects
            ]
            await say("\n".join(lines))
            return

        if text.startswith("preview "):
            pid = text[8:].strip()
            await say(f"미리보기: {preview_base_url}/preview/{pid}")
            return

        await say(f"UI 생성 중... `{text}`")
        try:
            document = await client.generate(text)
            project = await client.create_project(
                name=text[:50], document=document
            )
            await say(
                f"UI가 생성됐습니다!\n"
                f"미리보기: <{preview_base_url}/preview/{project['id']}|열기>"
            )
        except Exception as e:
            await say(f"오류가 발생했습니다: {e}")
