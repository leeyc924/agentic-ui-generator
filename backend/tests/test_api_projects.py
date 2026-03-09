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


SAMPLE_PROJECT = {
    "name": "Test Project",
    "document": {"pages": [], "version": 1},
}


def test_create_project(client):
    response = client.post("/api/projects", json=SAMPLE_PROJECT)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["document"] == {"pages": [], "version": 1}
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_list_projects(client):
    client.post("/api/projects", json=SAMPLE_PROJECT)
    client.post("/api/projects", json={"name": "Second", "document": {"v": 2}})

    response = client.get("/api/projects")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_project(client):
    create_response = client.post("/api/projects", json=SAMPLE_PROJECT)
    project_id = create_response.json()["id"]

    response = client.get(f"/api/projects/{project_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == project_id
    assert data["name"] == "Test Project"
    assert data["document"] == {"pages": [], "version": 1}


def test_update_project(client):
    create_response = client.post("/api/projects", json=SAMPLE_PROJECT)
    project_id = create_response.json()["id"]

    response = client.put(
        f"/api/projects/{project_id}",
        json={"name": "Updated Name"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["document"] == {"pages": [], "version": 1}


def test_delete_project(client):
    create_response = client.post("/api/projects", json=SAMPLE_PROJECT)
    project_id = create_response.json()["id"]

    response = client.delete(f"/api/projects/{project_id}")
    assert response.status_code == 204

    get_response = client.get(f"/api/projects/{project_id}")
    assert get_response.status_code == 404


def test_get_nonexistent_project(client):
    response = client.get("/api/projects/fake-id-that-does-not-exist")
    assert response.status_code == 404
