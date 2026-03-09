from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.assets import router as assets_router
from app.api.generate import router as generate_router
from app.api.logs import router as logs_router, setup_log_streaming
from app.api.projects import router as projects_router
from app.api.templates import router as templates_router
from app.api.tokens import router as tokens_router
from app.config import settings
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="A2UI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


setup_log_streaming()

app.include_router(assets_router)
app.include_router(generate_router)
app.include_router(logs_router)
app.include_router(projects_router)
app.include_router(templates_router)
app.include_router(tokens_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
