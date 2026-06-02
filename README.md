# CareerPilot 🚀

> AI-powered job application assistant — tailors your resume, writes cover letters, preps you for interviews, and identifies skill gaps in one click.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![LangGraph](https://img.shields.io/badge/LangGraph-FF6B6B?style=flat)
![Groq](https://img.shields.io/badge/Groq-F55036?style=flat)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=flat&logo=tailwindcss&logoColor=white)

---

## Architecture

```
CareerPilot/
├── frontend/          → React + Vite + Tailwind
│   └── src/
│       ├── pages/     → Login, Dashboard, Results, History
│       ├── components/→ Navbar
│       ├── context/   → AuthContext (Supabase auth)
│       └── lib/       → api.js (Axios), supabaseClient.js
├── backend/           → FastAPI
│   ├── agents/        → resume_tailor.py, cover_letter.py, interview_prep.py, skill_gap.py
│   ├── graph/         → langgraph_pipeline.py  (parallel fan-out)
│   ├── routes/        → upload.py, analyze.py, history.py
│   └── utils/         → pdf_parser.py, pdf_generator.py, supabase_client.py
└── supabase/
    └── schema.sql     → DB schema + RLS policies
```

### Agent Pipeline

```
User Request
     │
     ▼
LangGraph StateGraph
     │
     └── run_agents (asyncio.gather)
            ├── Agent 1: Resume Tailor      (llama3-70b via Groq)
            ├── Agent 2: Cover Letter       (llama3-70b via Groq)
            ├── Agent 3: Interview Prep     (llama3-70b via Groq)
            └── Agent 4: Skill Gap Analyzer (llama3-70b via Groq)
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Supabase](https://supabase.com) project
- [Groq](https://console.groq.com) API key (free tier available)

### 1. Supabase Setup
1. Create a new Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Go to Storage → Create bucket named `resumes` (private)
4. Copy your **Project URL**, **anon key**, and **service role key**

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Fill in your keys in .env

uvicorn main:app --reload
```

Backend runs at `http://localhost:8000` · Docs at `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (backend only, never expose) |
| `GROQ_API_KEY` | Groq API key |
| `TAVILY_API_KEY` | Tavily search key (optional, for skill gap enrichment) |
| `FRONTEND_URL` | Frontend origin for CORS |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_API_URL` | Backend URL (default: `http://localhost:8000`) |

---

## Features

- **Resume Tailoring** — rewrites bullet points to match JD keywords
- **Cover Letter Generation** — structured 3-paragraph letter
- **Interview Prep** — 10 role-specific Q&A pairs (behavioral + technical)
- **Skill Gap Analysis** — matched skills, gaps, and free learning resources
- **PDF Export** — download a full report as PDF
- **History** — all past analyses saved and accessible

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | `npm run build` → deploy `dist/` |
| Backend | Render | Free tier, set env vars in dashboard |

---

## License

MIT
