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


SAMPLE_TEMPLATE = {
    "name": "Button",
    "category": "inputs",
    "template": {"type": "button", "props": {"label": "Click me"}},
}


def test_create_template(client):
    response = client.post("/api/templates", json=SAMPLE_TEMPLATE)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Button"
    assert data["category"] == "inputs"
    assert data["template"] == {"type": "button", "props": {"label": "Click me"}}
    assert "id" in data
    assert "created_at" in data


def test_create_template_without_category(client):
    template = {
        "name": "Custom Widget",
        "template": {"type": "custom"},
    }
    response = client.post("/api/templates", json=template)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Custom Widget"
    assert data["category"] is None


def test_list_templates(client):
    client.post("/api/templates", json=SAMPLE_TEMPLATE)
    client.post(
        "/api/templates",
        json={
            "name": "Card",
            "category": "layout",
            "template": {"type": "card"},
        },
    )

    response = client.get("/api/templates")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_delete_template(client):
    create_response = client.post("/api/templates", json=SAMPLE_TEMPLATE)
    template_id = create_response.json()["id"]

    response = client.delete(f"/api/templates/{template_id}")
    assert response.status_code == 204

    get_response = client.get("/api/templates")
    assert len(get_response.json()) == 0


def test_delete_nonexistent_template(client):
    response = client.delete("/api/templates/fake-id-that-does-not-exist")
    assert response.status_code == 404
