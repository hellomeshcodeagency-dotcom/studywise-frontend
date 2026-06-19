import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import UpgradeButton from '../components/ui/UpgradeButton.jsx'
import toast from 'react-hot-toast'
import { User, Lock, Copy, Check, Eye, EyeOff, Save, LogOut } from 'lucide-react'
import AppShell from '../components/layout/AppShell.jsx'


/* ─── SECTION CARD ──────────────────────────────────── */
function SectionCard({ icon, title, children }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3" style={{ background: 'rgba(255,255,255,.02)' }}>
        <span className="text-lg">{icon}</span>
        <h2 className="font-display font-bold text-white text-base">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────── */
export default function ProfilePage() {
  const { user, setUser, logout, hasPremium, isOnTrial, trialDaysLeft } = useAuth()
  const navigate  = useNavigate()

  // Profile form
  const [name, setName]           = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)

  // Password form
  const [pwForm, setPwForm]       = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw]       = useState({ current: false, newPw: false, confirm: false })
  const [savingPw, setSavingPw]   = useState(false)
  const [pwError, setPwError]     = useState('')

  // Referral
  const [referrals, setReferrals] = useState(null)
  const [copied, setCopied]       = useState(false)

  // Stats
  const [profile, setProfile]     = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [refRes, profRes] = await Promise.all([
          api.get('/user/referrals'),
          api.get('/user/profile'),
        ])
        setReferrals(refRes.data)
        setProfile(profRes.data)
      } catch {}
    }
    load()
  }, [])

  async function saveName() {
    if (!name.trim() || name.trim() === user?.name) return
    setSavingName(true)
    try {
      await api.patch('/user/profile', { name: name.trim() })
      setUser(u => ({ ...u, name: name.trim() }))
      toast.success('Name updated!')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update name')
    } finally { setSavingName(false) }
  }

  async function changePassword() {
    setPwError('')
    const { current, newPw, confirm } = pwForm
    if (!current || !newPw || !confirm) { setPwError('All fields are required'); return }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (newPw !== confirm) { setPwError('New passwords do not match'); return }
    setSavingPw(true)
    try {
      await api.post('/auth/change-password', { current_password: current, new_password: newPw })
      toast.success('Password changed successfully!')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (e) {
      setPwError(e.response?.data?.error || 'Failed to change password')
    } finally { setSavingPw(false) }
  }

  function copyReferral() {
    const link = `https://studiwise.netlify.app/register?ref=${user?.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const isPremium = hasPremium()
  const days      = trialDaysLeft()
  const progress  = profile?.progress || {}

  // Plan label
  const planLabel = isPremium
    ? isOnTrial()
      ? `Free Trial · ${days} day${days !== 1 ? 's' : ''} left`
      : `Premium · active until ${new Date(user?.premium_until).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}`
    : 'Free Plan'

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-extrabold text-3xl text-white mb-1">My Profile 👤</h1>
            <p className="text-text-2 text-sm">Manage your account details and preferences</p>
          </div>

          {/* Avatar + plan overview */}
          <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', fontSize: '1.6rem' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-xl text-white mb-0.5">{user?.name}</div>
              <div className="text-sm text-text-2 mb-2">{user?.email}</div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                isPremium ? 'bg-violet/20 text-violet-l' : 'bg-amber-500/15 text-amber-400'
              }`}>
                {isPremium ? '✨' : '🔓'} {planLabel}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center flex-shrink-0">
              {[
                [progress.totalSessions || 0, 'Sessions'],
                [progress.streak || 0, 'Day Streak'],
                [`${Math.round(progress.avgQuizScore || 0)}%`, 'Avg Score'],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display font-extrabold text-xl grad-text">{v}</div>
                  <div className="text-[0.65rem] text-text-3 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">

            {/* ── Personal Info ── */}
            <SectionCard icon="👤" title="Personal Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input-field flex-1"
                      placeholder="Your full name"
                    />
                    <button
                      onClick={saveName}
                      disabled={savingName || name.trim() === user?.name}
                      className="btn-primary text-sm py-2.5 px-5 flex-shrink-0">
                      {savingName
                        ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
                        : <><Save size={14}/> Save</>
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-text-3 mt-1.5">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Member Since</label>
                  <input
                    type="text"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    disabled
                    className="input-field opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── Change Password ── */}
            <SectionCard icon="🔒" title="Change Password">
              {pwError && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                     style={{ background: 'rgba(236,72,153,.1)', border: '1px solid rgba(236,72,153,.3)', color: '#F472B6' }}>
                  ⚠️ {pwError}
                </div>
              )}
              <div className="space-y-4">
                {[
                  { key: 'current', label: 'Current Password',  placeholder: 'Enter current password' },
                  { key: 'newPw',   label: 'New Password',      placeholder: 'Min. 6 characters' },
                  { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">{f.label}</label>
                    <div className="relative">
                      <input
                        type={showPw[f.key] ? 'text' : 'password'}
                        value={pwForm[f.key]}
                        onChange={e => { setPwForm(p => ({ ...p, [f.key]: e.target.value })); setPwError('') }}
                        placeholder={f.placeholder}
                        className="input-field pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(s => ({ ...s, [f.key]: !s[f.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors">
                        {showPw[f.key] ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                    {/* Strength bar for new password */}
                    {f.key === 'newPw' && pwForm.newPw && (
                      <div className="flex gap-1 mt-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                               style={{ background: pwForm.newPw.length >= i * 3
                                 ? i<=1?'#EF4444':i<=2?'#F59E0B':i<=3?'#3B82F6':'#10B981'
                                 : 'rgba(255,255,255,.1)' }}/>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Match indicator */}
                {pwForm.newPw && pwForm.confirm && (
                  <div className={`flex items-center gap-2 text-xs font-medium ${pwForm.newPw === pwForm.confirm ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pwForm.newPw === pwForm.confirm
                      ? <><Check size={13}/> Passwords match</>
                      : <>✗ Passwords do not match</>
                    }
                  </div>
                )}

                <button onClick={changePassword} disabled={savingPw} className="btn-primary text-sm py-3 px-6">
                  {savingPw
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Updating…</span>
                    : <><Lock size={14}/> Update Password</>
                  }
                </button>
              </div>
            </SectionCard>

            {/* ── Plan & Billing ── */}
            <SectionCard icon="💳" title="Plan & Billing">
              <div className="flex items-center justify-between p-4 rounded-xl mb-4"
                   style={{ background: isPremium ? 'rgba(124,58,237,.1)' : 'rgba(245,158,11,.08)', border: `1px solid ${isPremium ? 'rgba(124,58,237,.3)' : 'rgba(245,158,11,.2)'}` }}>
                <div>
                  <div className={`font-bold text-sm mb-0.5 ${isPremium ? 'text-violet-l' : 'text-amber-400'}`}>
                    {isPremium ? '✨ Premium Plan' : '🔓 Free Plan'}
                  </div>
                  <div className="text-xs text-text-2">{planLabel}</div>
                </div>
                {!isPremium && (
                  <UpgradeButton />
                )}
              </div>

              {/* What they have */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  [true,  'Paste text input'],
                  [true,  'Basic explanations'],
                  [true,  '3-question quizzes'],
                  [isPremium, 'PDF & URL upload'],
                  [isPremium, 'All explanation levels'],
                  [isPremium, 'Unlimited quizzes'],
                  [isPremium, 'Flashcard study mode'],
                  [isPremium, 'Mind maps & summaries'],
                  [isPremium, 'AI tutor chat'],
                  [isPremium, 'Practice problems'],
                ].map(([has, label]) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <span className={has ? 'text-emerald-400' : 'text-text-3'}>
                      {has ? '✓' : '🔒'}
                    </span>
                    <span className={has ? 'text-text-2' : 'text-text-3'}>{label}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Referral ── */}
            <SectionCard icon="🎁" title="Refer & Earn">
              <p className="text-sm text-text-2 leading-relaxed mb-5">
                Refer <strong className="text-white">5 friends</strong> to get <strong className="text-white">1 month free premium</strong>. Your friends get <strong className="text-white">6 days</strong> instead of 3!
              </p>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-2">Your referral progress</span>
                  <span className="text-xs font-bold" style={{ color: '#22D3EE' }}>
                    {referrals?.count || 0} / 5 friends joined
                  </span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,.08)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${Math.min(((referrals?.count || 0) / 5) * 100, 100)}%`, background: 'linear-gradient(90deg,#06B6D4,#7C3AED)' }} />
                </div>
                <p className="text-xs text-text-3">
                  {referrals?.count >= 5
                    ? `🎉 You've earned ${referrals?.rewardsEarned || 1} free month(s)!`
                    : `${5 - (referrals?.count || 0)} more friend${5-(referrals?.count||0)!==1?'s':''} to earn 1 free month`
                  }
                </p>
              </div>

              {/* Referral link */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Your referral link</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl font-mono text-xs"
                     style={{ background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)', color: '#22D3EE' }}>
                  <span className="flex-1 truncate">studiwise.netlify.app/register?ref={user?.referral_code}</span>
                  <button onClick={copyReferral} className="flex-shrink-0 text-text-3 hover:text-white transition-colors">
                    {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                  </button>
                </div>
              </div>

              {/* Referral history */}
              {referrals?.referrals?.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">Friends who joined</label>
                  <div className="space-y-2">
                    {referrals.referrals.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                           style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                             style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                          {r.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{r.name}</div>
                          <div className="text-[0.62rem] text-text-3">
                            Joined {new Date(r.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
                          </div>
                        </div>
                        {r.rewarded && (
                          <span className="text-[0.62rem] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex-shrink-0">
                            Rewarded ✓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ── Danger Zone ── */}
            <SectionCard icon="⚠️" title="Account">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white mb-0.5">Log out of StudyWise</div>
                  <div className="text-xs text-text-3">You can log back in anytime</div>
                </div>
                <button onClick={() => { logout(); navigate('/'); toast('Logged out successfully') }}
                        className="btn-ghost text-sm py-2.5 px-5 flex items-center gap-2">
                  <LogOut size={14}/> Log out
                </button>
              </div>
            </SectionCard>

          </div>
      </div>
    </AppShell>
  )
}
