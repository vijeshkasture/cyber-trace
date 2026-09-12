import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from ..models import Relationship, Entity, TransactionRecord, Evidence
from .normalization_service import NormalizationService


class RelationshipService:
    """
    Deterministic rule-based relationship correlation engine.
    Detects shared IMEI, shared IP, shared MAC, calls, and transaction linkages.
    """

    @staticmethod
    def get_or_create_relationship(
        db: Session,
        case_id: int,
        source_id: int,
        target_id: int,
        rel_type: str,
        confidence: float = 1.0,
        evidence_id: int = None,
        reason: str = None,
        timestamp: str = None,
        metadata: Dict[str, Any] = None
    ) -> Relationship:
        """Deduplicates and stores relationships."""
        if source_id == target_id:
            return None

        # Check existing relationship in either direction
        existing = db.query(Relationship).filter(
            Relationship.case_id == case_id,
            Relationship.relationship_type == rel_type,
            (
                (Relationship.source_entity_id == source_id) & (Relationship.target_entity_id == target_id)
            ) | (
                (Relationship.source_entity_id == target_id) & (Relationship.target_entity_id == source_id)
            )
        ).first()

        if not existing:
            rel = Relationship(
                case_id=case_id,
                source_entity_id=source_id,
                target_entity_id=target_id,
                relationship_type=rel_type,
                confidence=confidence,
                evidence_id=evidence_id,
                reason=reason,
                timestamp=timestamp,
                metadata_json=json.dumps(metadata or {})
            )
            db.add(rel)
            db.flush()
            return rel
        else:
            if reason and (not existing.reason or len(reason) > len(existing.reason)):
                existing.reason = reason
            db.flush()
            return existing

    @classmethod
    def correlate_case_relationships(cls, db: Session, case_id: int) -> int:
        """
        Runs full correlation over all entities, transactions, and evidence for a case.
        """
        entities = db.query(Entity).filter(Entity.case_id == case_id).all()
        entity_map = {e.id: e for e in entities}
        norm_map = {(e.entity_type, e.normalized_value): e for e in entities}

        # 1. Transaction relationships from TransactionRecord
        transactions = db.query(TransactionRecord).filter(TransactionRecord.case_id == case_id).all()
        for tx in transactions:
            if tx.source_entity_id and tx.target_entity_id:
                cls.get_or_create_relationship(
                    db,
                    case_id=case_id,
                    source_id=tx.source_entity_id,
                    target_id=tx.target_entity_id,
                    rel_type="TRANSACTION",
                    confidence=1.0,
                    evidence_id=tx.evidence_id,
                    reason=f"Financial transfer of ₹{tx.amount:,.2f} via {tx.channel or 'WIRE'}",
                    timestamp=tx.timestamp,
                    metadata={"amount": tx.amount, "channel": tx.channel, "ref": tx.transaction_reference}
                )

        # 2. Correlate raw parsed evidence rows for device / IP / hardware overlaps
        evidence_files = db.query(Evidence).filter(Evidence.case_id == case_id).all()
        from .parser_service import ParserService

        # Track mappings of IMEI -> set of Phones, IP -> set of Entities, MAC -> set of Entities
        imei_to_phones: Dict[str, List[Tuple[Entity, str, int]]] = {}
        ip_to_entities: Dict[str, List[Tuple[Entity, str, int]]] = {}
        mac_to_entities: Dict[str, List[Tuple[Entity, str, int]]] = {}

        for ev in evidence_files:
            try:
                records, _ = ParserService.parse_file(ev.stored_path)
            except Exception:
                continue

            for idx, row in enumerate(records, start=1):
                row_ref = f"{ev.original_filename} · Row #{idx}"
                ts = str(row.get("timestamp", "")).strip() or None

                # Call relationships (caller -> callee)
                caller_val = str(row.get("caller", "")).strip()
                callee_val = str(row.get("callee", "")).strip()
                if caller_val and callee_val:
                    _, norm_caller = NormalizationService.normalize_phone(caller_val)
                    _, norm_callee = NormalizationService.normalize_phone(callee_val)
                    c_ent = norm_map.get(("PHONE", norm_caller))
                    d_ent = norm_map.get(("PHONE", norm_callee))
                    if c_ent and d_ent:
                        cls.get_or_create_relationship(
                            db, case_id, c_ent.id, d_ent.id,
                            rel_type="CALL",
                            confidence=0.95,
                            evidence_id=ev.id,
                            reason=f"Direct cellular voice / SMS trace ({row_ref})",
                            timestamp=ts
                        )

                # IMEI correlation
                raw_imei = str(row.get("imei", "")).strip()
                raw_phone = str(row.get("phone", "") or row.get("caller", "") or row.get("callee", "")).strip()
                if raw_imei:
                    clean_imei = "".join(filter(str.isdigit, raw_imei))
                    if clean_imei and raw_phone:
                        _, norm_p = NormalizationService.normalize_phone(raw_phone)
                        p_ent = norm_map.get(("PHONE", norm_p))
                        if p_ent:
                            if clean_imei not in imei_to_phones:
                                imei_to_phones[clean_imei] = []
                            imei_to_phones[clean_imei].append((p_ent, row_ref, ev.id))

                # IP correlation
                raw_ip = str(row.get("ip", "")).strip()
                if raw_ip:
                    matched_entity = None
                    # Find if there's an associated account or phone in this row
                    for etype, field in [("ACCOUNT", "source_account"), ("ACCOUNT", "target_account"), ("PHONE", "phone"), ("PHONE", "caller")]:
                        v = str(row.get(field, "")).strip()
                        if v:
                            _, norm_v = NormalizationService.normalize_entity(etype, v)
                            e = norm_map.get((etype, norm_v))
                            if e:
                                matched_entity = e
                                break
                    if matched_entity:
                        if raw_ip not in ip_to_entities:
                            ip_to_entities[raw_ip] = []
                        ip_to_entities[raw_ip].append((matched_entity, row_ref, ev.id))

                # MAC correlation
                raw_mac = str(row.get("mac", "")).strip()
                if raw_mac:
                    matched_entity = None
                    for etype, field in [("ACCOUNT", "source_account"), ("PHONE", "phone")]:
                        v = str(row.get(field, "")).strip()
                        if v:
                            _, norm_v = NormalizationService.normalize_entity(etype, v)
                            e = norm_map.get((etype, norm_v))
                            if e:
                                matched_entity = e
                                break
                    if matched_entity:
                        if raw_mac not in mac_to_entities:
                            mac_to_entities[raw_mac] = []
                        mac_to_entities[raw_mac].append((matched_entity, row_ref, ev.id))

        # 3. Create SHARED_IMEI relationships between different phones using the same IMEI
        for imei, phone_list in imei_to_phones.items():
            unique_phones = {}
            for p_ent, ref, ev_id in phone_list:
                if p_ent.id not in unique_phones:
                    unique_phones[p_ent.id] = (p_ent, ref, ev_id)

            phone_items = list(unique_phones.values())
            for i in range(len(phone_items)):
                for j in range(i + 1, len(phone_items)):
                    p1, ref1, ev1 = phone_items[i]
                    p2, ref2, ev2 = phone_items[j]
                    cls.get_or_create_relationship(
                        db, case_id, p1.id, p2.id,
                        rel_type="SHARED_IMEI",
                        confidence=0.98,
                        evidence_id=ev1,
                        reason=f"Shared hardware handset IMEI ({imei}) colocation between {p1.entity_value} and {p2.entity_value}",
                        metadata={"imei": imei, "source_ref": ref1}
                    )

        # 4. Create SHARED_IP relationships between entities using the same IP
        for ip, ent_list in ip_to_entities.items():
            unique_ents = {}
            for ent, ref, ev_id in ent_list:
                if ent.id not in unique_ents:
                    unique_ents[ent.id] = (ent, ref, ev_id)
            
            ent_items = list(unique_ents.values())
            for i in range(len(ent_items)):
                for j in range(i + 1, len(ent_items)):
                    e1, ref1, ev1 = ent_items[i]
                    e2, ref2, ev2 = ent_items[j]
                    cls.get_or_create_relationship(
                        db, case_id, e1.id, e2.id,
                        rel_type="SHARED_IP",
                        confidence=0.90,
                        evidence_id=ev1,
                        reason=f"Shared egress IP ({ip}) authorization session between {e1.entity_value} and {e2.entity_value}",
                        metadata={"ip": ip, "source_ref": ref1}
                    )

        # 5. Create SHARED_MAC relationships
        for mac, ent_list in mac_to_entities.items():
            unique_ents = {}
            for ent, ref, ev_id in ent_list:
                if ent.id not in unique_ents:
                    unique_ents[ent.id] = (ent, ref, ev_id)
            ent_items = list(unique_ents.values())
            for i in range(len(ent_items)):
                for j in range(i + 1, len(ent_items)):
                    e1, ref1, ev1 = ent_items[i]
                    e2, ref2, ev2 = ent_items[j]
                    cls.get_or_create_relationship(
                        db, case_id, e1.id, e2.id,
                        rel_type="SHARED_MAC",
                        confidence=0.92,
                        evidence_id=ev1,
                        reason=f"Shared network interface MAC address ({mac})",
                        metadata={"mac": mac, "source_ref": ref1}
                    )

        db.flush()
        return db.query(Relationship).filter(Relationship.case_id == case_id).count()
