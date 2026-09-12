from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Case, Evidence, Entity, Relationship, RiskScore
from ..schemas import (
    CaseCreate, CaseUpdate, CaseResponse, DashboardStats, RiskEntityItem, TopSuspect
)
from ..services.risk_service import RiskService

router = APIRouter(prefix="/cases", tags=["Cases"])


def resolve_case(db: Session, case_id_or_number: str) -> Case:
    """Finds a case by primary key ID or case_number (e.g. CT-001)."""
    if case_id_or_number.isdigit():
        case = db.query(Case).filter(Case.id == int(case_id_or_number)).first()
        if case:
            return case
    case = db.query(Case).filter(Case.case_number == case_id_or_number).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation case '{case_id_or_number}' not found"
        )
    return case


@router.get("", response_model=List[CaseResponse], summary="List all investigation cases")
def get_cases(db: Session = Depends(get_db)):
    return db.query(Case).order_by(Case.created_at.desc()).all()


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED, summary="Create a new case")
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    existing = db.query(Case).filter(Case.case_number == case_in.case_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Case with number '{case_in.case_number}' already exists"
        )
    case = Case(
        case_number=case_in.case_number,
        title=case_in.title,
        description=case_in.description,
        status="ACTIVE"
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("/{case_id}", response_model=CaseResponse, summary="Get case by ID or Case Number")
def get_case(case_id: str, db: Session = Depends(get_db)):
    return resolve_case(db, case_id)


@router.put("/{case_id}", response_model=CaseResponse, summary="Update case details")
def update_case(case_id: str, case_in: CaseUpdate, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    if case_in.title is not None:
        case.title = case_in.title
    if case_in.description is not None:
        case.description = case_in.description
    if case_in.status is not None:
        case.status = case_in.status
    db.commit()
    db.refresh(case)
    return case


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete case and all associated artifacts")
def delete_case(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    db.delete(case)
    db.commit()
    return None


@router.get("/{case_id}/stats", response_model=DashboardStats, summary="Get dashboard KPI metrics for case")
def get_case_stats(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    c_id = case.id

    raw_records = sum(ev.record_count for ev in db.query(Evidence).filter(Evidence.case_id == c_id).all())
    files_count = db.query(Evidence).filter(Evidence.case_id == c_id).count()
    entities_count = db.query(Entity).filter(Entity.case_id == c_id).count()
    relationships_count = db.query(Relationship).filter(Relationship.case_id == c_id).count()

    scores = db.query(RiskScore).filter(RiskScore.case_id == c_id).all()
    high_risk_count = sum(1 for s in scores if s.score >= 65)
    critical_count = sum(1 for s in scores if s.severity == "CRITICAL")
    high_count = sum(1 for s in scores if s.severity == "HIGH")

    # Determine top suspect
    top_suspect = None
    if scores:
        top_rs = max(scores, key=lambda s: s.score)
        top_ent = db.query(Entity).filter(Entity.id == top_rs.entity_id).first()
        if top_ent:
            top_suspect = TopSuspect(
                id=top_ent.entity_value,
                score=top_rs.score,
                severity=top_rs.severity,
                institution=top_ent.institution or "Banking Network",
                role="Mule Hub" if top_rs.score >= 80 else "Flagged Entity"
            )

    return DashboardStats(
        raw_records=raw_records,
        files_count=files_count,
        entities_count=entities_count,
        relationships_count=relationships_count,
        high_risk_count=high_risk_count,
        critical_count=critical_count,
        high_count=high_count,
        top_suspect=top_suspect
    )


@router.get("/{case_id}/risks", response_model=List[RiskEntityItem], summary="Get risk assessment registry entities")
def get_case_risks(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    # Calculate or retrieve calculated risk scores
    return RiskService.calculate_case_risks(db, case.id)
