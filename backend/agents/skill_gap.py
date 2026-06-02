from langchain_groq import ChatGroq
from config import settings

llm = ChatGroq(api_key=settings.groq_api_key, model="llama-3.3-70b-versatile", temperature=0.3)

SYSTEM_PROMPT = """You are a career development advisor.
Compare the candidate's skills (from their resume) against the job description requirements.

Return your analysis in this exact format:

MATCHED SKILLS:
- [skill 1]
- [skill 2]
(list every skill the candidate already has that the JD requires)

SKILL GAPS:
- [missing skill 1]: [why it matters for this role]
- [missing skill 2]: [why it matters for this role]
(list skills the JD requires but the candidate lacks)

LEARNING RECOMMENDATIONS:
For each skill gap, suggest 1 free resource (Coursera free audit, YouTube, official docs, freeCodeCamp, etc.)
- [skill]: [specific resource name + URL]

PRIORITY ACTION PLAN:
List the top 3 skills to learn first, ranked by impact on getting hired."""


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
