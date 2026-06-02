from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from utils.supabase_client import supabase
from utils.pdf_generator import generate_full_report_pdf
from utils.deps import get_user_id
from graph.langgraph_pipeline import run_pipeline

router = APIRouter()


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str
    job_title: str = ""


class DownloadReportRequest(BaseModel):
    resume_tailor: str = ""
    cover_letter: str = ""
    interview_prep: str = ""
    skill_gap: str = ""
    job_title: str = ""


FREE_TIER_LIMIT = 5


@router.post("/")
async def analyze(payload: AnalyzeRequest, user_id: str = Depends(get_user_id)):
    if not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text is required")
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required")

    usage_result = supabase.table("user_usage").select("total_analyses").eq("user_id", user_id).execute()
    total = usage_result.data[0]["total_analyses"] if usage_result.data else 0

    if total >= FREE_TIER_LIMIT:
        raise HTTPException(
            status_code=403,
            detail=f"Free tier limit reached ({FREE_TIER_LIMIT} analyses). Upgrade to continue.",
        )

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
        "ats_score": results.get("ats_score"),
    }
    supabase.table("analyses").insert(record).execute()

    # Increment lifetime counter regardless of future deletions
    supabase.table("user_usage").upsert(
        {"user_id": user_id, "total_analyses": total + 1},
        on_conflict="user_id",
    ).execute()

    return results


@router.post("/download-report")
async def download_report(payload: DownloadReportRequest, user_id: str = Depends(get_user_id)):
    results = {
        "resume_tailor": payload.resume_tailor,
        "cover_letter": payload.cover_letter,
        "interview_prep": payload.interview_prep,
        "skill_gap": payload.skill_gap,
    }
    pdf_bytes = generate_full_report_pdf(results)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="careerpilot_report.pdf"'},
    )
