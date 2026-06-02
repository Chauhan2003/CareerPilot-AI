import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Briefcase, Loader2, CheckCircle, X, BookMarked, Trash2, Plus } from 'lucide-react'
import { uploadResume, analyzeApplication, getSavedResumes, saveResume, deleteSavedResume, getSavedResume } from '../lib/api'
import Navbar from '../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'

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

  const [savedResumes, setSavedResumes] = useState([])
  const [selectedSavedId, setSelectedSavedId] = useState(null)
  const [savingResume, setSavingResume] = useState(false)
  const [resumeName, setResumeName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    getSavedResumes()
      .then(({ data }) => setSavedResumes(data.resumes || []))
      .catch(() => {})
  }, [])

  const AGENTS = [
    'Resume Fix',
    'Cover Letter',
    'How to Speak',
    'Skill Gaps',
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

  const handleSelectSaved = async (id) => {
    setSelectedSavedId(id)
    setResumeFile(null)
    setUploadDone(false)
    setError('')
    try {
      const { data } = await getSavedResume(id)
      setResumeText(data.resume.resume_text)
      setUploadDone(true)
    } catch {
      setError('Failed to load saved resume.')
      setSelectedSavedId(null)
    }
  }

  const handleSaveResume = async () => {
    if (!resumeText || !resumeName.trim()) return
    setSavingResume(true)
    try {
      const { data } = await saveResume({ name: resumeName.trim(), resume_text: resumeText })
      setSavedResumes((prev) => [data.resume, ...prev])
      setShowSaveInput(false)
      setResumeName('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save resume.')
    } finally {
      setSavingResume(false)
    }
  }

  const handleDeleteSaved = async (id, e) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await deleteSavedResume(id)
      setSavedResumes((prev) => prev.filter((r) => r.id !== id))
      if (selectedSavedId === id) {
        setSelectedSavedId(null)
        setResumeText('')
        setUploadDone(false)
      }
    } catch {}
    setDeletingId(null)
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
      navigate('/results', { state: { results: data, jobTitle, resumeText, jobDescription } })
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
      <main className="max-w-3xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 2xl:py-14">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-slate-900">Analyze Your Application</h1>
          <p className="text-slate-500 mt-1 text-sm 2xl:text-base">Upload your resume and paste the job description. We'll tell you what to improve.</p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <X className="w-4 h-4 flex-shrink-0" /> {error}
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Resume Section */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Resume (PDF)
            </h2>

            {/* Saved Resumes */}
            {savedResumes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5" /> Saved Resumes
                </p>
                <div className="space-y-2">
                  {savedResumes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleSelectSaved(r.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        selectedSavedId === r.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {selectedSavedId === r.id
                          ? <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          : <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{r.name}</p>
                          <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSaved(r.id, e)}
                        disabled={deletingId === r.id}
                        className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        {deletingId === r.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
                {savedResumes.length < 2 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-400">or upload new</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                )}
              </div>
            )}

            {/* Upload New (hidden if at max saved) */}
            {!(savedResumes.length >= 2 && !selectedSavedId) && (
              <>
                {savedResumes.length < 2 && (
                  <>
                    <div
                      onClick={() => { fileInputRef.current?.click(); setSelectedSavedId(null) }}
                      className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center cursor-pointer transition-colors ${
                        resumeFile && !selectedSavedId ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {resumeFile && !selectedSavedId ? (
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
                    {resumeFile && !selectedSavedId && !uploadDone && (
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
                      >
                        {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {uploading ? 'Reading PDF…' : 'Upload Resume'}
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {/* Status + Save option */}
            {uploadDone && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {selectedSavedId ? 'Saved resume loaded' : 'Resume parsed successfully'}
                </p>
                {!selectedSavedId && savedResumes.length < 2 && (
                  <AnimatePresence>
                    {!showSaveInput ? (
                      <button
                        onClick={() => setShowSaveInput(true)}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save this resume for later
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={resumeName}
                          onChange={(e) => setResumeName(e.target.value)}
                          placeholder="Resume name (e.g. Software Engineer CV)"
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveResume()}
                        />
                        <button
                          onClick={handleSaveResume}
                          disabled={savingResume || !resumeName.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          {savingResume ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                        </button>
                        <button
                          onClick={() => { setShowSaveInput(false); setResumeName('') }}
                          className="text-slate-400 hover:text-slate-600 px-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )}
          </motion.div>

          {/* Job Details */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          >
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
          </motion.div>

          {/* Analyze Button */}
          <motion.button
            onClick={handleAnalyze}
            disabled={analyzing || !uploadDone || !jobDescription.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 sm:py-3.5 text-sm sm:text-base flex items-center justify-center gap-2 transition-colors shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {analyzing ? 'Analyzing…' : 'Analyze My Application'}
          </motion.button>

          {/* Agent Progress */}
          {analyzing && agentStatus.length > 0 && (
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm font-medium text-slate-700 mb-3">Working on it…</p>
              <div className="space-y-2">
                {agentStatus.map((agent) => (
                  <motion.div
                    key={agent.name}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {agent.done
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />}
                    <span className={`text-sm ${agent.done ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'}`}>
                      {agent.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
