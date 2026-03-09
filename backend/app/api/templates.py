from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WidgetTemplate
from app.schemas.widget_template import WidgetTemplateCreate, WidgetTemplateResponse

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[WidgetTemplateResponse])
def list_templates(db: Session = Depends(get_db)):
    stmt = select(WidgetTemplate).order_by(WidgetTemplate.created_at.desc())
    templates = db.scalars(stmt).all()
    return templates


@router.post(
    "", response_model=WidgetTemplateResponse, status_code=status.HTTP_201_CREATED
)
def create_template(body: WidgetTemplateCreate, db: Session = Depends(get_db)):
    template = WidgetTemplate(
        name=body.name,
        category=body.category,
        template=body.template,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_id: str, db: Session = Depends(get_db)):
    template = db.get(WidgetTemplate, template_id)
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"WidgetTemplate {template_id} not found",
        )
    db.delete(template)
    db.commit()
