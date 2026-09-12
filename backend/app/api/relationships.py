from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Relationship, Anomaly
from ..schemas import AnomalyItem
from ..api.cases import resolve_case

router = APIRouter(prefix="/cases/{case_id}", tags=["Relationships & Anomalies"])


@router.get("/relationships", summary="List correlated relationships for a case")
def get_case_relationships(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    rels = db.query(Relationship).filter(Relationship.case_id == case.id).all()
    from ..models import Entity, Evidence
    entities = {e.id: e for e in db.query(Entity).filter(Entity.case_id == case.id).all()}
    evidences = {ev.id: ev for ev in db.query(Evidence).filter(Evidence.case_id == case.id).all()}

    output = []
    for r in rels:
        src = entities.get(r.source_entity_id)
        tgt = entities.get(r.target_entity_id)
        ev = evidences.get(r.evidence_id)
        output.append({
            "id": r.id,
            "case_id": r.case_id,
            "source_entity_id": r.source_entity_id,
            "target_entity_id": r.target_entity_id,
            "source": src.entity_value if src else str(r.source_entity_id),
            "target": tgt.entity_value if tgt else str(r.target_entity_id),
            "source_type": src.entity_type if src else "UNKNOWN",
            "target_type": tgt.entity_type if tgt else "UNKNOWN",
            "relationship_type": r.relationship_type,
            "confidence": r.confidence,
            "evidence_id": r.evidence_id,
            "evidence_name": ev.original_filename if ev else "System Correlated",
            "reason": r.reason,
            "timestamp": r.timestamp,
            "metadata_json": r.metadata_json
        })
    return output


@router.get("/anomalies", response_model=List[AnomalyItem], summary="List detected graph anomalies and behavioral findings")
def get_case_anomalies(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    return db.query(Anomaly).filter(Anomaly.case_id == case.id).order_by(Anomaly.id.asc()).all()
