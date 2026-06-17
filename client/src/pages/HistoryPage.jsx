import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { LogOut, Trash2, Search, FileText, Link as LinkIcon, AlignLeft, ChevronRight, BarChart2, Trophy, Flame } from 'lucide-react'

/* ─── SIDEBAR ───────────────────────────────────────── */
function Sidebar() {
  const { user, logout, trialDaysLeft, isOnTrial, hasPremium } = useAuth()
  const navigate = useNavigate()
  const days = trialDaysLeft()
  const links = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/study',     icon: '📚', label: 'Study Room' },
    { to: '/history',   icon: '📋', label: 'History' },
    { to: '/profile',   icon: '👤', label: 'Profile' },
  ]
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40 border-r border-white/8" style={{ background: '#0A0A14' }}>
      <div className="px-6 py-5 border-b border-white/8">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>📚</div>
          <span className="font-display font-extrabold text-lg text-white tracking-tight">StudyWise</span>
        </Link>
      </div>
      {isOnTrial() ? (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="text-xs font-bold mb-0.5" style={{ color: '#9D5FF5' }}>⏳ Free Trial</div>
          <div className="text-xs text-text-2">{days} day{days !== 1 ? 's' : ''} remaining</div>
          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
            <div className="h-full rounded-full" style={{ width: `${(days / 3) * 100}%`, background: 'linear-gradient(90deg,#7C3AED,#EC4899)' }} />
          </div>
        </div>
      ) : !hasPremium() ? (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)' }}>
          <div className="text-xs font-bold text-amber-400">🔓 Free Plan</div>
          <div className="text-xs text-text-2 mt-0.5">Upgrade for ₦500/month</div>
        </div>
      ) : (
        <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)' }}>
          <div className="text-xs font-bold text-emerald-400">✨ Premium Active</div>
        </div>
      )}
      <nav className="flex-1 px-3 mt-5 flex flex-col gap-1">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all ${l.label === 'History' ? 'text-white' : 'text-text-2 hover:text-white hover:bg-white/5'}`}
            style={l.label === 'History' ? { background: 'rgba(124,58,237,.2)' } : {}}>
            <span className="text-base">{l.icon}</span>{l.label}
            {l.label === 'History' && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#9D5FF5' }} />}
          </Link>
        ))}
        {!hasPremium() && (
          <div className="mt-4">
            <button onClick={() => toast('Paystack payments coming soon! 🚀')} className="btn-primary w-full justify-center text-xs py-2.5">
              ⚡ Upgrade — ₦500/mo
            </button>
          </div>
        )}
      </nav>
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[0.65rem] text-text-3 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-2 text-xs text-text-3 hover:text-text-2 transition-colors">
          <LogOut size={13} /> Log out
        </button>
      </div>
    </aside>
  )
}

/* ─── SOURCE ICON ───────────────────────────────────── */
function SourceIcon({ type }) {
  if (type === 'pdf') return <FileText size={15} className="text-rose-400" />
  if (type === 'url') return <LinkIcon size={15} className="text-cyan-l" style={{ color: '#22D3EE' }} />
  return <AlignLeft size={15} className="text-violet-l" style={{ color: '#9D5FF5' }} />
}

/* ─── MAIN PAGE ─────────────────────────────────────── */
export default function HistoryPage() {
  const { hasPremium } = useAuth()
  const navigate       = useNavigate()

  const [sessions, setSessions]   = useState([])
  const [quizzes, setQuizzes]     = useState([])
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState('sessions') // sessions | quizzes | stats
  const [deleting, setDeleting]   = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [sessRes, quizRes, statRes] = await Promise.all([
          api.get('/study/sessions'),
          api.get('/user/quiz-history'),
          api.get('/user/stats'),
        ])
        setSessions(sessRes.data.sessions)
        setQuizzes(quizRes.data.results)
        setStats(statRes.data)
      } catch { toast.error('Failed to load history') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  async function deleteSession(id) {
    setDeleting(id)
    try {
      await api.delete(`/study/sessions/${id}`)
      setSessions(s => s.filter(x => x.id !== id))
      toast.success('Session deleted')
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(null) }
  }

  const filtered = sessions.filter(s =>
    (s.title || '').toLowerCase().includes(search.toLowerCase())
  )

  const avgScore = quizzes.length
    ? Math.round(quizzes.reduce((a, q) => a + (q.score / q.total) * 100, 0) / quizzes.length)
    : 0

  const bestScore = quizzes.length
    ? Math.max(...quizzes.map(q => Math.round((q.score / q.total) * 100)))
    : 0

  const toolIcons = { explain:'💡', quiz:'✅', flashcards:'🃏', summary:'📋', mindmap:'🕸️', chat:'🤖', practice:'🧩', pomodoro:'⏱️' }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-white mb-1">History 📋</h1>
              <p className="text-text-2 text-sm">Your past sessions, quiz scores and study stats</p>
            </div>
            <Link to="/study" className="btn-primary text-sm py-2.5 px-5">+ New Session</Link>
          </div>

          {/* Quick stats row */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: '📚', label: 'Total Sessions',  value: sessions.length, color: 'rgba(124,58,237,.15)' },
                { icon: '✅', label: 'Quizzes Taken',   value: quizzes.length,  color: 'rgba(16,185,129,.15)' },
                { icon: '🎯', label: 'Avg Quiz Score',  value: `${avgScore}%`,  color: 'rgba(245,158,11,.15)' },
                { icon: '🏆', label: 'Best Score',      value: `${bestScore}%`, color: 'rgba(236,72,153,.15)' },
              ].map(s => (
                <div key={s.label} className="glass rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-xl text-white">{s.value}</div>
                    <div className="text-[0.68rem] text-text-3">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/8 pb-4">
            {[['sessions','📚 Sessions'], ['quizzes','✅ Quiz Results'], ['stats','📊 Tool Stats']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? 'text-white' : 'text-text-3 hover:text-text-2'}`}
                style={activeTab === id ? { background: 'linear-gradient(135deg,#7C3AED,#EC4899)' } : { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── SESSIONS TAB ── */}
          {activeTab === 'sessions' && (
            <div>
              {/* Search */}
              <div className="relative mb-5">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search sessions…"
                  className="input-field pl-10 text-sm"
                />
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 glass rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,.03)' }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="font-display font-bold text-white text-lg mb-2">
                    {search ? 'No sessions found' : 'No sessions yet'}
                  </h3>
                  <p className="text-sm text-text-2 mb-6">
                    {search ? 'Try a different search term' : 'Start studying to build your history'}
                  </p>
                  {!search && <Link to="/study" className="btn-primary text-sm">📚 Start studying</Link>}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(s => (
                    <div key={s.id} className="glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-white/15 transition-all group"
                         style={{ border: '1px solid rgba(255,255,255,.08)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                           style={{ background: s.source_type==='pdf'?'rgba(239,68,68,.12)':s.source_type==='url'?'rgba(6,182,212,.12)':'rgba(124,58,237,.12)' }}>
                        <SourceIcon type={s.source_type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{s.title || 'Untitled Session'}</div>
                        <div className="text-xs text-text-3 mt-0.5 flex items-center gap-2">
                          <span className="capitalize">{s.source_type}</span>
                          <span>·</span>
                          <span>{new Date(s.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate('/study')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-text-2 hover:text-white"
                          style={{ background: 'rgba(255,255,255,.06)' }}>
                          Resume <ChevronRight size={12}/>
                        </button>
                        <button onClick={() => deleteSession(s.id)} disabled={deleting === s.id}
                          className="p-1.5 rounded-lg text-text-3 hover:text-rose-400 transition-colors"
                          style={{ background: 'rgba(255,255,255,.04)' }}>
                          {deleting === s.id
                            ? <span className="w-3.5 h-3.5 rounded-full border-2 border-rose-400/30 border-t-rose-400 animate-spin block"/>
                            : <Trash2 size={14}/>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── QUIZ RESULTS TAB ── */}
          {activeTab === 'quizzes' && (
            <div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-20 glass rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,.03)' }}/>)}
                </div>
              ) : quizzes.length === 0 ? (
                <div className="glass rounded-2xl p-16 text-center">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="font-display font-bold text-white text-lg mb-2">No quiz results yet</h3>
                  <p className="text-sm text-text-2 mb-6">Take a quiz in the Study Room to see your scores here</p>
                  <Link to="/study" className="btn-primary text-sm">📚 Start studying</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((q, i) => {
                    const pct = Math.round((q.score / q.total) * 100)
                    const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444'
                    return (
                      <div key={i} className="glass rounded-2xl px-5 py-4 flex items-center gap-5"
                           style={{ border: '1px solid rgba(255,255,255,.08)' }}>
                        {/* Score ring */}
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5"/>
                            <circle cx="24" cy="24" r="20" fill="none" strokeWidth="5" strokeLinecap="round"
                              stroke={color}
                              strokeDasharray={125.6}
                              strokeDashoffset={125.6 - (pct/100)*125.6}
                              style={{ transition: 'stroke-dashoffset 1s ease' }}/>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[0.6rem] font-extrabold" style={{ color }}>{pct}%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white mb-0.5">
                            {q.session_title || 'Study Session'}
                          </div>
                          <div className="text-xs text-text-3 flex items-center gap-2 flex-wrap">
                            <span>{q.score}/{q.total} correct</span>
                            <span>·</span>
                            <span className="capitalize">{q.level || 'medium'} level</span>
                            <span>·</span>
                            <span>{new Date(q.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</span>
                          </div>
                        </div>
                        <div className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                          pct >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                          pct >= 60 ? 'bg-amber-500/15 text-amber-400' :
                          'bg-rose-500/15 text-rose-400'
                        }`}>
                          {pct >= 80 ? '🏆 Excellent' : pct >= 60 ? '👍 Good' : '📖 Keep studying'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STATS TAB ── */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              {/* Tool usage */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-white mb-5 flex items-center gap-2">
                  <BarChart2 size={18}/> Tool Usage Breakdown
                </h3>
                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background:'rgba(255,255,255,.04)' }}/>)}
                  </div>
                ) : stats?.toolUsage?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.toolUsage.map(t => {
                      const max = stats.toolUsage[0]?.count || 1
                      const pct = Math.round((t.count / max) * 100)
                      return (
                        <div key={t.tool}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-text-2 capitalize flex items-center gap-2">
                              {toolIcons[t.tool] || '📌'} {t.tool}
                            </span>
                            <span className="text-sm font-bold text-white">{t.count} times</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,.08)' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                 style={{ width:`${pct}%`, background:'linear-gradient(90deg,#7C3AED,#EC4899)' }}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-text-3 text-center py-6">No tool usage yet — start studying!</p>
                )}
              </div>

              {/* Quiz performance over time */}
              {quizzes.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display font-bold text-white mb-5 flex items-center gap-2">
                    <Trophy size={18}/> Quiz Performance
                  </h3>
                  <div className="flex items-end gap-2 h-28">
                    {quizzes.slice(-10).reverse().map((q, i) => {
                      const pct = Math.round((q.score / q.total) * 100)
                      const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444'
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full rounded-t-md transition-all"
                               style={{ height:`${pct}%`, minHeight:'4px', background:color, opacity:0.8 }}/>
                          <span className="text-[0.55rem] text-text-3">{pct}%</span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                            <div className="glass-strong rounded-lg px-2.5 py-1.5 text-[0.65rem] whitespace-nowrap text-white">
                              {q.score}/{q.total} · {new Date(q.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[0.65rem] text-text-3">Last {Math.min(quizzes.length, 10)} quizzes</span>
                    <span className="text-[0.65rem] text-text-3">Avg: {avgScore}% · Best: {bestScore}%</span>
                  </div>
                </div>
              )}

              {/* Study streak calendar */}
              {stats?.progress?.last_study_date && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display font-bold text-white mb-2 flex items-center gap-2">
                    <Flame size={18}/> Study Streak
                  </h3>
                  <div className="flex items-baseline gap-4 mt-3">
                    <div>
                      <div className="font-display font-extrabold text-4xl grad-text">{stats.progress.streak || 0}</div>
                      <div className="text-xs text-text-3 mt-0.5">current streak</div>
                    </div>
                    <div>
                      <div className="font-display font-extrabold text-4xl text-text-2">{stats.progress.longest_streak || 0}</div>
                      <div className="text-xs text-text-3 mt-0.5">longest streak</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-xs text-text-3">Last studied</div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        {stats.progress.last_study_date
                          ? new Date(stats.progress.last_study_date).toLocaleDateString('en-NG',{weekday:'long',day:'numeric',month:'short'})
                          : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
