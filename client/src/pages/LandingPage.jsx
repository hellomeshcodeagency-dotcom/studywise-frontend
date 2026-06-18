import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Menu, X } from 'lucide-react'

/* ─── NAVBAR ────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const { user, logout }        = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/85 backdrop-blur-xl border-b border-white/8' : ''}`}>
      <div className="page-container">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>📚</div>
            <span className="font-display font-extrabold text-xl text-white tracking-tight">StudyWise</span>
          </Link>
          <ul className="hidden md:flex items-center gap-8 list-none">
            {[['#features','Features'],['#how','How it works'],['#pricing','Pricing'],['#referral','Referral']].map(([h,l]) => (
              <li key={h}><a href={h} className="text-sm font-medium text-text-2 hover:text-white transition-colors no-underline">{l}</a></li>
            ))}
          </ul>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm py-2.5 px-5">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-text-2 hover:text-white transition-colors no-underline">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Start free →</Link>
              </>
            )}
          </div>
          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-black/95 border-t border-white/8 px-6 py-6 flex flex-col gap-5">
          {[['#features','Features'],['#how','How it works'],['#pricing','Pricing'],['#referral','Referral']].map(([h,l]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="text-sm font-medium text-text-2 hover:text-white no-underline">{l}</a>
          ))}
          <Link to="/register" className="btn-primary justify-center text-center" onClick={() => setOpen(false)}>Start free →</Link>
        </div>
      )}
    </nav>
  )
}

/* ─── HERO ──────────────────────────────────────────── */
function Hero() {
  const [text, setText] = useState('')
  const idx = useRef(0)
  const charIdx = useRef(0)
  const timer = useRef(null)
  const samples = [
    "The Second Law of Thermodynamics says heat flows from hot to cold — never the reverse. Think of ice in warm water...",
    "Osmosis is the movement of water across a semipermeable membrane from low to high solute concentration...",
    "Newton's Second Law: F = ma. A greater force produces greater acceleration in the same direction..."
  ]

  useEffect(() => {
    function tick() {
      const current = samples[idx.current]
      if (charIdx.current < current.length) {
        setText(current.slice(0, charIdx.current + 1))
        charIdx.current++
        timer.current = setTimeout(tick, 26)
      } else {
        timer.current = setTimeout(() => {
          charIdx.current = 0
          idx.current = (idx.current + 1) % samples.length
          setText('')
          tick()
        }, 2800)
      }
    }
    tick()
    return () => clearTimeout(timer.current)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
      {/* Orbs */}
      <div className="absolute rounded-full filter blur-[80px] opacity-50 animate-float-1 w-[580px] h-[580px] -top-24 -left-32" style={{ background:'radial-gradient(circle,rgba(124,58,237,.65),transparent 70%)' }}/>
      <div className="absolute rounded-full filter blur-[80px] opacity-45 animate-float-2 w-[480px] h-[480px] top-20 -right-20" style={{ background:'radial-gradient(circle,rgba(236,72,153,.55),transparent 70%)' }}/>
      <div className="absolute rounded-full filter blur-[80px] opacity-40 animate-float-3 w-[380px] h-[380px] -bottom-10 left-[38%]" style={{ background:'radial-gradient(circle,rgba(6,182,212,.45),transparent 70%)' }}/>
      <div className="dot-grid absolute inset-0"/>

      <div className="page-container relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background:'rgba(124,58,237,.15)',border:'1px solid rgba(124,58,237,.3)',color:'#9D5FF5' }}>
              🎓 Built for every student &nbsp;·&nbsp;<span style={{ color:'#F472B6' }}>Smart Learning</span>
            </div>
            <h1 className="section-title mb-5" style={{ fontSize:'clamp(2.5rem,5vw,3.75rem)' }}>
              Study smarter.<br/>Score <span className="grad-text">higher.</span><br/>Graduate <span className="grad-text-cool">stronger.</span>
            </h1>
            <p className="text-text-2 text-lg leading-relaxed mb-9 max-w-[480px]">
              Upload your textbooks, notes, or articles — StudyWise instantly turns them into explanations, quizzes, flashcards, mind maps and more.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/register" className="btn-primary text-base px-8 py-4">🚀 Start free for 3 days</Link>
              <a href="#features" className="btn-ghost text-sm">See how it works</a>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <div className="flex">
                {[['A','linear-gradient(135deg,#7C3AED,#EC4899)'],['C','linear-gradient(135deg,#06B6D4,#7C3AED)'],['E','linear-gradient(135deg,#F59E0B,#EC4899)'],['T','linear-gradient(135deg,#10B981,#06B6D4)']].map(([l,g],i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-black -mr-2.5" style={{ background:g }}>{l}</div>
                ))}
              </div>
              <p className="ml-3 text-sm text-text-2">Join <strong className="text-white">2,000+ students</strong> already studying smarter</p>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="animate-badge-1 absolute -top-5 -left-8 glass-strong rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 z-20 shadow-2xl">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background:'rgba(16,185,129,.15)' }}>✅</div>
              <div><div className="text-[0.62rem] text-text-2">Quiz Score</div><div className="text-sm font-bold text-emerald-400">92% — Excellent!</div></div>
            </div>
            <div className="animate-badge-2 absolute bottom-10 -right-8 glass-strong rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 z-20 shadow-2xl">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background:'rgba(245,158,11,.15)' }}>🔥</div>
              <div><div className="text-[0.62rem] text-text-2">Streak</div><div className="text-sm font-bold text-yellow-400">7 days in a row</div></div>
            </div>
            <div className="animate-badge-3 absolute -bottom-4 left-6 glass-strong rounded-xl px-3.5 py-2.5 flex items-center gap-2 z-20 shadow-2xl">
              <span>🃏</span><span className="text-sm font-semibold" style={{ color:'#9D5FF5' }}>12 flashcards mastered</span>
            </div>

            <div className="glass-strong rounded-2xl p-6 shadow-[0_40px_80px_rgba(0,0,0,.55)]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"/><div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"/><div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"/>
                <span className="ml-2 text-xs text-text-2 font-medium">StudyWise — Active Session</span>
              </div>
              <div className="rounded-xl p-3.5 mb-3.5 text-sm text-text-2 leading-relaxed" style={{ background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)' }}>
                <strong className="text-violet-l block mb-1 text-sm">📄 Thermodynamics — Chapter 4</strong>
                Heat transfer, entropy, and the laws of thermodynamics. 48 pages loaded.
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                {[['💡','Explain',true],['✅','Quiz',false],['🃏','Flashcards',false],['🕸️','Mind Map',false]].map(([icon,label,active]) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium cursor-default"
                    style={{ background:active?'rgba(124,58,237,.15)':'rgba(255,255,255,.03)', border:`1px solid ${active?'rgba(124,58,237,.4)':'rgba(255,255,255,.07)'}`, color:active?'#9D5FF5':'#A0A0C0' }}>
                    <span>{icon}</span>{label}
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3.5" style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)' }}>
                <div className="text-[0.62rem] font-bold uppercase tracking-widest mb-2" style={{ color:'#9D5FF5' }}>💡 Explanation — Medium Level</div>
                <div className="text-xs text-text-2 leading-relaxed min-h-[50px]">
                  {text}<span className="inline-block w-0.5 h-3.5 bg-violet-l ml-0.5 align-middle animate-blink"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── MARQUEE ───────────────────────────────────────── */
function Marquee() {
  const items = ['Smart Explanations','Smart Quizzes','Flashcard Decks','Mind Maps','PDF Upload','Practice Problems','Tutor Chat','Study Summaries','Pomodoro Timer','Progress Tracking']
  const doubled = [...items,...items]
  return (
    <div className="py-4 border-t border-b border-white/8 overflow-hidden">
      <div className="animate-marquee flex gap-10 w-max">
        {doubled.map((item,i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm font-medium text-text-3 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#7C3AED' }}/>{item}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── STATS ─────────────────────────────────────────── */
function Stats() {
  return (
    <section className="py-20">
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/8 rounded-2xl overflow-hidden border border-white/8" style={{ background:'#0E0E1A' }}>
          {[['2,000+','Active students','grad-text'],['50k+','Quizzes taken','grad-text-cool'],['120k+','Flashcards studied',''],['4.9★','Average rating','grad-text']].map(([n,l,g]) => (
            <div key={l} className="py-7 px-4 text-center">
              <div className={`font-display font-extrabold tracking-tight leading-none mb-2 ${g || ''}`}
                   style={{ fontSize:'clamp(1.5rem,6vw,3rem)', ...((!g) ? { background:'linear-gradient(135deg,#EC4899,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' } : {}) }}>
                {n}
              </div>
              <div className="text-xs md:text-sm text-text-2 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS ──────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:'01',icon:'📤',bg:'rgba(124,58,237,.15)',title:'Upload your material',desc:'Drop in a PDF, paste your lecture notes, or an article URL. StudyWise reads it all instantly.' },
    { n:'02',icon:'🛠️',bg:'rgba(236,72,153,.15)',title:'Pick your study tool',desc:'Explanations, quizzes, flashcards, mind maps, tutor chat, practice problems — switch anytime.' },
    { n:'03',icon:'🎯',bg:'rgba(6,182,212,.15)', title:'Learn and ace your exams',desc:'Track your progress, build streaks, and watch your understanding grow every session.' },
  ]
  return (
    <section className="py-20 pb-28" id="how">
      <div className="page-container">
        <div className="mb-14">
          <div className="eyebrow mb-4">✨ Simple process</div>
          <h2 className="section-title text-4xl md:text-5xl mb-4">From textbook to test-ready<br/><span className="grad-text">in three steps</span></h2>
          <p className="text-text-2 text-lg max-w-lg">No setup. No confusion. Just upload, pick a tool, and start learning.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(s => (
            <div key={s.n} className="glass grad-border rounded-2xl p-8 hover:-translate-y-1 transition-transform">
              <div className="font-display font-extrabold text-6xl leading-none mb-4 text-white opacity-[0.07]">{s.n}</div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background:s.bg }}>{s.icon}</div>
              <h3 className="font-display font-bold text-lg mb-3 text-white">{s.title}</h3>
              <p className="text-sm text-text-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FEATURES ──────────────────────────────────────── */
function Features() {
  const Tag = ({ free, children }) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wider mb-3 ${free?'bg-emerald-500/15 text-emerald-400':'bg-violet/15 text-violet-l'}`}>{children}</span>
  )
  return (
    <section className="py-20 pb-28" id="features">
      <div className="page-container">
        <div className="mb-14">
          <div className="eyebrow mb-4">🔥 Everything you need</div>
          <h2 className="section-title text-4xl md:text-5xl mb-4">Every tool a serious<br/><span className="grad-text">student needs</span></h2>
          <p className="text-text-2 text-lg max-w-lg">Nine powerful study tools in one platform — built for every student.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Big: Quiz */}
          <div className="md:col-span-5 md:row-span-2 glass grad-border rounded-2xl p-7 hover:-translate-y-1 transition-transform">
            <Tag free>✅ Free & Premium</Tag>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background:'rgba(16,185,129,.15)' }}>✅</div>
            <h3 className="font-display font-bold text-lg mb-2 text-white">AI Quiz Generator</h3>
            <p className="text-sm text-text-2 leading-relaxed mb-4">Multiple-choice questions from your content. Instant scoring, explanation per question.</p>
            <div className="rounded-xl p-3.5" style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)' }}>
              <p className="text-xs font-semibold text-white mb-2.5">What is the primary function of mitochondria?</p>
              {[['A. Produce energy (ATP) for the cell','correct'],['B. Control cell division','wrong'],['C. Synthesise proteins','']].map(([t,s]) => (
                <div key={t} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-1.5 text-xs ${s==='correct'?'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400':s==='wrong'?'bg-rose-500/10 border border-rose-500/30 text-rose-400':'text-text-2'}`}
                  style={!s?{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)'}:{}}>
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[0.52rem] flex-shrink-0">{s==='correct'?'✓':s==='wrong'?'✗':''}</div>{t}
                </div>
              ))}
            </div>
          </div>
          {/* Explain */}
          <div className="md:col-span-7 glass grad-border rounded-2xl p-7 hover:-translate-y-1 transition-transform">
            <Tag free>💡 Free (Basic) · Premium (All)</Tag>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background:'rgba(124,58,237,.15)' }}>💡</div>
            <h3 className="font-display font-bold text-lg mb-2 text-white">Adaptive Explanations</h3>
            <p className="text-sm text-text-2 leading-relaxed mb-3">Choose your level — AI explains exactly the way you need it.</p>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400">🟢 Simple</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400">🟡 Medium</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400">🔴 Advanced</span>
            </div>
          </div>
          {/* Flashcards */}
          <div className="md:col-span-4 glass grad-border rounded-2xl p-7 hover:-translate-y-1 transition-transform">
            <Tag>🃏 Premium</Tag>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background:'rgba(236,72,153,.15)' }}>🃏</div>
            <h3 className="font-display font-bold text-lg mb-2 text-white">Flashcard Decks</h3>
            <p className="text-sm text-text-2 leading-relaxed mb-3">Auto-generated flip cards. Study mode goes card by card.</p>
            <div className="rounded-xl p-3.5" style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
              <div className="text-[0.6rem] font-bold uppercase tracking-widest text-white/60 mb-1">Term</div>
              <div className="text-sm font-bold text-white">What is osmosis?</div>
            </div>
          </div>
          {/* Mind map */}
          <div className="md:col-span-3 glass grad-border rounded-2xl p-7 hover:-translate-y-1 transition-transform">
            <Tag>🕸️ Premium</Tag>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background:'rgba(6,182,212,.15)' }}>🕸️</div>
            <h3 className="font-display font-bold text-lg mb-2 text-white">Mind Maps</h3>
            <p className="text-sm text-text-2 leading-relaxed">Visual concept webs showing how ideas connect.</p>
          </div>
          {/* Summary */}
          <div className="md:col-span-4 glass grad-border rounded-2xl p-7 hover:-translate-y-1 transition-transform">
            <Tag>📋 Premium</Tag>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background:'rgba(245,158,11,.15)' }}>📋</div>
            <h3 className="font-display font-bold text-lg mb-2 text-white">Smart Summaries</h3>
            <p className="text-sm text-text-2 leading-relaxed">Key points, sections, and a glossary — ready to revise.</p>
          </div>
          {/* AI Chat */}
          <div className="md:col-span-4 glass grad-border rounded-2xl p-7 hover:-translate-y-1 transition-transform">
            <Tag>🤖 Premium</Tag>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background:'rgba(124,58,237,.15)' }}>🤖</div>
            <h3 className="font-display font-bold text-lg mb-2 text-white">Tutor Chat</h3>
            <p className="text-sm text-text-2 leading-relaxed">Ask follow-up questions about your content. Like having a personal tutor 24/7.</p>
          </div>
          {/* Pomodoro */}
          <div className="md:col-span-4 glass grad-border rounded-2xl p-7 hover:-translate-y-1 transition-transform">
            <Tag free>⏱️ All plans</Tag>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background:'rgba(245,158,11,.15)' }}>⏱️</div>
            <h3 className="font-display font-bold text-lg mb-2 text-white">Pomodoro Timer</h3>
            <p className="text-sm text-text-2 leading-relaxed">Built-in focus timer. Study in intervals, avoid burnout.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── TRIAL ─────────────────────────────────────────── */
function TrialBanner() {
  return (
    <section className="py-20">
      <div className="page-container">
        <div className="relative rounded-3xl p-14 md:p-16 overflow-hidden" style={{ background:'linear-gradient(135deg,rgba(124,58,237,.28),rgba(236,72,153,.18))',border:'1px solid rgba(124,58,237,.3)' }}>
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none" style={{ background:'radial-gradient(circle,rgba(124,58,237,.3),transparent 70%)' }}/>
          <div className="absolute -bottom-16 left-[20%] w-72 h-72 rounded-full pointer-events-none" style={{ background:'radial-gradient(circle,rgba(236,72,153,.2),transparent 70%)' }}/>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ background:'rgba(245,158,11,.18)',border:'1px solid rgba(245,158,11,.35)',color:'#F59E0B' }}>⏳ 3-day free trial</div>
              <h2 className="section-title text-4xl md:text-5xl mb-4">3 days free.<br/><span className="grad-text">No card. No catch.</span></h2>
              <p className="text-text-2 text-lg leading-relaxed mb-7">Full access to every feature — PDF uploads, unlimited quizzes, flashcards, mind maps, Tutor chat, and more.</p>
              <Link to="/register" className="btn-primary text-base px-8 py-4">🚀 Claim your free trial</Link>
            </div>
            <div className="flex-shrink-0 text-center rounded-2xl p-10" style={{ background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)' }}>
              <div className="font-display font-extrabold leading-none grad-text mb-2" style={{ fontSize:'6rem' }}>3</div>
              <div className="text-text-2 text-sm font-medium">days completely free</div>
              <div className="text-text-3 text-xs mt-3">Then just ₦500/month</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── PRICING ───────────────────────────────────────── */
function Pricing() {
  const freeF = [
    [true,'Paste text input'],
    [true,'Explanations (Simple level only)'],
    [true,'3 quiz questions per session'],
    [true,'3 flashcards per session'],
    [true,'Pomodoro timer'],
    [true,'Save up to 3 sessions'],
    [false,'PDF & URL upload'],
    [false,'Mind maps & summaries'],
    [false,'Tutor chat & practice problems'],
  ]
  const premF = ['PDF, URL & text upload','Explanations (all 3 levels)','Unlimited quiz questions','Unlimited flashcards + study mode','Mind maps & smart summaries','Tutor chat','Practice problems','Unlimited sessions','Full progress dashboard']
  return (
    <section className="py-20 pb-28" id="pricing">
      <div className="page-container">
        <div className="text-center mb-14">
          <div className="eyebrow mb-4 mx-auto">💰 Pricing</div>
          <h2 className="section-title text-4xl md:text-5xl mb-4">Simple, student-friendly<br/><span className="grad-text">pricing</span></h2>
          <p className="text-text-2 text-lg">Start free, upgrade when ready. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-9">
            <div className="text-xs font-bold uppercase tracking-widest text-text-2 mb-2">Free Plan</div>
            <div className="font-display font-extrabold text-5xl tracking-tight text-white mb-1">₦0</div>
            <div className="text-sm text-text-2 mb-7">forever free</div>
            <ul className="space-y-2.5 mb-8">
              {freeF.map(([y,t]) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[0.52rem] flex-shrink-0 mt-0.5 ${y?'bg-emerald-500/20 text-emerald-400':'bg-white/6 text-text-3'}`}>{y?'✓':'🔒'}</div>
                  <span className={y?'text-text-2':'text-text-3'}>{t}</span>
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-ghost w-full justify-center">Get started free</Link>
          </div>
          <div className="relative rounded-2xl p-9" style={{ background:'linear-gradient(135deg,rgba(124,58,237,.2),rgba(236,72,153,.1))',border:'1px solid rgba(124,58,237,.4)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.58rem] font-extrabold tracking-widest text-white px-4 py-1 rounded-full" style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>MOST POPULAR</div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'#9D5FF5' }}>Premium Plan</div>
            <div className="font-display font-extrabold text-5xl tracking-tight grad-text mb-1">₦500</div>
            <div className="text-sm text-text-2 mb-7">per month</div>
            <ul className="space-y-2.5 mb-8">
              {premF.map(t => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[0.52rem] flex-shrink-0 mt-0.5 bg-emerald-500/20 text-emerald-400">✓</div>
                  <span className="text-text-2">{t}</span>
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary w-full justify-center">🚀 Start 3-day free trial</Link>
            <p className="text-center text-xs text-text-3 mt-3">No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── REFERRAL ──────────────────────────────────────── */
function Referral() {
  return (
    <section className="py-20" id="referral">
      <div className="page-container">
        <div className="rounded-3xl p-10 md:p-14 grid md:grid-cols-2 gap-14 items-center" style={{ background:'linear-gradient(135deg,rgba(6,182,212,.1),rgba(124,58,237,.1))',border:'1px solid rgba(6,182,212,.2)' }}>
          <div>
            <div className="eyebrow mb-4">🎁 Refer &amp; Earn</div>
            <h2 className="section-title text-4xl mb-4">Share StudyWise.<br/><span className="grad-text-cool">Get premium free.</span></h2>
            <p className="text-text-2 text-lg leading-relaxed mb-8">Invite your coursemates and earn free premium — no payment needed.</p>
            <div className="flex flex-col gap-5">
              {[['1','Share your unique link','Every student gets a personal referral link on their dashboard.'],['2','Friend signs up + gets 6 days free','They get 6 days instead of 3 — more time to fall in love with it.'],['3','You get 1 month free when 5 join','Refer 5 friends = 1 full month of premium at ₦0.']].map(([n,t,d]) => (
                <div key={n} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0" style={{ background:'linear-gradient(135deg,#06B6D4,#7C3AED)' }}>{n}</div>
                  <div><strong className="text-sm font-semibold text-white block mb-1">{t}</strong><span className="text-sm text-text-2">{d}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-2xl p-7 min-w-[260px]" style={{ background:'#0E0E1A',border:'1px solid rgba(255,255,255,.1)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white" style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>T</div>
                <div><div className="font-semibold text-sm text-white">Tunde's Referrals</div><div className="text-xs text-text-2">3 of 5 friends joined</div></div>
              </div>
              <div className="rounded-xl p-3 mb-4 font-mono text-xs break-all" style={{ background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',color:'#22D3EE' }}>studywise.io/ref/tunde2024</div>
              <div className="h-2 rounded-full mb-2 overflow-hidden" style={{ background:'rgba(255,255,255,.08)' }}>
                <div className="h-full rounded-full" style={{ width:'60%',background:'linear-gradient(90deg,#06B6D4,#7C3AED)' }}/>
              </div>
              <div className="text-xs text-right text-text-2"><strong style={{ color:'#22D3EE' }}>3/5</strong> joined · 2 more for 1 free month</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── TESTIMONIALS ──────────────────────────────────── */
function Testimonials() {
  const t = [
    ['"I used to spend hours struggling with Organic Chemistry. StudyWise explained it better in 2 minutes than my lecturer did all semester."','Amaka O.','300L Biochemistry, University of Lagos','linear-gradient(135deg,#7C3AED,#EC4899)','A'],
    ['"Studied for GNS in one night using flashcards and scored 85. My roommates are all using it now."','Chisom E.','200L Law, University of Nigeria','linear-gradient(135deg,#06B6D4,#7C3AED)','C'],
    ['"The subscription pays for itself in the first week. I've replaced so many textbooks and tutors with this."','Emmanuel K.','400L Engineering, ABU Zaria','linear-gradient(135deg,#F59E0B,#EC4899)','E'],
  ]
  return (
    <section className="py-20 pb-28">
      <div className="page-container">
        <div className="text-center mb-14">
          <div className="eyebrow mb-4 mx-auto">❤️ Student love</div>
          <h2 className="section-title text-4xl md:text-5xl">What students are <span className="grad-text">saying</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {t.map(([q,n,r,g,l]) => (
            <div key={n} className="glass grad-border rounded-2xl p-7 hover:-translate-y-1 transition-transform">
              <div className="text-yellow-400 text-sm mb-4">★★★★★</div>
              <p className="text-sm text-text-2 leading-relaxed italic mb-6">{q}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0" style={{ background:g }}>{l}</div>
                <div><div className="text-sm font-semibold text-white">{n}</div><div className="text-xs text-text-2">{r}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/8 py-14">
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>📚</div>
              <span className="font-display font-extrabold text-xl text-white">StudyWise</span>
            </div>
            <p className="text-sm text-text-2 leading-relaxed max-w-[200px]">Smart study platform for students at every level — primary, secondary and university.</p>
          </div>
          {[{title:'Product',links:['Features','Pricing','Referral','Changelog']},{title:'Company',links:['About','Blog','Contact','Careers']},{title:'Legal',links:['Privacy Policy','Terms of Use','Cookie Policy']}].map(col => (
            <div key={col.title}>
              <h5 className="text-[0.68rem] font-bold uppercase tracking-widest text-text-3 mb-4">{col.title}</h5>
              <ul className="space-y-3">
                {col.links.map(l => <li key={l}><a href="#" className="text-sm text-text-2 hover:text-white transition-colors no-underline">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-7 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-3">
          <span>© 2025 StudyWise. All rights reserved.</span>
          <span>Made with ❤️ in Nigeria 🇳🇬</span>
        </div>
      </div>
    </footer>
  )
}

/* ─── PAGE ──────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Marquee />
      <Stats />
      <HowItWorks />
      <Features />
      <TrialBanner />
      <Pricing />
      <Referral />
      <Testimonials />
      {/* Footer CTA */}
      <section className="py-20">
        <div className="page-container text-center">
          <h2 className="section-title text-4xl md:text-5xl mb-4">Ready to study smarter?<br/><span className="grad-text">Start free today.</span></h2>
          <p className="text-text-2 text-lg mb-8">3 days full access. No credit card needed. Cancel anytime.</p>
          <Link to="/register" className="btn-primary text-lg px-10 py-5">🚀 Create free account</Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
