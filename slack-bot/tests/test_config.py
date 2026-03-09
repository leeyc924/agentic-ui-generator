import os
from unittest.mock import patch

from bot.config import BotConfig


def test_bot_config_defaults():
    config = BotConfig()
    assert config.slack_bot_token == ""
    assert config.slack_signing_secret == ""
    assert config.backend_url == "http://localhost:8000"
    assert config.preview_base_url == "http://localhost:5173"


def test_bot_config_from_env():
    env = {
        "SLACK_BOT_TOKEN": "xoxb-test-token",
        "SLACK_SIGNING_SECRET": "test-secret",
        "AGUI_BACKEND_URL": "http://backend:9000",
        "AGUI_PREVIEW_URL": "http://preview:4000",
    }
    with patch.dict(os.environ, env, clear=False):
        config = BotConfig.from_env()

    assert config.slack_bot_token == "xoxb-test-token"
    assert config.slack_signing_secret == "test-secret"
    assert config.backend_url == "http://backend:9000"
    assert config.preview_base_url == "http://preview:4000"


def test_bot_config_from_env_uses_defaults():
    env_keys = [
        "SLACK_BOT_TOKEN",
        "SLACK_SIGNING_SECRET",
        "AGUI_BACKEND_URL",
        "AGUI_PREVIEW_URL",
    ]
    cleaned = {k: v for k, v in os.environ.items() if k not in env_keys}
    with patch.dict(os.environ, cleaned, clear=True):
        config = BotConfig.from_env()

    assert config.slack_bot_token == ""
    assert config.backend_url == "http://localhost:8000"


def test_bot_config_is_frozen():
    config = BotConfig()
    try:
        config.backend_url = "http://other"  # type: ignore
        assert False, "Should raise FrozenInstanceError"
    except AttributeError:
        pass
