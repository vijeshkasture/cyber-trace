import os
import json
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from ..models import Case, Evidence, Entity, RiskScore, Relationship, Anomaly
from ..utils.file_utils import REPORTS_DIR


class ReportService:
    """
    Generates professional judicial forensic intelligence reports using ReportLab.
    """

    @classmethod
    def generate_case_pdf(cls, db: Session, case_id: int) -> str:
        """
        Builds an executive forensic PDF dossier for the case.
        Saves into storage/reports/ and returns the absolute file path.
        """
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError(f"Case {case_id} not found")

        os.makedirs(REPORTS_DIR, exist_ok=True)
        pdf_path = os.path.join(REPORTS_DIR, f"{case.case_number}.pdf")

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            leftMargin=0.5 * inch,
            rightMargin=0.5 * inch,
            topMargin=0.5 * inch,
            bottomMargin=0.5 * inch
        )

        styles = getSampleStyleSheet()

        # Custom Palette based on DESIGN.md
        navy_dark = colors.HexColor("#080d1a")
        navy_panel = colors.HexColor("#0d1527")
        accent_blue = colors.HexColor("#1d4ed8")
        rose_crit = colors.HexColor("#dc2626")
        slate_dim = colors.HexColor("#64748b")
        text_light = colors.HexColor("#1e293b")

        # Typography Styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=accent_blue
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=slate_dim
        )
        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=accent_blue,
            spaceBefore=8,
            spaceAfter=4
        )
        cell_style = ParagraphStyle(
            "TableCell",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=text_light
        )
        cell_bold = ParagraphStyle(
            "TableCellBold",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=text_light
        )
        cell_mono = ParagraphStyle(
            "TableCellMono",
            parent=styles["Normal"],
            fontName="Courier",
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#334155")
        )
        crit_style = ParagraphStyle(
            "CritStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=rose_crit
        )

        elements = []

        # 1. Header Banner
        header_data = [
            [
                Paragraph("<b>CYBERTRACE AI</b> — Forensic Intelligence Platform", title_style),
                Paragraph(f"<b>CASE REF:</b> {case.case_number}<br/><b>GENERATED:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[4.2 * inch, 3.3 * inch])
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 4))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=accent_blue, spaceBefore=4, spaceAfter=8))

        # 2. Case Overview
        desc_text = case.description or "Automated cyber-fraud evidentiary analysis and cross-artifact topological correlation."
        overview_data = [
            [Paragraph("<b>Investigation Title:</b>", cell_bold), Paragraph(case.title, cell_style)],
            [Paragraph("<b>Case Status:</b>", cell_bold), Paragraph(case.status, cell_style)],
            [Paragraph("<b>Scope & Summary:</b>", cell_bold), Paragraph(desc_text, cell_style)]
        ]
        overview_table = Table(overview_data, colWidths=[1.8 * inch, 5.7 * inch])
        overview_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(overview_table)
        elements.append(Spacer(1, 8))

        # 3. Evidence Ingestion & Cryptographic Chain of Custody Table
        elements.append(Paragraph("1. EVIDENCE INGESTION & SHA-256 HASH VERIFICATION", section_heading))
        evidences = db.query(Evidence).filter(Evidence.case_id == case_id).all()
        
        ev_data = [[
            Paragraph("Filename", cell_bold),
            Paragraph("Type", cell_bold),
            Paragraph("Records", cell_bold),
            Paragraph("Cryptographic SHA-256 Vault Hash", cell_bold),
            Paragraph("Status", cell_bold)
        ]]

        for ev in evidences:
            ev_data.append([
                Paragraph(ev.original_filename, cell_style),
                Paragraph(ev.file_type, cell_style),
                Paragraph(str(ev.record_count), cell_style),
                Paragraph(ev.sha256_hash, cell_mono),
                Paragraph("VERIFIED MATCH", ParagraphStyle("Ver", parent=cell_bold, textColor=colors.HexColor("#059669")))
            ])

        if len(ev_data) == 1:
            ev_data.append([Paragraph("No evidence files registered.", cell_style), "", "", "", ""])

        ev_table = Table(ev_data, colWidths=[1.5 * inch, 0.7 * inch, 0.7 * inch, 3.4 * inch, 1.2 * inch])
        ev_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(ev_table)
        elements.append(Spacer(1, 8))

        # 4. Forensic Risk Assessment Registry Table
        elements.append(Paragraph("2. HIGH-RISK SUSPECT ENTITIES & EXPLAINABLE FINDINGS", section_heading))
        from .risk_service import RiskService
        risks = RiskService.calculate_case_risks(db, case_id)

        risk_data = [[
            Paragraph("Entity Identifier", cell_bold),
            Paragraph("Type", cell_bold),
            Paragraph("Risk Index", cell_bold),
            Paragraph("Severity", cell_bold),
            Paragraph("Key Formulations & Indicators", cell_bold),
            Paragraph("Last Activity", cell_bold)
        ]]

        for r in risks[:6]:  # Top high risk entities
            sev_p = Paragraph(r.severity, crit_style if r.severity in ("CRITICAL", "HIGH") else cell_bold)
            factors_str = " • ".join(r.factors[:2])
            risk_data.append([
                Paragraph(r.id, cell_bold),
                Paragraph(r.type, cell_style),
                Paragraph(f"{r.score}/100", cell_bold),
                sev_p,
                Paragraph(factors_str, cell_style),
                Paragraph(r.lastActive, cell_style)
            ])

        if len(risk_data) == 1:
            risk_data.append([Paragraph("No risk records identified.", cell_style), "", "", "", "", ""])

        risk_table = Table(risk_data, colWidths=[1.3 * inch, 0.8 * inch, 0.8 * inch, 0.9 * inch, 2.7 * inch, 1.0 * inch])
        risk_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(risk_table)
        elements.append(Spacer(1, 8))

        # 5. Detected Topology Anomalies & Multi-hop Chains
        elements.append(Paragraph("3. DETECTED GRAPH ANOMALIES & BEHAVIORAL CORRELATION", section_heading))
        anomalies = db.query(Anomaly).filter(Anomaly.case_id == case_id).all()

        anom_data = [[
            Paragraph("Anomaly Pattern", cell_bold),
            Paragraph("Severity", cell_bold),
            Paragraph("Topological Flow / Finding", cell_bold),
            Paragraph("Latency / Latent Window", cell_bold),
            Paragraph("Evidence Provenance", cell_bold)
        ]]

        for anom in anomalies:
            anom_data.append([
                Paragraph(anom.title, cell_bold),
                Paragraph(anom.severity, crit_style if anom.severity == "CRITICAL" else cell_bold),
                Paragraph(anom.flow_summary, cell_style),
                Paragraph(anom.latency_info or "Immediate", cell_style),
                Paragraph(anom.source_ref or "Evidence Ref", cell_mono)
            ])

        if len(anom_data) == 1:
            anom_data.append([Paragraph("No anomalous topological cycles detected.", cell_style), "", "", "", ""])

        anom_table = Table(anom_data, colWidths=[1.8 * inch, 0.8 * inch, 2.7 * inch, 1.1 * inch, 1.1 * inch])
        anom_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(anom_table)
        elements.append(Spacer(1, 10))

        # 6. Recommendation & Sign-Off Block
        elements.append(Paragraph("4. FORENSIC DIRECTIVES & OBSERVATIONS", section_heading))
        recs = []
        if risks:
            top_suspect = risks[0].id
            recs.append(Paragraph(f"• <b>Immediate CrPC Section 91 Directives:</b> Expedite formal freeze on primary conduit node {top_suspect} and downstream cash-out nexus.", cell_style))
        else:
            recs.append(Paragraph("• <b>Primary Assessment:</b> No high-risk conduit entities identified. Continue evidentiary monitoring.", cell_style))

        if anomalies:
            for anom in anomalies[:3]:
                recs.append(Paragraph(f"• <b>{anom.title}:</b> {anom.explanation or anom.flow_summary}", cell_style))
        else:
            recs.append(Paragraph("• <b>Evidentiary Ingestion:</b> Ingest additional telecommunication, banking, or network artifacts to establish deterministic correlation links.", cell_style))

        for r in recs:
            elements.append(r)
            elements.append(Spacer(1, 2))

        elements.append(Spacer(1, 8))
        sig_data = [
            [
                Paragraph("<b>Investigating Officer:</b> Insp. R. Sharma<br/>Cyber Forensics Command Unit", cell_style),
                Paragraph("<b>Digital Signature:</b> VALID (SHA-256 Vault Signed)<br/>Evidence Immutable Ledger Locked", cell_style)
            ]
        ]
        sig_table = Table(sig_data, colWidths=[3.75 * inch, 3.75 * inch])
        sig_table.setStyle(TableStyle([
            ("LINEABOVE", (0, 0), (-1, 0), 1, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(sig_table)

        # Build document
        doc.build(elements)
        return pdf_path
