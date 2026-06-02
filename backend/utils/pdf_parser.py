import fitz  # PyMuPDF
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract clean text from a PDF file given its raw bytes."""
    doc = fitz.open(stream=io.BytesIO(file_bytes), filetype="pdf")
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text("text"))
    doc.close()
    return "\n".join(text_parts).strip()
