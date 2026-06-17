import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError]     = useState('')
  const { login }             = useAuth()
  const navigate              = useNavigate()

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="absolute rounded-full filter blur-[100px] opacity-30 w-[500px] h-[500px] -top-32 -left-32"
           style={{ background: 'radial-gradient(circle,rgba(124,58,237,.7),transparent 70%)' }} />
      <div className="absolute rounded-full filter blur-[100px] opacity-25 w-[400px] h-[400px] -bottom-20 -right-20"
           style={{ background: 'radial-gradient(circle,rgba(236,72,153,.6),transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>📚</div>
            <span className="font-display font-extrabold text-2xl text-white tracking-tight">StudyWise</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-text-2 text-sm">Log in to continue studying smarter</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                 style={{ background: 'rgba(236,72,153,.1)', border: '1px solid rgba(236,72,153,.3)', color: '#F472B6' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handle}
                placeholder="you@university.edu.ng"
                className="input-field"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-2 uppercase tracking-wider">Password</label>
                <button type="button" className="text-xs font-medium no-underline transition-colors"
                        style={{ color: '#9D5FF5' }}
                        onClick={() => toast('Password reset coming soon!')}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="Your password"
                  className="input-field pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors text-lg"
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3.5 mt-1 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Logging in…
                </span>
              ) : 'Log in →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.08)' }} />
            <span className="text-xs text-text-3 font-medium">Don't have an account?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.08)' }} />
          </div>

          <Link to="/register" className="btn-ghost w-full justify-center">
            Create free account
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-text-3 mt-6">
          By logging in you agree to our{' '}
          <a href="#" className="text-text-2 hover:text-white transition-colors">Terms of Use</a>
          {' '}and{' '}
          <a href="#" className="text-text-2 hover:text-white transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
