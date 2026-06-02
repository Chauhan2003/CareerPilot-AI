from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.pdf_parser import extract_text_from_pdf
from utils.supabase_client import supabase

router = APIRouter()
bearer = HTTPBearer()


def get_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    """Validate Supabase JWT and return the user's ID."""
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_user_id),
):
    if file.content_type not in ("application/pdf",):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    text = extract_text_from_pdf(content)

    storage_path = f"{user_id}/resumes/{file.filename}"
    supabase.storage.from_("resumes").upload(
        path=storage_path,
        file=content,
        file_options={"content-type": "application/pdf", "upsert": "true"},
    )

    return {"resume_text": text, "storage_path": storage_path}
