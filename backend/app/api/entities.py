from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Entity
from ..schemas import RiskEntityItem
from ..api.cases import resolve_case
from ..services.risk_service import RiskService

router = APIRouter(prefix="/cases/{case_id}/entities", tags=["Entities & Dossier"])


@router.get("", response_model=List[RiskEntityItem], summary="List all analyzed entities for a case")
def list_case_entities(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    return RiskService.calculate_case_risks(db, case.id)


@router.get("/{entity_id}", response_model=RiskEntityItem, summary="Get full forensic dossier for a specific entity")
def get_entity_dossier(case_id: str, entity_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    risks = RiskService.calculate_case_risks(db, case.id)

    # Match by entity_value or normalized_value
    matched = None
    clean_search = entity_id.strip().lower()
    for item in risks:
        if item.id.lower() == clean_search or item.identifier.lower() == clean_search:
            matched = item
            break

    if not matched:
        # Check if entity exists in database without calculated score yet
        ent = db.query(Entity).filter(
            Entity.case_id == case.id,
            (Entity.entity_value == entity_id) | (Entity.normalized_value == entity_id)
        ).first()
        if not ent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entity '{entity_id}' not found in case {case.case_number}"
            )
        matched = RiskEntityItem(
            id=ent.entity_value,
            type=ent.entity_type,
            institution=ent.institution or "",
            identifier=ent.identifier or ent.entity_value,
            score=0,
            severity="LOW",
            factors=["Not yet analyzed"],
            nodes=0,
            lastActive=ent.last_seen or "",
            firstSeen=ent.first_seen or "",
            weights=[],
            topology=[],
            sources=[]
        )

    return matched
