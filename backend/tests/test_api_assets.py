import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import Asset, DesignToken, Project, WidgetTemplate  # noqa: F401
from app.main import app

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture()
def client():
    engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


SAMPLE_ASSET = {
    "name": "Logo",
    "type": "image",
    "file_path": "/uploads/logo.png",
    "metadata": {"width": 200, "height": 100},
}


def test_create_asset(client):
    response = client.post("/api/assets", json=SAMPLE_ASSET)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Logo"
    assert data["type"] == "image"
    assert data["file_path"] == "/uploads/logo.png"
    assert data["metadata"] == {"width": 200, "height": 100}
    assert "id" in data
    assert "created_at" in data


def test_create_asset_without_metadata(client):
    asset = {
        "name": "Icon",
        "type": "icon",
        "file_path": "/uploads/icon.svg",
    }
    response = client.post("/api/assets", json=asset)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Icon"
    assert data["metadata"] is None


def test_list_assets(client):
    client.post("/api/assets", json=SAMPLE_ASSET)
    client.post(
        "/api/assets",
        json={
            "name": "Banner",
            "type": "image",
            "file_path": "/uploads/banner.jpg",
        },
    )

    response = client.get("/api/assets")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_delete_asset(client):
    create_response = client.post("/api/assets", json=SAMPLE_ASSET)
    asset_id = create_response.json()["id"]

    response = client.delete(f"/api/assets/{asset_id}")
    assert response.status_code == 204

    get_response = client.get("/api/assets")
    assert len(get_response.json()) == 0


def test_delete_nonexistent_asset(client):
    response = client.delete("/api/assets/fake-id-that-does-not-exist")
    assert response.status_code == 404
