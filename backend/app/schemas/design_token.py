from datetime import datetime

from pydantic import BaseModel


class DesignTokenCreate(BaseModel):
    name: str
    tokens: dict


class DesignTokenUpdate(BaseModel):
    name: str | None = None
    tokens: dict | None = None


class DesignTokenResponse(BaseModel):
    id: str
    name: str
    tokens: dict
    created_at: datetime

    model_config = {"from_attributes": True}
