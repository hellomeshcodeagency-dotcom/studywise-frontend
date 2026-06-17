import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppShell from '../components/layout/AppShell.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { Copy, Check, ChevronRight, Lock, Plus } from 'lucide-react'

function StatCard({ icon, label, value, sub, bg }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: bg }}>
        {icon}
      </div>
      <div className="font-display font-extrabold text-2xl md:text-3xl text-white mb-0.5">{value}</div>
      <div className="text-xs font-semibold text-white mb-0.5">{label}</div>
      {sub && <div className="text-[0.65rem] text-text-3">{sub}</div>}
    </div>
  )
}

function ToolCard({ icon, title, desc, locked, onClick, bg }) {
  return (
    <button onClick={locked ? () => toast('Upgrade to Premium to unlock! 🔒') : onClick}
      className={`glass rounded-xl p-4 text-left w-full transition-all active:scale-95 ${locked ? 'opacity-60' : 'hover:border-violet/40 active:bg-white/8'}`}
      style={{ border: '1px solid rgba(255,255,255,.08)' }}>
      <div className="flex items-start justify-between mb-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: bg }}>{icon}</div>
        {locked && <Lock size={13} className="text-text-3 mt-0.5" />}
      </div>
      <div className="font-display font-semibold text-sm text-white mb-1">{title}</div>
      <div className="text-[0.7rem] text-text-3 leading-relaxed">{desc}</div>
    </button>
  )
}

export default function DashboardPage() {
  const { user, hasPremium, isOnTrial, trialDaysLeft } = useAuth()
  const [stats, setStats]     = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)
  const navigate              = useNavigate()
  const isPremium             = hasPremium()
  const days                  = trialDaysLeft()

  useEffect(() => {
    Promise.all([api.get('/user/stats'), api.get('/user/profile')])
      .then(([s, p]) => { setStats(s.data); setProfile(p.data) })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  function copyReferral() {
    navigator.clipboard.writeText(`https://studiwise.netlify.app/register?ref=${user?.referral_code}`)
    setCopied(true); toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const progress = profile?.progress || {}

  const tools = [
    { icon:'💡', title:'Explain',        desc:'AI explanations at your level',     bg:'rgba(124,58,237,.15)', locked:false },
    { icon:'✅', title:'Quiz',           desc:'Test yourself with smart questions', bg:'rgba(16,185,129,.15)', locked:false },
    { icon:'🃏', title:'Flashcards',     desc:'Active recall flip cards',           bg:'rgba(236,72,153,.15)', locked:false },
    { icon:'📋', title:'Summary',        desc:'Key points & structured notes',      bg:'rgba(245,158,11,.15)', locked:!isPremium },
    { icon:'🕸️', title:'Mind Map',       desc:'Visual concept web',                bg:'rgba(6,182,212,.15)',  locked:!isPremium },
    { icon:'🤖', title:'AI Tutor Chat',  desc:'Ask questions about your content',   bg:'rgba(124,58,237,.15)', locked:!isPremium },
    { icon:'🧩', title:'Practice',       desc:'AI-generated worked examples',       bg:'rgba(245,158,11,.15)', locked:!isPremium },
    { icon:'⏱️', title:'Pomodoro',       desc:'Focus timer built-in',               bg:'rgba(16,185,129,.15)', locked:false },
  ]

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-1">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-text-2 text-sm">
              {progress.streak > 0 ? `🔥 ${progress.streak}-day streak! Keep it up.` : 'Ready to study? Start a new session.'}
            </p>
          </div>
          <Link to="/study" className="btn-primary text-xs md:text-sm py-2.5 px-4 md:px-5 flex-shrink-0">
            <Plus size={14}/> <span className="hidden sm:inline">New Session</span><span className="sm:hidden">Study</span>
          </Link>
        </div>

        {/* Trial warning */}
        {isOnTrial() && days <= 1 && (
          <div className="mb-5 px-4 py-3.5 rounded-xl flex items-center justify-between gap-3 flex-wrap"
               style={{ background:'rgba(245,158,11,.12)',border:'1px solid rgba(245,158,11,.3)' }}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="text-sm font-bold text-amber-400">Trial ends {days===0?'today':'tomorrow'}!</div>
                <div className="text-xs text-text-2">Upgrade to keep full access — ₦500/month</div>
              </div>
            </div>
            <button onClick={() => toast('Paystack payments coming soon! 🚀')} className="btn-primary text-xs py-2 px-4 flex-shrink-0">
              Upgrade now
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="glass rounded-2xl h-28 animate-pulse" style={{ background:'rgba(255,255,255,.04)' }}/>)
            : <>
                <StatCard icon="📚" label="Sessions"   value={progress.totalSessions||0} sub="Total"                         bg="rgba(124,58,237,.15)" />
                <StatCard icon="🔥" label="Streak"     value={progress.streak||0}        sub={`Best: ${progress.longestStreak||0}`} bg="rgba(245,158,11,.15)" />
                <StatCard icon="✅" label="Quizzes"    value={progress.totalQuizzes||0}  sub="Completed"                     bg="rgba(16,185,129,.15)" />
                <StatCard icon="🎯" label="Avg Score"  value={`${Math.round(progress.avgQuizScore||0)}%`} sub="Quiz accuracy" bg="rgba(236,72,153,.15)" />
              </>
          }
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Tools */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-base md:text-lg text-white">Study Tools</h2>
              <span className="text-[0.68rem] text-text-3">{isPremium?'All unlocked ✨':'Some need Premium'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5">
              {tools.map(t => <ToolCard key={t.title} {...t} onClick={() => navigate('/study')}/>)}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">

            {/* Recent sessions */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-sm md:text-base text-white">Recent Sessions</h3>
                <Link to="/history" className="text-xs font-medium no-underline" style={{color:'#9D5FF5'}}>View all</Link>
              </div>
              {loading
                ? [1,2,3].map(i => <div key={i} className="h-10 rounded-lg mb-2 animate-pulse" style={{background:'rgba(255,255,255,.04)'}}/>)
                : stats?.recentSessions?.length > 0
                  ? <div className="space-y-1">
                      {stats.recentSessions.map(s => (
                        <div key={s.id} onClick={() => navigate('/study')}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 active:bg-white/8 transition-colors cursor-pointer">
                          <span className="text-base flex-shrink-0">
                            {s.source_type==='pdf'?'📄':s.source_type==='url'?'🔗':'📝'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-white truncate">{s.title||'Untitled'}</div>
                            <div className="text-[0.62rem] text-text-3">
                              {new Date(s.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}
                            </div>
                          </div>
                          <ChevronRight size={13} className="text-text-3 flex-shrink-0"/>
                        </div>
                      ))}
                    </div>
                  : <div className="text-center py-5">
                      <div className="text-3xl mb-2">📭</div>
                      <p className="text-xs text-text-3 mb-3">No sessions yet</p>
                      <Link to="/study" className="text-xs font-medium no-underline" style={{color:'#9D5FF5'}}>Start studying →</Link>
                    </div>
              }
            </div>

            {/* Tool usage */}
            {stats?.toolUsage?.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <h3 className="font-display font-bold text-sm md:text-base text-white mb-3">Most Used</h3>
                <div className="space-y-2.5">
                  {stats.toolUsage.slice(0,4).map(t => {
                    const icons = {explain:'💡',quiz:'✅',flashcards:'🃏',summary:'📋',mindmap:'🕸️',chat:'🤖',practice:'🧩',pomodoro:'⏱️'}
                    const max   = stats.toolUsage[0]?.count || 1
                    return (
                      <div key={t.tool}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-2 capitalize flex items-center gap-1.5">
                            {icons[t.tool]||'📌'} {t.tool}
                          </span>
                          <span className="text-xs font-bold text-white">{t.count}×</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,.08)'}}>
                          <div className="h-full rounded-full" style={{width:`${(t.count/max)*100}%`,background:'linear-gradient(90deg,#7C3AED,#EC4899)'}}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Referral */}
            <div className="rounded-2xl p-4" style={{background:'linear-gradient(135deg,rgba(6,182,212,.12),rgba(124,58,237,.12))',border:'1px solid rgba(6,182,212,.2)'}}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎁</span>
                <h3 className="font-display font-bold text-sm text-white">Refer & Earn</h3>
              </div>
              <p className="text-xs text-text-2 leading-relaxed mb-3">
                Refer 5 friends → <strong className="text-white">1 month free premium</strong>
              </p>
              <div className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.65rem] text-text-3">Progress</span>
                  <span className="text-[0.65rem] font-bold" style={{color:'#22D3EE'}}>{user?.referral_count||0}/5</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,.08)'}}>
                  <div className="h-full rounded-full" style={{width:`${Math.min(((user?.referral_count||0)/5)*100,100)}%`,background:'linear-gradient(90deg,#06B6D4,#7C3AED)'}}/>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[0.65rem]"
                   style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'#22D3EE'}}>
                <span className="truncate flex-1">studiwise.netlify.app/register?ref={user?.referral_code}</span>
                <button onClick={copyReferral} className="flex-shrink-0 text-text-3 hover:text-white transition-colors">
                  {copied ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  )
}
