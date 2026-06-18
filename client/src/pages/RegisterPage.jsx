import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm]         = useState({ name: '', email: '', password: '', referral_code: '' })
  const [loading, setLoading]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [refApplied, setRefApplied] = useState(false)
  const { register }            = useAuth()
  const navigate                = useNavigate()
  const [searchParams]          = useSearchParams()

  // Auto-fill referral code from URL ?ref=CODE
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setForm(f => ({ ...f, referral_code: ref.toUpperCase() }))
      setRefApplied(true)
    }
  }, [])

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  function validate() {
    if (!form.name.trim())         return 'Please enter your name'
    if (form.name.trim().length < 2) return 'Name must be at least 2 characters'
    if (!form.email)               return 'Please enter your email'
    if (!form.email.includes('@')) return 'Please enter a valid email'
    if (!form.password)            return 'Please enter a password'
    if (form.password.length < 6)  return 'Password must be at least 6 characters'
    return null
  }

  async function submit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      const user = await register({
        name:          form.name.trim(),
        email:         form.email.toLowerCase(),
        password:      form.password,
        referral_code: form.referral_code.trim() || undefined,
      })
      toast.success(`Welcome to StudyWise, ${user.name.split(' ')[0]}! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const trialDays = form.referral_code ? 10 : 7

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Orbs */}
      <div className="absolute rounded-full filter blur-[100px] opacity-30 w-[500px] h-[500px] -top-32 -right-32"
           style={{ background: 'radial-gradient(circle,rgba(236,72,153,.65),transparent 70%)' }} />
      <div className="absolute rounded-full filter blur-[100px] opacity-25 w-[400px] h-[400px] -bottom-20 -left-20"
           style={{ background: 'radial-gradient(circle,rgba(124,58,237,.6),transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>📚</div>
            <span className="font-display font-extrabold text-2xl text-white tracking-tight">StudyWise</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create your account</h1>
          <p className="text-text-2 text-sm">Start studying smarter today — free for {trialDays} days</p>
        </div>

        {/* Trial badge */}
        <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3"
             style={{ background: refApplied ? 'rgba(6,182,212,.1)' : 'rgba(124,58,237,.1)', border: `1px solid ${refApplied ? 'rgba(6,182,212,.3)' : 'rgba(124,58,237,.3)'}` }}>
          <span className="text-xl">{refApplied ? '🎁' : '⏳'}</span>
          <div>
            {refApplied ? (
              <>
                <div className="text-sm font-bold" style={{ color: '#22D3EE' }}>Referral applied! You get 10 days free</div>
                <div className="text-xs text-text-2">Your friend gave you 3 extra trial days</div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold" style={{ color: '#9D5FF5' }}>3 days full access — completely free</div>
                <div className="text-xs text-text-2">No credit card required. Cancel anytime.</div>
              </>
            )}
          </div>
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
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="e.g. Tunde Okafor"
                className="input-field"
                autoComplete="name"
              />
            </div>

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
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="Min. 6 characters"
                  className="input-field pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors text-lg"
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                         style={{
                           background: form.password.length >= i * 3
                             ? i <= 1 ? '#EF4444' : i <= 2 ? '#F59E0B' : i <= 3 ? '#3B82F6' : '#10B981'
                             : 'rgba(255,255,255,.1)'
                         }} />
                  ))}
                </div>
              )}
            </div>

            {/* Referral code */}
            <div>
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">
                Referral code <span className="text-text-3 normal-case font-normal">(optional — get 10 days free)</span>
              </label>
              <input
                type="text"
                name="referral_code"
                value={form.referral_code}
                onChange={e => {
                  handle(e)
                  setRefApplied(e.target.value.trim().length > 3)
                }}
                placeholder="e.g. TUNDE24"
                className="input-field"
                style={{ textTransform: 'uppercase' }}
                maxLength={20}
              />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3.5 mt-1 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : `🚀 Start ${trialDays}-day free trial`}
            </button>
          </form>

          {/* What you get */}
          <div className="mt-6 pt-6 border-t border-white/8">
            <p className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">What you get free:</p>
            <div className="grid grid-cols-2 gap-2">
              {['AI Explanations','Smart Quizzes','Flashcards','Mind Maps','AI Tutor Chat','Practice Problems'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-text-2">
                  <span className="text-emerald-400 text-[0.7rem]">✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.08)' }} />
            <span className="text-xs text-text-3 font-medium">Already have an account?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.08)' }} />
          </div>

          <Link to="/login" className="btn-ghost w-full justify-center">Log in instead</Link>
        </div>

        <p className="text-center text-xs text-text-3 mt-6">
          By signing up you agree to our{' '}
          <a href="#" className="text-text-2 hover:text-white transition-colors">Terms of Use</a>
          {' '}and{' '}
          <a href="#" className="text-text-2 hover:text-white transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
