from datetime import datetime

from pydantic import BaseModel


class WidgetTemplateCreate(BaseModel):
    name: str
    category: str | None = None
    template: dict


class WidgetTemplateResponse(BaseModel):
    id: str
    name: str
    category: str | None
    template: dict
    created_at: datetime

    model_config = {"from_attributes": True}
