from typing import List
from sqlalchemy.orm import Session
from ..models import TransactionRecord, Relationship, Evidence, Entity
from ..schemas import TimelineEvent


class TimelineService:
    """
    Forensic timeline engine that orders chronological transactions, calls, and correlations.
    """

    @classmethod
    def get_case_timeline(cls, db: Session, case_id: int) -> List[TimelineEvent]:
        """
        Gathers events from transactions, call logs, and detected link timestamps.
        """
        events: List[TimelineEvent] = []

        transactions = db.query(TransactionRecord).filter(
            TransactionRecord.case_id == case_id
        ).order_by(TransactionRecord.id.asc()).all()

        evidence_files = {ev.id: ev.original_filename for ev in db.query(Evidence).filter(Evidence.case_id == case_id).all()}

        for tx in transactions:
            ev_name = evidence_files.get(tx.evidence_id) or "Unknown evidence"
            events.append(TimelineEvent(
                timestamp=tx.timestamp or "",
                event_type="TRANSACTION",
                source_entity=tx.source_value,
                target_entity=tx.target_value,
                description=f"Fund transfer of ₹{tx.amount:,.2f} via {tx.channel or 'TRANSFER'}",
                amount=tx.amount,
                evidence_ref=f"{ev_name}:Tx #{tx.id}"
            ))

        relationships = db.query(Relationship).filter(
            Relationship.case_id == case_id
        ).all()

        entities = {e.id: e.entity_value for e in db.query(Entity).filter(Entity.case_id == case_id).all()}

        for rel in relationships:
            if rel.relationship_type in ("CALL", "SHARED_IMEI", "SHARED_IP"):
                src_val = entities.get(rel.source_entity_id, "Unknown")
                tgt_val = entities.get(rel.target_entity_id, "Unknown")
                events.append(TimelineEvent(
                    timestamp=rel.timestamp or "",
                    event_type=rel.relationship_type,
                    source_entity=src_val,
                    target_entity=tgt_val,
                    description=rel.reason or f"Correlated {rel.relationship_type} link detected",
                    amount=None,
                    evidence_ref=f"Correlation Engine (Confidence: {int(rel.confidence * 100)}%)"
                ))

        # Sort chronologically by timestamp
        events.sort(key=lambda x: str(x.timestamp))
        return events
