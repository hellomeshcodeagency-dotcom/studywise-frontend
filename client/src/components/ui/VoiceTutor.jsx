import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'
import { Mic, MicOff, Volume2, VolumeX, X, Lock } from 'lucide-react'

export default function VoiceTutor() {
  const { hasPremium } = useAuth()
  const isPremium = hasPremium()

  const [open, setOpen]             = useState(false)
  const [listening, setListening]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [speaking, setSpeaking]     = useState(false)
  const [showText, setShowText]     = useState(true)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse]     = useState('')
  const [history, setHistory]       = useState([])
  const [supported, setSupported]   = useState(true)

  const recognitionRef = useRef(null)
  const synthRef       = useRef(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setSupported(false); return }

    const recognition          = new SpeechRecognition()
    recognition.continuous     = false
    recognition.interimResults = true
    recognition.lang           = 'en-US'

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
      if (e.results[e.results.length - 1].isFinal) handleQuestion(t)
    }
    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') toast.error('Mic error: ' + e.error)
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
  }, [])

  useEffect(() => {
    if (!open) { synthRef.current?.cancel(); setSpeaking(false) }
  }, [open])

  function startListening() {
    if (!supported) { toast.error('Voice not supported. Try Chrome.'); return }
    setTranscript(''); setResponse('')
    synthRef.current?.cancel(); setSpeaking(false)
    setListening(true)
    try { recognitionRef.current?.start() } catch { setListening(false) }
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  async function handleQuestion(question) {
    if (!question.trim()) return
    setLoading(true); setResponse('')
    try {
      const res = await api.post('/study/voice', { question, history: history.slice(-6) })
      const answer = res.data.answer
      setResponse(answer)
      setHistory(h => [...h, { role:'user', content:question }, { role:'assistant', content:answer }])
      speakText(answer)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not get answer. Try again.')
    } finally { setLoading(false) }
  }

  function speakText(text) {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const utterance  = new SpeechSynthesisUtterance(text)
    utterance.rate   = 0.95
    utterance.pitch  = 1
    utterance.volume = 1
    const voices     = synthRef.current.getVoices()
    const preferred  = voices.find(v => v.name.includes('Google') || v.lang === 'en-US')
    if (preferred) utterance.voice = preferred
    utterance.onstart = () => setSpeaking(true)
    utterance.onend   = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synthRef.current.speak(utterance)
  }

  function stopSpeaking() { synthRef.current?.cancel(); setSpeaking(false) }

  function clearAll() {
    setHistory([]); setTranscript(''); setResponse('')
    synthRef.current?.cancel(); setSpeaking(false)
  }

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={() => {
          if (!isPremium) { toast('🔒 Voice Tutor is Premium. Upgrade for ₦700/month!'); return }
          setOpen(o => !o)
        }}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: listening ? 'linear-gradient(135deg,#EF4444,#F59E0B)' : 'linear-gradient(135deg,#7C3AED,#EC4899)',
          boxShadow: listening ? '0 0 0 8px rgba(239,68,68,0.25),0 8px 32px rgba(124,58,237,0.4)' : '0 0 0 4px rgba(124,58,237,0.25),0 8px 32px rgba(124,58,237,0.35)',
        }}>
        {!isPremium ? <Lock size={20} color="#fff"/> : open ? <X size={20} color="#fff"/> : <Mic size={20} color="#fff"/>}
        {listening && <span className="absolute inset-0 rounded-full animate-ping" style={{ background:'rgba(239,68,68,0.3)' }}/>}
      </button>

      {/* Panel */}
      {open && isPremium && (
        <div className="fixed bottom-44 md:bottom-28 right-4 md:right-6 z-50 w-[calc(100vw-32px)] md:w-96 rounded-2xl shadow-2xl overflow-hidden"
             style={{ background:'#0E0E1A', border:'1px solid rgba(124,58,237,0.4)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8"
               style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(236,72,153,0.1))' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                <Mic size={14} color="#fff"/>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Voice Tutor</div>
                <div className="text-[0.62rem] text-text-2">
                  {listening?'🔴 Listening…':speaking?'🔊 Speaking…':loading?'⏳ Thinking…':'🎙️ Tap mic to ask'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowText(s => !s)}
                className="text-[0.65rem] font-semibold px-2.5 py-1 rounded-full transition-all"
                style={{ background:showText?'rgba(124,58,237,0.3)':'rgba(255,255,255,0.06)', color:showText?'#9D5FF5':'#A0A0C0' }}>
                {showText ? 'Text ON' : 'Text OFF'}
              </button>
              {history.length > 0 && (
                <button onClick={clearAll} className="text-[0.65rem] text-text-3 hover:text-white px-2 py-1 rounded-full"
                        style={{ background:'rgba(255,255,255,0.05)' }}>Clear</button>
              )}
              <button onClick={() => setOpen(false)} className="text-text-3 hover:text-white transition-colors"><X size={16}/></button>
            </div>
          </div>

          {/* Chat history */}
          {showText && history.length > 0 && (
            <div className="max-h-48 overflow-y-auto px-4 py-3 space-y-3">
              {history.map((m, i) => (
                <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role==='user'?'text-white':'text-text-2'}`}
                    style={m.role==='user'
                      ? { background:'linear-gradient(135deg,#7C3AED,#EC4899)' }
                      : { background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)' }}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current state */}
          {showText && (transcript || response || loading) && (
            <div className="px-4 py-3 border-t border-white/8">
              {transcript && !response && !loading && (
                <div className="text-xs text-text-2 italic">"{transcript}"</div>
              )}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-text-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background:'#9D5FF5',animationDelay:`${i*0.15}s` }}/>)}
                  </div>
                  Thinking…
                </div>
              )}
              {response && !loading && (
                <div className="text-xs text-text-2 leading-relaxed">{response}</div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="px-4 py-4 flex items-center justify-center gap-4 border-t border-white/8">
            {speaking && (
              <button onClick={stopSpeaking}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-amber-400"
                style={{ background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)' }}>
                <VolumeX size={14}/> Stop
              </button>
            )}

            {/* Main mic */}
            <div className="relative">
              <button onClick={listening ? stopListening : startListening} disabled={loading}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  background:listening?'linear-gradient(135deg,#EF4444,#F59E0B)':'linear-gradient(135deg,#7C3AED,#EC4899)',
                  boxShadow:listening?'0 0 0 6px rgba(239,68,68,0.2)':'0 0 0 4px rgba(124,58,237,0.2)',
                }}>
                {loading
                  ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
                  : listening ? <MicOff size={22} color="#fff"/> : <Mic size={22} color="#fff"/>
                }
              </button>
              {listening && <span className="absolute inset-0 rounded-full animate-ping" style={{ background:'rgba(239,68,68,0.2)' }}/>}
            </div>

            {response && !speaking && (
              <button onClick={() => speakText(response)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
                style={{ background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.3)',color:'#9D5FF5' }}>
                <Volume2 size={14}/> Replay
              </button>
            )}
          </div>

          {history.length === 0 && !transcript && (
            <div className="px-4 pb-4 text-center">
              <p className="text-[0.65rem] text-text-3">Try: "Explain photosynthesis" or "What is osmosis?"</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
