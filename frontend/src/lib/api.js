import axios from 'axios'
import { supabase } from './supabaseClient'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export const uploadResume = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const analyzeApplication = (payload) =>
  api.post('/api/analyze/', payload)

export const downloadReport = (payload) =>
  api.post('/api/analyze/download-report', payload, { responseType: 'blob' })

export const getAnalysisCount = () => api.get('/api/history/count')

export const getHistory = () => api.get('/api/history/')

export const getAnalysis = (id) => api.get(`/api/history/${id}`)

export const deleteAnalysis = (id) => api.delete(`/api/history/${id}`)

export const getSavedResumes = () => api.get('/api/resumes/')

export const saveResume = (payload) => api.post('/api/resumes/', payload)

export const getSavedResume = (id) => api.get(`/api/resumes/${id}`)

export const deleteSavedResume = (id) => api.delete(`/api/resumes/${id}`)
