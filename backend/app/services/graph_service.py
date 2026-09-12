import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import Entity, Relationship, RiskScore
from ..schemas import GraphData, GraphNode, GraphEdge


class GraphService:
    """
    Constructs forensic network graph representation of entities and relationships.
    """

    @classmethod
    def get_case_graph(cls, db: Session, case_id: int) -> GraphData:
        """
        Retrieves all entities as nodes and relationships as edges for NetworkX or Cytoscape/React Flow.
        """
        entities = db.query(Entity).filter(Entity.case_id == case_id).all()
        relationships = db.query(Relationship).filter(Relationship.case_id == case_id).all()
        risk_scores = {rs.entity_id: rs for rs in db.query(RiskScore).filter(RiskScore.case_id == case_id).all()}

        ent_by_id = {e.id: e for e in entities}

        nodes: List[GraphNode] = []
        for ent in entities:
            rs = risk_scores.get(ent.id)
            score = rs.score if rs else 20
            sev = rs.severity if rs else "LOW"

            nodes.append(GraphNode(
                id=ent.entity_value,
                label=ent.entity_value,
                type=ent.entity_type,
                risk=score,
                severity=sev
            ))

        edges: List[GraphEdge] = []
        for rel in relationships:
            src = ent_by_id.get(rel.source_entity_id)
            tgt = ent_by_id.get(rel.target_entity_id)
            if src and tgt:
                meta = json.loads(rel.metadata_json or "{}")
                amt = meta.get("amount")
                if amt:
                    label = f"₹{amt:,.0f}"
                elif rel.relationship_type == "SHARED_IMEI":
                    label = "Shared IMEI"
                elif rel.relationship_type == "SHARED_IP":
                    label = "Shared IP"
                elif rel.relationship_type == "CALL":
                    label = "Call Trace"
                else:
                    label = rel.relationship_type

                edges.append(GraphEdge(
                    id=f"edge-{rel.id}",
                    source=src.entity_value,
                    target=tgt.entity_value,
                    type=rel.relationship_type,
                    label=label
                ))

        return GraphData(nodes=nodes, edges=edges)
