import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileText, Mail, MessageSquare, TrendingUp, Download, ArrowLeft, Copy, Check } from 'lucide-react'
import { downloadReport } from '../lib/api'
import Navbar from '../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { key: 'resume_tailor', label: 'Resume Fix', icon: FileText, color: 'text-blue-500' },
  { key: 'cover_letter', label: 'Cover Letter', icon: Mail, color: 'text-purple-500' },
  { key: 'interview_prep', label: 'How to Speak', icon: MessageSquare, color: 'text-green-500' },
  { key: 'skill_gap', label: 'Skill Gaps', icon: TrendingUp, color: 'text-orange-500' },
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

function FormattedContent({ text }) {
  if (!text) return <p className="text-slate-400 text-sm">No content generated.</p>

  const parseBold = (text) => {
    const parts = text.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, idx) =>
      idx % 2 === 1 ? <strong key={idx} className="font-semibold text-slate-900">{part}</strong> : part
    )
  }

  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      elements.push(<div key={i} className="h-3" />)
      i++
      continue
    }

    const isHeading = /^[A-Z][A-Z\s\d:&\/\-]{4,}:?\s*$/.test(trimmed)
    const isBullet = trimmed.startsWith('- ')
    const isNumbered = /^\d+\.\s/.test(trimmed)

    if (isHeading) {
      const headingText = trimmed.replace(/:$/, '')
      elements.push(
        <div key={i} className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 px-2 whitespace-nowrap">
            {headingText}
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
      )
    } else if (isBullet) {
      const content = trimmed.slice(2)
      const colonIdx = content.indexOf(':')
      const hasLabel = colonIdx > 0 && colonIdx < 60

      elements.push(
        <div key={i} className="flex gap-2.5 mb-2.5 items-start">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          <p className="text-sm text-slate-700 leading-relaxed">
            {hasLabel ? (
              <>
                <span className="font-semibold text-slate-900">{parseBold(content.slice(0, colonIdx))}</span>
                <span className="text-slate-500">:</span>
                <span className="text-slate-600"> {parseBold(content.slice(colonIdx + 1).trim())}</span>
              </>
            ) : parseBold(content)}
          </p>
        </div>
      )
    } else if (isNumbered) {
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/)
      const num = numMatch[1]
      const content = numMatch[2]
      const colonIdx = content.indexOf(':')
      const hasLabel = colonIdx > 0 && colonIdx < 60

      elements.push(
        <div key={i} className="flex gap-3 mb-3 items-start">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {num}
          </span>
          <p className="text-sm text-slate-700 leading-relaxed">
            {hasLabel ? (
              <>
                <span className="font-semibold text-slate-900">{parseBold(content.slice(0, colonIdx))}</span>
                <span className="text-slate-500">:</span>
                <span className="text-slate-600"> {parseBold(content.slice(colonIdx + 1).trim())}</span>
              </>
            ) : parseBold(content)}
          </p>
        </div>
      )
    } else {
      elements.push(
        <p key={i} className="text-sm text-slate-700 leading-relaxed mb-2">
          {parseBold(trimmed)}
        </p>
      )
    }

    i++
  }

  return <div>{elements}</div>
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
        <motion.div
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> New Analysis
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{jobTitle || 'Analysis Results'}</h1>
            <p className="text-slate-500 text-sm mt-1">Here's what to improve and how to prepare</p>
          </div>
          <motion.button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Generating…' : 'Download Full Report'}
          </motion.button>
        </motion.div>

        {/* Tab Nav */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 shadow-sm overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-white' : tab.color}`} />
                {tab.label}
              </motion.button>
            )
          })}
        </div>

        {/* Content */}
        <motion.div
          className="bg-white rounded-2xl border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">
              {TABS.find((t) => t.key === activeTab)?.label}
            </h2>
            <CopyButton text={activeContent} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="px-6 py-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FormattedContent text={activeContent} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}
