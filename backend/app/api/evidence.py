import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Evidence
from ..schemas import EvidenceResponse
from ..api.cases import resolve_case
from ..utils.file_utils import get_case_upload_dir, is_allowed_file, get_file_type
from ..utils.hashing import calculate_sha256
from ..services.parser_service import ParserService

router = APIRouter(prefix="/cases/{case_id}/evidence", tags=["Evidence"])


@router.get("", response_model=List[EvidenceResponse], summary="List all evidence files for a case")
def list_case_evidence(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    return db.query(Evidence).filter(Evidence.case_id == case.id).order_by(Evidence.upload_timestamp.desc()).all()


@router.post("", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED, summary="Upload new evidence file")
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    case = resolve_case(db, case_id)

    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{Path(file.filename).suffix}'. Allowed: .csv, .xlsx, .xls, .json"
        )

    # Prepare case directory
    upload_dir = get_case_upload_dir(case.case_number)
    safe_filename = Path(file.filename).name
    dest_path = upload_dir / safe_filename

    # If file exists, ensure unique name to avoid accidental overwrites
    counter = 1
    stem = dest_path.stem
    suffix = dest_path.suffix
    while dest_path.exists():
        dest_path = upload_dir / f"{stem}_{counter}{suffix}"
        counter += 1

    # Save file to disk
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Calculate real SHA-256
    sha256_val = calculate_sha256(dest_path)
    file_size = dest_path.stat().st_size
    file_type = get_file_type(dest_path.name)

    # Initial parse for record count
    record_count = 0
    try:
        _, record_count = ParserService.parse_file(dest_path)
    except Exception:
        record_count = 0

    evidence = Evidence(
        case_id=case.id,
        filename=dest_path.name,
        original_filename=file.filename,
        file_type=file_type,
        file_size=file_size,
        stored_path=str(dest_path),
        sha256_hash=sha256_val,
        processing_status="UPLOADED",
        record_count=record_count
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return evidence
