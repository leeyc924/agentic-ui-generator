from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./agui.db"
    anthropic_api_key: str = ""
    assets_dir: Path = Path("./assets")
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = {"env_prefix": "AGUI_", "env_file": ".env"}


settings = Settings()
