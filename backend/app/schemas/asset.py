from datetime import datetime

from pydantic import BaseModel


class AssetCreate(BaseModel):
    name: str
    type: str
    file_path: str
    metadata: dict | None = None


class AssetResponse(BaseModel):
    id: str
    name: str
    type: str
    file_path: str
    metadata: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}
