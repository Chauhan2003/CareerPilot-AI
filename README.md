# CareerPilot 🚀

> AI-powered job application assistant — upload your resume and a job description, and get resume fixes, cover letters, interview speaking scripts, and skill gap analysis in seconds.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![LangGraph](https://img.shields.io/badge/LangGraph-FF6B6B?style=flat)
![Groq](https://img.shields.io/badge/Groq-F55036?style=flat)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=flat&logo=tailwindcss&logoColor=white)

---

## About CareerPilot

CareerPilot helps job seekers optimize their applications using AI. Simply upload your resume (PDF) and paste a job description — the system runs 5 specialized AI agents in parallel to:

1. **Resume Fix** — rewrites bullet points to match job description keywords
2. **Cover Letter** — generates a professional 3-paragraph cover letter
3. **How to Speak** — provides scripts for self-introductions, project explanations, and interview answers
4. **Skill Gaps** — identifies missing skills and suggests free learning resources
5. **ATS Score** — calculates an overall match score (0-100) with detailed breakdown

All results are saved to your history, and you can download a full PDF report.

---

## How It Works

```
User uploads resume + pastes job description
           ↓
Frontend (React) sends data to Backend (FastAPI)
           ↓
Backend parses PDF with PyMuPDF → extracts text
           ↓
LangGraph orchestrates 5 AI agents running in parallel
           ↓
Each agent calls Groq LLM (llama-3.3-70b-versatile) via LangChain
           ├─ Resume Tailor Agent
           ├─ Cover Letter Agent
           ├─ How to Speak Agent
           ├─ Skill Gap Agent
           └─ ATS Scorer Agent
           ↓
Results saved to Supabase database
           ↓
Frontend displays results in tabs + PDF download option
```

**Why parallel execution?** Running 5 agents sequentially would take ~50 seconds. Running them in parallel via `asyncio.gather` takes ~10 seconds.

---

## Tech Stack

### Frontend
- **React 19** — UI framework
- **Vite** — Fast build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **React Router** — Client-side routing
- **Axios** — HTTP client for API calls
- **Lucide React** — Icon library
- **Framer Motion** — Animation library

### Backend
- **FastAPI** — Modern Python web framework with async support
- **PyMuPDF** — PDF text extraction
- **ReportLab** — PDF generation for downloadable reports
- **Pydantic** — Data validation and settings
- **HTTPX** — Async HTTP client

### AI & Orchestration
- **LangChain** — LLM abstraction layer (connects to Groq)
- **LangGraph** — Multi-agent workflow orchestration
- **Groq** — Fast LLM inference using `llama-3.3-70b-versatile`

### Infrastructure
- **Supabase** — Authentication, PostgreSQL database, and file storage
  - Auth — User sign up / sign in with JWT tokens
  - Database — Stores analysis history with Row Level Security
  - Storage — Stores uploaded resume PDFs (private bucket)
- **Render** — Backend deployment platform (configuration included)
- **Vercel** — Frontend deployment platform

---

## Project Structure

```
CareerPilot/
├── frontend/          → React + Vite + Tailwind
│   └── src/
│       ├── pages/     → Login, Dashboard, Results, History
│       ├── components/→ Navbar
│       ├── context/   → AuthContext (Supabase auth)
│       ├── lib/       → api.js (Axios), supabaseClient.js
│       ├── App.jsx
│       └── main.jsx
├── backend/           → FastAPI
│   ├── agents/        → resume_tailor.py, cover_letter.py, interview_prep.py, skill_gap.py, ats_scorer.py
│   ├── graph/         → langgraph_pipeline.py  (parallel fan-out)
│   ├── routes/        → upload.py, analyze.py, history.py, resumes.py
│   ├── utils/         → pdf_parser.py, pdf_generator.py, supabase_client.py, deps.py
│   ├── config.py
│   ├── main.py
│   ├── render.yaml    → Render deployment config
│   └── requirements.txt
└── supabase/
    └── schema.sql     → DB schema + RLS policies
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Supabase](https://supabase.com) account (free)
- [Groq](https://console.groq.com) API key (free tier available)

### Step 1: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Storage** → Create a new bucket named `resumes` (set to **private**)
4. For the saved resumes feature, also run this SQL in the SQL Editor:
   ```sql
   CREATE TABLE saved_resumes (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id text NOT NULL,
     name text NOT NULL,
     resume_text text NOT NULL,
     storage_path text,
     created_at timestamptz DEFAULT now()
   );

   ALTER TABLE saved_resumes ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users manage own resumes"
     ON saved_resumes FOR ALL
     USING (auth.uid()::text = user_id);
   ```
5. From your Supabase project settings, copy:
   - **Project URL**
   - **anon key** (public key)
   - **service role key** (secret key for backend)

### Step 2: Set Up Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your keys:
# SUPABASE_URL=your-project-url
# SUPABASE_SERVICE_KEY=your-service-role-key
# GROQ_API_KEY=your-groq-api-key
# FRONTEND_URL=http://localhost:5173

uvicorn main:app --reload
```

Backend will run at `http://localhost:8000` · API docs at `http://localhost:8000/docs`

### Step 3: Set Up Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env and add your keys:
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_API_URL=http://localhost:8000

npm install
npm run dev
```

Frontend will run at `http://localhost:5173`

### Step 4: Use CareerPilot

1. Open `http://localhost:5173` in your browser
2. Sign up for a new account
3. Upload your resume (PDF)
4. Paste a job description
5. Click "Analyze My Application"
6. View results in the 4 tabs and download the PDF report

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Service role key (backend only, never expose) | Yes |
| `GROQ_API_KEY` | Groq API key | Yes |
| `TAVILY_API_KEY` | Tavily search key (optional, for skill gap enrichment) | No |
| `FRONTEND_URL` | Frontend origin for CORS | Yes |

### Frontend (`frontend/.env`)
| Variable | Description | Required |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key | Yes |
| `VITE_API_URL` | Backend URL (default: `http://localhost:8000`) | Yes |

---

## Features

- **📄 Resume Fix** — Rewrites your resume bullet points to match job description keywords
- **✉️ Cover Letter** — Creates a professional 3-paragraph cover letter tailored to the role
- **🎤 How to Speak** — Provides scripts for self-introductions, project explanations, and interview answers
- **📊 Skill Gaps** — Identifies missing skills and suggests free learning resources
- **🎯 ATS Score** — Calculates an overall match score (0-100) with keyword, skills, experience, and education breakdown
- **📥 PDF Export** — Download a full report with all AI-generated content
- **📜 History** — All past analyses saved and accessible anytime
- **🔐 Secure Auth** — User authentication via Supabase with JWT tokens
- **⚡ Parallel Execution** — 5 AI agents run simultaneously for fast results
- **📱 Responsive Design** — Optimized for mobile, tablet, laptop, and TV screens
- **🔑 Google Sign-In** — One-click authentication with Google OAuth
- **💾 Saved Resumes** — Store up to 2 resumes for quick reuse across job applications
- **👤 Profile Management** — Display user name in profile dropdown with click-outside close

---

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your deployed backend URL)
4. Deploy — Vercel will auto-deploy on every push

### Backend (Render)

1. Go to [Render](https://render.com) and create a new Web Service
2. Connect your GitHub repository
3. Set environment variables in Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `GROQ_API_KEY`
   - `FRONTEND_URL` (your deployed frontend URL)
4. Deploy — Render will auto-deploy on every push

**Note:** The project includes a `render.yaml` configuration file for easier deployment on Render.

---

## License

MIT License — feel free to use this project for learning or your own job search!
