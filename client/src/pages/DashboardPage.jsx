import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { LogOut, BookOpen, Clock, Zap, Trophy, Flame, BarChart2, ChevronRight, Copy, Lock, Plus } from 'lucide-react'

/* ─── SIDEBAR ───────────────────────────────────────── */
function Sidebar({ active }) {
  const { user, logout, trialDaysLeft, isOnTrial, hasPremium } = useAuth()
  const navigate = useNavigate()
  const days = trialDaysLeft()

  const links = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/study',     icon: '📚', label: 'Study Room' },
    { to: '/history',   icon: '📋', label: 'History' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40 border-r border-white/8"
           style={{ background: '#0A0A14' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/8">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
               style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>📚</div>
          <span className="font-display font-extrabold text-lg text-white tracking-tight">StudyWise</span>
        </Link>
      </div>

      {/* Trial / Plan badge */}
      {isOnTrial() ? (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl"
             style={{ background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="text-xs font-bold mb-0.5" style={{ color: '#9D5FF5' }}>⏳ Free Trial</div>
          <div className="text-xs text-text-2">{days} day{days !== 1 ? 's' : ''} remaining</div>
          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
            <div className="h-full rounded-full" style={{ width: `${(days / 3) * 100}%`, background: 'linear-gradient(90deg,#7C3AED,#EC4899)' }} />
          </div>
        </div>
      ) : hasPremium() ? (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl"
             style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)' }}>
          <div className="text-xs font-bold text-emerald-400">✨ Premium Active</div>
          <div className="text-xs text-text-2 mt-0.5">Full access unlocked</div>
        </div>
      ) : (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl"
             style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)' }}>
          <div className="text-xs font-bold text-amber-400">🔓 Free Plan</div>
          <div className="text-xs text-text-2 mt-0.5">Upgrade for ₦500/month</div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 mt-5 flex flex-col gap-1">
        {links.map(l => (
          <Link key={l.to} to={l.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all ${
                  active === l.label
                    ? 'text-white'
                    : 'text-text-2 hover:text-white hover:bg-white/5'
                }`}
                style={active === l.label ? { background: 'rgba(124,58,237,.2)', color: '#fff' } : {}}>
            <span className="text-base">{l.icon}</span>
            {l.label}
            {active === l.label && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#9D5FF5' }} />}
          </Link>
        ))}

        {/* Upgrade CTA if not premium */}
        {!hasPremium() && (
          <div className="mt-4 mx-0">
            <button onClick={() => toast('Paystack payments coming soon! 🚀')}
                    className="btn-primary w-full justify-center text-xs py-2.5">
              ⚡ Upgrade — ₦500/mo
            </button>
          </div>
        )}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
               style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[0.65rem] text-text-3 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); toast('Logged out successfully') }}
                className="flex items-center gap-2 text-xs text-text-3 hover:text-text-2 transition-colors w-full">
          <LogOut size={13} /> Log out
        </button>
      </div>
    </aside>
  )
}

/* ─── STAT CARD ─────────────────────────────────────── */
function StatCard({ icon, label, value, sub, grad }) {
  return (
    <div className="glass rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
             style={{ background: grad || 'rgba(124,58,237,.15)' }}>
          {icon}
        </div>
      </div>
      <div className="font-display font-extrabold text-3xl tracking-tight text-white mb-1">{value}</div>
      <div className="text-sm font-semibold text-white mb-0.5">{label}</div>
      {sub && <div className="text-xs text-text-3">{sub}</div>}
    </div>
  )
}

/* ─── TOOL CARD ─────────────────────────────────────── */
function ToolCard({ icon, title, desc, locked, onClick, grad }) {
  return (
    <button onClick={locked ? () => toast('Upgrade to Premium to unlock this! 🔒') : onClick}
            className={`glass rounded-2xl p-5 text-left w-full transition-all hover:-translate-y-0.5 ${locked ? 'opacity-60' : 'hover:border-violet/40'}`}
            style={{ border: '1px solid rgba(255,255,255,.08)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: grad }}>
          {icon}
        </div>
        {locked && <Lock size={14} className="text-text-3 mt-1" />}
      </div>
      <div className="font-display font-semibold text-sm text-white mb-1">{title}</div>
      <div className="text-xs text-text-3 leading-relaxed">{desc}</div>
    </button>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────── */
export default function DashboardPage() {
  const { user, hasPremium, isOnTrial, trialDaysLeft } = useAuth()
  const [stats, setStats]     = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)
  const navigate              = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, profileRes] = await Promise.all([
          api.get('/user/stats'),
          api.get('/user/profile'),
        ])
        setStats(statsRes.data)
        setProfile(profileRes.data)
      } catch (e) {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function copyReferral() {
    const link = `https://studiwise.netlify.app/register?ref=${user?.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const progress  = profile?.progress || {}
  const trial     = profile?.trial    || {}
  const isPremium = hasPremium()
  const days      = trialDaysLeft()

  const tools = [
    { icon:'💡', title:'Explain',         desc:'Get AI explanations at your level',         grad:'rgba(124,58,237,.15)', locked: false },
    { icon:'✅', title:'Quiz',            desc:'Test yourself with smart questions',         grad:'rgba(16,185,129,.15)', locked: false },
    { icon:'🃏', title:'Flashcards',      desc:'Active recall flip cards',                  grad:'rgba(236,72,153,.15)', locked: false },
    { icon:'📋', title:'Summary',         desc:'Key points and structured notes',            grad:'rgba(245,158,11,.15)', locked: !isPremium },
    { icon:'🕸️', title:'Mind Map',        desc:'Visual concept web of your material',        grad:'rgba(6,182,212,.15)',  locked: !isPremium },
    { icon:'🤖', title:'AI Tutor Chat',   desc:'Ask questions about your content',           grad:'rgba(124,58,237,.15)', locked: !isPremium },
    { icon:'🧩', title:'Practice Probs',  desc:'AI-generated worked examples',               grad:'rgba(245,158,11,.15)', locked: !isPremium },
    { icon:'⏱️', title:'Pomodoro Timer',  desc:'Focus timer built into your session',        grad:'rgba(16,185,129,.15)', locked: false },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Sidebar active="Dashboard" />

      <main className="ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-white mb-1">
                Hey, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-text-2 text-sm">
                {progress.streak > 0
                  ? `🔥 ${progress.streak}-day streak! Keep it up.`
                  : 'Ready to study? Upload something to get started.'}
              </p>
            </div>
            <Link to="/study" className="btn-primary gap-2">
              <Plus size={16} /> New Study Session
            </Link>
          </div>

          {/* Trial warning banner */}
          {isOnTrial() && days <= 1 && (
            <div className="mb-6 px-5 py-4 rounded-2xl flex items-center justify-between gap-4"
                 style={{ background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="text-sm font-bold text-amber-400">Your trial ends {days === 0 ? 'today' : 'tomorrow'}!</div>
                  <div className="text-xs text-text-2">Upgrade to keep full access for just ₦500/month</div>
                </div>
              </div>
              <button onClick={() => toast('Paystack payments coming soon! 🚀')}
                      className="btn-primary text-sm py-2 px-5 flex-shrink-0">
                Upgrade now
              </button>
            </div>
          )}

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="glass rounded-2xl p-5 h-32 animate-pulse" style={{ background: 'rgba(255,255,255,.04)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon="📚" label="Sessions" value={progress.totalSessions || 0} sub="Total study sessions" grad="rgba(124,58,237,.15)" />
              <StatCard icon="🔥" label="Day Streak" value={progress.streak || 0} sub={`Best: ${progress.longestStreak || 0} days`} grad="rgba(245,158,11,.15)" />
              <StatCard icon="✅" label="Quizzes" value={progress.totalQuizzes || 0} sub="Questions answered" grad="rgba(16,185,129,.15)" />
              <StatCard icon="🎯" label="Avg Score" value={`${Math.round(progress.avgQuizScore || 0)}%`} sub="Quiz accuracy" grad="rgba(236,72,153,.15)" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tools grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-white">Study Tools</h2>
                <span className="text-xs text-text-3">{isPremium ? 'All tools unlocked ✨' : 'Some tools require Premium'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {tools.map(t => (
                  <ToolCard key={t.title} {...t} onClick={() => navigate('/study')} />
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              {/* Recent sessions */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-white">Recent Sessions</h3>
                  <Link to="/history" className="text-xs font-medium no-underline transition-colors" style={{ color: '#9D5FF5' }}>
                    View all
                  </Link>
                </div>
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,.04)' }} />)}
                  </div>
                ) : stats?.recentSessions?.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentSessions.map(s => (
                      <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                           onClick={() => navigate('/study')}>
                        <span className="text-base flex-shrink-0">
                          {s.source_type === 'pdf' ? '📄' : s.source_type === 'url' ? '🔗' : '📝'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-white truncate">{s.title || 'Untitled Session'}</div>
                          <div className="text-[0.65rem] text-text-3">
                            {new Date(s.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short' })}
                          </div>
                        </div>
                        <ChevronRight size={13} className="text-text-3 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-xs text-text-3">No sessions yet</p>
                    <Link to="/study" className="text-xs font-medium no-underline mt-2 block" style={{ color: '#9D5FF5' }}>
                      Start your first session →
                    </Link>
                  </div>
                )}
              </div>

              {/* Tool usage breakdown */}
              {stats?.toolUsage?.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-display font-bold text-base text-white mb-4">Most Used Tools</h3>
                  <div className="space-y-3">
                    {stats.toolUsage.slice(0, 4).map(t => {
                      const max = stats.toolUsage[0]?.count || 1
                      const icons = { explain:'💡', quiz:'✅', flashcards:'🃏', summary:'📋', mindmap:'🕸️', chat:'🤖', practice:'🧩', pomodoro:'⏱️' }
                      return (
                        <div key={t.tool}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-2 capitalize flex items-center gap-1.5">
                              {icons[t.tool] || '📌'} {t.tool}
                            </span>
                            <span className="text-xs font-bold text-white">{t.count}x</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                            <div className="h-full rounded-full" style={{ width: `${(t.count / max) * 100}%`, background: 'linear-gradient(90deg,#7C3AED,#EC4899)' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Referral card */}
              <div className="rounded-2xl p-5"
                   style={{ background: 'linear-gradient(135deg,rgba(6,182,212,.12),rgba(124,58,237,.12))', border: '1px solid rgba(6,182,212,.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎁</span>
                  <h3 className="font-display font-bold text-sm text-white">Refer &amp; Earn</h3>
                </div>
                <p className="text-xs text-text-2 leading-relaxed mb-3">
                  Refer 5 friends → get <strong className="text-white">1 month free premium</strong>. They get 6 days free!
                </p>
                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-3">Progress</span>
                    <span className="text-xs font-bold" style={{ color: '#22D3EE' }}>
                      {user?.referral_count || 0}/5 friends
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${Math.min(((user?.referral_count || 0) / 5) * 100, 100)}%`, background: 'linear-gradient(90deg,#06B6D4,#7C3AED)' }} />
                  </div>
                </div>
                {/* Referral link */}
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono"
                     style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#22D3EE' }}>
                  <span className="truncate flex-1">studiwise.netlify.app/register?ref={user?.referral_code}</span>
                  <button onClick={copyReferral} className="text-text-3 hover:text-white transition-colors flex-shrink-0">
                    {copied ? '✅' : <Copy size={12} />}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
