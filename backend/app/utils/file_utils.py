import os
import re
from pathlib import Path

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}

# Base storage paths
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORAGE_DIR = os.path.join(BACKEND_DIR, "storage")
UPLOADS_DIR = os.path.join(STORAGE_DIR, "uploads")
REPORTS_DIR = os.path.join(STORAGE_DIR, "reports")


def ensure_directories():
    """Ensures that base uploads and reports directories exist."""
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)


def get_case_upload_dir(case_number: str) -> Path:
    """Returns the dedicated upload folder for a specific case."""
    safe_case = re.sub(r'[^a-zA-Z0-9_\-]', '_', str(case_number))
    case_dir = Path(UPLOADS_DIR) / safe_case / "files"
    case_dir.mkdir(parents=True, exist_ok=True)
    return case_dir


def is_allowed_file(filename: str) -> bool:
    """Checks if the uploaded file extension is allowed."""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


def get_file_type(filename: str) -> str:
    """Derives normalized file type from extension."""
    ext = Path(filename).suffix.lower()
    if ext == ".csv":
        return "CSV"
    elif ext in [".xlsx", ".xls"]:
        return "EXCEL"
    elif ext == ".json":
        return "JSON"
    return "UNKNOWN"


def format_file_size(size_bytes: int) -> str:
    """Formats bytes into human-readable size string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
