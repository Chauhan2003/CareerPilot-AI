from langchain_groq import ChatGroq
from config import settings

llm = ChatGroq(api_key=settings.groq_api_key, model="llama-3.3-70b-versatile", temperature=0.3)

SYSTEM_PROMPT = """You are an expert resume coach. 
Given a candidate's resume and a job description, rewrite the resume bullet points 
to strongly align with the JD keywords and requirements. 
Keep bullet points concise, action-verb led, and quantified where possible.
Return ONLY the rewritten bullet points, one per line."""


async def run_resume_tailor(resume_text: str, jd_text: str, job_title: str) -> str:
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
