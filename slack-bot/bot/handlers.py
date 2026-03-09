import logging
import re

from slack_bolt.async_app import AsyncApp

from bot.client import AGUIClient

logger = logging.getLogger("agui.slack.handlers")


def _extract_text(raw_text: str) -> str:
    """Remove @mention tags and strip whitespace."""
    return re.sub(r"<@[A-Z0-9]+>", "", raw_text).strip()


def register_handlers(
    app: AsyncApp, client: AGUIClient, preview_base_url: str
):
    @app.command("/agui")
    async def handle_agui(ack, command, say):
        await ack()
        text = command["text"].strip()
        user = command.get("user_name", "unknown")
        logger.info("[슬래시 커맨드] user=%s, text='%s'", user, text)
        await _process_request(text, say)

    @app.event("app_mention")
    async def handle_mention(event, say):
        raw_text = event.get("text", "")
        user = event.get("user", "unknown")
        channel = event.get("channel", "unknown")
        logger.info("[멘션] user=%s, channel=%s, raw='%s'", user, channel, raw_text)

        text = _extract_text(raw_text)
        if not text:
            logger.info("[멘션] 빈 텍스트 → 안내 메시지 전송")
            await say("무엇을 만들까요? 예: `@bot 로그인 폼 만들어줘`")
            return
        logger.info("[멘션] 추출된 텍스트: '%s'", text)
        await _process_request(text, say)

    async def _process_request(text: str, say):
        if text == "list":
            logger.info("[처리] 프로젝트 목록 조회")
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
            logger.info("[처리] 미리보기 요청: %s", pid)
            await say(f"미리보기: {preview_base_url}/preview/{pid}")
            return

        logger.info("[처리] UI 생성 요청: '%s'", text)
        await say(f"UI 생성 중... `{text}`")
        try:
            logger.info("[처리] 백엔드 /api/generate 호출 시작")
            document = await client.generate(text)
            logger.info("[처리] 생성 완료, 프로젝트 저장 중")
            project = await client.create_project(
                name=text[:50], document=document
            )
            logger.info("[처리] 프로젝트 저장 완료: %s", project.get("id", "?"))
            await say(
                f"UI가 생성됐습니다!\n"
                f"미리보기: <{preview_base_url}/preview/{project['id']}|열기>"
            )
        except Exception as e:
            logger.error("[처리] 오류 발생: %s", e, exc_info=True)
            await say(f"오류가 발생했습니다: {e}")
