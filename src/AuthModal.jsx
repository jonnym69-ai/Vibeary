import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import { X } from 'lucide-react'

const AuthModal = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = isSignUp 
        ? await signUp({ email, password })
        : await signIn({ email, password })
      
      if (error) throw error
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-slate-400 hover:text-amber-500 mt-4 text-sm"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  )
}

export default AuthModal
