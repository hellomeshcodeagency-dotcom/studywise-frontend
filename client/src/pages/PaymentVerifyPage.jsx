import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'

export default function PaymentVerifyPage() {
  const [searchParams]      = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying | success | failed
  const [message, setMessage] = useState('')
  const { setUser }         = useAuth()
  const navigate            = useNavigate()

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) { setStatus('failed'); setMessage('No payment reference found.'); return }
    verify(reference)
  }, [])

  async function verify(reference) {
    try {
      const res = await api.get(`/payment/verify/${reference}`)
      // Update user in context with new premium status
      setUser(u => ({ ...u, plan: 'premium', premium_until: res.data.premium_until }))
      setStatus('success')
      setMessage(res.data.message)
      // Redirect to dashboard after 3 seconds
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (err) {
      setStatus('failed')
      setMessage(err.response?.data?.error || 'Payment verification failed. Contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="glass-strong rounded-2xl p-10 w-full max-w-md text-center">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-violet border-t-transparent animate-spin mx-auto mb-6"/>
            <h2 className="font-display font-bold text-white text-xl mb-2">Verifying payment…</h2>
            <p className="text-text-2 text-sm">Please wait, do not close this page.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-5">🎉</div>
            <h2 className="font-display font-bold text-white text-2xl mb-3">Payment Successful!</h2>
            <p className="text-emerald-400 font-semibold mb-2">Premium activated for 30 days</p>
            <p className="text-text-2 text-sm mb-6">{message}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-text-3">
              <div className="w-3 h-3 rounded-full border-2 border-violet border-t-transparent animate-spin"/>
              Redirecting to dashboard…
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="text-6xl mb-5">❌</div>
            <h2 className="font-display font-bold text-white text-xl mb-3">Verification Failed</h2>
            <p className="text-text-2 text-sm mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/dashboard')}
                className="btn-primary justify-center w-full">
                Back to Dashboard
              </button>
              <a href="mailto:support@studiwise.com"
                className="text-xs text-text-3 hover:text-text-2 transition-colors">
                Contact support
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
