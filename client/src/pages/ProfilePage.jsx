import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppShell from '../components/layout/AppShell.jsx'
import UpgradeButton from '../components/ui/UpgradeButton.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { Copy, Check, Eye, EyeOff, Save, LogOut } from 'lucide-react'

/* ─── SECTION CARD ──────────────────────────────────── */
function SectionCard({ icon, title, children }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3"
           style={{ background: 'rgba(255,255,255,.02)' }}>
        <span className="text-lg">{icon}</span>
        <h2 className="font-display font-bold text-white text-sm md:text-base">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────── */
export default function ProfilePage() {
  const { user, setUser, logout, hasPremium, isOnTrial, trialDaysLeft } = useAuth()
  const navigate = useNavigate()

  const [name, setName]           = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)

  const [pwForm, setPwForm]       = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw]       = useState({ current: false, newPw: false, confirm: false })
  const [savingPw, setSavingPw]   = useState(false)
  const [pwError, setPwError]     = useState('')

  const [referrals, setReferrals] = useState(null)
  const [copied, setCopied]       = useState(false)
  const [profile, setProfile]     = useState(null)

  const isPremium = hasPremium()
  const days      = trialDaysLeft()

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

  function handleLogout() {
    logout()
    navigate('/')
    toast.success('Logged out')
  }

  const progress = profile?.progress || {}

  // Plan label
  let planLabel = 'Free Plan'
  if (isPremium) {
    if (isOnTrial()) {
      planLabel = `Free Trial · ${days} day${days !== 1 ? 's' : ''} left`
    } else if (user?.premium_until) {
      planLabel = `Premium · until ${new Date(user.premium_until).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`
    } else {
      planLabel = 'Premium'
    }
  }

  const freeFeatures = [
    [true,  'Paste text input'],
    [true,  'Explanations (Simple level only)'],
    [true,  '3 quiz questions per session'],
    [true,  '3 flashcards per session'],
    [true,  'Pomodoro timer'],
    [true,  'Save up to 3 sessions'],
    [false, 'PDF & file upload'],
    [false, 'Mind maps & summaries'],
    [false, 'AI tutor chat & practice problems'],
  ]

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-5 md:py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-1">My Profile 👤</h1>
          <p className="text-text-2 text-sm">Manage your account details and preferences</p>
        </div>

        {/* Avatar card */}
        <div className="glass rounded-2xl p-5 mb-5">
          {/* Top row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold text-white flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-base text-white truncate">{user?.name}</div>
              <div className="text-xs text-text-2 truncate mt-0.5">{user?.email}</div>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold mt-1.5 ${
                isPremium ? 'bg-violet/20 text-violet-l' : 'bg-amber-500/15 text-amber-400'
              }`}>
                {isPremium ? '✨' : '🔓'} {planLabel}
              </div>
            </div>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/8">
            {[
              [progress.totalSessions || 0, 'Sessions'],
              [progress.streak || 0, 'Streak'],
              [`${Math.round(progress.avgQuizScore || 0)}%`, 'Avg Score'],
            ].map(([v, l]) => (
              <div key={l} className="text-center py-1">
                <div className="font-display font-extrabold text-xl grad-text leading-tight">{v}</div>
                <div className="text-[0.6rem] text-text-3 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">

          {/* Personal Info */}
          <SectionCard icon="👤" title="Personal Information">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Full Name</label>
                <div className="flex gap-2">
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="input-field flex-1" placeholder="Your full name"/>
                  <button onClick={saveName} disabled={savingName || name.trim() === user?.name}
                    className="btn-primary text-sm py-2.5 px-4 flex-shrink-0 flex items-center gap-1.5">
                    {savingName
                      ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
                      : <><Save size={14}/> Save</>
                    }
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={user?.email || ''} disabled
                  className="input-field opacity-50 cursor-not-allowed"/>
                <p className="text-xs text-text-3 mt-1.5">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Member Since</label>
                <input type="text" disabled
                  value={user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                  className="input-field opacity-50 cursor-not-allowed"/>
              </div>
            </div>
          </SectionCard>

          {/* Change Password */}
          <SectionCard icon="🔒" title="Change Password">
            {pwError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                   style={{ background: 'rgba(236,72,153,.1)', border: '1px solid rgba(236,72,153,.3)', color: '#F472B6' }}>
                ⚠️ {pwError}
              </div>
            )}
            <div className="space-y-4">
              {[
                { key: 'current', label: 'Current Password',      placeholder: 'Enter current password' },
                { key: 'newPw',   label: 'New Password',          placeholder: 'Min. 6 characters' },
                { key: 'confirm', label: 'Confirm New Password',  placeholder: 'Repeat new password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">{f.label}</label>
                  <div className="relative">
                    <input
                      type={showPw[f.key] ? 'text' : 'password'}
                      value={pwForm[f.key]}
                      onChange={e => { setPwForm(p => ({ ...p, [f.key]: e.target.value })); setPwError('') }}
                      placeholder={f.placeholder}
                      className="input-field pr-11"/>
                    <button type="button"
                      onClick={() => setShowPw(s => ({ ...s, [f.key]: !s[f.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors">
                      {showPw[f.key] ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
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
              {pwForm.newPw && pwForm.confirm && (
                <div className={`flex items-center gap-2 text-xs font-medium ${pwForm.newPw === pwForm.confirm ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {pwForm.newPw === pwForm.confirm ? <><Check size={13}/> Passwords match</> : <>✗ Passwords do not match</>}
                </div>
              )}
              <button onClick={changePassword} disabled={savingPw} className="btn-primary text-sm py-3 px-5 flex items-center gap-2">
                {savingPw
                  ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Updating…</>
                  : 'Update Password'
                }
              </button>
            </div>
          </SectionCard>

          {/* Plan & Billing */}
          <SectionCard icon="💳" title="Plan & Billing">
            <div className="flex items-center justify-between p-4 rounded-xl mb-4"
                 style={{ background: isPremium ? 'rgba(124,58,237,.1)' : 'rgba(245,158,11,.08)', border: `1px solid ${isPremium ? 'rgba(124,58,237,.3)' : 'rgba(245,158,11,.2)'}` }}>
              <div>
                <div className={`font-bold text-sm mb-0.5 ${isPremium ? 'text-violet-l' : 'text-amber-400'}`}>
                  {isPremium ? '✨ Premium Plan' : '🔓 Free Plan'}
                </div>
                <div className="text-xs text-text-2">{planLabel}</div>
              </div>
              {!isPremium && <UpgradeButton label="Upgrade ₦700/mo" className="text-xs py-2 px-4 flex-shrink-0"/>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {freeFeatures.map(([has, label]) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className={has ? 'text-emerald-400' : 'text-text-3'}>{has ? '✓' : '🔒'}</span>
                  <span className={has ? 'text-text-2' : 'text-text-3'}>{label}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Referral */}
          <SectionCard icon="🎁" title="Refer & Earn">
            <p className="text-sm text-text-2 leading-relaxed mb-4">
              Refer <strong className="text-white">5 friends</strong> → get <strong className="text-white">1 month free premium</strong>. Friends get <strong className="text-white">10 days</strong> instead of 7!
            </p>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-2">Your referral progress</span>
                <span className="text-xs font-bold" style={{ color: '#22D3EE' }}>
                  {referrals?.count || 0} / 5 friends
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,.08)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${Math.min(((referrals?.count || 0) / 5) * 100, 100)}%`, background: 'linear-gradient(90deg,#06B6D4,#7C3AED)' }}/>
              </div>
              <p className="text-xs text-text-3">
                {(referrals?.count || 0) >= 5
                  ? `🎉 You've earned ${referrals?.rewardsEarned || 1} free month(s)!`
                  : `${5 - (referrals?.count || 0)} more to earn 1 free month`}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Your referral link</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-mono text-xs"
                   style={{ background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)', color: '#22D3EE' }}>
                <span className="flex-1 truncate">studiwise.netlify.app/register?ref={user?.referral_code}</span>
                <button onClick={copyReferral} className="flex-shrink-0 text-text-3 hover:text-white transition-colors">
                  {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                </button>
              </div>
            </div>
            {referrals?.referrals?.length > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">Friends who joined</label>
                <div className="space-y-2">
                  {referrals.referrals.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                         style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                        {r.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{r.name}</div>
                        <div className="text-[0.62rem] text-text-3">
                          {new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
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

          {/* Account */}
          <SectionCard icon="⚠️" title="Account">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-sm font-semibold text-white mb-0.5">Log out of StudyWise</div>
                <div className="text-xs text-text-3">You can log back in anytime</div>
              </div>
              <button onClick={handleLogout}
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
