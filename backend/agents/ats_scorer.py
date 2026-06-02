import json
import re
from langchain_groq import ChatGroq
from config import settings

llm = ChatGroq(api_key=settings.groq_api_key, model="llama-3.3-70b-versatile", temperature=0.1)

SYSTEM_PROMPT = """You are an ATS (Applicant Tracking System) expert. Analyze the resume against the job description and return ONLY a valid JSON object with no extra text.

Score each category from 0-100 and provide practical feedback.

Return exactly this JSON structure:
{
  "overall_score": <number 0-100>,
  "breakdown": {
    "keyword_match": <number 0-100>,
    "skills_match": <number 0-100>,
    "experience_match": <number 0-100>,
    "education_match": <number 0-100>
  },
  "matched_keywords": [<list of up to 10 keywords from JD found in resume>],
  "missing_keywords": [<list of up to 10 important keywords from JD missing in resume>],
  "suggestions": [<list of 3-5 specific actionable improvements>]
}

Scoring guide:
- keyword_match: % of important JD keywords found in resume
- skills_match: how well technical/soft skills align
- experience_match: relevance of work experience to role
- education_match: how well education/certifications match requirements
- overall_score: weighted average (keywords 35%, skills 30%, experience 25%, education 10%)"""


async def run_ats_scorer(resume_text: str, jd_text: str, job_title: str) -> dict:
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
    content = response.content.strip()

    # Extract JSON if wrapped in markdown code blocks
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", content)
    if match:
        content = match.group(1)

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "overall_score": 0,
            "breakdown": {
                "keyword_match": 0,
                "skills_match": 0,
                "experience_match": 0,
                "education_match": 0,
            },
            "matched_keywords": [],
            "missing_keywords": [],
            "suggestions": ["Could not parse ATS score. Please try again."],
        }
