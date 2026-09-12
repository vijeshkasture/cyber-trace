import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..api.cases import resolve_case
from ..services.report_service import ReportService
from ..utils.file_utils import REPORTS_DIR

router = APIRouter(prefix="/cases/{case_id}", tags=["Forensic Reports"])


@router.post("/report", summary="Generate judicial forensic PDF investigation report")
def generate_report(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    try:
        pdf_path = ReportService.generate_case_pdf(db, case.id)
        return {
            "case_id": case.case_number,
            "status": "GENERATED",
            "filename": Path(pdf_path).name,
            "download_url": f"/cases/{case.case_number}/report"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(e)}"
        )


@router.get("/report", summary="Download judicial forensic PDF report")
def download_report(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    pdf_path = os.path.join(REPORTS_DIR, f"{case.case_number}.pdf")

    # If report has not been generated yet, generate it now
    if not os.path.exists(pdf_path):
        pdf_path = ReportService.generate_case_pdf(db, case.id)

    return FileResponse(
        path=pdf_path,
        filename=f"CyberTrace_{case.case_number}_Forensic_Dossier.pdf",
        media_type="application/pdf"
    )
