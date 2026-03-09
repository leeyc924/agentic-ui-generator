from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    document: dict


class ProjectUpdate(BaseModel):
    name: str | None = None
    document: dict | None = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    document: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
