from langchain_groq import ChatGroq
from config import settings

llm = ChatGroq(api_key=settings.groq_api_key, model="llama-3.3-70b-versatile", temperature=0.5)

SYSTEM_PROMPT = """You are a professional cover letter writer.
Write a compelling, 3-paragraph cover letter for the candidate based on their resume and the job description.
Paragraph 1: Strong opening — who they are and why they're excited about this specific role.
Paragraph 2: 2-3 concrete achievements from the resume that directly match the JD requirements.
Paragraph 3: Forward-looking close — enthusiasm, culture fit, call to action.
Keep it under 300 words. Return ONLY the cover letter text."""


async def run_cover_letter(resume_text: str, jd_text: str, job_title: str) -> str:
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
