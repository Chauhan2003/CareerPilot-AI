from langchain_groq import ChatGroq
from config import settings

llm = ChatGroq(api_key=settings.groq_api_key, model="llama-3.3-70b-versatile", temperature=0.3)

SYSTEM_PROMPT = """You are a career advisor.
Compare the candidate's skills from their resume against the job description.

Return your analysis in this exact format:

SKILLS YOU ALREADY HAVE:
- [skill]: [how you use it or where it appears in your resume]

SKILLS YOU ARE MISSING:
- [skill]: [why this skill is needed for the job]

HOW TO LEARN THE MISSING SKILLS:
For each missing skill, suggest one free resource.
- [skill]: [resource name and link]

TOP 3 THINGS TO DO FIRST:
List the 3 most important skills to learn, starting with the one that will help you get hired fastest.
1. [skill]: [short reason why]
2. [skill]: [short reason why]
3. [skill]: [short reason why]

Use simple, everyday language. Be direct and easy to understand."""


async def run_skill_gap(resume_text: str, jd_text: str, job_title: str) -> str:
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
