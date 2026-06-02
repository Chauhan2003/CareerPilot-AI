import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileText, Mail, MessageSquare, TrendingUp, Download, ArrowLeft, Copy, Check } from 'lucide-react'
import { downloadReport } from '../lib/api'
import Navbar from '../components/Navbar'

const TABS = [
  { key: 'resume_tailor', label: 'Tailored Resume', icon: FileText, color: 'text-blue-500' },
  { key: 'cover_letter', label: 'Cover Letter', icon: Mail, color: 'text-purple-500' },
  { key: 'interview_prep', label: 'Interview Prep', icon: MessageSquare, color: 'text-green-500' },
  { key: 'skill_gap', label: 'Skill Gap', icon: TrendingUp, color: 'text-orange-500' },
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('resume_tailor')
  const [downloading, setDownloading] = useState(false)

  const results = state?.results
  const jobTitle = state?.jobTitle || 'Job Application'

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No results to display.</p>
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline text-sm">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { data } = await downloadReport({
        resume_text: state.resumeText || '',
        job_description: state.jobDescription || '',
        job_title: jobTitle,
      })
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'careerpilot_report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
    } finally {
      setDownloading(false)
    }
  }

  const activeContent = results[activeTab] || ''

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> New Analysis
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{jobTitle || 'Analysis Results'}</h1>
            <p className="text-slate-500 text-sm mt-1">Your AI-generated job application materials</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Generating…' : 'Download Full Report'}
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 shadow-sm overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-white' : tab.color}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">
              {TABS.find((t) => t.key === activeTab)?.label}
            </h2>
            <CopyButton text={activeContent} />
          </div>
          <div className="px-6 py-5">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
              {activeContent || 'No content generated.'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}
