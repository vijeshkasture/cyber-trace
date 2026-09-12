from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Evidence
from ..schemas import CaseIntegrityResponse, SingleIntegrityCheck
from ..api.cases import resolve_case
from ..utils.hashing import calculate_sha256

router = APIRouter(prefix="/cases/{case_id}", tags=["Integrity & Custody"])


@router.get("/integrity", response_model=CaseIntegrityResponse, summary="Verify SHA-256 custody hashes of all evidence in case")
def verify_case_integrity(case_id: str, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    evidences = db.query(Evidence).filter(Evidence.case_id == case.id).all()

    verifications = []
    all_match = True

    for ev in evidences:
        file_path = Path(ev.stored_path)
        if not file_path.exists():
            current_hash = "FILE_MISSING"
            is_match = False
            all_match = False
        else:
            current_hash = calculate_sha256(file_path)
            is_match = (current_hash.lower() == ev.sha256_hash.lower())
            if not is_match:
                all_match = False

        verifications.append(SingleIntegrityCheck(
            evidence_id=ev.id,
            filename=ev.original_filename,
            stored_hash=ev.sha256_hash,
            current_hash=current_hash,
            match=is_match
        ))

    return CaseIntegrityResponse(
        case_id=case.case_number,
        all_match=all_match and len(verifications) > 0,
        verifications=verifications
    )


@router.post("/evidence/{evidence_id}/verify", response_model=SingleIntegrityCheck, summary="Verify SHA-256 for a single evidence file")
def verify_single_evidence(case_id: str, evidence_id: int, db: Session = Depends(get_db)):
    case = resolve_case(db, case_id)
    ev = db.query(Evidence).filter(Evidence.id == evidence_id, Evidence.case_id == case.id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence record not found")

    file_path = Path(ev.stored_path)
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence file missing from disk")

    current_hash = calculate_sha256(file_path)
    is_match = (current_hash.lower() == ev.sha256_hash.lower())

    return SingleIntegrityCheck(
        evidence_id=ev.id,
        filename=ev.original_filename,
        stored_hash=ev.sha256_hash,
        current_hash=current_hash,
        match=is_match
    )
