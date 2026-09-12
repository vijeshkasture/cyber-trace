import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from .database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    evidence_files = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    entities = relationship("Entity", back_populates="case", cascade="all, delete-orphan")
    transactions = relationship("TransactionRecord", back_populates="case", cascade="all, delete-orphan")
    relationships = relationship("Relationship", back_populates="case", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="case", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="case", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # CSV, XLSX, XLS, JSON
    file_size = Column(Integer, nullable=False)  # bytes
    stored_path = Column(String(500), nullable=False)
    sha256_hash = Column(String(64), index=True, nullable=False)
    upload_timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    processing_status = Column(String(50), default="UPLOADED")  # UPLOADED, PARSED, PROCESSED, ERROR
    record_count = Column(Integer, default=0)

    case = relationship("Case", back_populates="evidence_files")


class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type = Column(String(50), index=True, nullable=False)  # ACCOUNT, PHONE, UPI, IP, IMEI, IMSI, MAC
    entity_value = Column(String(255), nullable=False)
    normalized_value = Column(String(255), index=True, nullable=False)
    institution = Column(String(255), nullable=True)
    identifier = Column(String(255), nullable=True)
    first_seen = Column(String(100), nullable=True)
    last_seen = Column(String(100), nullable=True)
    evidence_refs_json = Column(Text, default="[]")  # JSON array of source references

    case = relationship("Case", back_populates="entities")
    risk_scores = relationship("RiskScore", back_populates="entity", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_case_entity_norm", "case_id", "normalized_value", "entity_type"),
    )


class TransactionRecord(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id", ondelete="SET NULL"), nullable=True)
    source_entity_id = Column(Integer, ForeignKey("entities.id", ondelete="SET NULL"), nullable=True)
    target_entity_id = Column(Integer, ForeignKey("entities.id", ondelete="SET NULL"), nullable=True)
    source_value = Column(String(255), nullable=False)
    target_value = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    timestamp = Column(String(100), nullable=True)
    transaction_reference = Column(String(255), nullable=True)
    channel = Column(String(50), nullable=True)
    raw_row_json = Column(Text, nullable=True)

    case = relationship("Case", back_populates="transactions")


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    source_entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    target_entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), nullable=False)  # SHARED_IMEI, SHARED_IP, SHARED_MAC, CALL, TRANSACTION, TRANSFER, CONNECTED_TO
    confidence = Column(Float, default=1.0)
    evidence_id = Column(Integer, ForeignKey("evidence.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    metadata_json = Column(Text, default="{}")

    case = relationship("Case", back_populates="relationships")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False, unique=False)
    score = Column(Integer, nullable=False, default=0)
    severity = Column(String(20), nullable=False, default="LOW")  # CRITICAL, HIGH, MED, LOW
    reasons_json = Column(Text, default="[]")  # list of strings
    weights_json = Column(Text, default="[]")  # list of {label, pts, color}
    calculated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    case = relationship("Case", back_populates="risk_scores")
    entity = relationship("Entity", back_populates="risk_scores")


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    pattern_type = Column(String(50), nullable=False)  # RAPID_FORWARDING, 3_HOP_CHAIN, SHARED_IMEI, SHARED_IP, SHARED_MAC, FAN_IN_BURST
    severity = Column(String(20), nullable=False, default="HIGH")  # CRITICAL, HIGH, MED, EVALUATED
    title = Column(String(255), nullable=False)
    flow_summary = Column(Text, nullable=False)
    latency_info = Column(String(100), nullable=True)
    source_ref = Column(String(255), nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    case = relationship("Case", back_populates="anomalies")
