import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory, getAnalysis, deleteAnalysis } from '../lib/api'
import { Clock, Trash2, Eye, Briefcase, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'

export default function History() {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    getHistory()
      .then(({ data }) => setAnalyses(data.analyses || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleView = async (id) => {
    try {
      const { data } = await getAnalysis(id)
      navigate('/results', {
        state: {
          results: {
            resume_tailor: data.resume_tailor,
            cover_letter: data.cover_letter,
            interview_prep: data.interview_prep,
            skill_gap: data.skill_gap,
          },
          jobTitle: data.job_title,
        },
      })
    } catch {}
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await deleteAnalysis(id)
      setAnalyses((prev) => prev.filter((a) => a.id !== id))
    } catch {}
    setDeleting(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-slate-900">Analysis History</h1>
          <p className="text-slate-500 mt-1 text-sm">All your previous job application analyses.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : analyses.length === 0 ? (
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No analyses yet.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Start your first analysis →
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between shadow-sm hover:border-blue-300 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {analysis.job_title || 'Untitled Job'}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(analysis.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleView(analysis.id)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(analysis.id)}
                    disabled={deleting === analysis.id}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {deleting === analysis.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
