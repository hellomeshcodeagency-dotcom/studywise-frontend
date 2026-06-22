import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { Users, BarChart2, Search, Shield, LogOut, ChevronLeft, ChevronRight, Trash2, Ban, CheckCircle, Crown, Menu, X } from 'lucide-react'

/* ─── CONFIRM MODAL ─────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background:'rgba(0,0,0,.85)',backdropFilter:'blur(8px)' }}>
      <div className="glass-strong rounded-2xl p-7 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">{danger?'⚠️':'❓'}</div>
        <p className="text-sm text-text-2 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="btn-ghost text-sm py-2.5 px-6">Cancel</button>
          <button onClick={onConfirm}
            className="text-sm py-2.5 px-6 rounded-full font-bold text-white transition-all"
            style={{ background:danger?'linear-gradient(135deg,#EF4444,#EC4899)':'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── USER DETAIL MODAL ─────────────────────────────── */
function UserModal({ userId, onClose, onUpdate }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/admin/users/${userId}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,.8)'}}>
      <div className="w-8 h-8 rounded-full border-2 border-violet border-t-transparent animate-spin"/>
    </div>
  )

  const u         = data?.user
  if (!u) return null
  const isPremium = u.plan==='premium' && u.premium_until && new Date(u.premium_until)>new Date()
  const isOnTrial = u.trial_ends_at && new Date(u.trial_ends_at)>new Date()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{background:'rgba(0,0,0,.88)',backdropFilter:'blur(10px)'}}>
      <div className="glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-white/8" style={{background:'#0E0E1A'}}>
          <h2 className="font-display font-bold text-white">User Details</h2>
          <button onClick={onClose} className="text-text-3 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold text-white flex-shrink-0"
                 style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}}>
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-lg text-white truncate">{u.name}</div>
              <div className="text-sm text-text-2 truncate">{u.email}</div>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${isPremium?'bg-violet/20 text-violet-l':isOnTrial?'bg-amber-500/15 text-amber-400':'bg-white/8 text-text-2'}`}>
                  {isPremium?'✨ Premium':isOnTrial?'⏳ Trial':'🔓 Free'}
                </span>
                {u.is_suspended && <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">🚫 Suspended</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[['📚',u.total_sessions||0,'Sessions'],['🔥',u.streak||0,'Streak'],['🎯',`${Math.round(u.avg_quiz_score||0)}%`,'Score']].map(([icon,val,label]) => (
              <div key={label} className="text-center py-3 rounded-xl" style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)'}}>
                <div className="text-lg mb-1">{icon}</div>
                <div className="font-display font-bold text-base text-white">{val}</div>
                <div className="text-[0.62rem] text-text-3">{label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            {[
              ['Joined', new Date(u.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})],
              ['Last active', new Date(u.last_active).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})],
              ['Referral code', u.referral_code],
              ['Referrals', u.referral_count],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-text-3">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={() => { onUpdate(u.id,'plan',{plan:'premium',months:1}); onClose() }}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
              <Crown size={12}/> Give 1 Month Premium
            </button>
            <button onClick={() => { onUpdate(u.id,'plan',{plan:'free'}); onClose() }}
              className="btn-ghost text-xs py-2 px-3">Downgrade to Free</button>
            <button onClick={() => { onUpdate(u.id,'suspend',{suspended:!u.is_suspended}); onClose() }}
              className={`text-xs py-2 px-3 rounded-full font-bold border transition-all flex items-center gap-1 ${u.is_suspended?'border-emerald-500/40 text-emerald-400':'border-rose-500/40 text-rose-400'}`}>
              {u.is_suspended?<><CheckCircle size={12}/>Unsuspend</>:<><Ban size={12}/>Suspend</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── STAT CARD ─────────────────────────────────────── */
function AdminStat({ icon, label, value, sub, color }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3" style={{background:color}}>{icon}</div>
      <div className="font-display font-extrabold text-2xl text-white mb-0.5">{value}</div>
      <div className="text-xs font-semibold text-white mb-0.5">{label}</div>
      {sub && <div className="text-[0.65rem] text-text-3">{sub}</div>}
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────── */
export default function AdminPage() {
  const { user, logout }  = useAuth()
  const navigate          = useNavigate()

  const [stats, setStats]         = useState(null)
  const [users, setUsers]         = useState([])
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading]     = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirm, setConfirm]     = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toolIcons = {explain:'💡',quiz:'✅',flashcards:'🃏',summary:'📋',mindmap:'🕸️',chat:'🤖',practice:'🧩',pomodoro:'⏱️'}

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab !== 'users') return
    setUsersLoading(true)
    api.get('/admin/users', {params:{page,limit:15,search,plan:planFilter}})
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); setTotalPages(r.data.totalPages) })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setUsersLoading(false))
  }, [activeTab, page, search, planFilter])

  async function handleUserUpdate(id, action, body) {
    try {
      if (action==='plan')    await api.patch(`/admin/users/${id}/plan`, body)
      else if (action==='suspend') await api.patch(`/admin/users/${id}/suspend`, body)
      else if (action==='delete') { await api.delete(`/admin/users/${id}`); setUsers(u => u.filter(x => x.id!==id)); return }
      toast.success('Updated!')
      const r = await api.get('/admin/users', {params:{page,limit:15,search,plan:planFilter}})
      setUsers(r.data.users)
    } catch (e) { toast.error(e.response?.data?.error||'Action failed') }
  }

  /* ── SIDEBAR ── */
  const SidebarContent = () => (
    <>
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="StudyWise" className="w-8 h-8 rounded-lg object-contain"/>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[0.65rem] font-bold uppercase tracking-wider" style={{color:'#9D5FF5'}}>
            <Shield size={11}/> Admin Panel
          </div>
        </div>
        <button className="md:hidden text-text-3 hover:text-white" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
      </div>

      <nav className="flex-1 px-3 mt-5 flex flex-col gap-1">
        {[['overview','📊','Overview'],['users','👥','Users']].map(([id,icon,label]) => (
          <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false) }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${activeTab===id?'text-white':'text-text-2 hover:text-white hover:bg-white/5'}`}
            style={activeTab===id?{background:'rgba(124,58,237,.2)'}:{}}>
            <span>{icon}</span>{label}
            {activeTab===id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{background:'#9D5FF5'}}/>}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
               style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[0.65rem]" style={{color:'#9D5FF5'}}>Administrator</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-2 text-xs text-text-3 hover:text-text-2 transition-colors">
          <LogOut size={13}/> Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-black">
      {confirm && (
        <ConfirmModal message={confirm.message} danger={confirm.danger}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null) }}
          onCancel={() => setConfirm(null)}/>
      )}
      {selectedUser && (
        <UserModal userId={selectedUser} onClose={() => setSelectedUser(null)} onUpdate={handleUserUpdate}/>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-40 border-r border-white/8" style={{background:'#0A0A14'}}>
        <SidebarContent/>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/8"
           style={{background:'rgba(10,10,20,.96)',backdropFilter:'blur(20px)'}}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="StudyWise" className="w-7 h-7 rounded-lg object-contain"/>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider" style={{color:'#9D5FF5'}}>Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="text-text-2 hover:text-white p-1"><Menu size={22}/></button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}/>
          <aside className="relative flex flex-col w-72 h-full border-r border-white/8 z-10" style={{background:'#0A0A14'}}>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="md:ml-60 pt-14 md:pt-0 pb-8 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-8">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              <div className="mb-6">
                <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-1">Overview 📊</h1>
                <p className="text-text-2 text-sm">Platform statistics and activity</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[1,2,3,4].map(i => <div key={i} className="h-28 glass rounded-2xl animate-pulse" style={{background:'rgba(255,255,255,.04)'}}/>)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <AdminStat icon="👥" label="Total Users"     value={stats?.stats?.totalUsers||0}    sub="All students"        color="rgba(124,58,237,.15)"/>
                    <AdminStat icon="⏳" label="Active Trials"   value={stats?.stats?.activeTrials||0}  sub="On free trial"       color="rgba(245,158,11,.15)"/>
                    <AdminStat icon="✨" label="Premium Users"   value={stats?.stats?.premiumUsers||0}  sub="Paying subscribers"  color="rgba(16,185,129,.15)"/>
                    <AdminStat icon="📅" label="Today's Signups" value={stats?.stats?.todaySignups||0}  sub="Last 24 hours"       color="rgba(236,72,153,.15)"/>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <AdminStat icon="📚" label="Sessions"   value={stats?.stats?.totalSessions||0} sub="Total created"     color="rgba(6,182,212,.15)"/>
                    <AdminStat icon="✅" label="Quizzes"    value={stats?.stats?.totalQuizzes||0}  sub="Completed"         color="rgba(124,58,237,.15)"/>
                    <AdminStat icon="🔓" label="Free Users" value={stats?.stats?.freeUsers||0}     sub="On free plan"      color="rgba(255,255,255,.06)"/>
                    <AdminStat icon="💰" label="Est. Revenue" value={`₦${((stats?.stats?.premiumUsers||0)*700).toLocaleString()}`} sub="Monthly @ ₦700" color="rgba(16,185,129,.15)"/>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tool usage */}
                    <div className="glass rounded-2xl p-5">
                      <h3 className="font-display font-bold text-white mb-4 text-sm md:text-base">🔥 Most Used Tools</h3>
                      {stats?.toolBreakdown?.length > 0 ? (
                        <div className="space-y-3">
                          {stats.toolBreakdown.map(t => {
                            const max = stats.toolBreakdown[0]?.count||1
                            return (
                              <div key={t.tool}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-text-2 capitalize flex items-center gap-1.5">{toolIcons[t.tool]||'📌'} {t.tool}</span>
                                  <span className="text-xs font-bold text-white">{t.count}×</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,.08)'}}>
                                  <div className="h-full rounded-full" style={{width:`${(t.count/max)*100}%`,background:'linear-gradient(90deg,#7C3AED,#EC4899)'}}/>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : <p className="text-sm text-text-3 text-center py-4">No tool usage yet</p>}
                    </div>

                    {/* Recent signups */}
                    <div className="glass rounded-2xl p-5">
                      <h3 className="font-display font-bold text-white mb-4 text-sm md:text-base">🆕 Recent Signups</h3>
                      {stats?.recentSignups?.length > 0 ? (
                        <div className="space-y-2">
                          {stats.recentSignups.map(u => {
                            const onTrial   = u.trial_ends_at && new Date(u.trial_ends_at)>new Date()
                            const isPremium = u.plan==='premium'
                            return (
                              <div key={u.id} onClick={() => setSelectedUser(u.id)}
                                   className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                     style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}}>
                                  {u.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-white truncate">{u.name}</div>
                                  <div className="text-[0.62rem] text-text-3 truncate">{u.email}</div>
                                </div>
                                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isPremium?'bg-violet/20 text-violet-l':onTrial?'bg-amber-500/15 text-amber-400':'bg-white/6 text-text-3'}`}>
                                  {isPremium?'✨':onTrial?'⏳':'🔓'} {isPremium?'Premium':onTrial?'Trial':'Free'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ) : <p className="text-sm text-text-3 text-center py-4">No signups yet</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-1">Users 👥</h1>
                  <p className="text-text-2 text-sm">{total} total students</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[160px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3"/>
                  <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search name or email…" className="input-field pl-9 text-sm py-2.5"/>
                </div>
                <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1) }}
                  className="input-field text-sm py-2.5 px-3" style={{width:'auto',minWidth:'120px'}}>
                  <option value="">All plans</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              {/* Mobile cards view */}
              <div className="md:hidden space-y-3">
                {usersLoading ? (
                  [1,2,3].map(i => <div key={i} className="h-20 glass rounded-xl animate-pulse" style={{background:'rgba(255,255,255,.03)'}}/>)
                ) : users.length === 0 ? (
                  <div className="glass rounded-2xl p-10 text-center text-text-3 text-sm">No users found</div>
                ) : users.map(u => {
                  const onTrial   = u.trial_ends_at && new Date(u.trial_ends_at)>new Date()
                  const isPremium = u.plan==='premium' && u.premium_until && new Date(u.premium_until)>new Date()
                  return (
                    <div key={u.id} onClick={() => setSelectedUser(u.id)}
                         className="glass rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-white/15 transition-all"
                         style={{border:'1px solid rgba(255,255,255,.08)'}}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                           style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                          {u.name}
                          {u.is_suspended && <span className="text-[0.55rem] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full">SUSP.</span>}
                        </div>
                        <div className="text-[0.65rem] text-text-3 truncate">{u.email}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full ${isPremium?'bg-violet/20 text-violet-l':onTrial?'bg-amber-500/15 text-amber-400':'bg-white/6 text-text-3'}`}>
                          {isPremium?'✨ Prem':onTrial?'⏳ Trial':'🔓 Free'}
                        </span>
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setConfirm({message:`Give ${u.name} 1 month premium?`,onConfirm:()=>handleUserUpdate(u.id,'plan',{plan:'premium',months:1})})}
                            className="p-1.5 rounded-lg" style={{background:'rgba(124,58,237,.15)'}}>
                            <Crown size={12} className="text-violet-l"/>
                          </button>
                          <button onClick={() => setConfirm({message:`${u.is_suspended?'Unsuspend':'Suspend'} ${u.name}?`,danger:!u.is_suspended,onConfirm:()=>handleUserUpdate(u.id,'suspend',{suspended:!u.is_suspended})})}
                            className={`p-1.5 rounded-lg ${u.is_suspended?'text-emerald-400':'text-amber-400'}`} style={{background:'rgba(255,255,255,.06)'}}>
                            {u.is_suspended?<CheckCircle size={12}/>:<Ban size={12}/>}
                          </button>
                          <button onClick={() => setConfirm({message:`Delete ${u.name}? Cannot be undone.`,danger:true,onConfirm:()=>handleUserUpdate(u.id,'delete')})}
                            className="p-1.5 rounded-lg text-rose-400" style={{background:'rgba(255,255,255,.06)'}}>
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block glass rounded-2xl overflow-hidden">
                <div className="grid text-[0.7rem] font-bold uppercase tracking-wider text-text-3 px-5 py-3 border-b border-white/8"
                     style={{gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 0.8fr 1fr'}}>
                  <span>Student</span><span>Joined</span><span>Plan</span><span>Sessions</span><span>Streak</span><span>Actions</span>
                </div>
                {usersLoading ? (
                  [1,2,3,4,5].map(i => <div key={i} className="h-14 animate-pulse border-b border-white/5" style={{background:'rgba(255,255,255,.02)'}}/>)
                ) : users.length===0 ? (
                  <div className="text-center py-12 text-text-3 text-sm">No users found</div>
                ) : users.map(u => {
                  const onTrial   = u.trial_ends_at && new Date(u.trial_ends_at)>new Date()
                  const isPremium = u.plan==='premium' && u.premium_until && new Date(u.premium_until)>new Date()
                  return (
                    <div key={u.id} onClick={() => setSelectedUser(u.id)}
                      className="grid items-center px-5 py-3.5 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group"
                      style={{gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr 0.8fr 1fr'}}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                             style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{u.name}</div>
                          <div className="text-[0.65rem] text-text-3 truncate">{u.email}</div>
                        </div>
                      </div>
                      <div className="text-xs text-text-3">{new Date(u.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>
                      <div>
                        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${isPremium?'bg-violet/20 text-violet-l':onTrial?'bg-amber-500/15 text-amber-400':'bg-white/6 text-text-3'}`}>
                          {isPremium?'✨ Prem':onTrial?'⏳ Trial':'🔓 Free'}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white">{u.total_sessions||0}</div>
                      <div className="text-sm font-semibold text-white flex items-center gap-1">{u.streak>0&&<span className="text-amber-400">🔥</span>}{u.streak||0}</div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setConfirm({message:`Give ${u.name} 1 month premium?`,onConfirm:()=>handleUserUpdate(u.id,'plan',{plan:'premium',months:1})})}
                          className="p-1.5 rounded-lg" style={{background:'rgba(124,58,237,.15)'}} title="Give Premium">
                          <Crown size={13} className="text-violet-l"/>
                        </button>
                        <button onClick={() => setConfirm({message:`${u.is_suspended?'Unsuspend':'Suspend'} ${u.name}?`,danger:!u.is_suspended,onConfirm:()=>handleUserUpdate(u.id,'suspend',{suspended:!u.is_suspended})})}
                          className={`p-1.5 rounded-lg ${u.is_suspended?'text-emerald-400':'text-amber-400'}`} style={{background:'rgba(255,255,255,.06)'}}>
                          {u.is_suspended?<CheckCircle size={13}/>:<Ban size={13}/>}
                        </button>
                        <button onClick={() => setConfirm({message:`Delete ${u.name}? Cannot be undone.`,danger:true,onConfirm:()=>handleUserUpdate(u.id,'delete')})}
                          className="p-1.5 rounded-lg text-rose-400" style={{background:'rgba(255,255,255,.06)'}}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                  <span className="text-xs text-text-3">
                    Showing {((page-1)*15)+1}–{Math.min(page*15,total)} of {total}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                      className="btn-ghost text-sm py-2 px-3 disabled:opacity-40"><ChevronLeft size={14}/></button>
                    {Array.from({length:Math.min(5,totalPages)},(_,i) => {
                      const p = Math.max(1,Math.min(page-2,totalPages-4))+i
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page===p?'text-white':'text-text-3 hover:text-white'}`}
                          style={page===p?{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}:{background:'rgba(255,255,255,.05)'}}>
                          {p}
                        </button>
                      )
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                      className="btn-ghost text-sm py-2 px-3 disabled:opacity-40"><ChevronRight size={14}/></button>
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
