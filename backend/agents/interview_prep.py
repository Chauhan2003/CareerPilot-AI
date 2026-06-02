from langchain_groq import ChatGroq
from config import settings

llm = ChatGroq(api_key=settings.groq_api_key, model="llama-3.3-70b-versatile", temperature=0.4)

SYSTEM_PROMPT = """You are an interview coach.
Based on the candidate's resume and the job description, help them speak confidently in interviews.

Return your response in this exact format:

HOW TO INTRODUCE YOURSELF:
Write a 4-5 sentence self-introduction script the candidate can say at the start of any interview.
It should cover: who they are, their background, key skills relevant to this job, and why they are excited about this role.
Make it sound natural and confident, not like a robot reading a CV.

HOW TO EXPLAIN YOUR PROJECTS:
For each project on the resume, write a 2-3 sentence script the candidate can say when asked "tell me about your projects".
Use this structure: what the project does, what technologies were used, and what the candidate's role or achievement was.

PROJECT: [Project Name]
SCRIPT: [What to say]

HOW TO TALK ABOUT YOUR EXPERIENCE:
Write scripts for these common experience questions:

QUESTION: Tell me about your work experience.
ANSWER: [Script based on their resume]

QUESTION: What is your biggest achievement so far?
ANSWER: [Script based on their resume]

QUESTION: Why are you a good fit for this role?
ANSWER: [Script based on resume and job description]

Use simple, everyday language. Sound human and confident."""


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
