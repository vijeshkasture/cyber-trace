import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base
from .utils.file_utils import ensure_directories, STORAGE_DIR
from .api import (
    cases,
    evidence,
    integrity,
    analysis,
    entities,
    relationships,
    graph,
    timeline,
    reports
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure storage directories and database tables exist on startup
    ensure_directories()
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CyberTrace AI — Forensic Intelligence Engine",
    description="Offline-first cyber-fraud evidentiary analysis, entity extraction, cryptographic chain-of-custody, topological graph correlation, and judicial reporting platform.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development (Vite, React, file:// / local browser access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount storage directory for direct file inspection if needed
if os.path.exists(STORAGE_DIR):
    app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")

# Register API Routers
app.include_router(cases.router)
app.include_router(evidence.router)
app.include_router(integrity.router)
app.include_router(analysis.router)
app.include_router(entities.router)
app.include_router(relationships.router)
app.include_router(graph.router)
app.include_router(timeline.router)
app.include_router(reports.router)


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ONLINE",
        "system": "CyberTrace AI Forensic Vault",
        "version": "1.0.0",
        "database": "SQLite (cybertrace.db)",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "ui": "/ui"
    }


@app.get("/ui", tags=["Frontend"])
def serve_ui():
    return {
        "status": "READY_FOR_REBUILD",
        "message": "Frontend files have been cleared for clean rebuild from scratch. Please use /docs for interactive API exploration.",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
