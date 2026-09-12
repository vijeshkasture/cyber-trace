from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Officer
from ..schemas import OfficerLogin, OfficerRegister, OfficerResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = "cybertrace-demo-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60
DEMO_OFFICER_ID = "user123"
DEMO_OFFICER_PASSWORD = "userpass123"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str) -> str:
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_officer(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Officer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        officer_id: Optional[str] = payload.get("sub")
        if officer_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    officer = db.query(Officer).filter(Officer.officer_id == officer_id).first()
    if officer is None or officer.is_active != "ACTIVE":
        raise credentials_exception
    return officer


@router.post("/register", response_model=OfficerResponse, status_code=status.HTTP_201_CREATED)
def register_officer(payload: OfficerRegister, db: Session = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing_officer = db.query(Officer).filter(Officer.officer_id == payload.officer_id).first()
    if existing_officer:
        raise HTTPException(status_code=400, detail="Officer ID already exists")

    existing_email = db.query(Officer).filter(Officer.email == payload.email.lower()).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    officer = Officer(
        full_name=payload.full_name.strip(),
        officer_id=payload.officer_id.strip(),
        email=payload.email.lower().strip(),
        department=payload.department.strip(),
        password_hash=hash_password(payload.password),
        is_active="ACTIVE"
    )
    db.add(officer)
    db.commit()
    db.refresh(officer)
    return officer


def ensure_demo_officer(db: Session) -> Officer:
    officer = db.query(Officer).filter(Officer.officer_id == DEMO_OFFICER_ID).first()
    if officer is None:
        officer = Officer(
            full_name="Demo Officer",
            officer_id=DEMO_OFFICER_ID,
            email="demo.officer@cybertrace.local",
            department="Demo Unit",
            password_hash=hash_password(DEMO_OFFICER_PASSWORD),
            is_active="ACTIVE"
        )
        db.add(officer)
        db.commit()
        db.refresh(officer)
    return officer


@router.post("/login", response_model=TokenResponse)
def login_officer(payload: OfficerLogin, db: Session = Depends(get_db)):
    officer = db.query(Officer).filter(Officer.officer_id == payload.officer_id.strip()).first()
    if officer is None and payload.officer_id.strip() == DEMO_OFFICER_ID and payload.password == DEMO_OFFICER_PASSWORD:
        officer = ensure_demo_officer(db)

    if not officer or not verify_password(payload.password, officer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid officer ID or password"
        )

    if officer.is_active != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Officer account is inactive")

    token = create_access_token(officer.officer_id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=OfficerResponse)
def get_my_profile(officer: Officer = Depends(get_current_officer)):
    return officer
