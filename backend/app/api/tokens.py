from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DesignToken
from app.schemas.design_token import (
    DesignTokenCreate,
    DesignTokenResponse,
    DesignTokenUpdate,
)

router = APIRouter(prefix="/api/tokens", tags=["tokens"])


@router.get("", response_model=list[DesignTokenResponse])
def list_tokens(db: Session = Depends(get_db)):
    stmt = select(DesignToken).order_by(DesignToken.created_at.desc())
    tokens = db.scalars(stmt).all()
    return tokens


@router.post(
    "", response_model=DesignTokenResponse, status_code=status.HTTP_201_CREATED
)
def create_token(body: DesignTokenCreate, db: Session = Depends(get_db)):
    token = DesignToken(name=body.name, tokens=body.tokens)
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


@router.get("/{token_id}", response_model=DesignTokenResponse)
def get_token(token_id: str, db: Session = Depends(get_db)):
    token = db.get(DesignToken, token_id)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DesignToken {token_id} not found",
        )
    return token


@router.put("/{token_id}", response_model=DesignTokenResponse)
def update_token(
    token_id: str, body: DesignTokenUpdate, db: Session = Depends(get_db)
):
    token = db.get(DesignToken, token_id)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DesignToken {token_id} not found",
        )
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(token, field, value)
    db.commit()
    db.refresh(token)
    return token


@router.delete("/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_token(token_id: str, db: Session = Depends(get_db)):
    token = db.get(DesignToken, token_id)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DesignToken {token_id} not found",
        )
    db.delete(token)
    db.commit()
