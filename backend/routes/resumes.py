from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.supabase_client import supabase
from utils.deps import get_user_id

router = APIRouter()

MAX_SAVED_RESUMES = 2


class SaveResumeRequest(BaseModel):
    name: str
    resume_text: str
    storage_path: str = ""


@router.get("/")
def list_resumes(user_id: str = Depends(get_user_id)):
    result = (
        supabase.table("saved_resumes")
        .select("id, name, storage_path, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return {"resumes": result.data or []}


@router.post("/")
def save_resume(payload: SaveResumeRequest, user_id: str = Depends(get_user_id)):
    existing = (
        supabase.table("saved_resumes")
        .select("id")
        .eq("user_id", user_id)
        .execute()
    )
    if len(existing.data or []) >= MAX_SAVED_RESUMES:
        raise HTTPException(
            status_code=400,
            detail=f"You can only save up to {MAX_SAVED_RESUMES} resumes. Delete one to save a new one.",
        )

    record = {
        "user_id": user_id,
        "name": payload.name.strip() or "My Resume",
        "resume_text": payload.resume_text,
        "storage_path": payload.storage_path,
    }
    result = supabase.table("saved_resumes").insert(record).execute()
    return {"resume": result.data[0]}


@router.get("/{resume_id}")
def get_resume(resume_id: str, user_id: str = Depends(get_user_id)):
    result = (
        supabase.table("saved_resumes")
        .select("*")
        .eq("id", resume_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"resume": result.data}


@router.delete("/{resume_id}")
def delete_resume(resume_id: str, user_id: str = Depends(get_user_id)):
    supabase.table("saved_resumes").delete().eq("id", resume_id).eq("user_id", user_id).execute()
    return {"success": True}
