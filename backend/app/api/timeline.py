from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import TimelineEvent
from ..api.cases import resolve_case
from ..services.timeline_service import TimelineService

router = APIRouter(prefix="/cases/{case_id}", tags=["Chronological Timeline"])


@router.get("/timeline", response_model=List[TimelineEvent], summary="Get unified chronological event timeline")
def get_case_timeline(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    return TimelineService.get_case_timeline(db, case.id)
