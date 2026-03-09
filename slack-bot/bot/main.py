from slack_bolt.async_app import AsyncApp

from bot.config import BotConfig
from bot.client import AGUIClient
from bot.handlers import register_handlers


def create_app(config: BotConfig | None = None) -> AsyncApp:
    if config is None:
        config = BotConfig.from_env()
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
    app.start(port=3000)
