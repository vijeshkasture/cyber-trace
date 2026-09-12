import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Case, Evidence, Entity, Relationship, RiskScore, Anomaly
from ..schemas import ProcessCaseResult
from ..api.cases import resolve_case
from ..services.parser_service import ParserService
from ..services.entity_service import EntityService
from ..services.relationship_service import RelationshipService
from ..services.pattern_service import PatternService
from ..services.risk_service import RiskService

router = APIRouter(prefix="/cases/{case_id}", tags=["Analysis & Processing"])


@router.post("/process", response_model=ProcessCaseResult, summary="Execute full forensic analysis pipeline across case evidence")
def process_case(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    start_time = time.time()

    evidence_files = db.query(Evidence).filter(Evidence.case_id == case.id).all()
    if not evidence_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot run analysis: No evidence files uploaded for this case."
        )

    records_processed = 0
    files_processed = 0

    # 1. Parse each file and extract entities & transactions
    for ev in evidence_files:
        try:
            records, count = ParserService.parse_file(ev.stored_path)
            ev.record_count = count
            ev.processing_status = "PARSED"
            db.flush()

            EntityService.extract_from_records(db, case.id, ev, records)
            records_processed += count
            files_processed += 1
        except Exception as e:
            ev.processing_status = "ERROR"
            db.flush()
            continue

    # 2. Correlate relationships (shared IMEI, shared IP, calls, transactions)
    RelationshipService.correlate_case_relationships(db, case.id)

    # 3. Detect graph anomalies (rapid forwarding, multi-hop chains, collusion)
    detected_anomalies = PatternService.detect_patterns(db, case.id)

    # 4. Formulate explainable risk scores
    risk_entities = RiskService.calculate_case_risks(db, case.id)

    # 5. Update case status
    case.status = "ANALYZED"
    db.commit()

    total_entities = db.query(Entity).filter(Entity.case_id == case.id).count()
    total_rels = db.query(Relationship).filter(Relationship.case_id == case.id).count()
    high_risk = sum(1 for re in risk_entities if re.score >= 65)
    duration = round(time.time() - start_time, 3)

    return ProcessCaseResult(
        case_id=case.case_number,
        status="SUCCESS",
        files_processed=files_processed,
        records_processed=records_processed,
        entities_identified=total_entities,
        relationships_identified=total_rels,
        high_risk_entities=high_risk,
        anomalies_detected=len(detected_anomalies),
        processing_time_seconds=duration
    )
