import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Briefcase, LayoutDashboard, Clock, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    setShowDropdown(false)
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl 2xl:max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-bold text-slate-900 text-lg"
          onClick={() => setMenuOpen(false)}
        >
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          CareerPilot
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive('/dashboard') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive('/history') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" /> History
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.user_metadata?.full_name || user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setMenuOpen(false)}
            />
            {/* Slide-in menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu items */}
              <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    isActive('/history')
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-5 h-5" /> History
                </Link>
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
