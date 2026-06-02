"""
LangGraph pipeline — all 4 agents run in parallel via asyncio.gather.
LangGraph's StateGraph orchestrates the flow; parallel execution is done
by fanning out from a single 'run_agents' node using asyncio.
"""
import asyncio
from typing import TypedDict

from langgraph.graph import StateGraph, END
from agents.resume_tailor import run_resume_tailor
from agents.cover_letter import run_cover_letter
from agents.interview_prep import run_how_to_speak
from agents.skill_gap import run_skill_gap
from agents.ats_scorer import run_ats_scorer


class PipelineState(TypedDict):
    resume_text: str
    jd_text: str
    job_title: str
    resume_tailor: str
    cover_letter: str
    interview_prep: str
    skill_gap: str
    ats_score: dict


async def _run_agents_node(state: PipelineState) -> PipelineState:
    """Fan out all 4 agents in parallel."""
    resume_text = state["resume_text"]
    jd_text = state["jd_text"]
    job_title = state["job_title"]

    resume_result, cover_result, how_to_speak_result, skill_result, ats_result = await asyncio.gather(
        run_resume_tailor(resume_text, jd_text, job_title),
        run_cover_letter(resume_text, jd_text, job_title),
        run_how_to_speak(resume_text, jd_text, job_title),
        run_skill_gap(resume_text, jd_text, job_title),
        run_ats_scorer(resume_text, jd_text, job_title),
    )

    return {
        **state,
        "resume_tailor": resume_result,
        "cover_letter": cover_result,
        "interview_prep": how_to_speak_result,
        "skill_gap": skill_result,
        "ats_score": ats_result,
    }


def _build_graph() -> StateGraph:
    graph = StateGraph(PipelineState)
    graph.add_node("run_agents", _run_agents_node)
    graph.set_entry_point("run_agents")
    graph.add_edge("run_agents", END)
    return graph.compile()


_compiled_graph = _build_graph()


async def run_pipeline(resume_text: str, jd_text: str, job_title: str = "") -> dict:
    initial_state: PipelineState = {
        "resume_text": resume_text,
        "jd_text": jd_text,
        "job_title": job_title,
        "resume_tailor": "",
        "cover_letter": "",
        "interview_prep": "",
        "skill_gap": "",
        "ats_score": {},
    }
    result = await _compiled_graph.ainvoke(initial_state)
    return {
        "resume_tailor": result["resume_tailor"],
        "cover_letter": result["cover_letter"],
        "interview_prep": result["interview_prep"],
        "skill_gap": result["skill_gap"],
        "ats_score": result["ats_score"],
    }
