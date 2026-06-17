import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sw_token')
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('sw_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('sw_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function register(data) {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('sw_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  function logout() {
    localStorage.removeItem('sw_token')
    setUser(null)
  }

  function isOnTrial() {
    if (!user?.trial_ends_at) return false
    return new Date(user.trial_ends_at) > new Date()
  }

  function trialDaysLeft() {
    if (!user?.trial_ends_at) return 0
    const diff = new Date(user.trial_ends_at) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  function hasPremium() {
    if (isOnTrial()) return true
    if (user?.plan === 'premium' && user?.premium_until) {
      return new Date(user.premium_until) > new Date()
    }
    return false
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isOnTrial, trialDaysLeft, hasPremium }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
