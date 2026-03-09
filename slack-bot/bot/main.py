import logging

from dotenv import load_dotenv
from slack_bolt.async_app import AsyncApp

from bot.config import BotConfig

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("agui.slack")

from bot.client import AGUIClient
from bot.handlers import register_handlers


def create_app(config: BotConfig | None = None) -> AsyncApp:
    if config is None:
        config = BotConfig.from_env()

    logger.info("Slack Bot 시작")
    logger.info("  Backend URL: %s", config.backend_url)
    logger.info("  Preview URL: %s", config.preview_base_url)
    logger.info("  Token: %s...", config.slack_bot_token[:15] if config.slack_bot_token else "미설정")

    app = AsyncApp(
        token=config.slack_bot_token,
        signing_secret=config.slack_signing_secret,
    )
    client = AGUIClient(base_url=config.backend_url)
    register_handlers(app, client, config.preview_base_url)
    return app


if __name__ == "__main__":
    config = BotConfig.from_env()
    app = create_app(config)
    logger.info("Slack Bot listening on port 3000 (path: /api/slack/events)")
    app.start(port=3000, path="/api/slack/events")
