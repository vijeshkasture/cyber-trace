import os
import tempfile
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.utils.hashing import calculate_sha256, calculate_bytes_sha256
from backend.app.services.normalization_service import NormalizationService
from backend.app.models import Case, Evidence

# Create an isolated in-memory SQLite database using StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"
engine_test = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


def test_hashing_utils():
    """Verifies SHA-256 computation matches known test vector."""
    data = b"CyberTrace Forensic Test"
    expected = "710d211b4c4983519ca02923ea3cf2cf4166b7c41862ae82f4a7de70015d9878"
    computed = calculate_bytes_sha256(data)
    assert computed.lower() == expected.lower()

    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(data)
        tf_path = tf.name
    try:
        assert calculate_sha256(tf_path).lower() == expected.lower()
    finally:
        os.unlink(tf_path)


def test_normalization_rules():
    """Verifies entity normalizers preserve original and compute canonical."""
    # Phone
    orig, norm = NormalizationService.normalize_phone("+91-98440-12901")
    assert norm == "9844012901"
    assert orig == "+91-98440-12901"

    # MAC
    orig, norm = NormalizationService.normalize_mac("00-1a-2b-3c-4d-5e")
    assert norm == "00:1A:2B:3C:4D:5E"

    # UPI
    orig, norm = NormalizationService.normalize_upi("SuspectMule@OkAxis ")
    assert norm == "suspectmule@okaxis"

    # IP
    orig, norm = NormalizationService.normalize_ip(" 198.51.100.4 ")
    assert norm == "198.51.100.4"


def test_case_crud():
    """Verifies Case creation, listing, retrieval, update, and deletion."""
    # 1. Create case
    res = client.post("/cases", json={
        "case_number": "CT-TEST-01",
        "title": "Test Case Title",
        "description": "Test Description"
    })
    assert res.status_code == 201
    case_data = res.json()
    assert case_data["case_number"] == "CT-TEST-01"
    case_id = case_data["id"]

    # 2. List cases
    res = client.get("/cases")
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 3. Retrieve single case by ID and by Case Number
    res = client.get(f"/cases/{case_id}")
    assert res.status_code == 200
    assert res.json()["case_number"] == "CT-TEST-01"

    res_num = client.get("/cases/CT-TEST-01")
    assert res_num.status_code == 200
    assert res_num.json()["id"] == case_id

    # 4. Update case
    res = client.put("/cases/CT-TEST-01", json={"title": "Updated Title"})
    assert res.status_code == 200
    assert res.json()["title"] == "Updated Title"

    # 5. Delete case
    res = client.delete(f"/cases/{case_id}")
    assert res.status_code == 204
    assert client.get(f"/cases/{case_id}").status_code == 404


def test_empty_state():
    """Verifies empty case returns zero counts and empty lists without mock data."""
    res = client.post("/cases", json={
        "case_number": "CT-EMPTY",
        "title": "Empty Investigation"
    })
    assert res.status_code == 201

    # Stats
    res_stats = client.get("/cases/CT-EMPTY/stats")
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert stats["raw_records"] == 0
    assert stats["files_count"] == 0
    assert stats["entities_count"] == 0
    assert stats["relationships_count"] == 0
    assert stats["high_risk_count"] == 0
    assert stats["top_suspect"] is None

    # Risks
    res_risks = client.get("/cases/CT-EMPTY/risks")
    assert res_risks.status_code == 200
    assert res_risks.json() == []

    # Graph
    res_graph = client.get("/cases/CT-EMPTY/graph")
    assert res_graph.status_code == 200
    assert res_graph.json()["nodes"] == []
    assert res_graph.json()["edges"] == []


def test_end_to_end_analysis_and_report():
    """
    Comprehensive End-to-End Test:
    Create Case -> Upload Evidence -> Process Case -> Stats -> Risks -> Graph -> Timeline -> Report
    """
    # 1. Create Case
    res = client.post("/cases", json={
        "case_number": "CT-E2E",
        "title": "End-to-End Mule Investigation",
        "description": "Validation test case"
    })
    assert res.status_code == 201

    # 2. Upload CSV Evidence
    csv_data = (
        "transaction_id,source_account,target_account,amount,timestamp,channel\n"
        "TX1,VictimAcct,MuleHub99,25000.0,2024-02-14 09:12:00,UPI\n"
        "TX2,MuleHub99,MuleCashout44,22000.0,2024-02-14 09:13:20,UPI\n"
        "TX3,MuleCashout44,ATM-WDL,20000.0,2024-02-14 09:16:00,ATM\n"
    )
    res_upload = client.post(
        "/cases/CT-E2E/evidence",
        files={"file": ("transactions.csv", csv_data.encode("utf-8"), "text/csv")}
    )
    assert res_upload.status_code == 201
    ev_data = res_upload.json()
    assert ev_data["original_filename"] == "transactions.csv"
    assert ev_data["record_count"] == 3
    assert len(ev_data["sha256_hash"]) == 64

    # 3. Verify SHA-256 Custody
    res_integ = client.get("/cases/CT-E2E/integrity")
    assert res_integ.status_code == 200
    integ = res_integ.json()
    assert integ["all_match"] is True
    assert len(integ["verifications"]) == 1
    assert integ["verifications"][0]["match"] is True

    # 4. Process Case
    res_proc = client.post("/cases/CT-E2E/process")
    assert res_proc.status_code == 200
    proc = res_proc.json()
    assert proc["status"] == "SUCCESS"
    assert proc["records_processed"] == 3
    assert proc["entities_identified"] >= 3
    assert proc["relationships_identified"] >= 2

    # 5. Fetch Stats
    res_stats = client.get("/cases/CT-E2E/stats")
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert stats["raw_records"] == 3
    assert stats["files_count"] == 1
    assert stats["top_suspect"] is not None
    assert stats["top_suspect"]["id"] == "MuleHub99"

    # 6. Fetch Risk Entities Registry
    res_risks = client.get("/cases/CT-E2E/risks")
    assert res_risks.status_code == 200
    risks = res_risks.json()
    assert len(risks) >= 3
    assert risks[0]["id"] == "MuleHub99"
    assert risks[0]["score"] >= 65
    assert any("Rapid fund forwarding" in f for f in risks[0]["factors"])

    # 7. Fetch Entity Dossier
    res_dossier = client.get("/cases/CT-E2E/entities/MuleHub99")
    assert res_dossier.status_code == 200
    dossier = res_dossier.json()
    assert dossier["id"] == "MuleHub99"
    assert len(dossier["weights"]) > 0
    assert len(dossier["topology"]) > 0

    # 8. Fetch Detected Anomalies
    res_anom = client.get("/cases/CT-E2E/anomalies")
    assert res_anom.status_code == 200
    anomalies = res_anom.json()
    assert len(anomalies) >= 1
    assert "Rapid Fund Forwarding" in anomalies[0]["title"]

    # 9. Fetch Graph & Timeline
    res_graph = client.get("/cases/CT-E2E/graph")
    assert res_graph.status_code == 200
    assert len(res_graph.json()["nodes"]) >= 3
    assert len(res_graph.json()["edges"]) >= 2

    res_timeline = client.get("/cases/CT-E2E/timeline")
    assert res_timeline.status_code == 200
    assert len(res_timeline.json()) >= 3

    # 10. Generate PDF Investigation Report
    res_rep = client.post("/cases/CT-E2E/report")
    assert res_rep.status_code == 200
    assert res_rep.json()["status"] == "GENERATED"

    res_down = client.get("/cases/CT-E2E/report")
    assert res_down.status_code == 200
    assert res_down.headers["content-type"] == "application/pdf"
    assert len(res_down.content) > 1000
