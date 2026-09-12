from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict


# Case Schemas
class CaseBase(BaseModel):
    case_number: str
    title: str
    description: Optional[str] = None


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class CaseResponse(CaseBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Evidence Schemas
class EvidenceResponse(BaseModel):
    id: int
    case_id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    sha256_hash: str
    upload_timestamp: datetime
    processing_status: str
    record_count: int

    model_config = ConfigDict(from_attributes=True)


# Integrity Schemas
class SingleIntegrityCheck(BaseModel):
    evidence_id: int
    filename: str
    stored_hash: str
    current_hash: str
    match: bool


class CaseIntegrityResponse(BaseModel):
    case_id: str
    all_match: bool
    verifications: List[SingleIntegrityCheck]


# Detailed Risk Entity Schemas (matching the exact frontend entity object contract)
class WeightItem(BaseModel):
    label: str
    pts: str
    color: str


class TopologyItem(BaseModel):
    label: str
    val: str
    color: str


class SourceItem(BaseModel):
    file: str
    hash: str
    match: str


class RiskEntityItem(BaseModel):
    id: str
    type: str
    institution: str
    identifier: str
    score: int
    severity: str
    factors: List[str]
    nodes: int
    lastActive: str
    firstSeen: str
    weights: List[WeightItem] = []
    topology: List[TopologyItem] = []
    sources: List[SourceItem] = []


# Dashboard Stats Schemas
class TopSuspect(BaseModel):
    id: str
    score: int
    severity: str
    institution: Optional[str] = ""
    role: Optional[str] = ""


class DashboardStats(BaseModel):
    raw_records: int
    files_count: int
    entities_count: int
    relationships_count: int
    high_risk_count: int
    critical_count: int
    high_count: int
    top_suspect: Optional[TopSuspect] = None


# Graph Schemas
class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    risk: int
    severity: Optional[str] = "LOW"


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str
    label: str


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


# Timeline Schemas
class TimelineEvent(BaseModel):
    timestamp: str
    event_type: str
    source_entity: str
    target_entity: str
    description: str
    amount: Optional[float] = None
    evidence_ref: Optional[str] = None


# Anomaly Schemas
class AnomalyItem(BaseModel):
    id: int
    pattern_type: str
    severity: str
    title: str
    flow_summary: str
    latency_info: Optional[str] = None
    source_ref: Optional[str] = None
    explanation: Optional[str] = None


# Process Case Result
class ProcessCaseResult(BaseModel):
    case_id: str
    status: str
    files_processed: int
    records_processed: int
    entities_identified: int
    relationships_identified: int
    high_risk_entities: int
    anomalies_detected: int
    processing_time_seconds: float
