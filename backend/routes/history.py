from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.supabase_client import supabase

router = APIRouter()
bearer = HTTPBearer()


def get_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/")
def get_history(user_id: str = Depends(get_user_id)):
    response = (
        supabase.table("analyses")
        .select("id, job_title, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return {"analyses": response.data}


@router.get("/{analysis_id}")
def get_analysis(analysis_id: str, user_id: str = Depends(get_user_id)):
    response = (
        supabase.table("analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return response.data


@router.delete("/{analysis_id}")
def delete_analysis(analysis_id: str, user_id: str = Depends(get_user_id)):
    supabase.table("analyses").delete().eq("id", analysis_id).eq("user_id", user_id).execute()
    return {"deleted": True}
