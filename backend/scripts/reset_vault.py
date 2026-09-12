"""Clear all investigation cases, evidence files, and generated reports from the local vault."""
import shutil
from pathlib import Path

from backend.app.database import SessionLocal, engine, Base
from backend.app.models import Case
from backend.app.utils.file_utils import UPLOADS_DIR, REPORTS_DIR, ensure_directories

db = SessionLocal()
try:
    cases = db.query(Case).all()
    count = len(cases)
    for case in cases:
        db.delete(case)
    db.commit()
    print(f"Deleted {count} case(s) from SQLite.")
finally:
    db.close()

for folder in (UPLOADS_DIR, REPORTS_DIR):
    path = Path(folder)
    if path.exists():
        shutil.rmtree(path)
        print(f"Removed {path}")

ensure_directories()
Base.metadata.create_all(bind=engine)
print("Vault reset. Uploads and reports directories are empty.")
