from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Asset
from app.schemas.asset import AssetCreate, AssetResponse

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("", response_model=list[AssetResponse])
def list_assets(db: Session = Depends(get_db)):
    stmt = select(Asset).order_by(Asset.created_at.desc())
    assets = db.scalars(stmt).all()
    return [_asset_to_response(a) for a in assets]


@router.post(
    "", response_model=AssetResponse, status_code=status.HTTP_201_CREATED
)
def create_asset(body: AssetCreate, db: Session = Depends(get_db)):
    asset = Asset(
        name=body.name,
        type=body.type,
        file_path=body.file_path,
        asset_metadata=body.metadata,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return _asset_to_response(asset)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.get(Asset, asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset {asset_id} not found",
        )
    db.delete(asset)
    db.commit()


def _asset_to_response(asset: Asset) -> dict:
    return {
        "id": asset.id,
        "name": asset.name,
        "type": asset.type,
        "file_path": asset.file_path,
        "metadata": asset.asset_metadata,
        "created_at": asset.created_at,
    }
