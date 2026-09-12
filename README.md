# CyberTrace AI — Forensic Intelligence Backend

CyberTrace AI is an offline-first cyber-fraud evidentiary analysis, entity extraction, cryptographic chain-of-custody, topological graph correlation, and judicial reporting platform.

---

## Workspace Structure

```
cyber/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI endpoint routers (cases, evidence, integrity, analysis, etc.)
│   │   ├── services/        # Business logic & forensic pipelines (entity, risk, graph, reports)
│   │   ├── storage/         # Local file repository for evidence uploads and generated PDFs
│   │   ├── utils/           # Utility functions (SHA-256 hashing, validators, file utils)
│   │   ├── database.py      # SQLite connection & SQLAlchemy declarative base
│   │   ├── main.py          # FastAPI application entrypoint and route assembly
│   │   ├── models.py        # SQLAlchemy ORM schemas
│   │   └── schemas.py       # Pydantic data schemas and validation
│   ├── tests/
│   │   └── test_backend.py  # End-to-end backend tests with isolated in-memory DB
│   └── cybertrace.db        # Primary SQLite evidentiary database
├── pytest.ini               # Pytest configuration with pythonpath configured
├── requirements.txt         # Backend Python dependencies
├── .gitignore               # Ignored cache, virtual environment, and system files
└── README.md                # Project architecture and quickstart guide
```

---

## Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

The vault starts empty. Create cases and upload evidence through the API or the React workstation. Do not seed mock investigation data.

### 2. Run Backend API Server
```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Health: `http://127.0.0.1:8000/`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc UI: `http://127.0.0.1:8000/redoc`

### 3. Run Automated Tests
```bash
pytest
```
