import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Briefcase, Loader2, CheckCircle, X } from 'lucide-react'
import { uploadResume, analyzeApplication } from '../lib/api'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const [error, setError] = useState('')
  const [agentStatus, setAgentStatus] = useState([])

  const AGENTS = [
    'Resume Tailor',
    'Cover Letter Writer',
    'Interview Prep',
    'Skill Gap Analyzer',
  ]

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    setResumeFile(file)
    setUploadDone(false)
    setResumeText('')
    setError('')
  }

  const handleUpload = async () => {
    if (!resumeFile) return
    setUploading(true)
    setError('')
    try {
      const { data } = await uploadResume(resumeFile)
      setResumeText(data.resume_text)
      setUploadDone(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!resumeText) { setError('Please upload your resume first.'); return }
    if (!jobDescription.trim()) { setError('Please paste the job description.'); return }

    setError('')
    setAnalyzing(true)
    setAgentStatus(AGENTS.map((name) => ({ name, done: false })))

    const ticker = setInterval(() => {
      setAgentStatus((prev) => {
        const next = [...prev]
        const idx = next.findIndex((a) => !a.done)
        if (idx !== -1) next[idx] = { ...next[idx], done: true }
        return next
      })
    }, 2500)

    try {
      const { data } = await analyzeApplication({ resume_text: resumeText, job_description: jobDescription, job_title: jobTitle })
      clearInterval(ticker)
      navigate('/results', { state: { results: data, jobTitle } })
    } catch (err) {
      clearInterval(ticker)
      setError(err.response?.data?.detail || 'Analysis failed. Check your API keys and try again.')
    } finally {
      setAnalyzing(false)
      setAgentStatus([])
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">New Application Analysis</h1>
          <p className="text-slate-500 mt-1 text-sm">Upload your resume and paste the job description to get AI-powered tailoring.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Resume Upload */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Resume (PDF)
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                resumeFile ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {resumeFile ? (
                <div className="flex items-center justify-center gap-3">
                  {uploadDone
                    ? <CheckCircle className="w-6 h-6 text-green-500" />
                    : <FileText className="w-6 h-6 text-blue-500" />}
                  <span className="text-sm font-medium text-slate-700">{resumeFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click to upload your resume PDF</p>
                  <p className="text-xs text-slate-400 mt-1">Max 5 MB</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            {resumeFile && !uploadDone && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Parsing PDF…' : 'Upload & Parse Resume'}
              </button>
            )}
            {uploadDone && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Resume parsed successfully
              </p>
            )}
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" /> Job Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Description <span className="text-red-500">*</span></label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here…"
                  rows={10}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !uploadDone || !jobDescription.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-base flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {analyzing ? 'Running AI Agents…' : 'Analyze My Application'}
          </button>

          {/* Agent Progress */}
          {analyzing && agentStatus.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-700 mb-3">Agent Progress</p>
              <div className="space-y-2">
                {agentStatus.map((agent) => (
                  <div key={agent.name} className="flex items-center gap-3">
                    {agent.done
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />}
                    <span className={`text-sm ${agent.done ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'}`}>
                      {agent.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
