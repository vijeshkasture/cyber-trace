import hashlib
from pathlib import Path


def calculate_sha256(file_path: str | Path, block_size: int = 65536) -> str:
    """
    Computes the real cryptographic SHA-256 hash of a file on disk.
    Reads in streaming blocks to handle large files memory-efficiently.
    """
    sha256 = hashlib.sha256()
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"File not found for hashing: {file_path}")

    with open(path, "rb") as f:
        for block in iter(lambda: f.read(block_size), b""):
            sha256.update(block)
    return sha256.hexdigest()


def calculate_bytes_sha256(data: bytes) -> str:
    """Computes SHA-256 of raw bytes."""
    return hashlib.sha256(data).hexdigest()
