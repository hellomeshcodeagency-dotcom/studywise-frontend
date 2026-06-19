import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

export default function UpgradeButton({ className = '', label = '⚡ Upgrade — ₦700/mo', style = {} }) {
  const { user, hasPremium } = useAuth()
  const [loading, setLoading] = useState(false)

  if (hasPremium()) return null

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await api.post('/payment/initialize')
      // Redirect to Paystack payment page
      window.location.href = res.data.authorization_url
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start payment. Try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`btn-primary ${className}`}
      style={style}
    >
      {loading
        ? <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
            Redirecting…
          </span>
        : label
      }
    </button>
  )
}
