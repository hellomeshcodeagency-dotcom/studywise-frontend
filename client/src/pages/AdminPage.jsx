import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { Users, BarChart2, TrendingUp, Search, Shield, LogOut, ChevronLeft, ChevronRight, Trash2, Ban, CheckCircle, Crown } from 'lucide-react'

/* ─── STAT CARD ─────────────────────────────────────── */
function AdminStat({ icon, label, value, sub, color }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: color }}>
        {icon}
      </div>
      <div className="font-display font-extrabold text-3xl text-white mb-0.5">{value}</div>
      <div className="text-sm font-semibold text-white mb-0.5">{label}</div>
      {sub && <div className="text-xs text-text-3">{sub}</div>}
    </div>
  )
}

/* ─── CONFIRM MODAL ─────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-strong rounded-2xl p-7 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">{danger ? '⚠️' : '❓'}</div>
        <p className="text-sm text-text-2 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="btn-ghost text-sm py-2.5 px-6">Cancel</button>
          <button onClick={onConfirm}
            className="text-sm py-2.5 px-6 rounded-full font-bold text-white transition-all"
            style={{ background: danger ? 'linear-gradient(135deg,#EF4444,#EC4899)' : 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── USER DETAIL MODAL ─────────────────────────────── */
function UserModal({ userId, onClose, onUpdate }) {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/admin/users/${userId}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,.8)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-violet border-t-transparent animate-spin"/>
    </div>
  )

  const u = data?.user
  if (!u) return null

  const isPremium = u.plan === 'premium' && u.premium_until && new Date(u.premium_until) > new Date()
  const isOnTrial = u.trial_ends_at && new Date(u.trial_ends_at) > new Date()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background:'rgba(0,0,0,.85)', backdropFilter:'blur(10px)' }}>
      <div className="glass-strong rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/8" style={{ background:'#0E0E1A' }}>
          <h2 className="font-display font-bold text-white">User Details</h2>
          <button onClick={onClose} className="text-text-3 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-5">
          {/* User header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white flex-shrink-0"
                 style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-display font-bold text-xl text-white">{u.name}</div>
              <div className="text-sm text-text-2">{u.email}</div>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${isPremium?'bg-violet/20 text-violet-l':isOnTrial?'bg-amber-500/15 text-amber-400':'bg-white/8 text-text-2'}`}>
                  {isPremium ? '✨ Premium' : isOnTrial ? '⏳ Trial' : '🔓 Free'}
                </span>
                {u.is_suspended && <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">🚫 Suspended</span>}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ['📚', u.total_sessions || 0, 'Sessions'],
              ['🔥', u.streak || 0, 'Day Streak'],
              ['🎯', `${Math.round(u.avg_quiz_score || 0)}%`, 'Avg Score'],
            ].map(([icon, val, label]) => (
              <div key={label} className="text-center py-3 px-2 rounded-xl" style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)' }}>
                <div className="text-lg mb-1">{icon}</div>
                <div className="font-display font-bold text-lg text-white">{val}</div>
                <div className="text-[0.65rem] text-text-3">{label}</div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm">
            {[
              ['Joined', new Date(u.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})],
              ['Last active', new Date(u.last_active).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})],
              ['Referral code', u.referral_code],
              ['Referrals made', u.referral_count],
              ['Trial ends', u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}) : '—'],
              ['Premium until', u.premium_until ? new Date(u.premium_until).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}) : '—'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-text-3">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => { onUpdate(u.id, 'plan', { plan:'premium', months:1 }); onClose() }}
              className="btn-primary text-xs py-2 px-4">
              <Crown size={12}/> Give 1 Month Premium
            </button>
            <button onClick={() => { onUpdate(u.id, 'plan', { plan:'free' }); onClose() }}
              className="btn-ghost text-xs py-2 px-4">
              Downgrade to Free
            </button>
            <button onClick={() => { onUpdate(u.id, 'suspend', { suspended: !u.is_suspended }); onClose() }}
              className={`text-xs py-2 px-4 rounded-full font-bold border transition-all ${u.is_suspended?'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10':'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'}`}>
              {u.is_suspended ? <><CheckCircle size={12}/> Unsuspend</> : <><Ban size={12}/> Suspend</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────── */
export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const [stats, setStats]       = useState(null)
  const [users, setUsers]       = useState([])
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading]   = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirm, setConfirm]   = useState(null)

  // Load stats once
  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  // Load users on filter/page change
  useEffect(() => {
    if (activeTab !== 'users') return
    setUsersLoading(true)
    api.get('/admin/users', { params: { page, limit: 15, search, plan: planFilter } })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); setTotalPages(r.data.totalPages) })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setUsersLoading(false))
  }, [activeTab, page, search, planFilter])

  async function handleUserUpdate(id, action, body) {
    try {
      if (action === 'plan') {
        await api.patch(`/admin/users/${id}/plan`, body)
        toast.success(body.plan === 'premium' ? '✨ User upgraded to Premium!' : 'User downgraded to Free')
      } else if (action === 'suspend') {
        await api.patch(`/admin/users/${id}/suspend`, body)
        toast.success(body.suspended ? '🚫 User suspended' : '✅ User unsuspended')
      } else if (action === 'delete') {
        await api.delete(`/admin/users/${id}`)
        toast.success('User deleted')
        setUsers(u => u.filter(x => x.id !== id))
        return
      }
      // Refresh user list
      const r = await api.get('/admin/users', { params: { page, limit:15, search, plan:planFilter } })
      setUsers(r.data.users)
    } catch (e) { toast.error(e.response?.data?.error || 'Action failed') }
  }

  const toolIcons = { explain:'💡', quiz:'✅', flashcards:'🃏', summary:'📋', mindmap:'🕸️', chat:'🤖', practice:'🧩', pomodoro:'⏱️' }

  return (
    <div className="min-h-screen bg-black">
      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* User detail modal */}
      {selectedUser && (
        <UserModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUserUpdate}
        />
      )}

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40 border-r border-white/8" style={{ background: '#0A0A14' }}>
        <div className="px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>📚</div>
            <span className="font-display font-extrabold text-lg text-white">StudyWise</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: '#9D5FF5' }}>
            <Shield size={11}/> Admin Panel
          </div>
        </div>
        <nav className="flex-1 px-3 mt-5 flex flex-col gap-1">
          {[
            ['overview', '📊', 'Overview'],
            ['users',    '👥', 'Users'],
          ].map(([id, icon, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${activeTab===id?'text-white':'text-text-2 hover:text-white hover:bg-white/5'}`}
              style={activeTab===id?{background:'rgba(124,58,237,.2)'}:{}}>
              <span>{icon}</span>{label}
              {activeTab===id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:'#9D5FF5' }}/>}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[0.65rem]" style={{ color:'#9D5FF5' }}>Administrator</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-2 text-xs text-text-3 hover:text-text-2 transition-colors">
            <LogOut size={13}/> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-3xl text-white mb-1">Admin Overview 📊</h1>
                <p className="text-text-2 text-sm">Platform statistics and user activity</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[1,2,3,4].map(i => <div key={i} className="h-32 glass rounded-2xl animate-pulse" style={{ background:'rgba(255,255,255,.04)' }}/>)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AdminStat icon="👥" label="Total Users"    value={stats?.stats?.totalUsers    || 0} sub="All registered students"    color="rgba(124,58,237,.15)" />
                    <AdminStat icon="⏳" label="Active Trials"  value={stats?.stats?.activeTrials  || 0} sub="Currently on free trial"    color="rgba(245,158,11,.15)" />
                    <AdminStat icon="✨" label="Premium Users"  value={stats?.stats?.premiumUsers  || 0} sub="Paying subscribers"          color="rgba(16,185,129,.15)" />
                    <AdminStat icon="📅" label="Today's Signups" value={stats?.stats?.todaySignups || 0} sub="New users in last 24h"      color="rgba(236,72,153,.15)" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AdminStat icon="📚" label="Total Sessions" value={stats?.stats?.totalSessions || 0} sub="Study sessions created"     color="rgba(6,182,212,.15)" />
                    <AdminStat icon="✅" label="Total Quizzes"  value={stats?.stats?.totalQuizzes  || 0} sub="Quizzes completed"           color="rgba(124,58,237,.15)" />
                    <AdminStat icon="🔓" label="Free Users"     value={stats?.stats?.freeUsers     || 0} sub="On free plan"               color="rgba(255,255,255,.06)" />
                    <AdminStat icon="💰" label="Revenue Est."   value={`₦${((stats?.stats?.premiumUsers||0)*700).toLocaleString()}`} sub="Monthly @ ₦700/user" color="rgba(16,185,129,.15)" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Tool usage */}
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-display font-bold text-white mb-5">🔥 Most Used Tools</h3>
                      {stats?.toolBreakdown?.length > 0 ? (
                        <div className="space-y-4">
                          {stats.toolBreakdown.map(t => {
                            const max = stats.toolBreakdown[0]?.count || 1
                            return (
                              <div key={t.tool}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-sm text-text-2 capitalize flex items-center gap-2">
                                    {toolIcons[t.tool]||'📌'} {t.tool}
                                  </span>
                                  <span className="text-sm font-bold text-white">{t.count}×</span>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,.08)' }}>
                                  <div className="h-full rounded-full" style={{ width:`${(t.count/max)*100}%`, background:'linear-gradient(90deg,#7C3AED,#EC4899)' }}/>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : <p className="text-sm text-text-3 text-center py-6">No tool usage yet</p>}
                    </div>

                    {/* Recent signups */}
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-display font-bold text-white mb-5">🆕 Recent Signups</h3>
                      {stats?.recentSignups?.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentSignups.map(u => {
                            const onTrial   = u.trial_ends_at && new Date(u.trial_ends_at) > new Date()
                            const isPremium = u.plan === 'premium'
                            return (
                              <div key={u.id} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 px-2 py-1.5 rounded-xl transition-colors -mx-2"
                                   onClick={() => setSelectedUser(u.id)}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                     style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                                  {u.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-white truncate">{u.name}</div>
                                  <div className="text-[0.62rem] text-text-3 truncate">{u.email}</div>
                                </div>
                                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isPremium?'bg-violet/20 text-violet-l':onTrial?'bg-amber-500/15 text-amber-400':'bg-white/6 text-text-3'}`}>
                                  {isPremium ? '✨' : onTrial ? '⏳' : '🔓'} {isPremium?'Premium':onTrial?'Trial':'Free'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ) : <p className="text-sm text-text-3 text-center py-6">No signups yet</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-white mb-1">Users 👥</h1>
                  <p className="text-text-2 text-sm">{total} total registered students</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3"/>
                  <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search by name or email…" className="input-field pl-10 text-sm"/>
                </div>
                <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1) }}
                  className="input-field text-sm w-auto px-4" style={{ width:'auto', minWidth:'140px' }}>
                  <option value="">All plans</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              {/* Table */}
              <div className="glass rounded-2xl overflow-hidden">
                <div className="grid text-[0.7rem] font-bold uppercase tracking-wider text-text-3 px-5 py-3 border-b border-white/8"
                     style={{ gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 0.8fr 1fr' }}>
                  <span>Student</span><span>Joined</span><span>Plan</span><span>Sessions</span><span>Streak</span><span>Actions</span>
                </div>

                {usersLoading ? (
                  <div className="space-y-px">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-14 animate-pulse border-b border-white/5" style={{ background:'rgba(255,255,255,.02)' }}/>)}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-16 text-text-3 text-sm">No users found</div>
                ) : (
                  <div>
                    {users.map(u => {
                      const onTrial   = u.trial_ends_at && new Date(u.trial_ends_at) > new Date()
                      const isPremium = u.plan === 'premium' && u.premium_until && new Date(u.premium_until) > new Date()
                      return (
                        <div key={u.id}
                          className="grid items-center px-5 py-3.5 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group"
                          style={{ gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 0.8fr 1fr' }}
                          onClick={() => setSelectedUser(u.id)}>
                          {/* Name + email */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                 style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                                {u.name}
                                {u.is_suspended && <span className="text-[0.55rem] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full font-bold">SUSPENDED</span>}
                              </div>
                              <div className="text-[0.65rem] text-text-3 truncate">{u.email}</div>
                            </div>
                          </div>
                          {/* Joined */}
                          <div className="text-xs text-text-3">
                            {new Date(u.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}
                          </div>
                          {/* Plan */}
                          <div>
                            <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${isPremium?'bg-violet/20 text-violet-l':onTrial?'bg-amber-500/15 text-amber-400':'bg-white/6 text-text-3'}`}>
                              {isPremium ? '✨ Premium' : onTrial ? '⏳ Trial' : '🔓 Free'}
                            </span>
                          </div>
                          {/* Sessions */}
                          <div className="text-sm font-semibold text-white">{u.total_sessions || 0}</div>
                          {/* Streak */}
                          <div className="text-sm font-semibold text-white flex items-center gap-1">
                            {u.streak > 0 && <span className="text-amber-400">🔥</span>} {u.streak || 0}
                          </div>
                          {/* Actions */}
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setConfirm({
                                message: `Give ${u.name} 1 month free premium?`,
                                onConfirm: () => handleUserUpdate(u.id, 'plan', { plan:'premium', months:1 })
                              })}
                              className="p-1.5 rounded-lg text-text-3 hover:text-violet-l transition-colors" title="Give Premium"
                              style={{ background:'rgba(124,58,237,.1)' }}>
                              <Crown size={13}/>
                            </button>
                            <button onClick={() => setConfirm({
                                message: u.is_suspended ? `Unsuspend ${u.name}?` : `Suspend ${u.name}? They won't be able to log in.`,
                                danger: !u.is_suspended,
                                onConfirm: () => handleUserUpdate(u.id, 'suspend', { suspended: !u.is_suspended })
                              })}
                              className={`p-1.5 rounded-lg transition-colors ${u.is_suspended?'text-emerald-400 hover:text-emerald-300':'text-text-3 hover:text-amber-400'}`}
                              style={{ background:'rgba(255,255,255,.06)' }} title={u.is_suspended?'Unsuspend':'Suspend'}>
                              {u.is_suspended ? <CheckCircle size={13}/> : <Ban size={13}/>}
                            </button>
                            <button onClick={() => setConfirm({
                                message: `Permanently delete ${u.name}'s account? This cannot be undone.`,
                                danger: true,
                                onConfirm: () => handleUserUpdate(u.id, 'delete')
                              })}
                              className="p-1.5 rounded-lg text-text-3 hover:text-rose-400 transition-colors"
                              style={{ background:'rgba(255,255,255,.06)' }} title="Delete user">
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <span className="text-xs text-text-3">
                    Showing {((page-1)*15)+1}–{Math.min(page*15, total)} of {total} users
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                      className="btn-ghost text-sm py-2 px-4 disabled:opacity-40"><ChevronLeft size={14}/></button>
                    {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                      const p = Math.max(1, Math.min(page-2,totalPages-4)) + i
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page===p?'text-white':'text-text-3 hover:text-white'}`}
                          style={page===p?{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}:{background:'rgba(255,255,255,.05)'}}>
                          {p}
                        </button>
                      )
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                      className="btn-ghost text-sm py-2 px-4 disabled:opacity-40"><ChevronRight size={14}/></button>
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
