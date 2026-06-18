import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { LogOut, Menu, X } from 'lucide-react'
import VoiceTutor from '../ui/VoiceTutor.jsx'

const NAV_LINKS = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/study',     icon: '📚', label: 'Study' },
  { to: '/plan',      icon: '📅', label: 'Plan' },
  { to: '/history',   icon: '📋', label: 'History' },
  { to: '/profile',   icon: '👤', label: 'Profile' },
]

export default function AppShell({ children }) {
  const { user, logout, trialDaysLeft, isOnTrial, hasPremium } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)
  const days      = trialDaysLeft()
  const isPremium = hasPremium()
  const active    = NAV_LINKS.find(l => location.pathname === l.to)?.label || ''

  function handleLogout() {
    logout(); navigate('/'); toast.success('Logged out')
  }

  const SidebarInner = () => (
    <>
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>📚</div>
          <span className="font-display font-extrabold text-lg text-white tracking-tight">StudyWise</span>
        </Link>
        <button className="md:hidden text-text-3 hover:text-white" onClick={() => setOpen(false)}><X size={20}/></button>
      </div>

      <div className="mx-4 mt-4">
        {isOnTrial() ? (
          <div className="px-3 py-2.5 rounded-xl" style={{ background:'rgba(124,58,237,.15)',border:'1px solid rgba(124,58,237,.3)' }}>
            <div className="text-xs font-bold mb-0.5" style={{ color:'#9D5FF5' }}>⏳ Free Trial</div>
            <div className="text-xs text-text-2">{days} day{days!==1?'s':''} remaining</div>
            <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,.1)' }}>
              <div className="h-full rounded-full" style={{ width:`${(days/7)*100}%`,background:'linear-gradient(90deg,#7C3AED,#EC4899)' }}/>
            </div>
          </div>
        ) : isPremium ? (
          <div className="px-3 py-2.5 rounded-xl" style={{ background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.25)' }}>
            <div className="text-xs font-bold text-emerald-400">✨ Premium Active</div>
          </div>
        ) : (
          <div className="px-3 py-2.5 rounded-xl" style={{ background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.25)' }}>
            <div className="text-xs font-bold text-amber-400">🔓 Free Plan</div>
            <div className="text-xs text-text-2 mt-0.5">Upgrade for ₦500/month</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 mt-5 flex flex-col gap-1">
        {NAV_LINKS.map(l => (
          <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all ${active===l.label?'text-white':'text-text-2 hover:text-white hover:bg-white/5'}`}
            style={active===l.label?{background:'rgba(124,58,237,.2)'}:{}}>
            <span className="text-base">{l.icon}</span>
            {l.label}
            {active===l.label && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{background:'#9D5FF5'}}/>}
          </Link>
        ))}
        {!isPremium && (
          <div className="mt-4">
            <button onClick={() => toast('Paystack payments coming soon! 🚀')} className="btn-primary w-full justify-center text-xs py-2.5">
              ⚡ Upgrade — ₦500/mo
            </button>
          </div>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
               style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[0.65rem] text-text-3 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-text-3 hover:text-text-2 transition-colors">
          <LogOut size={13}/> Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-black">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-40 border-r border-white/8" style={{background:'#0A0A14'}}>
        <SidebarInner />
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/8"
           style={{background:'rgba(10,10,20,.96)',backdropFilter:'blur(20px)'}}>
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}}>📚</div>
          <span className="font-display font-extrabold text-base text-white">StudyWise</span>
        </Link>
        <button onClick={() => setOpen(true)} className="text-text-2 hover:text-white p-1"><Menu size={22}/></button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)}/>
          <aside className="relative flex flex-col w-72 h-full border-r border-white/8 z-10" style={{background:'#0A0A14'}}>
            <SidebarInner />
          </aside>
        </div>
      )}

      {/* Page content */}
      <div className="md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </div>

      {/* Voice Tutor — floats on every page */}
      <VoiceTutor />

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/8"
           style={{background:'rgba(10,10,20,.97)',backdropFilter:'blur(20px)'}}>
        <div className="flex items-center justify-around h-16">
          {NAV_LINKS.map(l => {
            const isActive = location.pathname === l.to
            return (
              <Link key={l.to} to={l.to}
                className="flex flex-col items-center gap-0.5 py-2 px-4 no-underline">
                <span className={`text-xl leading-none transition-all ${isActive?'scale-110':''}`}>{l.icon}</span>
                <span className="text-[0.6rem] font-bold mt-0.5 transition-colors"
                      style={{color: isActive ? '#9D5FF5' : '#606080'}}>
                  {l.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full" style={{background:'#9D5FF5'}}/>}
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
