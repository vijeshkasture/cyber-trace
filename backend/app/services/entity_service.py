import json
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from ..models import Entity, TransactionRecord, Evidence
from .normalization_service import NormalizationService
from ..utils.validators import is_valid_ip, is_valid_phone, is_valid_mac, is_valid_imei, is_valid_upi


class EntityService:
    """
    Extracts, normalizes, and manages deduplicated forensic entities per case.
    Preserves strict evidence traceability for every entity and transaction.
    """

    @staticmethod
    def get_or_create_entity(
        db: Session,
        case_id: int,
        entity_type: str,
        raw_val: str,
        institution: Optional[str] = None,
        identifier: Optional[str] = None,
        timestamp: Optional[str] = None,
        evidence_ref: Optional[str] = None
    ) -> Entity:
        """
        Retrieves or creates a unique Entity for the case based on normalized value.
        Updates first_seen/last_seen and appends evidence reference.
        """
        orig_val, norm_val = NormalizationService.normalize_entity(entity_type, raw_val)
        if not norm_val:
            return None

        # Check existing entity in this case
        entity = db.query(Entity).filter(
            Entity.case_id == case_id,
            Entity.entity_type == entity_type,
            Entity.normalized_value == norm_val
        ).first()

        if not entity:
            refs = [evidence_ref] if evidence_ref else []
            entity = Entity(
                case_id=case_id,
                entity_type=entity_type,
                entity_value=orig_val,
                normalized_value=norm_val,
                institution=institution or "Verified Endpoint",
                identifier=identifier or orig_val,
                first_seen=timestamp,
                last_seen=timestamp,
                evidence_refs_json=json.dumps(refs)
            )
            db.add(entity)
            db.flush()
        else:
            # Update timestamps if applicable
            if timestamp:
                if not entity.first_seen:
                    entity.first_seen = timestamp
                entity.last_seen = timestamp
            if institution and (not entity.institution or entity.institution in ("Verified Endpoint", "Banking Network")):
                entity.institution = institution
            if identifier and not entity.identifier:
                entity.identifier = identifier
            
            # Append evidence reference
            if evidence_ref:
                try:
                    refs = json.loads(entity.evidence_refs_json or "[]")
                except Exception:
                    refs = []
                if evidence_ref not in refs:
                    refs.append(evidence_ref)
                    entity.evidence_refs_json = json.dumps(refs)
            db.flush()

        return entity

    @classmethod
    def extract_from_records(
        cls,
        db: Session,
        case_id: int,
        evidence: Evidence,
        records: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Parses all records from an evidence file, extracting entities, transactions, and relationships.
        """
        entities_created = 0
        transactions_created = 0
        filename = evidence.original_filename

        for idx, row in enumerate(records, start=1):
            row_ref = f"{filename} · Row #{idx}"
            ts = str(row.get("timestamp", "")).strip() or None
            inst = str(row.get("institution", "")).strip() or None

            # 1. Accounts & Transactions
            src_acc = str(row.get("source_account", "")).strip()
            tgt_acc = str(row.get("target_account", "")).strip()
            raw_amt = str(row.get("amount", "")).strip()

            src_bank = str(row.get("source_bank", "") or row.get("bank", "") or row.get("institution", "")).strip() or None
            tgt_bank = str(row.get("target_bank", "")).strip() or None

            src_entity = None
            tgt_entity = None

            if src_acc:
                src_entity = cls.get_or_create_entity(
                    db, case_id, "ACCOUNT", src_acc,
                    institution=src_bank or "Banking Network",
                    identifier=src_acc,
                    timestamp=ts,
                    evidence_ref=row_ref
                )
            if tgt_acc:
                tgt_entity = cls.get_or_create_entity(
                    db, case_id, "ACCOUNT", tgt_acc,
                    institution=tgt_bank or ("Banking Network" if not src_bank else None),
                    identifier=tgt_acc,
                    timestamp=ts,
                    evidence_ref=row_ref
                )

            if src_acc and tgt_acc and raw_amt:
                try:
                    # Clean amount e.g. "₹25,000" -> 25000.0
                    clean_amt_str = raw_amt.replace("₹", "").replace(",", "").replace("$", "").strip()
                    amount = float(clean_amt_str)
                except ValueError:
                    amount = 0.0

                tx = TransactionRecord(
                    case_id=case_id,
                    evidence_id=evidence.id,
                    source_entity_id=src_entity.id if src_entity else None,
                    target_entity_id=tgt_entity.id if tgt_entity else None,
                    source_value=src_acc,
                    target_value=tgt_acc,
                    amount=amount,
                    timestamp=ts,
                    transaction_reference=str(row.get("transaction_id", "")).strip() or None,
                    channel=str(row.get("channel", "TRANSFER")).strip() or "TRANSFER",
                    raw_row_json=json.dumps(row)
                )
                db.add(tx)
                transactions_created += 1

            # 2. Telephony: Phones, IMEI, IMSI
            caller = str(row.get("caller", "")).strip()
            callee = str(row.get("callee", "")).strip()
            generic_phone = str(row.get("phone", "")).strip()

            phone_entities = []
            for p in [caller, callee, generic_phone]:
                if p and is_valid_phone(p):
                    p_ent = cls.get_or_create_entity(
                        db, case_id, "PHONE", p,
                        institution=inst or "Telecom Network",
                        identifier=p,
                        timestamp=ts,
                        evidence_ref=row_ref
                    )
                    phone_entities.append(p_ent)

            raw_imei = str(row.get("imei", "")).strip()
            if raw_imei and is_valid_imei(raw_imei):
                cls.get_or_create_entity(
                    db, case_id, "IMEI", raw_imei,
                    institution="Device Hardware",
                    identifier=raw_imei,
                    timestamp=ts,
                    evidence_ref=row_ref
                )

            # 3. IP and MAC
            raw_ip = str(row.get("ip", "")).strip()
            if raw_ip and is_valid_ip(raw_ip):
                cls.get_or_create_entity(
                    db, case_id, "IP", raw_ip,
                    institution=inst or "IP Transit / ISP",
                    identifier=raw_ip,
                    timestamp=ts,
                    evidence_ref=row_ref
                )

            raw_mac = str(row.get("mac", "")).strip()
            if raw_mac and is_valid_mac(raw_mac):
                cls.get_or_create_entity(
                    db, case_id, "MAC", raw_mac,
                    institution="Network Interface",
                    identifier=raw_mac,
                    timestamp=ts,
                    evidence_ref=row_ref
                )

            # 4. UPI VPAs
            raw_upi = str(row.get("upi", "")).strip()
            if raw_upi and is_valid_upi(raw_upi):
                cls.get_or_create_entity(
                    db, case_id, "UPI", raw_upi,
                    institution="NPCI UPI Gateway",
                    identifier=raw_upi,
                    timestamp=ts,
                    evidence_ref=row_ref
                )

        db.flush()
        total_case_entities = db.query(Entity).filter(Entity.case_id == case_id).count()
        return {
            "total_case_entities": total_case_entities,
            "transactions_created": transactions_created
        }
