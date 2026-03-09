from dataclasses import dataclass
import os


@dataclass(frozen=True)
class BotConfig:
    slack_bot_token: str = ""
    slack_signing_secret: str = ""
    backend_url: str = "http://localhost:8000"
    preview_base_url: str = "http://localhost:5173"

    @classmethod
    def from_env(cls) -> "BotConfig":
        return cls(
            slack_bot_token=os.environ.get("SLACK_BOT_TOKEN", ""),
            slack_signing_secret=os.environ.get("SLACK_SIGNING_SECRET", ""),
            backend_url=os.environ.get(
                "AGUI_BACKEND_URL", "http://localhost:8000"
            ),
            preview_base_url=os.environ.get(
                "AGUI_PREVIEW_URL", "http://localhost:5173"
            ),
        )
