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


SAMPLE_TOKEN = {
    "name": "Brand Colors",
    "tokens": {"primary": "#ff0000", "secondary": "#00ff00"},
}


def test_create_token(client):
    response = client.post("/api/tokens", json=SAMPLE_TOKEN)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Brand Colors"
    assert data["tokens"] == {"primary": "#ff0000", "secondary": "#00ff00"}
    assert "id" in data
    assert "created_at" in data


def test_list_tokens(client):
    client.post("/api/tokens", json=SAMPLE_TOKEN)
    client.post(
        "/api/tokens",
        json={"name": "Spacing", "tokens": {"sm": 4, "md": 8}},
    )

    response = client.get("/api/tokens")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_token(client):
    create_response = client.post("/api/tokens", json=SAMPLE_TOKEN)
    token_id = create_response.json()["id"]

    response = client.get(f"/api/tokens/{token_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == token_id
    assert data["name"] == "Brand Colors"
    assert data["tokens"] == {"primary": "#ff0000", "secondary": "#00ff00"}


def test_update_token(client):
    create_response = client.post("/api/tokens", json=SAMPLE_TOKEN)
    token_id = create_response.json()["id"]

    response = client.put(
        f"/api/tokens/{token_id}",
        json={"name": "Updated Colors"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Colors"
    assert data["tokens"] == {"primary": "#ff0000", "secondary": "#00ff00"}


def test_delete_token(client):
    create_response = client.post("/api/tokens", json=SAMPLE_TOKEN)
    token_id = create_response.json()["id"]

    response = client.delete(f"/api/tokens/{token_id}")
    assert response.status_code == 204

    get_response = client.get(f"/api/tokens/{token_id}")
    assert get_response.status_code == 404


def test_get_nonexistent_token(client):
    response = client.get("/api/tokens/fake-id-that-does-not-exist")
    assert response.status_code == 404
