import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT


def _build_pdf(title: str, sections: list[dict]) -> bytes:
    """
    sections: list of {"heading": str, "body": str}
    Returns PDF as bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title", parent=styles["Heading1"], fontSize=18, spaceAfter=12
    )
    heading_style = ParagraphStyle(
        "SectionHeading", parent=styles["Heading2"], fontSize=13, spaceAfter=6
    )
    body_style = ParagraphStyle(
        "Body", parent=styles["Normal"], fontSize=10, spaceAfter=8, alignment=TA_LEFT
    )

    story = [Paragraph(title, title_style), Spacer(1, 0.2 * inch)]

    for section in sections:
        story.append(Paragraph(section["heading"], heading_style))
        body_text = section["body"].replace("\n", "<br/>")
        story.append(Paragraph(body_text, body_style))
        story.append(Spacer(1, 0.15 * inch))

    doc.build(story)
    return buffer.getvalue()


def generate_resume_pdf(tailored_resume: str) -> bytes:
    return _build_pdf(
        "Tailored Resume",
        [{"heading": "Resume", "body": tailored_resume}],
    )


def generate_cover_letter_pdf(cover_letter: str) -> bytes:
    return _build_pdf(
        "Cover Letter",
        [{"heading": "Cover Letter", "body": cover_letter}],
    )


def generate_full_report_pdf(results: dict) -> bytes:
    sections = [
        {"heading": "Resume Fix", "body": results.get("resume_tailor", "")},
        {"heading": "Cover Letter", "body": results.get("cover_letter", "")},
        {"heading": "How to Speak", "body": results.get("interview_prep", "")},
        {"heading": "Skill Gaps", "body": results.get("skill_gap", "")},
    ]
    return _build_pdf("CareerPilot — Full Analysis Report", sections)
