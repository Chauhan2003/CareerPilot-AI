from langchain_groq import ChatGroq
from config import settings

llm = ChatGroq(api_key=settings.groq_api_key, model="llama-3.3-70b-versatile", temperature=0.4)

SYSTEM_PROMPT = """You are an expert interview coach.
Given the candidate's resume and the job description, generate exactly 10 interview Q&A pairs.
Mix of: behavioral (3), technical role-specific (4), situational (2), culture/motivation (1).
Format each as:
Q: [question]
A: [model answer using the candidate's background]

Return ONLY the 10 Q&A pairs, nothing else."""


async def run_interview_prep(resume_text: str, jd_text: str, job_title: str) -> str:
    messages = [
        ("system", SYSTEM_PROMPT),
        (
            "human",
            f"Job Title: {job_title}\n\n"
            f"--- RESUME ---\n{resume_text}\n\n"
            f"--- JOB DESCRIPTION ---\n{jd_text}",
        ),
    ]
    response = await llm.ainvoke(messages)
    return response.content
