import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import AppShell from '../components/layout/AppShell.jsx'
import api from '../api/axios.js'
import UpgradeButton from '../components/ui/UpgradeButton.jsx'
import toast from 'react-hot-toast'
import { RotateCcw, Send, Timer, X, Check, ChevronLeft, ChevronRight, Lock, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

/* ─── LOCKED OVERLAY ────────────────────────────────── */
function LockedOverlay({ feature }) {
  return (
    <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm" style={{background:'rgba(7,7,15,.87)'}}>
      <div className="text-center px-6">
        <div className="text-4xl mb-3">🔒</div>
        <div className="font-display font-bold text-white text-base mb-2">{feature} is Premium</div>
        <p className="text-sm text-text-2 mb-4">Upgrade for ₦700/month</p>
        <UpgradeButton />
      </div>
    </div>
  )
}

/* ─── POMODORO ──────────────────────────────────────── */
function PomodoroTimer({ onClose }) {
  const [mins, setMins]     = useState(25)
  const [secs, setSecs]     = useState(0)
  const [running, setRunning] = useState(false)
  const [mode, setMode]     = useState('focus')
  const timerRef            = useRef(null)
  const MODES               = { focus:25, break:5 }

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSecs(s => {
          if (s === 0) {
            setMins(m => {
              if (m === 0) {
                setRunning(false)
                toast.success(mode==='focus'?'✅ Focus done! Take a break.':'🔥 Break over!')
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

  function switchMode(m) { clearInterval(timerRef.current); setRunning(false); setMode(m); setMins(MODES[m]); setSecs(0) }

  const total = MODES[mode]*60
  const elapsed = total - (mins*60+secs)
  const pct = (elapsed/total)*100
  const r = 52, circ = 2*Math.PI*r

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{background:'rgba(0,0,0,.85)',backdropFilter:'blur(8px)'}}>
      <div className="glass-strong rounded-3xl p-7 w-full max-w-sm text-center">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-white">⏱️ Pomodoro</h3>
          <button onClick={onClose} className="text-text-3 hover:text-white"><X size={18}/></button>
        </div>
        <div className="flex gap-2 justify-center mb-6">
          {['focus','break'].map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${mode===m?'text-white':'text-text-3'}`}
              style={mode===m?{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}:{background:'rgba(255,255,255,.06)'}}>
              {m==='focus'?'🎯 Focus':'☕ Break'}
            </button>
          ))}
        </div>
        <div className="flex justify-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8"/>
              <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
                stroke="url(#pg)" strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ}
                style={{transition:'stroke-dashoffset .5s ease'}}/>
              <defs>
                <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#EC4899"/>
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
          <button onClick={() => { clearInterval(timerRef.current); setRunning(false); setMins(MODES[mode]); setSecs(0) }}
            className="btn-ghost text-sm py-2.5 px-4"><RotateCcw size={14}/></button>
          <button onClick={() => setRunning(r => !r)} className="btn-primary text-sm py-2.5 px-8">
            {running?'⏸ Pause':'▶ Start'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── EXPLAIN ───────────────────────────────────────── */
function ExplainTool({ content, sessionId, isPremium }) {
  const [level, setLevel]   = useState('simple')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!isPremium && level !== 'simple') { toast.error('Medium & Advanced require Premium'); return }
    setLoading(true); setResult('')
    try {
      const res = await api.post('/study/explain', { session_id:sessionId, content, level })
      setResult(res.data.explanation)
    } catch (e) { toast.error(e.response?.data?.message||'AI error. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-xl overflow-hidden border border-white/8 flex-1 min-w-0">
          {[['simple','🟢'],['medium','🟡'],['advanced','🔴']].map(([v,e]) => (
            <button key={v} onClick={() => setLevel(v)}
              className={`flex-1 py-2 text-xs font-bold transition-all capitalize ${level===v?'text-white':'text-text-3'}`}
              style={level===v?{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}:{background:'rgba(255,255,255,.03)'}}>
              {e} {v}{!isPremium&&v!=='simple'&&'🔒'}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-4 flex-shrink-0">
          {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/> : '💡 Go'}
        </button>
      </div>
      {result && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span>💡</span>
            <h3 className="font-display font-bold text-white text-sm">Explanation</h3>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${level==='simple'?'bg-emerald-500/20 text-emerald-400':level==='medium'?'bg-amber-500/20 text-amber-400':'bg-rose-500/20 text-rose-400'}`}>{level}</span>
          </div>
          <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  )
}

/* ─── QUIZ ──────────────────────────────────────────── */
function QuizTool({ content, sessionId, isPremium }) {
  const [count, setCount]     = useState(isPremium?10:3)
  const [questions, setQs]    = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore]     = useState(null)

  async function generate() {
    setLoading(true); setQs([]); setAnswers({}); setSubmitted(false); setScore(null)
    try {
      const res = await api.post('/study/quiz', { session_id:sessionId, content, count })
      setQs(res.data.questions)
    } catch { toast.error('AI error. Try again.') }
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
    setScore(correct); setSubmitted(true)
    try { await api.post('/study/quiz-result', { session_id:sessionId, score:correct, total:questions.length }) } catch {}
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {isPremium ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-2 font-medium">Questions:</span>
            <div className="flex rounded-xl overflow-hidden border border-white/8">
              {[10,20,30,40,50,60].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className={`px-3 py-2 text-xs font-bold transition-all ${count===n?'text-white':'text-text-3'}`}
                  style={count===n?{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}:{background:'rgba(255,255,255,.03)'}}>
                  {n}
                </button>
              ))}
            </div>
            <span className="text-xs text-text-3">or</span>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={e => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="input-field text-sm py-2 text-center"
              style={{ width: '70px' }}
              placeholder="Custom"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-2">3 questions max</span>
            <span className="text-[0.65rem] text-text-3">🔒 More with Premium</span>
          </div>
        )}
        <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-4 ml-auto">
          {loading?<span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>:'✅ Generate'}
        </button>
      </div>

      {submitted && score !== null && (
        <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-4" style={{border:'1px solid rgba(124,58,237,.3)'}}>
          <div className="text-center">
            <div className="font-display font-extrabold text-3xl grad-text">{score}/{questions.length}</div>
            <div className="text-[0.62rem] text-text-3">correct</div>
          </div>
          <div className="flex-1">
            <div className="h-2 rounded-full overflow-hidden mb-1" style={{background:'rgba(255,255,255,.08)'}}>
              <div className="h-full rounded-full" style={{width:`${(score/questions.length)*100}%`,background:'linear-gradient(90deg,#7C3AED,#EC4899)'}}/>
            </div>
            <div className="text-xs text-text-2">{Math.round((score/questions.length)*100)}% accuracy</div>
          </div>
          <button onClick={generate} className="btn-ghost text-xs py-2 px-3"><RotateCcw size={12}/></button>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="glass rounded-2xl p-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-wider text-text-3 mb-1.5">Q{i+1}</div>
            <p className="text-sm font-semibold text-white mb-3 leading-relaxed">{q.q}</p>
            <div className="space-y-2">
              {q.options.map(opt => {
                const letter    = opt.charAt(0)
                const isSelected = answers[i]===letter
                const isCorrect  = submitted && letter===q.answer
                const isWrong    = submitted && isSelected && letter!==q.answer
                return (
                  <button key={letter} onClick={() => pick(i,letter)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all active:scale-[.98] ${
                      isCorrect?'text-emerald-400':isWrong?'text-rose-400':isSelected?'text-white':'text-text-2'}`}
                    style={{
                      background:isCorrect?'rgba(16,185,129,.1)':isWrong?'rgba(239,68,68,.1)':isSelected?'rgba(124,58,237,.15)':'rgba(255,255,255,.03)',
                      border:`1px solid ${isCorrect?'rgba(16,185,129,.5)':isWrong?'rgba(239,68,68,.5)':isSelected?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'}`
                    }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCorrect?'bg-emerald-500 text-white':isWrong?'bg-rose-500 text-white':''}`}
                      style={isSelected&&!isCorrect&&!isWrong?{background:'linear-gradient(135deg,#7C3AED,#EC4899)',color:'#fff'}:{background:isCorrect||isWrong?'':isSelected?'':'rgba(255,255,255,.08)',color:isCorrect||isWrong||isSelected?'':'#A0A0C0'}}>
                      {isCorrect?'✓':isWrong?'✗':letter}
                    </div>
                    <span className="text-xs md:text-sm">{opt.slice(3)}</span>
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <div className="mt-3 px-3 py-2.5 rounded-xl text-xs text-text-2 leading-relaxed" style={{background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)'}}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      {questions.length>0 && !submitted && (
        <button onClick={submit} className="btn-primary mt-4 w-full justify-center">Submit Answers</button>
      )}
    </div>
  )
}

/* ─── FLASHCARDS ────────────────────────────────────── */
function FlashcardsTool({ content, sessionId, isPremium }) {
  const [cards, setCards]         = useState([])
  const [flipped, setFlipped]     = useState({})
  const [studyMode, setStudyMode] = useState(false)
  const [studyIdx, setStudyIdx]   = useState(0)
  const [studyFlipped, setStudyFlipped] = useState(false)
  const [known, setKnown]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [fcCount, setFcCount] = useState(isPremium ? 12 : 3)

  async function generate() {
    setLoading(true); setCards([]); setFlipped({}); setKnown([]); setStudyMode(false)
    try {
      const res = await api.post('/study/flashcards', { session_id:sessionId, content, count:fcCount })
      setCards(res.data.cards)
    } catch { toast.error('AI error. Try again.') }
    finally { setLoading(false) }
  }

  if (studyMode && cards.length > 0) {
    const card = cards[studyIdx]
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStudyMode(false)} className="btn-ghost text-sm py-2 px-3"><ChevronLeft size={14}/> Grid</button>
          <span className="text-sm text-text-2">{studyIdx+1}/{cards.length} · {known.length} known</span>
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-md h-48 cursor-pointer" style={{perspective:'1000px'}} onClick={() => setStudyFlipped(f=>!f)}>
            <div className="relative w-full h-full transition-all duration-500" style={{transformStyle:'preserve-3d',transform:studyFlipped?'rotateY(180deg)':'rotateY(0)'}}>
              <div className="absolute inset-0 rounded-2xl flex flex-col justify-between p-6" style={{backfaceVisibility:'hidden',background:'#0E0E1A',border:'1px solid rgba(255,255,255,.1)'}}>
                <span className="text-[0.6rem] font-bold uppercase tracking-wider" style={{color:'#9D5FF5'}}>TERM</span>
                <p className="font-display font-semibold text-lg text-white text-center">{card.front}</p>
                <span className="text-xs text-text-3 text-right">Tap to reveal →</span>
              </div>
              <div className="absolute inset-0 rounded-2xl flex flex-col justify-between p-6" style={{backfaceVisibility:'hidden',transform:'rotateY(180deg)',background:'linear-gradient(135deg,#1a0533,#2d0a1e)',border:'1px solid rgba(124,58,237,.3)'}}>
                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-violet-l">ANSWER</span>
                <p className="text-sm text-white leading-relaxed text-center">{card.back}</p>
                <span className="text-xs text-text-3 text-right">← Tap to flip</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-center mb-4">
          <button onClick={() => { setKnown(k=>[...k,studyIdx]); setStudyIdx(i=>Math.min(i+1,cards.length-1)); setStudyFlipped(false) }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-emerald-400"
            style={{background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.3)'}}>
            <Check size={16}/> Got it!
          </button>
          <button onClick={() => { setStudyIdx(i=>Math.min(i+1,cards.length-1)); setStudyFlipped(false) }}
            className="flex-1 btn-ghost text-sm py-3">
            Still learning <ChevronRight size={14}/>
          </button>
        </div>
        {studyIdx===cards.length-1 && (
          <div className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-display font-bold text-white mb-1">Done!</div>
            <div className="text-sm text-text-2">{known.length} known · {cards.length-known.length} still learning</div>
            <button onClick={() => { setStudyIdx(0); setStudyFlipped(false); setKnown([]) }} className="btn-primary mt-3 text-sm">Restart</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {isPremium ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-text-2 font-medium">Cards:</span>
            <div className="flex rounded-xl overflow-hidden border border-white/8">
              {[8,12,20,30,50,70].map(n => (
                <button key={n} onClick={() => setFcCount(n)}
                  className={`px-3 py-2 text-xs font-bold transition-all ${fcCount===n?'text-white':'text-text-3'}`}
                  style={fcCount===n?{background:'linear-gradient(135deg,#7C3AED,#EC4899)'}:{background:'rgba(255,255,255,.03)'}}>
                  {n}
                </button>
              ))}
            </div>
            <span className="text-xs text-text-3">or</span>
            <input
              type="number"
              min="1"
              max="50"
              value={fcCount}
              onChange={e => setFcCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="input-field text-sm py-2 text-center"
              style={{ width: '70px' }}
              placeholder="Custom"
            />
          </div>
        ) : (
          <span className="text-sm text-text-2">3 cards max · 🔒 More with Premium</span>
        )}
        <div className="flex gap-2 ml-auto">
          <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-4">
            {loading?<span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>:'🃏 Generate'}
          </button>
          {cards.length>0 && <button onClick={() => { setStudyMode(true); setStudyIdx(0); setStudyFlipped(false) }} className="btn-ghost text-sm py-2 px-3">▶ Study</button>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c, i) => (
          <div key={i} onClick={() => setFlipped(f=>({...f,[i]:!f[i]}))}
            className="cursor-pointer rounded-2xl min-h-[120px] flex flex-col justify-between p-4 transition-all active:scale-[.98]"
            style={{background:flipped[i]?'linear-gradient(135deg,#1a0533,#2d0a1e)':'#0E0E1A',border:`1px solid ${flipped[i]?'rgba(124,58,237,.4)':'rgba(255,255,255,.08)'}`}}>
            <span className="text-[0.58rem] font-bold uppercase tracking-widest" style={{color:flipped[i]?'#9D5FF5':'#606080'}}>{flipped[i]?'ANSWER':'TERM'}</span>
            <p className="text-sm font-medium text-white leading-relaxed my-2">{flipped[i]?c.back:c.front}</p>
            <span className="text-[0.6rem] text-text-3 text-right">{flipped[i]?'← tap to flip':'tap to reveal →'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SUMMARY ───────────────────────────────────────── */
function SummaryTool({ content, sessionId, isPremium }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true); setData(null)
    try {
      const res = await api.post('/study/summary', { session_id:sessionId, content })
      setData(res.data.summary)
    } catch (e) { toast.error(e.response?.data?.message||'AI error. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative">
      {!isPremium && <LockedOverlay feature="Summary"/>}
      <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5 mb-4">
        {loading?<span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Summarising…</span>:'📋 Generate Summary'}
      </button>
      {data && (
        <div className="space-y-3">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold text-white text-base mb-1">{data.topic}</h3>
            <p className="text-sm text-text-2 leading-relaxed">{data.overview}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <h4 className="font-display font-bold text-white text-sm mb-3">⚡ Key Points</h4>
            <ul className="space-y-2">
              {data.key_points?.map((p,i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{background:'#F59E0B'}}/>{p}
                </li>
              ))}
            </ul>
          </div>
          {data.sections?.length>0 && (
            <div className="glass rounded-2xl p-5">
              <h4 className="font-display font-bold text-white text-sm mb-3">📌 Sections</h4>
              <div className="space-y-3">
                {data.sections.map((s,i) => (
                  <div key={i} className="border-l-2 pl-3" style={{borderColor:'#F59E0B'}}>
                    <h5 className="text-sm font-bold text-white mb-1">{s.title}</h5>
                    <p className="text-sm text-text-2 leading-relaxed">{s.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.key_terms?.length>0 && (
            <div className="glass rounded-2xl p-5">
              <h4 className="font-display font-bold text-white text-sm mb-3">🔑 Key Terms</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.key_terms.map((t,i) => (
                  <div key={i} className="px-3 py-2.5 rounded-xl" style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)'}}>
                    <div className="text-xs font-bold mb-0.5" style={{color:'#9D5FF5'}}>{t.term}</div>
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

/* ─── MIND MAP ──────────────────────────────────────── */
function MindmapTool({ content, sessionId, isPremium }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const canvasRef             = useRef(null)

  async function generate() {
    setLoading(true); setData(null)
    try {
      const res = await api.post('/study/mindmap', { session_id:sessionId, content })
      setData(res.data.mindmap)
    } catch (e) { toast.error(e.response?.data?.message||'AI error. Try again.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!data || !canvasRef.current) return
    const canvas = canvasRef.current
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    const cx = W/2, cy = H/2
    const svg = canvas.querySelector('svg')
    svg.innerHTML = ''
    canvas.querySelectorAll('.mm-node').forEach(n => n.remove())

    function makeNode(text, x, y, type) {
      const el = document.createElement('div')
      el.className = 'mm-node'
      el.style.cssText = `position:absolute;transform:translate(-50%,-50%);left:${x}px;top:${y}px;padding:${type==='root'?'8px 14px':'5px 10px'};border-radius:20px;font-family:Inter,sans-serif;font-size:${type==='root'?'0.78rem':'0.68rem'};font-weight:${type==='root'?'700':'500'};text-align:center;max-width:${type==='leaf'?'100px':'130px'};white-space:normal;line-height:1.3;z-index:5;`
      el.style.background = type==='root'?'linear-gradient(135deg,#7C3AED,#EC4899)':type==='branch'?'rgba(245,158,11,.15)':'rgba(255,255,255,.05)'
      el.style.border      = type==='root'?'none':type==='branch'?'1px solid rgba(245,158,11,.4)':'1px solid rgba(255,255,255,.1)'
      el.style.color       = type==='root'?'#fff':type==='branch'?'#FCD34D':'#A0A0C0'
      el.textContent       = text
      canvas.appendChild(el)
    }

    function makeLine(x1,y1,x2,y2,color,w) {
      const line = document.createElementNS('http://www.w3.org/2000/svg','line')
      line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x2);line.setAttribute('y2',y2)
      line.setAttribute('stroke',color);line.setAttribute('stroke-width',w);line.setAttribute('stroke-opacity','0.5');line.setAttribute('stroke-linecap','round')
      svg.appendChild(line)
    }

    const branches = data.branches||[]
    makeNode(data.center,cx,cy,'root')
    const aStep = (2*Math.PI)/Math.max(branches.length,1)
    const bR = Math.min(W,H)*0.27, cR = Math.min(W,H)*0.14

    branches.forEach((b,bi) => {
      const angle = bi*aStep - Math.PI/2
      const bx = cx + bR*Math.cos(angle), by = cy + bR*Math.sin(angle)
      makeLine(cx,cy,bx,by,'#7C3AED',2); makeNode(b.label,bx,by,'branch')
      ;(b.children||[]).forEach((child,ci) => {
        const total = b.children.length, spread = total>1?Math.PI/4:0
        const ca = angle+(ci-(total-1)/2)*(spread/Math.max(total-1,1))
        const chx = bx+cR*Math.cos(ca), chy = by+cR*Math.sin(ca)
        makeLine(bx,by,chx,chy,'rgba(255,255,255,.2)',1.5); makeNode(child,chx,chy,'leaf')
      })
    })
  }, [data])

  return (
    <div className="relative">
      {!isPremium && <LockedOverlay feature="Mind Map"/>}
      <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5 mb-4">
        {loading?<span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Mapping…</span>:'🕸️ Generate Mind Map'}
      </button>
      <div ref={canvasRef} className="relative rounded-2xl overflow-hidden" style={{height:'360px',background:'#0A0A14',border:'1px solid rgba(255,255,255,.08)'}}>
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>
        {!data&&!loading&&<div className="absolute inset-0 flex items-center justify-center text-text-3 text-xs text-center px-6">Click "Generate Mind Map" to visualise your content</div>}
      </div>
    </div>
  )
}

/* ─── AI CHAT ───────────────────────────────────────── */
function ChatTool({ content, sessionId, isPremium }) {
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking]   = useState(false)
  const [showText, setShowText]   = useState(true)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const bottomRef    = useRef(null)
  const recognRef    = useRef(null)
  const synthRef     = useRef(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoiceSupported(false); return }
    const r = new SR()
    r.continuous = false; r.interimResults = false; r.lang = 'en-US'
    r.onresult = (e) => {
      const t = e.results[0][0].transcript
      setInput(t)
    }
    r.onerror = () => setListening(false)
    r.onend   = () => setListening(false)
    recognRef.current = r
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  function toggleMic() {
    if (!voiceSupported) { toast.error('Voice not supported. Try Chrome.'); return }
    if (listening) {
      recognRef.current?.stop()
      setListening(false)
    } else {
      setInput('')
      setListening(true)
      try { recognRef.current?.start() } catch { setListening(false) }
    }
  }

  function speakText(text) {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95; u.pitch = 1; u.volume = 1
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v => v.name.includes('Google') || v.lang === 'en-US')
    if (preferred) u.voice = preferred
    u.onstart = () => setSpeaking(true)
    u.onend   = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    synthRef.current.speak(u)
  }

  function stopSpeaking() { synthRef.current?.cancel(); setSpeaking(false) }

  async function send() {
    if (!input.trim()) return
    const userMsg = { role:'user', content:input }
    setMessages(m => [...m,userMsg]); setInput(''); setLoading(true)
    try {
      const res = await api.post('/study/chat', { session_id:sessionId, content, history:messages, message:userMsg.content })
      const reply = res.data.reply
      setMessages(m => [...m,{ role:'assistant', content:reply }])
      speakText(reply)
    } catch (e) { toast.error(e.response?.data?.message||'AI error. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative">
      {!isPremium && <LockedOverlay feature="AI Tutor Chat"/>}
      <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{height:'480px'}}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"/>
          <span className="text-sm font-semibold text-white">AI Tutor</span>
          <span className="text-xs text-text-3 ml-1 hidden sm:inline">— Ask anything about your content</span>
          <div className="ml-auto flex items-center gap-2">
            {/* Text toggle */}
            <button onClick={() => setShowText(s => !s)}
              className="text-[0.65rem] font-semibold px-2.5 py-1 rounded-full transition-all"
              style={{ background:showText?'rgba(124,58,237,0.25)':'rgba(255,255,255,0.06)', color:showText?'#9D5FF5':'#A0A0C0' }}>
              {showText ? 'Text ON' : 'Text OFF'}
            </button>
            {/* Stop speaking */}
            {speaking && (
              <button onClick={stopSpeaking}
                className="text-[0.65rem] font-semibold px-2.5 py-1 rounded-full text-amber-400"
                style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)' }}>
                <VolumeX size={11} className="inline mr-1"/>Stop
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length===0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-sm text-text-2 mb-1">Ask me anything about your content!</p>
              <p className="text-xs text-text-3 mb-4">Type or tap the mic 🎙️ to speak</p>
              <div className="flex flex-col gap-2">
                {['Summarise the main idea','What are the key concepts?','Explain in simple terms'].map(s => (
                  <button key={s} onClick={() => setInput(s)} className="text-xs px-3 py-2 rounded-xl text-text-2 hover:text-white transition-colors"
                    style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)'}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m,i) => (
            <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role==='user'?'text-white':'text-text-2'}`}
                style={m.role==='user'
                  ? {background:'linear-gradient(135deg,#7C3AED,#EC4899)'}
                  : {background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)'}}>
                {showText || m.role === 'user' ? m.content : <span className="italic text-text-3">Voice response playing…</span>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex">
              <div className="px-3.5 py-2.5 rounded-2xl" style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)'}}>
                <div className="flex gap-1 items-center">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:'#9D5FF5',animationDelay:`${i*0.15}s`}}/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input row */}
        <div className="px-3 py-3 border-t border-white/8 flex gap-2">
          {/* Mic button */}
          <button onClick={toggleMic} disabled={loading}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${listening?'animate-pulse':''}`}
            style={{
              background: listening ? 'linear-gradient(135deg,#EF4444,#F59E0B)' : 'rgba(124,58,237,0.2)',
              border: `1px solid ${listening ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.4)'}`,
            }}
            title={listening ? 'Stop listening' : 'Tap to speak'}>
            {listening ? <MicOff size={16} color="#fff"/> : <Mic size={16} color="#9D5FF5"/>}
          </button>

          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter'&&!e.shiftKey&&send()}
            placeholder={listening ? 'Listening… speak now' : 'Ask a question or tap mic…'}
            className="input-field text-sm py-2.5 flex-1"
            style={listening ? {borderColor:'rgba(239,68,68,0.5)',boxShadow:'0 0 0 2px rgba(239,68,68,0.15)'} : {}}/>

          <button onClick={send} disabled={loading||!input.trim()} className="btn-primary text-sm py-2.5 px-4 flex-shrink-0">
            <Send size={14}/>
          </button>
        </div>

        {/* Listening indicator */}
        {listening && (
          <div className="px-4 py-2 flex items-center gap-2 border-t border-white/8"
               style={{background:'rgba(239,68,68,0.08)'}}>
            <div className="flex gap-1">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-1 rounded-full animate-bounce"
                     style={{height:`${8+i*4}px`,background:'#EF4444',animationDelay:`${i*0.1}s`}}/>
              ))}
            </div>
            <span className="text-xs text-rose-400 font-medium">Listening… speak your question</span>
            <button onClick={toggleMic} className="ml-auto text-xs text-rose-400 hover:text-rose-300">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── PRACTICE ──────────────────────────────────────── */
function PracticeTool({ content, sessionId, isPremium }) {
  const [problems, setProblems] = useState([])
  const [shown, setShown]       = useState({})
  const [loading, setLoading]   = useState(false)

  async function generate() {
    setLoading(true); setProblems([]); setShown({})
    try {
      const res = await api.post('/study/practice', { session_id:sessionId, content })
      setProblems(res.data.problems)
    } catch (e) { toast.error(e.response?.data?.message||'AI error. Try again.') }
    finally { setLoading(false) }
  }

  const diffColor = {easy:'text-emerald-400',medium:'text-amber-400',hard:'text-rose-400'}

  return (
    <div className="relative">
      {!isPremium && <LockedOverlay feature="Practice Problems"/>}
      <button onClick={generate} disabled={loading} className="btn-primary text-sm py-2 px-5 mb-4">
        {loading?<span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Generating…</span>:'🧩 Generate Problems'}
      </button>
      <div className="space-y-3">
        {problems.map((p,i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-3">Problem {i+1}</span>
              <span className={`text-[0.65rem] font-bold uppercase ml-auto ${diffColor[p.difficulty]||'text-text-3'}`}>{p.difficulty}</span>
            </div>
            <p className="text-sm font-semibold text-white mb-3 leading-relaxed">{p.question}</p>
            {!shown[i] ? (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setShown(s=>({...s,[i]:'hint'}))} className="btn-ghost text-xs py-2 px-3">💡 Hint</button>
                <button onClick={() => setShown(s=>({...s,[i]:'solution'}))} className="btn-primary text-xs py-2 px-3">✅ Solution</button>
              </div>
            ) : (
              <div className="space-y-2">
                {shown[i]==='hint' && (
                  <div className="px-3 py-2.5 rounded-xl text-sm text-text-2 leading-relaxed" style={{background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)'}}>
                    💡 <strong className="text-amber-400">Hint:</strong> {p.hint}
                  </div>
                )}
                <div className="px-3 py-2.5 rounded-xl text-sm text-text-2 leading-relaxed" style={{background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)'}}>
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

async function goToPayment() {
  try {
    const res = await api.post('/payment/initialize')
    window.location.href = res.data.authorization_url
  } catch {
    window.location.href = '/profile'
  }
}

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
    { id:'flashcards', icon:'🃏', label:'Cards' },
    { id:'summary',    icon:'📋', label:'Summary',  premium:true },
    { id:'mindmap',    icon:'🕸️', label:'Map',       premium:true },
    { id:'chat',       icon:'🤖', label:'Chat',      premium:true },
    { id:'practice',   icon:'🧩', label:'Practice',  premium:true },
  ]

  const ALLOWED_EXTS = ['.pdf','.docx','.pptx','.txt']
  const FILE_ICONS   = { '.pdf':'📄', '.docx':'📝', '.pptx':'📊', '.txt':'📃' }

  function getExt(name) { return name.slice(name.lastIndexOf('.')).toLowerCase() }

  async function handleFileUpload(file) {
    if (!file) return
    const ext = getExt(file.name)
    if (!ALLOWED_EXTS.includes(ext)) {
      toast.error('Please upload a PDF, Word (.docx), PowerPoint (.pptx), or text (.txt) file')
      return
    }
    if (!isPremium) { goToPayment(); return }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/study/upload-file', form, { headers:{'Content-Type':'multipart/form-data'} })
      setPasteText(res.data.text)
      setInputMode('paste')
      toast.success(`${FILE_ICONS[ext]||'📄'} ${res.data.filename} extracted! (${res.data.chars?.toLocaleString()} characters)`)
    } catch (e) { toast.error(e.response?.data?.error||'Failed to read file. Try pasting the text instead.') }
    finally { setUploading(false) }
  }

  async function loadContent() {
    let text = ''
    if (inputMode==='paste') {
      text = pasteText.trim()
      if (!text) { toast.error('Paste some text first'); return }
    } else {
      if (!urlInput.trim()) { toast.error('Enter a URL'); return }
      if (!isPremium) { goToPayment(); return }
      text = `[Study this article: ${urlInput}]`
    }
    setUploading(true)
    try {
      const title = text.slice(0,60).replace(/\n/g,' ')+'…'
      const sourceType = inputMode === 'file' ? 'pdf' : inputMode
      const res = await api.post('/study/session', { title, source_type:sourceType, content_text:text })
      setContent(text); setSessionId(res.data.session.id); setSessionTitle(title)
      setContentLoaded(true); setActiveTool('explain')
      toast.success('Content loaded! Choose a tool.')
    } catch (e) { toast.error(e.response?.data?.message||'Failed to save session') }
    finally { setUploading(false) }
  }

  function reset() { setContent(''); setSessionId(null); setContentLoaded(false); setPasteText(''); setUrlInput(''); setInputMode('paste') }

  return (
    <AppShell>
      {showPomodoro && <PomodoroTimer onClose={() => setShowPomodoro(false)}/>}

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-0.5">Study Room</h1>
            <p className="text-text-2 text-xs md:text-sm truncate max-w-[200px] md:max-w-none">
              {contentLoaded ? sessionTitle : 'Upload material to get started'}
            </p>
          </div>
          <button onClick={() => setShowPomodoro(true)} className="btn-ghost text-xs md:text-sm py-2 px-3 md:px-4 gap-1.5 flex-shrink-0">
            <Timer size={14}/> <span className="hidden sm:inline">Pomodoro</span>
          </button>
        </div>

        {/* Input */}
        {!contentLoaded ? (
          <div className="glass rounded-2xl p-5 mb-5">
            <h2 className="font-display font-bold text-white text-base mb-4">Add your study material</h2>

            {/* Mode switcher */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[['paste','✏️','Paste Text'],['file','📁','Upload File'],['url','🔗','URL']].map(([m,icon,label]) => (
                <button key={m} onClick={() => setInputMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${inputMode===m?'text-white':'text-text-2'}`}
                  style={{background:inputMode===m?'rgba(124,58,237,.2)':'rgba(255,255,255,.04)',border:`1px solid ${inputMode===m?'rgba(124,58,237,.4)':'rgba(255,255,255,.08)'}`}}>
                  {icon} {label}{(m==='file'||m==='url')&&!isPremium&&' 🔒'}
                </button>
              ))}
            </div>

            {inputMode==='paste' && (
              <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={7}
                placeholder="Paste your textbook, lecture notes, or article here…"
                className="input-field resize-none text-sm leading-relaxed mb-4"/>
            )}
            {inputMode==='file' && (
              <div>
                <div onClick={() => isPremium?fileRef.current?.click():goToPayment()}
                  className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
                  style={{borderColor:'rgba(255,255,255,.12)',background:'rgba(255,255,255,.02)'}}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]) }}>
                  <div className="text-3xl mb-2">{uploading?'⏳':'📁'}</div>
                  <p className="text-sm font-semibold text-white mb-1">{uploading?'Reading file…':'Drop your file here or tap to upload'}</p>
                  <p className="text-xs text-text-3 mb-3">PDF · Word (.docx) · PowerPoint (.pptx) · Text (.txt) · max 20MB · Premium</p>
                  <div className="flex justify-center gap-3 text-2xl">
                    <span title="PDF">📄</span>
                    <span title="Word">📝</span>
                    <span title="PowerPoint">📊</span>
                    <span title="Text">📃</span>
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.pptx,.txt" className="hidden" onChange={e => handleFileUpload(e.target.files[0])}/>
                </div>
                {pasteText && <p className="text-xs text-emerald-400 mt-2 text-center">✅ File text extracted — ready to load</p>}
              </div>
            )}
            {inputMode==='url' && (
              <div className="mb-4">
                <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://en.wikipedia.org/wiki/Photosynthesis" className="input-field mb-2"/>
                <p className="text-xs text-text-3">Premium · Some sites block access — paste text instead if this fails</p>
              </div>
            )}

            <button onClick={loadContent} disabled={uploading} className="btn-primary text-sm py-3 px-5 w-full justify-center md:w-auto">
              {uploading?<span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Loading…</span>:'⚡ Load & Analyse'}
            </button>
          </div>
        ) : (
          <div>
            {/* Content chip */}
            <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-xl" style={{background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)'}}>
              <span className="text-emerald-400 text-sm">✅</span>
              <span className="text-sm text-emerald-400 font-medium flex-1 truncate">{content.length.toLocaleString()} characters loaded</span>
              <button onClick={reset} className="text-xs text-text-3 hover:text-white transition-colors flex items-center gap-1 flex-shrink-0">
                <X size={12}/> Change
              </button>
            </div>

            {/* Tool tabs — scrollable on mobile */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
              {tools.map(t => (
                <button key={t.id} onClick={() => setActiveTool(t.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeTool===t.id?'text-white':'text-text-3 hover:text-text-2'}`}
                  style={{background:activeTool===t.id?'linear-gradient(135deg,#7C3AED,#EC4899)':'rgba(255,255,255,.04)',border:`1px solid ${activeTool===t.id?'transparent':'rgba(255,255,255,.08)'}`}}>
                  {t.icon} {t.label}
                  {t.premium && !isPremium && <Lock size={10} className="opacity-60"/>}
                </button>
              ))}
            </div>

            {/* Active tool */}
            <div>
              {activeTool==='explain'    && <ExplainTool    content={content} sessionId={sessionId} isPremium={isPremium}/>}
              {activeTool==='quiz'       && <QuizTool       content={content} sessionId={sessionId} isPremium={isPremium}/>}
              {activeTool==='flashcards' && <FlashcardsTool content={content} sessionId={sessionId} isPremium={isPremium}/>}
              {activeTool==='summary'    && <SummaryTool    content={content} sessionId={sessionId} isPremium={isPremium}/>}
              {activeTool==='mindmap'    && <MindmapTool    content={content} sessionId={sessionId} isPremium={isPremium}/>}
              {activeTool==='chat'       && <ChatTool       content={content} sessionId={sessionId} isPremium={isPremium}/>}
              {activeTool==='practice'   && <PracticeTool   content={content} sessionId={sessionId} isPremium={isPremium}/>}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
