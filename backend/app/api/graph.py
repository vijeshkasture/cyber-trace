from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import GraphData
from ..api.cases import resolve_case
from ..services.graph_service import GraphService

router = APIRouter(prefix="/cases/{case_id}", tags=["Network Graph"])


@router.get("/graph", response_model=GraphData, summary="Get network topology graph (nodes and edges)")
def get_case_graph(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    return GraphService.get_case_graph(db, case.id)
