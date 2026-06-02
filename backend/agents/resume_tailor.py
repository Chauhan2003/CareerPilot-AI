from langchain_groq import ChatGroq
from config import settings

llm = ChatGroq(api_key=settings.groq_api_key, model="llama-3.3-70b-versatile", temperature=0.3)

SYSTEM_PROMPT = """You are an expert resume coach.
Given a candidate's resume and a job description, provide a clear, practical analysis.

Return your response in this exact format:

WEAK SECTIONS IN YOUR RESUME:
For each resume section that is weak or missing compared to the job requirements, list it clearly.
- [Section Name]: [What is weak or missing and why it matters for this job]

WHAT TO ADD:
List specific things the candidate should add to strengthen their resume for this role.
- [What to add]: [Short explanation of why]

IMPROVED BULLET POINTS:
Rewrite the resume bullet points to align with the job description.
Keep them short, start with action verbs, and include numbers where possible.
- [Rewritten bullet point]

Use simple, clear language. Avoid jargon. Be direct and specific."""


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
