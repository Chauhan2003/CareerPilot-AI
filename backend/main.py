from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routes.upload import router as upload_router
from routes.analyze import router as analyze_router
from routes.history import router as history_router
from routes.resumes import router as resumes_router

load_dotenv()

app = FastAPI(title="CareerPilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api/upload", tags=["upload"])
app.include_router(analyze_router, prefix="/api/analyze", tags=["analyze"])
app.include_router(history_router, prefix="/api/history", tags=["history"])
app.include_router(resumes_router, prefix="/api/resumes", tags=["resumes"])


@app.get("/health")
def health():
    return {"status": "ok"}
