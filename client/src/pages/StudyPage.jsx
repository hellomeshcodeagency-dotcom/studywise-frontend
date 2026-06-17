import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { LogOut, Upload, FileText, Link as LinkIcon, ChevronRight, Lock, RotateCcw, Send, Timer, X, Check, ChevronLeft } from 'lucide-react'

/* ─── SIDEBAR (reused) ──────────────────────────────── */
function Sidebar() {
  const { user, logout, trialDaysLeft, isOnTrial, hasPremium } = useAuth()
  const navigate = useNavigate()
  const days = trialDaysLeft()
  const links = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/study',     icon: '📚', label: 'Study Room' },
    { to: '/history',   icon: '📋', label: 'History' },
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all ${l.label === 'Study Room' ? 'text-white' : 'text-text-2 hover:text-white hover:bg-white/5'}`}
            style={l.label === 'Study Room' ? { background: 'rgba(124,58,237,.2)' } : {}}>
            <span className="text-base">{l.icon}</span>{l.label}
            {l.label === 'Study Room' && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#9D5FF5' }} />}
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

/* ─── LOCKED OVERLAY ────────────────────────────────── */
function LockedOverlay({ feature }) {
  return (
    <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm" style={{ background: 'rgba(7,7,15,.85)' }}>
      <div className="text-center px-6">
        <div className="text-4xl mb-3">🔒</div>
        <div className="font-display font-bold text-white text-lg mb-2">{feature} is Premium</div>
        <p className="text-sm text-text-2 mb-4">Upgrade for ₦500/month to unlock all tools</p>
        <button onClick={() => toast('Paystack payments coming soon! 🚀')} className="btn-primary text-sm py-2.5 px-6">
          ⚡ Upgrade Now
        </button>
      </div>
    </div>
  )
}

/* ─── POMODORO TIMER ────────────────────────────────── */
function PomodoroTimer({ onClose }) {
  const [mins, setMins]       = useState(25)
  const [secs, setSecs]       = useState(0)
  const [running, setRunning] = useState(false)
  const [mode, setMode]       = useState('focus') // focus | break
  const timerRef              = useRef(null)

  const MODES = { focus: 25, break: 5 }

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSecs(s => {
          if (s === 0) {
            setMins(m => {
              if (m === 0) {
                setRunning(false)
                toast.success(mode === 'focus' ? '✅ Focus session done! Take a break.' : '🔥 Break over! Back to studying.')
                clearInterval(timerRef.current)
                return MODES[mode]
              }
              return m - 1
            })
            return 59
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [running])

  function switchMode(m) {
    clearInterval(timerRef.current)
    setRunning(false)
    setMode(m)
    setMins(MODES[m])
    setSecs(0)
  }

  function reset() {
    clearInterval(timerRef.current)
    setRunning(false)
    setMins(MODES[mode])
    setSecs(0)
  }

  const total   = MODES[mode] * 60
  const elapsed = total - (mins * 60 + secs)
  const pct     = (elapsed / total) * 100
  const r       = 52
  const circ    = 2 * Math.PI * r

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-strong rounded-3xl p-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-white text-lg">⏱️ Pomodoro Timer</h3>
          <button onClick={onClose} className="text-text-3 hover:text-white transition-colors"><X size={18}/></button>
        </div>
        <div className="flex gap-2 justify-center mb-8">
          {['focus','break'].map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${mode===m ? 'text-white' : 'text-text-3 hover:text-text-2'}`}
              style={mode===m ? { background:'linear-gradient(135deg,#7C3AED,#EC4899)' } : { background:'rgba(255,255,255,.06)' }}>
              {m === 'focus' ? '🎯 Focus' : '☕ Break'}
            </button>
          ))}
        </div>
        {/* Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8"/>
              <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
                stroke="url(#pg)" strokeDasharray={circ} strokeDashoffset={circ - (pct/100)*circ}
                style={{ transition:'stroke-dashoffset .5s ease' }}/>
              <defs>
                <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED"/>
                  <stop offset="100%" stopColor="#EC4899"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-extrabold text-3xl text-white">
                {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-ghost text-sm py-2.5 px-5"><RotateCcw size={14}/> Reset</button>
          <button onClick={() => setRunning(r => !r)} className="btn-primary text-sm py-2.5 px-8">
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── EXPLAIN TOOL ──────────────────────────────────── */
function ExplainTool({ content, sessionId, isPremium }) {
  const [level, setLevel]   = useState('simple')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!isPremium && level !== 'simple') {
      toast.error('Medium & Advanced levels require Premium')
      return
    }
    setLoading(true)
    setResult('')
    try {
      const res = await api.post('/study/explain', { session_id: sessionId, content, level })
      setResult(res.data.explanation)
    } catch (e) {
      toast.error(e.response?.data?.message || 'AI error. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-sm text-text-2 font-medium">Explain at:</span>
        <div className="flex rounded-xl overflow-hidden border border-white/8">
          {[['simple','🟢 Simple'],['medium','🟡 Medium'],['advanced','🔴 Advanced']].map(([v,l]) => (
            <button key={v} onClick={() => setLevel(v)}
              className={`px-4 py-2 text-xs font-bold transition-all ${level===v ? 'text-white' : 'text-text-3 hover:text-text-2'}`}
              style={level===v ? { background:'linear-gradient(135deg,#7C3AED,#EC4899)' } : { background:'rgba(255,255,255,.03)' }}>
              {l}{!isPremium && v!=='simple' && ' 🔒'}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5">
          {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Generating…</span> : '💡 Generate'}
        </button>
      </div>
      {result && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💡</span>
            <h3 className="font-display font-bold text-white">Explanation</h3>
            <span className={`ml-auto px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase ${level==='simple'?'bg-emerald-500/20 text-emerald-400':level==='medium'?'bg-amber-500/20 text-amber-400':'bg-rose-500/20 text-rose-400'}`}>{level}</span>
          </div>
          <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  )
}

/* ─── QUIZ TOOL ─────────────────────────────────────── */
function QuizTool({ content, sessionId, isPremium }) {
  const [count, setCount]     = useState(isPremium ? 10 : 3)
  const [questions, setQs]    = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore]     = useState(null)

  async function generate() {
    setLoading(true)
    setQs([])
    setAnswers({})
    setSubmitted(false)
    setScore(null)
    try {
      const res = await api.post('/study/quiz', { session_id: sessionId, content, count })
      setQs(res.data.questions)
    } catch (e) { toast.error('AI error. Try again.') }
    finally { setLoading(false) }
  }

  function pick(qi, letter) {
    if (submitted) return
    setAnswers(a => ({ ...a, [qi]: letter }))
  }

  async function submit() {
    if (Object.keys(answers).length === 0) { toast.error('Answer at least one question!'); return }
    let correct = 0
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++ })
    setScore(correct)
    setSubmitted(true)
    try {
      await api.post('/study/quiz-result', { session_id: sessionId, score: correct, total: questions.length })
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-sm text-text-2 font-medium">Questions:</span>
        <div className="flex rounded-xl overflow-hidden border border-white/8">
          {(isPremium ? [5,10,15] : [3]).map(n => (
            <button key={n} onClick={() => setCount(n)}
              className={`px-4 py-2 text-xs font-bold transition-all ${count===n?'text-white':'text-text-3 hover:text-text-2'}`}
              style={count===n?{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}:{background:'rgba(255,255,255,.03)'}}>
              {n}
            </button>
          ))}
        </div>
        {!isPremium && <span className="text-xs text-text-3">🔒 More questions with Premium</span>}
        <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5">
          {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Building…</span> : '✅ Generate Quiz'}
        </button>
      </div>

      {/* Score */}
      {submitted && score !== null && (
        <div className="glass rounded-2xl p-5 mb-5 flex items-center gap-5" style={{ border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="text-center">
            <div className="font-display font-extrabold text-4xl grad-text">{score}/{questions.length}</div>
            <div className="text-xs text-text-3 mt-0.5">correct</div>
          </div>
          <div className="flex-1">
            <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,.08)' }}>
              <div className="h-full rounded-full" style={{ width:`${(score/questions.length)*100}%`, background:'linear-gradient(90deg,#7C3AED,#EC4899)' }}/>
            </div>
            <div className="text-xs text-text-2">{Math.round((score/questions.length)*100)}% accuracy</div>
          </div>
          <button onClick={generate} className="btn-ghost text-xs py-2 px-4"><RotateCcw size={12}/> Retry</button>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="text-[0.68rem] font-bold uppercase tracking-wider text-text-3 mb-2">Question {i+1}</div>
            <p className="text-sm font-semibold text-white mb-4 leading-relaxed">{q.q}</p>
            <div className="space-y-2">
              {q.options.map(opt => {
                const letter = opt.charAt(0)
                const isSelected = answers[i] === letter
                const isCorrect  = submitted && letter === q.answer
                const isWrong    = submitted && isSelected && letter !== q.answer
                return (
                  <button key={letter} onClick={() => pick(i, letter)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all ${
                      isCorrect ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
                      isWrong   ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' :
                      isSelected ? 'text-white' : 'text-text-2 hover:text-white'
                    }`}
                    style={{
                      border: isCorrect ? '1px solid rgba(16,185,129,.5)' :
                              isWrong   ? '1px solid rgba(239,68,68,.5)' :
                              isSelected ? '1px solid rgba(124,58,237,.5)' : '1px solid rgba(255,255,255,.08)',
                      background: isCorrect ? 'rgba(16,185,129,.1)' :
                                  isWrong   ? 'rgba(239,68,68,.1)' :
                                  isSelected ? 'rgba(124,58,237,.15)' : 'rgba(255,255,255,.03)',
                    }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCorrect?'bg-emerald-500 text-white':isWrong?'bg-rose-500 text-white':isSelected?'text-white':'text-text-3'}`}
                      style={isSelected&&!isCorrect&&!isWrong?{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}:{}}>
                      {isCorrect ? '✓' : isWrong ? '✗' : letter}
                    </div>
                    {opt.slice(3)}
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <div className="mt-3 px-4 py-3 rounded-xl text-xs text-text-2 leading-relaxed" style={{ background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)' }}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {questions.length > 0 && !submitted && (
        <button onClick={submit} className="btn-primary mt-5">Submit Answers</button>
      )}
    </div>
  )
}

/* ─── FLASHCARDS TOOL ───────────────────────────────── */
function FlashcardsTool({ content, sessionId, isPremium }) {
  const [cards, setCards]     = useState([])
  const [flipped, setFlipped] = useState({})
  const [studyMode, setStudyMode] = useState(false)
  const [studyIdx, setStudyIdx]   = useState(0)
  const [studyFlipped, setStudyFlipped] = useState(false)
  const [known, setKnown]     = useState([])
  const [loading, setLoading] = useState(false)
  const count = isPremium ? 12 : 3

  async function generate() {
    setLoading(true)
    setCards([])
    setFlipped({})
    setKnown([])
    setStudyMode(false)
    try {
      const res = await api.post('/study/flashcards', { session_id: sessionId, content, count })
      setCards(res.data.cards)
    } catch (e) { toast.error('AI error. Try again.') }
    finally { setLoading(false) }
  }

  if (studyMode && cards.length > 0) {
    const card = cards[studyIdx]
    const remaining = cards.filter((_,i) => !known.includes(i))
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setStudyMode(false)} className="btn-ghost text-sm py-2 px-4"><ChevronLeft size={14}/> Back to grid</button>
          <span className="text-sm text-text-2">{studyIdx + 1} / {cards.length} · {known.length} known</span>
        </div>
        {/* Big flip card */}
        <div className="flex justify-center mb-5">
          <div className="w-full max-w-lg h-56 cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setStudyFlipped(f => !f)}>
            <div className="relative w-full h-full transition-all duration-500" style={{ transformStyle:'preserve-3d', transform: studyFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
              <div className="absolute inset-0 rounded-2xl flex flex-col justify-between p-7 backface-hidden" style={{ backfaceVisibility:'hidden', background:'#0E0E1A', border:'1px solid rgba(255,255,255,.1)' }}>
                <span className="text-[0.62rem] font-bold uppercase tracking-wider" style={{ color:'#9D5FF5' }}>TERM</span>
                <p className="font-display font-semibold text-xl text-white text-center">{card.front}</p>
                <span className="text-xs text-text-3 text-right">Tap to reveal →</span>
              </div>
              <div className="absolute inset-0 rounded-2xl flex flex-col justify-between p-7" style={{ backfaceVisibility:'hidden', transform:'rotateY(180deg)', background:'linear-gradient(135deg,#1a0533,#2d0a1e)', border:'1px solid rgba(124,58,237,.3)' }}>
                <span className="text-[0.62rem] font-bold uppercase tracking-wider text-violet-l">ANSWER</span>
                <p className="text-sm text-white leading-relaxed text-center">{card.back}</p>
                <span className="text-xs text-text-3 text-right">← Tap to flip back</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center mb-6">
          <button onClick={() => { setKnown(k => [...k, studyIdx]); setStudyIdx(i => Math.min(i+1,cards.length-1)); setStudyFlipped(false) }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-emerald-400 transition-all hover:-translate-y-0.5"
            style={{ background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.3)' }}>
            <Check size={16}/> Got it!
          </button>
          <button onClick={() => { setStudyIdx(i => Math.min(i+1,cards.length-1)); setStudyFlipped(false) }}
            className="btn-ghost text-sm py-3 px-6">
            Still learning <ChevronRight size={14}/>
          </button>
        </div>
        {studyIdx === cards.length - 1 && (
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-display font-bold text-white mb-1">Session complete!</div>
            <div className="text-sm text-text-2">{known.length} known · {cards.length - known.length} still learning</div>
            <button onClick={() => { setStudyIdx(0); setStudyFlipped(false); setKnown([]) }} className="btn-primary mt-4 text-sm">Restart deck</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-sm text-text-2">{count} cards {!isPremium && '· 🔒 More with Premium'}</span>
        <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5">
          {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Creating…</span> : '🃏 Generate Flashcards'}
        </button>
        {cards.length > 0 && <button onClick={() => { setStudyMode(true); setStudyIdx(0); setStudyFlipped(false) }} className="btn-ghost text-sm py-2 px-5">▶ Study Mode</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}
            className="cursor-pointer rounded-2xl min-h-[140px] flex flex-col justify-between p-5 transition-all hover:-translate-y-1"
            style={{ background: flipped[i] ? 'linear-gradient(135deg,#1a0533,#2d0a1e)' : '#0E0E1A', border: `1px solid ${flipped[i] ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.08)'}` }}>
            <span className="text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: flipped[i] ? '#9D5FF5' : '#606080' }}>
              {flipped[i] ? 'ANSWER' : 'TERM'}
            </span>
            <p className="text-sm font-medium text-white leading-relaxed my-3">{flipped[i] ? c.back : c.front}</p>
            <span className="text-[0.62rem] text-text-3 text-right">{flipped[i] ? '← tap to flip' : 'tap to reveal →'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SUMMARY TOOL ──────────────────────────────────── */
function SummaryTool({ content, sessionId, isPremium }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    setData(null)
    try {
      const res = await api.post('/study/summary', { session_id: sessionId, content })
      setData(res.data.summary)
    } catch (e) { toast.error(e.response?.data?.message || 'AI error. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative">
      {!isPremium && <LockedOverlay feature="Summary" />}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5">
          {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Summarising…</span> : '📋 Generate Summary'}
        </button>
      </div>
      {data && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-bold text-white text-lg mb-1">{data.topic}</h3>
            <p className="text-sm text-text-2 leading-relaxed">{data.overview}</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h4 className="font-display font-bold text-white mb-3 flex items-center gap-2"><span>⚡</span> Key Points</h4>
            <ul className="space-y-2">
              {data.key_points?.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background:'#F59E0B' }}/>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          {data.sections?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h4 className="font-display font-bold text-white mb-4 flex items-center gap-2"><span>📌</span> Topic Sections</h4>
              <div className="space-y-4">
                {data.sections.map((s, i) => (
                  <div key={i} className="border-l-2 pl-4" style={{ borderColor:'#F59E0B' }}>
                    <h5 className="text-sm font-bold text-white mb-1">{s.title}</h5>
                    <p className="text-sm text-text-2 leading-relaxed">{s.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.key_terms?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h4 className="font-display font-bold text-white mb-4 flex items-center gap-2"><span>🔑</span> Key Terms</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.key_terms.map((t, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl" style={{ background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)' }}>
                    <div className="text-xs font-bold mb-1" style={{ color:'#9D5FF5' }}>{t.term}</div>
                    <div className="text-xs text-text-2 leading-relaxed">{t.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── MIND MAP TOOL ─────────────────────────────────── */
function MindmapTool({ content, sessionId, isPremium }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const canvasRef             = useRef(null)

  async function generate() {
    setLoading(true)
    setData(null)
    try {
      const res = await api.post('/study/mindmap', { session_id: sessionId, content })
      setData(res.data.mindmap)
    } catch (e) { toast.error(e.response?.data?.message || 'AI error. Try again.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!data || !canvasRef.current) return
    const canvas = canvasRef.current
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    const cx = W / 2, cy = H / 2
    const branches = data.branches || []
    const svg = canvas.querySelector('svg')
    svg.innerHTML = ''
    canvas.querySelectorAll('.mm-node').forEach(n => n.remove())

    function makeNode(text, x, y, type) {
      const el = document.createElement('div')
      el.className = 'mm-node'
      el.style.cssText = `position:absolute;transform:translate(-50%,-50%);left:${x}px;top:${y}px;padding:${type==='root'?'10px 18px':'7px 14px'};border-radius:30px;font-family:Inter,sans-serif;font-size:${type==='root'?'0.85rem':'0.75rem'};font-weight:${type==='root'?'700':'500'};text-align:center;max-width:${type==='leaf'?'120px':'150px'};white-space:normal;line-height:1.3;z-index:5;cursor:default;transition:transform .18s;`
      el.style.background = type==='root' ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : type==='branch' ? 'rgba(245,158,11,.15)' : 'rgba(255,255,255,.05)'
      el.style.border = type==='root' ? 'none' : type==='branch' ? '1px solid rgba(245,158,11,.4)' : '1px solid rgba(255,255,255,.1)'
      el.style.color = type==='root' ? '#fff' : type==='branch' ? '#FCD34D' : '#A0A0C0'
      el.textContent = text
      canvas.appendChild(el)
    }

    function makeLine(x1,y1,x2,y2,color,w) {
      const line = document.createElementNS('http://www.w3.org/2000/svg','line')
      line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x2);line.setAttribute('y2',y2)
      line.setAttribute('stroke',color);line.setAttribute('stroke-width',w);line.setAttribute('stroke-opacity','0.5');line.setAttribute('stroke-linecap','round')
      svg.appendChild(line)
    }

    makeNode(data.center, cx, cy, 'root')
    const aStep = (2 * Math.PI) / Math.max(branches.length, 1)
    const bR = Math.min(W,H) * 0.29
    const cR = Math.min(W,H) * 0.15

    branches.forEach((b, bi) => {
      const angle = bi * aStep - Math.PI / 2
      const bx = cx + bR * Math.cos(angle)
      const by = cy + bR * Math.sin(angle)
      makeLine(cx,cy,bx,by,'#7C3AED',2)
      makeNode(b.label, bx, by, 'branch')
      ;(b.children||[]).forEach((child, ci) => {
        const total = b.children.length
        const spread = total > 1 ? Math.PI/4 : 0
        const ca = angle + (ci-(total-1)/2)*(spread/Math.max(total-1,1))
        const chx = bx + cR * Math.cos(ca)
        const chy = by + cR * Math.sin(ca)
        makeLine(bx,by,chx,chy,'rgba(255,255,255,.2)',1.5)
        makeNode(child, chx, chy, 'leaf')
      })
    })
  }, [data])

  return (
    <div className="relative">
      {!isPremium && <LockedOverlay feature="Mind Map" />}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5">
          {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Mapping…</span> : '🕸️ Generate Mind Map'}
        </button>
      </div>
      <div ref={canvasRef} className="relative rounded-2xl overflow-hidden" style={{ height:'480px', background:'#0A0A14', border:'1px solid rgba(255,255,255,.08)' }}>
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }}/>
        {!data && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-text-3 text-sm">Click "Generate Mind Map" to visualise your content</div>
        )}
      </div>
    </div>
  )
}

/* ─── AI CHAT TOOL ──────────────────────────────────── */
function ChatTool({ content, sessionId, isPremium }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  async function send() {
    if (!input.trim()) return
    const userMsg = { role:'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await api.post('/study/chat', { session_id: sessionId, content, history: messages, message: input })
      setMessages(m => [...m, { role:'assistant', content: res.data.reply }])
    } catch (e) { toast.error(e.response?.data?.message || 'AI error. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative">
      {!isPremium && <LockedOverlay feature="AI Tutor Chat" />}
      <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ height:'480px' }}>
        <div className="px-5 py-3.5 border-b border-white/8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"/>
          <span className="text-sm font-semibold text-white">AI Tutor</span>
          <span className="text-xs text-text-3 ml-1">— Ask anything about your content</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-sm text-text-2">Ask me anything about your uploaded content!</p>
              <div className="mt-4 flex flex-col gap-2 items-center">
                {['Summarise the main idea','What are the key concepts?','Explain this in simple terms'].map(s => (
                  <button key={s} onClick={() => setInput(s)} className="text-xs px-4 py-2 rounded-xl transition-colors text-text-2 hover:text-white"
                    style={{ background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)' }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role==='user'?'text-white':'text-text-2'}`}
                style={ m.role==='user'
                  ? { background:'linear-gradient(135deg,#7C3AED,#EC4899)' }
                  : { background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)' }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex">
              <div className="px-4 py-3 rounded-2xl" style={{ background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)' }}>
                <div className="flex gap-1.5 items-center">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-l animate-bounce" style={{ animationDelay:`${i*0.15}s` }}/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div className="px-4 py-3 border-t border-white/8 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&!e.shiftKey&&send()}
            placeholder="Ask a question about your content…" className="input-field text-sm py-2.5 flex-1"/>
          <button onClick={send} disabled={loading||!input.trim()} className="btn-primary text-sm py-2.5 px-5">
            <Send size={14}/>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── PRACTICE TOOL ─────────────────────────────────── */
function PracticeTool({ content, sessionId, isPremium }) {
  const [problems, setProblems] = useState([])
  const [shown, setShown]       = useState({})
  const [loading, setLoading]   = useState(false)

  async function generate() {
    setLoading(true)
    setProblems([])
    setShown({})
    try {
      const res = await api.post('/study/practice', { session_id: sessionId, content })
      setProblems(res.data.problems)
    } catch (e) { toast.error(e.response?.data?.message || 'AI error. Try again.') }
    finally { setLoading(false) }
  }

  const diffColor = { easy:'text-emerald-400', medium:'text-amber-400', hard:'text-rose-400' }

  return (
    <div className="relative">
      {!isPremium && <LockedOverlay feature="Practice Problems" />}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5">
          {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Generating…</span> : '🧩 Generate Problems'}
        </button>
      </div>
      <div className="space-y-4">
        {problems.map((p, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-text-3">Problem {i+1}</span>
              <span className={`text-[0.68rem] font-bold uppercase ml-auto ${diffColor[p.difficulty]||'text-text-3'}`}>{p.difficulty}</span>
            </div>
            <p className="text-sm font-semibold text-white mb-4 leading-relaxed">{p.question}</p>
            {!shown[i] ? (
              <div className="flex gap-3">
                <button onClick={() => setShown(s=>({...s,[i]:'hint'}))} className="btn-ghost text-xs py-2 px-4">💡 Show Hint</button>
                <button onClick={() => setShown(s=>({...s,[i]:'solution'}))} className="btn-primary text-xs py-2 px-4">✅ Show Solution</button>
              </div>
            ) : (
              <div>
                {shown[i] === 'hint' && (
                  <div className="px-4 py-3 rounded-xl mb-3 text-sm text-text-2 leading-relaxed" style={{ background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)' }}>
                    💡 <strong className="text-amber-400">Hint:</strong> {p.hint}
                  </div>
                )}
                <div className="px-4 py-3 rounded-xl text-sm text-text-2 leading-relaxed" style={{ background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)' }}>
                  ✅ <strong className="text-emerald-400">Solution:</strong> {p.solution}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────── */
export default function StudyPage() {
  const { hasPremium } = useAuth()
  const isPremium = hasPremium()

  const [inputMode, setInputMode]     = useState('paste')
  const [pasteText, setPasteText]     = useState('')
  const [urlInput, setUrlInput]       = useState('')
  const [content, setContent]         = useState('')
  const [sessionId, setSessionId]     = useState(null)
  const [sessionTitle, setSessionTitle] = useState('')
  const [activeTool, setActiveTool]   = useState('explain')
  const [uploading, setUploading]     = useState(false)
  const [contentLoaded, setContentLoaded] = useState(false)
  const [showPomodoro, setShowPomodoro]   = useState(false)
  const fileRef = useRef(null)

  const tools = [
    { id:'explain',    icon:'💡', label:'Explain' },
    { id:'quiz',       icon:'✅', label:'Quiz' },
    { id:'flashcards', icon:'🃏', label:'Flashcards' },
    { id:'summary',    icon:'📋', label:'Summary',   premium: true },
    { id:'mindmap',    icon:'🕸️', label:'Mind Map',  premium: true },
    { id:'chat',       icon:'🤖', label:'AI Tutor',  premium: true },
    { id:'practice',   icon:'🧩', label:'Practice',  premium: true },
  ]

  async function handlePDF(file) {
    if (!file || file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    if (!isPremium) { toast.error('PDF upload requires Premium. Upgrade for ₦500/month!'); return }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('pdf', file)
      const res = await api.post('/study/upload-pdf', form, { headers: { 'Content-Type':'multipart/form-data' } })
      setPasteText(res.data.text)
      setInputMode('paste')
      toast.success(`📄 ${res.data.filename} extracted (${res.data.pages} pages)`)
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to read PDF') }
    finally { setUploading(false) }
  }

  async function loadContent() {
    let text = ''
    if (inputMode === 'paste') {
      text = pasteText.trim()
      if (!text) { toast.error('Please paste some text first'); return }
    } else if (inputMode === 'url') {
      if (!urlInput.trim()) { toast.error('Please enter a URL'); return }
      if (!isPremium) { toast.error('URL input requires Premium!'); return }
      text = `[Study this article: ${urlInput}]`
    }

    setUploading(true)
    try {
      const title = text.slice(0, 60).replace(/\n/g,' ') + '…'
      const res = await api.post('/study/session', { title, source_type: inputMode, content_text: text })
      setContent(text)
      setSessionId(res.data.session.id)
      setSessionTitle(title)
      setContentLoaded(true)
      setActiveTool('explain')
      toast.success('Content loaded! Choose a tool to get started.')
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save session') }
    finally { setUploading(false) }
  }

  function reset() {
    setContent('')
    setSessionId(null)
    setContentLoaded(false)
    setPasteText('')
    setUrlInput('')
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      {showPomodoro && <PomodoroTimer onClose={() => setShowPomodoro(false)} />}

      <main className="ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-white mb-1">Study Room 📚</h1>
              <p className="text-text-2 text-sm">{contentLoaded ? sessionTitle : 'Upload your material to get started'}</p>
            </div>
            <button onClick={() => setShowPomodoro(true)} className="btn-ghost text-sm gap-2">
              <Timer size={15}/> Pomodoro Timer
            </button>
          </div>

          {/* Input section */}
          {!contentLoaded ? (
            <div className="glass rounded-2xl p-7 mb-6">
              <h2 className="font-display font-bold text-white text-lg mb-5">Add your study material</h2>

              {/* Mode switcher */}
              <div className="flex gap-2 mb-5">
                {[['paste','✏️','Paste Text'],['pdf','📄','Upload PDF'],['url','🔗','Article URL']].map(([m,icon,label]) => (
                  <button key={m} onClick={() => setInputMode(m)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${inputMode===m?'text-white':'text-text-2 hover:text-white'}`}
                    style={{ background:inputMode===m?'rgba(124,58,237,.2)':'rgba(255,255,255,.04)', border:`1px solid ${inputMode===m?'rgba(124,58,237,.4)':'rgba(255,255,255,.08)'}` }}>
                    {icon} {label}{(m==='pdf'||m==='url')&&!isPremium&&' 🔒'}
                  </button>
                ))}
              </div>

              {/* Input area */}
              {inputMode === 'paste' && (
                <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={8}
                  placeholder="Paste your textbook chapter, lecture notes, article, or any study material here…"
                  className="input-field resize-none text-sm leading-relaxed mb-4"/>
              )}
              {inputMode === 'pdf' && (
                <div>
                  <div onClick={() => isPremium ? fileRef.current?.click() : toast.error('PDF upload requires Premium!')}
                    className="rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all hover:border-violet/50"
                    style={{ borderColor:'rgba(255,255,255,.12)', background:'rgba(255,255,255,.02)' }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handlePDF(e.dataTransfer.files[0]) }}>
                    <div className="text-4xl mb-3">{uploading ? '⏳' : '📄'}</div>
                    <p className="text-sm font-semibold text-white mb-1">{uploading ? 'Reading PDF…' : 'Drop PDF here or click to upload'}</p>
                    <p className="text-xs text-text-3">PDF files only · max 20MB · Premium feature</p>
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handlePDF(e.target.files[0])}/>
                  </div>
                  {pasteText && <p className="text-xs text-emerald-400 mt-2 text-center">✅ PDF text extracted — ready to load</p>}
                </div>
              )}
              {inputMode === 'url' && (
                <div className="mb-4">
                  <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://en.wikipedia.org/wiki/Photosynthesis"
                    className="input-field mb-2"/>
                  <p className="text-xs text-text-3">Premium feature · Some sites may block access — paste text directly if URL doesn't work</p>
                </div>
              )}

              <button onClick={loadContent} disabled={uploading} className="btn-primary text-sm py-3 px-6">
                {uploading ? <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Loading…</span> : '⚡ Load & Analyse Content'}
              </button>
            </div>
          ) : (
            /* Content loaded — show tools */
            <div>
              {/* Content chip */}
              <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl" style={{ background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)' }}>
                <span className="text-emerald-400 text-sm">✅</span>
                <span className="text-sm text-emerald-400 font-medium flex-1 truncate">Content loaded — {content.length.toLocaleString()} characters</span>
                <button onClick={reset} className="text-xs text-text-3 hover:text-white transition-colors flex items-center gap-1">
                  <X size={12}/> Change content
                </button>
              </div>

              {/* Tool tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {tools.map(t => (
                  <button key={t.id} onClick={() => setActiveTool(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeTool===t.id?'text-white':'text-text-3 hover:text-text-2'}`}
                    style={{ background:activeTool===t.id?'linear-gradient(135deg,#7C3AED,#EC4899)':'rgba(255,255,255,.04)', border:`1px solid ${activeTool===t.id?'transparent':'rgba(255,255,255,.08)'}` }}>
                    {t.icon} {t.label}
                    {t.premium && !isPremium && <Lock size={11} className="opacity-60"/>}
                  </button>
                ))}
              </div>

              {/* Active tool */}
              <div>
                {activeTool === 'explain'    && <ExplainTool    content={content} sessionId={sessionId} isPremium={isPremium}/>}
                {activeTool === 'quiz'       && <QuizTool       content={content} sessionId={sessionId} isPremium={isPremium}/>}
                {activeTool === 'flashcards' && <FlashcardsTool content={content} sessionId={sessionId} isPremium={isPremium}/>}
                {activeTool === 'summary'    && <SummaryTool    content={content} sessionId={sessionId} isPremium={isPremium}/>}
                {activeTool === 'mindmap'    && <MindmapTool    content={content} sessionId={sessionId} isPremium={isPremium}/>}
                {activeTool === 'chat'       && <ChatTool       content={content} sessionId={sessionId} isPremium={isPremium}/>}
                {activeTool === 'practice'   && <PracticeTool   content={content} sessionId={sessionId} isPremium={isPremium}/>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
