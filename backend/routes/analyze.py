from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from utils.supabase_client import supabase
from utils.pdf_generator import generate_full_report_pdf
from graph.langgraph_pipeline import run_pipeline

router = APIRouter()
bearer = HTTPBearer()


def get_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str
    job_title: str = ""


@router.post("/")
async def analyze(payload: AnalyzeRequest, user_id: str = Depends(get_user_id)):
    if not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required")
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required")

    results = await run_pipeline(
        resume_text=payload.resume_text,
        jd_text=payload.job_description,
        job_title=payload.job_title,
    )

    record = {
        "user_id": user_id,
        "job_title": payload.job_title,
        "resume_tailor": results.get("resume_tailor"),
        "cover_letter": results.get("cover_letter"),
        "interview_prep": results.get("interview_prep"),
        "skill_gap": results.get("skill_gap"),
    }
    supabase.table("analyses").insert(record).execute()

    return results


@router.post("/download-report")
async def download_report(payload: AnalyzeRequest, user_id: str = Depends(get_user_id)):
    results = await run_pipeline(
        resume_text=payload.resume_text,
        jd_text=payload.job_description,
        job_title=payload.job_title,
    )
    pdf_bytes = generate_full_report_pdf(results)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="careerpilot_report.pdf"'},
    )
